import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, extractFirstJsonObject } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { adminInsert, adminPatch } from '../_shared/supabase-admin.ts';

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: Array<{
    code: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
}

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

const localValidate = (payload: Record<string, unknown>): ValidationResult => {
  const issues: ValidationResult['issues'] = [];
  const unit = payload.unit as Record<string, unknown> | undefined;
  const items = payload.items as Array<Record<string, unknown>> | undefined;

  if (!unit?.title || typeof unit.title !== 'string') {
    issues.push({ code: 'missing_unit_title', severity: 'high', message: 'Unit title is required.' });
  }

  if (!Array.isArray(unit?.learningObjectives) || unit!.learningObjectives.length < 2) {
    issues.push({ code: 'weak_objectives', severity: 'medium', message: 'At least 2 learning objectives are required.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    issues.push({ code: 'empty_items', severity: 'high', message: 'At least one item is required.' });
  } else {
    items.forEach((item, index) => {
      if (!item.prompt || typeof item.prompt !== 'string' || item.prompt.length < 20) {
        issues.push({
          code: `weak_prompt_${index}`,
          severity: 'medium',
          message: `Item ${index + 1} prompt is too short or missing.`,
        });
      }
    });
  }

  const highCount = issues.filter((issue) => issue.severity === 'high').length;
  const confidence = clamp(0.9 - issues.length * 0.12 - highCount * 0.1);

  return {
    isValid: highCount === 0,
    confidence,
    issues,
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await requireAuthenticatedUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const jobId = typeof body.jobId === 'string' ? body.jobId : '';
    const content = (body.content || {}) as Record<string, unknown>;

    const local = localValidate(content);

    let result = local;
    try {
      const reviewPrompt = [
        'Validate if this generated English learning content is publishable.',
        'Return JSON:',
        '{ "isValid": boolean, "confidence": 0-1, "issues": [{"code":"...","severity":"low|medium|high","message":"..."}] }',
        `Content JSON:\n${JSON.stringify(content)}`,
      ].join('\n');

      const completion = await callDeepSeek({
        messages: [
          { role: 'system', content: 'You are a strict curriculum QA reviewer.' },
          { role: 'user', content: reviewPrompt },
        ],
        temperature: 0.2,
        maxTokens: 900,
      });

      const parsed = extractFirstJsonObject<ValidationResult>(completion);
      if (parsed && Array.isArray(parsed.issues)) {
        result = {
          isValid: Boolean(parsed.isValid) && local.isValid,
          confidence: clamp((Number(parsed.confidence || 0.5) + local.confidence) / 2),
          issues: [...local.issues, ...parsed.issues],
        };
      }
    } catch {
      // Keep local validator result.
    }

    if (jobId) {
      await adminInsert('content_validation_reports', {
        job_id: jobId,
        validator: 'ai-validate-content',
        is_valid: result.isValid,
        confidence: result.confidence,
        issues: result.issues,
        created_at: new Date().toISOString(),
      });

      await adminPatch(
        'content_generation_jobs',
        {
          status: result.isValid ? 'validated' : 'failed',
          validation_report_json: result,
          updated_at: new Date().toISOString(),
        },
        { eq: { id: jobId } },
      );

      if (!result.isValid) {
        await adminInsert('content_review_queue', {
          job_id: jobId,
          reason: 'validation_failed',
          status: 'pending',
          snapshot_json: {
            issues: result.issues,
            content,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    return jsonResponse({
      ...result,
      provider: 'edge',
    });
  } catch (error) {
    console.error('[ai-validate-content] error', error);
    return jsonResponse(
      {
        error: 'validate_content_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, extractFirstJsonObject } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { adminInsert, adminPatch } from '../_shared/supabase-admin.ts';

interface GeneratedUnit {
  track: {
    examType: 'IELTS' | 'TOEFL' | 'GENERAL';
    skill: 'writing' | 'speaking' | 'reading' | 'listening' | 'mixed';
    bandTarget: string;
    title: string;
  };
  unit: {
    title: string;
    cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    estimatedMinutes: number;
    learningObjectives: string[];
  };
  items: Array<{
    itemType: string;
    prompt: string;
    referenceAnswer: string;
  }>;
}

const isValidGeneratedUnit = (payload: unknown): payload is GeneratedUnit => {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as GeneratedUnit;
  return Boolean(
    candidate.track?.title &&
      candidate.unit?.title &&
      Array.isArray(candidate.unit.learningObjectives) &&
      Array.isArray(candidate.items) &&
      candidate.items.length > 0,
  );
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
    const body = await req.json().catch(() => ({}));
    const track = typeof body.track === 'string' ? body.track : 'daily_communication';
    const targetLevel = body.targetLevel || 'B1';
    const topic = typeof body.topic === 'string' ? body.topic : 'daily life';
    const itemCount = Number(body.itemCount) > 0 ? Math.min(6, Number(body.itemCount)) : 3;

    const jobRows = await adminInsert<{ id: string }>('content_generation_jobs', {
      track,
      status: 'running',
      request_json: {
        track,
        targetLevel,
        topic,
        itemCount,
      },
      created_by: auth.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const jobId = jobRows[0]?.id;

    const prompt = [
      'Generate high-quality English learning content for broad learners.',
      'Return ONLY JSON with shape:',
      '{ "track": {...}, "unit": {...}, "items": [{"itemType":"...","prompt":"...","referenceAnswer":"..."}] }',
      'Constraints:',
      `- Track: ${track}`,
      `- Target CEFR: ${targetLevel}`,
      `- Topic: ${topic}`,
      `- Items count: ${itemCount}`,
      '- Include bilingual-friendly wording and practical examples.',
    ].join('\n');

    const completion = await callDeepSeek({
      messages: [
        { role: 'system', content: 'You are an English curriculum designer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      maxTokens: 1800,
    });

    const parsed = extractFirstJsonObject<GeneratedUnit>(completion);
    const fallback: GeneratedUnit = {
      track: {
        examType: 'GENERAL',
        skill: 'mixed',
        bandTarget: 'General Fluency',
        title: 'General English Track',
      },
      unit: {
        title: `Micro Unit: ${topic}`,
        cefrLevel: targetLevel,
        estimatedMinutes: 18,
        learningObjectives: [
          'Use target expressions in real-world contexts.',
          'Improve grammar accuracy with concise feedback.',
          'Complete one retrieval quiz after explanation.',
        ],
      },
      items: Array.from({ length: itemCount }).map((_, index) => ({
        itemType: index % 2 === 0 ? 'conversation_drill' : 'short_quiz',
        prompt: `Create a practical sentence about ${topic} and explain why it is natural.`,
        referenceAnswer: 'A high-quality response should be natural, concise, and context-aware.',
      })),
    };

    const output = isValidGeneratedUnit(parsed) ? parsed : fallback;

    if (jobId) {
      await adminPatch('content_generation_jobs', {
        status: 'validated',
        output_json: output,
        updated_at: new Date().toISOString(),
      }, {
        eq: { id: jobId },
      });
    }

    return jsonResponse({
      jobId,
      ...output,
      provider: 'edge',
    });
  } catch (error) {
    console.error('[ai-generate-track-unit] error', error);
    return jsonResponse(
      {
        error: 'generate_track_unit_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

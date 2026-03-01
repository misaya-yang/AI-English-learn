import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, extractFirstJsonObject } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';

interface MicroLessonResponse {
  unit: {
    id: string;
    trackId: string;
    title: string;
    cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    estimatedMinutes: number;
    learningObjectives: string[];
    itemIds: string[];
    createdAt: string;
    source: string;
    license: string;
    attribution?: string;
  };
  items: Array<{
    id: string;
    unitId: string;
    examType: 'IELTS' | 'TOEFL';
    skill: 'writing' | 'speaking' | 'reading' | 'listening';
    itemType: 'writing_task_1' | 'writing_task_2' | 'speaking_part_2' | 'reading_summary';
    prompt: string;
    referenceAnswer: string;
    rubricId: string;
    source: string;
    license: string;
    attribution?: string;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await requireAuthenticatedUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json();
    const errorTags = Array.isArray(body.errorTags) ? body.errorTags : ['coherence'];
    const targetLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(body.targetLevel)
      ? body.targetLevel
      : 'B1';

    const prompt = [
      'Generate one 5-minute IELTS writing remediation lesson in strict JSON.',
      'Return ONLY JSON with shape:',
      '{ "unit": {...}, "items": [...] }',
      'Use learner error tags to customize objectives and one simulation practice item.',
      `errorTags=${JSON.stringify(errorTags)}, targetLevel=${targetLevel}`,
      'All content must include source/license/attribution fields.',
    ].join('\n');

    const completion = await callDeepSeek({
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.6,
      maxTokens: 1500,
    });

    const parsed = extractFirstJsonObject<MicroLessonResponse>(completion);
    if (!parsed?.unit?.id || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      const unitId = `unit_micro_${Date.now()}`;
      const itemId = `item_micro_${Date.now()}`;
      return jsonResponse({
        unit: {
          id: unitId,
          trackId: 'track_ielts_writing_foundation',
          title: `Micro Lesson: ${errorTags[0] || 'coherence'}`,
          cefrLevel: targetLevel,
          estimatedMinutes: 5,
          learningObjectives: [
            'Fix one high-impact writing weakness from your latest feedback.',
            'Apply a stronger claim-reason-example structure.',
          ],
          itemIds: [itemId],
          createdAt: new Date().toISOString(),
          source: 'Edge fallback micro lesson',
          license: 'Original generated content',
          attribution: 'Generated from learner error tags.',
        },
        items: [
          {
            id: itemId,
            unitId,
            examType: 'IELTS',
            skill: 'writing',
            itemType: 'writing_task_2',
            prompt: 'Many people believe cities should reduce private car use. To what extent do you agree or disagree?',
            referenceAnswer: 'Use a clear position and support each paragraph with one concrete example.',
            rubricId: 'rubric_ielts_writing',
            source: 'Edge fallback micro lesson',
            license: 'Original generated content',
            attribution: 'Simulation item. Not an official exam item.',
          },
        ],
      });
    }

    return jsonResponse(parsed);
  } catch (error) {
    console.error('[ai-generate-micro-lesson] error', error);
    return jsonResponse({
      error: 'ai_generate_micro_lesson_failed',
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

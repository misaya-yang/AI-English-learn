import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const examType = body.examType === 'TOEFL' ? 'TOEFL' : 'IELTS';
    const skill = body.skill || 'writing';
    const bandTarget = body.bandTarget || '6.0-6.5';

    return jsonResponse({
      examType,
      skill,
      bandTarget,
      units: [
        {
          id: 'unit_ielts_task2_argument_b1',
          trackId: 'track_ielts_writing_foundation',
          title: 'Task 2 Argument Paragraph Basics',
          cefrLevel: 'B1',
          estimatedMinutes: 18,
          learningObjectives: [
            'Build claim-reason-example paragraph structure',
            'Control cohesion and avoid repetitive linking',
          ],
          itemIds: ['item_task2_argument_city_001'],
          createdAt: '2026-03-01T00:00:00.000Z',
          source: 'Official public IELTS prep structure + AI generated practice',
          license: 'Original content with attribution metadata',
          attribution: 'Simulation-focused content.',
        },
      ],
    });
  } catch (error) {
    console.error('[content-units] error', error);
    return jsonResponse({
      error: 'content_units_failed',
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

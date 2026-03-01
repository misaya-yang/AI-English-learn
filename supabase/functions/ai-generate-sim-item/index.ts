import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, extractFirstJsonObject } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';

interface SimItem {
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
    const examType = body.examType === 'TOEFL' ? 'TOEFL' : 'IELTS';
    const rawSkill = String(body.skill || 'writing');
    const skill =
      rawSkill === 'writing' || rawSkill === 'speaking' || rawSkill === 'reading' || rawSkill === 'listening'
        ? rawSkill
        : 'writing';
    const bandTarget = String(body.bandTarget || '6.5');
    const topic = String(body.topic || 'education and technology');

    const prompt = [
      'Generate one exam-like simulation item in strict JSON.',
      'Return ONLY JSON with keys:',
      'id, unitId, examType, skill, itemType, prompt, referenceAnswer, rubricId, source, license, attribution',
      `ExamType=${examType}, Skill=${skill}, BandTarget=${bandTarget}, Topic=${topic}.`,
      'This must be a simulation item and include attribution text that it is not official.',
    ].join('\n');

    const completion = await callDeepSeek({
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
      maxTokens: 1200,
    });

    const parsed = extractFirstJsonObject<SimItem>(completion);
    if (!parsed?.prompt) {
      return jsonResponse({
        id: `sim_item_${Date.now()}`,
        unitId: 'sim_generated_unit',
        examType,
        skill,
        itemType: 'writing_task_2',
        prompt: `Some people think ${topic} should be the top priority for governments. To what extent do you agree or disagree?`,
        referenceAnswer: 'A strong answer provides a clear position, balanced argument development, and concrete examples.',
        rubricId: 'rubric_ielts_writing',
        source: 'Edge fallback simulation',
        license: 'Original generated content',
        attribution: 'Simulation item. Not an official exam item.',
      });
    }

    return jsonResponse({
      ...parsed,
      id: parsed.id || `sim_item_${Date.now()}`,
      unitId: parsed.unitId || 'sim_generated_unit',
      examType,
      skill,
      source: parsed.source || 'AI simulation based on official public prompt style',
      license: parsed.license || 'Original generated content',
      attribution: parsed.attribution || 'Simulation item. Not an official exam item.',
    });
  } catch (error) {
    console.error('[ai-generate-sim-item] error', error);
    return jsonResponse({
      error: 'ai_generate_sim_item_failed',
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, extractFirstJsonObject } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';

interface FeedbackPayload {
  attemptId: string;
  scores: {
    taskResponse: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRangeAccuracy: number;
    overallBand: number;
  };
  issues: Array<{
    tag: 'task_response' | 'coherence' | 'lexical' | 'grammar' | 'logic' | 'collocation' | 'tense';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
  }>;
  rewrites: string[];
  nextActions: string[];
  confidence: number;
  provider?: 'edge' | 'fallback';
  createdAt?: string;
}

const clampBand = (value: number): number => Math.min(9, Math.max(0, Math.round(value * 2) / 2));

const fallbackFeedback = (attemptId: string, answer: string): FeedbackPayload => {
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const score = clampBand(5 + Math.min(2, wordCount / 140));

  return {
    attemptId,
    scores: {
      taskResponse: score,
      coherenceCohesion: score,
      lexicalResource: score,
      grammaticalRangeAccuracy: score,
      overallBand: score,
    },
    issues: [
      {
        tag: 'coherence',
        severity: 'medium',
        message: 'Use a clearer paragraph progression with one main idea per paragraph.',
        suggestion: 'Follow a claim -> reason -> example structure in each body paragraph.',
      },
    ],
    rewrites: [
      'Rewrite your topic sentence with a clearer stance and one concrete reason.',
    ],
    nextActions: [
      'Add one supporting example in each body paragraph.',
      'Review article and tense consistency before submission.',
    ],
    confidence: 0.55,
    provider: 'fallback',
    createdAt: new Date().toISOString(),
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
    const body = await req.json();
    const attemptId = String(body.attemptId || `attempt_${Date.now()}`);
    const prompt = String(body.prompt || '');
    const answer = String(body.answer || '');
    const taskType = body.taskType === 'task1' ? 'task1' : 'task2';

    if (!prompt || !answer) {
      return jsonResponse({ error: 'invalid_payload', message: 'prompt and answer are required' }, 400);
    }

    const gradingPrompt = [
      'You are an IELTS Writing evaluator.',
      'Return ONLY valid JSON with this shape:',
      '{',
      '  "attemptId": "string",',
      '  "scores": {',
      '    "taskResponse": 0-9,',
      '    "coherenceCohesion": 0-9,',
      '    "lexicalResource": 0-9,',
      '    "grammaticalRangeAccuracy": 0-9,',
      '    "overallBand": 0-9',
      '  },',
      '  "issues": [',
      '    {"tag":"task_response|coherence|lexical|grammar|logic|collocation|tense", "severity":"low|medium|high", "message":"...", "suggestion":"..."}',
      '  ],',
      '  "rewrites": ["..."],',
      '  "nextActions": ["..."],',
      '  "confidence": 0-1',
      '}',
      `Use IELTS ${taskType.toUpperCase()} context. Keep rewrites and actions concise.`,
    ].join('\n');

    const completion = await callDeepSeek({
      messages: [
        { role: 'system', content: gradingPrompt },
        {
          role: 'user',
          content: `Prompt:\n${prompt}\n\nAnswer:\n${answer}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1600,
    });

    const parsed = extractFirstJsonObject<FeedbackPayload>(completion);
    if (!parsed?.scores || !Array.isArray(parsed.issues)) {
      return jsonResponse(fallbackFeedback(attemptId, answer));
    }

    const payload: FeedbackPayload = {
      ...parsed,
      attemptId,
      provider: 'edge',
      createdAt: new Date().toISOString(),
      scores: {
        taskResponse: clampBand(Number(parsed.scores.taskResponse)),
        coherenceCohesion: clampBand(Number(parsed.scores.coherenceCohesion)),
        lexicalResource: clampBand(Number(parsed.scores.lexicalResource)),
        grammaticalRangeAccuracy: clampBand(Number(parsed.scores.grammaticalRangeAccuracy)),
        overallBand: clampBand(Number(parsed.scores.overallBand)),
      },
    };

    return jsonResponse(payload);
  } catch (error) {
    console.error('[ai-grade-writing] error', error);
    return jsonResponse({
      error: 'ai_grade_failed',
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

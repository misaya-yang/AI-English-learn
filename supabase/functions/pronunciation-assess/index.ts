import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, extractFirstJsonObject } from '../_shared/deepseek.ts';

interface PhonemeIssue {
  phoneme: string;
  word: string;
  severity: 'minor' | 'moderate' | 'major';
  tip: string;
  tipZh: string;
}

interface PronunciationPayload {
  accuracy: number;
  fluency: number;
  intonation: number;
  phonemeIssues: PhonemeIssue[];
}

const clampScore = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
};

const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const computeAccuracy = (expected: string, recognized: string): number => {
  const expectedWords = normalizeText(expected).split(' ').filter(Boolean);
  const recognizedWords = normalizeText(recognized).split(' ').filter(Boolean);

  if (expectedWords.length === 0) return 0;

  const recognizedSet = new Set(recognizedWords);
  let matches = 0;

  for (const word of expectedWords) {
    if (!recognizedSet.has(word)) continue;
    matches += 1;
    recognizedSet.delete(word);
  }

  return clampScore((matches / expectedWords.length) * 100);
};

const computeFluency = (wordCount: number, durationMs: number): number => {
  if (wordCount <= 0 || durationMs <= 0) return 0;

  const durationMinutes = durationMs / 60_000;
  const wordsPerMinute = wordCount / durationMinutes;
  const idealWordsPerMinute = 145;
  const ratio = Math.min(wordsPerMinute, idealWordsPerMinute) / Math.max(wordsPerMinute, idealWordsPerMinute);

  return clampScore(ratio * 100);
};

const buildFallbackIssues = (expected: string, recognized: string): PhonemeIssue[] => {
  const expectedWords = normalizeText(expected).split(' ').filter(Boolean);
  const recognizedWords = normalizeText(recognized).split(' ').filter(Boolean);
  const issues: PhonemeIssue[] = [];

  expectedWords.forEach((word, index) => {
    const exactMatch = recognizedWords[index] === word || recognizedWords.includes(word);
    if (exactMatch || issues.length >= 3) return;

    issues.push({
      phoneme: 'focus',
      word,
      severity: index === 0 ? 'major' : 'moderate',
      tip: `Slow down on "${word}" and exaggerate the stressed syllable once before repeating it naturally.`,
      tipZh: `先把 "${word}" 放慢并夸张重读一遍，再恢复自然语速重复一次。`,
    });
  });

  return issues;
};

const sanitizeIssue = (value: unknown): PhonemeIssue | null => {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const severity =
    record.severity === 'minor' || record.severity === 'moderate' || record.severity === 'major'
      ? record.severity
      : 'moderate';

  if (typeof record.word !== 'string' || typeof record.tip !== 'string' || typeof record.tipZh !== 'string') {
    return null;
  }

  return {
    phoneme: typeof record.phoneme === 'string' && record.phoneme.trim().length > 0 ? record.phoneme : 'focus',
    word: record.word,
    severity,
    tip: record.tip,
    tipZh: record.tipZh,
  };
};

const buildFallbackPayload = (args: {
  expected: string;
  recognized: string;
  confidence: number;
  durationMs: number;
}): PronunciationPayload => {
  const wordCount = normalizeText(args.expected).split(' ').filter(Boolean).length;

  return {
    accuracy: computeAccuracy(args.expected, args.recognized),
    fluency: computeFluency(wordCount, args.durationMs),
    intonation: clampScore(args.confidence * 100),
    phonemeIssues: buildFallbackIssues(args.expected, args.recognized),
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
    const expected = String(body.expected || '');
    const recognized = String(body.recognized || '');
    const confidence = Number(body.confidence || 0);
    const durationMs = Number(body.durationMs || 0);

    if (!expected || !recognized) {
      return jsonResponse({ error: 'invalid_payload', message: 'expected and recognized are required' }, 400);
    }

    const fallback = buildFallbackPayload({
      expected,
      recognized,
      confidence,
      durationMs,
    });

    try {
      const completion = await callDeepSeek({
        temperature: 0.2,
        maxTokens: 1000,
        messages: [
          {
            role: 'system',
            content: [
              'You are an English pronunciation coach for Chinese-speaking learners.',
              'Return ONLY valid JSON with this shape:',
              '{',
              '  "accuracy": 0-100,',
              '  "fluency": 0-100,',
              '  "intonation": 0-100,',
              '  "phonemeIssues": [',
              '    {',
              '      "phoneme": "IPA or focus label",',
              '      "word": "problem word",',
              '      "severity": "minor|moderate|major",',
              '      "tip": "short correction tip in English",',
              '      "tipZh": "short correction tip in Chinese"',
              '    }',
              '  ]',
              '}',
              'Use up to 3 phonemeIssues. Keep the advice concrete and concise.',
            ].join('\n'),
          },
          {
            role: 'user',
            content: [
              `Target text: ${expected}`,
              `Recognized speech: ${recognized}`,
              `Speech confidence: ${confidence}`,
              `DurationMs: ${durationMs}`,
            ].join('\n'),
          },
        ],
      });

      const parsed = extractFirstJsonObject<PronunciationPayload>(completion);
      if (!parsed) {
        return jsonResponse(fallback);
      }

      const phonemeIssues = Array.isArray(parsed.phonemeIssues)
        ? parsed.phonemeIssues.map(sanitizeIssue).filter((issue): issue is PhonemeIssue => issue !== null).slice(0, 3)
        : fallback.phonemeIssues;

      return jsonResponse({
        accuracy: clampScore(parsed.accuracy ?? fallback.accuracy),
        fluency: clampScore(parsed.fluency ?? fallback.fluency),
        intonation: clampScore(parsed.intonation ?? fallback.intonation),
        phonemeIssues,
      });
    } catch {
      return jsonResponse(fallback);
    }
  } catch (error) {
    console.error('[pronunciation-assess] error', error);
    return jsonResponse(
      {
        error: 'pronunciation_assess_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

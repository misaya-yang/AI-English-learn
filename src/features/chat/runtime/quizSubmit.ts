import type { ChatArtifact } from '@/types/chatAgent';
import type { AiFeedback, FeedbackIssue } from '@/types/examContent';
import type { WordData } from '@/data/words';

type QuizArtifact = Extract<ChatArtifact, { type: 'quiz' }>;

/**
 * Best-effort word extraction used both when building remediation review cards
 * and when tracking which target words a quiz run has already covered.
 *
 * The function is intentionally permissive — falling back to the literal string
 * `'focus'` mirrors the legacy inline implementation in `ChatPage.tsx`.
 */
export const extractWordCandidate = (artifact: QuizArtifact): string => {
  if (artifact.payload.targetWord) {
    return artifact.payload.targetWord.trim().toLowerCase();
  }

  const first = artifact.payload.stem.match(/["“'`](\w[\w-]*)["”'`]/);
  if (first?.[1]) return first[1].toLowerCase();

  const fallback = artifact.payload.stem.match(/\\b[a-zA-Z][a-zA-Z-]{2,}\\b/);
  return fallback?.[0]?.toLowerCase() || 'focus';
};

const TAG_VALUES: ReadonlyArray<FeedbackIssue['tag']> = [
  'task_response',
  'coherence',
  'grammar',
  'logic',
  'collocation',
  'tense',
];

const isFeedbackTag = (value: string): value is FeedbackIssue['tag'] =>
  (TAG_VALUES as readonly string[]).includes(value);

/**
 * Lossless variant of the `normalizeTag` closure that lived inside
 * `handleQuizSubmit` / `generateLessonFromQuiz`. Anything outside the small
 * whitelist becomes `lexical`, matching the previous fallback.
 */
export const normalizeFeedbackTag = (value: string): FeedbackIssue['tag'] =>
  isFeedbackTag(value) ? value : 'lexical';

/**
 * Pick the best feedback tag for a quiz mistake. Prefers the explicit `tags`
 * payload supplied by the AI, then falls back to skill heuristics, finally
 * collapsing to `lexical`.
 */
export const inferQuizFeedbackTag = (artifact: QuizArtifact): FeedbackIssue['tag'] => {
  if (artifact.payload.tags && artifact.payload.tags.length > 0) {
    return normalizeFeedbackTag(artifact.payload.tags[0]);
  }
  if (artifact.payload.skills.some((skill) => skill.includes('grammar'))) {
    return 'grammar';
  }
  return 'lexical';
};

/**
 * Same as `inferQuizFeedbackTag` but with the wider fallback ladder used by
 * the lesson generator (it also recognises coherence skills).
 */
export const inferLessonTags = (artifact: QuizArtifact): FeedbackIssue['tag'][] => {
  const tags = (artifact.payload.tags || [])
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => normalizeFeedbackTag(item));
  if (tags.length > 0) return tags;

  const fallbackTag: FeedbackIssue['tag'] = artifact.payload.skills.some((skill) =>
    skill.includes('grammar'),
  )
    ? 'grammar'
    : artifact.payload.skills.some((skill) => skill.includes('coherence'))
      ? 'coherence'
      : 'lexical';
  return [fallbackTag];
};

/**
 * Build the `AiFeedback` record persisted whenever a learner answers a chat
 * quiz incorrectly. Pure function with explicit `now` injection so tests can
 * snapshot the resulting payload deterministically.
 */
export const buildQuizMistakeFeedback = (args: {
  quizId: string;
  artifact: QuizArtifact;
  language: string;
  now?: number;
}): AiFeedback => {
  const inferredTag = inferQuizFeedbackTag(args.artifact);
  const isZh = args.language.startsWith('zh');
  const now = args.now ?? Date.now();

  return {
    attemptId: `chat_quiz_${args.quizId}_${now}`,
    scores: {
      taskResponse: 5.5,
      coherenceCohesion: 5.5,
      lexicalResource: inferredTag === 'lexical' || inferredTag === 'collocation' ? 5 : 6,
      grammaticalRangeAccuracy: inferredTag === 'grammar' || inferredTag === 'tense' ? 5 : 6,
      overallBand: 5.5,
    },
    issues: [
      {
        tag: inferredTag,
        severity: 'medium',
        message: isZh ? '来自对话测验的错误回流。' : 'Captured from chat quiz attempt.',
        suggestion: isZh
          ? '建议完成对应补救微课并加入复习。'
          : 'Take the remediation micro-lesson and review this card again.',
      },
    ],
    rewrites: [args.artifact.payload.explanation],
    nextActions: [
      isZh ? '完成 1 次补救练习' : 'Complete 1 remediation drill',
      isZh ? '24 小时后再次测验' : 'Retry in 24 hours',
    ],
    confidence: 0.7,
    provider: 'fallback',
    createdAt: new Date(now).toISOString(),
  };
};

/**
 * Build a custom-word entry from a chat quiz artifact so the remediation flow
 * can drop the missed item into the user's review deck.
 */
export const buildReviewCardFromQuiz = (args: {
  artifact: QuizArtifact;
  language: string;
  now?: number;
}): WordData => {
  const word = extractWordCandidate(args.artifact);
  const isZh = args.language.startsWith('zh');
  const now = args.now ?? Date.now();

  return {
    id: `quiz_word_${now}_${Math.random().toString(36).slice(2, 6)}`,
    word,
    phonetic: '',
    partOfSpeech: 'phrase',
    definition: args.artifact.payload.explanation || args.artifact.payload.stem,
    definitionZh: isZh ? '来自 AI 测验回流' : 'Imported from AI quiz',
    examples: [
      {
        en: args.artifact.payload.stem,
        zh: isZh ? '来自测验题干' : 'From quiz stem',
      },
    ],
    synonyms: [],
    antonyms: [],
    collocations: [],
    level: 'B1',
    topic: 'quiz',
  };
};

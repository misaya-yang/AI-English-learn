// COACHING_POLICY — shared teaching contract for VocabDaily's AI English coach.
//
// This module is the single source of truth for how the coach should behave.
// It is imported by both the client request builder (Vite/Node) and the
// Deno Edge Function (`supabase/functions/ai-chat`). For that reason it has
// NO imports and uses only portable TypeScript. A byte-identical copy lives
// at `supabase/functions/_shared/coaching-policy.ts`; a test enforces the
// two copies stay in sync.
//
// The three pillars:
//   1. Socratic teaching: prefer probing questions over direct answers.
//   2. Typed error correction: every correction names its error type so the
//      learner-model + memory can act on it.
//   3. Structured coaching_actions: every reply produces a machine-consumable
//      action list so downstream systems (review queue, memory, telemetry)
//      can turn chat into scheduled practice.

export const COACHING_POLICY_VERSION = '1.0.0';

export type CoachingErrorType =
  | 'grammar'
  | 'vocab'
  | 'pragmatic'
  | 'logic'
  | 'pronunciation'
  | 'listening';

const ERROR_TYPE_VALUES: readonly CoachingErrorType[] = [
  'grammar',
  'vocab',
  'pragmatic',
  'logic',
  'pronunciation',
  'listening',
];

export type CoachingActionType =
  | 'ask_socratic_question'
  | 'retry_with_hint'
  | 'micro_task'
  | 'schedule_review'
  | 'celebrate_effort'
  | 'reflection_prompt';

const ACTION_TYPE_VALUES: readonly CoachingActionType[] = [
  'ask_socratic_question',
  'retry_with_hint',
  'micro_task',
  'schedule_review',
  'celebrate_effort',
  'reflection_prompt',
];

export type LearnerMode = 'recovery' | 'maintenance' | 'steady' | 'stretch' | 'sprint';
const LEARNER_MODE_VALUES: readonly LearnerMode[] = [
  'recovery',
  'maintenance',
  'steady',
  'stretch',
  'sprint',
];

export type BurnoutRisk = 'low' | 'medium' | 'high';
const BURNOUT_RISK_VALUES: readonly BurnoutRisk[] = ['low', 'medium', 'high'];

export type CoachSurface = 'chat' | 'today' | 'exam' | 'practice';
export type CoachMode = 'chat' | 'study' | 'quiz' | 'canvas';

export interface CoachRecentError {
  word?: string;
  skill?: CoachingErrorType;
  errorType?: CoachingErrorType;
  note?: string;
}

export interface LearnerContext {
  level?: string;
  target?: string;
  examType?: string;
  dailyMinutes?: number;
  dueCount?: number;
  learnerMode?: LearnerMode;
  burnoutRisk?: BurnoutRisk;
  weaknessTags?: string[];
  stubbornTopics?: string[];
  recommendedDailyReview?: number;
  predictedRetention30d?: number;
  recentErrors?: CoachRecentError[];
}

export interface CoachingAction {
  type: CoachingActionType;
  prompt: string;
  targetSkill?: CoachingErrorType;
  targetWord?: string;
  estimatedSeconds?: number;
  reviewAfterHours?: number;
  errorTypeIfRelevant?: CoachingErrorType;
}

export interface ReviewQueueItem {
  id: string;
  userInputRef?: string;
  skill: CoachingErrorType;
  targetWord?: string;
  prompt: string;
  dueAt: string;
  sourceAction: CoachingActionType;
}

// ── Normalisation ───────────────────────────────────────────────────────────

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const trimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const safeNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return value;
};

const normalizeStringArray = (value: unknown, max: number): string[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim();
    if (trimmed.length === 0) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
    if (out.length >= max) break;
  }
  return out;
};

const normalizeRecentErrors = (value: unknown): CoachRecentError[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const out: CoachRecentError[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const skill = ERROR_TYPE_VALUES.includes(raw.skill as CoachingErrorType)
      ? (raw.skill as CoachingErrorType)
      : undefined;
    const errorType = ERROR_TYPE_VALUES.includes(raw.errorType as CoachingErrorType)
      ? (raw.errorType as CoachingErrorType)
      : undefined;
    const word = trimmedString(raw.word);
    const note = trimmedString(raw.note);
    // Require `word` so the coach can reference something concrete. An error
    // entry without a word is not actionable in a Socratic retry and would
    // just bloat the system prompt.
    if (!word) continue;
    out.push({ word, skill, errorType, note });
    if (out.length >= 6) break;
  }
  return out.length > 0 ? out : undefined;
};

export function normalizeLearningContext(raw: unknown): LearnerContext {
  if (!isRecord(raw)) return {};

  const merged = normalizeStringArray(
    [
      ...(Array.isArray(raw.weaknessTags) ? (raw.weaknessTags as unknown[]) : []),
      ...(Array.isArray(raw.weakTags) ? (raw.weakTags as unknown[]) : []),
    ],
    8,
  );

  const learnerMode = LEARNER_MODE_VALUES.includes(raw.learnerMode as LearnerMode)
    ? (raw.learnerMode as LearnerMode)
    : undefined;
  const burnoutRisk = BURNOUT_RISK_VALUES.includes(raw.burnoutRisk as BurnoutRisk)
    ? (raw.burnoutRisk as BurnoutRisk)
    : undefined;

  const predictedRetention = safeNumber(raw.predictedRetention30d);

  const out: LearnerContext = {
    level: trimmedString(raw.level),
    target: trimmedString(raw.target),
    examType: trimmedString(raw.examType),
    dailyMinutes: safeNumber(raw.dailyMinutes),
    dueCount: safeNumber(raw.dueCount),
    learnerMode,
    burnoutRisk,
    stubbornTopics: Array.isArray(raw.stubbornTopics)
      ? normalizeStringArray(raw.stubbornTopics, 8)
      : undefined,
    recommendedDailyReview: safeNumber(raw.recommendedDailyReview),
    predictedRetention30d:
      predictedRetention !== undefined
        ? Math.max(0, Math.min(1, predictedRetention))
        : undefined,
    recentErrors: normalizeRecentErrors(raw.recentErrors),
  };

  if (merged.length > 0) {
    out.weaknessTags = merged;
  }

  // Clean undefineds for deterministic equality in tests.
  for (const key of Object.keys(out) as Array<keyof LearnerContext>) {
    if (out[key] === undefined) {
      delete out[key];
    }
  }
  return out;
}

// ── System prompt construction ─────────────────────────────────────────────

const BASE_POLICY = `You are VocabDaily's AI English learning coach (policy v${COACHING_POLICY_VERSION}).
You teach Chinese-speaking learners. Be warm, precise, and concrete — never generic.

HARD RULES
1. Do not simply hand over answers. Ask before you tell. Prefer a probing
   question or a hint that lets the learner attempt again. Direct answers are
   allowed only after the learner has tried, or when they explicitly request
   "just tell me".
2. Every correction must tag an error type. Allowed error types:
   grammar, vocab, pragmatic, logic, pronunciation, listening.
   Say which one, briefly, in words the learner understands.
3. Positive feedback must be specific and tied to what the learner just did.
   Do not use empty praise ("good job", "nice!"). Point at the concrete move
   that was effective or the mistake pattern that improved.
4. Each reply ends with a clear next step: invite the learner to retry, give
   a 30 second to 3 minute micro task, or schedule a review.
5. Respect learner load. If due backlog or burnout risk is high, enter
   recovery mode: lighten the task, skip introducing new words, do not push.

TEACHING RHYTHM (use as a mental default, skip steps only if the turn is short)
  a. notice: echo back the intent or the slice that mattered.
  b. diagnose: if there was an error, name its type and one likely cause.
  c. socratic nudge: one question or hint that invites retry.
  d. micro practice: a tiny challenge (under 3 min) that targets the gap.
  e. reflection: a short prompt the learner can answer ("what made that
     clearer?"). Used sparingly.

RESPONSE CONTRACT
You reply with natural-language coaching PLUS a structured block of
coaching_actions the client will persist as review/practice items.
The coaching_actions array MUST follow this shape:

[
  {
    "type": "ask_socratic_question" | "retry_with_hint" | "micro_task"
          | "schedule_review" | "celebrate_effort" | "reflection_prompt",
    "prompt": string,            // what the learner should see/do
    "targetSkill": "grammar" | "vocab" | "pragmatic" | "logic"
                  | "pronunciation" | "listening",   // optional
    "targetWord": string,        // optional, when the action is about a word
    "estimatedSeconds": number,  // optional, for micro_task
    "reviewAfterHours": number,  // optional, for schedule_review / retry_with_hint
    "errorTypeIfRelevant": "grammar" | "vocab" | "pragmatic" | "logic"
                         | "pronunciation" | "listening"
  }
]

Rules for actions:
- At most 4 actions. Fewer is better. Zero is allowed for pure greetings.
- An action's prompt must be concrete and directly usable — no "think about
  your goals". Instead: "Rewrite 'I have went' using the correct past form."
- When the learner made a concrete error, produce at least one retry_with_hint
  OR schedule_review targeting the same skill/word. Do not let errors die
  unreviewed.
- schedule_review should carry reviewAfterHours. Default to 24 for vocab,
  48-72 for grammar patterns the learner keeps missing.

STYLE
- Bilingual only when it helps (zh key points once per reply at most).
- Markdown is fine but keep it light; no multi-section headers for short turns.
- Never fabricate exam scores, statistics, or sources.
`;

const addParagraph = (parts: string[], content: string) => {
  const trimmed = content.trim();
  if (trimmed.length > 0) parts.push(trimmed);
};

export function buildCoachSystemPrompt(
  ctx: LearnerContext,
  opts?: {
    surface?: CoachSurface;
    mode?: CoachMode;
    goalContext?: string;
  },
): string {
  const parts: string[] = [BASE_POLICY];

  const surface: CoachSurface = opts?.surface || 'chat';
  const mode: CoachMode = opts?.mode || 'chat';
  const contextLines: string[] = [`Current product surface: ${surface}. Chat mode: ${mode}.`];

  if (ctx.level) contextLines.push(`Learner level (CEFR or self-reported): ${ctx.level}.`);
  if (ctx.target) contextLines.push(`Learner target: ${ctx.target}.`);
  if (ctx.examType) contextLines.push(`Exam focus: ${ctx.examType}.`);
  if (ctx.dailyMinutes !== undefined) {
    contextLines.push(`Daily study budget (minutes): ${ctx.dailyMinutes}.`);
  }
  if (ctx.dueCount !== undefined) {
    contextLines.push(`Currently ${ctx.dueCount} items are due for review.`);
  }
  if (ctx.recommendedDailyReview !== undefined) {
    contextLines.push(`Recommended daily review items: ${ctx.recommendedDailyReview}.`);
  }
  if (ctx.predictedRetention30d !== undefined) {
    contextLines.push(
      `Predicted 30-day retention: ${(ctx.predictedRetention30d * 100).toFixed(0)}%.`,
    );
  }
  if (ctx.learnerMode) {
    contextLines.push(`Learner mode: ${ctx.learnerMode}.`);
  }
  if (ctx.burnoutRisk) {
    contextLines.push(`Burnout risk: ${ctx.burnoutRisk}.`);
  }
  if (ctx.weaknessTags && ctx.weaknessTags.length > 0) {
    contextLines.push(`Known weakness tags: ${ctx.weaknessTags.join(', ')}.`);
  }
  if (ctx.stubbornTopics && ctx.stubbornTopics.length > 0) {
    contextLines.push(`Stubborn topics that keep tripping the learner: ${ctx.stubbornTopics.join(', ')}.`);
  }

  if (opts?.goalContext) {
    contextLines.push(`Recent goal context from the product: ${opts.goalContext}`);
  }

  addParagraph(parts, `LEARNER MODEL\n${contextLines.join(' ')}`);

  if (ctx.recentErrors && ctx.recentErrors.length > 0) {
    const rendered = ctx.recentErrors
      .map((err) => {
        const bits: string[] = [];
        if (err.word) bits.push(`word="${err.word}"`);
        if (err.skill) bits.push(`skill=${err.skill}`);
        if (err.errorType) bits.push(`errorType=${err.errorType}`);
        if (err.note) bits.push(`note=${err.note}`);
        return `- ${bits.join(', ')}`;
      })
      .join('\n');
    addParagraph(
      parts,
      `RECENT ERRORS TO REVISIT\n${rendered}\nInvite the learner to retry or follow up on the most relevant one — do not let these errors die without a scheduled review.`,
    );
  }

  if (ctx.burnoutRisk === 'high' || ctx.learnerMode === 'recovery') {
    addParagraph(
      parts,
      `RECOVERY MODE\nDo not add new words or new grammar rules. Lighten the task. Focus on reviewing due items only, and limit the reply to one micro_task or one schedule_review.`,
    );
  } else if (ctx.dueCount !== undefined && ctx.dueCount >= 50) {
    addParagraph(
      parts,
      `HEAVY BACKLOG\nDue backlog is heavy. Prefer clearing a small slice of reviews over adding new material.`,
    );
  }

  if (surface === 'exam') {
    addParagraph(
      parts,
      `EXAM SURFACE\nOrient tasks toward the learner's exam format (${ctx.examType || 'general exam'}). When possible, phrase micro_tasks in the exam's question style.`,
    );
  } else if (surface === 'today') {
    addParagraph(
      parts,
      `TODAY SURFACE\nThe learner just opened the daily plan. Prefer actions that map to today's queue: a quick retry on a recent error, or a schedule_review for a word they missed.`,
    );
  } else if (surface === 'practice') {
    addParagraph(
      parts,
      `PRACTICE SURFACE\nThe learner is already practicing. Keep the turn short. One diagnosis + one retry is usually enough.`,
    );
  }

  return parts.join('\n\n');
}

// ── Response parsing ───────────────────────────────────────────────────────

const normalizeAction = (raw: unknown): CoachingAction | null => {
  if (!isRecord(raw)) return null;
  const type = raw.type;
  if (typeof type !== 'string' || !ACTION_TYPE_VALUES.includes(type as CoachingActionType)) {
    return null;
  }
  const prompt = trimmedString(raw.prompt);
  if (!prompt) return null;

  const action: CoachingAction = {
    type: type as CoachingActionType,
    prompt,
  };

  const targetSkill = raw.targetSkill;
  if (typeof targetSkill === 'string' && ERROR_TYPE_VALUES.includes(targetSkill as CoachingErrorType)) {
    action.targetSkill = targetSkill as CoachingErrorType;
  }
  const errorTypeIfRelevant = raw.errorTypeIfRelevant;
  if (
    typeof errorTypeIfRelevant === 'string' &&
    ERROR_TYPE_VALUES.includes(errorTypeIfRelevant as CoachingErrorType)
  ) {
    action.errorTypeIfRelevant = errorTypeIfRelevant as CoachingErrorType;
  }
  const targetWord = trimmedString(raw.targetWord);
  if (targetWord) action.targetWord = targetWord;
  const estimatedSeconds = safeNumber(raw.estimatedSeconds);
  if (estimatedSeconds !== undefined) action.estimatedSeconds = estimatedSeconds;
  const reviewAfterHours = safeNumber(raw.reviewAfterHours);
  if (reviewAfterHours !== undefined) action.reviewAfterHours = reviewAfterHours;

  return action;
};

const MAX_ACTIONS = 6;

export function parseCoachingActions(envelope: unknown): CoachingAction[] {
  if (!isRecord(envelope)) return [];

  const candidates: unknown[] = [];
  if (Array.isArray(envelope.coaching_actions)) {
    candidates.push(...(envelope.coaching_actions as unknown[]));
  }
  if (Array.isArray(envelope.artifacts)) {
    for (const artifact of envelope.artifacts as unknown[]) {
      if (!isRecord(artifact)) continue;
      if (artifact.type !== 'coaching_actions') continue;
      const payload = isRecord(artifact.payload) ? artifact.payload : undefined;
      const actions = payload && Array.isArray(payload.actions) ? (payload.actions as unknown[]) : [];
      candidates.push(...actions);
    }
  }

  const normalized: CoachingAction[] = [];
  for (const raw of candidates) {
    const action = normalizeAction(raw);
    if (action) normalized.push(action);
    if (normalized.length >= MAX_ACTIONS) break;
  }
  return normalized;
}

// ── Review queue handoff ───────────────────────────────────────────────────

// FNV-1a 32-bit — deterministic, no crypto dependency, fine for id bucketing.
const fnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

const DEFAULT_RETRY_HINT_HOURS = 1;
const DEFAULT_SCHEDULE_HOURS = 24;

export function toReviewQueueItems(
  actions: CoachingAction[],
  opts: { userInputRef?: string; now?: Date } = {},
): ReviewQueueItem[] {
  const now = opts.now ?? new Date();
  const out: ReviewQueueItem[] = [];

  for (const action of actions) {
    let hours: number | undefined;
    if (action.type === 'schedule_review') {
      hours = action.reviewAfterHours ?? DEFAULT_SCHEDULE_HOURS;
    } else if (action.type === 'retry_with_hint') {
      hours = action.reviewAfterHours ?? DEFAULT_RETRY_HINT_HOURS;
    }
    if (hours === undefined) continue;

    const skill = action.targetSkill || action.errorTypeIfRelevant;
    if (!skill) continue;

    const dueAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
    const idBasis = [
      opts.userInputRef ?? '',
      action.type,
      skill,
      action.targetWord ?? '',
      action.prompt,
    ].join('|');

    out.push({
      id: `rq_${fnv1a(idBasis)}`,
      userInputRef: opts.userInputRef,
      skill,
      targetWord: action.targetWord,
      prompt: action.prompt,
      dueAt,
      sourceAction: action.type,
    });
  }
  return out;
}

import type { EvidenceEvent } from './evidenceEvents';
import type { LearningEventRecord } from './learningEvents';

export type SkillAttemptScope = 'personal' | 'org';

export type SkillAttemptSurface =
  | 'today'
  | 'review'
  | 'practice'
  | 'coach'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'pronunciation'
  | 'grammar'
  | 'exam'
  | 'vocabulary';

export type SkillAttemptSkill =
  | 'vocabulary'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'grammar'
  | 'exam_strategy';

export type SkillAttemptSource =
  | 'user_action'
  | 'assignment'
  | 'coach'
  | 'import'
  | 'system_generated';

export interface SkillAttempt {
  id: string;
  userId: string;
  orgId?: string;
  cohortId?: string;
  assignmentId?: string;
  scope: SkillAttemptScope;
  surface: SkillAttemptSurface;
  skill: SkillAttemptSkill;
  subskill?: string;
  contentRefType: string;
  contentRefId: string;
  promptRef?: string;
  responseRef?: string;
  score: number | null;
  maxScore: number | null;
  accuracy: number | null;
  durationMs: number;
  rubric: Record<string, unknown>;
  mistakeTags: string[];
  source: SkillAttemptSource;
  aiProvider?: string;
  aiModel?: string;
  fallbackUsed: boolean;
  createdAt: string;
}

export interface SkillMistake {
  id: string;
  attemptId: string;
  userId: string;
  orgId?: string;
  skill: SkillAttemptSkill;
  subskill?: string;
  tag: string;
  severity: 'low' | 'medium' | 'high';
  evidenceExcerpt?: string;
  contentRefType: string;
  contentRefId: string;
  createdAt: string;
}

export type LearningRemediationStatus = 'open' | 'scheduled' | 'completed' | 'dismissed';
export type LearningRemediationTargetSurface =
  | 'today'
  | 'review'
  | 'practice'
  | 'coach'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'pronunciation';

export interface LearningRemediation {
  id: string;
  userId: string;
  orgId?: string;
  cohortId?: string;
  assignmentId?: string;
  mistakeId?: string;
  status: LearningRemediationStatus;
  targetSurface: LearningRemediationTargetSurface;
  skill: SkillAttemptSkill;
  subskill?: string;
  contentRefType: string;
  contentRefId: string;
  recommendation: string;
  dueAt: string;
  completedAt?: string;
  createdBy: 'system' | 'coach' | 'teacher';
  createdAt: string;
}

export interface SkillAttemptInput {
  id?: string;
  userId: string;
  orgId?: string;
  cohortId?: string;
  assignmentId?: string;
  scope?: SkillAttemptScope;
  surface: SkillAttemptSurface;
  skill: SkillAttemptSkill;
  subskill?: string;
  contentRefType: string;
  contentRefId: string;
  promptRef?: string;
  responseRef?: string;
  score?: number | null;
  maxScore?: number | null;
  accuracy?: number | null;
  durationMs?: number;
  rubric?: Record<string, unknown>;
  mistakeTags?: string[];
  source?: SkillAttemptSource;
  aiProvider?: string;
  aiModel?: string;
  fallbackUsed?: boolean;
  createdAt?: string;
}

export interface SkillAttemptContext {
  orgId?: string;
  cohortId?: string;
  assignmentId?: string;
  source?: SkillAttemptSource;
  durationMs?: number;
  promptRef?: string;
  responseRef?: string;
  aiProvider?: string;
  aiModel?: string;
  fallbackUsed?: boolean;
  rubric?: Record<string, unknown>;
}

export interface RemediationBuildOptions {
  dueAt?: string;
  createdAt?: string;
  mistakeId?: string;
  createdBy?: LearningRemediation['createdBy'];
}

const nowIso = (): string => new Date().toISOString();

const createId = (prefix: string): string => {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
};

const requireText = (value: string | undefined, field: string): string => {
  if (!value || !value.trim()) {
    throw new TypeError(`createSkillAttempt requires ${field}`);
  }
  return value;
};

const toAccuracy = (score: number | null, maxScore: number | null): number | null => {
  if (typeof score !== 'number' || typeof maxScore !== 'number' || maxScore <= 0) return null;
  return score / maxScore;
};

const normalizeTagValue = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown';

export function createSkillAttempt(input: SkillAttemptInput): SkillAttempt {
  const score = input.score ?? null;
  const maxScore = input.maxScore ?? null;

  return {
    id: input.id || createId('attempt'),
    userId: requireText(input.userId, 'userId'),
    orgId: input.orgId,
    cohortId: input.cohortId,
    assignmentId: input.assignmentId,
    scope: input.scope || (input.orgId ? 'org' : 'personal'),
    surface: input.surface,
    skill: input.skill,
    subskill: input.subskill,
    contentRefType: requireText(input.contentRefType, 'contentRefType'),
    contentRefId: requireText(input.contentRefId, 'contentRefId'),
    promptRef: input.promptRef,
    responseRef: input.responseRef,
    score,
    maxScore,
    accuracy: input.accuracy ?? toAccuracy(score, maxScore),
    durationMs: Math.max(0, input.durationMs ?? 0),
    rubric: input.rubric || {},
    mistakeTags: input.mistakeTags || [],
    source: input.source || 'user_action',
    aiProvider: input.aiProvider,
    aiModel: input.aiModel,
    fallbackUsed: input.fallbackUsed ?? false,
    createdAt: input.createdAt || nowIso(),
  };
}

const contextFields = (options: SkillAttemptContext = {}) => ({
  orgId: options.orgId,
  cohortId: options.cohortId,
  assignmentId: options.assignmentId,
  source: options.source,
  durationMs: options.durationMs,
  promptRef: options.promptRef,
  responseRef: options.responseRef,
  aiProvider: options.aiProvider,
  aiModel: options.aiModel,
  fallbackUsed: options.fallbackUsed,
  rubric: options.rubric,
});

export function evidenceEventToSkillAttempt(
  event: EvidenceEvent,
  options: SkillAttemptContext = {},
): SkillAttempt {
  const base = {
    userId: event.userId,
    createdAt: event.createdAt,
    ...contextFields(options),
  };

  switch (event.type) {
    case 'vocab.learned':
      return createSkillAttempt({
        ...base,
        surface: 'today',
        skill: 'vocabulary',
        subskill: 'word_meaning',
        contentRefType: 'word',
        contentRefId: event.wordId,
        score: 1,
        maxScore: 1,
      });
    case 'vocab.hard':
      return createSkillAttempt({
        ...base,
        surface: 'today',
        skill: 'vocabulary',
        subskill: 'word_meaning',
        contentRefType: 'word',
        contentRefId: event.wordId,
        score: 0,
        maxScore: 1,
        mistakeTags: ['vocab_hard'],
      });
    case 'vocab.bookmarked':
      return createSkillAttempt({
        ...base,
        surface: 'vocabulary',
        skill: 'vocabulary',
        subskill: 'word_interest',
        contentRefType: 'word',
        contentRefId: event.wordId,
      });
    case 'practice.correct':
      return createSkillAttempt({
        ...base,
        surface: 'practice',
        skill: 'vocabulary',
        subskill: 'word_meaning',
        contentRefType: 'word',
        contentRefId: event.wordId,
        score: 1,
        maxScore: 1,
        mistakeTags: [`mode_${normalizeTagValue(event.mode)}`],
      });
    case 'practice.recovered':
      return createSkillAttempt({
        ...base,
        surface: 'practice',
        skill: 'vocabulary',
        subskill: 'word_meaning',
        contentRefType: 'word',
        contentRefId: event.wordId,
        score: 0.5,
        maxScore: 1,
        mistakeTags: ['practice_recovered', `mode_${normalizeTagValue(event.mode)}`],
      });
    case 'practice.incorrect':
      return createSkillAttempt({
        ...base,
        surface: 'practice',
        skill: 'vocabulary',
        subskill: 'word_meaning',
        contentRefType: 'word',
        contentRefId: event.wordId,
        score: 0,
        maxScore: 1,
        mistakeTags: ['practice_incorrect', `mode_${normalizeTagValue(event.mode)}`],
      });
    case 'review.rated': {
      const success = event.rating === 'good' || event.rating === 'easy';
      return createSkillAttempt({
        ...base,
        surface: 'review',
        skill: 'vocabulary',
        subskill: 'word_recall',
        contentRefType: 'word',
        contentRefId: event.wordId,
        score: success ? 1 : 0,
        maxScore: 1,
        mistakeTags: success ? [] : [`review_${event.rating}`],
      });
    }
    case 'review.recovery_marked': {
      const helped = event.outcome === 'helped';
      return createSkillAttempt({
        ...base,
        surface: 'review',
        skill: 'vocabulary',
        subskill: 'stubborn_recovery',
        contentRefType: 'word',
        contentRefId: event.wordId,
        score: helped ? 1 : 0,
        maxScore: 1,
        rubric: {
          trigger: event.trigger,
          lapses: event.lapses,
          difficulty: event.difficulty,
        },
        mistakeTags: helped ? [] : ['review_recovery_still_confusing', `trigger_${event.trigger}`],
      });
    }
    case 'lesson.completed':
      return createSkillAttempt({
        ...base,
        surface: 'today',
        skill: 'vocabulary',
        subskill: 'lesson_completion',
        contentRefType: 'lesson',
        contentRefId: event.lessonId,
        score: 1,
        maxScore: 1,
      });
    default:
      event satisfies never;
      throw new TypeError('Unsupported evidence event type');
  }
}

const payloadText = (
  payload: Record<string, unknown>,
  key: string,
  fallback = '',
): string => {
  const value = payload[key];
  return typeof value === 'string' ? value : fallback;
};

export function learningEventToSkillAttempt(
  event: LearningEventRecord,
  options: SkillAttemptContext = {},
): SkillAttempt | null {
  if (!event.eventName.startsWith('evidence.')) return null;

  const payload = event.payload || {};
  const createdAt = payloadText(payload, 'evidenceCreatedAt', event.createdAt);
  const type = event.eventName.slice('evidence.'.length);

  switch (type) {
    case 'vocab.learned':
    case 'vocab.hard':
    case 'vocab.bookmarked':
      return evidenceEventToSkillAttempt({
        type,
        userId: event.userId,
        wordId: payloadText(payload, 'wordId'),
        bookId: payloadText(payload, 'bookId') || undefined,
        createdAt,
      }, options);
    case 'practice.correct':
    case 'practice.recovered':
    case 'practice.incorrect':
      return evidenceEventToSkillAttempt({
        type,
        userId: event.userId,
        wordId: payloadText(payload, 'wordId'),
        mode: payloadText(payload, 'mode', 'unknown'),
        createdAt,
      }, options);
    case 'review.rated':
      return evidenceEventToSkillAttempt({
        type: 'review.rated',
        userId: event.userId,
        wordId: payloadText(payload, 'wordId'),
        rating: payloadText(payload, 'rating', 'again') as 'again' | 'hard' | 'good' | 'easy',
        createdAt,
      }, options);
    case 'review.recovery_marked':
      return evidenceEventToSkillAttempt({
        type: 'review.recovery_marked',
        userId: event.userId,
        wordId: payloadText(payload, 'wordId'),
        outcome: payloadText(payload, 'outcome', 'still_confusing') as 'helped' | 'still_confusing',
        trigger: payloadText(payload, 'trigger', 'difficulty') as 'lapse' | 'difficulty' | 'both',
        lapses: Number(payload.lapses || 0),
        difficulty: Number(payload.difficulty || 0),
        createdAt,
      }, options);
    case 'lesson.completed':
      return evidenceEventToSkillAttempt({
        type: 'lesson.completed',
        userId: event.userId,
        lessonId: payloadText(payload, 'lessonId'),
        pathId: payloadText(payload, 'pathId') || undefined,
        createdAt,
      }, options);
    default:
      return null;
  }
}

const needsRemediation = (attempt: SkillAttempt): boolean =>
  (typeof attempt.accuracy === 'number' && attempt.accuracy < 0.75) ||
  attempt.mistakeTags.length > 0;

const targetSurfaceForAttempt = (attempt: SkillAttempt): LearningRemediationTargetSurface => {
  if (attempt.skill === 'writing' || attempt.skill === 'speaking') return 'coach';
  if (attempt.surface === 'review') return 'review';
  if (attempt.surface === 'reading') return 'reading';
  if (attempt.surface === 'listening') return 'listening';
  if (attempt.surface === 'pronunciation') return 'pronunciation';
  return 'practice';
};

const recommendationForAttempt = (attempt: SkillAttempt): string => {
  if (attempt.skill === 'vocabulary') {
    return `Revisit ${attempt.contentRefType} ${attempt.contentRefId} with a focused recall drill.`;
  }
  if (attempt.skill === 'writing' || attempt.skill === 'speaking') {
    return `Ask Coach to review the ${attempt.skill} attempt and give one targeted correction.`;
  }
  return `Repeat the ${attempt.skill} task and focus on ${attempt.subskill || 'the missed skill'}.`;
};

export function buildRemediationFromAttempt(
  attempt: SkillAttempt,
  options: RemediationBuildOptions = {},
): LearningRemediation | null {
  if (!needsRemediation(attempt)) return null;

  const createdAt = options.createdAt || nowIso();

  return {
    id: createId('remediation'),
    userId: attempt.userId,
    orgId: attempt.orgId,
    cohortId: attempt.cohortId,
    assignmentId: attempt.assignmentId,
    mistakeId: options.mistakeId,
    status: 'open',
    targetSurface: targetSurfaceForAttempt(attempt),
    skill: attempt.skill,
    subskill: attempt.subskill,
    contentRefType: attempt.contentRefType,
    contentRefId: attempt.contentRefId,
    recommendation: recommendationForAttempt(attempt),
    dueAt: options.dueAt || createdAt,
    createdBy: options.createdBy || 'system',
    createdAt,
  };
}

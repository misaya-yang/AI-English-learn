// evidenceEvents.ts — small typed evidence-event model for learning actions.
//
// `learningEvents` already exists as the freeform analytics layer. This
// module adds a strict, narrow contract on top of it for the *evidence*
// signals that downstream surfaces depend on (Today / Practice / Review
// write them; LearningPath / mission progress read them). Pure helpers
// here; the actual persistence still routes through recordLearningEvent
// so a single sync path serves both.

import { recordLearningEvent } from './learningEvents';
import type { LearningEventRecord } from './learningEvents';

// ── Types ───────────────────────────────────────────────────────────────────

export type EvidenceEventType =
  | 'vocab.learned'
  | 'vocab.hard'
  | 'vocab.bookmarked'
  | 'practice.correct'
  | 'practice.incorrect'
  | 'review.rated'
  | 'lesson.completed';

export interface EvidenceEventBase {
  type: EvidenceEventType;
  userId: string;
  createdAt: string;
}

export interface VocabEvidenceEvent extends EvidenceEventBase {
  type: 'vocab.learned' | 'vocab.hard' | 'vocab.bookmarked';
  wordId: string;
  bookId?: string;
}

export interface PracticeEvidenceEvent extends EvidenceEventBase {
  type: 'practice.correct' | 'practice.incorrect';
  wordId: string;
  /** "quiz" / "listening" / "pronunciation" / etc. — free-form for now. */
  mode: string;
}

export interface ReviewEvidenceEvent extends EvidenceEventBase {
  type: 'review.rated';
  wordId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
}

export interface LessonEvidenceEvent extends EvidenceEventBase {
  type: 'lesson.completed';
  lessonId: string;
  pathId?: string;
}

export type EvidenceEvent =
  | VocabEvidenceEvent
  | PracticeEvidenceEvent
  | ReviewEvidenceEvent
  | LessonEvidenceEvent;

// ── Construction ────────────────────────────────────────────────────────────

type EvidenceInput =
  | (Omit<VocabEvidenceEvent, 'createdAt'> & { createdAt?: string })
  | (Omit<PracticeEvidenceEvent, 'createdAt'> & { createdAt?: string })
  | (Omit<ReviewEvidenceEvent, 'createdAt'> & { createdAt?: string })
  | (Omit<LessonEvidenceEvent, 'createdAt'> & { createdAt?: string });

export function createEvidenceEvent<T extends EvidenceInput>(input: T): EvidenceEvent {
  if (!input || typeof input !== 'object') {
    throw new TypeError('createEvidenceEvent requires an object');
  }
  if (!input.userId) {
    throw new TypeError('createEvidenceEvent requires userId');
  }
  return {
    ...input,
    createdAt: input.createdAt || new Date().toISOString(),
  } as EvidenceEvent;
}

// ── Persistence ─────────────────────────────────────────────────────────────

interface RecordEvidenceOptions {
  sessionId?: string;
  /** Skip writing — useful for unit tests or dry runs. */
  skipPersist?: boolean;
}

/**
 * Persist an evidence event. Routes through `recordLearningEvent` so the
 * shared `learning_events` table (and its sync queue) remains the single
 * write path. The structured payload preserves the type-specific fields
 * so derivation later can re-hydrate without lossy stringification.
 */
export async function recordEvidence(
  event: EvidenceEvent,
  opts: RecordEvidenceOptions = {},
): Promise<EvidenceEvent> {
  if (opts.skipPersist) return event;

  const { type, userId, createdAt, ...rest } = event;
  await recordLearningEvent({
    userId,
    eventName: `evidence.${type}`,
    payload: { ...(rest as Record<string, unknown>), evidenceCreatedAt: createdAt },
    sessionId: opts.sessionId,
  });
  return event;
}

// ── Derivation ──────────────────────────────────────────────────────────────

export interface LessonCompletionRequirement {
  lessonId: string;
  /** Lesson is complete when this many distinct words are learned. */
  vocabLearnedCount?: number;
  /** Lesson is complete when this many practice answers are correct. */
  practiceCorrectCount?: number;
  /** Lesson is complete when this many reviews are rated good/easy. */
  reviewSuccessCount?: number;
  /** Lesson is unconditionally complete when the user toggles the override. */
  manualOverride?: boolean;
}

export interface LessonCompletionResult {
  lessonId: string;
  completed: boolean;
  /** 0..1 fraction of requirements met. */
  progress: number;
  metBy: EvidenceEventType[];
}

const isVocabLearned = (event: EvidenceEvent | LearningEventRecord): boolean =>
  ('type' in event && event.type === 'vocab.learned') ||
  ('eventName' in event && event.eventName === 'evidence.vocab.learned');

const isPracticeCorrect = (event: EvidenceEvent | LearningEventRecord): boolean =>
  ('type' in event && event.type === 'practice.correct') ||
  ('eventName' in event && event.eventName === 'evidence.practice.correct');

const extractWordId = (event: EvidenceEvent | LearningEventRecord): string => {
  if ('wordId' in event && typeof (event as { wordId?: unknown }).wordId === 'string') {
    return (event as { wordId: string }).wordId;
  }
  if ('payload' in event && event.payload && typeof (event.payload as { wordId?: unknown }).wordId === 'string') {
    return (event.payload as { wordId: string }).wordId;
  }
  return '';
};

const isReviewSuccess = (event: EvidenceEvent | LearningEventRecord): boolean => {
  if ('type' in event && event.type === 'review.rated') {
    return event.rating === 'good' || event.rating === 'easy';
  }
  if ('eventName' in event && event.eventName === 'evidence.review.rated') {
    const rating = (event.payload as { rating?: string } | undefined)?.rating;
    return rating === 'good' || rating === 'easy';
  }
  return false;
};

const isLessonCompletion = (
  event: EvidenceEvent | LearningEventRecord,
  lessonId: string,
): boolean => {
  if ('type' in event && event.type === 'lesson.completed') {
    return event.lessonId === lessonId;
  }
  if ('eventName' in event && event.eventName === 'evidence.lesson.completed') {
    return (event.payload as { lessonId?: string } | undefined)?.lessonId === lessonId;
  }
  return false;
};

/**
 * Compute lesson completion derived from evidence events. Accepts either
 * the typed in-memory `EvidenceEvent` shape or the persisted
 * `LearningEventRecord` rows from `learningEvents.getLearningEvents` so
 * callers don't have to reshape before checking. Manual override always
 * wins.
 */
export function deriveLessonCompletion(
  events: Array<EvidenceEvent | LearningEventRecord>,
  requirement: LessonCompletionRequirement,
): LessonCompletionResult {
  const metBy: EvidenceEventType[] = [];
  let metRequirements = 0;
  let totalRequirements = 0;

  if (requirement.manualOverride) {
    return { lessonId: requirement.lessonId, completed: true, progress: 1, metBy };
  }

  // Treat an explicit lesson.completed event for this lesson as a hard yes.
  if (events.some((event) => isLessonCompletion(event, requirement.lessonId))) {
    return { lessonId: requirement.lessonId, completed: true, progress: 1, metBy: ['lesson.completed'] };
  }

  if (typeof requirement.vocabLearnedCount === 'number' && requirement.vocabLearnedCount > 0) {
    totalRequirements += 1;
    const distinctLearned = new Set(
      events.filter(isVocabLearned).map(extractWordId).filter(Boolean),
    );
    if (distinctLearned.size >= requirement.vocabLearnedCount) {
      metRequirements += 1;
      metBy.push('vocab.learned');
    }
  }

  if (typeof requirement.practiceCorrectCount === 'number' && requirement.practiceCorrectCount > 0) {
    totalRequirements += 1;
    const correctCount = events.filter(isPracticeCorrect).length;
    if (correctCount >= requirement.practiceCorrectCount) {
      metRequirements += 1;
      metBy.push('practice.correct');
    }
  }

  if (typeof requirement.reviewSuccessCount === 'number' && requirement.reviewSuccessCount > 0) {
    totalRequirements += 1;
    const reviewSuccessCount = events.filter(isReviewSuccess).length;
    if (reviewSuccessCount >= requirement.reviewSuccessCount) {
      metRequirements += 1;
      metBy.push('review.rated');
    }
  }

  if (totalRequirements === 0) {
    return { lessonId: requirement.lessonId, completed: false, progress: 0, metBy };
  }

  return {
    lessonId: requirement.lessonId,
    completed: metRequirements >= totalRequirements,
    progress: metRequirements / totalRequirements,
    metBy,
  };
}

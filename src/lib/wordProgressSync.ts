import type { FSRSState } from '@/types/core';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeWordUuid(wordId: string): string | null {
  return UUID_PATTERN.test(wordId) ? wordId : null;
}

function toIsoTimestamp(value?: string | null): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`).toISOString();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function calculateIntervalDays(lastReviewedAt?: string | null, dueAt?: string | null): number {
  const last = toIsoTimestamp(lastReviewedAt);
  const due = toIsoTimestamp(dueAt);
  if (!last || !due) return 0;
  return Math.max(0, Math.round((new Date(due).getTime() - new Date(last).getTime()) / 86_400_000));
}

export function buildWordProgressSyncPayload(args: {
  userId: string;
  wordId: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  reviewCount?: number;
  correctCount?: number;
  incorrectCount?: number;
  easeFactor?: number;
  nextReviewAt?: string | null;
  lastReviewedAt?: string | null;
  firstLearnedAt?: string | null;
  masteredAt?: string | null;
  fsrs?: FSRSState | null;
}): {
  user_id: string;
  word_id: string | null;
  word_ref: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  ease_factor: number;
  interval: number;
  next_review_at?: string;
  last_reviewed_at?: string;
  first_learned_at?: string;
  mastered_at?: string;
  stability: number | null;
  difficulty: number | null;
  retrievability: number | null;
  lapses: number | null;
  srs_state: FSRSState['state'] | null;
  due_at: string | null;
  updated_at: string;
} {
  const fsrs = args.fsrs ?? null;
  const lastReviewedAt = fsrs?.lastReviewAt ?? toIsoTimestamp(args.lastReviewedAt);
  const dueAt = fsrs?.dueAt ?? toIsoTimestamp(args.nextReviewAt);

  return {
    user_id: args.userId,
    word_id: normalizeWordUuid(args.wordId),
    word_ref: args.wordId,
    status: args.status,
    review_count: args.reviewCount ?? 0,
    correct_count: args.correctCount ?? 0,
    incorrect_count: args.incorrectCount ?? 0,
    ease_factor: args.easeFactor ?? 2.5,
    interval: calculateIntervalDays(lastReviewedAt, dueAt),
    next_review_at: dueAt ?? undefined,
    last_reviewed_at: lastReviewedAt ?? undefined,
    first_learned_at: toIsoTimestamp(args.firstLearnedAt) ?? undefined,
    mastered_at: toIsoTimestamp(args.masteredAt) ?? undefined,
    stability: fsrs?.stability ?? null,
    difficulty: fsrs?.difficulty ?? null,
    retrievability: fsrs?.retrievability ?? null,
    lapses: fsrs?.lapses ?? null,
    srs_state: fsrs?.state ?? null,
    due_at: dueAt ?? null,
    updated_at: new Date().toISOString(),
  };
}

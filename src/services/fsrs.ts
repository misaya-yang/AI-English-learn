/**
 * FSRS-5 Spaced Repetition Algorithm
 * ─────────────────────────────────────────────────────────────────────────────
 * Reference: "A Stochastic Shortest Path Algorithm for Optimizing Spaced
 *             Repetition Scheduling" (Ye et al., 2022 / FSRS v5 parameters)
 *
 * Key concepts:
 *   S (stability)     — days until retrievability falls to REQUESTED_RETENTION
 *   D (difficulty)    — card-specific difficulty 1–10
 *   R (retrievability)— probability of recalling the card right now (0–1)
 *
 * Formula:  R(t) = (1 + FACTOR · t / S) ^ DECAY
 */

import type { FSRSState, Rating } from '@/types/core';

// ─── Parameters (FSRS-5 default weights) ─────────────────────────────────────

const W = [
  0.4072, 1.1829, 3.1262, 15.4722,  // w[0-3]  init stability per rating
  7.2102, 0.5316,  1.0651,  0.0589,  // w[4-7]  init difficulty + update
  1.5330, 0.1544,  1.0046,  1.9777,  // w[8-11] recall stability
  0.0986, 0.2028,  0.6567,  0.2695,  // w[12-15]forget stability + hard penalty
  2.2700,                             // w[16]   easy bonus
] as const;

const DECAY = -0.5;
/** FACTOR = 0.9^(1/DECAY) − 1  ≈  19/81 */
const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;
/** Target retention — how well we want the user to remember at next review */
const REQUESTED_RETENTION = 0.9;
export const STUBBORN_LAPSE_THRESHOLD = 3;
export const STUBBORN_DIFFICULTY_THRESHOLD = 8;

// ─── Rating helpers ───────────────────────────────────────────────────────────

const RATING_VALUE: Record<Rating, 1 | 2 | 3 | 4> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

// ─── Public helpers ───────────────────────────────────────────────────────────

/**
 * Return a fresh FSRS state for a brand-new card (never seen before).
 */
export function initCard(): FSRSState {
  return {
    stability: 0,
    difficulty: 0,
    retrievability: 0,
    lapses: 0,
    state: 'new',
    dueAt: new Date().toISOString(),
    lastReviewAt: null,
  };
}

/**
 * Current recall probability for a card given elapsed days since last review.
 *   R(t) = (1 + FACTOR · t / S) ^ DECAY
 */
export function retrievability(stability: number, elapsedDays: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + FACTOR * elapsedDays / stability, DECAY);
}

/**
 * How many days to schedule until the next review for a given stability.
 * Derived by solving R(t) = REQUESTED_RETENTION for t.
 */
export function scheduledDays(stability: number): number {
  return Math.max(
    1,
    Math.round(
      (stability / FACTOR) * (Math.pow(REQUESTED_RETENTION, 1 / DECAY) - 1),
    ),
  );
}

export function isStubbornWord(card: Pick<FSRSState, 'lapses' | 'difficulty'>): boolean {
  return card.lapses >= STUBBORN_LAPSE_THRESHOLD || card.difficulty >= STUBBORN_DIFFICULTY_THRESHOLD;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Initial stability for a brand-new card, indexed by rating (0-based). */
function initStability(rating: Rating): number {
  return W[RATING_VALUE[rating] - 1];
}

/** Initial difficulty D0(G) = w4 − exp(w5 · (G − 1)) + 1, clamped [1, 10]. */
function initDifficulty(rating: Rating): number {
  const g = RATING_VALUE[rating];
  return clampDifficulty(W[4] - Math.exp(W[5] * (g - 1)) + 1);
}

/** Difficulty after a subsequent review: D' = D + w6 · (3 − G), clamped [1, 10]. */
function nextDifficulty(d: number, rating: Rating): number {
  const g = RATING_VALUE[rating];
  return clampDifficulty(d + W[6] * (3 - g));
}

/** S′(D, S, R, G) — stability after a successful recall. */
function nextStabilityRecall(
  s: number,
  d: number,
  r: number,
  rating: Rating,
): number {
  const hardPenalty = rating === 'hard' ? W[15] : 1;
  const easyBonus   = rating === 'easy' ? W[16] : 1;
  return (
    s *
    (Math.exp(W[8]) *
      (11 - d) *
      Math.pow(s, -W[9]) *
      (Math.exp((1 - r) * W[10]) - 1) *
      hardPenalty *
      easyBonus +
      1)
  );
}

/** S′f(D, S, R) — stability after forgetting (lapse / 'again'). */
function nextStabilityForget(d: number, s: number, r: number): number {
  return (
    W[11] *
    Math.pow(d, -W[12]) *
    (Math.pow(s + 1, W[13]) - 1) *
    Math.exp((1 - r) * W[14])
  );
}

function clampDifficulty(d: number): number {
  return Math.min(10, Math.max(1, d));
}

// ─── Core scheduling function ─────────────────────────────────────────────────

/**
 * Advance the card state after a review.
 *
 * @param card    Current FSRS state of the card
 * @param rating  User's self-assessed recall quality
 * @param now     Wall-clock time of the review (defaults to now)
 * @returns       New FSRS state with updated stability, difficulty, dueAt, etc.
 */
export function scheduleReview(
  card: FSRSState,
  rating: Rating,
  now: Date = new Date(),
): FSRSState {
  const elapsedDays = card.lastReviewAt
    ? (now.getTime() - new Date(card.lastReviewAt).getTime()) / 86_400_000
    : 0;

  let { stability, difficulty, lapses, state } = card;
  const r = card.lastReviewAt ? retrievability(stability, elapsedDays) : 0;
  const wasStubborn = isStubbornWord(card);

  if (state === 'new') {
    // ── First exposure ──────────────────────────────────────────────────────
    stability  = initStability(rating);
    difficulty = initDifficulty(rating);
    state      = rating === 'again' ? 'learning' : 'review';
  } else if (rating === 'again') {
    // ── Lapse: forgotten ───────────────────────────────────────────────────
    stability  = nextStabilityForget(difficulty, stability, r);
    difficulty = nextDifficulty(difficulty, rating);
    lapses    += 1;
    state      = 'relearning';
  } else {
    // ── Successful recall ──────────────────────────────────────────────────
    stability  = nextStabilityRecall(stability, difficulty, r, rating);
    difficulty = nextDifficulty(difficulty, rating);
    state      = 'review';
  }

  // How many days until next review?
  const isNowStubborn = isStubbornWord({ lapses, difficulty });
  const reinforcementFactor = rating === 'hard' ? 0.35 : 0.6;
  const days =
    state === 'learning' || state === 'relearning'
      ? rating === 'again'
        ? 0   // show again in the same session
        : 1   // show tomorrow
      : wasStubborn || isNowStubborn
        ? Math.max(1, Math.round(scheduledDays(stability) * reinforcementFactor))
        : scheduledDays(stability);

  const dueAt = new Date(now.getTime() + days * 86_400_000).toISOString();

  return {
    stability,
    difficulty,
    retrievability: retrievability(stability, 0),
    lapses,
    state,
    dueAt,
    lastReviewAt: now.toISOString(),
  };
}

// ─── Due-card filter ──────────────────────────────────────────────────────────

/**
 * Return true when a card is due for review right now.
 * New cards (state === 'new') are always considered due.
 */
export function isDue(card: FSRSState, now: Date = new Date()): boolean {
  if (card.state === 'new') return true;
  return new Date(card.dueAt) <= now;
}

/**
 * Sort comparator: overdue cards first (earliest dueAt), then new cards.
 */
export function dueSortComparator(a: FSRSState, b: FSRSState): number {
  if (a.state === 'new' && b.state !== 'new') return 1;
  if (b.state === 'new' && a.state !== 'new') return -1;
  return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
}

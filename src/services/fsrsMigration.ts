/**
 * fsrsMigration.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * One-shot migration from the old SM-2–based UserProgress records stored in
 * localStorage to the new FSRS-5 FSRSState format.
 *
 * Called lazily on first read in UserDataContext so existing users
 * transparently get FSRS scheduling without any manual action.
 */

import type { FSRSState } from '@/types/core';
import type { UserProgress } from '@/data/localStorage';

// ─── Mapping rules ────────────────────────────────────────────────────────────
// SM-2 fields we have:
//   easeFactor   — 1.3 … 2.5 (higher = easier)
//   reviewCount  — total reviews
//   lastReviewed — ISO date string or null
//   nextReview   — ISO date string or null
//   status       — 'new' | 'learning' | 'review' | 'mastered'
//
// FSRS-5 fields we need:
//   stability    — days until 90% retention
//   difficulty   — 1–10 (higher = harder)
//   retrievability — current recall probability
//   lapses       — times forgotten
//   state        — 'new' | 'learning' | 'review' | 'relearning'
//   dueAt        — ISO timestamp
//   lastReviewAt — ISO timestamp or null

/**
 * Convert a single SM-2 UserProgress record into an FSRSState.
 *
 * Approximation rules:
 *   difficulty = (2.5 − easeFactor) / (2.5 − 1.3) × 9 + 1  → 1–10
 *   stability  = max(1, (nextReview − lastReviewed) in days × 0.8)
 *              (0.8 factor accounts for SM-2 over-scheduling relative to FSRS)
 *   lapses     = 0  (we have no reliable lapse history)
 *   state      = maps from status
 */
export function migrateSM2ToFSRS(progress: UserProgress): FSRSState {
  // ── Difficulty ─────────────────────────────────────────────────────────────
  const easeFactor   = progress.easeFactor ?? 2.5;
  const rawDifficulty = ((2.5 - easeFactor) / (2.5 - 1.3)) * 9 + 1;
  const difficulty    = Math.min(10, Math.max(1, rawDifficulty));

  // ── Stability (approximate interval in days) ───────────────────────────────
  let stability = 1;
  if (progress.nextReview && progress.lastReviewed) {
    const intervalMs =
      new Date(progress.nextReview).getTime() -
      new Date(progress.lastReviewed).getTime();
    const intervalDays = intervalMs / 86_400_000;
    stability = Math.max(1, Math.round(intervalDays * 0.8));
  } else if (progress.reviewCount > 0) {
    // Rough heuristic: stability grows with review count
    stability = Math.min(365, Math.round(1.5 ** (progress.reviewCount - 1)));
  }

  // ── Retrievability (current recall probability) ────────────────────────────
  let retrievability = 0;
  if (progress.lastReviewed && stability > 0) {
    const elapsedDays =
      (Date.now() - new Date(progress.lastReviewed).getTime()) / 86_400_000;
    const DECAY  = -0.5;
    const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;
    retrievability = Math.max(
      0,
      Math.pow(1 + FACTOR * elapsedDays / stability, DECAY),
    );
  }

  // ── SRS state ──────────────────────────────────────────────────────────────
  const stateMap: Record<string, FSRSState['state']> = {
    new: 'new',
    learning: 'learning',
    review: 'review',
    mastered: 'review',   // treat mastered as a well-learned review card
  };
  const state: FSRSState['state'] = stateMap[progress.status] ?? 'new';

  // ── Due date ───────────────────────────────────────────────────────────────
  // Prefer the existing nextReview date; fall back to now (immediately due).
  const dueAt = progress.nextReview
    ? new Date(progress.nextReview).toISOString()
    : new Date().toISOString();

  return {
    stability,
    difficulty,
    retrievability,
    lapses: 0,
    state,
    dueAt,
    lastReviewAt: progress.lastReviewed
      ? new Date(progress.lastReviewed).toISOString()
      : null,
  };
}

/**
 * Check whether a UserProgress record already has an embedded FSRSState.
 * We store the FSRS state under the `fsrs` key injected during migration.
 */
export function hasFSRS(
  progress: UserProgress & { fsrs?: FSRSState },
): progress is UserProgress & { fsrs: FSRSState } {
  return progress.fsrs !== undefined && progress.fsrs.stability > 0;
}

/**
 * Ensure the progress record has a valid FSRSState, migrating on-the-fly if
 * it was created under the old SM-2 scheme.
 */
export function ensureFSRS(
  progress: UserProgress & { fsrs?: FSRSState },
): FSRSState {
  if (hasFSRS(progress)) return progress.fsrs;
  return migrateSM2ToFSRS(progress);
}

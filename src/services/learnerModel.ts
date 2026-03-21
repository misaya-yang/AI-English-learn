/**
 * learnerModel.ts — Personalisation engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Analyses the user's learning history and computes:
 *   • Current learning mode (recovery / maintenance / steady / stretch / sprint)
 *   • Daily new-word target adjusted for the mode
 *   • Weak / strong topic clusters
 *   • Burnout risk score
 *   • 30-day retention prediction
 *
 * All computation is purely local — no network calls.
 * Call `computeLearnerModel()` after each study session and cache the result.
 */

import type { UserProgress } from '@/data/localStorage';
import type { FSRSState } from '@/types/core';
import { retrievability } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';
import { wordsDatabase } from '@/data/words';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LearningMode =
  | 'recovery'      // Overdue backlog > 20 or burnout risk > 0.8 — no new words
  | 'maintenance'   // Backlog 6-20 — prioritise reviews
  | 'steady'        // Normal cadence — balanced new + review
  | 'stretch'       // 7+ days streak, good consistency — accelerate new words
  | 'sprint';       // Exam mode — push weakest cards hardest

export interface LearnerModel {
  userId: string;
  computedAt: string;
  mode: LearningMode;
  /** Average FSRS retrievability across all non-mastered words (0-1) */
  avgRetrievability: number;
  /** Predicted retention after 30 days based on current average stability */
  predictedRetention30d: number;
  /** Topics where the user struggles (low retrievability) */
  weakTopics: string[];
  /** Topics the user has mastered well */
  strongTopics: string[];
  /** Recommended new words per day */
  recommendedDailyNew: number;
  /** Recommended review cards per day */
  recommendedDailyReview: number;
  /** 0-1: risk of learning fatigue based on recent session frequency */
  burnoutRisk: number;
  /** Cards currently due */
  dueCount: number;
  /** Average stability across reviewed words (in days) */
  avgStability: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_MULTIPLIERS: Record<LearningMode, number> = {
  recovery:    0,
  maintenance: 0.5,
  steady:      1.0,
  stretch:     1.3,
  sprint:      1.5,
};

// ─── Main computation ─────────────────────────────────────────────────────────

/**
 * Compute the full learner model from local progress data.
 *
 * @param userId        Current user's ID
 * @param progress      All UserProgress records for this user
 * @param streakDays    Current consecutive-day streak
 * @param dailyGoal     User's configured words-per-day target
 */
export function computeLearnerModel(
  userId: string,
  progress: UserProgress[],
  streakDays: number,
  dailyGoal: number,
): LearnerModel {
  const now = Date.now();
  const nonMastered = progress.filter((p) => p.status !== 'mastered');

  // ── Per-word FSRS metrics ─────────────────────────────────────────────────
  interface WordMetric {
    wordId: string;
    topic: string;
    stability: number;
    retrievability: number;
    isDue: boolean;
  }

  // Build O(1) lookup map to avoid O(n²) find() inside the map below
  const wordTopicMap = new Map(wordsDatabase.map((w) => [w.id, w.topic as string]));

  const metrics: WordMetric[] = nonMastered.map((p) => {
    const fsrs   = ensureFSRS(p as UserProgress & { fsrs?: FSRSState });
    const elapsed = fsrs.lastReviewAt
      ? (now - new Date(fsrs.lastReviewAt).getTime()) / 86_400_000
      : 0;
    const r       = fsrs.stability > 0 ? retrievability(fsrs.stability, elapsed) : 0;
    const due     = new Date(fsrs.dueAt) <= new Date();

    return {
      wordId:        p.wordId,
      topic:         wordTopicMap.get(p.wordId) ?? 'general',
      stability:     fsrs.stability,
      retrievability: r,
      isDue:         due,
    };
  });

  const dueCount = metrics.filter((m) => m.isDue).length;

  // ── Average retrievability & stability ────────────────────────────────────
  const reviewed = metrics.filter((m) => m.stability > 0);
  const avgRetrievability = reviewed.length
    ? reviewed.reduce((s, m) => s + m.retrievability, 0) / reviewed.length
    : 0;
  const avgStability = reviewed.length
    ? reviewed.reduce((s, m) => s + m.stability, 0) / reviewed.length
    : 1;

  // ── 30-day retention prediction using FSRS formula ───────────────────────
  const predictedRetention30d = avgStability > 0
    ? Math.round(retrievability(avgStability, 30) * 100)
    : 0;

  // ── Topic strengths and weaknesses ───────────────────────────────────────
  const topicStats: Record<string, { sumR: number; count: number }> = {};
  for (const m of reviewed) {
    if (!topicStats[m.topic]) topicStats[m.topic] = { sumR: 0, count: 0 };
    topicStats[m.topic].sumR   += m.retrievability;
    topicStats[m.topic].count  += 1;
  }
  const topicAvgs = Object.entries(topicStats)
    .filter(([, v]) => v.count >= 2)
    .map(([topic, v]) => ({ topic, avg: v.sumR / v.count }))
    .sort((a, b) => a.avg - b.avg);

  const weakTopics   = topicAvgs.slice(0, 3).filter((t) => t.avg < 0.65).map((t) => t.topic);
  const strongTopics = topicAvgs.slice(-3).filter((t) => t.avg >= 0.80).map((t) => t.topic);

  // ── Burnout risk ─────────────────────────────────────────────────────────
  // Heuristic: high due count + low avg retrievability → high risk
  const dueFraction = nonMastered.length > 0 ? dueCount / nonMastered.length : 0;
  const burnoutRisk = Math.min(1, dueFraction * 0.5 + (avgRetrievability < 0.5 ? 0.4 : 0));

  // ── Learning mode ─────────────────────────────────────────────────────────
  let mode: LearningMode;
  if (dueCount > 20 || burnoutRisk > 0.8) {
    mode = 'recovery';
  } else if (dueCount > 5) {
    mode = 'maintenance';
  } else if (streakDays >= 14 && avgRetrievability >= 0.85 && weakTopics.length === 0) {
    // Sprint: very consistent learner with excellent retention — push to maximum
    mode = 'sprint';
  } else if (streakDays >= 7 && avgRetrievability >= 0.75) {
    mode = 'stretch';
  } else {
    mode = 'steady';
  }

  // ── Daily targets ─────────────────────────────────────────────────────────
  const recommendedDailyNew    = Math.round(dailyGoal * MODE_MULTIPLIERS[mode]);
  const recommendedDailyReview = Math.min(50, Math.max(dueCount, 5));

  return {
    userId,
    computedAt:            new Date().toISOString(),
    mode,
    avgRetrievability,
    predictedRetention30d,
    weakTopics,
    strongTopics,
    recommendedDailyNew,
    recommendedDailyReview,
    burnoutRisk,
    dueCount,
    avgStability,
  };
}

// ─── Mode helpers ─────────────────────────────────────────────────────────────

export const MODE_LABELS: Record<LearningMode, { label: string; labelZh: string; color: string }> = {
  recovery:    { label: 'Recovery',    labelZh: '消化积压',   color: 'text-red-400' },
  maintenance: { label: 'Maintenance', labelZh: '复习优先',   color: 'text-amber-400' },
  steady:      { label: 'Steady',      labelZh: '稳步前进',   color: 'text-emerald-400' },
  stretch:     { label: 'Stretch',     labelZh: '加速扩展',   color: 'text-blue-400' },
  sprint:      { label: 'Sprint',      labelZh: '考前冲刺',   color: 'text-violet-400' },
};

export const MODE_DESCRIPTIONS: Record<LearningMode, string> = {
  recovery:    'You have a large backlog — focus on clearing due reviews before adding new words.',
  maintenance: 'Prioritise your due reviews. Fewer new words today keeps the queue manageable.',
  steady:      'Balanced learning: mix new vocabulary with timely reviews.',
  stretch:     'Great consistency! You can safely accelerate by learning more new words today.',
  sprint:      'Exam mode: push through weak cards at maximum intensity.',
};

/** Compute the daily new-word target for a given mode and user goal */
export function dailyNewWordTarget(mode: LearningMode, userGoal: number): number {
  return Math.round(userGoal * MODE_MULTIPLIERS[mode]);
}

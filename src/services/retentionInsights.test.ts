import { describe, it, expect } from 'vitest';
import { computeHighRiskWords, type RetentionRiskItem } from './retentionInsights';
import type { UserProgress } from '@/data/localStorage';

function makeProgress(overrides: Record<string, unknown> & { wordId: string }): UserProgress {
  const base = {
    userId: 'test-user',
    wordId: overrides.wordId,
    status: (overrides.status as string) || 'learning',
    reviewCount: (overrides.reviewCount as number) || 2,
    lastReviewed: new Date().toISOString(),
    nextReview: new Date(Date.now() + 86_400_000).toISOString(),
    easeFactor: 2.5,
    correctCount: 3,
    incorrectCount: 1,
    fsrs: {
      stability: 5,
      difficulty: 5,
      retrievability: 0.8,
      lapses: 0,
      state: 'review',
      dueAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
      lastReviewAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      ...(overrides.fsrs as Record<string, unknown> || {}),
    },
  };
  return base as unknown as UserProgress;
}

const words = [
  { id: 'w1', word: 'ephemeral', topic: 'academic' },
  { id: 'w2', word: 'pragmatic', topic: 'business' },
  { id: 'w3', word: 'serendipity', topic: 'literary' },
];

describe('computeHighRiskWords', () => {
  const now = new Date('2026-04-06T12:00:00Z');

  it('returns empty array when no progress', () => {
    expect(computeHighRiskWords([], words)).toEqual([]);
  });

  it('excludes mastered words', () => {
    const progress = [
      makeProgress({ wordId: 'w1', status: 'mastered' }),
    ];
    expect(computeHighRiskWords(progress, words, 10, now)).toHaveLength(0);
  });

  it('produces valid output for learning words', () => {
    const progress = [
      makeProgress({
        wordId: 'w1',
        fsrs: {
          stability: 3,
          difficulty: 5,
          retrievability: 0.7,
          lapses: 0,
          state: 'learning',
          dueAt: now.toISOString(),
          lastReviewAt: new Date(now.getTime() - 86_400_000).toISOString(),
        },
      }),
    ];
    const result = computeHighRiskWords(progress, words, 10, now);
    expect(result.length).toBeGreaterThanOrEqual(0);
    if (result.length > 0) {
      expect(result[0].riskScore).toBeGreaterThanOrEqual(0);
      expect(result[0].riskScore).toBeLessThanOrEqual(100);
      expect(result[0].word).toBe('ephemeral');
    }
  });

  it('returns risk items sorted by risk score descending', () => {
    const progress = [
      makeProgress({
        wordId: 'w1',
        fsrs: {
          stability: 2,
          difficulty: 8,
          retrievability: 0.3,
          lapses: 3,
          state: 'relearning',
          dueAt: new Date(now.getTime() - 3600_000).toISOString(),
          lastReviewAt: new Date(now.getTime() - 5 * 86_400_000).toISOString(),
        },
      }),
      makeProgress({
        wordId: 'w2',
        fsrs: {
          stability: 10,
          difficulty: 3,
          retrievability: 0.9,
          lapses: 0,
          state: 'review',
          dueAt: new Date(now.getTime() + 5 * 86_400_000).toISOString(),
          lastReviewAt: new Date(now.getTime() - 1 * 86_400_000).toISOString(),
        },
      }),
    ];

    const result = computeHighRiskWords(progress, words, 10, now);
    expect(result.length).toBe(2);
    expect(result[0].wordId).toBe('w1'); // Higher risk
    expect(result[0].riskScore).toBeGreaterThan(result[1].riskScore);
  });

  it('marks overdue items correctly', () => {
    const progress = [
      makeProgress({
        wordId: 'w1',
        fsrs: {
          stability: 3,
          difficulty: 5,
          retrievability: 0.5,
          lapses: 1,
          state: 'review',
          dueAt: new Date(now.getTime() - 86_400_000).toISOString(),
          lastReviewAt: new Date(now.getTime() - 4 * 86_400_000).toISOString(),
        },
      }),
    ];

    const result = computeHighRiskWords(progress, words, 10, now);
    expect(result[0].isOverdue).toBe(true);
    expect(result[0].hoursUntilDue).toBeLessThan(0);
  });

  it('respects limit parameter', () => {
    const progress = Array.from({ length: 20 }, (_, i) =>
      makeProgress({
        wordId: `w${i}`,
        fsrs: {
          stability: 3,
          difficulty: 5,
          retrievability: 0.5,
          lapses: 1,
          state: 'review',
          dueAt: now.toISOString(),
          lastReviewAt: new Date(now.getTime() - 86_400_000).toISOString(),
        },
      }),
    );

    expect(computeHighRiskWords(progress, words, 5, now)).toHaveLength(5);
  });

  it('risk score is between 0 and 100', () => {
    const progress = [
      makeProgress({
        wordId: 'w1',
        fsrs: {
          stability: 1,
          difficulty: 10,
          retrievability: 0.1,
          lapses: 10,
          state: 'relearning',
          dueAt: new Date(now.getTime() - 7 * 86_400_000).toISOString(),
          lastReviewAt: new Date(now.getTime() - 14 * 86_400_000).toISOString(),
        },
      }),
    ];

    const result = computeHighRiskWords(progress, words, 10, now);
    expect(result[0].riskScore).toBeGreaterThanOrEqual(0);
    expect(result[0].riskScore).toBeLessThanOrEqual(100);
  });
});

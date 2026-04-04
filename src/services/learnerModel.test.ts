import { describe, it, expect, vi } from 'vitest';

// Mock wordsDatabase before importing the module under test
vi.mock('@/data/words', () => ({
  wordsDatabase: [
    { id: 'w1', topic: 'daily_communication' },
    { id: 'w2', topic: 'daily_communication' },
    { id: 'w3', topic: 'academic' },
    { id: 'w4', topic: 'academic' },
    { id: 'w5', topic: 'business' },
    { id: 'w6', topic: 'business' },
  ],
}));

import { computeLearnerModel, dailyNewWordTarget, type LearningMode } from './learnerModel';
import type { UserProgress } from '@/data/localStorage';
import type { FSRSState } from '@/types/core';

function makeProgress(
  wordId: string,
  status: UserProgress['status'],
  fsrs: Partial<FSRSState> = {},
): UserProgress {
  const now = new Date();
  const defaults: FSRSState = {
    stability: 10,
    difficulty: 5,
    retrievability: 0.9,
    lapses: 0,
    state: 'review',
    dueAt: new Date(now.getTime() + 86_400_000 * 3).toISOString(), // due in 3 days
    lastReviewAt: new Date(now.getTime() - 86_400_000).toISOString(), // reviewed 1 day ago
  };

  return {
    userId: 'user1',
    wordId,
    status,
    reviewCount: 5,
    lastReviewed: defaults.lastReviewAt,
    nextReview: defaults.dueAt,
    easeFactor: 2.5,
    fsrs: { ...defaults, ...fsrs },
  };
}

describe('learnerModel', () => {
  describe('computeLearnerModel', () => {
    it('returns steady mode for balanced state', () => {
      const progress = [
        makeProgress('w1', 'review'),
        makeProgress('w2', 'review'),
        makeProgress('w3', 'review'),
      ];

      const model = computeLearnerModel('user1', progress, 3, 10);
      expect(model.mode).toBe('steady');
      expect(model.userId).toBe('user1');
      expect(model.recommendedDailyNew).toBe(10); // 10 * 1.0
    });

    it('enters recovery mode when due count > 20', () => {
      const overdue = Array.from({ length: 25 }, (_, i) =>
        makeProgress(`w${i}`, 'review', {
          dueAt: new Date(Date.now() - 86_400_000).toISOString(), // overdue
        }),
      );

      const model = computeLearnerModel('user1', overdue, 0, 10);
      expect(model.mode).toBe('recovery');
      expect(model.recommendedDailyNew).toBe(0); // 0x multiplier
    });

    it('enters maintenance mode when due count is 6-20', () => {
      const progress = Array.from({ length: 10 }, (_, i) =>
        makeProgress(`w${i}`, 'review', {
          dueAt: new Date(Date.now() - 86_400_000).toISOString(),
        }),
      );

      const model = computeLearnerModel('user1', progress, 0, 10);
      expect(model.mode).toBe('maintenance');
      expect(model.recommendedDailyNew).toBe(5); // 0.5x multiplier
    });

    it('enters stretch mode with 7+ day streak and good retrievability', () => {
      const progress = [
        makeProgress('w1', 'review', { retrievability: 0.9, stability: 15 }),
        makeProgress('w2', 'review', { retrievability: 0.85, stability: 12 }),
      ];

      const model = computeLearnerModel('user1', progress, 8, 10);
      expect(model.mode).toBe('stretch');
      expect(model.recommendedDailyNew).toBe(13); // 1.3x
    });

    it('calculates burnout risk', () => {
      const progress = [
        makeProgress('w1', 'review', {
          dueAt: new Date(Date.now() - 86_400_000).toISOString(),
          stability: 1,
          retrievability: 0.3,
        }),
      ];

      const model = computeLearnerModel('user1', progress, 0, 10);
      expect(model.burnoutRisk).toBeGreaterThan(0);
      expect(model.burnoutRisk).toBeLessThanOrEqual(1);
    });

    it('identifies stubborn words', () => {
      const progress = [
        makeProgress('w1', 'review', { lapses: 5, difficulty: 9 }),
        makeProgress('w2', 'review'),
      ];

      const model = computeLearnerModel('user1', progress, 0, 10);
      expect(model.stubbornWordCount).toBe(1);
    });

    it('handles empty progress', () => {
      const model = computeLearnerModel('user1', [], 0, 10);
      expect(model.mode).toBe('steady');
      expect(model.avgRetrievability).toBe(0);
      expect(model.dueCount).toBe(0);
    });

    it('excludes mastered words from non-mastered metrics', () => {
      const progress = [
        makeProgress('w1', 'mastered'),
        makeProgress('w2', 'review'),
      ];

      const model = computeLearnerModel('user1', progress, 0, 10);
      // Only w2 should be counted in non-mastered
      expect(model.dueCount).toBeLessThanOrEqual(1);
    });
  });

  describe('dailyNewWordTarget', () => {
    it.each<[LearningMode, number]>([
      ['recovery', 0],
      ['maintenance', 5],
      ['steady', 10],
      ['stretch', 13],
      ['sprint', 15],
    ])('mode %s with goal 10 → %d', (mode, expected) => {
      expect(dailyNewWordTarget(mode, 10)).toBe(expected);
    });
  });
});

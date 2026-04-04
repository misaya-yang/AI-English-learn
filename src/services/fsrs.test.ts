import { describe, it, expect } from 'vitest';
import {
  initCard,
  retrievability,
  scheduledDays,
  scheduleReview,
  isDue,
  dueSortComparator,
  isStubbornWord,
  STUBBORN_LAPSE_THRESHOLD,
  STUBBORN_DIFFICULTY_THRESHOLD,
} from './fsrs';
import type { FSRSState } from '@/types/core';

describe('fsrs', () => {
  describe('initCard', () => {
    it('creates a new card with zero values', () => {
      const card = initCard();
      expect(card.stability).toBe(0);
      expect(card.difficulty).toBe(0);
      expect(card.retrievability).toBe(0);
      expect(card.lapses).toBe(0);
      expect(card.state).toBe('new');
      expect(card.lastReviewAt).toBeNull();
    });
  });

  describe('retrievability', () => {
    it('returns 0 for stability <= 0', () => {
      expect(retrievability(0, 5)).toBe(0);
      expect(retrievability(-1, 5)).toBe(0);
    });

    it('returns ~0.9 when elapsedDays equals stability', () => {
      // By definition: R(S) ≈ 0.9 (REQUESTED_RETENTION)
      const r = retrievability(10, 10);
      expect(r).toBeCloseTo(0.9, 1);
    });

    it('returns 1.0 at elapsedDays = 0', () => {
      expect(retrievability(10, 0)).toBeCloseTo(1.0, 5);
    });

    it('decreases as elapsedDays increases', () => {
      const r1 = retrievability(10, 5);
      const r2 = retrievability(10, 20);
      expect(r1).toBeGreaterThan(r2);
    });
  });

  describe('scheduledDays', () => {
    it('returns at least 1 day', () => {
      expect(scheduledDays(0.01)).toBeGreaterThanOrEqual(1);
    });

    it('higher stability → more days', () => {
      expect(scheduledDays(20)).toBeGreaterThan(scheduledDays(5));
    });

    it('returns an integer', () => {
      const days = scheduledDays(10);
      expect(Number.isInteger(days)).toBe(true);
    });
  });

  describe('isStubbornWord', () => {
    it('flags high-lapse cards', () => {
      expect(isStubbornWord({ lapses: STUBBORN_LAPSE_THRESHOLD, difficulty: 5 })).toBe(true);
    });

    it('flags high-difficulty cards', () => {
      expect(isStubbornWord({ lapses: 0, difficulty: STUBBORN_DIFFICULTY_THRESHOLD })).toBe(true);
    });

    it('does not flag normal cards', () => {
      expect(isStubbornWord({ lapses: 1, difficulty: 5 })).toBe(false);
    });
  });

  describe('scheduleReview', () => {
    const now = new Date('2025-01-15T12:00:00Z');

    it('initializes a new card on first review with "good"', () => {
      const card = initCard();
      const next = scheduleReview(card, 'good', now);

      expect(next.state).toBe('review');
      expect(next.stability).toBeGreaterThan(0);
      expect(next.difficulty).toBeGreaterThan(0);
      expect(next.difficulty).toBeLessThanOrEqual(10);
      expect(next.lapses).toBe(0);
      expect(next.lastReviewAt).toBe(now.toISOString());
    });

    it('moves a new card to learning on "again"', () => {
      const card = initCard();
      const next = scheduleReview(card, 'again', now);

      expect(next.state).toBe('learning');
      expect(next.lapses).toBe(0); // first exposure, no lapse
    });

    it('increments lapses on "again" for review card', () => {
      const card = initCard();
      const reviewed = scheduleReview(card, 'good', now);
      const lapsed = scheduleReview(reviewed, 'again', new Date('2025-01-20T12:00:00Z'));

      expect(lapsed.state).toBe('relearning');
      expect(lapsed.lapses).toBe(1);
    });

    it('increases stability on successful recall', () => {
      const card = initCard();
      const r1 = scheduleReview(card, 'good', now);
      const r2 = scheduleReview(r1, 'good', new Date('2025-01-18T12:00:00Z'));

      expect(r2.stability).toBeGreaterThan(r1.stability);
    });

    it('"easy" gives higher stability than "hard"', () => {
      const card = initCard();
      const afterGood = scheduleReview(card, 'good', now);

      const easyNext = scheduleReview(afterGood, 'easy', new Date('2025-01-18T12:00:00Z'));
      const hardNext = scheduleReview(afterGood, 'hard', new Date('2025-01-18T12:00:00Z'));

      expect(easyNext.stability).toBeGreaterThan(hardNext.stability);
    });

    it('dueAt is in the future', () => {
      const card = initCard();
      const next = scheduleReview(card, 'good', now);

      expect(new Date(next.dueAt).getTime()).toBeGreaterThanOrEqual(now.getTime());
    });
  });

  describe('isDue', () => {
    it('new cards are always due', () => {
      const card = initCard();
      expect(isDue(card)).toBe(true);
    });

    it('returns true when past dueAt', () => {
      const card: FSRSState = {
        ...initCard(),
        state: 'review',
        dueAt: '2025-01-01T00:00:00Z',
      };
      expect(isDue(card, new Date('2025-01-02T00:00:00Z'))).toBe(true);
    });

    it('returns false when before dueAt', () => {
      const card: FSRSState = {
        ...initCard(),
        state: 'review',
        dueAt: '2025-01-10T00:00:00Z',
      };
      expect(isDue(card, new Date('2025-01-05T00:00:00Z'))).toBe(false);
    });
  });

  describe('dueSortComparator', () => {
    it('sorts overdue cards before new cards', () => {
      const newCard = initCard();
      const overdueCard: FSRSState = {
        ...initCard(),
        state: 'review',
        dueAt: '2025-01-01T00:00:00Z',
      };

      const sorted = [newCard, overdueCard].sort(dueSortComparator);
      expect(sorted[0].state).toBe('review');
    });

    it('sorts earlier due dates first', () => {
      const a: FSRSState = { ...initCard(), state: 'review', dueAt: '2025-01-05T00:00:00Z' };
      const b: FSRSState = { ...initCard(), state: 'review', dueAt: '2025-01-01T00:00:00Z' };

      const sorted = [a, b].sort(dueSortComparator);
      expect(sorted[0].dueAt).toBe('2025-01-01T00:00:00Z');
    });
  });
});

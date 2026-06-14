import { describe, expect, it } from 'vitest';

import type { UserProgress } from '@/data/localStorage';
import type { LearningEventRecord, WeeklyActivityPoint } from '@/services/learningEvents';

import { buildWeeklyLearningRecap } from './weeklyRecap';

const event = (
  eventName: string,
  payload: Record<string, unknown> = {},
): LearningEventRecord => ({
  id: `${eventName}-${Math.random().toString(36).slice(2)}`,
  userId: 'u1',
  eventName,
  eventSource: 'web',
  payload,
  createdAt: '2026-06-13T00:00:00.000Z',
});

const day = (overrides: Partial<WeeklyActivityPoint> = {}): WeeklyActivityPoint => ({
  day: 'Mon',
  date: '2026-06-08',
  words: 0,
  xp: 0,
  minutes: 0,
  events: 0,
  ...overrides,
});

const progress = (overrides: Partial<UserProgress> = {}): UserProgress => ({
  userId: 'u1',
  wordId: 'w1',
  status: 'review',
  reviewCount: 1,
  lastReviewed: '2026-06-12T00:00:00.000Z',
  nextReview: '2026-06-12',
  easeFactor: 2.5,
  correctCount: 1,
  incorrectCount: 0,
  firstSeenAt: '2026-06-01T00:00:00.000Z',
  masteredAt: null,
  updatedAt: '2026-06-12T00:00:00.000Z',
  ...overrides,
});

describe('buildWeeklyLearningRecap', () => {
  it('does not claim progress when there is no evidence', () => {
    const recap = buildWeeklyLearningRecap({
      events: [],
      weeklyActivity: [],
      progress: [],
    });

    expect(recap.hasEvidence).toBe(false);
    expect(recap.wordsStrengthened).toBe(0);
    expect(recap.highlights).toEqual([]);
    expect(recap.nextRecommendation.href).toBe('/dashboard/today');
  });

  it('summarizes normal evidence-backed weekly progress', () => {
    const recap = buildWeeklyLearningRecap({
      events: [
        event('evidence.vocab.learned', { wordId: 'w1' }),
        event('evidence.review.rated', { wordId: 'w2', rating: 'good' }),
        event('evidence.practice.correct', { wordId: 'w3' }),
      ],
      weeklyActivity: [day({ words: 3, xp: 30, events: 3 }), day({ words: 1, xp: 10, events: 1 })],
      progress: [],
    });

    expect(recap.hasEvidence).toBe(true);
    expect(recap.wordsStrengthened).toBe(3);
    expect(recap.activeDays).toBe(2);
    expect(recap.strongestSkill?.count).toBeGreaterThan(0);
    expect(recap.highlights.map((item) => item.en).join(' ')).toContain('3 words');
  });

  it('prioritizes review when review debt is high', () => {
    const recap = buildWeeklyLearningRecap({
      events: [
        event('evidence.review.rated', { wordId: 'w1', rating: 'again' }),
        event('evidence.review.rated', { wordId: 'w2', rating: 'hard' }),
        event('review.stubborn_recovery', { wordId: 'w3', outcome: 'still_confusing' }),
      ],
      weeklyActivity: [day({ events: 3 })],
      progress: [progress({ wordId: 'w4' }), progress({ wordId: 'w5' })],
    });

    expect(recap.reviewDebtTrend.direction).toBe('up');
    expect(recap.weakestPattern?.label).toBe('Pending reviews');
    expect(recap.nextRecommendation.href).toBe('/dashboard/review');
  });
});

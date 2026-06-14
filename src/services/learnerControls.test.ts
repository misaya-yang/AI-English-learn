import { describe, expect, it } from 'vitest';
import type { LearnerModel } from '@/services/learnerModel';
import { applyLearnerControls } from './learnerControls';

const model = (overrides: Partial<LearnerModel> = {}): LearnerModel => ({
  userId: 'user-1',
  computedAt: '2026-06-13T00:00:00.000Z',
  mode: 'steady',
  avgRetrievability: 0.8,
  predictedRetention30d: 0.7,
  weakTopics: [],
  strongTopics: [],
  recommendedDailyNew: 18,
  recommendedDailyReview: 30,
  burnoutRisk: 0.1,
  dueCount: 24,
  avgStability: 8,
  stubbornWordCount: 0,
  stubbornTopics: [],
  ...overrides,
});

const settings = {
  dailyNewWordLimit: 10,
  maxReviewCount: 20,
  targetRetention: 0.9,
  examWeekBoost: false,
};

describe('applyLearnerControls', () => {
  it('caps new words and reviews by learner settings', () => {
    const controlled = applyLearnerControls(model(), settings);

    expect(controlled.recommendedDailyNew).toBe(10);
    expect(controlled.recommendedDailyReview).toBe(20);
  });

  it('uses high target retention to bias toward review over new words', () => {
    const controlled = applyLearnerControls(model({ recommendedDailyNew: 10, recommendedDailyReview: 10 }), {
      ...settings,
      targetRetention: 0.95,
    });

    expect(controlled.recommendedDailyNew).toBe(9);
    expect(controlled.recommendedDailyReview).toBe(15);
  });

  it('turns exam week boost into sprint mode when the learner is not overloaded', () => {
    const controlled = applyLearnerControls(model({ mode: 'steady', recommendedDailyNew: 4, recommendedDailyReview: 8 }), {
      ...settings,
      dailyNewWordLimit: 12,
      maxReviewCount: 24,
      examWeekBoost: true,
    });

    expect(controlled.mode).toBe('sprint');
    expect(controlled.recommendedDailyNew).toBe(12);
    expect(controlled.recommendedDailyReview).toBe(13);
  });

  it('does not force sprint mode when recovery is safer', () => {
    const controlled = applyLearnerControls(model({ mode: 'recovery', burnoutRisk: 0.2 }), {
      ...settings,
      examWeekBoost: true,
    });

    expect(controlled.mode).toBe('recovery');
  });
});

import type { UserSettings } from '@/types/core';
import type { LearnerModel } from '@/services/learnerModel';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function applyLearnerControls(
  model: LearnerModel,
  settings: Pick<UserSettings, 'dailyNewWordLimit' | 'maxReviewCount' | 'targetRetention' | 'examWeekBoost'>,
): LearnerModel {
  const dailyNewWordLimit = Math.round(clamp(settings.dailyNewWordLimit, 1, 50));
  const maxReviewCount = Math.round(clamp(settings.maxReviewCount, 5, 100));
  const targetRetention = clamp(settings.targetRetention, 0.8, 0.97);

  let mode = model.mode;
  let recommendedDailyNew = clamp(model.recommendedDailyNew, 0, dailyNewWordLimit);
  let recommendedDailyReview = clamp(model.recommendedDailyReview, 0, maxReviewCount);

  if (targetRetention >= 0.93) {
    const reviewBoost = Math.ceil((targetRetention - 0.9) * 100);
    recommendedDailyReview = clamp(recommendedDailyReview + reviewBoost, 5, maxReviewCount);
    recommendedDailyNew = clamp(Math.floor(recommendedDailyNew * 0.9), 0, dailyNewWordLimit);
  }

  if (settings.examWeekBoost && mode !== 'recovery' && model.burnoutRisk < 0.75) {
    mode = 'sprint';
    recommendedDailyNew = clamp(Math.max(recommendedDailyNew, Math.ceil(dailyNewWordLimit * 1.15)), 1, dailyNewWordLimit);
    recommendedDailyReview = clamp(recommendedDailyReview + 5, 8, maxReviewCount);
  }

  return {
    ...model,
    mode,
    recommendedDailyNew,
    recommendedDailyReview,
  };
}

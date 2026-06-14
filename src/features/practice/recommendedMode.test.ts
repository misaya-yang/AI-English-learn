import { describe, expect, it } from 'vitest';
import { getRecommendedPracticeMode, isStylePracticeRecommendation } from './recommendedMode';

describe('getRecommendedPracticeMode', () => {
  it('keeps due review pressure above learning style preferences', () => {
    expect(getRecommendedPracticeMode({
      dueWordCount: 8,
      dailyWordCount: 10,
      learningStyle: 'auditory',
    })).toEqual({ modeId: 'quiz', reason: 'due_reviews' });
  });

  it('maps learning styles into different default practice modes', () => {
    expect(getRecommendedPracticeMode({ dueWordCount: 0, dailyWordCount: 8, learningStyle: 'visual' })).toEqual({
      modeId: 'quiz',
      reason: 'style_visual',
    });
    expect(getRecommendedPracticeMode({ dueWordCount: 0, dailyWordCount: 8, learningStyle: 'auditory' })).toEqual({
      modeId: 'listening',
      reason: 'style_auditory',
    });
    expect(getRecommendedPracticeMode({ dueWordCount: 0, dailyWordCount: 8, learningStyle: 'kinesthetic' })).toEqual({
      modeId: 'fill_blank',
      reason: 'style_kinesthetic',
    });
    expect(getRecommendedPracticeMode({ dueWordCount: 0, dailyWordCount: 8, learningStyle: 'reading' })).toEqual({
      modeId: 'writing',
      reason: 'style_reading',
    });
  });

  it('falls back to content-aware defaults when a style mode does not have enough material', () => {
    expect(getRecommendedPracticeMode({ dueWordCount: 0, dailyWordCount: 2, learningStyle: 'auditory' })).toEqual({
      modeId: 'writing',
      reason: 'fallback_output',
    });
  });

  it('identifies style-driven recommendations for UI copy', () => {
    expect(isStylePracticeRecommendation('style_reading')).toBe(true);
    expect(isStylePracticeRecommendation('due_reviews')).toBe(false);
  });
});

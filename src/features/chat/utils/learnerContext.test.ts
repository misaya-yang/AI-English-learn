import { describe, expect, it } from 'vitest';

import { normalizeLearningContext } from '@/features/coach/coachingPolicy';
import type { LearnerModel } from '@/services/learnerModel';
import type { MistakeEntry } from '@/services/mistakeCollector';
import type { LearningProfile } from '@/types/examContent';

import {
  buildChatLearnerProfile,
  mapBurnoutBucket,
  mapMistakeCategoryToErrorType,
} from './learnerContext';

const baseProfile: LearningProfile = {
  userId: 'u_1',
  level: 'B1',
  target: 'IELTS 6.5',
  tracks: ['exam_boost'],
  dailyMinutes: 25,
  languagePreference: 'bilingual',
  updatedAt: '2026-04-25T00:00:00.000Z',
};

const baseModel: LearnerModel = {
  userId: 'u_1',
  computedAt: '2026-04-25T00:00:00.000Z',
  mode: 'maintenance',
  avgRetrievability: 0.71,
  predictedRetention30d: 62,
  weakTopics: ['psychology'],
  strongTopics: ['daily life'],
  recommendedDailyNew: 5,
  recommendedDailyReview: 14,
  burnoutRisk: 0.42,
  dueCount: 12,
  avgStability: 8.4,
  stubbornWordCount: 3,
  stubbornTopics: ['psychology', 'business'],
};

const mistake = (overrides: Partial<MistakeEntry>): MistakeEntry => ({
  id: overrides.id ?? `m_${Math.random().toString(36).slice(2, 7)}`,
  source: overrides.source ?? 'practice',
  word: overrides.word ?? 'aberration',
  correctAnswer: overrides.correctAnswer ?? 'aberration',
  userAnswer: overrides.userAnswer ?? 'aborration',
  category: overrides.category ?? 'Grammar',
  severity: overrides.severity ?? 'medium',
  createdAt: overrides.createdAt ?? Date.now(),
  reviewCount: overrides.reviewCount ?? 0,
  eliminated: overrides.eliminated ?? false,
});

describe('mapBurnoutBucket', () => {
  it('returns undefined for non-numeric input', () => {
    expect(mapBurnoutBucket(undefined)).toBeUndefined();
    expect(mapBurnoutBucket(Number.NaN)).toBeUndefined();
    expect(mapBurnoutBucket(Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it('clamps and buckets the score', () => {
    expect(mapBurnoutBucket(-0.4)).toBe('low');
    expect(mapBurnoutBucket(0)).toBe('low');
    expect(mapBurnoutBucket(0.33)).toBe('low');
    expect(mapBurnoutBucket(0.34)).toBe('medium');
    expect(mapBurnoutBucket(0.66)).toBe('medium');
    expect(mapBurnoutBucket(0.67)).toBe('high');
    expect(mapBurnoutBucket(1.4)).toBe('high');
  });
});

describe('mapMistakeCategoryToErrorType', () => {
  it('returns canonical names directly', () => {
    expect(mapMistakeCategoryToErrorType('grammar')).toBe('grammar');
    expect(mapMistakeCategoryToErrorType('Vocab')).toBe('vocab');
    expect(mapMistakeCategoryToErrorType('PRONUNCIATION')).toBe('pronunciation');
  });

  it('buckets free-form labels into the canonical set', () => {
    expect(mapMistakeCategoryToErrorType('articles')).toBe('grammar');
    expect(mapMistakeCategoryToErrorType('Tenses')).toBe('grammar');
    expect(mapMistakeCategoryToErrorType('Vocabulary')).toBe('vocab');
    expect(mapMistakeCategoryToErrorType('collocations')).toBe('vocab');
    expect(mapMistakeCategoryToErrorType('Stress and Intonation')).toBe('pronunciation');
    expect(mapMistakeCategoryToErrorType('Listening Dictation')).toBe('listening');
    expect(mapMistakeCategoryToErrorType('Argument Coherence')).toBe('logic');
    expect(mapMistakeCategoryToErrorType('Polite Register')).toBe('pragmatic');
  });

  it('returns undefined for unknown categories and bad input', () => {
    expect(mapMistakeCategoryToErrorType('miscellaneous')).toBeUndefined();
    expect(mapMistakeCategoryToErrorType('')).toBeUndefined();
    // @ts-expect-error guard against runtime non-string input
    expect(mapMistakeCategoryToErrorType(undefined)).toBeUndefined();
  });
});

describe('buildChatLearnerProfile', () => {
  it('falls back gracefully when only the learning profile is supplied', () => {
    const result = buildChatLearnerProfile({ learningProfile: baseProfile });
    expect(result).toEqual({
      level: 'B1',
      target: 'IELTS 6.5',
      examType: 'IELTS',
      dailyMinutes: 25,
    });
  });

  it('drops empty target / non-positive dailyMinutes', () => {
    const result = buildChatLearnerProfile({
      learningProfile: {
        ...baseProfile,
        target: '   ',
        dailyMinutes: 0,
      },
    });
    expect(result).toEqual({ level: 'B1' });
  });

  it('promotes weakTags to canonical weaknessTags and dedupes', () => {
    const result = buildChatLearnerProfile({
      learningProfile: baseProfile,
      weakTags: ['ielts_writing', 'ielts_writing', '  collocations  ', '', 'review_pressure'],
    });
    expect(result.weaknessTags).toEqual(['ielts_writing', 'collocations', 'review_pressure']);
  });

  it('maps the learnerModel snapshot into the policy fields', () => {
    const result = buildChatLearnerProfile({
      learningProfile: baseProfile,
      learnerModel: baseModel,
    });
    expect(result.dueCount).toBe(12);
    expect(result.learnerMode).toBe('maintenance');
    expect(result.burnoutRisk).toBe('medium');
    expect(result.recommendedDailyReview).toBe(14);
    expect(result.predictedRetention30d).toBeCloseTo(0.62, 5);
    expect(result.stubbornTopics).toEqual(['psychology', 'business']);
  });

  it('accepts a 0–1 predictedRetention without re-scaling', () => {
    const result = buildChatLearnerProfile({
      learningProfile: baseProfile,
      learnerModel: { ...baseModel, predictedRetention30d: 0.78 },
    });
    expect(result.predictedRetention30d).toBeCloseTo(0.78, 5);
  });

  it('drops eliminated mistakes and orders by recency, capped at 6', () => {
    const now = Date.now();
    const recentMistakes: MistakeEntry[] = [
      mistake({ word: 'old', createdAt: now - 10_000_000 }),
      mistake({ word: 'mid', createdAt: now - 5_000_000 }),
      mistake({ word: 'newest', createdAt: now }),
      mistake({ word: 'eliminated', createdAt: now - 1_000, eliminated: true }),
      mistake({ word: 'pron', category: 'Pronunciation', userAnswer: 'wrang', correctAnswer: 'wrong', createdAt: now - 100 }),
      mistake({ word: 'extra1', createdAt: now - 200 }),
      mistake({ word: 'extra2', createdAt: now - 300 }),
      mistake({ word: 'extra3', createdAt: now - 400 }),
    ];
    const result = buildChatLearnerProfile({
      learningProfile: baseProfile,
      recentMistakes,
    });
    expect(result.recentErrors?.length).toBe(6);
    expect(result.recentErrors?.[0].word).toBe('newest');
    expect(result.recentErrors?.find((entry) => entry.word === 'eliminated')).toBeUndefined();
    const pronEntry = result.recentErrors?.find((entry) => entry.word === 'pron');
    expect(pronEntry?.skill).toBe('pronunciation');
    expect(pronEntry?.errorType).toBe('pronunciation');
    expect(pronEntry?.note).toBe('wrote "wrang" (expected "wrong")');
  });

  it('omits skill but keeps the word for unknown mistake categories', () => {
    const result = buildChatLearnerProfile({
      learningProfile: baseProfile,
      recentMistakes: [mistake({ word: 'hapax', category: 'Miscellaneous' })],
    });
    expect(result.recentErrors?.[0]).toMatchObject({ word: 'hapax' });
    expect(result.recentErrors?.[0].skill).toBeUndefined();
    expect(result.recentErrors?.[0].errorType).toBeUndefined();
  });

  it('produces output that survives normalizeLearningContext untouched', () => {
    const profile = buildChatLearnerProfile({
      learningProfile: baseProfile,
      weakTags: ['ielts_writing', 'collocations'],
      learnerModel: baseModel,
      recentMistakes: [mistake({ word: 'aberration', category: 'Grammar' })],
    });
    const normalized = normalizeLearningContext(profile);
    expect(normalized.level).toBe('B1');
    expect(normalized.target).toBe('IELTS 6.5');
    expect(normalized.examType).toBe('IELTS');
    expect(normalized.weaknessTags).toEqual(['ielts_writing', 'collocations']);
    expect(normalized.learnerMode).toBe('maintenance');
    expect(normalized.burnoutRisk).toBe('medium');
    expect(normalized.dueCount).toBe(12);
    expect(normalized.recommendedDailyReview).toBe(14);
    expect(normalized.recentErrors?.[0]).toMatchObject({
      word: 'aberration',
      skill: 'grammar',
      errorType: 'grammar',
    });
  });

  it('still keeps legacy weakTags compatibility when both fields are normalized together', () => {
    // Simulates a caller that supplies both legacy `weakTags` and canonical
    // `weaknessTags` on the LearnerContext payload — the request payload does
    // exactly this. The canonical field wins; the legacy field is merged in
    // by `normalizeLearningContext` so callers that only set `weakTags`
    // remain compatible.
    const profile = buildChatLearnerProfile({
      learningProfile: baseProfile,
      weakTags: ['canonical_one'],
    });
    const merged = normalizeLearningContext({
      ...profile,
      weakTags: ['legacy_one', 'canonical_one'],
    });
    expect(merged.weaknessTags).toEqual(['canonical_one', 'legacy_one']);
  });
});

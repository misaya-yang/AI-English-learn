import { describe, expect, it } from 'vitest';
import { BUILT_IN_WORD_BOOK_IDS, getBuiltInWordBooks } from '@/data/wordBooks';
import { buildOnboardingPlacement, type OnboardingPlacementInput } from './onboardingPlacement';

const baseInput: OnboardingPlacementInput = {
  cefrLevel: 'B1',
  examTarget: 'general',
  deadline: 'none',
  dailyGoal: 10,
  dailyMinutes: 25,
  preferredTopics: ['Daily Life', 'Business'],
  learningStyle: 'visual',
};

describe('buildOnboardingPlacement', () => {
  it('keeps a C1 IELTS learner out of the A1 starter book', () => {
    const placement = buildOnboardingPlacement({
      ...baseInput,
      cefrLevel: 'C1',
      examTarget: 'ielts',
      targetBand: 'IELTS 7.5',
      deadline: '1_3_months',
      preferredTopics: ['Academic', 'Business'],
      dailyMinutes: 45,
    });

    expect(placement.starterBookId).toBe(BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    expect(placement.starterBookId).not.toBe(BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION);
    expect(placement.learningPathId).toBe('ielts-prep');
    expect(placement.learningProfile).toMatchObject({
      level: 'C1',
      target: 'IELTS 7.5',
      dailyMinutes: 45,
      learningStyle: 'visual',
    });
    expect(placement.learningProfile.tracks).toContain('exam_boost');
    expect(placement.reasons.some((reason) => reason.en.includes('IELTS'))).toBe(true);
  });

  it('places a beginner general learner safely in A1 foundation', () => {
    const placement = buildOnboardingPlacement({
      ...baseInput,
      cefrLevel: 'A1',
      preferredTopics: ['Daily Life', 'Food'],
      dailyGoal: 5,
      dailyMinutes: 15,
    });

    expect(placement.starterBookId).toBe(BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION);
    expect(placement.learningPathId).toBe('daily-english');
    expect(placement.learningProfile).toMatchObject({
      level: 'A1',
      target: 'general_improvement',
      dailyMinutes: 15,
    });
    expect(placement.learningProfile.tracks).toContain('daily_communication');
  });

  it('routes business learners to the business book before generic level fallback', () => {
    const placement = buildOnboardingPlacement({
      ...baseInput,
      cefrLevel: 'B2',
      preferredTopics: ['Business', 'Daily Life'],
    });

    expect(placement.starterBookId).toBe(BUILT_IN_WORD_BOOK_IDS.BUSINESS_ENGLISH);
    expect(placement.learningPathId).toBe('business-english');
    expect(placement.learningProfile.tracks).toContain('workplace_english');
  });

  it('clamps unrealistic daily minutes before saving the learning profile', () => {
    const placement = buildOnboardingPlacement({
      ...baseInput,
      dailyMinutes: 120,
    });

    expect(placement.learningProfile.dailyMinutes).toBe(90);
    expect(placement.reasons.some((reason) => reason.en.includes('90 minutes'))).toBe(true);
  });

  it('creates a non-empty IELTS academic built-in book', () => {
    const book = getBuiltInWordBooks().find((item) => item.id === BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);

    expect(book).toBeDefined();
    expect(book?.wordIds.length).toBeGreaterThan(0);
    expect(book?.levelRange).toEqual(['B1', 'B2', 'C1']);
  });
});

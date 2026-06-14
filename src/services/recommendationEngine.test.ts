import { describe, it, expect } from 'vitest';
import { generateRecommendations, type RecommendationInput } from './recommendationEngine';

const baseInput: RecommendationInput = {
  dueWordCount: 0,
  weakTopics: [],
  strongTopics: [],
  dailyGoal: 10,
  wordsLearnedToday: 10,
  streakDays: 5,
  cefrLevel: 'B1',
  recentPracticeTypes: [],
};

describe('recommendationEngine', () => {
  it('returns at most 3 recommendations', () => {
    const recs = generateRecommendations({
      ...baseInput,
      dueWordCount: 20,
      wordsLearnedToday: 0,
      weakTopics: ['vocabulary'],
    });
    expect(recs.length).toBeLessThanOrEqual(3);
  });

  it('prioritizes due reviews', () => {
    const recs = generateRecommendations({ ...baseInput, dueWordCount: 15 });
    expect(recs[0].type).toBe('review');
    expect(recs[0].priority).toBe(0);
  });

  it('suggests new words when daily goal not met', () => {
    const recs = generateRecommendations({ ...baseInput, wordsLearnedToday: 3 });
    const newWordsRec = recs.find((r) => r.type === 'new_words');
    expect(newWordsRec).toBeDefined();
  });

  it('suggests weak topic practice', () => {
    const recs = generateRecommendations({ ...baseInput, weakTopics: ['grammar'] });
    const practiceRec = recs.find((r) => r.type === 'practice');
    expect(practiceRec).toBeDefined();
    expect(practiceRec?.title).toContain('grammar');
  });

  it('suggests skill variety for missing types', () => {
    const recs = generateRecommendations({
      ...baseInput,
      recentPracticeTypes: ['reading', 'listening'],
    });
    const varietyRec = recs.find((r) => ['writing', 'pronunciation', 'grammar'].includes(r.type));
    expect(varietyRec).toBeDefined();
  });

  it('uses learning style to select the visible modality recommendation', () => {
    const auditory = generateRecommendations({
      ...baseInput,
      learningStyle: 'auditory',
      recentPracticeTypes: [],
    });
    const kinesthetic = generateRecommendations({
      ...baseInput,
      learningStyle: 'kinesthetic',
      recentPracticeTypes: [],
    });

    expect(auditory[0].type).toBe('listening');
    expect(auditory[0].reason).toContain('auditory');
    expect(kinesthetic[0].type).toBe('practice');
    expect(kinesthetic[0].reason).toContain('kinesthetic');
  });

  it('changes visible recommendation rationale between A1 and C1 learners', () => {
    const beginner = generateRecommendations({
      ...baseInput,
      cefrLevel: 'A1',
      learningStyle: 'visual',
      recentPracticeTypes: [],
    });
    const advanced = generateRecommendations({
      ...baseInput,
      cefrLevel: 'C1',
      learningStyle: 'visual',
      recentPracticeTypes: [],
    });

    expect(beginner[0].reason).toContain('A1 foundation');
    expect(advanced[0].reason).toContain('C1 advanced');
  });

  it('prioritizes exam-facing practice for B2+ IELTS learners', () => {
    const recs = generateRecommendations({
      ...baseInput,
      cefrLevel: 'C1',
      target: 'IELTS 7.5',
      learningStyle: 'reading',
      recentPracticeTypes: [],
    });

    expect(recs[0]).toEqual(expect.objectContaining({
      type: 'writing',
      action: '/dashboard/exam',
      priority: 2,
    }));
    expect(recs[0].title).toContain('C1 exam');
  });

  it('falls back safely when CEFR is missing or invalid', () => {
    const recs = generateRecommendations({
      ...baseInput,
      cefrLevel: 'not-a-level',
      recentPracticeTypes: [],
    });

    expect(recs[0].reason).toContain('B1');
    expect(recs[0].action).toMatch(/^\/dashboard\//);
  });

  it('returns sorted by priority', () => {
    const recs = generateRecommendations({
      ...baseInput,
      dueWordCount: 5,
      wordsLearnedToday: 0,
      weakTopics: ['pronunciation'],
    });
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i].priority).toBeGreaterThanOrEqual(recs[i - 1].priority);
    }
  });

  it('all recommendations have required fields', () => {
    const recs = generateRecommendations({
      ...baseInput,
      dueWordCount: 10,
      wordsLearnedToday: 0,
    });
    for (const r of recs) {
      expect(r.id).toBeTruthy();
      expect(r.title).toBeTruthy();
      expect(r.titleZh).toBeTruthy();
      expect(r.action).toMatch(/^\/dashboard\//);
      expect(r.estimatedMinutes).toBeGreaterThan(0);
    }
  });
});

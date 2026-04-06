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

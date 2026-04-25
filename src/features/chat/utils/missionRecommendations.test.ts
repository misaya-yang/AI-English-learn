import { describe, expect, it } from 'vitest';

import { buildMissionRecommendations } from './missionRecommendations';

describe('buildMissionRecommendations', () => {
  it('returns three beginner-friendly fallback cards when no context is supplied', () => {
    const cards = buildMissionRecommendations();
    expect(cards.length).toBe(3);
    expect(cards.every((card) => card.id.startsWith('fallback-'))).toBe(true);
    expect(cards[0].variant).toBe('today');
  });

  it('returns the same fallback cards for empty context object', () => {
    const cards = buildMissionRecommendations({});
    expect(cards.map((card) => card.id)).toEqual([
      'fallback-greetings',
      'fallback-roleplay-coffee',
      'fallback-mini-quiz',
    ]);
  });

  it('promotes the review-pressure card and tags it recovery when backlog is high', () => {
    const cards = buildMissionRecommendations({ dueCount: 14 });
    const review = cards.find((card) => card.id === 'review-pressure');
    expect(review).toBeDefined();
    expect(review?.variant).toBe('recovery');
    expect(review?.title.en).toContain('14');
    expect(review?.estimatedMinutes).toBeGreaterThanOrEqual(12);
  });

  it('returns the review-pressure card with review variant when backlog is moderate', () => {
    const cards = buildMissionRecommendations({ dueCount: 5 });
    const review = cards.find((card) => card.id === 'review-pressure');
    expect(review?.variant).toBe('review');
  });

  it('does not include review-pressure when dueCount < 3', () => {
    const cards = buildMissionRecommendations({ dueCount: 2, level: 'B1' });
    expect(cards.find((card) => card.id === 'review-pressure')).toBeUndefined();
    expect(cards.find((card) => card.id === 'level-b1')).toBeDefined();
  });

  it('surfaces the first incomplete daily mission task', () => {
    const cards = buildMissionRecommendations({ incompleteTasks: ['writing', 'review'] });
    expect(cards[0].id).toBe('mission-writing');
    expect(cards[0].title.en).toMatch(/writing/i);
    expect(cards[1].id).toBe('mission-review');
  });

  it('promotes IELTS sprint when hasExamGoal is true', () => {
    const cards = buildMissionRecommendations({ hasExamGoal: true });
    expect(cards.find((card) => card.id === 'exam-boost')).toBeDefined();
  });

  it('promotes IELTS sprint when examType is set', () => {
    const cards = buildMissionRecommendations({ examType: 'IELTS' });
    const examCard = cards.find((card) => card.id === 'exam-boost');
    expect(examCard?.variant).toBe('sprint');
  });

  it('appends a level-tip card when slots remain', () => {
    const cards = buildMissionRecommendations({ level: 'C1' });
    const levelCard = cards.find((card) => card.id === 'level-c1');
    expect(levelCard).toBeDefined();
    expect(levelCard?.title.en).toMatch(/advanced/i);
  });

  it('caps output at 3 cards even when many signals are present', () => {
    const cards = buildMissionRecommendations({
      dueCount: 14,
      incompleteTasks: ['writing', 'quiz', 'review', 'vocabulary'],
      hasExamGoal: true,
      level: 'B2',
    });
    expect(cards.length).toBe(3);
    expect(cards[0].id).toBe('review-pressure');
  });

  it('skips unknown daily-task names without crashing', () => {
    const cards = buildMissionRecommendations({
      incompleteTasks: ['unknown-task', 'writing'],
    });
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.find((card) => card.id === 'mission-writing')).toBeDefined();
  });

  it('treats empty/none examType as not exam-focused', () => {
    const cardsNone = buildMissionRecommendations({ examType: 'none' });
    const cardsBlank = buildMissionRecommendations({ examType: '   ' });
    expect(cardsNone.find((card) => card.id === 'exam-boost')).toBeUndefined();
    expect(cardsBlank.find((card) => card.id === 'exam-boost')).toBeUndefined();
  });

  it('clamps a non-finite dueCount instead of throwing', () => {
    const cards = buildMissionRecommendations({ dueCount: Number.NaN });
    expect(cards[0].id.startsWith('fallback-')).toBe(true);
  });
});

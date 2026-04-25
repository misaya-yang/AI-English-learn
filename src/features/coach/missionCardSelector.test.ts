import { describe, expect, it } from 'vitest';
import { selectMissionCards } from './missionCardSelector';

describe('selectMissionCards', () => {
  it('returns three beginner fallbacks for an empty profile', () => {
    const cards = selectMissionCards(undefined);
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.id)).toEqual([
      'fallback.warmup',
      'fallback.coach',
      'fallback.memory',
    ]);
    for (const card of cards) {
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.whyRecommended.length).toBeGreaterThan(0);
      expect(card.prompt.length).toBeGreaterThan(0);
      expect(['practice', 'coach', 'exam', 'memory']).toContain(card.accent);
    }
  });

  it('returns fallbacks for a profile with no signal', () => {
    const cards = selectMissionCards({
      level: '',
      dueCount: 0,
      weaknessTags: [],
      hasExamGoal: false,
      burnoutRisk: 0,
    });
    expect(cards).toHaveLength(3);
    expect(cards[0].id).toBe('fallback.warmup');
  });

  it('includes a review card when there are due reviews', () => {
    const cards = selectMissionCards({ dueCount: 7 });
    const review = cards.find((c) => c.id === 'mission.review');
    expect(review).toBeDefined();
    expect(review?.prompt).toContain('7 words');
    expect(review?.accent).toBe('memory');
  });

  it('uses singular grammar when exactly one review is due', () => {
    const cards = selectMissionCards({ dueCount: 1 });
    const review = cards.find((c) => c.id === 'mission.review');
    expect(review?.title).toContain('1 due review');
    expect(review?.title).not.toContain('reviews');
  });

  it('includes weakness practice when weakness tags are present', () => {
    const cards = selectMissionCards({
      weaknessTags: ['articles', 'past tense', 'prepositions'],
    });
    const weakness = cards.find((c) => c.id === 'mission.weakness');
    expect(weakness).toBeDefined();
    // Only the first two weaknesses get surfaced.
    expect(weakness?.title).toContain('articles, past tense');
    expect(weakness?.title).not.toContain('prepositions');
  });

  it('adds an exam card when hasExamGoal is true', () => {
    const cards = selectMissionCards({ hasExamGoal: true });
    const exam = cards.find((c) => c.id === 'mission.exam');
    expect(exam).toBeDefined();
    expect(exam?.accent).toBe('exam');
  });

  it('surfaces a recovery card when burnout risk is high', () => {
    const cards = selectMissionCards({
      burnoutRisk: 0.8,
      dueCount: 5,
      hasExamGoal: true,
    });
    expect(cards[0].id).toBe('mission.lighten');
    expect(cards.length).toBeLessThanOrEqual(4);
  });

  it('caps the result at four cards', () => {
    const cards = selectMissionCards({
      level: 'B2',
      dueCount: 12,
      weaknessTags: ['collocations'],
      hasExamGoal: true,
      burnoutRisk: 0.7,
    });
    expect(cards.length).toBe(4);
  });

  it('mentions the learner level in the planning fallback when light profile', () => {
    const cards = selectMissionCards({ level: 'B1' });
    const coach = cards.find((c) => c.id === 'mission.coach');
    expect(coach).toBeDefined();
    expect(coach?.title).toContain('B1');
    expect(coach?.prompt).toContain('B1');
  });

  it('produces at least three cards for a sparse but non-empty profile', () => {
    const cards = selectMissionCards({ level: 'A2' });
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });
});

import { describe, it, expect } from 'vitest';
import {
  grammarPoints,
  getGrammarById,
  getGrammarByLevel,
} from './grammarContent';

describe('grammarContent', () => {
  it('has at least 10 grammar points', () => {
    expect(grammarPoints.length).toBeGreaterThanOrEqual(10);
  });

  it('all grammar points have exactly 10 exercises', () => {
    for (const gp of grammarPoints) {
      expect(gp.exercises.length).toBe(10);
    }
  });

  it('all grammar points have exactly 3 correct examples', () => {
    for (const gp of grammarPoints) {
      expect(gp.correctExamples.length).toBe(3);
    }
  });

  it('all grammar points have exactly 3 incorrect examples', () => {
    for (const gp of grammarPoints) {
      expect(gp.incorrectExamples.length).toBe(3);
    }
  });

  it('exercises have valid types', () => {
    const validTypes = new Set(['choice', 'fill', 'correction', 'reorder', 'translate']);
    for (const gp of grammarPoints) {
      for (const ex of gp.exercises) {
        expect(validTypes.has(ex.type)).toBe(true);
      }
    }
  });

  it('choice exercises all have options', () => {
    for (const gp of grammarPoints) {
      for (const ex of gp.exercises) {
        if (ex.type === 'choice') {
          expect(ex.options).toBeDefined();
          expect(ex.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('spans at least 4 CEFR levels', () => {
    const levels = new Set(grammarPoints.map((g) => g.level));
    expect(levels.size).toBeGreaterThanOrEqual(4);
  });

  describe('getGrammarById', () => {
    it('returns the correct grammar point for a known id', () => {
      const gp = getGrammarById('gp-001');
      expect(gp).toBeDefined();
      expect(gp?.title).toBe('Present Simple: To Be');
    });

    it('returns undefined for an unknown id', () => {
      expect(getGrammarById('gp-999')).toBeUndefined();
    });
  });

  describe('getGrammarByLevel', () => {
    it('returns only grammar points of the given level', () => {
      const b2Points = getGrammarByLevel('B2');
      for (const gp of b2Points) {
        expect(gp.level).toBe('B2');
      }
    });

    it('returns at least one A1 grammar point', () => {
      expect(getGrammarByLevel('A1').length).toBeGreaterThan(0);
    });
  });
});

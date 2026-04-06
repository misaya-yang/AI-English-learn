import { describe, it, expect } from 'vitest';
import { placementQuestions, computeCefrFromAnswers } from './placementQuestions';

describe('placementQuestions', () => {
  it('has exactly 10 questions', () => {
    expect(placementQuestions.length).toBe(10);
  });

  it('all questions have valid correctIndex', () => {
    for (const q of placementQuestions) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });

  it('covers all CEFR levels', () => {
    const levels = new Set(placementQuestions.map((q) => q.level));
    expect(levels).toContain('A1');
    expect(levels).toContain('B1');
    expect(levels).toContain('C1');
  });

  describe('computeCefrFromAnswers', () => {
    it('returns A1 when all wrong', () => {
      const answers: Record<number, number> = {};
      for (const q of placementQuestions) {
        answers[q.id] = (q.correctIndex + 1) % q.options.length;
      }
      expect(computeCefrFromAnswers(answers)).toBe('A1');
    });

    it('returns C2 when all correct', () => {
      const answers: Record<number, number> = {};
      for (const q of placementQuestions) {
        answers[q.id] = q.correctIndex;
      }
      expect(computeCefrFromAnswers(answers)).toBe('C2');
    });

    it('returns B1 when only A1-B1 correct', () => {
      const answers: Record<number, number> = {};
      for (const q of placementQuestions) {
        if (['A1', 'A2', 'B1'].includes(q.level)) {
          answers[q.id] = q.correctIndex;
        } else {
          answers[q.id] = (q.correctIndex + 1) % q.options.length;
        }
      }
      expect(computeCefrFromAnswers(answers)).toBe('B1');
    });
  });
});

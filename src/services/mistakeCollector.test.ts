import { describe, it, expect, beforeEach } from 'vitest';
import {
  addMistake,
  getMistakes,
  markMistakeReviewed,
  eliminateMistake,
  getMistakeStats,
  clearAllMistakes,
} from './mistakeCollector';

// Use a fresh localStorage state before each test
beforeEach(() => {
  clearAllMistakes();
});

const sampleBase = {
  source: 'practice' as const,
  word: 'ephemeral',
  correctAnswer: 'lasting for a very short time',
  userAnswer: 'permanent',
  category: 'Vocabulary',
  severity: 'medium' as const,
};

describe('mistakeCollector', () => {
  describe('addMistake', () => {
    it('creates a new mistake with correct defaults', () => {
      const entry = addMistake(sampleBase);
      expect(entry.id).toBeTruthy();
      expect(entry.reviewCount).toBe(0);
      expect(entry.eliminated).toBe(false);
      expect(entry.createdAt).toBeGreaterThan(0);
    });

    it('persists the mistake so getMistakes returns it', () => {
      addMistake(sampleBase);
      const list = getMistakes();
      expect(list.length).toBe(1);
      expect(list[0].word).toBe('ephemeral');
    });

    it('accumulates multiple mistakes', () => {
      addMistake(sampleBase);
      addMistake({ ...sampleBase, word: 'ubiquitous', source: 'pronunciation' });
      expect(getMistakes().length).toBe(2);
    });
  });

  describe('getMistakes', () => {
    beforeEach(() => {
      addMistake(sampleBase);
      addMistake({ ...sampleBase, word: 'laconic', source: 'roleplay', category: 'Grammar' });
      addMistake({ ...sampleBase, word: 'terse', source: 'manual', category: 'Grammar' });
    });

    it('returns all mistakes when no filter is provided', () => {
      expect(getMistakes().length).toBe(3);
    });

    it('filters by source', () => {
      const result = getMistakes({ source: 'roleplay' });
      expect(result.length).toBe(1);
      expect(result[0].word).toBe('laconic');
    });

    it('filters by category', () => {
      const result = getMistakes({ category: 'Grammar' });
      expect(result.length).toBe(2);
    });

    it('filters by eliminated status', () => {
      const all = getMistakes();
      eliminateMistake(all[0].id);
      expect(getMistakes({ eliminated: true }).length).toBe(1);
      expect(getMistakes({ eliminated: false }).length).toBe(2);
    });
  });

  describe('markMistakeReviewed', () => {
    it('increments reviewCount by 1', () => {
      const entry = addMistake(sampleBase);
      const updated = markMistakeReviewed(entry.id);
      expect(updated?.reviewCount).toBe(1);
    });

    it('increments reviewCount on repeated calls', () => {
      const entry = addMistake(sampleBase);
      markMistakeReviewed(entry.id);
      const updated = markMistakeReviewed(entry.id);
      expect(updated?.reviewCount).toBe(2);
    });

    it('returns undefined for unknown id', () => {
      expect(markMistakeReviewed('nonexistent_id')).toBeUndefined();
    });
  });

  describe('eliminateMistake', () => {
    it('sets eliminated to true', () => {
      const entry = addMistake(sampleBase);
      const updated = eliminateMistake(entry.id);
      expect(updated?.eliminated).toBe(true);
    });

    it('persists the elimination', () => {
      const entry = addMistake(sampleBase);
      eliminateMistake(entry.id);
      const list = getMistakes();
      expect(list[0].eliminated).toBe(true);
    });

    it('returns undefined for unknown id', () => {
      expect(eliminateMistake('nonexistent_id')).toBeUndefined();
    });
  });

  describe('getMistakeStats', () => {
    it('returns zeros when no mistakes exist', () => {
      const stats = getMistakeStats();
      expect(stats.total).toBe(0);
      expect(stats.eliminatedCount).toBe(0);
      expect(stats.trend).toHaveLength(7);
    });

    it('counts total correctly', () => {
      addMistake(sampleBase);
      addMistake({ ...sampleBase, source: 'pronunciation' });
      expect(getMistakeStats().total).toBe(2);
    });

    it('counts bySource correctly', () => {
      addMistake({ ...sampleBase, source: 'practice' });
      addMistake({ ...sampleBase, source: 'practice' });
      addMistake({ ...sampleBase, source: 'pronunciation' });
      const stats = getMistakeStats();
      expect(stats.bySource.practice).toBe(2);
      expect(stats.bySource.pronunciation).toBe(1);
      expect(stats.bySource.roleplay).toBe(0);
    });

    it('counts byCategory correctly', () => {
      addMistake({ ...sampleBase, category: 'Vocabulary' });
      addMistake({ ...sampleBase, category: 'Grammar' });
      addMistake({ ...sampleBase, category: 'Vocabulary' });
      const stats = getMistakeStats();
      expect(stats.byCategory['Vocabulary']).toBe(2);
      expect(stats.byCategory['Grammar']).toBe(1);
    });

    it('counts eliminatedCount correctly', () => {
      const e1 = addMistake(sampleBase);
      addMistake({ ...sampleBase, word: 'second' });
      eliminateMistake(e1.id);
      const stats = getMistakeStats();
      expect(stats.eliminatedCount).toBe(1);
    });

    it('trend has 7 entries and today\'s mistakes appear in the last slot', () => {
      addMistake(sampleBase);
      addMistake({ ...sampleBase, word: 'second' });
      const stats = getMistakeStats();
      expect(stats.trend).toHaveLength(7);
      expect(stats.trend[6]).toBe(2);
    });
  });
});

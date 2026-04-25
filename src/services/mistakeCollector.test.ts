import { describe, it, expect, beforeEach } from 'vitest';
import {
  addMistake,
  getMistakes,
  markMistakeReviewed,
  eliminateMistake,
  getMistakeStats,
  clearAllMistakes,
} from './mistakeCollector';

const USER = 'test-user-mistakes';

beforeEach(async () => {
  await clearAllMistakes(USER);
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
    it('creates a new mistake with correct defaults', async () => {
      const entry = await addMistake(USER, sampleBase);
      expect(entry.id).toBeTruthy();
      expect(entry.reviewCount).toBe(0);
      expect(entry.eliminated).toBe(false);
      expect(entry.createdAt).toBeGreaterThan(0);
    });

    it('persists the mistake so getMistakes returns it', async () => {
      await addMistake(USER, sampleBase);
      const list = await getMistakes(USER);
      expect(list.length).toBe(1);
      expect(list[0].word).toBe('ephemeral');
    });

    it('accumulates multiple mistakes', async () => {
      await addMistake(USER, sampleBase);
      await addMistake(USER, { ...sampleBase, word: 'ubiquitous', source: 'pronunciation' });
      expect((await getMistakes(USER)).length).toBe(2);
    });
  });

  describe('getMistakes', () => {
    beforeEach(async () => {
      await addMistake(USER, sampleBase);
      await addMistake(USER, { ...sampleBase, word: 'laconic', source: 'roleplay', category: 'Grammar' });
      await addMistake(USER, { ...sampleBase, word: 'terse', source: 'manual', category: 'Grammar' });
    });

    it('returns all mistakes when no filter is provided', async () => {
      expect((await getMistakes(USER)).length).toBe(3);
    });

    it('filters by source', async () => {
      const result = await getMistakes(USER, { source: 'roleplay' });
      expect(result.length).toBe(1);
      expect(result[0].word).toBe('laconic');
    });

    it('filters by category', async () => {
      const result = await getMistakes(USER, { category: 'Grammar' });
      expect(result.length).toBe(2);
    });

    it('filters by eliminated status', async () => {
      const all = await getMistakes(USER);
      await eliminateMistake(USER, all[0].id);
      expect((await getMistakes(USER, { eliminated: true })).length).toBe(1);
      expect((await getMistakes(USER, { eliminated: false })).length).toBe(2);
    });
  });

  describe('markMistakeReviewed', () => {
    it('increments reviewCount by 1', async () => {
      const entry = await addMistake(USER, sampleBase);
      const updated = await markMistakeReviewed(USER, entry.id);
      expect(updated?.reviewCount).toBe(1);
    });

    it('increments reviewCount on repeated calls', async () => {
      const entry = await addMistake(USER, sampleBase);
      await markMistakeReviewed(USER, entry.id);
      const updated = await markMistakeReviewed(USER, entry.id);
      expect(updated?.reviewCount).toBe(2);
    });

    it('returns undefined for unknown id', async () => {
      expect(await markMistakeReviewed(USER, 'nonexistent_id')).toBeUndefined();
    });
  });

  describe('eliminateMistake', () => {
    it('sets eliminated to true', async () => {
      const entry = await addMistake(USER, sampleBase);
      const updated = await eliminateMistake(USER, entry.id);
      expect(updated?.eliminated).toBe(true);
    });

    it('persists the elimination', async () => {
      const entry = await addMistake(USER, sampleBase);
      await eliminateMistake(USER, entry.id);
      const list = await getMistakes(USER);
      expect(list[0].eliminated).toBe(true);
    });

    it('returns undefined for unknown id', async () => {
      expect(await eliminateMistake(USER, 'nonexistent_id')).toBeUndefined();
    });
  });

  describe('getMistakeStats', () => {
    it('returns zeros when no mistakes exist', async () => {
      const stats = await getMistakeStats(USER);
      expect(stats.total).toBe(0);
      expect(stats.eliminatedCount).toBe(0);
      expect(stats.trend).toHaveLength(7);
    });

    it('counts total correctly', async () => {
      await addMistake(USER, sampleBase);
      await addMistake(USER, { ...sampleBase, source: 'pronunciation' });
      expect((await getMistakeStats(USER)).total).toBe(2);
    });

    it('counts bySource correctly', async () => {
      await addMistake(USER, { ...sampleBase, source: 'practice' });
      await addMistake(USER, { ...sampleBase, source: 'practice' });
      await addMistake(USER, { ...sampleBase, source: 'pronunciation' });
      const stats = await getMistakeStats(USER);
      expect(stats.bySource.practice).toBe(2);
      expect(stats.bySource.pronunciation).toBe(1);
      expect(stats.bySource.roleplay).toBe(0);
    });

    it('counts byCategory correctly', async () => {
      await addMistake(USER, { ...sampleBase, category: 'Vocabulary' });
      await addMistake(USER, { ...sampleBase, category: 'Grammar' });
      await addMistake(USER, { ...sampleBase, category: 'Vocabulary' });
      const stats = await getMistakeStats(USER);
      expect(stats.byCategory['Vocabulary']).toBe(2);
      expect(stats.byCategory['Grammar']).toBe(1);
    });

    it('counts eliminatedCount correctly', async () => {
      const e1 = await addMistake(USER, sampleBase);
      await addMistake(USER, { ...sampleBase, word: 'second' });
      await eliminateMistake(USER, e1.id);
      const stats = await getMistakeStats(USER);
      expect(stats.eliminatedCount).toBe(1);
    });

    it("trend has 7 entries and today's mistakes appear in the last slot", async () => {
      await addMistake(USER, sampleBase);
      await addMistake(USER, { ...sampleBase, word: 'second' });
      const stats = await getMistakeStats(USER);
      expect(stats.trend).toHaveLength(7);
      expect(stats.trend[6]).toBe(2);
    });
  });
});

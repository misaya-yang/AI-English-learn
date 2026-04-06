import { describe, it, expect } from 'vitest';
import {
  roleplayScenarios,
  getScenarioById,
  getScenariosByCategory,
  getScenariosByDifficulty,
  SCENARIO_CATEGORIES,
} from './roleplayScenarios';

describe('roleplayScenarios', () => {
  it('contains exactly 30 scenarios', () => {
    expect(roleplayScenarios.length).toBe(30);
  });

  it('all scenarios have unique IDs', () => {
    const ids = roleplayScenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(30);
  });

  it('each scenario has 3 objectives', () => {
    for (const s of roleplayScenarios) {
      expect(s.objectives.length).toBe(3);
    }
  });

  it('each scenario has 5+ key phrases', () => {
    for (const s of roleplayScenarios) {
      expect(s.keyPhrases.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('has correct category distribution (8 daily, 6 travel, 6 work, 5 academic, 5 ielts)', () => {
    const counts: Record<string, number> = {};
    for (const s of roleplayScenarios) {
      counts[s.category] = (counts[s.category] ?? 0) + 1;
    }
    expect(counts.daily).toBe(8);
    expect(counts.travel).toBe(6);
    expect(counts.work).toBe(6);
    expect(counts.academic).toBe(5);
    expect(counts.ielts).toBe(5);
  });

  it('each scenario has a non-empty systemPrompt', () => {
    for (const s of roleplayScenarios) {
      expect(s.systemPrompt.length).toBeGreaterThan(50);
    }
  });

  describe('getScenarioById', () => {
    it('returns scenario for valid ID', () => {
      const s = getScenarioById('daily-coffee-order');
      expect(s).toBeDefined();
      expect(s?.title).toBe('Ordering Coffee');
    });

    it('returns undefined for invalid ID', () => {
      expect(getScenarioById('nonexistent')).toBeUndefined();
    });
  });

  describe('getScenariosByCategory', () => {
    it('filters by category correctly', () => {
      const travel = getScenariosByCategory('travel');
      expect(travel.length).toBe(6);
      expect(travel.every((s) => s.category === 'travel')).toBe(true);
    });
  });

  describe('getScenariosByDifficulty', () => {
    it('filters by difficulty correctly', () => {
      const advanced = getScenariosByDifficulty('advanced');
      expect(advanced.length).toBeGreaterThan(0);
      expect(advanced.every((s) => s.difficulty === 'advanced')).toBe(true);
    });
  });

  it('SCENARIO_CATEGORIES covers all categories in data', () => {
    const categoriesInData = new Set(roleplayScenarios.map((s) => s.category));
    const categoriesInConst = new Set(SCENARIO_CATEGORIES.map((c) => c.id));
    expect(categoriesInData).toEqual(categoriesInConst);
  });
});

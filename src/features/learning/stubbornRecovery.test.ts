import { describe, expect, it } from 'vitest';

import type { WordData } from '@/data/words';
import type { FSRSState } from '@/types/core';

import {
  buildStubbornRecoveryPlan,
  getStubbornRecoveryTrigger,
} from './stubbornRecovery';

const word = (overrides: Partial<WordData> = {}): WordData => ({
  id: 'w1',
  word: 'abandon',
  phonetic: '/test/',
  partOfSpeech: 'verb',
  definition: 'to leave something behind',
  definitionZh: '抛弃',
  examples: [{ en: 'They abandoned the plan.', zh: '他们放弃了这个计划。' }],
  synonyms: ['desert'],
  antonyms: ['keep'],
  collocations: ['abandon the idea'],
  level: 'B2',
  topic: 'daily',
  memoryTip: 'A band left the stage: abandon.',
  ...overrides,
});

const fsrs = (overrides: Partial<FSRSState> = {}): FSRSState => ({
  stability: 2,
  difficulty: 5,
  retrievability: 0.75,
  lapses: 0,
  state: 'review',
  dueAt: '2026-06-13T00:00:00.000Z',
  lastReviewAt: '2026-06-12T00:00:00.000Z',
  ...overrides,
});

describe('stubbornRecovery', () => {
  it('does not build a recovery plan for a normal due card', () => {
    expect(buildStubbornRecoveryPlan({
      wordId: 'w1',
      word: word(),
      fsrs: fsrs({ lapses: 1, difficulty: 5 }),
      reviewCount: 2,
    })).toBeNull();
  });

  it('detects the lapse threshold', () => {
    expect(getStubbornRecoveryTrigger(fsrs({ lapses: 3, difficulty: 5 }))).toBe('lapse');
  });

  it('detects the difficulty threshold', () => {
    expect(getStubbornRecoveryTrigger(fsrs({ lapses: 0, difficulty: 8 }))).toBe('difficulty');
  });

  it('detects cards that hit both thresholds', () => {
    expect(getStubbornRecoveryTrigger(fsrs({ lapses: 3, difficulty: 8 }))).toBe('both');
  });

  it('builds a recovery plan with mnemonic, collocation, contrast, and production drill', () => {
    const plan = buildStubbornRecoveryPlan({
      wordId: 'w1',
      word: word(),
      fsrs: fsrs({ lapses: 3, difficulty: 8.4 }),
      reviewCount: 6,
    });

    expect(plan).toEqual(expect.objectContaining({
      wordId: 'w1',
      trigger: 'both',
      mnemonic: 'A band left the stage: abandon.',
      collocationDrill: expect.stringContaining('abandon the idea'),
      confusingNote: expect.stringContaining('desert'),
      productionTask: expect.stringContaining('abandon the idea'),
    }));
    expect(plan?.reason).toContain('lapsed 3 times');
    expect(plan?.metrics).toEqual({ lapses: 3, difficulty: 8.4 });
  });
});

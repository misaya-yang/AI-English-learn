import { describe, expect, it } from 'vitest';

import { buildQuickPrompts } from '@/features/chat/utils/quickPrompts';

const tIdentity = (key: string, options?: Record<string, unknown>): string => {
  if (options && typeof options.defaultValue === 'string') {
    return options.defaultValue;
  }
  return key;
};

describe('buildQuickPrompts', () => {
  it('returns four default prompts for an empty context', () => {
    const prompts = buildQuickPrompts(tIdentity);
    expect(prompts).toHaveLength(4);
    expect(prompts.map((p) => p.text)).toEqual([
      'Explain the difference between "affect" and "effect"',
      'Give me 5 collocations with "make"',
      'Create a short dialogue at a restaurant',
      'Help me practice using "serendipity"',
    ]);
  });

  it('prepends a review prompt when due count is at least 3', () => {
    const prompts = buildQuickPrompts(tIdentity, { dueCount: 5 });
    expect(prompts).toHaveLength(4);
    expect(prompts[0].text).toBe('I have 5 words due for review. Help me practice them in context.');
  });

  it('omits the review prompt when due count is below threshold', () => {
    const prompts = buildQuickPrompts(tIdentity, { dueCount: 2 });
    expect(prompts.some((p) => p.text.includes('words due for review'))).toBe(false);
  });

  it('includes an IELTS prompt only when hasExamGoal is true', () => {
    const without = buildQuickPrompts(tIdentity);
    const withExam = buildQuickPrompts(tIdentity, { hasExamGoal: true });
    expect(without.some((p) => p.text.startsWith('Give me an IELTS'))).toBe(false);
    expect(withExam.some((p) => p.text.startsWith('Give me an IELTS'))).toBe(true);
  });

  it('adds beginner prompts for A1/A2 levels and not for higher levels', () => {
    const a1 = buildQuickPrompts(tIdentity, { level: 'A1' });
    const b1 = buildQuickPrompts(tIdentity, { level: 'B1' });
    expect(a1.some((p) => p.text.includes('ordering coffee'))).toBe(true);
    expect(b1.some((p) => p.text.includes('ordering coffee'))).toBe(false);
  });

  it('adds a writing prompt when incompleteTasks includes writing', () => {
    const prompts = buildQuickPrompts(tIdentity, { incompleteTasks: ['writing'] });
    expect(prompts.some((p) => p.text.startsWith('Give me a short writing prompt'))).toBe(true);
  });

  it('caps the prompt list at four entries even when many are eligible', () => {
    const prompts = buildQuickPrompts(tIdentity, {
      dueCount: 9,
      hasExamGoal: true,
      level: 'A1',
      incompleteTasks: ['writing'],
    });
    expect(prompts).toHaveLength(4);
    expect(prompts.map((p) => p.text)).toEqual([
      'I have 9 words due for review. Help me practice them in context.',
      'Give me an IELTS Writing Task 2 topic and evaluate my response structure.',
      'Create a simple dialogue for ordering coffee',
      'Teach me 5 common greetings and when to use them',
    ]);
  });
});

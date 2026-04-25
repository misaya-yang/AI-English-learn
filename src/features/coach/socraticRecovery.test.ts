import { describe, expect, it } from 'vitest';

import { buildSocraticRecoveryPrompt } from './socraticRecovery';

describe('buildSocraticRecoveryPrompt', () => {
  it('returns null when the question text is missing', () => {
    expect(buildSocraticRecoveryPrompt({ question: '', userAnswer: 'whatever' })).toBeNull();
    expect(buildSocraticRecoveryPrompt({ question: '   ', userAnswer: 'whatever' })).toBeNull();
  });

  it('produces a visible string and an API payload anchored on the question', () => {
    const payload = buildSocraticRecoveryPrompt({
      question: 'Choose the correct sentence using the past perfect.',
      userAnswer: 'I had finished my homework when she had arrived.',
    });
    expect(payload).not.toBeNull();
    expect(payload!.visible).toMatch(/wrong|guide me/i);
    expect(payload!.api).toContain('Choose the correct sentence using the past perfect.');
    expect(payload!.api).toContain('I had finished my homework when she had arrived.');
  });

  it('never serializes the correct answer into the API prompt', () => {
    const payload = buildSocraticRecoveryPrompt({
      question: 'Pick the right past-perfect sentence.',
      userAnswer: 'Wrong choice',
      correctAnswer: 'I had finished my homework when she arrived.',
    });
    expect(payload!.api).not.toContain('I had finished my homework when she arrived.');
  });

  it('asks the model to NOT reveal the answer (English)', () => {
    const payload = buildSocraticRecoveryPrompt({
      question: 'Pick the right past-perfect sentence.',
      userAnswer: 'Wrong choice',
    });
    expect(payload!.api).toMatch(/do not reveal|don't reveal|do not give the answer/i);
    expect(payload!.api).toMatch(/socratic question/i);
    expect(payload!.api).toMatch(/retry/i);
    expect(payload!.api).toMatch(/retry_with_hint/);
  });

  it('switches to Chinese instructions for zh-* learners', () => {
    const payload = buildSocraticRecoveryPrompt({
      question: '选出正确的过去完成时句子。',
      userAnswer: '错误选项',
      language: 'zh-CN',
    });
    expect(payload!.visible).toContain('Socratic');
    expect(payload!.api).toMatch(/不要直接给出/);
    expect(payload!.api).toMatch(/Socratic 提问/);
    expect(payload!.api).toContain('retry_with_hint');
  });

  it('falls back to "no answer captured" when the user answer is empty', () => {
    const payload = buildSocraticRecoveryPrompt({
      question: 'Pick the right past-perfect sentence.',
      userAnswer: '',
    });
    expect(payload!.api).toContain('(no answer captured)');
  });

  it('truncates extremely long question/answer strings to keep the prompt bounded', () => {
    const longQuestion = 'Q'.repeat(2000);
    const longAnswer = 'A'.repeat(2000);
    const payload = buildSocraticRecoveryPrompt({
      question: longQuestion,
      userAnswer: longAnswer,
    });
    expect(payload!.api.length).toBeLessThan(2000);
    expect(payload!.api).toMatch(/Q+…/);
    expect(payload!.api).toMatch(/A+…/);
  });

  it('annotates the structured prompt with skill and word tags when supplied', () => {
    const payload = buildSocraticRecoveryPrompt({
      question: 'Pick the past-perfect form.',
      userAnswer: 'wrong',
      skill: 'grammar',
      targetWord: 'aberration',
    });
    expect(payload!.api).toMatch(/\[skill=grammar\]/);
    expect(payload!.api).toMatch(/\[word=aberration\]/);
  });
});

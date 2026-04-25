import { describe, expect, it } from 'vitest';

import { buildQuizBatchSendOptions } from '@/features/chat/runtime/quizBatchRequest';
import type { QuizSequenceState } from '@/features/chat/runtime/quizSequenceState';

const buildSequence = (overrides: Partial<QuizSequenceState> = {}): QuizSequenceState => ({
  targetCount: 5,
  answeredCount: 1,
  seedPrompt: 'give me 5 quiz questions',
  usedWords: ['serendipity'],
  startedAt: 1_000,
  ...overrides,
});

describe('buildQuizBatchSendOptions', () => {
  it('echoes the seed prompt as the visible content and templates the API override', () => {
    const built = buildQuizBatchSendOptions({
      sequence: buildSequence(),
      startIndex: 2,
      language: 'en-US',
      goalContext: 'Learner level B1',
      weakTags: ['core_vocabulary'],
      runId: 'run_abc',
    });

    expect(built.content).toBe('give me 5 quiz questions');
    expect(built.options.apiContentOverride).toContain('Generate 1 multiple-choice quiz question');
    expect(built.options.apiContentOverride).toContain('starting from #2');
    expect(built.options.apiContentOverride).toContain('Avoid repeating these target words: serendipity');
  });

  it('forces quiz feature flags and disables search', () => {
    const built = buildQuizBatchSendOptions({
      sequence: buildSequence(),
      startIndex: 2,
      language: 'en-US',
      runId: 'run_abc',
    });
    expect(built.options.searchMode).toBe('off');
    expect(built.options.featureFlags?.forceQuiz).toBe(true);
    expect(built.options.featureFlags?.allowAutoQuiz).toBe(true);
    expect(built.options.featureFlags?.enableQuizArtifacts).toBe(true);
    expect(built.options.featureFlags?.enableStudyArtifacts).toBe(true);
    expect(built.options.hideUserMessage).toBe(true);
    expect(built.options.quizPolicy).toEqual({ revealAnswer: 'after_submit' });
  });

  it('emits a quizRun block when a runId is provided', () => {
    const built = buildQuizBatchSendOptions({
      sequence: buildSequence(),
      startIndex: 3,
      language: 'en-US',
      runId: 'run_xyz',
    });
    expect(built.options.quizRun).toEqual({
      runId: 'run_xyz',
      questionIndex: 3,
      targetCount: 5,
      status: 'requesting_next',
    });
  });

  it('omits quizRun when no runId is supplied', () => {
    const built = buildQuizBatchSendOptions({
      sequence: buildSequence(),
      startIndex: 3,
      language: 'en-US',
    });
    expect(built.options.quizRun).toBeUndefined();
  });

  it('clamps startIndex to be at least 1', () => {
    const built = buildQuizBatchSendOptions({
      sequence: buildSequence(),
      startIndex: 0,
      language: 'en-US',
      runId: 'run_abc',
    });
    expect(built.options.quizRun?.questionIndex).toBe(1);
    expect(built.options.apiContentOverride).toContain('starting from #1');
  });

  it('uses the Chinese prompt template when language starts with zh', () => {
    const built = buildQuizBatchSendOptions({
      sequence: buildSequence(),
      startIndex: 2,
      language: 'zh-CN',
      runId: 'run_abc',
    });
    expect(built.options.apiContentOverride).toContain('请为同一套英语测验生成 1 道四选一题');
  });
});

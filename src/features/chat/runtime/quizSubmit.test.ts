import { describe, expect, it } from 'vitest';

import {
  buildQuizMistakeFeedback,
  buildReviewCardFromQuiz,
  extractWordCandidate,
  inferLessonTags,
  inferQuizFeedbackTag,
  normalizeFeedbackTag,
} from '@/features/chat/runtime/quizSubmit';
import type { ChatArtifact } from '@/types/chatAgent';

type QuizArtifact = Extract<ChatArtifact, { type: 'quiz' }>;

const buildQuizArtifact = (overrides: Partial<QuizArtifact['payload']> = {}): QuizArtifact => ({
  type: 'quiz',
  payload: {
    quizId: 'quiz_test_1',
    title: 'Sample quiz',
    questionType: 'multiple_choice',
    stem: 'Choose the option that best fits "serendipity" in context.',
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
    ],
    answerKey: 'A',
    explanation: 'Explanation goes here.',
    difficulty: 'medium',
    skills: ['vocabulary'],
    estimatedSeconds: 45,
    ...overrides,
  },
});

describe('extractWordCandidate', () => {
  it('prefers the explicit targetWord when present', () => {
    const artifact = buildQuizArtifact({ targetWord: ' Serendipity ' });
    expect(extractWordCandidate(artifact)).toBe('serendipity');
  });

  it('falls back to a quoted word inside the stem', () => {
    const artifact = buildQuizArtifact({ stem: 'Practice using "ephemeral" today.' });
    expect(extractWordCandidate(artifact)).toBe('ephemeral');
  });

  it('returns "focus" when no candidate is found', () => {
    const artifact = buildQuizArtifact({ stem: '...' });
    expect(extractWordCandidate(artifact)).toBe('focus');
  });
});

describe('normalizeFeedbackTag', () => {
  it('passes through whitelisted tags', () => {
    expect(normalizeFeedbackTag('grammar')).toBe('grammar');
    expect(normalizeFeedbackTag('coherence')).toBe('coherence');
    expect(normalizeFeedbackTag('task_response')).toBe('task_response');
    expect(normalizeFeedbackTag('logic')).toBe('logic');
    expect(normalizeFeedbackTag('collocation')).toBe('collocation');
    expect(normalizeFeedbackTag('tense')).toBe('tense');
  });

  it('falls back to lexical for unknown values', () => {
    expect(normalizeFeedbackTag('something-else')).toBe('lexical');
    expect(normalizeFeedbackTag('lexical')).toBe('lexical');
  });
});

describe('inferQuizFeedbackTag', () => {
  it('prefers the explicit tags array from the artifact', () => {
    const artifact = buildQuizArtifact({ tags: ['grammar', 'something-else'] });
    expect(inferQuizFeedbackTag(artifact)).toBe('grammar');
  });

  it('falls back to grammar when grammar appears in skills', () => {
    const artifact = buildQuizArtifact({ skills: ['grammar:tense'] });
    expect(inferQuizFeedbackTag(artifact)).toBe('grammar');
  });

  it('returns lexical for vocabulary-only quizzes', () => {
    const artifact = buildQuizArtifact({ skills: ['vocabulary'] });
    expect(inferQuizFeedbackTag(artifact)).toBe('lexical');
  });
});

describe('inferLessonTags', () => {
  it('returns the normalised tag list when tags are populated', () => {
    const artifact = buildQuizArtifact({ tags: ['grammar', 'unknown', 'tense'] });
    expect(inferLessonTags(artifact)).toEqual(['grammar', 'lexical', 'tense']);
  });

  it('falls back to coherence when only coherence-flavoured skills exist', () => {
    const artifact = buildQuizArtifact({ skills: ['discourse-coherence'] });
    expect(inferLessonTags(artifact)).toEqual(['coherence']);
  });

  it('falls back to lexical when nothing matches', () => {
    const artifact = buildQuizArtifact({ skills: [] });
    expect(inferLessonTags(artifact)).toEqual(['lexical']);
  });
});

describe('buildQuizMistakeFeedback', () => {
  it('builds an English fallback feedback record with deterministic shape', () => {
    const artifact = buildQuizArtifact({
      tags: ['grammar'],
      explanation: 'Use the past perfect because the action precedes another past event.',
    });
    const feedback = buildQuizMistakeFeedback({
      quizId: 'quiz_test_1',
      artifact,
      language: 'en-US',
      now: 1_700_000_000_000,
    });

    expect(feedback).toMatchObject({
      attemptId: 'chat_quiz_quiz_test_1_1700000000000',
      scores: {
        taskResponse: 5.5,
        coherenceCohesion: 5.5,
        lexicalResource: 6,
        grammaticalRangeAccuracy: 5,
        overallBand: 5.5,
      },
      issues: [
        {
          tag: 'grammar',
          severity: 'medium',
          message: 'Captured from chat quiz attempt.',
          suggestion: 'Take the remediation micro-lesson and review this card again.',
        },
      ],
      rewrites: ['Use the past perfect because the action precedes another past event.'],
      nextActions: ['Complete 1 remediation drill', 'Retry in 24 hours'],
      confidence: 0.7,
      provider: 'fallback',
    });
    expect(feedback.createdAt).toBe(new Date(1_700_000_000_000).toISOString());
  });

  it('switches the message strings when locale is zh', () => {
    const artifact = buildQuizArtifact({ tags: ['lexical'] });
    const feedback = buildQuizMistakeFeedback({
      quizId: 'quiz_zh_1',
      artifact,
      language: 'zh-CN',
      now: 1_700_000_000_000,
    });
    expect(feedback.issues[0].message).toBe('来自对话测验的错误回流。');
    expect(feedback.issues[0].suggestion).toBe('建议完成对应补救微课并加入复习。');
    expect(feedback.nextActions).toEqual(['完成 1 次补救练习', '24 小时后再次测验']);
  });

  it('drops the lexical/collocation score to 5 when those tags are inferred', () => {
    const artifact = buildQuizArtifact({ tags: ['collocation'] });
    const feedback = buildQuizMistakeFeedback({
      quizId: 'quiz_lex',
      artifact,
      language: 'en-US',
      now: 1_700_000_000_000,
    });
    expect(feedback.scores.lexicalResource).toBe(5);
    expect(feedback.scores.grammaticalRangeAccuracy).toBe(6);
  });
});

describe('buildReviewCardFromQuiz', () => {
  it('produces a learner WordData entry seeded by the quiz artifact', () => {
    const artifact = buildQuizArtifact({
      targetWord: 'serendipity',
      explanation: 'a happy accident',
      stem: 'Practice using "serendipity".',
    });
    const card = buildReviewCardFromQuiz({
      artifact,
      language: 'en-US',
      now: 1_700_000_000_000,
    });

    expect(card.word).toBe('serendipity');
    expect(card.definition).toBe('a happy accident');
    expect(card.examples[0].en).toBe('Practice using "serendipity".');
    expect(card.examples[0].zh).toBe('From quiz stem');
    expect(card.id.startsWith('quiz_word_1700000000000_')).toBe(true);
    expect(card.level).toBe('B1');
    expect(card.topic).toBe('quiz');
  });

  it('uses the Chinese strings for zh locales', () => {
    const artifact = buildQuizArtifact({ targetWord: 'word' });
    const card = buildReviewCardFromQuiz({ artifact, language: 'zh-CN', now: 1_700_000_000_000 });
    expect(card.definitionZh).toBe('来自 AI 测验回流');
    expect(card.examples[0].zh).toBe('来自测验题干');
  });
});

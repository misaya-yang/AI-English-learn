import { describe, expect, it } from 'vitest';

import { shouldHideMessageDuringQuizRun } from '@/features/chat/utils/messageVisibility';
import type { QuizSequenceState } from '@/features/chat/runtime/quizSequenceState';
import type { ChatArtifact } from '@/types/chatAgent';
import type { ChatMessage } from '@/features/chat/state/types';

const sequence: QuizSequenceState = {
  targetCount: 3,
  answeredCount: 1,
  seedPrompt: 'give me a quiz',
  usedWords: [],
  startedAt: 1_000,
};

const baseMessage = (overrides: Partial<ChatMessage>): ChatMessage => ({
  id: 'm',
  role: 'assistant',
  content: '',
  createdAt: 0,
  ...overrides,
});

const quizArtifact: ChatArtifact = {
  type: 'quiz',
  payload: {
    quizId: 'q1',
    title: 't',
    questionType: 'multiple_choice',
    stem: 's',
    options: [
      { id: 'A', text: 'a' },
      { id: 'B', text: 'b' },
    ],
    answerKey: 'A',
    explanation: '',
    difficulty: 'easy',
    skills: [],
    estimatedSeconds: 30,
  },
};

describe('shouldHideMessageDuringQuizRun', () => {
  it('returns false when no sequence is active', () => {
    expect(shouldHideMessageDuringQuizRun(baseMessage({ createdAt: 5_000 }), null)).toBe(false);
  });

  it('hides assistant messages emitted after the run start', () => {
    expect(
      shouldHideMessageDuringQuizRun(
        baseMessage({ id: 'after', role: 'assistant', createdAt: 1_500 }),
        sequence,
      ),
    ).toBe(true);
  });

  it('hides assistant messages within the 500ms grace window before the run start', () => {
    expect(
      shouldHideMessageDuringQuizRun(
        baseMessage({ id: 'window', role: 'assistant', createdAt: 700 }),
        sequence,
      ),
    ).toBe(true);
  });

  it('keeps user messages visible regardless of timing', () => {
    expect(
      shouldHideMessageDuringQuizRun(
        baseMessage({ id: 'u', role: 'user', createdAt: 5_000 }),
        sequence,
      ),
    ).toBe(false);
  });

  it('hides assistant messages with quiz artifacts even when older than the run', () => {
    expect(
      shouldHideMessageDuringQuizRun(
        baseMessage({ id: 'old-quiz', role: 'assistant', createdAt: 100, artifacts: [quizArtifact] }),
        sequence,
      ),
    ).toBe(true);
  });
});

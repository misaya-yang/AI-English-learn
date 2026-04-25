import { describe, expect, it } from 'vitest';

import {
  collectQuizRunArtifacts,
  computeQuizDisplayIndex,
  reconcileCanvasIndex,
  type QuizSequenceState,
} from '@/features/chat/runtime/quizSequenceState';
import type { ChatArtifact } from '@/types/chatAgent';
import type { ChatMessage } from '@/features/chat/state/types';

const buildSequence = (overrides: Partial<QuizSequenceState> = {}): QuizSequenceState => ({
  targetCount: 3,
  answeredCount: 0,
  seedPrompt: 'give me 3 quiz questions',
  usedWords: [],
  startedAt: 1_000,
  ...overrides,
});

const buildQuizArtifact = (quizId: string): Extract<ChatArtifact, { type: 'quiz' }> => ({
  type: 'quiz',
  payload: {
    quizId,
    title: `Quiz ${quizId}`,
    questionType: 'multiple_choice',
    stem: `Stem for ${quizId}`,
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
    ],
    answerKey: 'A',
    explanation: '',
    difficulty: 'medium',
    skills: [],
    estimatedSeconds: 45,
  },
});

const assistantMessage = (
  id: string,
  createdAt: number,
  artifacts?: ChatArtifact[],
): ChatMessage => ({
  id,
  role: 'assistant',
  content: '',
  createdAt,
  artifacts,
});

describe('collectQuizRunArtifacts', () => {
  it('returns an empty list when no sequence is active', () => {
    expect(collectQuizRunArtifacts([assistantMessage('m1', 5_000)], null)).toEqual([]);
  });

  it('drops messages older than the run start (with the 500ms window) and dedupes by quizId', () => {
    const messages: ChatMessage[] = [
      assistantMessage('m_old', 100, [buildQuizArtifact('q1')]), // dropped (older than start - 500)
      assistantMessage('m1', 1_500, [buildQuizArtifact('q1')]),
      assistantMessage('m2', 2_500, [buildQuizArtifact('q1'), buildQuizArtifact('q2')]),
      assistantMessage('m3', 3_500, [buildQuizArtifact('q3')]),
    ];

    const result = collectQuizRunArtifacts(messages, buildSequence());
    expect(result.map((entry) => entry.artifact.payload.quizId)).toEqual(['q1', 'q2', 'q3']);
    expect(result.map((entry) => entry.messageId)).toEqual(['m1', 'm2', 'm3']);
  });

  it('keeps messages that are within the 500ms grace window before run start', () => {
    const messages: ChatMessage[] = [
      assistantMessage('m_window', 600, [buildQuizArtifact('q1')]),
      assistantMessage('m1', 1_500, [buildQuizArtifact('q2')]),
    ];
    const result = collectQuizRunArtifacts(messages, buildSequence());
    expect(result.map((entry) => entry.artifact.payload.quizId)).toEqual(['q1', 'q2']);
  });

  it('ignores user messages and non-quiz artifacts', () => {
    const messages: ChatMessage[] = [
      { ...assistantMessage('m1', 1_500, [buildQuizArtifact('q1')]), role: 'user' as const },
      assistantMessage('m2', 1_700, [
        { type: 'study_plan', payload: { title: 'Plan', steps: [] } } as ChatArtifact,
      ]),
      assistantMessage('m3', 1_800, [buildQuizArtifact('q2')]),
    ];
    const result = collectQuizRunArtifacts(messages, buildSequence());
    expect(result.map((entry) => entry.artifact.payload.quizId)).toEqual(['q2']);
  });
});

describe('computeQuizDisplayIndex', () => {
  it('returns 0 when there is no active sequence', () => {
    expect(computeQuizDisplayIndex({ sequence: null, canvasIndex: 0, hasActiveArtifact: false })).toBe(0);
  });

  it('returns the targetCount when the run is finished', () => {
    expect(
      computeQuizDisplayIndex({
        sequence: buildSequence({ answeredCount: 3, targetCount: 3 }),
        canvasIndex: 1,
        hasActiveArtifact: true,
      }),
    ).toBe(3);
  });

  it('uses canvasIndex+1 when an active artifact exists, capped at targetCount', () => {
    expect(
      computeQuizDisplayIndex({
        sequence: buildSequence({ targetCount: 3, answeredCount: 1 }),
        canvasIndex: 1,
        hasActiveArtifact: true,
      }),
    ).toBe(2);
    expect(
      computeQuizDisplayIndex({
        sequence: buildSequence({ targetCount: 3, answeredCount: 0 }),
        canvasIndex: 5,
        hasActiveArtifact: true,
      }),
    ).toBe(3);
  });

  it('falls back to answeredCount+1 when no active artifact exists', () => {
    expect(
      computeQuizDisplayIndex({
        sequence: buildSequence({ targetCount: 4, answeredCount: 1 }),
        canvasIndex: 0,
        hasActiveArtifact: false,
      }),
    ).toBe(2);
  });
});

describe('reconcileCanvasIndex', () => {
  it('returns 0 when there are no artifacts', () => {
    expect(reconcileCanvasIndex({ currentIndex: 4, answeredCount: 2, artifactsLength: 0 })).toBe(0);
  });

  it('prefers the answeredCount when the user is behind it', () => {
    expect(reconcileCanvasIndex({ currentIndex: 0, answeredCount: 2, artifactsLength: 4 })).toBe(2);
  });

  it('keeps the user on a later question when they navigated forward', () => {
    expect(reconcileCanvasIndex({ currentIndex: 3, answeredCount: 1, artifactsLength: 4 })).toBe(3);
  });

  it('clamps to the last available artifact', () => {
    expect(reconcileCanvasIndex({ currentIndex: 9, answeredCount: 5, artifactsLength: 3 })).toBe(2);
  });
});

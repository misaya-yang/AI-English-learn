import { describe, expect, it } from 'vitest';

import {
  buildChatRequestPayload,
  type ChatAssistantRequestContext,
} from '@/features/chat/runtime/requestPayload';
import {
  buildCoachSystemPrompt,
  normalizeLearningContext,
} from '@/features/coach/coachingPolicy';

const buildContext = (overrides: Partial<ChatAssistantRequestContext> = {}): ChatAssistantRequestContext => ({
  sessionId: 'session-fixture',
  apiMessages: [
    { role: 'user', content: 'How do I use "make" in collocations?' },
  ],
  surface: 'chat',
  goalContext: 'Learner level: B1. Primary goal: Improve practical English.',
  weakTags: ['core_vocabulary', 'review_pressure'],
  mode: 'study',
  responseStyle: 'coach',
  searchMode: 'auto',
  canvasSyncToParent: false,
  trigger: 'manual_input',
  ...overrides,
});

const TOP_LEVEL_KEYS_ORDERED = [
  'sessionId',
  'messages',
  'systemPrompt',
  // coachingPolicyVersion was added in COACH-01 so the server can detect
  // an in-flight contract change. Position immediately after systemPrompt.
  'coachingPolicyVersion',
  'surface',
  'goalContext',
  'weakTags',
  'learningContext',
  'toolContext',
  'agentConfig',
  'searchPolicy',
  'memoryPolicy',
  'memoryControl',
  'canvasContext',
  'mode',
  'responseStyle',
  'quizPolicy',
  'quizRun',
  'featureFlags',
  'temperature',
  'maxTokens',
];

const LEARNING_CONTEXT_KEYS_ORDERED = [
  'locale',
  'app',
  'mode',
  'currentMode',
  'surface',
  'goalContext',
  // Canonical weakness key (COACH-01). The legacy `weakTags` field stays
  // alongside it so older Edge Function revisions still see the data.
  'weaknessTags',
  'weakTags',
  // Learner-model fields surfaced by the COACHING_POLICY when present.
  'level',
  'target',
  'examType',
  'dailyMinutes',
  'dueCount',
  'learnerMode',
  'burnoutRisk',
  'stubbornTopics',
  'recommendedDailyReview',
  'predictedRetention30d',
  'recentErrors',
];

describe('buildChatRequestPayload — request shape regression', () => {
  it('returns exactly the documented top-level keys in stable order', () => {
    const { payload } = buildChatRequestPayload({
      context: buildContext(),
      latestUserInput: 'How do I use "make" in collocations?',
      getCanvasChildSessionId: () => 'canvas-child',
    });

    expect(Object.keys(payload)).toEqual(TOP_LEVEL_KEYS_ORDERED);
  });

  it('preserves the learningContext subkey order and primitive types', () => {
    const { payload } = buildChatRequestPayload({
      context: buildContext(),
      latestUserInput: 'How do I use "make" in collocations?',
      getCanvasChildSessionId: () => 'canvas-child',
    });

    const learningContext = payload.learningContext as Record<string, unknown>;
    expect(Object.keys(learningContext)).toEqual(LEARNING_CONTEXT_KEYS_ORDERED);
    expect(learningContext.locale).toBe('zh-CN');
    expect(learningContext.app).toBe('VocabDaily');
    expect(learningContext.mode).toBe('english-learning-coach');
    expect(learningContext.currentMode).toBe('study');
    expect(learningContext.surface).toBe('chat');
    expect(learningContext.weakTags).toEqual(['core_vocabulary', 'review_pressure']);
    // Canonical field — COACH-01 promotes weakTags onto weaknessTags so the
    // shared COACHING_POLICY can cite them. Both keys live in the payload
    // for back-compat with older Edge Function revisions.
    expect(learningContext.weaknessTags).toEqual(['core_vocabulary', 'review_pressure']);
  });

  it('builds a system prompt that matches buildCoachSystemPrompt for the same context', () => {
    const context = buildContext();
    const { payload } = buildChatRequestPayload({
      context,
      latestUserInput: 'hi',
      getCanvasChildSessionId: () => 'canvas-child',
    });
    const expected = buildCoachSystemPrompt(
      normalizeLearningContext({ weakTags: context.weakTags }),
      { surface: context.surface, mode: context.mode, goalContext: context.goalContext },
    );
    expect(payload.systemPrompt).toBe(expected);
  });

  it('returns a quiz-shaped payload for forced quiz turns and exposes the canonical isQuizTurn flag', () => {
    const built = buildChatRequestPayload({
      context: buildContext({
        mode: 'quiz',
        featureFlags: { forceQuiz: true },
        quizRun: {
          runId: 'run_1',
          questionIndex: 1,
          targetCount: 3,
        },
      }),
      latestUserInput: '给我三道四选一题',
      getCanvasChildSessionId: () => 'canvas-child',
    });

    expect(built.isQuizTurn).toBe(true);
    expect(built.useLightweightGreetingPath).toBe(false);
    const tool = built.payload.toolContext as { availableTools: string[]; responseTemplate: string[] };
    expect(tool.availableTools).toEqual([]);
    expect(tool.responseTemplate).toEqual(['direct_answer']);
    expect(built.payload.maxTokens).toBe(620);
    const featureFlags = built.payload.featureFlags as Record<string, unknown>;
    expect(featureFlags.enableQuizArtifacts).toBe(true);
    expect(featureFlags.enableStudyArtifacts).toBe(true);
    expect(featureFlags.forceQuiz).toBe(true);
    expect(featureFlags.allowAutoQuiz).toBe(true);
  });

  it('marks fast-path lightweight greeting payloads with the correct token budget and tools', () => {
    const built = buildChatRequestPayload({
      context: buildContext({ mode: 'chat' }),
      latestUserInput: 'hi',
      getCanvasChildSessionId: () => 'canvas-child',
    });

    expect(built.useLightweightGreetingPath).toBe(true);
    expect(built.payload.maxTokens).toBe(180);
    expect(built.payload.temperature).toBe(0.45);
    const agentConfig = built.payload.agentConfig as Record<string, unknown>;
    expect(agentConfig.totalTokens).toBe(420);
    const tool = built.payload.toolContext as { availableTools: string[]; responseTemplate: string[] };
    expect(tool.availableTools).toEqual([]);
    expect(tool.responseTemplate).toEqual(['direct_answer']);
  });

  it('emits a canvasContext block only for canvas mode', () => {
    const studyBuilt = buildChatRequestPayload({
      context: buildContext({ mode: 'study' }),
      latestUserInput: 'practice with me',
      getCanvasChildSessionId: () => 'canvas-child',
    });
    expect(studyBuilt.payload.canvasContext).toBeUndefined();

    const canvasBuilt = buildChatRequestPayload({
      context: buildContext({ mode: 'canvas', canvasSyncToParent: true }),
      latestUserInput: 'rewrite for IELTS task 2',
      getCanvasChildSessionId: () => 'canvas-child-id',
    });
    const canvasContext = canvasBuilt.payload.canvasContext as Record<string, unknown>;
    expect(canvasContext.parentSessionId).toBe('session-fixture');
    expect(canvasContext.childSessionId).toBe('canvas-child-id');
    expect(canvasContext.syncToParent).toBe(true);
  });

  it('respects user-supplied memoryPolicy overrides while still defaulting writeMode/allowSensitiveStore', () => {
    const built = buildChatRequestPayload({
      context: buildContext({
        memoryPolicy: { topK: 3, minSimilarity: 0.5 },
      }),
      latestUserInput: 'practice with me',
      getCanvasChildSessionId: () => 'canvas-child',
    });
    const memoryPolicy = built.payload.memoryPolicy as Record<string, unknown>;
    expect(memoryPolicy.topK).toBe(3);
    expect(memoryPolicy.minSimilarity).toBe(0.5);
    expect(memoryPolicy.writeMode).toBe('stable_only');
    expect(memoryPolicy.allowSensitiveStore).toBe(false);
  });

  it('forwards quizPolicy and quizRun verbatim when not suppressed', () => {
    const built = buildChatRequestPayload({
      context: buildContext({
        mode: 'quiz',
        quizPolicy: { revealAnswer: 'after_submit' },
        quizRun: {
          runId: 'run_xyz',
          questionIndex: 2,
          targetCount: 5,
          status: 'awaiting_answer',
        },
      }),
      latestUserInput: 'next question please',
      getCanvasChildSessionId: () => 'canvas-child',
    });
    expect(built.payload.quizPolicy).toEqual({ revealAnswer: 'after_submit' });
    expect(built.payload.quizRun).toEqual({
      runId: 'run_xyz',
      questionIndex: 2,
      targetCount: 5,
      status: 'awaiting_answer',
    });
  });
});

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { EdgeFunctionError } from '@/services/aiGateway';
import { normalizeArtifacts } from '@/services/chatArtifacts';
import { recordLearningEvent } from '@/services/learningEvents';
import { applyCoachingActions } from '@/services/coachingActionRouter';
import {
  buildChatRequestPayload,
  invokeChatRequest,
  type ChatAssistantRequestContext,
} from '@/features/chat/runtime/requestPayload';
import {
  normalizeAssistantReplyContent,
  parseEmbeddedEnvelope,
  parseLooseQuizArtifactFromText,
} from '@/features/chat/runtime/responseNormalization';
import { toRequestError } from '@/features/chat/runtime/requestErrors';
import type { ChatMessage } from '@/features/chat/state/types';
import type {
  ChatArtifact,
  ChatPerfSnapshot,
  ChatRenderState,
  ContextMeta,
  MemoryUsedTrace,
  MemoryWriteTrace,
  QuizRunState,
  ToolRun,
  AgentMeta,
  ChatSource,
} from '@/types/chatAgent';

export interface AssistantReplyPipelineArgs {
  context: ChatAssistantRequestContext;
  userId: string;
  streamingContent: string;
  timeoutMs?: number;
  getCanvasChildSessionId: (sessionId: string) => string;
  appendAssistantMessage: (sessionId: string, assistantMessage: ChatMessage) => Promise<void>;
  persistQuizRuns: (
    updater: (prev: Record<string, QuizRunState>) => Record<string, QuizRunState>,
  ) => void;
  trackExperimentEvent: (eventName: string, payload: Record<string, unknown>) => void | Promise<void>;
  refs: {
    abortControllerRef: MutableRefObject<AbortController | null>;
    failedRequestRef: MutableRefObject<ChatAssistantRequestContext | null>;
    requestStartAtRef: MutableRefObject<number | null>;
    nextQuestionRequestAtRef: MutableRefObject<number | null>;
  };
  setters: {
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    setStreamingContent: Dispatch<SetStateAction<string>>;
    setChatError: Dispatch<SetStateAction<{ status: number; code?: string; message: string; requestId?: string } | null>>;
    setLastRenderState: Dispatch<SetStateAction<ChatRenderState | null>>;
    setChatPerf: Dispatch<SetStateAction<ChatPerfSnapshot>>;
    setLastAgentMeta: Dispatch<SetStateAction<AgentMeta | null>>;
    setLastSources: Dispatch<SetStateAction<ChatSource[]>>;
    setLastToolRuns: Dispatch<SetStateAction<ToolRun[]>>;
    setLastContextMeta: Dispatch<SetStateAction<ContextMeta | null>>;
    setLastMemoryUsed: Dispatch<SetStateAction<MemoryUsedTrace[]>>;
    setLastMemoryWrites: Dispatch<SetStateAction<MemoryWriteTrace[]>>;
    setLastMemoryTraceId: Dispatch<SetStateAction<string | null>>;
  };
}

export async function requestAssistantReplyPipeline(args: AssistantReplyPipelineArgs): Promise<void> {
  const {
    context,
    userId,
    streamingContent,
    getCanvasChildSessionId,
    appendAssistantMessage,
    persistQuizRuns,
    trackExperimentEvent,
    refs,
    setters,
  } = args;

  setters.setIsLoading(true);
  setters.setStreamingContent('');
  setters.setChatError(null);
  setters.setLastRenderState({ stage: 'planning', progress: 0.1 });
  refs.requestStartAtRef.current = performance.now();

  refs.abortControllerRef.current = new AbortController();
  let timeoutHandle: number | null = null;
  let timedOut = false;
  let fullContent = '';

  try {
    timeoutHandle = window.setTimeout(() => {
      timedOut = true;
      refs.abortControllerRef.current?.abort();
    }, args.timeoutMs ?? 60000);

    const latestUserInput =
      [...context.apiMessages].reverse().find((message) => message.role === 'user')?.content || '';

    const {
      payload: requestPayload,
      effectiveQuizRun,
      isQuizTurn,
    } = buildChatRequestPayload({
      context,
      latestUserInput,
      getCanvasChildSessionId,
    });

    let ttftCaptured = false;
    const captureTtft = (providerLatencyMs?: number | null) => {
      if (ttftCaptured || refs.requestStartAtRef.current === null) {
        return;
      }
      ttftCaptured = true;
      const ttftMs = Math.max(0, Math.round(performance.now() - refs.requestStartAtRef.current));
      setters.setChatPerf((prev) => ({
        ...prev,
        ttftMs,
        lastUpdatedAt: Date.now(),
      }));

      void recordLearningEvent({
        userId,
        eventName: 'chat.ttft',
        sessionId: context.sessionId,
        payload: {
          surface: context.surface,
          mode: context.mode,
          trigger: context.trigger,
          ttftMs,
          providerLatencyMs: providerLatencyMs ?? null,
        },
      });
    };

    const shouldUseEdgeStreaming =
      !isQuizTurn && context.mode !== 'canvas' && !effectiveQuizRun?.runId;

    const result = await invokeChatRequest(requestPayload, {
      signal: refs.abortControllerRef.current.signal,
      shouldUseEdgeStreaming,
      onMeta: (meta) => {
        if (!meta || typeof meta !== 'object') return;
        const data = meta as { renderState?: ChatRenderState; contextMeta?: ContextMeta };
        if (data.renderState) {
          setters.setLastRenderState(data.renderState);
        }
        if (data.contextMeta) {
          setters.setLastContextMeta(data.contextMeta);
        }
      },
      onDelta: (delta) => {
        if (!delta) return;
        captureTtft();
        fullContent += delta;
        setters.setStreamingContent(fullContent);
        setters.setLastRenderState({ stage: 'streaming' });
      },
    });

    captureTtft(result.perfMeta?.latencyMs ?? result.agentMeta?.latencyMs ?? null);

    const embeddedEnvelope = parseEmbeddedEnvelope(result.content);
    const replyContent = embeddedEnvelope.content || normalizeAssistantReplyContent(result.content);
    const hasRawArtifacts =
      (Array.isArray(result.artifacts) && result.artifacts.length > 0) ||
      embeddedEnvelope.artifacts.length > 0;
    if (!replyContent && !hasRawArtifacts) {
      throw new EdgeFunctionError('AI returned malformed content. Please retry.', {
        status: 502,
        code: 'malformed_content',
      });
    }

    const mergedSources =
      Array.isArray(result.sources) && result.sources.length > 0
        ? result.sources
        : embeddedEnvelope.sources;

    const sourceArtifact: ChatArtifact[] =
      mergedSources.length > 0
        ? [
            {
              type: 'web_sources',
              payload: {
                title: 'Web sources',
                sources: mergedSources,
              },
            },
          ]
        : [];

    let artifacts = normalizeArtifacts([
      ...(result.artifacts || []),
      ...embeddedEnvelope.artifacts,
      ...sourceArtifact,
    ]);
    let hasQuizArtifact = artifacts.some((artifact) => artifact.type === 'quiz');

    if (isQuizTurn && !hasQuizArtifact) {
      const recoveredQuiz = parseLooseQuizArtifactFromText(replyContent);
      if (recoveredQuiz) {
        artifacts = normalizeArtifacts([...artifacts, recoveredQuiz]);
        hasQuizArtifact = artifacts.some((artifact) => artifact.type === 'quiz');
      }
    }

    if (isQuizTurn && !hasQuizArtifact) {
      throw new EdgeFunctionError('AI did not return a structured quiz item. Please retry.', {
        status: 502,
        code: 'quiz_artifact_missing',
      });
    }

    const safeReplyContent = hasQuizArtifact || Boolean(context.quizRun?.runId) ? '' : replyContent;
    setters.setLastAgentMeta(result.agentMeta || null);
    setters.setLastRenderState(result.renderState || null);
    setters.setLastSources(mergedSources);
    setters.setLastToolRuns(Array.isArray(result.toolRuns) ? result.toolRuns : []);
    setters.setLastContextMeta(result.contextMeta || null);
    setters.setLastMemoryUsed(Array.isArray(result.memoryUsed) ? result.memoryUsed : []);
    setters.setLastMemoryWrites(Array.isArray(result.memoryWrites) ? result.memoryWrites : []);
    setters.setLastMemoryTraceId(typeof result.memoryTraceId === 'string' ? result.memoryTraceId : null);

    void trackExperimentEvent('chat_reply_received', {
      surface: context.surface,
      mode: context.mode,
      trigger: context.trigger,
      hasArtifacts: artifacts.length > 0,
      artifactTypes: artifacts.map((artifact) => artifact.type),
      sourceCount: mergedSources.length,
      searchTriggered: Boolean(result.contextMeta?.searchTriggered),
      memoryUsed: Array.isArray(result.memoryUsed) ? result.memoryUsed.length : 0,
      memoryWrites: Array.isArray(result.memoryWrites) ? result.memoryWrites.length : 0,
    });

    if (!shouldUseEdgeStreaming) {
      const chunks = safeReplyContent.match(/[\s\S]{1,120}/g) || [safeReplyContent];
      let lastFlushAt = performance.now();
      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        if (refs.abortControllerRef.current?.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        fullContent += chunk;
        const now = performance.now();
        const isLast = index === chunks.length - 1;
        const shouldFlush = isLast || now - lastFlushAt >= 16;
        if (!shouldFlush) continue;

        setters.setStreamingContent(fullContent);
        setters.setLastRenderState({
          stage: 'streaming',
          progress: Math.min(0.98, fullContent.length / Math.max(safeReplyContent.length, 1)),
        });
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        lastFlushAt = performance.now();
      }
    } else if (!fullContent && safeReplyContent) {
      fullContent = safeReplyContent;
      setters.setStreamingContent(fullContent);
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: fullContent,
      createdAt: Date.now(),
      artifacts: artifacts.length > 0 ? artifacts : undefined,
      // Surface the coaching actions so ChatMessageBubble can render the
      // post-reply "Next step" chips. The actions are also persisted into
      // the coach review queue below — this field is purely the in-memory
      // copy used to draw the chip strip for the current turn.
      coachingActions:
        Array.isArray(result.coachingActions) && result.coachingActions.length > 0
          ? result.coachingActions
          : undefined,
    };

    await appendAssistantMessage(context.sessionId, assistantMessage);

    // Persist any schedulable coaching actions into the coach review queue
    // BEFORE we finish the turn. The router is idempotent on userInputRef +
    // action shape, so a retry of the same turn won't double-add. Failures
    // here must not bubble — the user already has their reply.
    try {
      const summary = applyCoachingActions(result.coachingActions, {
        userInputRef: assistantMessage.id,
      });
      if (summary.persisted > 0) {
        void trackExperimentEvent('chat_coaching_actions_persisted', {
          sessionId: context.sessionId,
          messageId: assistantMessage.id,
          surface: context.surface,
          mode: context.mode,
          persistedCount: summary.persisted,
          skills: summary.reviewItems.map((item) => item.skill),
        });
      }
    } catch (routerError) {
      // Best-effort persistence; don't fail the turn for a localStorage hiccup.
      console.error('[assistantReply] applyCoachingActions failed', routerError);
    }

    if (context.quizRun?.runId) {
      const firstQuizArtifact = artifacts.find(
        (artifact): artifact is Extract<ChatArtifact, { type: 'quiz' }> => artifact.type === 'quiz',
      );
      if (firstQuizArtifact) {
        if (refs.nextQuestionRequestAtRef.current !== null) {
          const nextQuestionMs = Math.max(
            0,
            Math.round(performance.now() - refs.nextQuestionRequestAtRef.current),
          );
          refs.nextQuestionRequestAtRef.current = null;
          setters.setChatPerf((prev) => ({
            ...prev,
            nextQuestionMs,
            lastUpdatedAt: Date.now(),
          }));
          void recordLearningEvent({
            userId,
            eventName: 'chat.quiz_next_latency',
            sessionId: context.sessionId,
            payload: {
              runId: context.quizRun.runId,
              questionIndex: context.quizRun.questionIndex,
              targetCount: context.quizRun.targetCount,
              nextQuestionMs,
            },
          });
        }
        persistQuizRuns((prev) => {
          const existing = prev[context.sessionId];
          if (!existing || existing.runId !== context.quizRun?.runId) {
            return prev;
          }
          return {
            ...prev,
            [context.sessionId]: {
              ...existing,
              status: 'awaiting_answer',
              currentQuizId: firstQuizArtifact.payload.quizId,
            },
          };
        });
      }
    }
    refs.failedRequestRef.current = null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (timedOut && !fullContent) {
        refs.failedRequestRef.current = context;
        setters.setChatError({
          status: 504,
          code: 'timeout',
          message: 'AI 响应超时，请重试或简化问题。',
        });
        return;
      }
      const partial = fullContent || streamingContent;
      if (partial) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: partial,
          createdAt: Date.now(),
        };
        await appendAssistantMessage(context.sessionId, assistantMessage);
      }
    } else {
      refs.failedRequestRef.current = context;
      setters.setChatError(toRequestError(error));
    }
  } finally {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
    }
    setters.setIsLoading(false);
    setters.setStreamingContent('');
    setters.setLastRenderState((prev) => (prev ? { ...prev, progress: 1 } : null));
    refs.abortControllerRef.current = null;
    refs.requestStartAtRef.current = null;
  }
}

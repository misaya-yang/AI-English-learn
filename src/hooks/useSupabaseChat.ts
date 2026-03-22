import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { supabase, getAnonymousUserId } from '@/lib/supabase';
import { recordLearningEvent } from '@/services/learningEvents';
import {
  buildFastGreetingReply,
  buildFastPathDecision,
} from '@/features/chat/runtime/fastPath';
import { type ChatAssistantRequestContext } from '@/features/chat/runtime/requestPayload';
import { trackChatExperimentAndLearningEvent } from '@/features/chat/runtime/recorders';
import {
  countPendingSync,
  loadLocalQuizAttempts,
  loadLocalQuizRuns,
  loadLocalSessions,
  mergeSessions,
  saveLocalQuizAttempts,
  saveLocalQuizRuns,
  saveLocalSessions,
  sortSessionsByUpdate,
} from '@/features/chat/runtime/persistence';
import { requestAssistantReplyPipeline } from '@/features/chat/runtime/assistantReply';
import {
  clearRemoteSessionMessages,
  createRemoteSession,
  deleteAllRemoteSessionsCascade,
  deleteRemoteSessionCascade,
  insertRemoteQuizAttempt,
  loadRemoteSessionsSnapshot,
  saveRemoteAssistantMessage,
  saveRemoteUserMessage,
  syncLocalSessionsToRemote,
  updateRemoteSessionTitle,
} from '@/features/chat/runtime/sessionMutations';
import {
  advanceQuizRunState,
  buildQuizAttempt,
  clearQuizRunState,
  createQuizRunState,
  markQuizRunRequestingNext,
  mergeRemoteQuizAttempts,
} from '@/features/chat/runtime/quizRuntime';
import type {
  ChatMessage,
  ChatRequestError,
  ChatSession,
  ChatSyncState,
} from '@/features/chat/state/types';
import type {
  AgentMeta,
  ChatFastPathDecision,
  ChatRenderState,
  ChatPerfSnapshot,
  ChatSource,
  ChatMode,
  ChatQuizAttempt,
  ContextMeta,
  MemoryUsedTrace,
  MemoryWriteTrace,
  QuizRunState,
  SendMessageOptions,
  ToolRun,
} from '@/types/chatAgent';

type FailedRequestContext = ChatAssistantRequestContext;

const CHAT_CURRENT_SESSION_KEY = 'vocabdaily-current-chat-session';
const CHAT_CANVAS_SESSION_MAP_KEY = 'vocabdaily-canvas-child-session-map';
// Keep enough recent turns to support 5-10 round coherent tutoring dialogues.
const MAX_HISTORY_TURNS = 10;
const MAX_CONTEXT_CHARS = 760;
const MAX_USER_CHARS = 760;
const CHAT_REQUEST_TIMEOUT_MS = 60000;

const clipForContext = (value: string, limit: number): string => {
  const input = value.trim();
  if (input.length <= limit) return input;

  const head = Math.max(200, Math.floor(limit * 0.75));
  const tail = Math.max(80, limit - head - 8);
  return `${input.slice(0, head)}\n...\n${input.slice(-tail)}`;
};

function generateTitle(content: string): string {
  const cleanContent = content
    .replace(/[#*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanContent.length <= 25) {
    return cleanContent;
  }

  const breakPoints = ['。', '？', '！', '. ', '? ', '! '];
  for (const bp of breakPoints) {
    const idx = cleanContent.indexOf(bp, 15);
    if (idx > 0 && idx < 40) {
      return cleanContent.slice(0, idx + 1);
    }
  }

  return cleanContent.slice(0, 25) + '...';
}

export function useSupabaseChat() {
  const userId = getAnonymousUserId();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    return localStorage.getItem(CHAT_CURRENT_SESSION_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [dbReady, setDbReady] = useState(true);
  const [syncState, setSyncState] = useState<ChatSyncState>({ source: 'remote', pendingSyncCount: 0 });
  const [chatError, setChatError] = useState<ChatRequestError | null>(null);
  const [quizAttemptsById, setQuizAttemptsById] = useState<Record<string, ChatQuizAttempt>>(() =>
    loadLocalQuizAttempts(),
  );
  const [quizRunsBySession, setQuizRunsBySession] = useState<Record<string, QuizRunState>>(() =>
    loadLocalQuizRuns(),
  );
  const [lastAgentMeta, setLastAgentMeta] = useState<AgentMeta | null>(null);
  const [lastRenderState, setLastRenderState] = useState<ChatRenderState | null>(null);
  const [lastSources, setLastSources] = useState<ChatSource[]>([]);
  const [lastToolRuns, setLastToolRuns] = useState<ToolRun[]>([]);
  const [lastContextMeta, setLastContextMeta] = useState<ContextMeta | null>(null);
  const [lastMemoryUsed, setLastMemoryUsed] = useState<MemoryUsedTrace[]>([]);
  const [lastMemoryWrites, setLastMemoryWrites] = useState<MemoryWriteTrace[]>([]);
  const [lastMemoryTraceId, setLastMemoryTraceId] = useState<string | null>(null);
  const [chatPerf, setChatPerf] = useState<ChatPerfSnapshot>({
    ttftMs: null,
    nextQuestionMs: null,
    lastUpdatedAt: null,
  });
  const [lastFastPathDecision, setLastFastPathDecision] = useState<ChatFastPathDecision>({
    enabled: false,
    reason: 'normal',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const failedRequestRef = useRef<FailedRequestContext | null>(null);
  const canvasSessionMapRef = useRef<Record<string, string>>({});
  const requestStartAtRef = useRef<number | null>(null);
  const nextQuestionRequestAtRef = useRef<number | null>(null);

  const currentSession = sessions.find((session) => session.id === currentSessionId) || null;
  const quizRunState = currentSessionId ? quizRunsBySession[currentSessionId] || null : null;
  const messages = useMemo(() => {
    const source = currentSession?.messages || [];
    const unique = new Map<string, ChatMessage>();
    source.forEach((message) => {
      if (!unique.has(message.id)) {
        unique.set(message.id, message);
      }
    });
    return [...unique.values()].sort((a, b) => a.createdAt - b.createdAt);
  }, [currentSession]);

  const persistSessions = useCallback((nextSessions: ChatSession[]) => {
    const sorted = sortSessionsByUpdate(nextSessions);
    setSessions(sorted);
    saveLocalSessions(sorted);
  }, []);

  const updateSessions = useCallback((updater: (prev: ChatSession[]) => ChatSession[]) => {
    setSessions((prev) => {
      const next = sortSessionsByUpdate(updater(prev));
      saveLocalSessions(next);
      return next;
    });
  }, []);

  const ensureValidCurrentSession = useCallback((nextSessions: ChatSession[]) => {
    setCurrentSessionId((prev) => {
      if (prev && nextSessions.some((session) => session.id === prev)) {
        return prev;
      }
      return nextSessions.length > 0 ? nextSessions[0].id : null;
    });
  }, []);

  const syncLocalToRemote = useCallback(
    async (
      localSessions: ChatSession[],
      remoteSessionIds: Set<string>,
      remoteMessageIdsBySession: Map<string, Set<string>>,
      remoteUpdatedAtBySession: Map<string, number>,
    ): Promise<number> => {
      return syncLocalSessionsToRemote({
        localSessions,
        remoteSessionIds,
        remoteMessageIdsBySession,
        remoteUpdatedAtBySession,
        userId,
      });
    },
    [userId],
  );

  const loadSessions = useCallback(async () => {
    const localSessions = loadLocalSessions();

    try {
      const {
        remoteSessions,
        remoteSessionIds,
        remoteMessageIdsBySession,
        remoteUpdatedAtBySession,
      } = await loadRemoteSessionsSnapshot(userId);

      const mergedSessions = mergeSessions(remoteSessions, localSessions);
      persistSessions(mergedSessions);
      ensureValidCurrentSession(mergedSessions);
      setDbReady(true);

      try {
        const { data: remoteAttempts } = await supabase
          .from('chat_quiz_attempts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(500);

        const localAttempts = loadLocalQuizAttempts();
        const mergedAttempts = mergeRemoteQuizAttempts(
          localAttempts,
          (remoteAttempts || []) as Array<Record<string, unknown>>,
          userId,
        );

        setQuizAttemptsById(mergedAttempts);
        saveLocalQuizAttempts(mergedAttempts);
      } catch {
        // Optional table may not exist; keep local attempt state.
      }

      const pendingBefore = countPendingSync(localSessions, remoteSessionIds, remoteMessageIdsBySession);
      const source: ChatSyncState['source'] =
        localSessions.length > 0 && remoteSessions.length > 0
          ? 'merged'
          : remoteSessions.length > 0
            ? 'remote'
            : localSessions.length > 0
              ? 'local'
              : 'remote';

      setSyncState({ source, pendingSyncCount: pendingBefore });

      if (pendingBefore > 0) {
        const failed = await syncLocalToRemote(
          localSessions,
          remoteSessionIds,
          remoteMessageIdsBySession,
          remoteUpdatedAtBySession,
        );

        setSyncState({
          source: failed === 0 ? 'merged' : 'local',
          pendingSyncCount: failed,
        });
      }
    } catch (error) {
      console.warn('Falling back to local chat storage (unexpected error):', error);
      persistSessions(localSessions);
      ensureValidCurrentSession(localSessions);
      setDbReady(false);
      setSyncState({ source: 'local', pendingSyncCount: localSessions.length });
    }
  }, [ensureValidCurrentSession, persistSessions, syncLocalToRemote, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSessions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CHAT_CURRENT_SESSION_KEY, currentSessionId);
    } else {
      localStorage.removeItem(CHAT_CURRENT_SESSION_KEY);
    }
  }, [currentSessionId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_CANVAS_SESSION_MAP_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        canvasSessionMapRef.current = parsed as Record<string, string>;
      }
    } catch {
      canvasSessionMapRef.current = {};
    }
  }, []);

  const getCanvasChildSessionId = useCallback((parentSessionId: string) => {
    const existing = canvasSessionMapRef.current[parentSessionId];
    if (existing) return existing;

    const child = crypto.randomUUID();
    canvasSessionMapRef.current = {
      ...canvasSessionMapRef.current,
      [parentSessionId]: child,
    };
    localStorage.setItem(CHAT_CANVAS_SESSION_MAP_KEY, JSON.stringify(canvasSessionMapRef.current));
    return child;
  }, []);

  const trackExperimentEvent = useCallback(
    async (eventName: string, payload: Record<string, unknown>) => {
      await trackChatExperimentAndLearningEvent({
        userId,
        eventName,
        payload,
      });
    },
    [userId],
  );

  const persistQuizAttemptMap = useCallback((updater: (prev: Record<string, ChatQuizAttempt>) => Record<string, ChatQuizAttempt>) => {
    setQuizAttemptsById((prev) => {
      const next = updater(prev);
      saveLocalQuizAttempts(next);
      return next;
    });
  }, []);

  const persistQuizRuns = useCallback((updater: (prev: Record<string, QuizRunState>) => Record<string, QuizRunState>) => {
    setQuizRunsBySession((prev) => {
      const next = updater(prev);
      saveLocalQuizRuns(next);
      return next;
    });
  }, []);

  const startQuizRun = useCallback((targetCount: number, seedPrompt: string, sessionId?: string | null) => {
    const effectiveSessionId = sessionId || currentSessionId;
    if (!effectiveSessionId) return null;
    const run = createQuizRunState(targetCount, seedPrompt);
    persistQuizRuns((prev) => ({
      ...prev,
      [effectiveSessionId]: run,
    }));
    return run;
  }, [currentSessionId, persistQuizRuns]);

  const advanceQuizRun = useCallback((args: {
    sessionId: string;
    quizId: string;
    isCorrect: boolean;
    usedWord?: string;
  }) => {
    let nextRun: QuizRunState | null = null;
    persistQuizRuns((prev) => {
      const next = advanceQuizRunState(prev[args.sessionId], {
        quizId: args.quizId,
        usedWord: args.usedWord,
      });
      if (!next) {
        nextRun = null;
        return prev;
      }
      nextRun = next;
      return {
        ...prev,
        [args.sessionId]: next,
      };
    });
    return nextRun;
  }, [persistQuizRuns]);

  const recoverQuizRunFromSession = useCallback((sessionId: string) => {
    return quizRunsBySession[sessionId] || null;
  }, [quizRunsBySession]);

  const clearQuizRun = useCallback((sessionId?: string | null) => {
    const effectiveSessionId = sessionId || currentSessionId;
    if (!effectiveSessionId) return;
    persistQuizRuns((prev) => clearQuizRunState(prev, effectiveSessionId));
  }, [currentSessionId, persistQuizRuns]);

  const createSession = useCallback(async (title: string = '新对话') => {
    const sessionId = crypto.randomUUID();
    const now = Date.now();

    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      await createRemoteSession({ sessionId, userId, title, now });

      setSyncState((prev) => ({ ...prev, source: prev.pendingSyncCount > 0 ? 'merged' : 'remote' }));
    } catch (error) {
      console.error('Error creating session:', error);
      setSyncState((prev) => ({
        source: 'local',
        pendingSyncCount: Math.max(1, prev.pendingSyncCount + 1),
      }));
    }

    updateSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(sessionId);
    return sessionId;
  }, [updateSessions, userId]);

  const updateSessionTitle = useCallback(async (sessionId: string, newTitle: string) => {
    let remoteOk = true;
    try {
      await updateRemoteSessionTitle({ sessionId, userId, title: newTitle });
    } catch (error) {
      console.error('Error updating title:', error);
      remoteOk = false;
    }

    setSyncState((prev) => ({
      source: remoteOk ? (prev.pendingSyncCount > 0 ? 'merged' : 'remote') : 'local',
      pendingSyncCount: remoteOk ? prev.pendingSyncCount : prev.pendingSyncCount + 1,
    }));

    updateSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          return { ...session, title: newTitle, updatedAt: Date.now() };
        }
        return session;
      }),
    );
  }, [updateSessions, userId]);

  const deleteSession = useCallback((sessionId: string) => {
    const remaining = sessions.filter((session) => session.id !== sessionId);
    updateSessions((prev) => prev.filter((session) => session.id !== sessionId));
    persistQuizRuns((prev) => {
      if (!prev[sessionId]) return prev;
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });

    if (currentSessionId === sessionId) {
      setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
      setStreamingContent('');
      setIsLoading(false);
      setChatError(null);
      setChatPerf({ ttftMs: null, nextQuestionMs: null, lastUpdatedAt: null });
    }

    void (async () => {
      let remoteOk = true;
      try {
        await deleteRemoteSessionCascade({ sessionId, userId });
      } catch (error) {
        console.error('Error deleting session:', error);
        remoteOk = false;
      }

      if (!remoteOk) {
        setSyncState((prev) => ({
          source: 'local',
          pendingSyncCount: prev.pendingSyncCount + 1,
        }));
      }
    })();
  }, [currentSessionId, persistQuizRuns, sessions, updateSessions, userId]);

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setStreamingContent('');
    setIsLoading(false);
    setChatError(null);
    setChatPerf((prev) => ({ ...prev, lastUpdatedAt: Date.now() }));
  }, []);

  const appendAssistantMessage = useCallback(
    async (sessionId: string, assistantMessage: ChatMessage) => {
      // Optimistically render first so short replies (for example greetings) feel instant.
      updateSessions((prev) =>
        prev.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantMessage],
              updatedAt: Date.now(),
            };
          }
          return session;
        }),
      );

      try {
        await saveRemoteAssistantMessage({ sessionId, userId, assistantMessage });
      } catch (error) {
        console.error('Error saving assistant message:', error);
        setSyncState((prev) => ({
          source: 'local',
          pendingSyncCount: prev.pendingSyncCount + 1,
        }));
      }
    },
    [updateSessions, userId],
  );

  const requestAssistantReply = useCallback(
    async (context: FailedRequestContext) => {
      await requestAssistantReplyPipeline({
        context,
        userId,
        streamingContent,
        timeoutMs: CHAT_REQUEST_TIMEOUT_MS,
        getCanvasChildSessionId,
        appendAssistantMessage,
        persistQuizRuns,
        trackExperimentEvent,
        refs: {
          abortControllerRef,
          failedRequestRef,
          requestStartAtRef,
          nextQuestionRequestAtRef,
        },
        setters: {
          setIsLoading,
          setStreamingContent,
          setChatError,
          setLastRenderState,
          setChatPerf,
          setLastAgentMeta,
          setLastSources,
          setLastToolRuns,
          setLastContextMeta,
          setLastMemoryUsed,
          setLastMemoryWrites,
          setLastMemoryTraceId,
        },
      });
    },
    [appendAssistantMessage, getCanvasChildSessionId, persistQuizRuns, streamingContent, trackExperimentEvent, userId],
  );

  const sendMessage = useCallback(async (content: string, options: SendMessageOptions = {}) => {
    if (!content.trim() || isLoading) return;

    let sessionId = currentSessionId;
    let isNewSession = false;

    if (!sessionId) {
      sessionId = await createSession();
      isNewSession = true;
    }

    const now = Date.now();
    const surface = options.surface || 'chat';
    const mode: ChatMode = options.mode || 'study';
    const responseStyle: NonNullable<SendMessageOptions['responseStyle']> = options.responseStyle || 'coach';
    const searchMode = options.searchMode || 'auto';
    const quizPolicy = options.quizPolicy || { revealAnswer: 'after_submit' as const };
    const canvasSyncToParent = Boolean(options.canvasSyncToParent);
    const hideUserMessage = Boolean(options.hideUserMessage);
    const trigger = options.trigger || 'manual_input';
    const goalContext = typeof options.goalContext === 'string' && options.goalContext.trim().length > 0
      ? options.goalContext.trim()
      : undefined;
    const weakTags = Array.isArray(options.weakTags)
      ? Array.from(
          new Set(
            options.weakTags.filter((item): item is string => typeof item === 'string' && item.trim().length > 0),
          ),
        ).slice(0, 8)
      : undefined;
    const displayContent = content.trim();
    const apiUserContent = (options.apiContentOverride || content).trim();
    if (!apiUserContent) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: displayContent,
      createdAt: now,
    };

    const sessionSnapshot = sessions.find((session) => session.id === sessionId);
    const shouldUpdateTitle =
      !hideUserMessage && (isNewSession || (sessionSnapshot && sessionSnapshot.messages.length === 0));
    const newTitle = shouldUpdateTitle ? generateTitle(displayContent) : undefined;

    if (!hideUserMessage) {
      void (async () => {
        let remoteMessageSaved = true;
        try {
          await saveRemoteUserMessage({
            sessionId,
            userId,
            message: userMessage,
            newTitle,
            now,
          });
        } catch (error) {
          console.error('Error saving user message:', error);
          remoteMessageSaved = false;
        }

        if (!remoteMessageSaved) {
          setSyncState((prev) => ({
            source: 'local',
            pendingSyncCount: prev.pendingSyncCount + 1,
          }));
        }
      })();
    }

    if (!hideUserMessage) {
      updateSessions((prev) =>
        {
          let found = false;
          const updated = prev.map((session) => {
            if (session.id === sessionId) {
              found = true;
              return {
                ...session,
                title: newTitle || session.title,
                messages: [...session.messages, userMessage],
                updatedAt: now,
              };
            }
            return session;
          });

          if (found) {
            return updated;
          }

          const fallbackSession: ChatSession = {
            id: sessionId,
            title: newTitle || generateTitle(displayContent),
            messages: [userMessage],
            createdAt: now,
            updatedAt: now,
          };

          return [fallbackSession, ...updated];
        },
      );
    }
    setCurrentSessionId(sessionId);

    const localSnapshotMessages =
      !hideUserMessage && sessionSnapshot
        ? [...sessionSnapshot.messages, userMessage]
        : (sessionSnapshot?.messages || []);

    const historyMessages = localSnapshotMessages
      .filter(
        (message) =>
          (message.role === 'user' || message.role === 'assistant') &&
          message.content.trim().length > 0,
      )
      .slice(-MAX_HISTORY_TURNS);

    const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...historyMessages.map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: clipForContext(message.content, MAX_CONTEXT_CHARS),
      })),
      { role: 'user', content: clipForContext(apiUserContent, MAX_USER_CHARS) },
    ];

    const fastPathDecision = buildFastPathDecision({
      input: apiUserContent,
      mode,
      forceQuiz: Boolean(options.featureFlags?.forceQuiz),
      quizRun: options.quizRun,
    });
    const shouldUseFastGreetingReply = fastPathDecision.enabled;

    setLastFastPathDecision(fastPathDecision);

    void trackExperimentEvent('chat_message_sent', {
      surface,
      mode,
      searchMode,
      responseStyle,
      trigger,
      sessionId,
      synthetic: hideUserMessage,
      hasHistory: historyMessages.length > 0,
      weakTagCount: weakTags?.length || 0,
      weakTags: weakTags || [],
    });

    void recordLearningEvent({
      userId,
      eventName: 'chat.message_sent',
      sessionId,
      payload: {
        surface,
        mode,
        searchMode,
        trigger,
        synthetic: hideUserMessage,
        messageLength: displayContent.length,
        weakTagCount: weakTags?.length || 0,
        weakTags: weakTags || [],
      },
    });

    if (shouldUseFastGreetingReply) {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: buildFastGreetingReply(apiUserContent),
        createdAt: Date.now(),
      };

      void appendAssistantMessage(sessionId, assistantMessage);
      setChatError(null);
      setLastRenderState(null);
      setLastToolRuns([]);
      setLastSources([]);
      setLastContextMeta(null);
      setLastMemoryUsed([]);
      setLastMemoryWrites([]);
      setLastMemoryTraceId(null);
      failedRequestRef.current = null;

      void trackExperimentEvent('chat_reply_received', {
        surface,
        mode,
        trigger,
        hasArtifacts: false,
        artifactTypes: [],
        sourceCount: 0,
        searchTriggered: false,
        memoryUsed: 0,
        memoryWrites: 0,
        fastGreetingPath: true,
      });
      void recordLearningEvent({
        userId,
        eventName: 'chat.fast_path_hit',
        sessionId,
        payload: {
          surface,
          mode,
          trigger,
          reason: 'simple_greeting',
        },
      });
      return;
    }

    if (hideUserMessage && options.quizRun?.runId && Number(options.quizRun.questionIndex) > 1) {
      nextQuestionRequestAtRef.current = performance.now();
    }

    await requestAssistantReply({
      sessionId,
      apiMessages,
      surface,
      goalContext,
      weakTags,
      mode,
      responseStyle,
      searchMode,
      quizPolicy,
      canvasSyncToParent,
      featureFlags: options.featureFlags,
      memoryPolicy: options.memoryPolicy,
      memoryControl: options.memoryControl,
      quizRun: options.quizRun,
      trigger,
    });
  }, [appendAssistantMessage, createSession, currentSessionId, isLoading, requestAssistantReply, sessions, trackExperimentEvent, updateSessions, userId]);

  const retryLastFailedMessage = useCallback(async () => {
    if (isLoading) return;
    if (!failedRequestRef.current) return;

    void trackExperimentEvent('chat_retry_last_failed', {
      sessionId: failedRequestRef.current.sessionId,
      mode: failedRequestRef.current.mode,
    });
    await requestAssistantReply(failedRequestRef.current);
  }, [isLoading, requestAssistantReply, trackExperimentEvent]);

  const submitQuizAttempt = useCallback(
    async (args: {
      quizId: string;
      sessionId: string;
      runId?: string;
      questionIndex?: number;
      selected: string;
      isCorrect: boolean;
      durationMs: number;
      sourceMode: ChatMode;
    }) => {
      const attempt = buildQuizAttempt({
        quizId: args.quizId,
        sessionId: args.sessionId,
        userId,
        runId: args.runId,
        questionIndex: args.questionIndex,
        selected: args.selected,
        isCorrect: args.isCorrect,
        durationMs: args.durationMs,
        sourceMode: args.sourceMode,
      });

      persistQuizAttemptMap((prev) => ({
        ...prev,
        [attempt.quizId]: attempt,
      }));

      void trackExperimentEvent('quiz_attempt_submitted', {
        quizId: attempt.quizId,
        sessionId: attempt.sessionId,
        isCorrect: attempt.isCorrect,
        durationMs: attempt.durationMs,
        sourceMode: attempt.sourceMode,
      });

      void recordLearningEvent({
        userId,
        eventName: 'chat.quiz_attempted',
        sessionId: attempt.sessionId,
        payload: {
          quizId: attempt.quizId,
          runId: attempt.runId,
          questionIndex: attempt.questionIndex,
          isCorrect: attempt.isCorrect,
          durationMs: attempt.durationMs,
          sourceMode: attempt.sourceMode,
        },
      });

      try {
        await insertRemoteQuizAttempt(attempt);
      } catch {
        setSyncState((prev) => ({
          source: 'local',
          pendingSyncCount: prev.pendingSyncCount + 1,
        }));
      }

      return attempt;
    },
    [persistQuizAttemptMap, trackExperimentEvent, userId],
  );

  const goToNextQuizQuestion = useCallback((args: {
    sessionId: string;
    runId?: string;
    currentQuizId?: string;
  }) => {
    nextQuestionRequestAtRef.current = performance.now();
    let nextState: QuizRunState | null = null;
    persistQuizRuns((prev) => {
      const next = markQuizRunRequestingNext(prev[args.sessionId], {
        runId: args.runId,
        currentQuizId: args.currentQuizId,
      });
      if (!next) {
        return prev;
      }
      nextState = next;
      return {
        ...prev,
        [args.sessionId]: next,
      };
    });
    return nextState;
  }, [persistQuizRuns]);

  const submitQuizAnswer = useCallback(async (args: {
    quizId: string;
    sessionId: string;
    runId?: string;
    questionIndex?: number;
    selected: string;
    isCorrect: boolean;
    durationMs: number;
    sourceMode: ChatMode;
    usedWord?: string;
  }) => {
    const attempt = await submitQuizAttempt({
      quizId: args.quizId,
      sessionId: args.sessionId,
      runId: args.runId,
      questionIndex: args.questionIndex,
      selected: args.selected,
      isCorrect: args.isCorrect,
      durationMs: args.durationMs,
      sourceMode: args.sourceMode,
    });

    const nextRun = advanceQuizRun({
      sessionId: args.sessionId,
      quizId: args.quizId,
      isCorrect: args.isCorrect,
      usedWord: args.usedWord,
    });

    return {
      attempt,
      nextRun,
    };
  }, [advanceQuizRun, submitQuizAttempt]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(async () => {
    if (!currentSessionId) return;

    let remoteOk = true;
    try {
      await clearRemoteSessionMessages(currentSessionId);
    } catch (error) {
      console.error('Error clearing messages:', error);
      remoteOk = false;
    }

    updateSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [],
            updatedAt: Date.now(),
          };
        }
        return session;
      }),
    );
    clearQuizRun(currentSessionId);

    if (!remoteOk) {
      setSyncState((prev) => ({
        source: 'local',
        pendingSyncCount: prev.pendingSyncCount + 1,
      }));
    }
  }, [clearQuizRun, currentSessionId, updateSessions]);

  const deleteAllSessions = useCallback(async () => {
    let remoteOk = true;
    try {
      await deleteAllRemoteSessionsCascade({
        userId,
        sessionIds: sessions.map((session) => session.id),
      });
    } catch (error) {
      console.error('Error deleting all sessions:', error);
      remoteOk = false;
    }

    setSessions([]);
    setCurrentSessionId(null);
    setLastAgentMeta(null);
    setLastRenderState(null);
    setLastSources([]);
    setLastToolRuns([]);
    setLastContextMeta(null);
    setLastMemoryUsed([]);
    setLastMemoryWrites([]);
    setLastMemoryTraceId(null);
    setChatPerf({ ttftMs: null, nextQuestionMs: null, lastUpdatedAt: null });
    setQuizRunsBySession({});
    saveLocalSessions([]);
    localStorage.removeItem(CHAT_CURRENT_SESSION_KEY);
    saveLocalQuizRuns({});

    if (!remoteOk) {
      setSyncState((prev) => ({
        source: 'local',
        pendingSyncCount: prev.pendingSyncCount + 1,
      }));
    } else {
      setSyncState({ source: 'remote', pendingSyncCount: 0 });
    }
  }, [sessions, userId]);

  return {
    sessions,
    currentSession,
    currentSessionId,
    messages,
    isLoading,
    streamingContent,
    dbReady,
    syncState,
    quizAttemptsById,
    quizRunState,
    lastAgentMeta,
    lastRenderState,
    lastSources,
    lastToolRuns,
    lastContextMeta,
    lastMemoryUsed,
    lastMemoryWrites,
    lastMemoryTraceId,
    chatPerf,
    lastFastPathDecision,
    chatError,
    sendMessage,
    submitQuizAttempt,
    submitQuizAnswer,
    startQuizRun,
    advanceQuizRun,
    goToNextQuizQuestion,
    recoverQuizRunFromSession,
    clearQuizRun,
    createSession,
    deleteSession,
    switchSession,
    updateSessionTitle,
    retryLastFailedMessage,
    stopGeneration,
    clearMessages,
    deleteAllSessions,
  };
}

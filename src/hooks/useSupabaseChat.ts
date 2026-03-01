import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { supabase, getAnonymousUserId } from '@/lib/supabase';
import { AuthRequiredError, EdgeFunctionError, invokeEdgeFunction } from '@/services/aiGateway';
import { attachArtifactsToContent, extractArtifactsFromContent, normalizeArtifacts } from '@/services/chatArtifacts';
import { recordLearningEvent } from '@/services/learningEvents';
import type {
  AgentMeta,
  ChatArtifact,
  ChatEdgeResponse,
  ChatMode,
  ChatQuizAttempt,
  SendMessageOptions,
} from '@/types/chatAgent';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  artifacts?: ChatArtifact[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatSyncState {
  source: 'remote' | 'local' | 'merged';
  pendingSyncCount: number;
}

export interface ChatRequestError {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
}

interface FailedRequestContext {
  sessionId: string;
  apiMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  mode: ChatMode;
  featureFlags: SendMessageOptions['featureFlags'];
  trigger: NonNullable<SendMessageOptions['trigger']>;
}

const CHAT_SESSIONS_STORAGE_KEY = 'vocabdaily-chat-sessions';
const CHAT_CURRENT_SESSION_KEY = 'vocabdaily-current-chat-session';
const CHAT_QUIZ_ATTEMPTS_STORAGE_KEY = 'vocabdaily-chat-quiz-attempts';
const CHAT_EXPERIMENT_EVENTS_STORAGE_KEY = 'vocabdaily-chat-experiment-events';
const MAX_HISTORY_TURNS = 4;
const MAX_CONTEXT_CHARS = 420;
const MAX_USER_CHARS = 900;
const CHAT_REQUEST_TIMEOUT_MS = 45000;
const MAX_TOKENS_BY_MODE: Record<ChatMode, number> = {
  chat: 900,
  study: 1100,
  quiz: 1300,
  canvas: 1500,
};
const TEMPERATURE_BY_MODE: Record<ChatMode, number> = {
  chat: 0.55,
  study: 0.6,
  quiz: 0.5,
  canvas: 0.65,
};

// System prompt for English tutor
const SYSTEM_PROMPT = `You are an expert English tutor specializing in helping Chinese-speaking learners. Your responses should be:

1. Clear and educational
2. Include both English and Chinese explanations when helpful
3. Provide examples and context
4. Be encouraging and supportive

When explaining vocabulary:
- Provide clear definitions
- Give example sentences
- Explain usage contexts
- Note common collocations
- Highlight differences between similar words

When correcting grammar:
- Explain the rule clearly
- Show the correct form
- Provide examples
- Explain why it's wrong

Keep responses concise but comprehensive. Use markdown formatting for clarity.`;

const clipForContext = (value: string, limit: number): string => {
  const input = value.trim();
  if (input.length <= limit) return input;

  const head = Math.max(200, Math.floor(limit * 0.75));
  const tail = Math.max(80, limit - head - 8);
  return `${input.slice(0, head)}\n...\n${input.slice(-tail)}`;
};

// Generate title from first user message
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

function parseTimestamp(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value).getTime();
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function sortSessionsByUpdate(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
}

function mergeMessages(remoteMessages: ChatMessage[], localMessages: ChatMessage[]): ChatMessage[] {
  const mergedById = new Map<string, ChatMessage>();

  [...remoteMessages, ...localMessages].forEach((message) => {
    if (!message?.id) return;

    const existing = mergedById.get(message.id);
    if (!existing) {
      mergedById.set(message.id, message);
      return;
    }

    mergedById.set(message.id, {
      id: existing.id,
      role: existing.createdAt <= message.createdAt ? existing.role : message.role,
      content: existing.createdAt <= message.createdAt ? existing.content : message.content,
      createdAt: Math.min(existing.createdAt, message.createdAt),
      artifacts:
        (existing.artifacts && existing.artifacts.length > 0
          ? existing.artifacts
          : message.artifacts) || undefined,
    });
  });

  return [...mergedById.values()].sort((a, b) => a.createdAt - b.createdAt);
}

function normalizeLocalSessions(raw: unknown): ChatSession[] {
  if (!Array.isArray(raw)) return [];

  const normalized: ChatSession[] = [];

  raw.forEach((candidate) => {
    if (!candidate || typeof candidate !== 'object') return;

    const input = candidate as Partial<ChatSession>;
    if (!input.id || typeof input.id !== 'string') return;

    const fallbackNow = Date.now();
    const messages = Array.isArray(input.messages)
      ? input.messages
          .filter((message): message is ChatMessage => {
            if (!message || typeof message !== 'object') return false;
            const entry = message as Partial<ChatMessage>;
            return Boolean(
              typeof entry.id === 'string' &&
                (entry.role === 'user' || entry.role === 'assistant' || entry.role === 'system') &&
                typeof entry.content === 'string',
            );
          })
          .map((message) => {
            const parsed = extractArtifactsFromContent(message.content);
            const artifacts = Array.isArray((message as { artifacts?: unknown }).artifacts)
              ? normalizeArtifacts((message as { artifacts?: unknown }).artifacts)
              : parsed.artifacts;

            return {
              id: message.id,
              role: message.role,
              content: parsed.content,
              createdAt: parseTimestamp(message.createdAt, fallbackNow),
              artifacts: artifacts.length > 0 ? artifacts : undefined,
            };
          })
      : [];

    const createdAt = parseTimestamp(input.createdAt, fallbackNow);
    const updatedAt = parseTimestamp(input.updatedAt, createdAt);

    normalized.push({
      id: input.id,
      title: typeof input.title === 'string' && input.title.trim().length > 0 ? input.title : '新对话',
      messages: messages.sort((a, b) => a.createdAt - b.createdAt),
      createdAt,
      updatedAt,
    });
  });

  return sortSessionsByUpdate(normalized);
}

function loadLocalSessions(): ChatSession[] {
  const raw = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
  if (!raw) return [];

  try {
    return normalizeLocalSessions(JSON.parse(raw));
  } catch {
    return [];
  }
}

function saveLocalSessions(sessions: ChatSession[]): void {
  localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

function loadLocalQuizAttempts(): Record<string, ChatQuizAttempt> {
  const raw = localStorage.getItem(CHAT_QUIZ_ATTEMPTS_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, ChatQuizAttempt>;
    const result: Record<string, ChatQuizAttempt> = {};
    Object.values(parsed).forEach((item) => {
      if (!item || !item.quizId) return;
      result[item.quizId] = item;
    });
    return result;
  } catch {
    return {};
  }
}

function saveLocalQuizAttempts(map: Record<string, ChatQuizAttempt>): void {
  localStorage.setItem(CHAT_QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify(map));
}

function appendExperimentEventLocal(eventName: string, payload: Record<string, unknown>): void {
  try {
    const raw = localStorage.getItem(CHAT_EXPERIMENT_EVENTS_STORAGE_KEY);
    const base = raw ? JSON.parse(raw) as Array<Record<string, unknown>> : [];
    const next = [
      {
        id: crypto.randomUUID(),
        eventName,
        payload,
        createdAt: new Date().toISOString(),
      },
      ...base,
    ].slice(0, 500);
    localStorage.setItem(CHAT_EXPERIMENT_EVENTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore local event cache failures.
  }
}

function toRequestError(error: unknown): ChatRequestError {
  if (error instanceof AuthRequiredError) {
    return {
      status: 401,
      code: 'auth_required',
      message: '登录状态已失效，请重新登录后再试。',
    };
  }

  if (error instanceof EdgeFunctionError) {
    if (error.status === 401) {
      return {
        status: 401,
        code: error.code,
        requestId: error.requestId,
        message: 'AI 网关鉴权失败，请刷新页面后重试。',
      };
    }

    if (error.status === 0) {
      return {
        status: 0,
        code: error.code,
        requestId: error.requestId,
        message: '网络连接异常，暂时无法调用 AI。',
      };
    }

    return {
      status: error.status,
      code: error.code,
      requestId: error.requestId,
      message: error.message || 'AI 服务暂时不可用，请稍后重试。',
    };
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return {
      status: 499,
      code: 'aborted',
      message: '请求已取消。',
    };
  }

  return {
    status: 500,
    code: 'unknown_error',
    message: 'AI 服务暂时不可用，请稍后重试。',
  };
}

function mergeSessions(remoteSessions: ChatSession[], localSessions: ChatSession[]): ChatSession[] {
  const merged = new Map<string, ChatSession>();

  remoteSessions.forEach((session) => {
    merged.set(session.id, session);
  });

  localSessions.forEach((localSession) => {
    const remote = merged.get(localSession.id);
    if (!remote) {
      merged.set(localSession.id, localSession);
      return;
    }

    merged.set(localSession.id, {
      id: localSession.id,
      title: localSession.updatedAt > remote.updatedAt ? localSession.title : remote.title,
      createdAt: Math.min(remote.createdAt, localSession.createdAt),
      updatedAt: Math.max(remote.updatedAt, localSession.updatedAt),
      messages: mergeMessages(remote.messages, localSession.messages),
    });
  });

  return sortSessionsByUpdate([...merged.values()]);
}

function countPendingSync(
  localSessions: ChatSession[],
  remoteSessionIds: Set<string>,
  remoteMessageIdsBySession: Map<string, Set<string>>,
): number {
  let pending = 0;

  localSessions.forEach((session) => {
    if (!remoteSessionIds.has(session.id)) {
      pending += 1 + session.messages.length;
      return;
    }

    const remoteMessageIds = remoteMessageIdsBySession.get(session.id) || new Set<string>();
    session.messages.forEach((message) => {
      if (!remoteMessageIds.has(message.id)) {
        pending += 1;
      }
    });
  });

  return pending;
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
  const [lastAgentMeta, setLastAgentMeta] = useState<AgentMeta | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const failedRequestRef = useRef<FailedRequestContext | null>(null);

  const currentSession = sessions.find((session) => session.id === currentSessionId) || null;
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
      let failed = 0;

      for (const session of localSessions) {
        const sessionExists = remoteSessionIds.has(session.id);

        if (!sessionExists) {
          const { error: insertSessionError } = await supabase.from('chat_sessions').insert({
            id: session.id,
            user_id: userId,
            title: session.title,
            created_at: new Date(session.createdAt).toISOString(),
            updated_at: new Date(session.updatedAt).toISOString(),
          });

          if (insertSessionError) {
            failed += 1 + session.messages.length;
            continue;
          }

          remoteSessionIds.add(session.id);
          remoteUpdatedAtBySession.set(session.id, session.updatedAt);
          remoteMessageIdsBySession.set(session.id, new Set<string>());
        } else {
          const remoteUpdatedAt = remoteUpdatedAtBySession.get(session.id) || 0;
          if (session.updatedAt > remoteUpdatedAt) {
            const { error: updateSessionError } = await supabase
              .from('chat_sessions')
              .update({
                title: session.title,
                updated_at: new Date(session.updatedAt).toISOString(),
              })
              .eq('id', session.id)
              .eq('user_id', userId);

            if (updateSessionError) {
              failed += 1;
            } else {
              remoteUpdatedAtBySession.set(session.id, session.updatedAt);
            }
          }
        }

        const remoteMessageIds = remoteMessageIdsBySession.get(session.id) || new Set<string>();
        for (const message of session.messages) {
          if (remoteMessageIds.has(message.id)) {
            continue;
          }

          const { error: insertMessageError } = await supabase.from('chat_messages').insert({
            id: message.id,
            session_id: session.id,
            role: message.role,
            content: attachArtifactsToContent(message.content, message.artifacts),
            created_at: new Date(message.createdAt).toISOString(),
          });

          if (insertMessageError) {
            if (insertMessageError.code === '23505') {
              remoteMessageIds.add(message.id);
              continue;
            }
            failed += 1;
            continue;
          }

          remoteMessageIds.add(message.id);
        }

        remoteMessageIdsBySession.set(session.id, remoteMessageIds);
      }

      return failed;
    },
    [userId],
  );

  const loadSessions = useCallback(async () => {
    const localSessions = loadLocalSessions();

    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (sessionsError) {
        persistSessions(localSessions);
        ensureValidCurrentSession(localSessions);
        setDbReady(false);
        setSyncState({ source: 'local', pendingSyncCount: localSessions.length });
        return;
      }

      const remoteSessionsRows = sessionsData || [];
      const remoteSessionIds = new Set(remoteSessionsRows.map((row) => String(row.id)));

      let messagesData: Array<{
        id: string;
        session_id: string;
        role: 'user' | 'assistant' | 'system';
        content: string;
        created_at: string;
      }> = [];

      if (remoteSessionsRows.length > 0) {
        const remoteSessionIdList = remoteSessionsRows.map((row) => String(row.id));
        const { data: remoteMessages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .in('session_id', remoteSessionIdList)
          .order('created_at', { ascending: true });

        if (messagesError) {
          persistSessions(localSessions);
          ensureValidCurrentSession(localSessions);
          setDbReady(false);
          setSyncState({ source: 'local', pendingSyncCount: localSessions.length });
          return;
        }

        messagesData = (remoteMessages || []).map((row) => ({
          id: String(row.id),
          session_id: String(row.session_id),
          role: row.role as 'user' | 'assistant' | 'system',
          content: String(row.content),
          created_at: String(row.created_at),
        }));
      }

      const remoteMessagesBySession = new Map<string, ChatMessage[]>();
      const remoteMessageIdsBySession = new Map<string, Set<string>>();

      messagesData.forEach((message) => {
        const parsed = extractArtifactsFromContent(message.content);
        const chatMessage: ChatMessage = {
          id: message.id,
          role: message.role,
          content: parsed.content,
          createdAt: new Date(message.created_at).getTime(),
          artifacts: parsed.artifacts.length > 0 ? parsed.artifacts : undefined,
        };

        const existing = remoteMessagesBySession.get(message.session_id) || [];
        existing.push(chatMessage);
        remoteMessagesBySession.set(message.session_id, existing);

        const idSet = remoteMessageIdsBySession.get(message.session_id) || new Set<string>();
        idSet.add(chatMessage.id);
        remoteMessageIdsBySession.set(message.session_id, idSet);
      });

      const remoteUpdatedAtBySession = new Map<string, number>();
      const remoteSessions: ChatSession[] = remoteSessionsRows.map((session) => {
        const updatedAt = new Date(session.updated_at).getTime();
        remoteUpdatedAtBySession.set(String(session.id), updatedAt);

        return {
          id: String(session.id),
          title: String(session.title),
          createdAt: new Date(session.created_at).getTime(),
          updatedAt,
          messages: (remoteMessagesBySession.get(String(session.id)) || []).sort((a, b) => a.createdAt - b.createdAt),
        };
      });

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
        const mergedAttempts: Record<string, ChatQuizAttempt> = { ...localAttempts };
        (remoteAttempts || []).forEach((row) => {
          const quizId = String(row.quiz_id || '');
          if (!quizId) return;
          const candidate: ChatQuizAttempt = {
            id: String(row.id || crypto.randomUUID()),
            quizId,
            sessionId: String(row.session_id || ''),
            userId,
            selected: String(row.selected_option || ''),
            isCorrect: Boolean(row.is_correct),
            durationMs: Number(row.duration_ms || 0),
            createdAt: new Date(String(row.created_at || new Date().toISOString())).getTime(),
            sourceMode:
              row.source_mode === 'chat' ||
              row.source_mode === 'study' ||
              row.source_mode === 'quiz' ||
              row.source_mode === 'canvas'
                ? row.source_mode
                : 'study',
          };

          const existing = mergedAttempts[quizId];
          if (!existing || candidate.createdAt > existing.createdAt) {
            mergedAttempts[quizId] = candidate;
          }
        });

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
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CHAT_CURRENT_SESSION_KEY, currentSessionId);
    } else {
      localStorage.removeItem(CHAT_CURRENT_SESSION_KEY);
    }
  }, [currentSessionId]);

  const trackExperimentEvent = useCallback(
    async (eventName: string, payload: Record<string, unknown>) => {
      const normalizedEventName = eventName
        .replace(/_/g, '.')
        .replace('quiz.attempt.submitted', 'chat.quiz_attempted')
        .replace('chat.message.sent', 'chat.message_sent')
        .replace('chat.reply.received', 'chat.reply_received');

      appendExperimentEventLocal(eventName, payload);

      try {
        await supabase.from('chat_experiment_events').insert({
          user_id: userId,
          event_name: normalizedEventName,
          event_payload_json: payload,
          created_at: new Date().toISOString(),
        });
      } catch {
        // Optional table may not exist yet. Keep local events only.
      }

      await recordLearningEvent({
        userId,
        eventName: normalizedEventName,
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

  const createSession = useCallback(async (title: string = '新对话') => {
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      const { error } = await supabase.from('chat_sessions').insert({
        id: sessionId,
        user_id: userId,
        title,
        created_at: nowIso,
        updated_at: nowIso,
      });

      if (error) {
        throw error;
      }

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
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        remoteOk = false;
      }
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

  const deleteSession = useCallback(async (sessionId: string) => {
    let remoteOk = true;
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        remoteOk = false;
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      remoteOk = false;
    }

    const remaining = sessions.filter((session) => session.id !== sessionId);
    updateSessions((prev) => prev.filter((session) => session.id !== sessionId));

    if (currentSessionId === sessionId) {
      setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
    }

    if (!remoteOk) {
      setSyncState((prev) => ({
        source: 'local',
        pendingSyncCount: prev.pendingSyncCount + 1,
      }));
    }
  }, [currentSessionId, sessions, updateSessions, userId]);

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setStreamingContent('');
    setIsLoading(false);
    setChatError(null);
  }, []);

  const appendAssistantMessage = useCallback(
    async (sessionId: string, assistantMessage: ChatMessage) => {
      try {
        const { error } = await supabase.from('chat_messages').insert({
          id: assistantMessage.id,
          session_id: sessionId,
          role: assistantMessage.role,
          content: attachArtifactsToContent(assistantMessage.content, assistantMessage.artifacts),
          created_at: new Date(assistantMessage.createdAt).toISOString(),
        });

        if (error) {
          throw error;
        }

        const quizzes =
          assistantMessage.artifacts?.filter(
            (artifact): artifact is Extract<ChatArtifact, { type: 'quiz' }> => artifact.type === 'quiz',
          ) || [];

        for (const quiz of quizzes) {
          try {
            await supabase.from('chat_quiz_items').insert({
              id: quiz.payload.quizId,
              session_id: sessionId,
              user_id: userId,
              message_id: assistantMessage.id,
              title: quiz.payload.title,
              stem: quiz.payload.stem,
              options: quiz.payload.options,
              answer_key_hash: quiz.payload.answerKey,
              explanation: quiz.payload.explanation,
              difficulty: quiz.payload.difficulty,
              skills: quiz.payload.skills,
              question_type: quiz.payload.questionType,
              estimated_seconds: quiz.payload.estimatedSeconds,
              created_at: new Date(assistantMessage.createdAt).toISOString(),
            });
          } catch {
            // Optional table may not exist yet.
          }
        }
      } catch (error) {
        console.error('Error saving assistant message:', error);
        setSyncState((prev) => ({
          source: 'local',
          pendingSyncCount: prev.pendingSyncCount + 1,
        }));
      }

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
    },
    [updateSessions, userId],
  );

  const requestAssistantReply = useCallback(
    async (context: FailedRequestContext) => {
      setIsLoading(true);
      setStreamingContent('');
      setChatError(null);

      abortControllerRef.current = new AbortController();
      let timeoutHandle: number | null = null;
      let timedOut = false;
      let fullContent = '';

      try {
        timeoutHandle = window.setTimeout(() => {
          timedOut = true;
          abortControllerRef.current?.abort();
        }, CHAT_REQUEST_TIMEOUT_MS);

        const result = await invokeEdgeFunction<ChatEdgeResponse>(
          'ai-chat',
          {
            messages: context.apiMessages,
            systemPrompt: SYSTEM_PROMPT,
            learningContext: {
              locale: 'zh-CN',
              app: 'VocabDaily',
              mode: 'english-learning-coach',
              currentMode: context.mode,
            },
            toolContext: {
              availableTools: ['lookup_collocations', 'explain_error', 'generate_practice'],
              responseTemplate: ['direct_answer', 'examples', 'zh_key_points', 'next_actions'],
            },
            mode: context.mode,
            featureFlags: {
              enableQuizArtifacts: true,
              enableStudyArtifacts: true,
              allowAutoQuiz: context.mode === 'study' || context.mode === 'quiz',
              ...context.featureFlags,
            },
            temperature: TEMPERATURE_BY_MODE[context.mode],
            maxTokens: MAX_TOKENS_BY_MODE[context.mode],
          },
          { signal: abortControllerRef.current.signal },
        );

        const replyContent = result.content?.trim();
        if (!replyContent) {
          throw new EdgeFunctionError('AI returned empty content.', {
            status: 502,
            code: 'empty_content',
          });
        }

        const artifacts = normalizeArtifacts(result.artifacts);
        setLastAgentMeta(result.agentMeta || null);

        void trackExperimentEvent('chat_reply_received', {
          mode: context.mode,
          trigger: context.trigger,
          hasArtifacts: artifacts.length > 0,
          artifactTypes: artifacts.map((artifact) => artifact.type),
        });

        const chunks = replyContent.match(/[\s\S]{1,48}/g) || [replyContent];
        for (const chunk of chunks) {
          if (abortControllerRef.current?.signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
          fullContent += chunk;
          setStreamingContent(fullContent);
          await new Promise((resolve) => setTimeout(resolve, 2));
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullContent,
          createdAt: Date.now(),
          artifacts: artifacts.length > 0 ? artifacts : undefined,
        };

        await appendAssistantMessage(context.sessionId, assistantMessage);
        failedRequestRef.current = null;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          if (timedOut && !fullContent) {
            failedRequestRef.current = context;
            setChatError({
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
          failedRequestRef.current = context;
          setChatError(toRequestError(error));
        }
      } finally {
        if (timeoutHandle !== null) {
          window.clearTimeout(timeoutHandle);
        }
        setIsLoading(false);
        setStreamingContent('');
        abortControllerRef.current = null;
      }
    },
    [appendAssistantMessage, streamingContent, trackExperimentEvent],
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
    const mode: ChatMode = options.mode || 'study';
    const trigger = options.trigger || 'manual_input';
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      createdAt: now,
    };

    const sessionSnapshot = sessions.find((session) => session.id === sessionId);
    const shouldUpdateTitle = isNewSession || (sessionSnapshot && sessionSnapshot.messages.length === 0);
    const newTitle = shouldUpdateTitle ? generateTitle(content.trim()) : undefined;

    let remoteMessageSaved = true;
    try {
      const { error: messageInsertError } = await supabase.from('chat_messages').insert({
        id: userMessage.id,
        session_id: sessionId,
        role: userMessage.role,
        content: userMessage.content,
        created_at: new Date(userMessage.createdAt).toISOString(),
      });

      if (messageInsertError) {
        remoteMessageSaved = false;
      }

      if (newTitle) {
        const { error: titleError } = await supabase
          .from('chat_sessions')
          .update({ title: newTitle, updated_at: new Date(now).toISOString() })
          .eq('id', sessionId)
          .eq('user_id', userId);
        if (titleError) {
          remoteMessageSaved = false;
        }
      } else {
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date(now).toISOString() })
          .eq('id', sessionId)
          .eq('user_id', userId);
        if (updateError) {
          remoteMessageSaved = false;
        }
      }
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

    updateSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            title: newTitle || session.title,
            messages: [...session.messages, userMessage],
            updatedAt: now,
          };
        }
        return session;
      }),
    );
    setCurrentSessionId(sessionId);

    const historyMessages = (sessionSnapshot?.messages || [])
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-MAX_HISTORY_TURNS);

    const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...historyMessages.map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: clipForContext(message.content, MAX_CONTEXT_CHARS),
      })),
      { role: 'user', content: clipForContext(userMessage.content, MAX_USER_CHARS) },
    ];

    void trackExperimentEvent('chat_message_sent', {
      mode,
      trigger,
      sessionId,
      hasHistory: historyMessages.length > 0,
    });

    void recordLearningEvent({
      userId,
      eventName: 'chat.message_sent',
      sessionId,
      payload: {
        mode,
        trigger,
        messageLength: userMessage.content.length,
      },
    });

    await requestAssistantReply({
      sessionId,
      apiMessages,
      mode,
      featureFlags: options.featureFlags,
      trigger,
    });
  }, [createSession, currentSessionId, isLoading, requestAssistantReply, sessions, trackExperimentEvent, updateSessions, userId]);

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
      selected: string;
      isCorrect: boolean;
      durationMs: number;
      sourceMode: ChatMode;
    }) => {
      const attempt: ChatQuizAttempt = {
        id: crypto.randomUUID(),
        quizId: args.quizId,
        sessionId: args.sessionId,
        userId,
        selected: args.selected,
        isCorrect: args.isCorrect,
        durationMs: args.durationMs,
        createdAt: Date.now(),
        sourceMode: args.sourceMode,
      };

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
          isCorrect: attempt.isCorrect,
          durationMs: attempt.durationMs,
          sourceMode: attempt.sourceMode,
        },
      });

      try {
        await supabase.from('chat_quiz_attempts').insert({
          id: attempt.id,
          quiz_id: attempt.quizId,
          session_id: attempt.sessionId,
          user_id: attempt.userId,
          selected_option: attempt.selected,
          is_correct: attempt.isCorrect,
          duration_ms: attempt.durationMs,
          source_mode: attempt.sourceMode,
          created_at: new Date(attempt.createdAt).toISOString(),
        });
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

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(async () => {
    if (!currentSessionId) return;

    let remoteOk = true;
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', currentSessionId);

      if (error) {
        remoteOk = false;
      }
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

    if (!remoteOk) {
      setSyncState((prev) => ({
        source: 'local',
        pendingSyncCount: prev.pendingSyncCount + 1,
      }));
    }
  }, [currentSessionId, updateSessions]);

  const deleteAllSessions = useCallback(async () => {
    let remoteOk = true;
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        remoteOk = false;
      }
    } catch (error) {
      console.error('Error deleting all sessions:', error);
      remoteOk = false;
    }

    setSessions([]);
    setCurrentSessionId(null);
    setLastAgentMeta(null);
    localStorage.removeItem(CHAT_SESSIONS_STORAGE_KEY);
    localStorage.removeItem(CHAT_CURRENT_SESSION_KEY);

    if (!remoteOk) {
      setSyncState((prev) => ({
        source: 'local',
        pendingSyncCount: prev.pendingSyncCount + 1,
      }));
    } else {
      setSyncState({ source: 'remote', pendingSyncCount: 0 });
    }
  }, [userId]);

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
    lastAgentMeta,
    chatError,
    sendMessage,
    submitQuizAttempt,
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

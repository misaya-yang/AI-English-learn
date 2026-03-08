import { normalizeArtifacts } from '@/services/chatArtifacts';
import { normalizePersistedAssistantPayload } from '@/features/chat/runtime/responseNormalization';
import type { ChatQuizAttempt, QuizRunState } from '@/types/chatAgent';
import type { ChatMessage, ChatSession } from '@/features/chat/state/types';

const CHAT_SESSIONS_STORAGE_KEY = 'vocabdaily-chat-sessions';
const CHAT_QUIZ_ATTEMPTS_STORAGE_KEY = 'vocabdaily-chat-quiz-attempts';
const CHAT_QUIZ_RUNS_STORAGE_KEY = 'vocabdaily-chat-quiz-runs';

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

export function sortSessionsByUpdate(sessions: ChatSession[]): ChatSession[] {
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
        (existing.artifacts && existing.artifacts.length > 0 ? existing.artifacts : message.artifacts) ||
        undefined,
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
            const normalizedMessage =
              message.role === 'assistant' || message.role === 'system'
                ? normalizePersistedAssistantPayload(
                    message.content,
                    (message as { artifacts?: unknown }).artifacts,
                  )
                : {
                    content: message.content,
                    artifacts: Array.isArray((message as { artifacts?: unknown }).artifacts)
                      ? normalizeArtifacts((message as { artifacts?: unknown }).artifacts)
                      : undefined,
                  };

            return {
              id: message.id,
              role: message.role,
              content: normalizedMessage.content,
              createdAt: parseTimestamp(message.createdAt, fallbackNow),
              artifacts: normalizedMessage.artifacts,
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

export function loadLocalSessions(): ChatSession[] {
  const raw = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
  if (!raw) return [];

  try {
    return normalizeLocalSessions(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveLocalSessions(sessions: ChatSession[]): void {
  localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

export function loadLocalQuizAttempts(): Record<string, ChatQuizAttempt> {
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

export function saveLocalQuizAttempts(map: Record<string, ChatQuizAttempt>): void {
  localStorage.setItem(CHAT_QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify(map));
}

export function loadLocalQuizRuns(): Record<string, QuizRunState> {
  const raw = localStorage.getItem(CHAT_QUIZ_RUNS_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, QuizRunState>;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveLocalQuizRuns(map: Record<string, QuizRunState>): void {
  localStorage.setItem(CHAT_QUIZ_RUNS_STORAGE_KEY, JSON.stringify(map));
}

export function mergeSessions(remoteSessions: ChatSession[], localSessions: ChatSession[]): ChatSession[] {
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

export function countPendingSync(
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

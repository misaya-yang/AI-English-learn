import { supabase } from '@/lib/supabase';
import { attachArtifactsToContent } from '@/services/chatArtifacts';
import { normalizePersistedAssistantPayload } from '@/features/chat/runtime/responseNormalization';
import type { ChatArtifact } from '@/types/chatAgent';
import type { ChatMessage, ChatSession } from '@/features/chat/state/types';

export async function syncLocalSessionsToRemote(args: {
  localSessions: ChatSession[];
  remoteSessionIds: Set<string>;
  remoteMessageIdsBySession: Map<string, Set<string>>;
  remoteUpdatedAtBySession: Map<string, number>;
  userId: string;
}): Promise<number> {
  let failed = 0;

  for (const session of args.localSessions) {
    const sessionExists = args.remoteSessionIds.has(session.id);

    if (!sessionExists) {
      const { error: insertSessionError } = await supabase.from('chat_sessions').insert({
        id: session.id,
        user_id: args.userId,
        title: session.title,
        created_at: new Date(session.createdAt).toISOString(),
        updated_at: new Date(session.updatedAt).toISOString(),
      });

      if (insertSessionError) {
        failed += 1 + session.messages.length;
        continue;
      }

      args.remoteSessionIds.add(session.id);
      args.remoteUpdatedAtBySession.set(session.id, session.updatedAt);
      args.remoteMessageIdsBySession.set(session.id, new Set<string>());
    } else {
      const remoteUpdatedAt = args.remoteUpdatedAtBySession.get(session.id) || 0;
      if (session.updatedAt > remoteUpdatedAt) {
        const { error: updateSessionError } = await supabase
          .from('chat_sessions')
          .update({
            title: session.title,
            updated_at: new Date(session.updatedAt).toISOString(),
          })
          .eq('id', session.id)
          .eq('user_id', args.userId);

        if (updateSessionError) {
          failed += 1;
        } else {
          args.remoteUpdatedAtBySession.set(session.id, session.updatedAt);
        }
      }
    }

    const remoteMessageIds = args.remoteMessageIdsBySession.get(session.id) || new Set<string>();
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

    args.remoteMessageIdsBySession.set(session.id, remoteMessageIds);
  }

  return failed;
}

export async function loadRemoteSessionsSnapshot(userId: string): Promise<{
  remoteSessions: ChatSession[];
  remoteSessionIds: Set<string>;
  remoteMessageIdsBySession: Map<string, Set<string>>;
  remoteUpdatedAtBySession: Map<string, number>;
}> {
  const { data: sessionsData, error: sessionsError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (sessionsError) {
    throw sessionsError;
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
      throw messagesError;
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
    const normalized =
      message.role === 'assistant' || message.role === 'system'
        ? normalizePersistedAssistantPayload(message.content)
        : { content: message.content, artifacts: undefined as ChatArtifact[] | undefined };
    const chatMessage: ChatMessage = {
      id: message.id,
      role: message.role,
      content: normalized.content,
      createdAt: new Date(message.created_at).getTime(),
      artifacts: normalized.artifacts,
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
      messages: (remoteMessagesBySession.get(String(session.id)) || []).sort(
        (a, b) => a.createdAt - b.createdAt,
      ),
    };
  });

  return {
    remoteSessions,
    remoteSessionIds,
    remoteMessageIdsBySession,
    remoteUpdatedAtBySession,
  };
}

export async function createRemoteSession(args: {
  sessionId: string;
  userId: string;
  title: string;
  now: number;
}): Promise<void> {
  const nowIso = new Date(args.now).toISOString();
  const { error } = await supabase.from('chat_sessions').insert({
    id: args.sessionId,
    user_id: args.userId,
    title: args.title,
    created_at: nowIso,
    updated_at: nowIso,
  });
  if (error) throw error;
}

export async function updateRemoteSessionTitle(args: {
  sessionId: string;
  userId: string;
  title: string;
}): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ title: args.title, updated_at: new Date().toISOString() })
    .eq('id', args.sessionId)
    .eq('user_id', args.userId);
  if (error) throw error;
}

export async function saveRemoteUserMessage(args: {
  sessionId: string;
  userId: string;
  message: ChatMessage;
  newTitle?: string;
  now: number;
}): Promise<void> {
  const { error: messageInsertError } = await supabase.from('chat_messages').insert({
    id: args.message.id,
    session_id: args.sessionId,
    role: args.message.role,
    content: args.message.content,
    created_at: new Date(args.message.createdAt).toISOString(),
  });

  if (messageInsertError) {
    throw messageInsertError;
  }

  if (args.newTitle) {
    const { error: titleError } = await supabase
      .from('chat_sessions')
      .update({ title: args.newTitle, updated_at: new Date(args.now).toISOString() })
      .eq('id', args.sessionId)
      .eq('user_id', args.userId);
    if (titleError) throw titleError;
    return;
  }

  const { error: updateError } = await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date(args.now).toISOString() })
    .eq('id', args.sessionId)
    .eq('user_id', args.userId);
  if (updateError) throw updateError;
}

export async function saveRemoteAssistantMessage(args: {
  sessionId: string;
  userId: string;
  assistantMessage: ChatMessage;
}): Promise<void> {
  const { error } = await supabase.from('chat_messages').insert({
    id: args.assistantMessage.id,
    session_id: args.sessionId,
    role: args.assistantMessage.role,
    content: attachArtifactsToContent(args.assistantMessage.content, args.assistantMessage.artifacts),
    created_at: new Date(args.assistantMessage.createdAt).toISOString(),
  });
  if (error) throw error;

  const quizzes =
    args.assistantMessage.artifacts?.filter(
      (artifact): artifact is Extract<ChatArtifact, { type: 'quiz' }> => artifact.type === 'quiz',
    ) || [];

  if (quizzes.length === 0) return;

  await supabase.from('chat_quiz_items').insert(
    quizzes.map((quiz) => ({
      id: quiz.payload.quizId,
      session_id: args.sessionId,
      user_id: args.userId,
      message_id: args.assistantMessage.id,
      title: quiz.payload.title,
      stem: quiz.payload.stem,
      options: quiz.payload.options,
      answer_key_hash: quiz.payload.answerKey,
      explanation: quiz.payload.explanation,
      difficulty: quiz.payload.difficulty,
      skills: quiz.payload.skills,
      question_type: quiz.payload.questionType,
      estimated_seconds: quiz.payload.estimatedSeconds,
      created_at: new Date(args.assistantMessage.createdAt).toISOString(),
    })),
  );
}

export async function deleteRemoteSessionCascade(args: {
  sessionId: string;
  userId: string;
}): Promise<void> {
  const [attemptsRes, itemsRes, messagesRes, sessionRes] = await Promise.all([
    supabase.from('chat_quiz_attempts').delete().eq('session_id', args.sessionId).eq('user_id', args.userId),
    supabase.from('chat_quiz_items').delete().eq('session_id', args.sessionId).eq('user_id', args.userId),
    supabase.from('chat_messages').delete().eq('session_id', args.sessionId),
    supabase.from('chat_sessions').delete().eq('id', args.sessionId).eq('user_id', args.userId),
  ]);

  if (attemptsRes.error || itemsRes.error || messagesRes.error || sessionRes.error) {
    throw attemptsRes.error || itemsRes.error || messagesRes.error || sessionRes.error;
  }
}

export async function clearRemoteSessionMessages(sessionId: string): Promise<void> {
  const { error } = await supabase.from('chat_messages').delete().eq('session_id', sessionId);
  if (error) throw error;
}

export async function insertRemoteQuizAttempt(attempt: {
  id: string;
  quizId: string;
  sessionId: string;
  userId: string;
  runId?: string;
  questionIndex?: number;
  selected: string;
  isCorrect: boolean;
  durationMs: number;
  sourceMode: string;
  createdAt: number;
}): Promise<void> {
  await supabase.from('chat_quiz_attempts').insert({
    id: attempt.id,
    quiz_id: attempt.quizId,
    session_id: attempt.sessionId,
    user_id: attempt.userId,
    run_id: attempt.runId || null,
    question_index: attempt.questionIndex ?? null,
    selected_option: attempt.selected,
    is_correct: attempt.isCorrect,
    duration_ms: attempt.durationMs,
    source_mode: attempt.sourceMode,
    created_at: new Date(attempt.createdAt).toISOString(),
  });
}

export async function deleteAllRemoteSessionsCascade(args: {
  userId: string;
  sessionIds: string[];
}): Promise<void> {
  const attemptsRes = await supabase.from('chat_quiz_attempts').delete().eq('user_id', args.userId);
  const itemsRes = await supabase.from('chat_quiz_items').delete().eq('user_id', args.userId);
  let messagesError: unknown = null;
  if (args.sessionIds.length > 0) {
    const messagesRes = await supabase.from('chat_messages').delete().in('session_id', args.sessionIds);
    messagesError = messagesRes.error;
  }
  const sessionsRes = await supabase.from('chat_sessions').delete().eq('user_id', args.userId);

  if (attemptsRes.error || itemsRes.error || messagesError || sessionsRes.error) {
    throw attemptsRes.error || itemsRes.error || messagesError || sessionsRes.error;
  }
}

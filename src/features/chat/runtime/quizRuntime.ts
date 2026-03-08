import type { ChatMode, ChatQuizAttempt, QuizRunState } from '@/types/chatAgent';

export function createQuizRunState(
  targetCount: number,
  seedPrompt: string,
  now: number = Date.now(),
): QuizRunState {
  return {
    runId: crypto.randomUUID(),
    targetCount: Math.max(2, Math.min(20, Math.floor(targetCount))),
    answeredCount: 0,
    status: 'awaiting_answer',
    seedPrompt,
    usedWords: [],
    startedAt: now,
  };
}

export function advanceQuizRunState(
  existing: QuizRunState | undefined,
  args: { quizId: string; usedWord?: string },
): QuizRunState | null {
  if (!existing || existing.status === 'completed') {
    return null;
  }

  const usedWords = args.usedWord
    ? Array.from(new Set([...existing.usedWords, args.usedWord]))
    : existing.usedWords;
  const answeredCount = Math.min(existing.targetCount, existing.answeredCount + 1);
  const completed = answeredCount >= existing.targetCount;

  return {
    ...existing,
    answeredCount,
    usedWords,
    currentQuizId: args.quizId,
    status: completed ? 'completed' : 'requesting_next',
    completedAt: completed ? Date.now() : undefined,
  };
}

export function markQuizRunRequestingNext(
  existing: QuizRunState | undefined,
  args: { runId?: string; currentQuizId?: string },
): QuizRunState | null {
  if (!existing) return null;
  if (args.runId && existing.runId !== args.runId) return null;
  if (existing.status === 'completed') return existing;

  return {
    ...existing,
    status: 'requesting_next',
    currentQuizId: args.currentQuizId || existing.currentQuizId,
  };
}

export function clearQuizRunState(
  prev: Record<string, QuizRunState>,
  sessionId: string,
): Record<string, QuizRunState> {
  if (!prev[sessionId]) return prev;
  const next = { ...prev };
  delete next[sessionId];
  return next;
}

export function buildQuizAttempt(args: {
  quizId: string;
  sessionId: string;
  userId: string;
  runId?: string;
  questionIndex?: number;
  selected: string;
  isCorrect: boolean;
  durationMs: number;
  sourceMode: ChatMode;
  createdAt?: number;
}): ChatQuizAttempt {
  return {
    id: crypto.randomUUID(),
    quizId: args.quizId,
    sessionId: args.sessionId,
    userId: args.userId,
    runId: args.runId,
    questionIndex: args.questionIndex,
    selected: args.selected,
    isCorrect: args.isCorrect,
    durationMs: args.durationMs,
    createdAt: args.createdAt ?? Date.now(),
    sourceMode: args.sourceMode,
  };
}

export function mergeRemoteQuizAttempts(
  localAttempts: Record<string, ChatQuizAttempt>,
  remoteAttempts: Array<Record<string, unknown>>,
  userId: string,
): Record<string, ChatQuizAttempt> {
  const mergedAttempts: Record<string, ChatQuizAttempt> = { ...localAttempts };

  remoteAttempts.forEach((row) => {
    const quizId = String(row.quiz_id || '');
    if (!quizId) return;
    const candidate: ChatQuizAttempt = {
      id: String(row.id || crypto.randomUUID()),
      quizId,
      sessionId: String(row.session_id || ''),
      userId,
      runId: typeof row.run_id === 'string' && row.run_id.trim().length > 0 ? row.run_id : undefined,
      questionIndex: Number.isFinite(Number(row.question_index)) ? Number(row.question_index) : undefined,
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

  return mergedAttempts;
}

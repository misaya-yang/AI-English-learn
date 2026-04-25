import type { ChatArtifact } from '@/types/chatAgent';
import type { ChatMessage } from '@/features/chat/state/types';

/**
 * UI-side mirror of `QuizRunState` used by the chat page to drive the canvas
 * navigator. We keep this independent of `QuizRunState` so the UI can recover
 * from a freshly switched session (where the run is rehydrated from local
 * storage) without coupling the runtime persistence shape to the canvas index.
 */
export interface QuizSequenceState {
  targetCount: number;
  answeredCount: number;
  seedPrompt: string;
  usedWords: string[];
  startedAt: number;
}

export interface QuizRunArtifactEntry {
  messageId: string;
  artifact: Extract<ChatArtifact, { type: 'quiz' }>;
  createdAt: number;
}

/**
 * Collect every quiz artifact emitted after the active run started, deduped by
 * `quizId` and ordered by `createdAt`. Mirrors the inline `useMemo` from
 * `ChatPage.tsx` byte-for-byte so the canvas list, navigation arrows, and
 * "answeredCount" display remain stable.
 */
export const collectQuizRunArtifacts = (
  messages: ChatMessage[],
  sequence: QuizSequenceState | null,
): QuizRunArtifactEntry[] => {
  if (!sequence) return [];
  const runStartedAt = sequence.startedAt || 0;

  const entries: QuizRunArtifactEntry[] = [];
  const seen = new Set<string>();

  for (const message of messages) {
    if (runStartedAt > 0 && message.createdAt < runStartedAt - 500) continue;
    if (!message.artifacts || message.role !== 'assistant') continue;
    for (const artifact of message.artifacts) {
      if (artifact.type !== 'quiz') continue;
      if (seen.has(artifact.payload.quizId)) continue;
      seen.add(artifact.payload.quizId);
      entries.push({
        messageId: message.id,
        artifact,
        createdAt: message.createdAt,
      });
    }
  }

  return entries.sort((a, b) => a.createdAt - b.createdAt);
};

/**
 * Decide which question number to show in the header badge.
 *
 * - When the run is finished, show `targetCount`.
 * - Otherwise prefer the active canvas index (`+1` for human display), capped
 *   at `targetCount`.
 * - Fallback to `answeredCount + 1` when no artifact is ready yet.
 */
export const computeQuizDisplayIndex = (args: {
  sequence: QuizSequenceState | null;
  canvasIndex: number;
  hasActiveArtifact: boolean;
}): number => {
  const { sequence, canvasIndex, hasActiveArtifact } = args;
  if (!sequence) return 0;

  if (sequence.answeredCount >= sequence.targetCount) {
    return sequence.targetCount;
  }
  if (hasActiveArtifact) {
    return Math.min(sequence.targetCount, canvasIndex + 1);
  }
  return Math.min(sequence.targetCount, sequence.answeredCount + 1);
};

/**
 * Compute the next canvas index when a fresh artifact list arrives. Mirrors
 * the inline `setQuizCanvasIndex` logic that prefers `answeredCount` while
 * keeping the user on the question they were already viewing.
 */
export const reconcileCanvasIndex = (args: {
  currentIndex: number;
  answeredCount: number;
  artifactsLength: number;
}): number => {
  const { currentIndex, answeredCount, artifactsLength } = args;
  if (artifactsLength === 0) return 0;
  const preferred = Math.max(0, Math.min(answeredCount, artifactsLength - 1));
  return Math.min(Math.max(currentIndex, preferred), artifactsLength - 1);
};

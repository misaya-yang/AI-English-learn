import type { ChatArtifact } from '@/types/chatAgent';
import type { ChatMessage } from '@/features/chat/state/types';
import type { QuizSequenceState } from '@/features/chat/runtime/quizSequenceState';

/**
 * During an active quiz run we hide:
 *  - Assistant messages emitted after the run started (they are surfaced
 *    inside the quiz canvas instead).
 *  - Any assistant message that contains a quiz artifact (the canvas owns it).
 *
 * Returns `true` when the message should be hidden in the main message list.
 */
export const shouldHideMessageDuringQuizRun = (
  message: ChatMessage,
  sequence: QuizSequenceState | null,
): boolean => {
  if (!sequence) return false;

  const runStartedAt = sequence.startedAt || 0;
  if (message.role === 'assistant' && message.createdAt >= runStartedAt - 500) {
    return true;
  }

  if (
    message.role === 'assistant' &&
    Array.isArray(message.artifacts) &&
    (message.artifacts as ChatArtifact[]).some((artifact) => artifact.type === 'quiz')
  ) {
    return true;
  }

  return false;
};

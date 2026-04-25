import { buildQuizSequencePrompt } from '@/features/chat/quizSequence';
import type { QuizSequenceState } from '@/features/chat/runtime/quizSequenceState';
import type { SendMessageOptions } from '@/types/chatAgent';

export interface BuildQuizBatchSendOptionsArgs {
  sequence: QuizSequenceState;
  startIndex: number;
  language: string;
  goalContext?: string;
  weakTags?: string[];
  runId?: string;
}

/**
 * Build the `(content, SendMessageOptions)` tuple used to fetch the next quiz
 * question in a multi-question run. Pulled out of `ChatPage.tsx` so the canvas
 * orchestrator (and any future runner) can reuse it.
 *
 * Behaviour mirrors the inline `requestQuizBatch` block byte-for-byte:
 *  - `apiContentOverride` carries the templated prompt while the visible user
 *    message stays the seed prompt.
 *  - `hideUserMessage` keeps the runner UI stable (we never echo the synthetic
 *    fetch back into the message log).
 *  - `quizRun` is omitted when no `runId` is known yet, exactly like before.
 */
export const buildQuizBatchSendOptions = (
  args: BuildQuizBatchSendOptionsArgs,
): { content: string; options: SendMessageOptions } => {
  const questionIndex = Math.max(1, args.startIndex);
  const prompt = buildQuizSequencePrompt({
    language: args.language,
    seedPrompt: args.sequence.seedPrompt,
    startIndex: questionIndex,
    questionCount: 1,
    targetCount: args.sequence.targetCount,
    usedWords: args.sequence.usedWords,
  });

  return {
    content: args.sequence.seedPrompt,
    options: {
      surface: 'chat',
      goalContext: args.goalContext,
      weakTags: args.weakTags,
      mode: 'quiz',
      responseStyle: 'coach',
      searchMode: 'off',
      trigger: 'quiz_button',
      apiContentOverride: prompt,
      hideUserMessage: true,
      quizPolicy: { revealAnswer: 'after_submit' },
      quizRun: args.runId
        ? {
            runId: args.runId,
            questionIndex,
            targetCount: args.sequence.targetCount,
            status: 'requesting_next',
          }
        : undefined,
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        forceQuiz: true,
        allowAutoQuiz: true,
      },
    },
  };
};

import type { WordData } from '@/data/words';

export type PracticeAnswerPhase = 'answering' | 'retrying' | 'revealed';

export type PracticeAttemptOutcome =
  | 'firstTryCorrect'
  | 'recovered'
  | 'tryAgain'
  | 'needsReview';

export interface PracticeAttemptState {
  phase: PracticeAnswerPhase;
  attempts: string[];
  blockedAnswers: string[];
  revealed: boolean;
}

export interface PracticeAttemptResult {
  state: PracticeAttemptState;
  outcome: PracticeAttemptOutcome;
  isCorrect: boolean;
  shouldRevealAnswer: boolean;
  shouldAdvance: boolean;
  fsrsRating?: 'again' | 'hard' | 'good';
}

export const MAX_PRACTICE_ATTEMPTS = 2;

const normalizeAnswer = (value: string): string => value.trim().toLowerCase();

export const createInitialPracticeAttemptState = (): PracticeAttemptState => ({
  phase: 'answering',
  attempts: [],
  blockedAnswers: [],
  revealed: false,
});

export const gradePracticeAttempt = (
  state: PracticeAttemptState,
  answer: string,
  correctAnswer: string,
): PracticeAttemptResult => {
  const nextAttempts = [...state.attempts, answer];
  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(correctAnswer);
  const isRetry = state.attempts.length > 0;

  if (isCorrect) {
    return {
      state: {
        ...state,
        attempts: nextAttempts,
        phase: 'revealed',
        revealed: false,
      },
      outcome: isRetry ? 'recovered' : 'firstTryCorrect',
      isCorrect: true,
      shouldRevealAnswer: false,
      shouldAdvance: true,
      fsrsRating: isRetry ? 'hard' : 'good',
    };
  }

  if (nextAttempts.length < MAX_PRACTICE_ATTEMPTS) {
    return {
      state: {
        attempts: nextAttempts,
        blockedAnswers: [...state.blockedAnswers, answer],
        phase: 'retrying',
        revealed: false,
      },
      outcome: 'tryAgain',
      isCorrect: false,
      shouldRevealAnswer: false,
      shouldAdvance: false,
    };
  }

  return {
    state: {
      attempts: nextAttempts,
      blockedAnswers: [...state.blockedAnswers, answer],
      phase: 'revealed',
      revealed: true,
    },
    outcome: 'needsReview',
    isCorrect: false,
    shouldRevealAnswer: true,
    shouldAdvance: true,
    fsrsRating: 'again',
  };
};

export const revealPracticeAnswer = (
  state: PracticeAttemptState,
  answer?: string,
): PracticeAttemptResult => {
  const attempts = answer ? [...state.attempts, answer] : state.attempts;
  return {
    state: {
      attempts,
      blockedAnswers: answer ? [...state.blockedAnswers, answer] : state.blockedAnswers,
      phase: 'revealed',
      revealed: true,
    },
    outcome: 'needsReview',
    isCorrect: false,
    shouldRevealAnswer: true,
    shouldAdvance: true,
    fsrsRating: 'again',
  };
};

export const buildPracticeHint = (
  word: WordData,
  args: { mode: 'quiz' | 'fill_blank' | 'listening'; isZh?: boolean },
): string => {
  if (args.mode === 'listening') {
    return args.isZh
      ? `再听一遍，注意它是 ${word.partOfSpeech}，开头音接近 ${word.word.slice(0, 1).toUpperCase()}。`
      : `Listen once more. It is a ${word.partOfSpeech}; the word starts with ${word.word.slice(0, 1).toUpperCase()}.`;
  }

  if (args.mode === 'fill_blank' && word.examples[0]) {
    return args.isZh
      ? `看句子语境：${word.examples[0].zh}`
      : `Use the sentence context: ${word.examples[0].en}`;
  }

  const topic = word.topic ? ` · ${word.topic}` : '';
  return args.isZh
    ? `先看词性和主题：${word.partOfSpeech}${topic}。`
    : `Use the part of speech and topic: ${word.partOfSpeech}${topic}.`;
};

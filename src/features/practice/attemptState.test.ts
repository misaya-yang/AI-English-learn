import { describe, expect, it } from 'vitest';

import {
  createInitialPracticeAttemptState,
  gradePracticeAttempt,
  revealPracticeAnswer,
} from './attemptState';

describe('practice attempt state', () => {
  it('keeps the answer hidden after the first wrong attempt', () => {
    const result = gradePracticeAttempt(
      createInitialPracticeAttemptState(),
      'wrong definition',
      'correct definition',
    );

    expect(result.outcome).toBe('tryAgain');
    expect(result.state.phase).toBe('retrying');
    expect(result.shouldRevealAnswer).toBe(false);
    expect(result.state.blockedAnswers).toEqual(['wrong definition']);
  });

  it('marks a retry success as recovered instead of first-try correct', () => {
    const first = gradePracticeAttempt(
      createInitialPracticeAttemptState(),
      'wrong definition',
      'correct definition',
    );
    const second = gradePracticeAttempt(first.state, 'correct definition', 'correct definition');

    expect(second.outcome).toBe('recovered');
    expect(second.fsrsRating).toBe('hard');
    expect(second.shouldRevealAnswer).toBe(false);
  });

  it('reveals the answer only after a second wrong attempt', () => {
    const first = gradePracticeAttempt(
      createInitialPracticeAttemptState(),
      'wrong one',
      'correct definition',
    );
    const second = gradePracticeAttempt(first.state, 'wrong two', 'correct definition');

    expect(second.outcome).toBe('needsReview');
    expect(second.state.revealed).toBe(true);
    expect(second.shouldRevealAnswer).toBe(true);
    expect(second.fsrsRating).toBe('again');
  });

  it('marks a first attempt success as firstTryCorrect', () => {
    const result = gradePracticeAttempt(
      createInitialPracticeAttemptState(),
      'Correct Definition',
      'correct definition',
    );

    expect(result.outcome).toBe('firstTryCorrect');
    expect(result.fsrsRating).toBe('good');
    expect(result.shouldAdvance).toBe(true);
  });

  it('supports an explicit answer reveal action', () => {
    const first = gradePracticeAttempt(
      createInitialPracticeAttemptState(),
      'wrong one',
      'correct definition',
    );
    const reveal = revealPracticeAnswer(first.state);

    expect(reveal.outcome).toBe('needsReview');
    expect(reveal.state.revealed).toBe(true);
  });
});

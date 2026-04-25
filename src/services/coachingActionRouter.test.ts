import { beforeEach, describe, expect, it } from 'vitest';
import { applyCoachingActions } from './coachingActionRouter';
import { clearCoachReviewQueue, getCoachReviews } from './coachReviewQueue';
import type { CoachingAction } from '@/features/coach/coachingPolicy';

beforeEach(() => {
  clearCoachReviewQueue();
});

const now = new Date('2026-04-25T12:00:00.000Z');

describe('applyCoachingActions', () => {
  it('persists schedule_review actions into the review queue', () => {
    const actions: CoachingAction[] = [
      {
        type: 'schedule_review',
        prompt: 'Revisit "ephemeral" tomorrow',
        targetWord: 'ephemeral',
        targetSkill: 'vocab',
        reviewAfterHours: 24,
      },
    ];
    const summary = applyCoachingActions(actions, { userInputRef: 'msg-1', now });
    expect(summary.persisted).toBe(1);
    const stored = getCoachReviews();
    expect(stored).toHaveLength(1);
    expect(stored[0].targetWord).toBe('ephemeral');
    expect(stored[0].sourceAction).toBe('schedule_review');
    expect(stored[0].dueAt).toBe('2026-04-26T12:00:00.000Z');
  });

  it('persists retry_with_hint actions into the review queue at a short interval', () => {
    const actions: CoachingAction[] = [
      {
        type: 'retry_with_hint',
        prompt: 'Try again with the past perfect form',
        targetSkill: 'grammar',
      },
    ];
    const summary = applyCoachingActions(actions, { userInputRef: 'msg-2', now });
    expect(summary.persisted).toBe(1);
    const stored = getCoachReviews();
    expect(stored).toHaveLength(1);
    expect(stored[0].skill).toBe('grammar');
    expect(stored[0].sourceAction).toBe('retry_with_hint');
    expect(new Date(stored[0].dueAt).getTime() - now.getTime()).toBeLessThanOrEqual(
      2 * 60 * 60 * 1000,
    );
  });

  it('does not persist non-review actions', () => {
    const actions: CoachingAction[] = [
      { type: 'celebrate_effort', prompt: 'Nice specific reasoning on the tense cue.' },
      { type: 'ask_socratic_question', prompt: 'What time marker would you use here?' },
      { type: 'micro_task', prompt: 'Rewrite the sentence in one breath.' },
      { type: 'reflection_prompt', prompt: 'What clue made the difference?' },
    ];
    const summary = applyCoachingActions(actions, { userInputRef: 'msg-3', now });
    expect(summary.persisted).toBe(0);
    expect(getCoachReviews()).toEqual([]);
  });

  it('returns the typed review items so the UI can show "you scheduled a review" affordance', () => {
    const actions: CoachingAction[] = [
      {
        type: 'schedule_review',
        prompt: 'Review ephemeral tomorrow',
        targetWord: 'ephemeral',
        targetSkill: 'vocab',
        reviewAfterHours: 24,
      },
      { type: 'celebrate_effort', prompt: 'Great chained reasoning' },
    ];
    const summary = applyCoachingActions(actions, { userInputRef: 'msg-4', now });
    expect(summary.reviewItems).toHaveLength(1);
    expect(summary.reviewItems[0].targetWord).toBe('ephemeral');
  });

  it('is idempotent: re-running with the same userInputRef + actions does not create duplicates', () => {
    const actions: CoachingAction[] = [
      {
        type: 'schedule_review',
        prompt: 'Review ephemeral tomorrow',
        targetWord: 'ephemeral',
        targetSkill: 'vocab',
        reviewAfterHours: 24,
      },
    ];
    applyCoachingActions(actions, { userInputRef: 'msg-5', now });
    applyCoachingActions(actions, { userInputRef: 'msg-5', now });
    expect(getCoachReviews()).toHaveLength(1);
  });

  it('is a no-op for undefined / empty actions', () => {
    expect(applyCoachingActions(undefined, { now }).persisted).toBe(0);
    expect(applyCoachingActions([], { now }).persisted).toBe(0);
    expect(getCoachReviews()).toEqual([]);
  });

  it('skips actions that miss the data needed to schedule a review', () => {
    const actions: CoachingAction[] = [
      // schedule_review without a skill cannot be routed — drop silently.
      { type: 'schedule_review', prompt: 'Vague schedule', reviewAfterHours: 24 },
      // retry_with_hint without a skill is also not routable.
      { type: 'retry_with_hint', prompt: 'Vague retry' },
    ];
    const summary = applyCoachingActions(actions, { userInputRef: 'msg-6', now });
    expect(summary.persisted).toBe(0);
  });
});

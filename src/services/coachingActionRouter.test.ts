import { beforeEach, describe, expect, it } from 'vitest';
import { applyCoachingActions } from './coachingActionRouter';
import { clearCoachReviewQueue, getCoachReviews } from './coachReviewQueue';
import type { CoachingAction } from '@/features/coach/coachingPolicy';

const USER = 'test-user-coach-router';

beforeEach(async () => {
  await clearCoachReviewQueue(USER);
});

const now = new Date('2026-04-25T12:00:00.000Z');

describe('applyCoachingActions', () => {
  it('persists schedule_review actions into the review queue', async () => {
    const actions: CoachingAction[] = [
      {
        type: 'schedule_review',
        prompt: 'Revisit "ephemeral" tomorrow',
        targetWord: 'ephemeral',
        targetSkill: 'vocab',
        reviewAfterHours: 24,
      },
    ];
    const summary = await applyCoachingActions(USER, actions, { userInputRef: 'msg-1', now });
    expect(summary.persisted).toBe(1);
    const stored = await getCoachReviews(USER);
    expect(stored).toHaveLength(1);
    expect(stored[0].targetWord).toBe('ephemeral');
    expect(stored[0].sourceAction).toBe('schedule_review');
    expect(stored[0].dueAt).toBe('2026-04-26T12:00:00.000Z');
  });

  it('persists retry_with_hint actions into the review queue at a short interval', async () => {
    const actions: CoachingAction[] = [
      {
        type: 'retry_with_hint',
        prompt: 'Try again with the past perfect form',
        targetSkill: 'grammar',
      },
    ];
    const summary = await applyCoachingActions(USER, actions, { userInputRef: 'msg-2', now });
    expect(summary.persisted).toBe(1);
    const stored = await getCoachReviews(USER);
    expect(stored).toHaveLength(1);
    expect(stored[0].skill).toBe('grammar');
    expect(stored[0].sourceAction).toBe('retry_with_hint');
    expect(new Date(stored[0].dueAt).getTime() - now.getTime()).toBeLessThanOrEqual(
      2 * 60 * 60 * 1000,
    );
  });

  it('does not persist non-review actions', async () => {
    const actions: CoachingAction[] = [
      { type: 'celebrate_effort', prompt: 'Nice specific reasoning on the tense cue.' },
      { type: 'ask_socratic_question', prompt: 'What time marker would you use here?' },
      { type: 'micro_task', prompt: 'Rewrite the sentence in one breath.' },
      { type: 'reflection_prompt', prompt: 'What clue made the difference?' },
    ];
    const summary = await applyCoachingActions(USER, actions, { userInputRef: 'msg-3', now });
    expect(summary.persisted).toBe(0);
    expect(await getCoachReviews(USER)).toEqual([]);
  });

  it('returns the typed review items so the UI can show "you scheduled a review" affordance', async () => {
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
    const summary = await applyCoachingActions(USER, actions, { userInputRef: 'msg-4', now });
    expect(summary.reviewItems).toHaveLength(1);
    expect(summary.reviewItems[0].targetWord).toBe('ephemeral');
  });

  it('is idempotent: re-running with the same userInputRef + actions does not create duplicates', async () => {
    const actions: CoachingAction[] = [
      {
        type: 'schedule_review',
        prompt: 'Review ephemeral tomorrow',
        targetWord: 'ephemeral',
        targetSkill: 'vocab',
        reviewAfterHours: 24,
      },
    ];
    await applyCoachingActions(USER, actions, { userInputRef: 'msg-5', now });
    await applyCoachingActions(USER, actions, { userInputRef: 'msg-5', now });
    expect(await getCoachReviews(USER)).toHaveLength(1);
  });

  it('is a no-op for undefined / empty actions', async () => {
    expect((await applyCoachingActions(USER, undefined, { now })).persisted).toBe(0);
    expect((await applyCoachingActions(USER, [], { now })).persisted).toBe(0);
    expect(await getCoachReviews(USER)).toEqual([]);
  });

  it('skips actions that miss the data needed to schedule a review', async () => {
    const actions: CoachingAction[] = [
      { type: 'schedule_review', prompt: 'Vague schedule', reviewAfterHours: 24 },
      { type: 'retry_with_hint', prompt: 'Vague retry' },
    ];
    const summary = await applyCoachingActions(USER, actions, { userInputRef: 'msg-6', now });
    expect(summary.persisted).toBe(0);
  });
});

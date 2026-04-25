import { describe, expect, it } from 'vitest';

import type { CoachingAction } from '@/features/coach/coachingPolicy';
import {
  buildCoachActionPanelData,
  hasCoachActionPanel,
} from './coachActions';

const action = (overrides: Partial<CoachingAction> & { type: CoachingAction['type'] }): CoachingAction => ({
  prompt: overrides.prompt ?? 'default prompt',
  targetSkill: overrides.targetSkill,
  targetWord: overrides.targetWord,
  estimatedSeconds: overrides.estimatedSeconds,
  reviewAfterHours: overrides.reviewAfterHours,
  errorTypeIfRelevant: overrides.errorTypeIfRelevant,
  type: overrides.type,
});

describe('buildCoachActionPanelData', () => {
  it('returns empty data for missing or empty input', () => {
    expect(buildCoachActionPanelData(undefined)).toEqual({
      actions: [],
      scheduledReviewCount: 0,
      scheduledReviewSkills: [],
    });
    expect(buildCoachActionPanelData(null)).toEqual({
      actions: [],
      scheduledReviewCount: 0,
      scheduledReviewSkills: [],
    });
    expect(buildCoachActionPanelData([])).toEqual({
      actions: [],
      scheduledReviewCount: 0,
      scheduledReviewSkills: [],
    });
  });

  it('skips entries with unknown type or non-object shape', () => {
    const data = buildCoachActionPanelData([
      action({ type: 'retry_with_hint', prompt: 'try again now' }),
      // @ts-expect-error simulate malformed payload from the model
      { type: 'mystery_action', prompt: 'ignored' },
      // @ts-expect-error
      null,
      // @ts-expect-error
      'string',
    ]);
    expect(data.actions.length).toBe(1);
    expect(data.actions[0].action.type).toBe('retry_with_hint');
  });

  it('promotes interactive actions and counts schedule_review separately', () => {
    const actions: CoachingAction[] = [
      action({ type: 'schedule_review', prompt: 'Review aberration tomorrow', targetSkill: 'vocab' }),
      action({ type: 'retry_with_hint', prompt: 'Try the past perfect again — what auxiliary?' }),
      action({ type: 'micro_task', prompt: 'Write 1 sentence using "albeit".', estimatedSeconds: 90 }),
      action({ type: 'schedule_review', prompt: 'Recheck collocations', targetSkill: 'vocab' }),
      action({ type: 'schedule_review', prompt: 'Recheck listening dictation', targetSkill: 'listening' }),
    ];
    const data = buildCoachActionPanelData(actions);
    expect(data.scheduledReviewCount).toBe(3);
    expect(data.scheduledReviewSkills).toEqual(['vocab', 'listening']);
    expect(data.actions.map((entry) => entry.action.type)).toEqual([
      'retry_with_hint',
      'micro_task',
    ]);
    expect(data.actions[0].variant).toBe('primary');
    expect(data.actions[1].durationHint).toBe('1.5 min');
  });

  it('caps interactive actions at 3 while still counting all reviews', () => {
    const actions: CoachingAction[] = [
      action({ type: 'retry_with_hint', prompt: 'one' }),
      action({ type: 'micro_task', prompt: 'two' }),
      action({ type: 'reflection_prompt', prompt: 'three' }),
      action({ type: 'ask_socratic_question', prompt: 'four — should be dropped' }),
      action({ type: 'schedule_review', prompt: 'review', targetSkill: 'grammar' }),
    ];
    const data = buildCoachActionPanelData(actions);
    expect(data.actions.length).toBe(3);
    expect(data.actions.map((entry) => entry.action.prompt)).toEqual(['one', 'two', 'three']);
    expect(data.scheduledReviewCount).toBe(1);
  });

  it('marks celebrate_effort as non-interactive (no sendPrompt)', () => {
    const data = buildCoachActionPanelData([
      action({ type: 'celebrate_effort', prompt: 'Nice — you nailed the conditional.' }),
    ]);
    expect(data.actions.length).toBe(1);
    expect(data.actions[0].sendPrompt).toBeUndefined();
    expect(data.actions[0].variant).toBe('soft');
    expect(data.actions[0].icon).toBe('celebrate');
  });

  it('drops sendPrompt for empty / whitespace-only prompts', () => {
    const data = buildCoachActionPanelData([
      action({ type: 'retry_with_hint', prompt: '   ' }),
      action({ type: 'micro_task', prompt: '' }),
    ]);
    expect(data.actions.every((entry) => entry.sendPrompt === undefined)).toBe(true);
  });

  it('produces stable keys for identical actions', () => {
    const a: CoachingAction = action({ type: 'retry_with_hint', prompt: 'Try the past perfect.', targetSkill: 'grammar' });
    const b: CoachingAction = action({ type: 'retry_with_hint', prompt: 'Try the past perfect.', targetSkill: 'grammar' });
    const c: CoachingAction = action({ type: 'retry_with_hint', prompt: 'Different prompt.', targetSkill: 'grammar' });
    const dataAB = buildCoachActionPanelData([a, b, c]);
    expect(dataAB.actions[0].key).toBe(dataAB.actions[1].key);
    expect(dataAB.actions[0].key).not.toBe(dataAB.actions[2].key);
  });

  it('formats common duration ranges correctly', () => {
    const data = buildCoachActionPanelData([
      action({ type: 'retry_with_hint', prompt: 'a', estimatedSeconds: 25 }),
      action({ type: 'micro_task', prompt: 'b', estimatedSeconds: 60 }),
      action({ type: 'reflection_prompt', prompt: 'c', estimatedSeconds: 150 }),
    ]);
    expect(data.actions[0].durationHint).toBe('25s');
    expect(data.actions[1].durationHint).toBe('1 min');
    expect(data.actions[2].durationHint).toBe('2.5 min');
  });

  it('drops scheduled-review skills with falsy/duplicate values', () => {
    const data = buildCoachActionPanelData([
      action({ type: 'schedule_review', prompt: 'a', targetSkill: undefined }),
      action({ type: 'schedule_review', prompt: 'b', targetSkill: 'grammar' }),
      action({ type: 'schedule_review', prompt: 'c', targetSkill: 'grammar' }),
    ]);
    expect(data.scheduledReviewCount).toBe(3);
    expect(data.scheduledReviewSkills).toEqual(['grammar']);
  });
});

describe('hasCoachActionPanel', () => {
  it('returns true when there is at least one chip or scheduled review', () => {
    expect(hasCoachActionPanel({ actions: [], scheduledReviewCount: 0, scheduledReviewSkills: [] })).toBe(false);
    expect(hasCoachActionPanel({ actions: [], scheduledReviewCount: 1, scheduledReviewSkills: ['grammar'] })).toBe(true);
    expect(
      hasCoachActionPanel({
        actions: [
          {
            key: 'k',
            action: action({ type: 'retry_with_hint', prompt: 'a' }),
            icon: 'retry',
            label: { en: '', zh: '' },
            variant: 'primary',
          },
        ],
        scheduledReviewCount: 0,
        scheduledReviewSkills: [],
      }),
    ).toBe(true);
  });

  it('returns false for null/undefined', () => {
    expect(hasCoachActionPanel(undefined)).toBe(false);
    expect(hasCoachActionPanel(null)).toBe(false);
  });
});

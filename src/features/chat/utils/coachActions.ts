// coachActions.ts — display selector for the COACHING_POLICY actions.
//
// The shared coaching policy emits a typed `coachingActions` list on every
// chat reply. The chat UI uses this helper to decide:
//   • which actions become visible chips below the assistant message,
//   • which reduce to a small confirmation badge (schedule_review),
//   • and what should happen when the learner taps a chip.
//
// Pure module — no React imports — so the selection logic is unit-testable
// and shared between the desktop bubble and any future mobile surface.

import type { CoachingAction, CoachingActionType } from '@/features/coach/coachingPolicy';

export type CoachActionIcon = 'retry' | 'task' | 'thinker' | 'celebrate' | 'reflection';

export interface CoachActionDisplay {
  /** Stable key for React lists. Hash of (type|prompt|targetWord). */
  key: string;
  action: CoachingAction;
  icon: CoachActionIcon;
  /** Short bilingual label rendered on the chip. */
  label: { en: string; zh: string };
  /** Visual weight. Primary = the most actionable next step. */
  variant: 'primary' | 'soft';
  /** When defined, clicking the chip should send this string to the chat. */
  sendPrompt?: string;
  /** Optional time hint (e.g. "30s", "2 min"). */
  durationHint?: string;
}

export interface CoachActionPanelData {
  /** Interactive chips to render. Capped — see MAX_INTERACTIVE_ACTIONS. */
  actions: CoachActionDisplay[];
  /** Number of `schedule_review` actions in this turn. >0 → render a badge. */
  scheduledReviewCount: number;
  /** Skill labels of the scheduled reviews, in input order, deduped. */
  scheduledReviewSkills: string[];
}

const EMPTY: CoachActionPanelData = {
  actions: [],
  scheduledReviewCount: 0,
  scheduledReviewSkills: [],
};

const MAX_INTERACTIVE_ACTIONS = 3;

const ICON_BY_TYPE: Record<CoachingActionType, CoachActionIcon> = {
  ask_socratic_question: 'thinker',
  retry_with_hint: 'retry',
  micro_task: 'task',
  schedule_review: 'task',
  celebrate_effort: 'celebrate',
  reflection_prompt: 'reflection',
};

const LABEL_BY_TYPE: Record<CoachingActionType, { en: string; zh: string }> = {
  ask_socratic_question: { en: 'Think it through', zh: '想一想' },
  retry_with_hint:       { en: 'Try again',         zh: '再试一次' },
  micro_task:            { en: 'Quick drill',       zh: '小练习' },
  schedule_review:       { en: 'Saved review',      zh: '已加入复习' },
  celebrate_effort:      { en: 'Great move',        zh: '加油' },
  reflection_prompt:     { en: 'Reflect',           zh: '回顾一下' },
};

const VARIANT_BY_TYPE: Record<CoachingActionType, 'primary' | 'soft'> = {
  retry_with_hint: 'primary',
  micro_task: 'primary',
  ask_socratic_question: 'soft',
  reflection_prompt: 'soft',
  celebrate_effort: 'soft',
  schedule_review: 'soft',
};

// FNV-1a — used so an identical action across re-renders keeps the same key.
function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

const formatDuration = (seconds: number | undefined): string | undefined => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return undefined;
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = seconds / 60;
  if (minutes < 10) return `${minutes.toFixed(minutes >= 1 && minutes % 1 === 0 ? 0 : 1)} min`;
  return `${Math.round(minutes)} min`;
};

const buildKey = (action: CoachingAction): string => {
  const seed = `${action.type}|${action.targetSkill || ''}|${action.targetWord || ''}|${action.prompt || ''}`;
  return `coach-action-${fnv1aHex(seed)}`;
};

export function buildCoachActionPanelData(
  rawActions: CoachingAction[] | undefined | null,
): CoachActionPanelData {
  if (!Array.isArray(rawActions) || rawActions.length === 0) return EMPTY;

  const interactive: CoachActionDisplay[] = [];
  const scheduledSkills: string[] = [];
  const seenSkills = new Set<string>();
  let scheduledCount = 0;

  for (const action of rawActions) {
    if (!action || typeof action !== 'object') continue;
    if (typeof action.type !== 'string') continue;
    if (!ICON_BY_TYPE[action.type as CoachingActionType]) continue;

    if (action.type === 'schedule_review') {
      scheduledCount += 1;
      const skill = action.targetSkill;
      if (skill && !seenSkills.has(skill)) {
        seenSkills.add(skill);
        scheduledSkills.push(skill);
      }
      continue;
    }

    if (interactive.length >= MAX_INTERACTIVE_ACTIONS) continue;

    const promptText = typeof action.prompt === 'string' ? action.prompt.trim() : '';
    const sendPrompt =
      action.type === 'celebrate_effort' || promptText.length === 0 ? undefined : promptText;

    interactive.push({
      key: buildKey(action),
      action,
      icon: ICON_BY_TYPE[action.type as CoachingActionType],
      label: LABEL_BY_TYPE[action.type as CoachingActionType],
      variant: VARIANT_BY_TYPE[action.type as CoachingActionType],
      sendPrompt,
      durationHint: formatDuration(action.estimatedSeconds),
    });
  }

  if (interactive.length === 0 && scheduledCount === 0) return EMPTY;

  return {
    actions: interactive,
    scheduledReviewCount: scheduledCount,
    scheduledReviewSkills: scheduledSkills,
  };
}

export function hasCoachActionPanel(
  data: CoachActionPanelData | undefined | null,
): boolean {
  if (!data) return false;
  return data.actions.length > 0 || data.scheduledReviewCount > 0;
}

// LEARN-01 — derive a single "source signal" label for the Today hero.
//
// The mission picker (services/learningEngine#buildMissionCard) emits a
// stable `reason` enum on the chosen primary action. The Today hero needs
// to surface a one-glance label answering "what signal drove this pick?",
// constrained to: due backlog | weak topic | exam target | streak recovery.
//
// Pure module so the cockpit shell can render it without React state and
// the unit test can pin the mapping for each `learnerModel` profile.

export type MissionSourceSignal =
  | 'due backlog'
  | 'weak topic'
  | 'exam target'
  | 'streak recovery';

export interface MissionSourceSignalInput {
  /** Reason enum from `buildMissionCard` (e.g. `due_words`, `recovery_mode`). */
  reason?: string | null;
  /** Learner mode from `computeLearnerModel`. */
  learnerMode?: 'recovery' | 'maintenance' | 'steady' | 'stretch' | 'sprint' | null;
  /** Burnout risk in [0,1]. Above the threshold we flip to streak recovery. */
  burnoutRisk?: number;
  /** Active exam target (e.g. 'IELTS', 'TOEFL'). */
  examType?: string | null;
}

export const RECOVERY_BURNOUT_THRESHOLD = 0.6;

export interface MissionSourceSignalData {
  signal: MissionSourceSignal;
  label: { en: string; zh: string };
}

const LABELS: Record<MissionSourceSignal, { en: string; zh: string }> = {
  'due backlog':       { en: 'Due backlog',     zh: '到期积压' },
  'weak topic':        { en: 'Weak topic',      zh: '薄弱点' },
  'exam target':       { en: 'Exam target',     zh: '考试目标' },
  'streak recovery':   { en: 'Streak recovery', zh: '回稳模式' },
};

export function deriveMissionSourceSignal(input: MissionSourceSignalInput): MissionSourceSignalData {
  const burnout = typeof input.burnoutRisk === 'number' ? input.burnoutRisk : 0;
  // Recovery mode and high burnout always flip to streak recovery — that's
  // the framing the learner needs first, regardless of which action enum
  // the picker chose.
  if (input.learnerMode === 'recovery' || burnout >= RECOVERY_BURNOUT_THRESHOLD) {
    return { signal: 'streak recovery', label: LABELS['streak recovery'] };
  }

  const reason = (input.reason || '').trim();

  // Reason-driven mapping — explicit enums take priority over heuristics.
  if (reason === 'due_words') {
    return { signal: 'due backlog', label: LABELS['due backlog'] };
  }
  if (reason === 'weakness_drill' || reason === 'practice_gap') {
    return { signal: 'weak topic', label: LABELS['weak topic'] };
  }
  if (reason === 'exam_boost') {
    return { signal: 'exam target', label: LABELS['exam target'] };
  }

  // Heuristic fallback: an active exam path with no urgent due/weakness
  // signal still surfaces as the exam target.
  if (input.examType && input.examType.trim().length > 0) {
    return { signal: 'exam target', label: LABELS['exam target'] };
  }

  // Sprint mode without an exam reason still maps to exam target — that's
  // what `sprint` is for in computeLearnerModel.
  if (input.learnerMode === 'sprint') {
    return { signal: 'exam target', label: LABELS['exam target'] };
  }

  // Default — keep the label honest. With no urgent signal we still surface
  // weak topic since the picker fell back to a generic action.
  return { signal: 'weak topic', label: LABELS['weak topic'] };
}

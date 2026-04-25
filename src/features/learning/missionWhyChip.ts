// missionWhyChip.ts — pure mapping for the "Why this mission?" chip on Today.
//
// `buildMissionCard` (services/learningEngine) emits a stable `reason` enum
// on the chosen primary action (recovery_mode, exam_boost, due_words,
// today_words, weakness_drill, practice_gap, ...). This helper turns that
// enum into a bilingual chip label + a visual variant + a short subtitle so
// the Today hero can answer the learner's "why am I doing this?" in one
// glance. Pure module — UI-agnostic.

export type MissionWhyVariant = 'recovery' | 'sprint' | 'review' | 'today' | 'weakness' | 'practice' | 'default';

export interface MissionWhyChipData {
  reasonId: string;
  variant: MissionWhyVariant;
  label: { en: string; zh: string };
  subtitle: { en: string; zh: string };
}

const KNOWN: Record<string, { variant: MissionWhyVariant; label: { en: string; zh: string }; subtitle: { en: string; zh: string } }> = {
  recovery_mode: {
    variant: 'recovery',
    label: { en: 'Recovery mode', zh: '回稳模式' },
    subtitle: {
      en: 'Backlog is high — clear due reviews before adding new words.',
      zh: '复习积压偏高，今天先把旧账压下去，再决定要不要加新词。',
    },
  },
  exam_boost: {
    variant: 'sprint',
    label: { en: 'Exam push', zh: '考试冲刺' },
    subtitle: {
      en: 'Best path to your next score gain is one structured exam-prep drill.',
      zh: '当前最快提分的入口，是做一次结构化的考试训练。',
    },
  },
  due_words: {
    variant: 'review',
    label: { en: 'Due backlog', zh: '到期积压' },
    subtitle: {
      en: 'Reviews are stacking up — clear them first to protect retention.',
      zh: '到期复习正在堆积，先清掉再继续会更稳。',
    },
  },
  today_words: {
    variant: 'today',
    label: { en: 'Today\'s new words', zh: '今日新词' },
    subtitle: {
      en: 'Finish the new-word block while you have momentum.',
      zh: '趁状态还在，把今日新词学完再休息。',
    },
  },
  weakness_drill: {
    variant: 'weakness',
    label: { en: 'Weak-spot drill', zh: '薄弱点练习' },
    subtitle: {
      en: 'Recent errors are clustering — drill them while the signal is fresh.',
      zh: '最近错题集中在某一类，趁信号清晰时立刻针对练。',
    },
  },
  practice_gap: {
    variant: 'practice',
    label: { en: 'Practice fill-in', zh: '巩固练习' },
    subtitle: {
      en: 'Light mixed practice consolidates what you just learned.',
      zh: '一次混合短练习能把今天学的内容固化下来。',
    },
  },
};

const FALLBACK: MissionWhyChipData = {
  reasonId: 'default',
  variant: 'default',
  label: { en: 'Coach pick', zh: '教练推荐' },
  subtitle: {
    en: 'Coach picked this as the most useful next step.',
    zh: '教练在当前状态下挑出来的最值得做的一步。',
  },
};

interface MissionWhyChipInput {
  reason?: string | null;
  /**
   * Optional override — if the learner model's mode is `recovery`, treat the
   * chip as recovery-mode regardless of the underlying reason. Same idea for
   * `sprint`. Lets the framing track the learner state even when the picker
   * later chooses a different action enum.
   */
  learnerMode?: 'recovery' | 'maintenance' | 'steady' | 'stretch' | 'sprint' | null;
  burnoutRisk?: number;
}

const HIGH_BURNOUT_THRESHOLD = 0.75;

export function getMissionWhyChip(input: MissionWhyChipInput): MissionWhyChipData {
  const reason = (input.reason || '').trim();
  const base = KNOWN[reason] ?? null;

  // Force recovery framing when the learner model is in recovery or burnout
  // is critically high — the visual cue should match the learner state, not
  // just the reason enum (the picker can sometimes choose review with high
  // recovery score, etc).
  const burnout = typeof input.burnoutRisk === 'number' ? input.burnoutRisk : 0;
  if (input.learnerMode === 'recovery' || burnout >= HIGH_BURNOUT_THRESHOLD) {
    return {
      ...(base ?? FALLBACK),
      ...KNOWN.recovery_mode,
      reasonId: reason || 'recovery_mode',
    };
  }

  if (input.learnerMode === 'sprint' && (!base || base.variant !== 'recovery')) {
    return {
      ...(base ?? FALLBACK),
      ...KNOWN.exam_boost,
      reasonId: reason || 'exam_boost',
    };
  }

  if (!base) {
    return { ...FALLBACK };
  }

  return {
    reasonId: reason,
    variant: base.variant,
    label: base.label,
    subtitle: base.subtitle,
  };
}

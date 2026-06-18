// missionWhyChip.ts — pure mapping for the "Why this now?" chip on Today.
//
// `buildMissionCard` (services/learningEngine) emits a stable `reason` enum
// on the chosen primary action (recovery_mode, exam_boost, due_words,
// today_words, weakness_drill, practice_gap, ...). This helper turns that
// enum into a bilingual chip label + a visual variant + a short subtitle so
// the Today hero can answer the learner's "why am I doing this?" in one
// glance. Pure module, UI-agnostic.

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
    label: { en: 'Start with review', zh: '先复习' },
    subtitle: {
      en: 'Due words are piling up. Review first, then add new words if you still have time.',
      zh: '到期词偏多，先复习；有余力再加新词。',
    },
  },
  exam_boost: {
    variant: 'sprint',
    label: { en: 'Exam practice', zh: '考试练习' },
    subtitle: {
      en: 'Do one scored drill while the goal is fresh.',
      zh: '今天做一组可评分练习。',
    },
  },
  due_words: {
    variant: 'review',
    label: { en: 'Due reviews', zh: '到期复习' },
    subtitle: {
      en: 'Review these before they get harder to recall.',
      zh: '先复习这些词，后面会更稳。',
    },
  },
  today_words: {
    variant: 'today',
    label: { en: 'Today\'s new words', zh: '今日新词' },
    subtitle: {
      en: 'Finish the new-word block while you have momentum.',
      zh: '今日新词还没完成。',
    },
  },
  weakness_drill: {
    variant: 'weakness',
    label: { en: 'Weak spot', zh: '薄弱点' },
    subtitle: {
      en: 'Recent mistakes point here. Fix this while it is fresh.',
      zh: '最近错题集中在这里，趁现在补一下。',
    },
  },
  practice_gap: {
    variant: 'practice',
    label: { en: 'Practice fill-in', zh: '巩固练习' },
    subtitle: {
      en: 'One mixed drill helps today\'s words stick.',
      zh: '用一组混合短练习收尾。',
    },
  },
};

const FALLBACK: MissionWhyChipData = {
  reasonId: 'default',
  variant: 'default',
  label: { en: 'Next step', zh: '下一步' },
  subtitle: {
    en: 'This fits what is due and what you just practiced.',
    zh: '根据到期复习和刚练过的内容安排。',
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

import type { LearningStyle } from '@/types';

export const DEFAULT_LEARNING_STYLE: LearningStyle = 'visual';

export interface LearningStylePersonalization {
  label: { en: string; zh: string };
  practiceBadge: { en: string; zh: string };
  todayNudge: { en: string; zh: string };
  coachInstruction: string;
}

export const LEARNING_STYLE_PERSONALIZATION: Record<LearningStyle, LearningStylePersonalization> = {
  visual: {
    label: { en: 'Visual cues', zh: '视觉线索' },
    practiceBadge: { en: 'Visual-first', zh: '视觉优先' },
    todayNudge: {
      en: 'Use examples, patterns, and contrast cues as you work.',
      zh: '练习时优先看例句和句子结构。',
    },
    coachInstruction: 'Prefer visual examples, contrast tables, and pattern spotting before asking for long freeform output.',
  },
  auditory: {
    label: { en: 'Listening-first', zh: '听说优先' },
    practiceBadge: { en: 'Listening-first', zh: '听辨优先' },
    todayNudge: {
      en: 'Add pronunciation or dictation before moving into heavier writing.',
      zh: '进入重输出前，先加入发音或听写练习。',
    },
    coachInstruction: 'Prefer pronunciation, dictation, and speak-back prompts before text-heavy drills.',
  },
  kinesthetic: {
    label: { en: 'Hands-on drills', zh: '动手练习' },
    practiceBadge: { en: 'Hands-on', zh: '动手优先' },
    todayNudge: {
      en: 'Use short active drills and immediate retries instead of passive review.',
      zh: '优先做短小主动练习和即时重试，少停留在被动浏览。',
    },
    coachInstruction: 'Prefer short active drills, immediate retries, and one-step production tasks.',
  },
  reading: {
    label: { en: 'Read/write path', zh: '读写路径' },
    practiceBadge: { en: 'Read/write', zh: '读写优先' },
    todayNudge: {
      en: 'Use notes, sentence frames, and short written production.',
      zh: '优先使用笔记、句型框架和短写作输出。',
    },
    coachInstruction: 'Prefer sentence frames, note-style explanations, and short written production.',
  },
};

export function normalizeLearningStyle(value: unknown): LearningStyle {
  if (value === 'visual' || value === 'auditory' || value === 'kinesthetic' || value === 'reading') {
    return value;
  }
  return DEFAULT_LEARNING_STYLE;
}

export function getLearningStylePersonalization(value: unknown): LearningStylePersonalization {
  return LEARNING_STYLE_PERSONALIZATION[normalizeLearningStyle(value)];
}

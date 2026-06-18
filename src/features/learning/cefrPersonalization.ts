import type { CEFRLevel } from '@/types';

export type CefrBand = 'foundation' | 'independent' | 'advanced';

export function normalizeCefrLevel(value: unknown): CEFRLevel {
  if (value === 'A1' || value === 'A2' || value === 'B1' || value === 'B2' || value === 'C1' || value === 'C2') {
    return value;
  }
  return 'B1';
}

export function getCefrBand(value: unknown): CefrBand {
  const level = normalizeCefrLevel(value);
  if (level === 'A1' || level === 'A2') return 'foundation';
  if (level === 'C1' || level === 'C2') return 'advanced';
  return 'independent';
}

export function isUpperIntermediateOrAbove(value: unknown): boolean {
  const level = normalizeCefrLevel(value);
  return level === 'B2' || level === 'C1' || level === 'C2';
}

export function isExamTarget(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return /\b(ielts|toefl|exam|band|score)\b/i.test(value);
}

export const CEFR_TODAY_COPY: Record<CefrBand, {
  title: { en: string; zh: string };
  descriptionPrefix: { en: string; zh: string };
}> = {
  foundation: {
    title: { en: 'Build a simple foundation set', zh: '先打稳基础高频词' },
    descriptionPrefix: {
      en: 'Keep today concrete: pronunciation, meaning, and one usable sentence before adding harder material.',
      zh: '今天先保持具体：发音、词义和一个能用的句子优先，不急着堆难词。',
    },
  },
  independent: {
    title: { en: 'Finish today\'s new words', zh: '完成今日新词' },
    descriptionPrefix: {
      en: 'Use today to keep vocabulary growth and review pressure balanced.',
      zh: '先把今日新词学完，再做复习或练习。',
    },
  },
  advanced: {
    title: { en: 'Push advanced vocabulary into output', zh: '把高级词推进到输出里' },
    descriptionPrefix: {
      en: 'At this level, the useful move is precision: collocations, academic usage, and short production.',
      zh: '这个阶段最有价值的是精确使用：搭配、学术语境和短输出。',
    },
  },
};

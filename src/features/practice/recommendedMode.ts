import type { LearningStyle } from '@/types';
import { normalizeLearningStyle } from '@/features/learning/learningStylePersonalization';

export type PracticeModeId = 'quiz' | 'fill_blank' | 'listening' | 'writing';

export type PracticeRecommendationReason =
  | 'due_reviews'
  | 'style_visual'
  | 'style_auditory'
  | 'style_kinesthetic'
  | 'style_reading'
  | 'new_word_recall'
  | 'new_word_listening'
  | 'fallback_output';

export interface PracticeModeRecommendation {
  modeId: PracticeModeId;
  reason: PracticeRecommendationReason;
}

export function getRecommendedPracticeMode(args: {
  dueWordCount: number;
  dailyWordCount: number;
  learningStyle?: LearningStyle;
}): PracticeModeRecommendation {
  if (args.dueWordCount >= 5) {
    return { modeId: 'quiz', reason: 'due_reviews' };
  }

  const style = normalizeLearningStyle(args.learningStyle);

  if (style === 'visual') {
    return { modeId: 'quiz', reason: 'style_visual' };
  }

  if (style === 'auditory' && args.dailyWordCount >= 4) {
    return { modeId: 'listening', reason: 'style_auditory' };
  }

  if (style === 'kinesthetic' && args.dailyWordCount > 0) {
    return { modeId: 'fill_blank', reason: 'style_kinesthetic' };
  }

  if (style === 'reading') {
    return { modeId: 'writing', reason: 'style_reading' };
  }

  if (args.dailyWordCount >= 8) {
    return { modeId: 'fill_blank', reason: 'new_word_recall' };
  }

  if (args.dailyWordCount >= 4) {
    return { modeId: 'listening', reason: 'new_word_listening' };
  }

  return { modeId: 'writing', reason: 'fallback_output' };
}

export function isStylePracticeRecommendation(reason: PracticeRecommendationReason): boolean {
  return reason.startsWith('style_');
}

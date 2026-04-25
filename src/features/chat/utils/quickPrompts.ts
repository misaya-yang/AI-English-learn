import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  NotebookPen,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import type { QuickPromptOption } from '@/features/chat/types';

export interface QuickPromptContext {
  level?: string;
  dueCount?: number;
  hasExamGoal?: boolean;
  incompleteTasks?: string[];
}

type Translator = (key: string, options?: Record<string, unknown>) => string;

/**
 * Build the list of contextual quick prompts shown above the chat composer.
 *
 * Identical behaviour to the previous inline `getQuickPrompts` in `ChatPage.tsx`:
 * the order of pushed prompts and the cap at four entries are preserved so the
 * rendered DOM remains byte-equivalent.
 */
export const buildQuickPrompts = (t: Translator, ctx?: QuickPromptContext): QuickPromptOption[] => {
  const prompts: QuickPromptOption[] = [];

  // Review pressure — suggest review-related prompts
  if (ctx?.dueCount && ctx.dueCount >= 3) {
    prompts.push({
      icon: RotateCcw,
      text: `I have ${ctx.dueCount} words due for review. Help me practice them in context.`,
      textZh: t('chat.quickPrompts.reviewPractice', { defaultValue: `帮我在语境中复习 ${ctx.dueCount} 个到期词汇` }),
    });
  }

  // Exam goal — add IELTS-specific prompts
  if (ctx?.hasExamGoal) {
    prompts.push({
      icon: GraduationCap,
      text: 'Give me an IELTS Writing Task 2 topic and evaluate my response structure.',
      textZh: t('chat.quickPrompts.ieltsWriting', { defaultValue: '给我一个雅思写作 Task 2 话题并评估我的结构' }),
    });
  }

  // Beginner level — simpler prompts
  if (ctx?.level === 'A1' || ctx?.level === 'A2') {
    prompts.push(
      { icon: MessageSquare, text: 'Create a simple dialogue for ordering coffee', textZh: t('chat.quickPrompts.simpleDiag', { defaultValue: '创建一个简单的点咖啡对话' }) },
      { icon: BookOpen, text: 'Teach me 5 common greetings and when to use them', textZh: t('chat.quickPrompts.greetings', { defaultValue: '教我 5 个常用问候语及使用场景' }) },
    );
  }

  // Incomplete writing task
  if (ctx?.incompleteTasks?.includes('writing')) {
    prompts.push({
      icon: NotebookPen,
      text: 'Give me a short writing prompt and provide feedback on my response.',
      textZh: t('chat.quickPrompts.writingTask', { defaultValue: '给我一个写作题目并对我的回答提供反馈' }),
    });
  }

  // Default prompts — always available as fallback
  const defaults: QuickPromptOption[] = [
    { icon: BookOpen, text: 'Explain the difference between "affect" and "effect"', textZh: t('chat.quickPrompts.affectEffect') },
    { icon: Lightbulb, text: 'Give me 5 collocations with "make"', textZh: t('chat.quickPrompts.collocations') },
    { icon: MessageSquare, text: 'Create a short dialogue at a restaurant', textZh: t('chat.quickPrompts.dialogue') },
    { icon: Sparkles, text: 'Help me practice using "serendipity"', textZh: t('chat.quickPrompts.practice') },
  ];

  // Fill up to 4 prompts
  for (const d of defaults) {
    if (prompts.length >= 4) break;
    if (!prompts.some((p) => p.text === d.text)) prompts.push(d);
  }

  return prompts.slice(0, 4);
};

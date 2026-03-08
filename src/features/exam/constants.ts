import type { FeedbackIssue, PlanTier } from '@/types/examContent';

export const ISSUE_LABELS: Record<FeedbackIssue['tag'], string> = {
  task_response: '任务回应',
  coherence: '连贯衔接',
  lexical: '词汇资源',
  grammar: '语法准确',
  logic: '论证逻辑',
  collocation: '搭配自然度',
  tense: '时态控制',
};

export const ISSUE_VOCAB_QUERY: Record<FeedbackIssue['tag'], string> = {
  task_response: 'thesis argument opinion discuss',
  coherence: 'linking words coherence cohesion transition',
  lexical: 'academic vocabulary synonyms lexical resource',
  grammar: 'articles tense clauses grammar',
  logic: 'reasoning claim evidence logic',
  collocation: 'collocation phrase chunks',
  tense: 'verb tense consistency',
};

export const QUIET_TOPICS = ['hello', 'hi', '你好', '在吗', 'hey'];

export const FEATURE_TOTAL_BY_PLAN: Record<
  PlanTier,
  {
    aiAdvancedFeedbackPerDay: number;
    simItemsPerDay: number;
    microLessonsPerDay: number;
  }
> = {
  free: {
    aiAdvancedFeedbackPerDay: 2,
    simItemsPerDay: 2,
    microLessonsPerDay: 1,
  },
  pro: {
    aiAdvancedFeedbackPerDay: 30,
    simItemsPerDay: 20,
    microLessonsPerDay: 20,
  },
};

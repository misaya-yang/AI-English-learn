export type ExamType = 'IELTS' | 'TOEFL';
export type ExamSkill = 'writing' | 'speaking' | 'reading' | 'listening';
export type PlanTier = 'free' | 'pro';
export type LearningTrack =
  | 'daily_communication'
  | 'workplace_english'
  | 'travel_survival'
  | 'exam_boost';

export interface ExamTrack {
  id: string;
  examType: ExamType;
  skill: ExamSkill;
  bandTarget: string;
  title: string;
  source: string;
  license: string;
}

export interface ContentUnit {
  id: string;
  trackId: string;
  title: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimatedMinutes: number;
  learningObjectives: string[];
  itemIds: string[];
  createdAt: string;
  source: string;
  license: string;
  attribution?: string;
}

export interface ExamItem {
  id: string;
  unitId: string;
  examType: ExamType;
  skill: ExamSkill;
  itemType: 'writing_task_1' | 'writing_task_2' | 'speaking_part_2' | 'reading_summary';
  prompt: string;
  referenceAnswer: string;
  rubricId: string;
  source: string;
  license: string;
  attribution?: string;
}

export interface ExamRubric {
  id: string;
  examType: ExamType;
  skill: ExamSkill;
  name: string;
  criteria: string[];
  source: string;
  license: string;
}

export interface FeedbackIssue {
  tag: 'task_response' | 'coherence' | 'lexical' | 'grammar' | 'logic' | 'collocation' | 'tense' | 'word_count';
  severity: 'low' | 'medium' | 'high';
  /** The exact problematic sentence from the essay (used for highlighting) */
  sentence?: string;
  message: string;
  messageZh?: string;
  suggestion: string;
  suggestionZh?: string;
  /** Corrected version of the problematic sentence */
  correction?: string;
}

export interface AiFeedback {
  attemptId: string;
  scores: {
    taskResponse: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRangeAccuracy: number;
    overallBand: number;
  };
  issues: FeedbackIssue[];
  /** Positive observations from the grader */
  strengths?: string[];
  /** 2-3 sentence overall assessment */
  summary?: string;
  summaryZh?: string;
  /** The worst sentence rewritten at a higher band level */
  improvedSentence?: string;
  rewrites: string[];
  nextActions: string[];
  confidence: number;
  provider: 'edge' | 'fallback' | 'cache';
  createdAt: string;
  prompt?: string;
  taskType?: 'task1' | 'task2';
  trackId?: string;
  unitId?: string;
  answerPreview?: string;
  latencyMs?: number;
  sourceMode?: 'manual' | 'simulation';
}

export interface ItemAttempt {
  id: string;
  userId: string;
  itemId: string;
  examType: ExamType;
  skill: ExamSkill;
  answer: string;
  createdAt: string;
}

export interface Entitlement {
  userId: string;
  plan: PlanTier;
  quota: {
    aiAdvancedFeedbackPerDay: number;
    simItemsPerDay: number;
    microLessonsPerDay: number;
  };
  periodStart: string;
  periodEnd: string;
}

export interface EntitlementUsage {
  userId: string;
  date: string;
  aiAdvancedFeedbackUsed: number;
  simItemsUsed: number;
  microLessonsUsed: number;
}

export interface AnalyzedErrorNode {
  tag: FeedbackIssue['tag'];
  count: number;
  latestAt: string;
}

export interface QuotaConsumeResult {
  allowed: boolean;
  remaining: number;
  reason?: string;
}

export interface LearningProfile {
  userId: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  target: string;
  tracks: LearningTrack[];
  dailyMinutes: number;
  languagePreference: 'en' | 'zh' | 'bilingual';
  updatedAt: string;
}

export interface LearningMissionTask {
  id: string;
  type: 'vocabulary' | 'quiz' | 'writing' | 'review';
  title: string;
  titleZh: string;
  done: boolean;
  meta?: Record<string, unknown>;
}

export interface LearningMission {
  id: string;
  userId: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedMinutes: number;
  tasks: LearningMissionTask[];
  updatedAt: string;
}

export type LearningEventName =
  | 'chat.message_sent'
  | 'chat.reply_received'
  | 'chat.quiz_attempted'
  | 'chat.ttft'
  | 'chat.quiz_next_latency'
  | 'chat.fast_path_hit'
  | 'practice.quiz_submitted'
  | 'practice.listening_submitted'
  | 'practice.writing_submitted'
  | 'review.word_rated'
  | 'today.word_marked'
  | 'grammar.practice_completed'
  | 'reading.passage_completed'
  | 'listening.passage_completed'
  | 'billing.checkout_started'
  | 'billing.subscription_updated'
  | 'mission.task_completed';

export interface BillingCheckoutRequest {
  planId: 'pro_monthly' | 'pro_yearly';
  provider: 'stripe' | 'alipay';
  successUrl: string;
  cancelUrl: string;
}

export interface BillingCheckoutResponse {
  provider: 'stripe' | 'alipay';
  checkoutUrl?: string;
  orderId?: string;
  expiresAt: string;
}

export interface SubscriptionState {
  plan: PlanTier;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'inactive' | 'pending' | 'unpaid';
  currentPeriodEnd: string | null;
  provider: 'stripe' | 'alipay' | 'manual';
}

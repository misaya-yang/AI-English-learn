export type ExamType = 'IELTS' | 'TOEFL';
export type ExamSkill = 'writing' | 'speaking' | 'reading' | 'listening';
export type PlanTier = 'free' | 'pro';

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
  tag: 'task_response' | 'coherence' | 'lexical' | 'grammar' | 'logic' | 'collocation' | 'tense';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
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
  rewrites: string[];
  nextActions: string[];
  confidence: number;
  provider: 'edge' | 'fallback';
  createdAt: string;
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

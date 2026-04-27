export type LoadingStage =
  | 'idle'
  | 'simulating'
  | 'grading'
  | 'tutoring'
  | 'micro'
  | 'outlining'
  | 'vocab';

export type TaskType = 'task1' | 'task2';
export type PromptDifficulty = 'easy' | 'medium' | 'hard';
export type WorkspaceView = 'brief' | 'draft' | 'review' | 'insight';
export type InsightView = 'weakness' | 'trend' | 'history';
export type ToolPanel = 'outline' | 'vocab' | 'coach';

export interface ExamQuotaRemaining {
  aiAdvancedFeedbackPerDay: number;
  simItemsPerDay: number;
  microLessonsPerDay: number;
}

export interface ExamDraftSnapshot {
  selectedTrackId?: string;
  selectedUnitId?: string;
  taskType?: TaskType;
  promptTopic?: string;
  promptDifficulty?: PromptDifficulty;
  writingPrompt?: string;
  writingAnswer?: string;
  simulation?: {
    totalSec: number;
    remainingSec: number;
    isRunning: boolean;
  };
}

export interface WorkspaceCopy {
  eyebrow: string;
  title: string;
  body: string;
}

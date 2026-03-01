export type ChatMode = 'chat' | 'study' | 'quiz' | 'canvas';

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizArtifact {
  type: 'quiz';
  payload: {
    quizId: string;
    title: string;
    questionType: QuizQuestionType;
    stem: string;
    options: QuizOption[];
    answerKey: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    skills: string[];
    estimatedSeconds: number;
    targetWord?: string;
    tags?: string[];
  };
}

export interface StudyPlanArtifact {
  type: 'study_plan';
  payload: {
    title: string;
    steps: string[];
    estimatedMinutes?: number;
  };
}

export interface CanvasHintArtifact {
  type: 'canvas_hint';
  payload: {
    title: string;
    hints: string[];
  };
}

export type ChatArtifact = QuizArtifact | StudyPlanArtifact | CanvasHintArtifact;

export interface AgentMeta {
  triggerReason?: string;
  confidence?: number;
  schemaVersion?: string;
  latencyMs?: number;
}

export interface ChatEdgeResponse {
  content: string;
  provider?: 'edge' | 'fallback';
  artifacts?: ChatArtifact[];
  agentMeta?: AgentMeta;
}

export interface SendMessageOptions {
  mode?: ChatMode;
  featureFlags?: {
    enableQuizArtifacts?: boolean;
    enableStudyArtifacts?: boolean;
    forceQuiz?: boolean;
    allowAutoQuiz?: boolean;
  };
  trigger?: 'manual_input' | 'quick_prompt' | 'quiz_button' | 'retry';
}

export interface ChatQuizAttempt {
  id: string;
  quizId: string;
  sessionId: string;
  userId: string;
  selected: string;
  isCorrect: boolean;
  durationMs: number;
  createdAt: number;
  sourceMode: ChatMode;
}

export interface LearningImpactSnapshot {
  userId: string;
  window: 'baseline14d' | 'post28d';
  retrievalAccuracy: number;
  delayedRecallD1: number;
  delayedRecallD7: number;
  transferScore: number;
}

export type ChatMode = 'chat' | 'study' | 'quiz' | 'canvas';

export type SearchMode = 'off' | 'auto' | 'force';

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

export interface ChatSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  publishedAt?: string;
  snippet: string;
  confidence: number;
}

export interface WebSourcesArtifact {
  type: 'web_sources';
  payload: {
    title: string;
    sources: ChatSource[];
  };
}

export interface CanvasSummaryArtifact {
  type: 'canvas_summary';
  payload: {
    title: string;
    summary: string;
    childSessionId?: string;
  };
}

export interface ToolRun {
  tool: string;
  name: string;
  status: 'success' | 'error' | 'skipped' | 'rate_limited';
  latencyMs: number;
  errorCode?: string;
}

export interface ChatRenderState {
  stage: 'planning' | 'searching' | 'composing' | 'streaming';
  progress?: number;
}

export interface QuizRunState {
  runId: string;
  targetCount: number;
  answeredCount: number;
  status: 'idle' | 'awaiting_answer' | 'grading' | 'requesting_next' | 'completed';
  currentQuizId?: string;
  seedPrompt: string;
  usedWords: string[];
  startedAt: number;
  completedAt?: number;
}

export interface ContextMeta {
  inputTokensEst: number;
  budgetUsed: {
    system: number;
    recentTurns: number;
    memory: number;
    toolObservations: number;
    reserve: number;
  };
  compacted: boolean;
  memoryHits: number;
  searchTriggered: boolean;
}

export interface CanvasSessionMeta {
  parentSessionId?: string;
  childSessionId?: string;
  syncState?: 'isolated' | 'synced' | 'not_applicable';
}

export type ChatArtifact =
  | QuizArtifact
  | StudyPlanArtifact
  | CanvasHintArtifact
  | WebSourcesArtifact
  | CanvasSummaryArtifact;

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
  renderState?: ChatRenderState;
  quizRun?: {
    runId: string;
    questionIndex: number;
    targetCount: number;
  };
  sources?: ChatSource[];
  toolRuns?: ToolRun[];
  contextMeta?: ContextMeta;
  canvasSessionMeta?: CanvasSessionMeta;
}

export interface SendMessageOptions {
  mode?: ChatMode;
  searchMode?: SearchMode;
  canvasSyncToParent?: boolean;
  apiContentOverride?: string;
  hideUserMessage?: boolean;
  featureFlags?: {
    enableQuizArtifacts?: boolean;
    enableStudyArtifacts?: boolean;
    forceQuiz?: boolean;
    allowAutoQuiz?: boolean;
    forceWebSearch?: boolean;
  };
  quizRun?: {
    runId: string;
    questionIndex: number;
    targetCount: number;
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

import type { CoachingAction, LearnerContext } from '@/features/coach/coachingPolicy';
export type { CoachingAction, LearnerContext } from '@/features/coach/coachingPolicy';

export type ChatMode = 'chat' | 'study' | 'quiz' | 'canvas';

export type SearchMode = 'off' | 'auto' | 'force';
export type TutorSurface = 'chat' | 'today' | 'exam' | 'practice';
export type FastPathKind =
  | 'simple_greeting'
  | 'short_clarification'
  | 'quiz_forced'
  | 'canvas_mode'
  | 'normal';

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

export interface QuizQuestionProgress {
  runId: string;
  quizId: string;
  questionIndex: number;
  targetCount: number;
  answeredCount: number;
  canAdvance: boolean;
  isCompleted: boolean;
}

export interface QuizCanvasState {
  runId: string;
  activeQuizId?: string;
  activeIndex: number;
  totalLoaded: number;
  answeredCount: number;
  targetCount: number;
  hasPendingQuestion: boolean;
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

export interface MemoryUsedTrace {
  id: string;
  kind: string;
  contentPreview: string;
  confidence: number;
  score: number;
  isPinned: boolean;
}

export interface MemoryWriteTrace {
  id?: string;
  kind: string;
  contentPreview: string;
  confidence: number;
  dedupeKey: string;
  reason: 'stable' | 'tool_fact' | 'error_trace' | 'explicit';
}

export interface CanvasSessionMeta {
  parentSessionId?: string;
  childSessionId?: string;
  syncState?: 'isolated' | 'synced' | 'not_applicable';
}

export interface ChatFastPathDecision {
  enabled: boolean;
  reason: FastPathKind;
}

export interface ChatPerfSnapshot {
  ttftMs: number | null;
  nextQuestionMs: number | null;
  lastUpdatedAt: number | null;
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
  coachingPolicyVersion?: string;
}

export interface ChatEdgeResponse {
  content: string;
  provider?: 'edge' | 'fallback';
  artifacts?: ChatArtifact[];
  coachingActions?: CoachingAction[];
  agentMeta?: AgentMeta;
  renderState?: ChatRenderState;
  perfMeta?: {
    latencyMs: number;
  };
  quizRun?: {
    runId: string;
    questionIndex: number;
    targetCount: number;
    status?: QuizRunState['status'];
  };
  sources?: ChatSource[];
  toolRuns?: ToolRun[];
  contextMeta?: ContextMeta;
  canvasSessionMeta?: CanvasSessionMeta;
  memoryUsed?: MemoryUsedTrace[];
  memoryWrites?: MemoryWriteTrace[];
  memoryTraceId?: string;
}

export interface SendMessageOptions {
  surface?: TutorSurface;
  goalContext?: string;
  weakTags?: string[];
  // Optional richer learner-model snapshot. When provided, the COACHING_POLICY
  // references these fields in the system prompt (level/target/due backlog/
  // burnout risk/recent errors/etc). Backward compatible with callers that
  // only set `weakTags`.
  learnerProfile?: Partial<LearnerContext>;
  mode?: ChatMode;
  searchMode?: SearchMode;
  responseStyle?: 'concise' | 'coach';
  quizPolicy?: {
    revealAnswer?: 'after_submit';
  };
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
  memoryPolicy?: {
    topK?: number;
    minSimilarity?: number;
    writeMode?: 'stable_only' | 'balanced';
    allowSensitiveStore?: boolean;
  };
  memoryControl?: {
    explicitRemember?: string[];
    explicitRememberKind?: 'profile' | 'preference' | 'weakness_tag' | 'goal' | 'error_trace' | 'tool_fact';
    explicitForget?: {
      ids?: string[];
      dedupeKeys?: string[];
      query?: string;
    };
  };
  quizRun?: {
    runId: string;
    questionIndex: number;
    targetCount: number;
    status?: QuizRunState['status'];
  };
  trigger?: 'manual_input' | 'quick_prompt' | 'quiz_button' | 'retry';
}

export interface ChatQuizAttempt {
  id: string;
  quizId: string;
  sessionId: string;
  userId: string;
  runId?: string;
  questionIndex?: number;
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

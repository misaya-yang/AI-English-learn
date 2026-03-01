export type ChatMode = 'chat' | 'study' | 'quiz' | 'canvas';

export interface ChatSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  publishedAt?: string;
  snippet: string;
  confidence: number;
}

export interface ToolRun {
  tool: string;
  name: string;
  status: 'success' | 'error' | 'skipped' | 'rate_limited';
  latencyMs: number;
  errorCode?: string;
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

export interface QuizArtifactPayload {
  quizId: string;
  title: string;
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank';
  stem: string;
  options: Array<{ id: string; text: string }>;
  answerKey: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  estimatedSeconds: number;
  targetWord?: string;
  tags?: string[];
}

export type ChatArtifact =
  | {
      type: 'quiz';
      payload: QuizArtifactPayload;
    }
  | {
      type: 'study_plan';
      payload: {
        title: string;
        steps: string[];
        estimatedMinutes?: number;
      };
    }
  | {
      type: 'canvas_hint';
      payload: {
        title: string;
        hints: string[];
      };
    }
  | {
      type: 'web_sources';
      payload: {
        title: string;
        sources: ChatSource[];
      };
    }
  | {
      type: 'canvas_summary';
      payload: {
        title: string;
        summary: string;
        childSessionId?: string;
      };
    };

export interface AgentMeta {
  triggerReason?: string;
  confidence?: number;
  schemaVersion?: string;
  latencyMs?: number;
}

export interface ChatRenderState {
  stage: 'planning' | 'searching' | 'composing' | 'streaming';
  progress?: number;
}

export interface QuizRunMeta {
  runId: string;
  questionIndex: number;
  targetCount: number;
}

export interface ChatEnvelope {
  content: string;
  artifacts?: ChatArtifact[];
  agentMeta?: AgentMeta;
  renderState?: ChatRenderState;
  quizRun?: QuizRunMeta;
  sources?: ChatSource[];
  toolRuns?: ToolRun[];
  contextMeta?: ContextMeta;
  canvasSessionMeta?: CanvasSessionMeta;
}

const sanitizeText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const sanitizeFallbackText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  if (!text) return '';

  const objectDumpMatches = text.match(/\[object Object\]/g);
  if (objectDumpMatches && objectDumpMatches.length >= 2) {
    return '';
  }

  return text;
};

const hashText = (input: string): string => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const normalizeQuizId = (quizId: unknown, stem: string): string => {
  const baseId = sanitizeText(quizId) || 'quiz';
  const stemHash = hashText(stem || baseId).slice(0, 8);
  return `${baseId}_${stemHash}`;
};

export const normalizeMode = (mode: unknown): ChatMode => {
  if (mode === 'chat' || mode === 'study' || mode === 'quiz' || mode === 'canvas') {
    return mode;
  }
  return 'study';
};

export const clampConfidence = (value: unknown, fallback = 0.72): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
};

const normalizeQuizPayload = (payload: unknown): QuizArtifactPayload | null => {
  if (!payload || typeof payload !== 'object') return null;
  const raw = payload as Partial<QuizArtifactPayload>;

  if (!raw.quizId || !raw.stem || !raw.answerKey || !Array.isArray(raw.options) || raw.options.length < 2) {
    return null;
  }

  const options = raw.options
    .filter((option): option is { id: string; text: string } =>
      Boolean(option && typeof option.id === 'string' && option.id.trim().length > 0 && typeof option.text === 'string' && option.text.trim().length > 0),
    )
    .map((option) => ({ id: option.id.trim(), text: option.text.trim() }));

  if (options.length < 2 || !options.some((option) => option.id === raw.answerKey)) {
    return null;
  }

  return {
    quizId: normalizeQuizId(raw.quizId, sanitizeText(raw.stem)),
    title: sanitizeText(raw.title) || 'Quick quiz',
    questionType:
      raw.questionType === 'true_false' || raw.questionType === 'fill_blank' || raw.questionType === 'multiple_choice'
        ? raw.questionType
        : 'multiple_choice',
    stem: sanitizeText(raw.stem),
    options,
    answerKey: String(raw.answerKey),
    explanation: sanitizeText(raw.explanation),
    difficulty: raw.difficulty === 'easy' || raw.difficulty === 'hard' ? raw.difficulty : 'medium',
    skills: Array.isArray(raw.skills) ? raw.skills.filter((skill): skill is string => typeof skill === 'string') : [],
    estimatedSeconds: Number.isFinite(raw.estimatedSeconds) ? Number(raw.estimatedSeconds) : 45,
    targetWord: typeof raw.targetWord === 'string' ? raw.targetWord.trim() : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
  };
};

const normalizeSources = (sources: unknown): ChatSource[] => {
  if (!Array.isArray(sources)) return [];

  return sources
    .map((source, index): ChatSource | null => {
      if (!source || typeof source !== 'object') return null;
      const raw = source as Partial<ChatSource>;
      const url = sanitizeText(raw.url);
      if (!url) return null;

      const domain = sanitizeText(raw.domain) || (() => {
        try {
          return new URL(url).hostname;
        } catch {
          return 'unknown';
        }
      })();

      return {
        id: sanitizeText(raw.id) || `source_${index + 1}`,
        title: sanitizeText(raw.title) || domain,
        url,
        domain,
        publishedAt: sanitizeText(raw.publishedAt) || undefined,
        snippet: sanitizeText(raw.snippet),
        confidence: clampConfidence(raw.confidence, 0.6),
      };
    })
    .filter((item): item is ChatSource => Boolean(item));
};

const normalizeToolRuns = (runs: unknown): ToolRun[] => {
  if (!Array.isArray(runs)) return [];

  return runs
    .map((run): ToolRun | null => {
      if (!run || typeof run !== 'object') return null;
      const raw = run as Partial<ToolRun>;

      const tool = sanitizeText(raw.tool);
      const name = sanitizeText(raw.name) || tool;
      if (!tool || !name) return null;

      const status =
        raw.status === 'success' || raw.status === 'error' || raw.status === 'skipped' || raw.status === 'rate_limited'
          ? raw.status
          : 'skipped';

      return {
        tool,
        name,
        status,
        latencyMs: Number.isFinite(raw.latencyMs) ? Number(raw.latencyMs) : 0,
        errorCode: sanitizeText(raw.errorCode) || undefined,
      };
    })
    .filter((item): item is ToolRun => Boolean(item));
};

const normalizeArtifacts = (artifacts: unknown): ChatArtifact[] => {
  if (!Array.isArray(artifacts)) return [];

  const normalized: ChatArtifact[] = [];

  artifacts.forEach((artifact) => {
    if (!artifact || typeof artifact !== 'object') return;
    const raw = artifact as { type?: string; payload?: unknown };

    if (raw.type === 'quiz') {
      const quizPayload = normalizeQuizPayload(raw.payload);
      if (quizPayload) {
        normalized.push({ type: 'quiz', payload: quizPayload });
      }
      return;
    }

    if (raw.type === 'study_plan' && raw.payload && typeof raw.payload === 'object') {
      const payload = raw.payload as { title?: unknown; steps?: unknown; estimatedMinutes?: unknown };
      const steps = Array.isArray(payload.steps)
        ? payload.steps.filter((step): step is string => typeof step === 'string' && step.trim().length > 0)
        : [];
      const title = sanitizeText(payload.title);
      if (title && steps.length > 0) {
        normalized.push({
          type: 'study_plan',
          payload: {
            title,
            steps,
            estimatedMinutes: Number.isFinite(payload.estimatedMinutes) ? Number(payload.estimatedMinutes) : undefined,
          },
        });
      }
      return;
    }

    if (raw.type === 'canvas_hint' && raw.payload && typeof raw.payload === 'object') {
      const payload = raw.payload as { title?: unknown; hints?: unknown };
      const hints = Array.isArray(payload.hints)
        ? payload.hints.filter((hint): hint is string => typeof hint === 'string' && hint.trim().length > 0)
        : [];
      const title = sanitizeText(payload.title);
      if (title && hints.length > 0) {
        normalized.push({
          type: 'canvas_hint',
          payload: { title, hints },
        });
      }
      return;
    }

    if (raw.type === 'web_sources' && raw.payload && typeof raw.payload === 'object') {
      const payload = raw.payload as { title?: unknown; sources?: unknown };
      const sources = normalizeSources(payload.sources);
      if (sources.length > 0) {
        normalized.push({
          type: 'web_sources',
          payload: {
            title: sanitizeText(payload.title) || 'Sources',
            sources,
          },
        });
      }
      return;
    }

    if (raw.type === 'canvas_summary' && raw.payload && typeof raw.payload === 'object') {
      const payload = raw.payload as { title?: unknown; summary?: unknown; childSessionId?: unknown };
      const summary = sanitizeText(payload.summary);
      if (summary) {
        normalized.push({
          type: 'canvas_summary',
          payload: {
            title: sanitizeText(payload.title) || 'Canvas Summary',
            summary,
            childSessionId: sanitizeText(payload.childSessionId) || undefined,
          },
        });
      }
    }
  });

  return normalized;
};

const normalizeContextMeta = (contextMeta: unknown): ContextMeta | undefined => {
  if (!contextMeta || typeof contextMeta !== 'object') return undefined;
  const raw = contextMeta as Partial<ContextMeta> & { budgetUsed?: Partial<ContextMeta['budgetUsed']> };

  const inputTokensEst = Number.isFinite(raw.inputTokensEst) ? Number(raw.inputTokensEst) : 0;
  const budgetUsed = {
    system: Number.isFinite(raw.budgetUsed?.system) ? Number(raw.budgetUsed?.system) : 0,
    recentTurns: Number.isFinite(raw.budgetUsed?.recentTurns) ? Number(raw.budgetUsed?.recentTurns) : 0,
    memory: Number.isFinite(raw.budgetUsed?.memory) ? Number(raw.budgetUsed?.memory) : 0,
    toolObservations: Number.isFinite(raw.budgetUsed?.toolObservations) ? Number(raw.budgetUsed?.toolObservations) : 0,
    reserve: Number.isFinite(raw.budgetUsed?.reserve) ? Number(raw.budgetUsed?.reserve) : 0,
  };

  return {
    inputTokensEst,
    budgetUsed,
    compacted: Boolean(raw.compacted),
    memoryHits: Number.isFinite(raw.memoryHits) ? Number(raw.memoryHits) : 0,
    searchTriggered: Boolean(raw.searchTriggered),
  };
};

const normalizeCanvasSessionMeta = (meta: unknown): CanvasSessionMeta | undefined => {
  if (!meta || typeof meta !== 'object') return undefined;
  const raw = meta as Partial<CanvasSessionMeta>;

  const parentSessionId = sanitizeText(raw.parentSessionId) || undefined;
  const childSessionId = sanitizeText(raw.childSessionId) || undefined;
  const syncState =
    raw.syncState === 'isolated' || raw.syncState === 'synced' || raw.syncState === 'not_applicable'
      ? raw.syncState
      : undefined;

  if (!parentSessionId && !childSessionId && !syncState) {
    return undefined;
  }

  return {
    parentSessionId,
    childSessionId,
    syncState,
  };
};

const normalizeRenderState = (value: unknown): ChatRenderState | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Partial<ChatRenderState>;
  const stage =
    raw.stage === 'planning' ||
    raw.stage === 'searching' ||
    raw.stage === 'composing' ||
    raw.stage === 'streaming'
      ? raw.stage
      : undefined;

  if (!stage) return undefined;

  const progress = typeof raw.progress === 'number' && Number.isFinite(raw.progress)
    ? Math.max(0, Math.min(1, raw.progress))
    : undefined;

  return { stage, progress };
};

const normalizeQuizRunMeta = (value: unknown): QuizRunMeta | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Partial<QuizRunMeta>;
  const runId = sanitizeText(raw.runId);
  const questionIndex = Number(raw.questionIndex);
  const targetCount = Number(raw.targetCount);
  if (!runId || !Number.isFinite(questionIndex) || !Number.isFinite(targetCount)) {
    return undefined;
  }

  return {
    runId,
    questionIndex: Math.max(1, Math.floor(questionIndex)),
    targetCount: Math.max(1, Math.floor(targetCount)),
  };
};

export const normalizeEnvelope = (
  envelope: unknown,
  options: {
    fallbackText: string;
    mode: ChatMode;
    latencyMs: number;
    allowQuizArtifact: boolean;
    contextMeta?: ContextMeta;
    sources?: ChatSource[];
    toolRuns?: ToolRun[];
    canvasSessionMeta?: CanvasSessionMeta;
    renderState?: ChatRenderState;
    quizRun?: QuizRunMeta;
  },
): ChatEnvelope => {
  const raw = envelope && typeof envelope === 'object' ? (envelope as Partial<ChatEnvelope>) : null;

  const rawContent =
    sanitizeText(raw?.content) ||
    sanitizeFallbackText(options.fallbackText) ||
    'I generated a malformed response. Please retry.';
  const artifacts = normalizeArtifacts(raw?.artifacts);
  const safeArtifacts = options.allowQuizArtifact ? artifacts : artifacts.filter((artifact) => artifact.type !== 'quiz');
  const sanitizeQuizLeakingContent = (value: string): string => {
    if (!safeArtifacts.some((artifact) => artifact.type === 'quiz')) {
      return value;
    }

    return value
      .replace(/(?:^|\n)\s*(?:answer|correct answer|正确答案|答案)\s*[:：].*(?:\n|$)/gi, '\n')
      .replace(/(?:^|\n)\s*(?:解析|analysis)\s*[:：][\s\S]*/i, '')
      .trim();
  };

  const content = sanitizeQuizLeakingContent(rawContent);
  const mergedSources = options.sources && options.sources.length > 0
    ? options.sources
    : normalizeSources(raw?.sources);
  const mergedToolRuns = options.toolRuns && options.toolRuns.length > 0
    ? options.toolRuns
    : normalizeToolRuns(raw?.toolRuns);

  return {
    content,
    artifacts: safeArtifacts.length > 0 ? safeArtifacts : undefined,
    agentMeta: {
      triggerReason:
        sanitizeText(raw?.agentMeta?.triggerReason) ||
        (options.mode === 'quiz' ? 'quiz_mode' : mergedSources.length > 0 ? 'search_backed_answer' : 'direct_answer'),
      confidence: clampConfidence(raw?.agentMeta?.confidence, mergedSources.length > 0 ? 0.78 : 0.72),
      schemaVersion: sanitizeText(raw?.agentMeta?.schemaVersion) || 'chat_v2',
      latencyMs: Number.isFinite(raw?.agentMeta?.latencyMs) ? Number(raw?.agentMeta?.latencyMs) : options.latencyMs,
    },
    renderState: options.renderState || normalizeRenderState(raw?.renderState),
    quizRun: options.quizRun || normalizeQuizRunMeta(raw?.quizRun),
    sources: mergedSources.length > 0 ? mergedSources : undefined,
    toolRuns: mergedToolRuns.length > 0 ? mergedToolRuns : undefined,
    contextMeta: options.contextMeta || normalizeContextMeta(raw?.contextMeta),
    canvasSessionMeta: options.canvasSessionMeta || normalizeCanvasSessionMeta(raw?.canvasSessionMeta),
  };
};

export const buildContractPrompt = (
  mode: ChatMode,
  options: {
    forceQuiz?: boolean;
    allowAutoQuiz?: boolean;
    requireSources?: boolean;
  } = {},
): string => {
  const forceQuiz = Boolean(options.forceQuiz) || mode === 'quiz';
  const allowAutoQuiz = Boolean(options.allowAutoQuiz);
  const requireSources = Boolean(options.requireSources);

  const quizRule = forceQuiz
    ? 'You MUST include exactly one quiz artifact.'
    : allowAutoQuiz
      ? 'You MAY include one quiz artifact when it improves learning, otherwise include no quiz artifact.'
      : 'Do not include quiz artifact unless explicitly required.';

  const sourceRule = requireSources
    ? 'You MUST cite concrete evidence from provided tool observations. Keep source ids intact.'
    : 'Do not fabricate sources. If no source is provided, answer from internal knowledge and say uncertainty when needed.';

  return [
    'Return ONLY one valid JSON object. Do not use markdown fences.',
    'JSON schema:',
    '{',
    '  "content": "string",',
    '  "artifacts": [',
    '    { "type": "quiz|study_plan|canvas_hint|web_sources|canvas_summary", "payload": {} }',
    '  ],',
    '  "agentMeta": { "triggerReason": "string", "confidence": 0.0, "schemaVersion": "chat_v2" }',
    '}',
    'Quiz payload schema:',
    '{ quizId, title, questionType, stem, options[{id,text}], answerKey, explanation, difficulty, skills[], estimatedSeconds, targetWord?, tags? }',
    'When quiz artifact is present, never reveal answer key in content before user submission.',
    'For quiz questions, keep content to short setup only; put evaluative details in artifact explanation.',
    'Write concise educational response for Chinese-speaking English learners.',
    'Use format: direct answer -> examples -> Chinese key points -> next actions.',
    `Mode=${mode}. ${quizRule}`,
    sourceRule,
  ].join('\n');
};

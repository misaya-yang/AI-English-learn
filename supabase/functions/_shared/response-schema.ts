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
  status?: 'idle' | 'awaiting_answer' | 'grading' | 'requesting_next' | 'completed';
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

export interface ChatEnvelope {
  content: string;
  artifacts?: ChatArtifact[];
  agentMeta?: AgentMeta;
  renderState?: ChatRenderState;
  perfMeta?: {
    latencyMs: number;
  };
  quizRun?: QuizRunMeta;
  sources?: ChatSource[];
  toolRuns?: ToolRun[];
  contextMeta?: ContextMeta;
  canvasSessionMeta?: CanvasSessionMeta;
  memoryUsed?: MemoryUsedTrace[];
  memoryWrites?: MemoryWriteTrace[];
  memoryTraceId?: string;
}

const sanitizeText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const clampText = (value: unknown, limit: number): string => {
  const text = sanitizeText(value);
  if (!text) return '';
  return text.slice(0, Math.max(1, limit)).trim();
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
    .map((option) => ({ id: option.id.trim(), text: option.text.trim().slice(0, 140) }))
    .slice(0, 4);

  if (options.length < 2 || !options.some((option) => option.id === raw.answerKey)) {
    return null;
  }

  return {
    quizId: normalizeQuizId(raw.quizId, sanitizeText(raw.stem)),
    title: clampText(raw.title, 80) || 'Quick quiz',
    questionType:
      raw.questionType === 'true_false' || raw.questionType === 'fill_blank' || raw.questionType === 'multiple_choice'
        ? raw.questionType
        : 'multiple_choice',
    stem: clampText(raw.stem, 420),
    options,
    answerKey: String(raw.answerKey),
    explanation: clampText(raw.explanation, 220) || 'Please review the correct option and retry once.',
    difficulty: raw.difficulty === 'easy' || raw.difficulty === 'hard' ? raw.difficulty : 'medium',
    skills: Array.isArray(raw.skills)
      ? raw.skills
          .filter((skill): skill is string => typeof skill === 'string')
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)
          .slice(0, 6)
      : [],
    estimatedSeconds: Number.isFinite(raw.estimatedSeconds) ? Math.max(10, Math.min(180, Number(raw.estimatedSeconds))) : 45,
    targetWord: typeof raw.targetWord === 'string' ? raw.targetWord.trim().slice(0, 48) : undefined,
    tags: Array.isArray(raw.tags)
      ? raw.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .slice(0, 8)
      : undefined,
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
    status:
      raw.status === 'idle' ||
      raw.status === 'awaiting_answer' ||
      raw.status === 'grading' ||
      raw.status === 'requesting_next' ||
      raw.status === 'completed'
        ? raw.status
        : undefined,
  };
};

const normalizeMemoryUsed = (value: unknown): MemoryUsedTrace[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry): MemoryUsedTrace | null => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry as Partial<MemoryUsedTrace>;
      const id = sanitizeText(raw.id);
      const kind = sanitizeText(raw.kind);
      const contentPreview = sanitizeText(raw.contentPreview);
      if (!id || !kind || !contentPreview) return null;

      return {
        id,
        kind,
        contentPreview,
        confidence: clampConfidence(raw.confidence, 0.72),
        score: Number.isFinite(raw.score) ? Number(raw.score) : 0,
        isPinned: Boolean(raw.isPinned),
      };
    })
    .filter((entry): entry is MemoryUsedTrace => Boolean(entry));
};

const normalizeMemoryWrites = (value: unknown): MemoryWriteTrace[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry): MemoryWriteTrace | null => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry as Partial<MemoryWriteTrace>;
      const kind = sanitizeText(raw.kind);
      const contentPreview = sanitizeText(raw.contentPreview);
      const dedupeKey = sanitizeText(raw.dedupeKey);
      const reason =
        raw.reason === 'stable' ||
        raw.reason === 'tool_fact' ||
        raw.reason === 'error_trace' ||
        raw.reason === 'explicit'
          ? raw.reason
          : null;

      if (!kind || !contentPreview || !dedupeKey || !reason) return null;

      return {
        id: sanitizeText(raw.id) || undefined,
        kind,
        contentPreview,
        confidence: clampConfidence(raw.confidence, 0.7),
        dedupeKey,
        reason,
      };
    })
    .filter((entry): entry is MemoryWriteTrace => Boolean(entry));
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
    memoryUsed?: MemoryUsedTrace[];
    memoryWrites?: MemoryWriteTrace[];
    memoryTraceId?: string;
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
      .replace(/(?:^|\n)\s*(?:正确选项|答案选项)\s*[:：]\s*[A-D]\b.*(?:\n|$)/gi, '\n')
      .replace(/(?:^|\n)\s*(?:the answer is|the correct option is)\s*[A-D]\b.*(?:\n|$)/gi, '\n')
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
    perfMeta: { latencyMs: Math.max(0, options.latencyMs) },
    quizRun: options.quizRun || normalizeQuizRunMeta(raw?.quizRun),
    sources: mergedSources.length > 0 ? mergedSources : undefined,
    toolRuns: mergedToolRuns.length > 0 ? mergedToolRuns : undefined,
    contextMeta: options.contextMeta || normalizeContextMeta(raw?.contextMeta),
    canvasSessionMeta: options.canvasSessionMeta || normalizeCanvasSessionMeta(raw?.canvasSessionMeta),
    memoryUsed: options.memoryUsed || normalizeMemoryUsed(raw?.memoryUsed),
    memoryWrites: options.memoryWrites || normalizeMemoryWrites(raw?.memoryWrites),
    memoryTraceId: sanitizeText(options.memoryTraceId) || sanitizeText(raw?.memoryTraceId) || undefined,
  };
};

export const buildContractPrompt = (
  mode: ChatMode,
  options: {
    forceQuiz?: boolean;
    allowAutoQuiz?: boolean;
    requireSources?: boolean;
    conciseGreeting?: boolean;
    revealAnswerAfterSubmit?: boolean;
  } = {},
): string => {
  const forceQuiz = Boolean(options.forceQuiz) || mode === 'quiz';
  const allowAutoQuiz = Boolean(options.allowAutoQuiz);
  const requireSources = Boolean(options.requireSources);
  const conciseGreeting = Boolean(options.conciseGreeting);
  const revealAnswerAfterSubmit = Boolean(options.revealAnswerAfterSubmit);

  const quizRule = forceQuiz
    ? 'You MUST include quiz artifact(s). If the user asks for multiple questions, return one artifact per question in the same response.'
    : allowAutoQuiz
      ? 'You MAY include one quiz artifact when it improves learning, otherwise include no quiz artifact.'
      : 'Do not include quiz artifact unless explicitly required.';

  const sourceRule = requireSources
    ? 'You MUST cite concrete evidence from provided tool observations. Keep source ids intact.'
    : 'Do not fabricate sources. If no source is provided, answer from internal knowledge and say uncertainty when needed.';

  if (conciseGreeting) {
    return [
      'Return ONLY one valid JSON object. Do not use markdown fences.',
      'JSON schema: { "content": "string", "artifacts": [], "agentMeta": { "triggerReason": "string", "confidence": 0.0, "schemaVersion": "chat_v2" } }',
      'Greeting mode constraints:',
      '- Keep content within 1-2 short sentences.',
      '- No bullet lists, no sections, no study plan, no quiz artifact.',
      '- Ask at most one short follow-up question.',
      'If user writes in Chinese, reply in Chinese; otherwise reply in English.',
      `Mode=${mode}.`,
    ].join('\n');
  }

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
    revealAnswerAfterSubmit
      ? 'Never reveal answer details in content. Put answerKey and explanation only inside quiz artifact fields.'
      : '',
    'For quiz questions, keep content to short setup only; put evaluative details in artifact explanation.',
    'Write concise educational response for Chinese-speaking English learners.',
    'Use format: direct answer -> examples -> Chinese key points -> next actions.',
    `Mode=${mode}. ${quizRule}`,
    sourceRule,
  ].join('\n');
};

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, extractFirstJsonObject, type DeepSeekMessage } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';

const DEFAULT_SYSTEM_PROMPT = `You are an expert English tutor for Chinese-speaking learners.
Return practical, concise guidance with bilingual clarity when helpful.
Focus on vocabulary usage, grammar correction, collocations, and example-driven coaching.`;

type ChatMode = 'chat' | 'study' | 'quiz' | 'canvas';

interface AiChatContext {
  learningContext?: Record<string, unknown>;
  dialogueContext?: Array<{ role?: string; content?: string }>;
  toolContext?: Record<string, unknown>;
}

interface QuizArtifactPayload {
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

interface ChatArtifact {
  type: 'quiz' | 'study_plan' | 'canvas_hint';
  payload: Record<string, unknown>;
}

interface AgentMeta {
  triggerReason?: string;
  confidence?: number;
  schemaVersion?: string;
  latencyMs?: number;
}

interface ChatEnvelope {
  content: string;
  artifacts?: ChatArtifact[];
  agentMeta?: AgentMeta;
}

const normalizeMode = (mode: unknown): ChatMode => {
  if (mode === 'chat' || mode === 'study' || mode === 'quiz' || mode === 'canvas') {
    return mode;
  }
  return 'study';
};

const buildContextPrompt = (context: AiChatContext): string => {
  const sections: string[] = [];

  if (context.learningContext && Object.keys(context.learningContext).length > 0) {
    sections.push(`learning_context: ${JSON.stringify(context.learningContext)}`);
  }

  if (Array.isArray(context.dialogueContext) && context.dialogueContext.length > 0) {
    const compactTurns = context.dialogueContext
      .filter((turn) => (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')
      .slice(-8)
      .map((turn) => ({ role: turn.role, content: turn.content }));
    if (compactTurns.length > 0) {
      sections.push(`dialogue_context: ${JSON.stringify(compactTurns)}`);
    }
  }

  if (context.toolContext && Object.keys(context.toolContext).length > 0) {
    sections.push(`tool_context: ${JSON.stringify(context.toolContext)}`);
  }

  if (sections.length === 0) {
    return '';
  }

  return `Additional structured context (JSON, trusted):\n${sections.join('\n')}`;
};

const buildContractPrompt = (mode: ChatMode, featureFlags: Record<string, unknown>) => {
  const forceQuiz = Boolean(featureFlags.forceQuiz);
  const allowAutoQuiz = Boolean(featureFlags.allowAutoQuiz);
  const wantQuiz = mode === 'quiz' || forceQuiz;

  const quizRule = wantQuiz
    ? 'You MUST include exactly one quiz artifact.'
    : allowAutoQuiz
      ? 'You MAY include one quiz artifact when it improves learning, otherwise no artifact.'
      : 'Do not include quiz artifact unless explicitly required.';

  return [
    'Return ONLY a valid JSON object. No markdown wrappers.',
    'Schema:',
    '{',
    '  "content": "string",',
    '  "artifacts": [',
    '    {',
    '      "type": "quiz|study_plan|canvas_hint",',
    '      "payload": {}',
    '    }',
    '  ],',
    '  "agentMeta": {',
    '    "triggerReason": "string",',
    '    "confidence": 0.0,',
    '    "schemaVersion": "chat_v1"',
    '  }',
    '}',
    'If using a quiz artifact, payload must include:',
    '{ quizId, title, questionType, stem, options[{id,text}], answerKey, explanation, difficulty, skills[], estimatedSeconds, targetWord?, tags? }',
    'Use short, clear bilingual teaching style in content.',
    `Mode=${mode}. ${quizRule}`,
  ].join('\n');
};

const clampConfidence = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, value));
};

const isValidQuizPayload = (payload: unknown): payload is QuizArtifactPayload => {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as QuizArtifactPayload;

  if (!candidate.quizId || !candidate.stem || !candidate.answerKey) return false;
  if (!Array.isArray(candidate.options) || candidate.options.length < 2) return false;

  const validOptions = candidate.options.every((option) =>
    option && typeof option.id === 'string' && option.id.length > 0 && typeof option.text === 'string' && option.text.length > 0
  );

  if (!validOptions) return false;

  return candidate.options.some((option) => option.id === candidate.answerKey);
};

const normalizeArtifacts = (artifacts: unknown): ChatArtifact[] => {
  if (!Array.isArray(artifacts)) return [];

  const normalized: ChatArtifact[] = [];

  artifacts.forEach((artifact) => {
    if (!artifact || typeof artifact !== 'object') return;
    const raw = artifact as ChatArtifact;

    if (raw.type === 'quiz' && isValidQuizPayload(raw.payload)) {
      const quizPayload = raw.payload as QuizArtifactPayload;
      normalized.push({
        type: 'quiz',
        payload: {
          ...quizPayload,
          title: quizPayload.title || 'Quick quiz',
          questionType: quizPayload.questionType || 'multiple_choice',
          difficulty: quizPayload.difficulty || 'medium',
          skills: Array.isArray(quizPayload.skills)
            ? quizPayload.skills.filter((skill): skill is string => typeof skill === 'string')
            : [],
          estimatedSeconds: Number.isFinite(quizPayload.estimatedSeconds) ? quizPayload.estimatedSeconds : 45,
          tags: Array.isArray(quizPayload.tags)
            ? quizPayload.tags.filter((tag): tag is string => typeof tag === 'string')
            : undefined,
        },
      });
      return;
    }

    if (
      (raw.type === 'study_plan' || raw.type === 'canvas_hint') &&
      raw.payload &&
      typeof raw.payload === 'object'
    ) {
      normalized.push(raw);
    }
  });

  return normalized;
};

const normalizeEnvelope = (
  envelope: Partial<ChatEnvelope> | null,
  rawFallback: string,
  latencyMs: number,
  mode: ChatMode,
  allowQuizArtifact: boolean,
): ChatEnvelope => {
  const content = typeof envelope?.content === 'string' && envelope.content.trim().length > 0
    ? envelope.content.trim()
    : rawFallback.trim();

  const artifacts = normalizeArtifacts(envelope?.artifacts).filter((artifact) =>
    allowQuizArtifact ? true : artifact.type !== 'quiz'
  );

  const triggerReason =
    typeof envelope?.agentMeta?.triggerReason === 'string' && envelope.agentMeta.triggerReason.trim().length > 0
      ? envelope.agentMeta.triggerReason
      : mode === 'quiz'
        ? 'quiz_mode'
        : artifacts.some((artifact) => artifact.type === 'quiz')
          ? 'auto_quiz'
          : 'direct_answer';

  return {
    content,
    artifacts: artifacts.length > 0 ? artifacts : undefined,
    agentMeta: {
      triggerReason,
      confidence: clampConfidence(envelope?.agentMeta?.confidence) ?? 0.72,
      schemaVersion: 'chat_v1',
      latencyMs,
    },
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await requireAuthenticatedUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const systemPrompt = typeof body.systemPrompt === 'string' && body.systemPrompt.trim().length > 0
      ? body.systemPrompt
      : DEFAULT_SYSTEM_PROMPT;
    const contextPrompt = buildContextPrompt({
      learningContext: body.learningContext,
      dialogueContext: body.dialogueContext,
      toolContext: body.toolContext,
    });

    const mode = normalizeMode(body.mode);
    const featureFlags = body.featureFlags && typeof body.featureFlags === 'object'
      ? body.featureFlags as Record<string, unknown>
      : {};

    const safeMessages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: buildContractPrompt(mode, featureFlags) },
      ...(contextPrompt ? [{ role: 'system', content: contextPrompt } as DeepSeekMessage] : []),
      ...incoming.filter((message: unknown) => {
        if (!message || typeof message !== 'object') return false;
        const role = (message as { role?: string }).role;
        const content = (message as { content?: string }).content;
        return (
          (role === 'user' || role === 'assistant' || role === 'system') &&
          typeof content === 'string' &&
          content.trim().length > 0
        );
      }) as DeepSeekMessage[],
    ];

    const start = Date.now();
    const completion = await callDeepSeek({
      messages: safeMessages,
      temperature: Number(body.temperature) || 0.6,
      maxTokens: Number(body.maxTokens) || 2000,
    });
    const latencyMs = Date.now() - start;

    const parsed = extractFirstJsonObject<ChatEnvelope>(completion);
    const allowQuizArtifact = mode === 'quiz' || Boolean(featureFlags.forceQuiz) || Boolean(featureFlags.allowAutoQuiz);
    const payload = normalizeEnvelope(parsed, completion, latencyMs, mode, allowQuizArtifact);

    return jsonResponse({
      ...payload,
      provider: 'edge',
    });
  } catch (error) {
    console.error('[ai-chat] error', error);
    return jsonResponse({
      error: 'ai_chat_failed',
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

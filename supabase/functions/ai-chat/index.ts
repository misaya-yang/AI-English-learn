import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, extractFirstJsonObject, type DeepSeekMessage } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { adminInsert } from '../_shared/supabase-admin.ts';
import { buildContextPackage } from '../_shared/context-engine.ts';
import { persistContextSnapshot, persistTurnMemory, retrieveMemory } from '../_shared/memory-engine.ts';
import { routeTools } from '../_shared/tool-router.ts';
import {
  buildContractPrompt,
  normalizeEnvelope,
  normalizeMode,
  type CanvasSessionMeta,
  type ChatArtifact,
  type ChatEnvelope,
  type ChatMode,
} from '../_shared/response-schema.ts';

const DEFAULT_SYSTEM_PROMPT = `You are an expert English tutor for Chinese-speaking learners.
Return practical, concise guidance with bilingual clarity when helpful.
Focus on vocabulary usage, grammar correction, collocations, and example-driven coaching.`;

const MAX_INCOMING_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 960;

const clipText = (value: string, limit: number): string => {
  if (value.length <= limit) return value;
  const head = Math.max(220, Math.floor(limit * 0.75));
  const tail = Math.max(90, limit - head - 6);
  return `${value.slice(0, head)}\n...\n${value.slice(-tail)}`;
};

const toSafeMessages = (incoming: unknown): DeepSeekMessage[] => {
  if (!Array.isArray(incoming)) return [];

  return incoming
    .filter((message: unknown) => {
      if (!message || typeof message !== 'object') return false;
      const role = (message as { role?: string }).role;
      const content = (message as { content?: string }).content;
      return (
        (role === 'user' || role === 'assistant' || role === 'system') &&
        typeof content === 'string' &&
        content.trim().length > 0
      );
    })
    .slice(-MAX_INCOMING_MESSAGES)
    .map((message) => ({
      role: (message as { role: 'user' | 'assistant' | 'system' }).role,
      content: clipText((message as { content: string }).content.trim(), MAX_MESSAGE_CHARS),
    })) as DeepSeekMessage[];
};

const extractLatestUserMessage = (messages: DeepSeekMessage[]): string => {
  const latest = [...messages].reverse().find((message) => message.role === 'user');
  return latest?.content?.trim() || '';
};

const ensureWebSourcesArtifact = (artifacts: ChatArtifact[], sources: ChatEnvelope['sources']): ChatArtifact[] => {
  if (!sources || sources.length === 0) return artifacts;

  const hasSourceArtifact = artifacts.some((artifact) => artifact.type === 'web_sources');
  if (hasSourceArtifact) return artifacts;

  return [
    ...artifacts,
    {
      type: 'web_sources',
      payload: {
        title: 'Web sources',
        sources,
      },
    },
  ];
};

const ensureCanvasSummaryArtifact = (
  mode: ChatMode,
  artifacts: ChatArtifact[],
  content: string,
  canvasSessionMeta?: CanvasSessionMeta,
): ChatArtifact[] => {
  if (mode !== 'canvas') return artifacts;

  const hasCanvasSummary = artifacts.some((artifact) => artifact.type === 'canvas_summary');
  if (hasCanvasSummary) return artifacts;

  const compactSummary = content
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 260);

  if (!compactSummary) return artifacts;

  return [
    ...artifacts,
    {
      type: 'canvas_summary',
      payload: {
        title: 'Canvas Summary',
        summary: compactSummary,
        childSessionId: canvasSessionMeta?.childSessionId,
      },
    },
  ];
};

const persistToolAudit = async (args: {
  userId: string;
  sessionId?: string;
  toolRuns?: ChatEnvelope['toolRuns'];
  sources?: ChatEnvelope['sources'];
}): Promise<void> => {
  if (!Array.isArray(args.toolRuns) || args.toolRuns.length === 0) return;

  for (const run of args.toolRuns) {
    let insertedRunId: string | null = null;

    try {
      const inserted = await adminInsert<{ id: string }>('agent_tool_runs', {
        user_id: args.userId,
        session_id: args.sessionId || null,
        tool: run.tool,
        run_name: run.name,
        status: run.status,
        latency_ms: run.latencyMs,
        error_code: run.errorCode || null,
        request_payload: {},
        response_payload: {},
        created_at: new Date().toISOString(),
      });

      insertedRunId = inserted[0]?.id || null;
    } catch {
      insertedRunId = null;
    }

    if (!args.sources || args.sources.length === 0) {
      continue;
    }

    for (const source of args.sources) {
      try {
        await adminInsert('agent_web_sources', {
          id: source.id,
          user_id: args.userId,
          session_id: args.sessionId || null,
          tool_run_id: insertedRunId,
          url: source.url,
          domain: source.domain,
          title: source.title,
          snippet: source.snippet,
          published_at: source.publishedAt || null,
          retrieved_at: new Date().toISOString(),
          confidence: source.confidence,
          raw: source,
        });
      } catch {
        // Ignore duplicate source insert and other non-critical issues.
      }
    }
  }
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
    const mode = normalizeMode(body.mode);
    const systemPrompt = typeof body.systemPrompt === 'string' && body.systemPrompt.trim().length > 0
      ? body.systemPrompt
      : DEFAULT_SYSTEM_PROMPT;

    const featureFlags = body.featureFlags && typeof body.featureFlags === 'object'
      ? (body.featureFlags as Record<string, unknown>)
      : {};

    const safeMessages = toSafeMessages(body.messages);
    const latestUserMessage = extractLatestUserMessage(safeMessages);

    const sessionId =
      (typeof body.sessionId === 'string' && body.sessionId.trim().length > 0
        ? body.sessionId.trim()
        : undefined) ||
      (body.canvasContext && typeof body.canvasContext === 'object' && typeof body.canvasContext.parentSessionId === 'string'
        ? body.canvasContext.parentSessionId
        : undefined);

    const canvasSessionMeta: CanvasSessionMeta | undefined = mode === 'canvas'
      ? {
          parentSessionId:
            body.canvasContext && typeof body.canvasContext === 'object' && typeof body.canvasContext.parentSessionId === 'string'
              ? body.canvasContext.parentSessionId
              : sessionId,
          childSessionId:
            body.canvasContext && typeof body.canvasContext === 'object' && typeof body.canvasContext.childSessionId === 'string'
              ? body.canvasContext.childSessionId
              : undefined,
          syncState:
            body.canvasContext && typeof body.canvasContext === 'object' && body.canvasContext.syncToParent === true
              ? 'synced'
              : 'isolated',
        }
      : {
          syncState: 'not_applicable',
        };

    const memoryTopK =
      body.memoryPolicy && typeof body.memoryPolicy === 'object' && Number.isFinite(body.memoryPolicy.topK)
        ? Math.max(1, Math.min(10, Number(body.memoryPolicy.topK)))
        : 6;

    const memories = await retrieveMemory({
      userId: auth.userId,
      sessionId,
      query: latestUserMessage,
      topK: memoryTopK,
    });

    const toolRouting = await routeTools({
      userId: auth.userId,
      sessionId,
      mode,
      userInput: latestUserMessage,
      searchPolicy: body.searchPolicy,
      featureFlags,
    });

    const contextBuild = buildContextPackage({
      mode,
      incomingMessages: safeMessages,
      dialogueContext: Array.isArray(body.dialogueContext) ? body.dialogueContext : [],
      learningContext: body.learningContext && typeof body.learningContext === 'object' ? body.learningContext : undefined,
      toolContext: body.toolContext && typeof body.toolContext === 'object' ? body.toolContext : undefined,
      memories: memories.map((item) => ({
        id: item.id,
        kind: item.kind,
        content: item.content,
        confidence: item.confidence,
        updatedAt: item.updatedAt,
        sourceRef: item.sourceRef,
      })),
      toolObservations: toolRouting.observations,
      sourcePointers: toolRouting.sourcePointers,
      config: body.agentConfig && typeof body.agentConfig === 'object'
        ? {
            totalTokens: Number(body.agentConfig.totalTokens) || undefined,
            compactThreshold: Number(body.agentConfig.compactThreshold) || undefined,
          }
        : undefined,
    });

    const contractPrompt = buildContractPrompt(mode, {
      forceQuiz: Boolean(featureFlags.forceQuiz),
      allowAutoQuiz: Boolean(featureFlags.allowAutoQuiz),
      requireSources: toolRouting.sources.length > 0 || Boolean(body.searchPolicy?.alwaysShowSources),
    });

    const modelMessages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: contractPrompt },
      ...(contextBuild.contextPrompt ? [{ role: 'system', content: contextBuild.contextPrompt } as DeepSeekMessage] : []),
      ...contextBuild.modelMessages,
    ];

    const start = Date.now();
    const completion = await callDeepSeek({
      messages: modelMessages,
      temperature: Number(body.temperature) || 0.6,
      maxTokens: Number(body.maxTokens) || 2000,
    });
    const latencyMs = Date.now() - start;

    const parsed = extractFirstJsonObject<unknown>(completion);

    const allowQuizArtifact = mode === 'quiz' || Boolean(featureFlags.forceQuiz) || Boolean(featureFlags.allowAutoQuiz);

    const payload = normalizeEnvelope(parsed, {
      fallbackText: completion,
      mode,
      latencyMs,
      allowQuizArtifact,
      sources: toolRouting.sources,
      toolRuns: toolRouting.toolRuns,
      canvasSessionMeta,
      contextMeta: {
        ...contextBuild.contextMeta,
        memoryHits: memories.length,
        searchTriggered: toolRouting.searchTriggered,
      },
    });

    const artifactsWithSources = ensureWebSourcesArtifact(payload.artifacts || [], payload.sources);
    const finalArtifacts = ensureCanvasSummaryArtifact(mode, artifactsWithSources, payload.content, payload.canvasSessionMeta);

    const finalPayload: ChatEnvelope = {
      ...payload,
      artifacts: finalArtifacts.length > 0 ? finalArtifacts : undefined,
      provider: 'edge',
    } as ChatEnvelope & { provider: 'edge' };

    if (contextBuild.compactedSummary && sessionId) {
      await persistContextSnapshot({
        userId: auth.userId,
        sessionId,
        summary: contextBuild.compactedSummary,
        compactedFromCount: contextBuild.modelMessages.length,
        sourcePointers: toolRouting.sourcePointers,
      });
    }

    await persistTurnMemory({
      userId: auth.userId,
      sessionId,
      learningContext: body.learningContext && typeof body.learningContext === 'object' ? body.learningContext : undefined,
      userMessage: latestUserMessage,
      assistantMessage: finalPayload.content,
      toolFacts: (finalPayload.sources || []).map((source) => `${source.title}: ${source.snippet}`),
      hadError: finalPayload.toolRuns?.some((run) => run.status === 'error') || false,
    });

    await persistToolAudit({
      userId: auth.userId,
      sessionId,
      toolRuns: finalPayload.toolRuns,
      sources: finalPayload.sources,
    });

    return jsonResponse({
      ...finalPayload,
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

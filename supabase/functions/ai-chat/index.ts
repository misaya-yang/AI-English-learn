import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callDeepSeek, callDeepSeekStream, extractFirstJsonObject, type DeepSeekMessage } from '../_shared/deepseek.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { adminInsert } from '../_shared/supabase-admin.ts';
import { buildContextPackage } from '../_shared/context-engine.ts';
import {
  forgetExplicitMemory,
  persistContextSnapshot,
  persistTurnMemory,
  rememberExplicitMemory,
  retrieveMemory,
  type MemoryKind,
} from '../_shared/memory-engine.ts';
import { routeTools } from '../_shared/tool-router.ts';
import {
  buildContractPrompt,
  normalizeEnvelope,
  normalizeMode,
  type ChatRenderState,
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
const SIMPLE_GREETING_PATTERN = /^(hi|hello|hey|yo|hello there|你好(?:呀|啊|喔)?|您好|嗨|哈喽|哈囉|早上好|下午好|晚上好|在吗|在嗎|在不在)[!,.?，。！？\s]*$/i;
const FACTUAL_SEARCH_HINT_PATTERN = /(latest|today|news|price|law|policy|research|statistics|官网|来源|出处|citation|web ?search|联网|最新|时效|新闻|数据|查一下|搜一下|检索)/i;

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

const isChineseText = (value: string): boolean => /[\u3400-\u9fff]/.test(value);

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

const normalizeQuizRun = (raw: unknown):
  | {
      runId: string;
      questionIndex: number;
      targetCount: number;
      status?: 'idle' | 'awaiting_answer' | 'grading' | 'requesting_next' | 'completed';
    }
  | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const quizRun = raw as Record<string, unknown>;
  return {
    runId: typeof quizRun.runId === 'string' ? quizRun.runId : '',
    questionIndex: Number(quizRun.questionIndex) || 1,
    targetCount: Number(quizRun.targetCount) || 1,
    status:
      quizRun.status === 'idle' ||
      quizRun.status === 'awaiting_answer' ||
      quizRun.status === 'grading' ||
      quizRun.status === 'requesting_next' ||
      quizRun.status === 'completed'
        ? quizRun.status
        : undefined,
  };
};

const toMemoryUsed = (memories: Array<{
  id: string;
  kind: string;
  content: string;
  confidence: number;
  retrievalScore?: number;
  isPinned?: boolean;
}>) =>
  memories.slice(0, 6).map((memory) => ({
    id: memory.id,
    kind: memory.kind,
    contentPreview: memory.content.slice(0, 140),
    confidence: memory.confidence,
    score: Number(memory.retrievalScore ?? 0),
    isPinned: Boolean(memory.isPinned),
  }));

type ToolRoutingResult = Awaited<ReturnType<typeof routeTools>>;

const EMPTY_TOOL_ROUTING: ToolRoutingResult = {
  observations: [],
  sources: [],
  sourcePointers: [],
  toolRuns: [],
  searchTriggered: false,
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
    const responseStyle = body.responseStyle === 'concise' ? 'concise' : 'coach';
    const systemPrompt = typeof body.systemPrompt === 'string' && body.systemPrompt.trim().length > 0
      ? body.systemPrompt
      : DEFAULT_SYSTEM_PROMPT;

    const featureFlags = body.featureFlags && typeof body.featureFlags === 'object'
      ? (body.featureFlags as Record<string, unknown>)
      : {};

    const safeMessages = toSafeMessages(body.messages);
    const latestUserMessage = extractLatestUserMessage(safeMessages);
    const wantsStream = body.stream !== false;
    const normalizedQuizRun = normalizeQuizRun(body.quizRun);
    const conciseGreetingTurn =
      SIMPLE_GREETING_PATTERN.test(latestUserMessage.toLowerCase()) &&
      !normalizedQuizRun?.runId &&
      mode !== 'quiz' &&
      mode !== 'canvas';
    const shouldBypassHeavyLookup =
      !conciseGreetingTurn &&
      !normalizedQuizRun?.runId &&
      mode !== 'quiz' &&
      mode !== 'canvas' &&
      latestUserMessage.length > 0 &&
      latestUserMessage.length <= 80 &&
      !FACTUAL_SEARCH_HINT_PATTERN.test(latestUserMessage.toLowerCase());

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

    if (conciseGreetingTurn) {
      const content = isChineseText(latestUserMessage)
        ? '你好！我在这儿。你今天想先练口语、词汇还是语法？'
        : "Hi! I'm here. What would you like to practice first: speaking, vocabulary, or grammar?";

      return jsonResponse({
        content,
        provider: 'edge',
        artifacts: [],
        agentMeta: {
          triggerReason: 'concise_greeting',
          confidence: 0.96,
          schemaVersion: 'chat_v2',
          latencyMs: 0,
        },
        renderState: {
          stage: 'streaming',
          progress: 1,
        },
        perfMeta: {
          latencyMs: 0,
        },
        quizRun: normalizedQuizRun,
        contextMeta: {
          inputTokensEst: Math.max(12, Math.min(160, Math.floor(latestUserMessage.length * 1.3))),
          budgetUsed: {
            system: 0,
            recentTurns: 0,
            memory: 0,
            toolObservations: 0,
            reserve: 0,
          },
          compacted: false,
          memoryHits: 0,
          searchTriggered: false,
        },
        memoryUsed: [],
        memoryWrites: [],
      });
    }

    const memoryPolicy = body.memoryPolicy && typeof body.memoryPolicy === 'object'
      ? (body.memoryPolicy as Record<string, unknown>)
      : {};

    const memoryTopK =
      Number.isFinite(memoryPolicy.topK)
        ? Math.max(1, Math.min(10, Number(memoryPolicy.topK)))
        : 6;

    const memoryMinSimilarity =
      Number.isFinite(memoryPolicy.minSimilarity)
        ? Math.max(0, Math.min(1, Number(memoryPolicy.minSimilarity)))
        : 0.24;

    const memoryWriteMode =
      memoryPolicy.writeMode === 'balanced'
        ? 'balanced'
        : 'stable_only';

    const memoryAllowSensitiveStore = memoryPolicy.allowSensitiveStore === true;

    const memoryKindFilter =
      Array.isArray(memoryPolicy.kindFilter)
        ? memoryPolicy.kindFilter
            .filter((item): item is MemoryKind =>
              item === 'profile' ||
              item === 'preference' ||
              item === 'weakness_tag' ||
              item === 'goal' ||
              item === 'error_trace' ||
              item === 'tool_fact')
        : undefined;

    const memoryControl = body.memoryControl && typeof body.memoryControl === 'object'
      ? (body.memoryControl as Record<string, unknown>)
      : {};

    const explicitRemember =
      Array.isArray(memoryControl.explicitRemember)
        ? memoryControl.explicitRemember
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, 6)
        : [];

    const explicitRememberKind =
      memoryControl.explicitRememberKind === 'profile' ||
      memoryControl.explicitRememberKind === 'preference' ||
      memoryControl.explicitRememberKind === 'weakness_tag' ||
      memoryControl.explicitRememberKind === 'goal' ||
      memoryControl.explicitRememberKind === 'error_trace' ||
      memoryControl.explicitRememberKind === 'tool_fact'
        ? memoryControl.explicitRememberKind
        : 'preference';

    const explicitForget = memoryControl.explicitForget && typeof memoryControl.explicitForget === 'object'
      ? (memoryControl.explicitForget as Record<string, unknown>)
      : {};

    if (
      Array.isArray(explicitForget.ids) ||
      Array.isArray(explicitForget.dedupeKeys) ||
      typeof explicitForget.query === 'string'
    ) {
      await forgetExplicitMemory({
        userId: auth.userId,
        sessionId,
        ids: Array.isArray(explicitForget.ids)
          ? explicitForget.ids.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          : undefined,
        dedupeKeys: Array.isArray(explicitForget.dedupeKeys)
          ? explicitForget.dedupeKeys.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          : undefined,
        query: typeof explicitForget.query === 'string' ? explicitForget.query : undefined,
      });
    }

    const memoryTraceId = crypto.randomUUID();

    const memories = shouldBypassHeavyLookup
      ? []
      : await retrieveMemory({
          userId: auth.userId,
          sessionId,
          query: latestUserMessage,
          topK: memoryTopK,
          minSimilarity: memoryMinSimilarity,
          kindFilter: memoryKindFilter,
        });

    const toolRouting = shouldBypassHeavyLookup
      ? EMPTY_TOOL_ROUTING
      : await routeTools({
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

    const allowQuizArtifact = mode === 'quiz' || Boolean(featureFlags.forceQuiz) || Boolean(featureFlags.allowAutoQuiz);
    const requiresStructuredReply =
      mode === 'quiz' ||
      mode === 'canvas' ||
      Boolean(normalizedQuizRun?.runId) ||
      Boolean(featureFlags.forceQuiz) ||
      Boolean(featureFlags.allowAutoQuiz);

    if (wantsStream && !requiresStructuredReply) {
      const streamStylePrompt =
        responseStyle === 'concise'
          ? 'Output style: concise markdown. Use <= 3 short paragraphs unless user asks for more. Keep natural spacing between English words.'
          : 'Output style: coach. Keep concise, practical teaching guidance in readable markdown. Keep natural spacing between English words.';

      const streamModelMessages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: streamStylePrompt },
        ...(contextBuild.contextPrompt ? [{ role: 'system', content: contextBuild.contextPrompt } as DeepSeekMessage] : []),
        ...contextBuild.modelMessages,
      ];

      const encoder = new TextEncoder();
      const responseStream = new ReadableStream<Uint8Array>({
        start(controller) {
          const writeEvent = (event: Record<string, unknown>) => {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          };

          void (async () => {
            try {
              writeEvent({
                type: 'meta',
                data: {
                  renderState: {
                    stage: toolRouting.searchTriggered ? 'searching' : 'planning',
                    progress: 0.12,
                  },
                  contextMeta: {
                    ...contextBuild.contextMeta,
                    memoryHits: memories.length,
                    searchTriggered: toolRouting.searchTriggered,
                  },
                },
              });

              const start = Date.now();
              let emittedStreamingStage = false;
              let completion = '';

              for await (const delta of callDeepSeekStream({
                messages: streamModelMessages,
                temperature: Number(body.temperature) || 0.6,
                maxTokens: Number(body.maxTokens) || 2000,
              })) {
                if (!delta) continue;
                completion += delta;
                if (!emittedStreamingStage) {
                  emittedStreamingStage = true;
                  writeEvent({
                    type: 'meta',
                    data: {
                      renderState: {
                        stage: 'streaming',
                        progress: 0.2,
                      },
                    },
                  });
                }
                writeEvent({ type: 'delta', delta });
              }

              const latencyMs = Date.now() - start;
              const finalContent = completion.trim();
              if (!finalContent) {
                throw new Error('Streamed completion is empty');
              }

              const finalArtifacts = ensureWebSourcesArtifact([], toolRouting.sources);
              const memoryUsed = toMemoryUsed(memories);

              const finalPayload: ChatEnvelope & { provider: 'edge' } = {
                content: finalContent,
                provider: 'edge',
                artifacts: finalArtifacts.length > 0 ? finalArtifacts : undefined,
                agentMeta: {
                  triggerReason: 'stream_text',
                  confidence: 0.82,
                  schemaVersion: 'chat_v2_stream',
                  latencyMs,
                },
                renderState: {
                  stage: 'streaming',
                  progress: 1,
                },
                perfMeta: {
                  latencyMs,
                },
                quizRun: normalizedQuizRun && normalizedQuizRun.runId ? normalizedQuizRun : undefined,
                sources: toolRouting.sources.length > 0 ? toolRouting.sources : undefined,
                toolRuns: toolRouting.toolRuns.length > 0 ? toolRouting.toolRuns : undefined,
                contextMeta: {
                  ...contextBuild.contextMeta,
                  memoryHits: memories.length,
                  searchTriggered: toolRouting.searchTriggered,
                },
                canvasSessionMeta,
                memoryUsed,
                memoryWrites: [],
                memoryTraceId,
              };

              if (contextBuild.compactedSummary && sessionId) {
                await persistContextSnapshot({
                  userId: auth.userId,
                  sessionId,
                  summary: contextBuild.compactedSummary,
                  compactedFromCount: contextBuild.modelMessages.length,
                  sourcePointers: toolRouting.sourcePointers,
                });
              }

              const explicitWrites = explicitRemember.length > 0
                ? await rememberExplicitMemory({
                    userId: auth.userId,
                    sessionId,
                    items: explicitRemember,
                    kind: explicitRememberKind,
                    allowSensitiveStore: memoryAllowSensitiveStore,
                  })
                : [];

              const turnWrites = await persistTurnMemory({
                userId: auth.userId,
                sessionId,
                learningContext:
                  body.learningContext && typeof body.learningContext === 'object'
                    ? body.learningContext
                    : undefined,
                userMessage: latestUserMessage,
                assistantMessage: finalPayload.content,
                toolFacts: (finalPayload.sources || []).map((source) => `${source.title}: ${source.snippet}`),
                hadError: finalPayload.toolRuns?.some((run) => run.status === 'error') || false,
                memoryPolicy: {
                  writeMode: memoryWriteMode,
                  allowSensitiveStore: memoryAllowSensitiveStore,
                },
              });

              finalPayload.memoryWrites = [...explicitWrites, ...turnWrites];

              await persistToolAudit({
                userId: auth.userId,
                sessionId,
                toolRuns: finalPayload.toolRuns,
                sources: finalPayload.sources,
              });

              writeEvent({
                type: 'done',
                payload: finalPayload,
              });
            } catch (streamError) {
              writeEvent({
                type: 'error',
                error: {
                  code: 'stream_failed',
                  message: streamError instanceof Error ? streamError.message : String(streamError),
                },
              });
            } finally {
              controller.close();
            }
          })();
        },
      });

      return new Response(responseStream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    const contractPrompt = buildContractPrompt(mode, {
      forceQuiz: Boolean(featureFlags.forceQuiz),
      allowAutoQuiz: Boolean(featureFlags.allowAutoQuiz),
      requireSources: toolRouting.sources.length > 0 || Boolean(body.searchPolicy?.alwaysShowSources),
      conciseGreeting: conciseGreetingTurn,
      revealAnswerAfterSubmit:
        body.quizPolicy &&
        typeof body.quizPolicy === 'object' &&
        body.quizPolicy.revealAnswer === 'after_submit',
    });

    const stylePrompt =
      responseStyle === 'concise'
        ? 'Output style: concise. Keep the answer in <= 3 short paragraphs unless quiz artifact is required. Keep natural spacing between English words.'
        : 'Output style: coach. Keep a clear teaching flow with concise explanations. Keep natural spacing between English words.';

    const modelMessages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: contractPrompt },
      { role: 'system', content: stylePrompt },
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

    const renderState: ChatRenderState = {
      stage: toolRouting.searchTriggered ? 'searching' : 'composing',
      progress: 0.75,
    };

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
      renderState,
      quizRun: normalizedQuizRun && normalizedQuizRun.runId
        ? normalizedQuizRun
        : undefined,
      memoryUsed: toMemoryUsed(memories),
      memoryTraceId,
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

    const explicitWrites = explicitRemember.length > 0
      ? await rememberExplicitMemory({
          userId: auth.userId,
          sessionId,
          items: explicitRemember,
          kind: explicitRememberKind,
          allowSensitiveStore: memoryAllowSensitiveStore,
        })
      : [];

    const turnWrites = await persistTurnMemory({
      userId: auth.userId,
      sessionId,
      learningContext: body.learningContext && typeof body.learningContext === 'object' ? body.learningContext : undefined,
      userMessage: latestUserMessage,
      assistantMessage: finalPayload.content,
      toolFacts: (finalPayload.sources || []).map((source) => `${source.title}: ${source.snippet}`),
      hadError: finalPayload.toolRuns?.some((run) => run.status === 'error') || false,
      memoryPolicy: {
        writeMode: memoryWriteMode,
        allowSensitiveStore: memoryAllowSensitiveStore,
      },
    });

    finalPayload.memoryWrites = [...explicitWrites, ...turnWrites];

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

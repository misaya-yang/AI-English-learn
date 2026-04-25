import type { ChatEdgeResponse, ChatMode, SendMessageOptions } from '@/types/chatAgent';
import { invokeEdgeFunction, invokeEdgeFunctionStream } from '@/services/aiGateway';
import { shouldAllowAutoQuizForInput, shouldDisableAutoSearch, shouldSuppressQuizForInput, isSimpleGreetingInput } from '@/features/chat/runtime/fastPath';
import {
  COACHING_POLICY_VERSION,
  buildCoachSystemPrompt,
  normalizeLearningContext,
  type LearnerContext,
} from '@/features/coach/coachingPolicy';

// Legacy fallback kept for any caller still importing this symbol directly.
// Prefer buildCoachSystemPrompt() from @/features/coach/coachingPolicy.
export const SYSTEM_PROMPT = buildCoachSystemPrompt({}, { surface: 'chat', mode: 'chat' });

const MAX_TOKENS_BY_MODE: Record<ChatMode, number> = {
  chat: 800,
  study: 980,
  quiz: 620,
  canvas: 1200,
};

const TEMPERATURE_BY_MODE: Record<ChatMode, number> = {
  chat: 0.55,
  study: 0.6,
  quiz: 0.5,
  canvas: 0.65,
};

const QUIZ_EXPLICIT_REQUEST_PATTERN = /(quiz|mcq|multiple choice|give me .*question|ask me .*question|给我.{0,10}(道|个)?题|出.{0,8}题|来.{0,8}题|下一题|第\s*\d+\s*题|选择题|测验题|再给我.{0,8}题|继续.{0,8}题)/i;

export interface ChatAssistantRequestContext {
  sessionId: string;
  apiMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  surface: NonNullable<SendMessageOptions['surface']>;
  goalContext?: string;
  weakTags?: string[];
  // Full learner-model snapshot. When provided, it feeds the shared
  // COACHING_POLICY so the system prompt cites the learner's level, target,
  // due backlog, burnout risk, etc.
  learnerProfile?: Partial<LearnerContext>;
  mode: ChatMode;
  responseStyle: NonNullable<SendMessageOptions['responseStyle']>;
  searchMode: NonNullable<SendMessageOptions['searchMode']>;
  canvasSyncToParent: boolean;
  featureFlags?: SendMessageOptions['featureFlags'];
  quizPolicy?: SendMessageOptions['quizPolicy'];
  memoryPolicy?: SendMessageOptions['memoryPolicy'];
  memoryControl?: SendMessageOptions['memoryControl'];
  quizRun?: SendMessageOptions['quizRun'];
  trigger: NonNullable<SendMessageOptions['trigger']>;
}

export interface BuiltChatRequest {
  payload: Record<string, unknown>;
  effectiveQuizRun?: SendMessageOptions['quizRun'];
  isQuizTurn: boolean;
  useLightweightGreetingPath: boolean;
}

export const buildChatRequestPayload = (args: {
  context: ChatAssistantRequestContext;
  latestUserInput: string;
  getCanvasChildSessionId: (sessionId: string) => string;
}): BuiltChatRequest => {
  const { context, latestUserInput, getCanvasChildSessionId } = args;
  const normalizedUserIntent = latestUserInput.toLowerCase().trim();
  const isSimpleGreetingTurn = isSimpleGreetingInput(normalizedUserIntent);
  const suppressQuizForThisTurn = shouldSuppressQuizForInput(latestUserInput);
  const explicitQuizRequest =
    !suppressQuizForThisTurn && QUIZ_EXPLICIT_REQUEST_PATTERN.test(normalizedUserIntent);
  const disableAutoSearchForThisTurn = shouldDisableAutoSearch(
    context.mode,
    latestUserInput,
    context.searchMode,
  );
  const effectiveSearchMode =
    disableAutoSearchForThisTurn || isSimpleGreetingTurn ? 'off' : context.searchMode;
  const effectiveQuizRun = suppressQuizForThisTurn ? undefined : context.quizRun;
  const requiresStructuredQuiz =
    context.mode === 'quiz' ||
    Boolean(effectiveQuizRun?.runId) ||
    Boolean(context.featureFlags?.forceQuiz) ||
    explicitQuizRequest;

  const mergedFeatureFlags = {
    ...(context.featureFlags || {}),
    enableQuizArtifacts: true,
    enableStudyArtifacts: true,
    forceQuiz: requiresStructuredQuiz || undefined,
    allowAutoQuiz: shouldAllowAutoQuizForInput(context.mode, latestUserInput, effectiveQuizRun),
    conciseGreeting: isSimpleGreetingTurn || context.responseStyle === 'concise' || undefined,
  };

  const isQuizTurn = requiresStructuredQuiz;
  const conciseResponseRequested = context.responseStyle === 'concise';
  const useLightweightGreetingPath = (isSimpleGreetingTurn || conciseResponseRequested) && !isQuizTurn;

  // Normalize learner-model fields up front. The returned `learnerContext`
  // is what the COACHING_POLICY uses to reference level, target, due
  // backlog, weakness tags, etc. The canonical field name is `weaknessTags`;
  // we still carry `weakTags` in the payload for back-compat with older
  // Edge Function revisions.
  const learnerContext = normalizeLearningContext({
    ...(context.learnerProfile || {}),
    weakTags: context.weakTags,
    weaknessTags: (context.learnerProfile as LearnerContext | undefined)?.weaknessTags,
  });

  const coachSystemPrompt = buildCoachSystemPrompt(learnerContext, {
    surface: context.surface,
    mode: context.mode,
    goalContext: context.goalContext,
  });

  return {
    effectiveQuizRun,
    isQuizTurn,
    useLightweightGreetingPath,
    payload: {
      sessionId: context.sessionId,
      messages: context.apiMessages,
      systemPrompt: coachSystemPrompt,
      coachingPolicyVersion: COACHING_POLICY_VERSION,
      surface: context.surface,
      goalContext: context.goalContext,
      weakTags: context.weakTags,
      learningContext: {
        locale: 'zh-CN',
        app: 'VocabDaily',
        mode: 'english-learning-coach',
        currentMode: context.mode,
        surface: context.surface,
        goalContext: context.goalContext,
        // Canonical field. Keep `weakTags` too so an older Edge Function
        // revision does not silently drop the data.
        weaknessTags: learnerContext.weaknessTags,
        weakTags: context.weakTags,
        level: learnerContext.level,
        target: learnerContext.target,
        examType: learnerContext.examType,
        dailyMinutes: learnerContext.dailyMinutes,
        dueCount: learnerContext.dueCount,
        learnerMode: learnerContext.learnerMode,
        burnoutRisk: learnerContext.burnoutRisk,
        stubbornTopics: learnerContext.stubbornTopics,
        recommendedDailyReview: learnerContext.recommendedDailyReview,
        predictedRetention30d: learnerContext.predictedRetention30d,
        recentErrors: learnerContext.recentErrors,
      },
      toolContext: isQuizTurn
        ? {
            availableTools: [],
            responseTemplate: ['direct_answer'],
          }
        : useLightweightGreetingPath
          ? {
              availableTools: [],
              responseTemplate: ['direct_answer'],
            }
          : {
              availableTools: ['lookup_collocations', 'explain_error', 'generate_practice'],
              responseTemplate: ['direct_answer', 'examples', 'zh_key_points', 'next_actions'],
            },
      agentConfig: {
        totalTokens: isQuizTurn ? 1200 : useLightweightGreetingPath ? 420 : 2200,
        compactThreshold: isQuizTurn ? 0.72 : useLightweightGreetingPath ? 0.7 : 0.8,
      },
      searchPolicy: {
        mode: context.mode === 'quiz' || useLightweightGreetingPath ? 'off' : effectiveSearchMode,
        alwaysShowSources: true,
        maxSearchCalls:
          context.mode === 'quiz' || effectiveSearchMode === 'off' || useLightweightGreetingPath ? 1 : 2,
        maxPerMinute: context.mode === 'quiz' || useLightweightGreetingPath ? 5 : 8,
      },
      memoryPolicy: {
        topK: context.memoryPolicy?.topK ?? (isQuizTurn ? 2 : useLightweightGreetingPath ? 2 : 6),
        minSimilarity: context.memoryPolicy?.minSimilarity ?? (isQuizTurn ? 0.3 : useLightweightGreetingPath ? 0.28 : 0.24),
        writeMode: context.memoryPolicy?.writeMode ?? 'stable_only',
        allowSensitiveStore: context.memoryPolicy?.allowSensitiveStore ?? false,
      },
      memoryControl: context.memoryControl,
      canvasContext:
        context.mode === 'canvas'
          ? {
              parentSessionId: context.sessionId,
              childSessionId: getCanvasChildSessionId(context.sessionId),
              syncToParent: context.canvasSyncToParent,
            }
          : undefined,
      mode: context.mode,
      responseStyle: context.responseStyle,
      quizPolicy: context.quizPolicy,
      quizRun: effectiveQuizRun,
      featureFlags: mergedFeatureFlags,
      temperature: useLightweightGreetingPath ? 0.45 : TEMPERATURE_BY_MODE[context.mode],
      maxTokens: useLightweightGreetingPath ? 180 : MAX_TOKENS_BY_MODE[context.mode],
    },
  };
};

export const invokeChatRequest = async (
  payload: Record<string, unknown>,
  options: {
    signal: AbortSignal;
    onMeta: (meta: unknown) => void;
    onDelta: (delta: string) => void;
    shouldUseEdgeStreaming: boolean;
  },
): Promise<ChatEdgeResponse> => {
  if (options.shouldUseEdgeStreaming) {
    return invokeEdgeFunctionStream<ChatEdgeResponse>(
      'ai-chat',
      {
        ...payload,
        stream: true,
      },
      {
        onMeta: options.onMeta,
        onDelta: options.onDelta,
      },
      { signal: options.signal },
    );
  }

  return invokeEdgeFunction<ChatEdgeResponse>(
    'ai-chat',
    {
      ...payload,
      stream: false,
    },
    { signal: options.signal },
  );
};

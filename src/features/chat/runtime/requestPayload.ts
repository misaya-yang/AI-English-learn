import type { ChatEdgeResponse, ChatMode, SendMessageOptions } from '@/types/chatAgent';
import { invokeEdgeFunction, invokeEdgeFunctionStream } from '@/services/aiGateway';
import { shouldAllowAutoQuizForInput, shouldDisableAutoSearch, shouldSuppressQuizForInput, isSimpleGreetingInput } from '@/features/chat/runtime/fastPath';

export const SYSTEM_PROMPT = `You are an expert English tutor specializing in helping Chinese-speaking learners. Your responses should be:

1. Clear and educational
2. Include both English and Chinese explanations when helpful
3. Provide examples and context
4. Be encouraging and supportive

When explaining vocabulary:
- Provide clear definitions
- Give example sentences
- Explain usage contexts
- Note common collocations
- Highlight differences between similar words

When correcting grammar:
- Explain the rule clearly
- Show the correct form
- Provide examples
- Explain why it's wrong

For simple greetings (for example: "hi", "hello", "你好"):
- Reply in 1-2 short sentences
- Do not use long sections, bullet lists, or study plans
- Ask at most one short follow-up question

Keep responses concise but comprehensive. Use markdown formatting for clarity.`;

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

  return {
    effectiveQuizRun,
    isQuizTurn,
    useLightweightGreetingPath,
    payload: {
      sessionId: context.sessionId,
      messages: context.apiMessages,
      systemPrompt: SYSTEM_PROMPT,
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
        weakTags: context.weakTags,
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

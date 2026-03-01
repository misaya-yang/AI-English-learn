import type { DeepSeekMessage } from './deepseek.ts';
import type { ContextMeta } from './response-schema.ts';

export interface MemoryCandidate {
  id: string;
  kind: string;
  content: string;
  confidence: number;
  updatedAt?: string;
  sourceRef?: Record<string, unknown>;
}

export interface ContextSliceConfig {
  totalTokens: number;
  systemRatio: number;
  recentTurnsRatio: number;
  memoryRatio: number;
  toolRatio: number;
  reserveRatio: number;
  compactThreshold: number;
}

export interface ContextBuildArgs {
  mode: 'chat' | 'study' | 'quiz' | 'canvas';
  incomingMessages: DeepSeekMessage[];
  dialogueContext?: Array<{ role?: string; content?: string }>;
  learningContext?: Record<string, unknown>;
  toolContext?: Record<string, unknown>;
  memories: MemoryCandidate[];
  toolObservations: string[];
  sourcePointers: Array<{ source_id: string; url: string; title: string; retrieved_at: string }>;
  config?: Partial<ContextSliceConfig>;
}

export interface ContextBuildResult {
  modelMessages: DeepSeekMessage[];
  contextPrompt: string;
  contextMeta: ContextMeta;
  compactedSummary?: string;
}

const DEFAULT_CONFIG: ContextSliceConfig = {
  totalTokens: 2200,
  systemRatio: 0.2,
  recentTurnsRatio: 0.35,
  memoryRatio: 0.15,
  toolRatio: 0.2,
  reserveRatio: 0.1,
  compactThreshold: 0.8,
};

const MAX_INCOMING_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 950;

const clipText = (value: string, limit: number): string => {
  if (value.length <= limit) return value;
  const head = Math.max(180, Math.floor(limit * 0.7));
  const tail = Math.max(80, limit - head - 6);
  return `${value.slice(0, head)}\n...\n${value.slice(-tail)}`;
};

const toTokenEstimate = (value: string): number => {
  const chars = value.length;
  return Math.max(1, Math.ceil(chars / 4));
};

const normalizeMessages = (
  incomingMessages: DeepSeekMessage[],
  dialogueContext: Array<{ role?: string; content?: string }> | undefined,
): DeepSeekMessage[] => {
  const fromIncoming = incomingMessages
    .filter((message) => (message.role === 'user' || message.role === 'assistant' || message.role === 'system') && message.content.trim().length > 0)
    .slice(-MAX_INCOMING_MESSAGES)
    .map((message) => ({ role: message.role, content: clipText(message.content.trim(), MAX_MESSAGE_CHARS) }));

  const fromDialogue = Array.isArray(dialogueContext)
    ? dialogueContext
        .filter((turn) => (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string' && turn.content.trim().length > 0)
        .slice(-8)
        .map((turn) => ({
          role: turn.role as 'user' | 'assistant',
          content: clipText(String(turn.content).trim(), MAX_MESSAGE_CHARS),
        }))
    : [];

  const merged = [...fromDialogue, ...fromIncoming];
  return merged.slice(-MAX_INCOMING_MESSAGES);
};

const buildRecentSummary = (messages: DeepSeekMessage[], keepCount = 8): string | null => {
  if (messages.length <= keepCount) return null;
  const older = messages.slice(0, Math.max(0, messages.length - keepCount));
  if (older.length === 0) return null;

  const lines = older.map((message, index) => {
    const prefix = message.role === 'assistant' ? 'A' : message.role === 'system' ? 'S' : 'U';
    return `${index + 1}. [${prefix}] ${clipText(message.content.replace(/\s+/g, ' '), 180)}`;
  });

  return `session_summary_v${Date.now()}:\n${lines.join('\n')}`;
};

const scoreMemory = (memory: MemoryCandidate, query: string): number => {
  const lowerQuery = query.toLowerCase();
  const lowerContent = memory.content.toLowerCase();

  const overlap = lowerQuery
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .reduce((acc, word) => (lowerContent.includes(word) ? acc + 1 : acc), 0);

  const overlapScore = Math.min(1, overlap / 4);

  const recencyScore = memory.updatedAt
    ? Math.max(0, 1 - (Date.now() - new Date(memory.updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0.5;

  return (memory.confidence || 0.6) * 0.6 + overlapScore * 0.25 + recencyScore * 0.15;
};

const buildMemoryBlock = (memories: MemoryCandidate[], query: string, limit = 6): string => {
  const selected = [...memories]
    .sort((a, b) => scoreMemory(b, query) - scoreMemory(a, query))
    .slice(0, limit);

  if (selected.length === 0) return '';

  return selected
    .map((item, idx) => `${idx + 1}. [${item.kind}] ${clipText(item.content, 220)}`)
    .join('\n');
};

const mergeConfig = (config?: Partial<ContextSliceConfig>): ContextSliceConfig => {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    compactThreshold: Number.isFinite(config?.compactThreshold) ? Number(config?.compactThreshold) : DEFAULT_CONFIG.compactThreshold,
  };
};

const toCharLimit = (tokens: number): number => Math.max(120, Math.floor(tokens * 4));

export const buildContextPackage = (args: ContextBuildArgs): ContextBuildResult => {
  const config = mergeConfig(args.config);

  const recentMessages = normalizeMessages(args.incomingMessages, args.dialogueContext);
  const latestUserText = [...recentMessages].reverse().find((message) => message.role === 'user')?.content || '';

  const memoryBlockRaw = buildMemoryBlock(args.memories, latestUserText, 6);
  const toolBlockRaw = args.toolObservations.join('\n').trim();
  const learningContextRaw = args.learningContext && Object.keys(args.learningContext).length > 0
    ? JSON.stringify(args.learningContext)
    : '';
  const toolContextRaw = args.toolContext && Object.keys(args.toolContext).length > 0
    ? JSON.stringify(args.toolContext)
    : '';

  const slices = {
    system: Math.floor(config.totalTokens * config.systemRatio),
    recentTurns: Math.floor(config.totalTokens * config.recentTurnsRatio),
    memory: Math.floor(config.totalTokens * config.memoryRatio),
    toolObservations: Math.floor(config.totalTokens * config.toolRatio),
    reserve: Math.floor(config.totalTokens * config.reserveRatio),
  };

  const recentRawText = recentMessages.map((message) => `[${message.role}] ${message.content}`).join('\n');

  const rawTokenEstimate =
    toTokenEstimate(recentRawText) +
    toTokenEstimate(memoryBlockRaw) +
    toTokenEstimate(toolBlockRaw) +
    toTokenEstimate(learningContextRaw) +
    toTokenEstimate(toolContextRaw);

  const needsCompaction = rawTokenEstimate > config.totalTokens * config.compactThreshold;

  let compactedSummary: string | undefined;
  let finalMessages = recentMessages;

  if (needsCompaction) {
    compactedSummary = buildRecentSummary(recentMessages, 8) || undefined;
    finalMessages = recentMessages.slice(-8);
  }

  const memoryBlock = clipText(memoryBlockRaw, toCharLimit(slices.memory));
  const toolBlock = clipText(toolBlockRaw, toCharLimit(slices.toolObservations));
  const learningContextBlock = clipText(learningContextRaw, toCharLimit(Math.floor(slices.system * 0.55)));
  const toolContextBlock = clipText(toolContextRaw, toCharLimit(Math.floor(slices.system * 0.45)));

  const pointerBlock = args.sourcePointers.length > 0
    ? args.sourcePointers
        .slice(0, 8)
        .map((pointer) => ({
          source_id: pointer.source_id,
          url: pointer.url,
          title: pointer.title,
          retrieved_at: pointer.retrieved_at,
        }))
    : [];

  const contextPromptSections: string[] = [];
  if (learningContextBlock) {
    contextPromptSections.push(`learning_context: ${learningContextBlock}`);
  }
  if (toolContextBlock) {
    contextPromptSections.push(`tool_context: ${toolContextBlock}`);
  }
  if (compactedSummary) {
    contextPromptSections.push(`compacted_history: ${clipText(compactedSummary, toCharLimit(Math.floor(slices.recentTurns * 0.4)))}`);
  }
  if (memoryBlock) {
    contextPromptSections.push(`retrieved_memory:\n${memoryBlock}`);
  }
  if (toolBlock) {
    contextPromptSections.push(`tool_observations:\n${toolBlock}`);
  }
  if (pointerBlock.length > 0) {
    contextPromptSections.push(`source_pointers: ${JSON.stringify(pointerBlock)}`);
  }

  const contextPrompt = contextPromptSections.length > 0
    ? `Additional structured context (trusted JSON/text):\n${contextPromptSections.join('\n\n')}`
    : '';

  return {
    modelMessages: finalMessages,
    contextPrompt,
    compactedSummary,
    contextMeta: {
      inputTokensEst: rawTokenEstimate,
      budgetUsed: slices,
      compacted: needsCompaction,
      memoryHits: Math.min(6, args.memories.length),
      searchTriggered: args.toolObservations.length > 0,
    },
  };
};

import { adminInsert, adminSelect, adminUpsert } from './supabase-admin.ts';

export type MemoryKind = 'profile' | 'preference' | 'weakness_tag' | 'goal' | 'error_trace' | 'tool_fact';

export interface MemoryItem {
  id: string;
  userId: string;
  sessionId?: string;
  kind: MemoryKind;
  content: string;
  tags: string[];
  confidence: number;
  sourceRef?: Record<string, unknown>;
  dedupeKey: string;
  expiresAt?: string;
  updatedAt?: string;
}

interface MemoryRow {
  id: string;
  user_id: string;
  session_id?: string | null;
  kind: MemoryKind;
  content: string;
  tags?: string[];
  confidence?: number;
  source_ref?: Record<string, unknown>;
  dedupe_key: string;
  expires_at?: string | null;
  updated_at?: string;
}

interface SnapshotInput {
  userId: string;
  sessionId: string;
  summary: string;
  compactedFromCount: number;
  sourcePointers: Array<{ source_id: string; url: string; title: string; retrieved_at: string }>;
}

const MAX_MEMORY_FETCH = 80;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const normalizeMemoryRow = (row: MemoryRow): MemoryItem => {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    sessionId: row.session_id ? String(row.session_id) : undefined,
    kind: row.kind,
    content: String(row.content),
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    confidence: clamp(Number(row.confidence ?? 0.65), 0, 1),
    sourceRef: row.source_ref || undefined,
    dedupeKey: String(row.dedupe_key),
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
};

const checksum = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

const scoreMemory = (memory: MemoryItem, query: string): number => {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);
  const contentLower = memory.content.toLowerCase();

  const overlap = terms.reduce((count, term) => (contentLower.includes(term) ? count + 1 : count), 0);
  const overlapScore = terms.length === 0 ? 0 : overlap / Math.min(terms.length, 5);

  const recencyScore = memory.updatedAt
    ? Math.max(0, 1 - (Date.now() - new Date(memory.updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0.5;

  return memory.confidence * 0.6 + recencyScore * 0.2 + overlapScore * 0.2;
};

export const retrieveMemory = async (args: {
  userId: string;
  sessionId?: string;
  query: string;
  topK?: number;
}): Promise<MemoryItem[]> => {
  try {
    const rows = await adminSelect<MemoryRow>('agent_memory_items', {
      select: 'id,user_id,session_id,kind,content,tags,confidence,source_ref,dedupe_key,expires_at,updated_at',
      eq: {
        user_id: args.userId,
      },
      order: { column: 'updated_at', ascending: false },
      limit: MAX_MEMORY_FETCH,
    });

    const now = Date.now();
    const validRows = rows
      .map(normalizeMemoryRow)
      .filter((item) => !item.expiresAt || new Date(item.expiresAt).getTime() > now);

    const topK = Number.isFinite(args.topK) ? Number(args.topK) : 6;

    return validRows
      .sort((a, b) => scoreMemory(b, args.query) - scoreMemory(a, args.query))
      .slice(0, topK);
  } catch {
    return [];
  }
};

const pushMemoryItem = async (item: Omit<MemoryItem, 'id'>): Promise<void> => {
  try {
    await adminUpsert(
      'agent_memory_items',
      {
        user_id: item.userId,
        session_id: item.sessionId || null,
        kind: item.kind,
        content: item.content,
        tags: item.tags,
        confidence: clamp(item.confidence, 0, 1),
        source_ref: item.sourceRef || {},
        dedupe_key: item.dedupeKey,
        expires_at: item.expiresAt || null,
        updated_at: new Date().toISOString(),
      },
      'user_id,dedupe_key',
    );
  } catch {
    // Ignore memory persistence failures to avoid blocking chat.
  }
};

const collectStableMemoryItems = (
  userId: string,
  sessionId: string | undefined,
  learningContext: Record<string, unknown> | undefined,
): Array<Omit<MemoryItem, 'id'>> => {
  if (!learningContext || Object.keys(learningContext).length === 0) return [];

  const items: Array<Omit<MemoryItem, 'id'>> = [];

  const level = typeof learningContext.level === 'string' ? learningContext.level.trim() : '';
  if (level) {
    items.push({
      userId,
      sessionId,
      kind: 'profile',
      content: `User level: ${level}`,
      tags: ['level'],
      confidence: 0.85,
      dedupeKey: `profile:level:${level.toLowerCase()}`,
      sourceRef: { field: 'learningContext.level' },
    });
  }

  const target = typeof learningContext.target === 'string' ? learningContext.target.trim() : '';
  if (target) {
    items.push({
      userId,
      sessionId,
      kind: 'goal',
      content: `Learning target: ${target}`,
      tags: ['target'],
      confidence: 0.8,
      dedupeKey: `goal:${checksum(target.toLowerCase())}`,
      sourceRef: { field: 'learningContext.target' },
    });
  }

  const examType = typeof learningContext.examType === 'string' ? learningContext.examType.trim() : '';
  if (examType) {
    items.push({
      userId,
      sessionId,
      kind: 'goal',
      content: `Exam focus: ${examType}`,
      tags: ['exam'],
      confidence: 0.78,
      dedupeKey: `goal:exam:${examType.toLowerCase()}`,
      sourceRef: { field: 'learningContext.examType' },
    });
  }

  const weaknessTags = Array.isArray(learningContext.weaknessTags)
    ? learningContext.weaknessTags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : [];

  weaknessTags.slice(0, 6).forEach((tag) => {
    items.push({
      userId,
      sessionId,
      kind: 'weakness_tag',
      content: `Weakness: ${tag}`,
      tags: ['weakness'],
      confidence: 0.72,
      dedupeKey: `weakness:${tag.toLowerCase()}`,
      sourceRef: { field: 'learningContext.weaknessTags' },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    });
  });

  return items;
};

export const persistTurnMemory = async (args: {
  userId: string;
  sessionId?: string;
  learningContext?: Record<string, unknown>;
  userMessage: string;
  assistantMessage: string;
  toolFacts?: string[];
  hadError?: boolean;
}): Promise<void> => {
  const stable = collectStableMemoryItems(args.userId, args.sessionId, args.learningContext);

  for (const item of stable) {
    await pushMemoryItem(item);
  }

  const episodicSummary = `${args.userMessage.slice(0, 140)} -> ${args.assistantMessage.slice(0, 200)}`;
  await pushMemoryItem({
    userId: args.userId,
    sessionId: args.sessionId,
    kind: args.hadError ? 'error_trace' : 'tool_fact',
    content: episodicSummary,
    tags: args.hadError ? ['error_trace'] : ['episodic'],
    confidence: args.hadError ? 0.66 : 0.7,
    dedupeKey: `turn:${checksum(episodicSummary)}`,
    sourceRef: {
      generated_at: new Date().toISOString(),
      source: 'ai_chat_turn',
    },
    expiresAt: args.hadError ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() : undefined,
  });

  if (Array.isArray(args.toolFacts) && args.toolFacts.length > 0) {
    for (const fact of args.toolFacts.slice(0, 4)) {
      await pushMemoryItem({
        userId: args.userId,
        sessionId: args.sessionId,
        kind: 'tool_fact',
        content: fact.slice(0, 300),
        tags: ['tool_fact'],
        confidence: 0.76,
        dedupeKey: `tool_fact:${checksum(fact.toLowerCase())}`,
        sourceRef: {
          generated_at: new Date().toISOString(),
          source: 'tool_router',
        },
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
      });
    }
  }
};

export const persistContextSnapshot = async (args: SnapshotInput): Promise<void> => {
  if (!args.summary.trim()) return;

  try {
    await adminInsert('agent_context_snapshots', {
      user_id: args.userId,
      session_id: args.sessionId,
      summary: args.summary.slice(0, 6000),
      compacted_from_count: args.compactedFromCount,
      source_pointers: args.sourcePointers,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-blocking.
  }
};

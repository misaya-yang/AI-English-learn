import { adminDelete, adminInsert, adminPatch, adminRpc, adminSelect, adminUpsert } from './supabase-admin.ts';

export type MemoryKind = 'profile' | 'preference' | 'weakness_tag' | 'goal' | 'error_trace' | 'tool_fact';
export type MemoryVisibility = 'private' | 'session' | 'public';

export interface MemoryItem {
  id: string;
  userId: string;
  sessionId?: string;
  kind: MemoryKind;
  content: string;
  tags: string[];
  confidence: number;
  salience: number;
  isPinned: boolean;
  visibility: MemoryVisibility;
  recallCount: number;
  sourceRef?: Record<string, unknown>;
  dedupeKey: string;
  expiresAt?: string;
  updatedAt?: string;
  cosineSimilarity?: number;
  pedagogicalRelevance?: number;
  retrievalScore?: number;
}

export interface MemoryWriteResult {
  id?: string;
  kind: MemoryKind;
  contentPreview: string;
  confidence: number;
  dedupeKey: string;
  reason: 'stable' | 'tool_fact' | 'error_trace' | 'explicit';
}

interface MemoryPolicyInput {
  writeMode?: 'stable_only' | 'balanced';
  allowSensitiveStore?: boolean;
}

interface MemoryRow {
  id: string;
  user_id: string;
  session_id?: string | null;
  kind: MemoryKind;
  content: string;
  tags?: string[];
  confidence?: number;
  salience?: number;
  is_pinned?: boolean;
  visibility?: MemoryVisibility;
  recall_count?: number;
  source_ref?: Record<string, unknown>;
  dedupe_key: string;
  expires_at?: string | null;
  updated_at?: string;
}

interface MemoryMatchRow extends MemoryRow {
  cosine_similarity?: number;
  pedagogical_relevance?: number;
  hybrid_score?: number;
}

interface SnapshotInput {
  userId: string;
  sessionId: string;
  summary: string;
  compactedFromCount: number;
  sourcePointers: Array<{ source_id: string; url: string; title: string; retrieved_at: string }>;
}

const MAX_MEMORY_FETCH = 120;
const MAX_EXPLICIT_ITEMS = 6;
const EMBEDDING_DIM = 384;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const checksum = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

const tokenize = (value: string): string[] => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .slice(0, 200);
};

const containsSensitiveData = (value: string): boolean => {
  if (!value) return false;

  const patterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /\b1[3-9]\d{9}\b/, // CN phone
    /\b\d{15}(\d{2}[0-9X])?\b/i, // CN ID
    /\b(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){8,14}\b/, // generic phone-like
  ];

  return patterns.some((pattern) => pattern.test(value));
};

const makeLocalHashEmbedding = (input: string): number[] => {
  const vector = new Float32Array(EMBEDDING_DIM);
  const tokens = tokenize(input);

  if (tokens.length === 0) {
    return Array.from(vector);
  }

  for (const token of tokens) {
    const tokenHash = checksum(token);
    const base = parseInt(tokenHash.slice(0, 8), 16) || 1;

    for (let i = 0; i < 3; i += 1) {
      const idx = (base + i * 97) % EMBEDDING_DIM;
      const sign = ((base >> i) & 1) === 0 ? 1 : -1;
      vector[idx] += sign * (1 / Math.sqrt(tokens.length));
    }
  }

  let norm = 0;
  for (let i = 0; i < vector.length; i += 1) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1;

  for (let i = 0; i < vector.length; i += 1) {
    vector[i] /= norm;
  }

  return Array.from(vector);
};

const toPgVectorLiteral = (vector: number[]): string => {
  const clipped = vector.slice(0, EMBEDDING_DIM).map((value) => Number(value.toFixed(6)));
  return `[${clipped.join(',')}]`;
};

const embedText = async (text: string): Promise<{ embedding: number[]; model: string }> => {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      embedding: makeLocalHashEmbedding('empty'),
      model: 'local-hash-384',
    };
  }

  const endpoint = Deno.env.get('EMBEDDING_API_URL') || Deno.env.get('DEEPSEEK_EMBEDDING_URL');
  const apiKey = Deno.env.get('EMBEDDING_API_KEY') || Deno.env.get('DEEPSEEK_API_KEY');
  const model = Deno.env.get('EMBEDDING_MODEL') || Deno.env.get('DEEPSEEK_EMBEDDING_MODEL') || 'text-embedding-3-small';

  if (!endpoint || !apiKey) {
    return {
      embedding: makeLocalHashEmbedding(trimmed),
      model: 'local-hash-384',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: trimmed,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error(`embedding_api_failed_${response.status}`);
    }

    const payload = await response.json() as { data?: Array<{ embedding?: number[] }> };
    const embedding = payload.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length < 16) {
      throw new Error('embedding_payload_malformed');
    }

    const normalized = embedding.slice(0, EMBEDDING_DIM).map((value) => Number(value) || 0);
    return {
      embedding: normalized,
      model,
    };
  } catch {
    return {
      embedding: makeLocalHashEmbedding(trimmed),
      model: 'local-hash-384',
    };
  }
};

const normalizeMemoryRow = (row: MemoryRow): MemoryItem => {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    sessionId: row.session_id ? String(row.session_id) : undefined,
    kind: row.kind,
    content: String(row.content),
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    confidence: clamp(Number(row.confidence ?? 0.65), 0, 1),
    salience: clamp(Number(row.salience ?? 0.5), 0, 1),
    isPinned: Boolean(row.is_pinned),
    visibility: (row.visibility === 'public' || row.visibility === 'session' ? row.visibility : 'private'),
    recallCount: Number(row.recall_count ?? 0),
    sourceRef: row.source_ref || undefined,
    dedupeKey: String(row.dedupe_key),
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
};

const pedagogicalRelevanceOfKind = (kind: MemoryKind): number => {
  switch (kind) {
    case 'goal':
      return 1;
    case 'profile':
      return 0.98;
    case 'weakness_tag':
      return 0.95;
    case 'preference':
      return 0.86;
    case 'tool_fact':
      return 0.78;
    case 'error_trace':
      return 0.72;
    default:
      return 0.65;
  }
};

const recencyDecay = (updatedAt?: string): number => {
  if (!updatedAt) return 0.4;
  const elapsedDays = Math.max(0, (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  return Math.exp(-elapsedDays / 30);
};

const termOverlapScore = (query: string, content: string): number => {
  const terms = tokenize(query).slice(0, 8);
  if (terms.length === 0) return 0;

  const lower = content.toLowerCase();
  const hitCount = terms.reduce((count, term) => (lower.includes(term) ? count + 1 : count), 0);
  return clamp(hitCount / terms.length, 0, 1);
};

const hybridScore = (args: {
  cosineSimilarity: number;
  updatedAt?: string;
  confidence: number;
  pedagogicalRelevance: number;
}): number => {
  const cosineSimilarity = clamp(args.cosineSimilarity, 0, 1);
  const recency = recencyDecay(args.updatedAt);

  return (
    0.55 * cosineSimilarity +
    0.20 * recency +
    0.15 * clamp(args.confidence, 0, 1) +
    0.10 * clamp(args.pedagogicalRelevance, 0, 1)
  );
};

const logMemoryEvent = async (args: {
  userId: string;
  sessionId?: string;
  memoryId?: string;
  eventType: 'write' | 'read' | 'reinforce' | 'delete' | 'pin' | 'forget' | 'expire_clear';
  payload?: Record<string, unknown>;
}): Promise<void> => {
  try {
    await adminInsert('agent_memory_events', {
      user_id: args.userId,
      session_id: args.sessionId || null,
      memory_id: args.memoryId || null,
      event_type: args.eventType,
      payload: args.payload || {},
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-blocking
  }
};

export const retrieveMemory = async (args: {
  userId: string;
  sessionId?: string;
  query: string;
  topK?: number;
  minSimilarity?: number;
  kindFilter?: MemoryKind[];
}): Promise<MemoryItem[]> => {
  try {
    const rows = await adminSelect<MemoryRow>('agent_memory_items', {
      select:
        'id,user_id,session_id,kind,content,tags,confidence,salience,is_pinned,visibility,recall_count,source_ref,dedupe_key,expires_at,updated_at',
      eq: {
        user_id: args.userId,
      },
      order: { column: 'updated_at', ascending: false },
      limit: MAX_MEMORY_FETCH,
    });

    const now = Date.now();
    const kindFilter = Array.isArray(args.kindFilter) && args.kindFilter.length > 0 ? new Set(args.kindFilter) : null;

    const candidates = rows
      .map(normalizeMemoryRow)
      .filter((item) => !item.expiresAt || new Date(item.expiresAt).getTime() > now)
      .filter((item) => (kindFilter ? kindFilter.has(item.kind) : true));

    if (candidates.length === 0) return [];

    const topK = Math.max(1, Math.min(10, Number(args.topK || 6)));
    const minSimilarity = clamp(Number(args.minSimilarity ?? 0.24), 0, 1);

    const vectorScores = new Map<string, { cosineSimilarity: number; hybridScore?: number; pedagogicalRelevance?: number }>();
    let usedVectorLookup = false;

    if (args.query.trim().length > 0) {
      const embedded = await embedText(args.query);
      try {
        const rpcRows = await adminRpc<MemoryMatchRow>('match_agent_memory', {
          p_user_id: args.userId,
          p_query_embedding: toPgVectorLiteral(embedded.embedding),
          p_top_k: Math.max(24, topK * 4),
          p_min_sim: minSimilarity,
          p_kind_filter: kindFilter ? Array.from(kindFilter) : null,
        });

        rpcRows.forEach((row) => {
          vectorScores.set(String(row.id), {
            cosineSimilarity: clamp(Number(row.cosine_similarity ?? 0), 0, 1),
            hybridScore: Number(row.hybrid_score ?? 0),
            pedagogicalRelevance: Number(row.pedagogical_relevance ?? pedagogicalRelevanceOfKind(row.kind)),
          });
        });

        usedVectorLookup = true;
      } catch {
        usedVectorLookup = false;
      }
    }

    const scored = candidates
      .map((item) => {
        const vector = vectorScores.get(item.id);
        const cosineSimilarity = vector?.cosineSimilarity ?? termOverlapScore(args.query, item.content);
        const pedagogicalRelevance = vector?.pedagogicalRelevance ?? pedagogicalRelevanceOfKind(item.kind);
        const retrievalScore = vector?.hybridScore
          ? Number(vector.hybridScore)
          : hybridScore({
              cosineSimilarity,
              updatedAt: item.updatedAt,
              confidence: item.confidence,
              pedagogicalRelevance,
            });

        return {
          ...item,
          cosineSimilarity,
          pedagogicalRelevance,
          retrievalScore,
        };
      })
      .filter((item) => item.isPinned || item.cosineSimilarity >= minSimilarity / 2)
      .sort((a, b) => {
        const scoreDelta = (b.retrievalScore || 0) - (a.retrievalScore || 0);
        if (Math.abs(scoreDelta) > 1e-6) return scoreDelta;
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      })
      .slice(0, topK);

    if (scored.length > 0) {
      const nowIso = new Date().toISOString();
      for (const item of scored) {
        try {
          await adminPatch(
            'agent_memory_items',
            {
              last_recalled_at: nowIso,
              recall_count: (item.recallCount || 0) + 1,
            },
            {
              eq: {
                id: item.id,
                user_id: args.userId,
              },
            },
          );
        } catch {
          // Non-blocking
        }
      }

      await logMemoryEvent({
        userId: args.userId,
        sessionId: args.sessionId,
        eventType: 'read',
        payload: {
          queryHash: checksum(args.query.toLowerCase()),
          topK,
          hitCount: scored.length,
          minSimilarity,
          usedVectorLookup,
          memoryIds: scored.map((item) => item.id),
        },
      });
    }

    return scored;
  } catch {
    return [];
  }
};

const pushMemoryItem = async (
  item: Omit<MemoryItem, 'id' | 'recallCount' | 'cosineSimilarity' | 'pedagogicalRelevance' | 'retrievalScore'>,
  reason: MemoryWriteResult['reason'],
  allowSensitiveStore: boolean,
): Promise<MemoryWriteResult | null> => {
  try {
    if (!allowSensitiveStore && containsSensitiveData(item.content)) {
      return null;
    }

    const embedding = await embedText(item.content);
    const rows = await adminUpsert<MemoryRow>(
      'agent_memory_items',
      {
        user_id: item.userId,
        session_id: item.sessionId || null,
        kind: item.kind,
        content: item.content,
        tags: item.tags,
        confidence: clamp(item.confidence, 0, 1),
        salience: clamp(item.salience, 0, 1),
        is_pinned: item.isPinned,
        visibility: item.visibility,
        source_ref: item.sourceRef || {},
        dedupe_key: item.dedupeKey,
        expires_at: item.expiresAt || null,
        embedding: toPgVectorLiteral(embedding.embedding),
        embedding_model: embedding.model,
        updated_at: new Date().toISOString(),
      },
      'user_id,dedupe_key',
    );

    const normalized = rows[0] ? normalizeMemoryRow(rows[0]) : null;

    await logMemoryEvent({
      userId: item.userId,
      sessionId: item.sessionId,
      memoryId: normalized?.id,
      eventType: 'write',
      payload: {
        kind: item.kind,
        dedupeKey: item.dedupeKey,
        reason,
        visibility: item.visibility,
      },
    });

    return {
      id: normalized?.id,
      kind: item.kind,
      contentPreview: item.content.slice(0, 120),
      confidence: item.confidence,
      dedupeKey: item.dedupeKey,
      reason,
    };
  } catch {
    return null;
  }
};

const collectStableMemoryItems = (
  userId: string,
  sessionId: string | undefined,
  learningContext: Record<string, unknown> | undefined,
): Array<Omit<MemoryItem, 'id' | 'recallCount' | 'cosineSimilarity' | 'pedagogicalRelevance' | 'retrievalScore'>> => {
  if (!learningContext || Object.keys(learningContext).length === 0) return [];

  const items: Array<Omit<MemoryItem, 'id' | 'recallCount' | 'cosineSimilarity' | 'pedagogicalRelevance' | 'retrievalScore'>> = [];

  const level = typeof learningContext.level === 'string' ? learningContext.level.trim() : '';
  if (level) {
    items.push({
      userId,
      sessionId,
      kind: 'profile',
      content: `User level: ${level}`,
      tags: ['level'],
      confidence: 0.86,
      salience: 0.85,
      isPinned: false,
      visibility: 'private',
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
      confidence: 0.84,
      salience: 0.92,
      isPinned: true,
      visibility: 'private',
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
      confidence: 0.8,
      salience: 0.9,
      isPinned: false,
      visibility: 'private',
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
      confidence: 0.74,
      salience: 0.9,
      isPinned: false,
      visibility: 'private',
      dedupeKey: `weakness:${tag.toLowerCase()}`,
      sourceRef: { field: 'learningContext.weaknessTags' },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
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
  memoryPolicy?: MemoryPolicyInput;
}): Promise<MemoryWriteResult[]> => {
  const writes: MemoryWriteResult[] = [];
  const writeMode = args.memoryPolicy?.writeMode === 'balanced' ? 'balanced' : 'stable_only';
  const allowSensitiveStore = Boolean(args.memoryPolicy?.allowSensitiveStore);

  const stable = collectStableMemoryItems(args.userId, args.sessionId, args.learningContext);
  for (const item of stable) {
    const persisted = await pushMemoryItem(item, 'stable', allowSensitiveStore);
    if (persisted) writes.push(persisted);
  }

  if (writeMode === 'balanced') {
    const episodicSummary = `${args.userMessage.slice(0, 140)} -> ${args.assistantMessage.slice(0, 220)}`;
    const persisted = await pushMemoryItem(
      {
        userId: args.userId,
        sessionId: args.sessionId,
        kind: 'tool_fact',
        content: episodicSummary,
        tags: ['episodic'],
        confidence: 0.68,
        salience: 0.58,
        isPinned: false,
        visibility: 'session',
        dedupeKey: `turn:${checksum(episodicSummary)}`,
        sourceRef: {
          source: 'ai_chat_turn',
          generated_at: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      },
      'tool_fact',
      allowSensitiveStore,
    );
    if (persisted) writes.push(persisted);
  }

  if (args.hadError) {
    const errorSummary = `${args.userMessage.slice(0, 120)} -> tool_error`; 
    const persisted = await pushMemoryItem(
      {
        userId: args.userId,
        sessionId: args.sessionId,
        kind: 'error_trace',
        content: errorSummary,
        tags: ['error_trace'],
        confidence: 0.66,
        salience: 0.74,
        isPinned: false,
        visibility: 'private',
        dedupeKey: `error:${checksum(errorSummary.toLowerCase())}`,
        sourceRef: {
          source: 'tool_router',
          generated_at: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      },
      'error_trace',
      allowSensitiveStore,
    );
    if (persisted) writes.push(persisted);
  }

  if (Array.isArray(args.toolFacts) && args.toolFacts.length > 0) {
    for (const fact of args.toolFacts.slice(0, 4)) {
      const trimmedFact = fact.trim();
      if (!trimmedFact) continue;
      const persisted = await pushMemoryItem(
        {
          userId: args.userId,
          sessionId: args.sessionId,
          kind: 'tool_fact',
          content: trimmedFact.slice(0, 320),
          tags: ['tool_fact'],
          confidence: 0.78,
          salience: 0.64,
          isPinned: false,
          visibility: 'private',
          dedupeKey: `tool_fact:${checksum(trimmedFact.toLowerCase())}`,
          sourceRef: {
            source: 'tool_router',
            generated_at: new Date().toISOString(),
          },
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
        },
        'tool_fact',
        allowSensitiveStore,
      );
      if (persisted) writes.push(persisted);
    }
  }

  return writes;
};

export const rememberExplicitMemory = async (args: {
  userId: string;
  sessionId?: string;
  items: string[];
  kind?: MemoryKind;
  allowSensitiveStore?: boolean;
}): Promise<MemoryWriteResult[]> => {
  const writes: MemoryWriteResult[] = [];
  const kind = args.kind || 'preference';
  const allowSensitiveStore = Boolean(args.allowSensitiveStore);

  const normalizedItems = args.items
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, MAX_EXPLICIT_ITEMS);

  for (const content of normalizedItems) {
    const persisted = await pushMemoryItem(
      {
        userId: args.userId,
        sessionId: args.sessionId,
        kind,
        content,
        tags: ['explicit'],
        confidence: 0.92,
        salience: 0.96,
        isPinned: true,
        visibility: 'private',
        dedupeKey: `explicit:${kind}:${checksum(content.toLowerCase())}`,
        sourceRef: {
          source: 'memory_control',
          generated_at: new Date().toISOString(),
        },
      },
      'explicit',
      allowSensitiveStore,
    );

    if (persisted) writes.push(persisted);
  }

  return writes;
};

export const forgetExplicitMemory = async (args: {
  userId: string;
  ids?: string[];
  dedupeKeys?: string[];
  query?: string;
  sessionId?: string;
}): Promise<{ deletedCount: number }> => {
  const targetIds = new Set<string>();

  if (Array.isArray(args.ids)) {
    args.ids.forEach((id) => {
      if (typeof id === 'string' && id.trim()) {
        targetIds.add(id.trim());
      }
    });
  }

  if (Array.isArray(args.dedupeKeys) && args.dedupeKeys.length > 0) {
    try {
      const rows = await adminSelect<MemoryRow>('agent_memory_items', {
        select: 'id,user_id,session_id,kind,content,tags,confidence,salience,is_pinned,visibility,recall_count,source_ref,dedupe_key,expires_at,updated_at',
        eq: { user_id: args.userId },
        in: { dedupe_key: args.dedupeKeys.map((item) => item.trim()).filter(Boolean) },
        limit: 200,
      });
      rows.forEach((row) => targetIds.add(String(row.id)));
    } catch {
      // ignore lookup errors
    }
  }

  const query = args.query?.trim().toLowerCase();
  if (query) {
    try {
      const rows = await adminSelect<MemoryRow>('agent_memory_items', {
        select: 'id,user_id,session_id,kind,content,tags,confidence,salience,is_pinned,visibility,recall_count,source_ref,dedupe_key,expires_at,updated_at',
        eq: { user_id: args.userId },
        order: { column: 'updated_at', ascending: false },
        limit: 300,
      });
      rows.forEach((row) => {
        const content = String(row.content || '').toLowerCase();
        const key = String(row.dedupe_key || '').toLowerCase();
        if (content.includes(query) || key.includes(query)) {
          targetIds.add(String(row.id));
        }
      });
    } catch {
      // ignore lookup errors
    }
  }

  if (targetIds.size === 0) {
    return { deletedCount: 0 };
  }

  const ids = Array.from(targetIds);
  let deletedCount = 0;

  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    try {
      const deletedRows = await adminDelete<MemoryRow>('agent_memory_items', {
        eq: { user_id: args.userId },
        in: { id: batch },
      });
      deletedCount += deletedRows.length;
    } catch {
      // ignore batch deletion failures
    }
  }

  await logMemoryEvent({
    userId: args.userId,
    sessionId: args.sessionId,
    eventType: args.query ? 'forget' : 'delete',
    payload: {
      deletedCount,
      hadQuery: Boolean(args.query),
    },
  });

  return { deletedCount };
};

export const listUserMemory = async (args: {
  userId: string;
  limit?: number;
  kind?: MemoryKind | 'all';
  query?: string;
}): Promise<MemoryItem[]> => {
  const limit = Math.max(1, Math.min(200, Number(args.limit || 50)));

  try {
    const rows = await adminSelect<MemoryRow>('agent_memory_items', {
      select:
        'id,user_id,session_id,kind,content,tags,confidence,salience,is_pinned,visibility,recall_count,source_ref,dedupe_key,expires_at,updated_at',
      eq: { user_id: args.userId },
      order: { column: 'updated_at', ascending: false },
      limit: Math.max(limit * 2, 80),
    });

    const now = Date.now();
    const normalized = rows
      .map(normalizeMemoryRow)
      .filter((item) => !item.expiresAt || new Date(item.expiresAt).getTime() > now)
      .filter((item) => (args.kind && args.kind !== 'all' ? item.kind === args.kind : true))
      .filter((item) => {
        const query = args.query?.trim().toLowerCase();
        if (!query) return true;
        return item.content.toLowerCase().includes(query) || item.tags.some((tag) => tag.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      })
      .slice(0, limit);

    return normalized;
  } catch {
    return [];
  }
};

export const pinUserMemory = async (args: {
  userId: string;
  memoryId: string;
  isPinned: boolean;
  sessionId?: string;
}): Promise<MemoryItem | null> => {
  try {
    const rows = await adminPatch<MemoryRow>(
      'agent_memory_items',
      {
        is_pinned: args.isPinned,
        updated_at: new Date().toISOString(),
      },
      {
        eq: {
          user_id: args.userId,
          id: args.memoryId,
        },
      },
    );

    const item = rows[0] ? normalizeMemoryRow(rows[0]) : null;

    if (item) {
      await logMemoryEvent({
        userId: args.userId,
        sessionId: args.sessionId,
        memoryId: item.id,
        eventType: 'pin',
        payload: {
          isPinned: args.isPinned,
        },
      });
    }

    return item;
  } catch {
    return null;
  }
};

export const clearExpiredMemory = async (args: {
  userId: string;
  sessionId?: string;
}): Promise<{ deletedCount: number }> => {
  try {
    const nowIso = new Date().toISOString();
    const expired = await adminSelect<MemoryRow>('agent_memory_items', {
      select:
        'id,user_id,session_id,kind,content,tags,confidence,salience,is_pinned,visibility,recall_count,source_ref,dedupe_key,expires_at,updated_at',
      eq: { user_id: args.userId },
      lte: { expires_at: nowIso },
      limit: 500,
    });

    const ids = expired.map((item) => String(item.id));
    if (ids.length === 0) {
      return { deletedCount: 0 };
    }

    let deletedCount = 0;
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      const deletedRows = await adminDelete<MemoryRow>('agent_memory_items', {
        eq: { user_id: args.userId },
        in: { id: batch },
      });
      deletedCount += deletedRows.length;
    }

    await logMemoryEvent({
      userId: args.userId,
      sessionId: args.sessionId,
      eventType: 'expire_clear',
      payload: {
        deletedCount,
      },
    });

    return { deletedCount };
  } catch {
    return { deletedCount: 0 };
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

    await logMemoryEvent({
      userId: args.userId,
      sessionId: args.sessionId,
      eventType: 'write',
      payload: {
        kind: 'context_snapshot',
        compactedFromCount: args.compactedFromCount,
        pointerCount: args.sourcePointers.length,
      },
    });
  } catch {
    // Non-blocking.
  }
};

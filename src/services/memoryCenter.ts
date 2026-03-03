import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '@/lib/supabase';
import { AuthRequiredError, EdgeFunctionError } from './aiGateway';
import type { MemoryItemView, MemoryKind } from '@/types/memory';

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new AuthRequiredError('Please sign in before managing memory.');
  }

  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
};

const parseEdgeError = async (response: Response, fnName: string): Promise<never> => {
  const requestId =
    response.headers.get('x-request-id') ||
    response.headers.get('x-sb-request-id') ||
    undefined;

  const errorText = await response.text().catch(() => '');
  let code: string | undefined;
  let message: string | undefined;

  if (errorText) {
    try {
      const parsed = JSON.parse(errorText) as { code?: string; error?: string; message?: string };
      code = parsed.code || parsed.error;
      message = parsed.message;
    } catch {
      // use plain text fallback
    }
  }

  throw new EdgeFunctionError(message || `${fnName} failed`, {
    status: response.status,
    code,
    requestId,
    detail: errorText || undefined,
  });
};

const toQuery = (params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

type MemoryItemRow = {
  id: string;
  user_id: string;
  session_id: string | null;
  kind: MemoryKind;
  content: string;
  tags: string[] | null;
  confidence: number | string | null;
  salience: number | string | null;
  is_pinned: boolean | null;
  visibility: 'private' | 'session' | 'public' | null;
  recall_count: number | null;
  dedupe_key: string;
  expires_at: string | null;
  updated_at: string | null;
};

const mapMemoryRow = (row: MemoryItemRow): MemoryItemView => ({
  id: row.id,
  userId: row.user_id,
  sessionId: row.session_id || undefined,
  kind: row.kind,
  content: row.content,
  tags: Array.isArray(row.tags) ? row.tags : [],
  confidence: Number(row.confidence ?? 0.7),
  salience: Number(row.salience ?? 0.5),
  isPinned: Boolean(row.is_pinned),
  visibility: row.visibility || 'private',
  recallCount: row.recall_count ?? 0,
  dedupeKey: row.dedupe_key,
  expiresAt: row.expires_at || undefined,
  updatedAt: row.updated_at || undefined,
});

const shouldFallbackToDirectQuery = (error: unknown): boolean => {
  if (error instanceof EdgeFunctionError) {
    return error.status === 0 || error.status === 404 || error.status >= 500;
  }
  // fetch network failures throw TypeError in browsers
  return error instanceof TypeError;
};

const listMemoryItemsViaDirectQuery = async (args?: {
  kind?: MemoryKind | 'all';
  query?: string;
  limit?: number;
}): Promise<MemoryItemView[]> => {
  let queryBuilder = supabase
    .from('agent_memory_items')
    .select('id,user_id,session_id,kind,content,tags,confidence,salience,is_pinned,visibility,recall_count,dedupe_key,expires_at,updated_at')
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(args?.limit || 80);

  if (args?.kind && args.kind !== 'all') {
    queryBuilder = queryBuilder.eq('kind', args.kind);
  }

  const searchQuery = args?.query?.trim();
  if (searchQuery) {
    queryBuilder = queryBuilder.ilike('content', `%${searchQuery}%`);
  }

  const { data, error } = await queryBuilder;
  if (error) {
    throw new EdgeFunctionError(error.message, {
      status: 502,
      code: 'direct_query_failed',
      detail: error.details || undefined,
    });
  }

  return (data as MemoryItemRow[] | null)?.map(mapMemoryRow) ?? [];
};

export const listMemoryItems = async (args?: {
  kind?: MemoryKind | 'all';
  query?: string;
  limit?: number;
}): Promise<MemoryItemView[]> => {
  try {
    const headers = await getAuthHeaders();
    const query = toQuery({
      kind: args?.kind || 'all',
      query: args?.query,
      limit: args?.limit || 80,
    });

    const response = await fetch(`${SUPABASE_URL}/functions/v1/memory-list${query}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      await parseEdgeError(response, 'memory-list');
    }

    const payload = await response.json() as { items?: MemoryItemView[] };
    return Array.isArray(payload.items) ? payload.items : [];
  } catch (error) {
    if (shouldFallbackToDirectQuery(error)) {
      try {
        return await listMemoryItemsViaDirectQuery(args);
      } catch (fallbackError) {
        console.warn('[memory-center] list fallback failed', fallbackError);
        // Keep memory center usable even when remote functions/tables are unavailable.
        return [];
      }
    }
    throw error;
  }
};

export const rememberMemoryItems = async (args: {
  items: string[];
  kind?: MemoryKind;
  allowSensitiveStore?: boolean;
}): Promise<{ writes: Array<{ id?: string; contentPreview: string; kind: string }> }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/memory-remember`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    await parseEdgeError(response, 'memory-remember');
  }

  return await response.json() as { writes: Array<{ id?: string; contentPreview: string; kind: string }> };
};

export const deleteMemoryItems = async (args: {
  ids?: string[];
  dedupeKeys?: string[];
  query?: string;
}): Promise<{ deletedCount: number }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/memory-delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    await parseEdgeError(response, 'memory-delete');
  }

  return await response.json() as { deletedCount: number };
};

export const pinMemoryItem = async (memoryId: string, isPinned: boolean): Promise<MemoryItemView> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/memory-pin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ memoryId, isPinned }),
  });

  if (!response.ok) {
    await parseEdgeError(response, 'memory-pin');
  }

  const payload = await response.json() as { item?: MemoryItemView };
  if (!payload.item) {
    throw new EdgeFunctionError('memory-pin returned empty item', { status: 502, code: 'empty_item' });
  }
  return payload.item;
};

export const clearExpiredMemoryItems = async (): Promise<{ deletedCount: number }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/memory-clear-expired`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    await parseEdgeError(response, 'memory-clear-expired');
  }

  return await response.json() as { deletedCount: number };
};

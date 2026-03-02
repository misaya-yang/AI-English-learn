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

export const listMemoryItems = async (args?: {
  kind?: MemoryKind | 'all';
  query?: string;
  limit?: number;
}): Promise<MemoryItemView[]> => {
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

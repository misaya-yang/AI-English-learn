import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { listUserMemory, type MemoryKind } from '../_shared/memory-engine.ts';

const toMemoryKind = (value: unknown): MemoryKind | 'all' => {
  if (value === 'profile' || value === 'preference' || value === 'weakness_tag' || value === 'goal' || value === 'error_trace' || value === 'tool_fact') {
    return value;
  }
  return 'all';
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
    let limit = 80;
    let kind: MemoryKind | 'all' = 'all';
    let query = '';

    if (req.method === 'GET') {
      const url = new URL(req.url);
      limit = Number(url.searchParams.get('limit') || 80);
      kind = toMemoryKind(url.searchParams.get('kind'));
      query = url.searchParams.get('query') || '';
    } else {
      const body = await req.json().catch(() => ({}));
      limit = Number(body.limit || 80);
      kind = toMemoryKind(body.kind);
      query = typeof body.query === 'string' ? body.query : '';
    }

    const items = await listUserMemory({
      userId: auth.userId,
      limit,
      kind,
      query,
    });

    return jsonResponse({
      items,
      total: items.length,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: 'memory_list_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

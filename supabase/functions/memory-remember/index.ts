import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { rememberExplicitMemory, type MemoryKind } from '../_shared/memory-engine.ts';

const toMemoryKind = (value: unknown): MemoryKind => {
  if (value === 'profile' || value === 'preference' || value === 'weakness_tag' || value === 'goal' || value === 'error_trace' || value === 'tool_fact') {
    return value;
  }
  return 'preference';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await requireAuthenticatedUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body.items)
      ? body.items.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];

    if (items.length === 0) {
      return jsonResponse({ error: 'invalid_items' }, 400);
    }

    const writes = await rememberExplicitMemory({
      userId: auth.userId,
      items,
      kind: toMemoryKind(body.kind),
      allowSensitiveStore: body.allowSensitiveStore === true,
    });

    return jsonResponse({ writes });
  } catch (error) {
    return jsonResponse(
      {
        error: 'memory_remember_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

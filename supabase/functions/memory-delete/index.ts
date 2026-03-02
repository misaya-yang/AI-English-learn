import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { forgetExplicitMemory } from '../_shared/memory-engine.ts';

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

    const result = await forgetExplicitMemory({
      userId: auth.userId,
      ids: Array.isArray(body.ids)
        ? body.ids.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
        : undefined,
      dedupeKeys: Array.isArray(body.dedupeKeys)
        ? body.dedupeKeys.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
        : undefined,
      query: typeof body.query === 'string' ? body.query : undefined,
    });

    return jsonResponse(result);
  } catch (error) {
    return jsonResponse(
      {
        error: 'memory_delete_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

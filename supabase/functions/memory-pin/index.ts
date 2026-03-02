import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { pinUserMemory } from '../_shared/memory-engine.ts';

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
    const memoryId = typeof body.memoryId === 'string' ? body.memoryId.trim() : '';

    if (!memoryId) {
      return jsonResponse({ error: 'invalid_memory_id' }, 400);
    }

    const item = await pinUserMemory({
      userId: auth.userId,
      memoryId,
      isPinned: body.isPinned === true,
    });

    if (!item) {
      return jsonResponse({ error: 'memory_not_found' }, 404);
    }

    return jsonResponse({ item });
  } catch (error) {
    return jsonResponse(
      {
        error: 'memory_pin_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

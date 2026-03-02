import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { clearExpiredMemory } from '../_shared/memory-engine.ts';

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
    const result = await clearExpiredMemory({
      userId: auth.userId,
    });

    return jsonResponse(result);
  } catch (error) {
    return jsonResponse(
      {
        error: 'memory_clear_expired_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId || 'guest');
    const plan = body.plan === 'pro' ? 'pro' : 'free';
    const now = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);

    return jsonResponse({
      userId,
      plan,
      quota: plan === 'pro'
        ? {
            aiAdvancedFeedbackPerDay: 30,
            simItemsPerDay: 20,
            microLessonsPerDay: 20,
          }
        : {
            aiAdvancedFeedbackPerDay: 2,
            simItemsPerDay: 2,
            microLessonsPerDay: 1,
          },
      periodStart: now.toISOString(),
      periodEnd: end.toISOString(),
      provider: 'edge',
    });
  } catch (error) {
    console.error('[entitlement-check] error', error);
    return jsonResponse({
      error: 'entitlement_check_failed',
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

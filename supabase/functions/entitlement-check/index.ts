import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { adminSelect, adminUpsert } from '../_shared/supabase-admin.ts';

interface SubscriptionRow {
  plan_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'inactive' | 'pending';
  provider: 'stripe' | 'alipay';
  current_period_end: string | null;
}

interface EntitlementRow {
  user_id: string;
  plan: 'free' | 'pro';
  quota: {
    aiAdvancedFeedbackPerDay: number;
    simItemsPerDay: number;
    microLessonsPerDay: number;
  };
  period_start: string;
  period_end: string;
}

const getQuota = (plan: 'free' | 'pro') =>
  plan === 'pro'
    ? {
        aiAdvancedFeedbackPerDay: 30,
        simItemsPerDay: 20,
        microLessonsPerDay: 20,
      }
    : {
        aiAdvancedFeedbackPerDay: 2,
        simItemsPerDay: 2,
        microLessonsPerDay: 1,
      };

const toPlan = (planId: string): 'free' | 'pro' => (planId.startsWith('pro') ? 'pro' : 'free');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await requireAuthenticatedUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const userId = auth.userId;

    const subscriptions = await adminSelect<SubscriptionRow>('subscriptions', {
      select: 'plan_id,status,provider,current_period_end',
      eq: { user_id: userId },
      order: { column: 'updated_at', ascending: false },
      limit: 1,
    });

    const latestSub = subscriptions[0] || null;
    const activePlan = latestSub && (latestSub.status === 'active' || latestSub.status === 'trialing')
      ? toPlan(latestSub.plan_id)
      : 'free';

    const now = new Date();
    const periodEnd = latestSub?.current_period_end || (() => {
      const d = new Date(now);
      d.setMonth(d.getMonth() + 1);
      return d.toISOString();
    })();

    const periodStart = now.toISOString();
    const quota = getQuota(activePlan);

    try {
      await adminUpsert<EntitlementRow>(
        'user_entitlements',
        {
          user_id: userId,
          plan: activePlan,
          quota,
          period_start: periodStart,
          period_end: periodEnd,
          updated_at: now.toISOString(),
        },
        'user_id',
      );
    } catch {
      // Keep response path even if entitlements table isn't available.
    }

    return jsonResponse({
      userId,
      plan: activePlan,
      quota,
      periodStart,
      periodEnd,
      provider: 'edge',
      subscription: {
        plan: activePlan,
        status: latestSub?.status || 'inactive',
        currentPeriodEnd: latestSub?.current_period_end || null,
        provider: latestSub?.provider || 'manual',
      },
    });
  } catch (error) {
    console.error('[entitlement-check] error', error);
    return jsonResponse(
      {
        error: 'entitlement_check_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

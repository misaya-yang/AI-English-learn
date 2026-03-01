import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminInsert, adminUpsert } from '../_shared/supabase-admin.ts';

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

const verifyAlipaySignature = async (payload: Record<string, unknown>): Promise<boolean> => {
  const publicKey = Deno.env.get('ALIPAY_PUBLIC_KEY');

  // Skeleton mode: when keys are not configured, accept sandbox callbacks.
  if (!publicKey) {
    return true;
  }

  // TODO: replace with full RSA2 verification for production use.
  return typeof payload.sign === 'string' && payload.sign.length > 0;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const verified = await verifyAlipaySignature(payload);

    if (!verified) {
      return jsonResponse({ error: 'invalid_signature' }, 400);
    }

    const userId = typeof payload.user_id === 'string' ? payload.user_id : '';
    const orderId = typeof payload.out_trade_no === 'string' ? payload.out_trade_no : `alipay_${Date.now()}`;
    const planId = payload.plan_id === 'pro_yearly' ? 'pro_yearly' : 'pro_monthly';
    const tradeStatus = typeof payload.trade_status === 'string' ? payload.trade_status : 'TRADE_SUCCESS';

    const status =
      tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED'
        ? 'active'
        : tradeStatus === 'TRADE_CLOSED'
          ? 'canceled'
          : 'pending';

    if (userId) {
      await adminUpsert(
        'subscriptions',
        {
          user_id: userId,
          provider: 'alipay',
          provider_subscription_id: orderId,
          plan_id: planId,
          status,
          metadata: {
            trade_status: tradeStatus,
          },
          updated_at: new Date().toISOString(),
        },
        'provider,provider_subscription_id',
      );

      const plan = status === 'active' ? 'pro' : 'free';
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await adminUpsert(
        'user_entitlements',
        {
          user_id: userId,
          plan,
          quota: getQuota(plan),
          period_start: now.toISOString(),
          period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        },
        'user_id',
      );
    }

    try {
      await adminInsert('billing_events', {
        user_id: userId || null,
        provider: 'alipay',
        event_type: `alipay.${tradeStatus.toLowerCase()}`,
        provider_event_id: String(payload.notify_id || orderId),
        payload,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (eventError) {
      const detail = eventError instanceof Error ? eventError.message : String(eventError);
      if (!detail.includes('23505')) {
        throw eventError;
      }
    }

    return jsonResponse({ ok: true, status });
  } catch (error) {
    console.error('[billing-webhook-alipay] error', error);
    return jsonResponse(
      {
        error: 'alipay_webhook_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

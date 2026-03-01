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

const toHex = (buffer: ArrayBuffer): string =>
  [...new Uint8Array(buffer)].map((item) => item.toString(16).padStart(2, '0')).join('');

const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

const verifyStripeSignature = async (payload: string, header: string | null): Promise<boolean> => {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret) {
    return true;
  }

  if (!header) return false;

  const sections = header.split(',').map((part) => part.trim());
  const timestamp = sections.find((part) => part.startsWith('t='))?.slice(2);
  const signature = sections.find((part) => part.startsWith('v1='))?.slice(3);

  if (!timestamp || !signature) return false;

  const signingPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingPayload));
  const expected = toHex(digest);
  return safeEqual(expected, signature);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    const verified = await verifyStripeSignature(rawBody, signature);
    if (!verified) {
      return jsonResponse({ error: 'invalid_signature' }, 400);
    }

    const event = JSON.parse(rawBody) as {
      id: string;
      type: string;
      data?: { object?: Record<string, unknown> };
    };

    const object = event.data?.object || {};
    const metadata = (object.metadata || {}) as Record<string, unknown>;
    const userId =
      (typeof metadata.user_id === 'string' ? metadata.user_id : '') ||
      (typeof object.client_reference_id === 'string' ? object.client_reference_id : '');

    const planId =
      (typeof metadata.plan_id === 'string' ? metadata.plan_id : '') ||
      (typeof object.plan?.id === 'string' ? (object.plan as { id: string }).id : '') ||
      'pro_monthly';

    const statusRaw = typeof object.status === 'string' ? object.status : 'active';
    const status =
      statusRaw === 'trialing' ||
      statusRaw === 'active' ||
      statusRaw === 'past_due' ||
      statusRaw === 'canceled' ||
      statusRaw === 'unpaid'
        ? statusRaw
        : 'active';

    const providerSubscriptionId =
      (typeof object.subscription === 'string' ? object.subscription : '') ||
      (typeof object.id === 'string' ? object.id : event.id);

    if (userId) {
      await adminUpsert(
        'subscriptions',
        {
          user_id: userId,
          provider: 'stripe',
          provider_subscription_id: providerSubscriptionId,
          plan_id: planId,
          status,
          current_period_start:
            typeof object.current_period_start === 'number'
              ? new Date((object.current_period_start as number) * 1000).toISOString()
              : null,
          current_period_end:
            typeof object.current_period_end === 'number'
              ? new Date((object.current_period_end as number) * 1000).toISOString()
              : null,
          cancel_at_period_end: Boolean(object.cancel_at_period_end),
          metadata: {
            eventType: event.type,
            stripeEventId: event.id,
          },
          updated_at: new Date().toISOString(),
        },
        'provider,provider_subscription_id',
      );

      const plan = planId.startsWith('pro') && status !== 'canceled' ? 'pro' : 'free';
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
        provider: 'stripe',
        event_type: event.type,
        provider_event_id: event.id,
        payload: event,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (eventError) {
      const detail = eventError instanceof Error ? eventError.message : String(eventError);
      if (!detail.includes('23505')) {
        throw eventError;
      }
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('[billing-webhook-stripe] error', error);
    return jsonResponse(
      {
        error: 'stripe_webhook_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { adminInsert, adminUpsert } from '../_shared/supabase-admin.ts';

interface CheckoutBody {
  planId?: 'pro_monthly' | 'pro_yearly';
  provider?: 'stripe' | 'alipay';
  successUrl?: string;
  cancelUrl?: string;
}

const nowIso = () => new Date().toISOString();

const expiresIso = (minutes = 30) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
};

const stripePriceByPlan = (planId: string): string | null => {
  if (planId === 'pro_yearly') {
    return Deno.env.get('STRIPE_PRICE_PRO_YEARLY') || null;
  }

  return Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') || null;
};

const buildUrlWithParams = (
  base: string,
  params: Record<string, string>,
): string => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};

const createStripeCheckout = async (args: {
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ checkoutUrl: string; providerOrderId: string }> => {
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const priceId = stripePriceByPlan(args.planId);

  if (!stripeSecret || !priceId) {
    return {
      checkoutUrl: buildUrlWithParams(args.successUrl, {
        provider: 'stripe',
        mock: '1',
      }),
      providerOrderId: `stripe_mock_${Date.now()}`,
    };
  }

  const form = new URLSearchParams();
  form.set('mode', 'subscription');
  form.set('success_url', args.successUrl);
  form.set('cancel_url', args.cancelUrl);
  form.set('line_items[0][price]', priceId);
  form.set('line_items[0][quantity]', '1');
  form.set('client_reference_id', args.userId);
  form.set('metadata[user_id]', args.userId);
  form.set('metadata[plan_id]', args.planId);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`stripe_checkout_failed ${response.status} ${detail}`);
  }

  const payload = await response.json();
  return {
    checkoutUrl: String(payload.url),
    providerOrderId: String(payload.id),
  };
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
    const body = (await req.json().catch(() => ({}))) as CheckoutBody;
    const userId = auth.userId;
    const provider = body.provider === 'alipay' ? 'alipay' : 'stripe';
    const planId = body.planId === 'pro_yearly' ? 'pro_yearly' : 'pro_monthly';

    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:5173';
    const successUrl = body.successUrl || `${appBaseUrl}/pricing?checkout=success`;
    const cancelUrl = body.cancelUrl || `${appBaseUrl}/pricing?checkout=canceled`;

    let checkoutUrl = buildUrlWithParams(successUrl, {
      provider,
      mock: '1',
    });
    let providerOrderId = `${provider}_mock_${Date.now()}`;

    if (provider === 'stripe') {
      const stripe = await createStripeCheckout({
        userId,
        planId,
        successUrl,
        cancelUrl,
      });
      checkoutUrl = stripe.checkoutUrl;
      providerOrderId = stripe.providerOrderId;
    }

    if (provider === 'alipay') {
      const appId = Deno.env.get('ALIPAY_APP_ID') || 'sandbox';
      providerOrderId = `alipay_${Date.now()}`;
      checkoutUrl = buildUrlWithParams(successUrl, {
        provider: 'alipay',
        app_id: appId,
        order_id: providerOrderId,
      });
    }

    const createdAt = nowIso();
    await adminUpsert(
      'subscriptions',
      {
        user_id: userId,
        provider,
        provider_subscription_id: providerOrderId,
        plan_id: planId,
        status: 'pending',
        metadata: {
          source: 'billing-create-checkout',
          checkout_url: checkoutUrl,
        },
        updated_at: createdAt,
      },
      'provider,provider_subscription_id',
    );

    await adminInsert('billing_events', {
      user_id: userId,
      provider,
      event_type: 'checkout.created',
      provider_event_id: providerOrderId,
      payload: {
        planId,
        successUrl,
        cancelUrl,
        checkoutUrl,
      },
      created_at: createdAt,
    });

    return jsonResponse({
      provider,
      checkoutUrl,
      orderId: providerOrderId,
      expiresAt: expiresIso(30),
    });
  } catch (error) {
    console.error('[billing-create-checkout] error', error);
    return jsonResponse(
      {
        error: 'billing_checkout_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

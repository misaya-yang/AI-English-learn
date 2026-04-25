/**
 * Frontend-side derivation of "is paid checkout actually available?".
 *
 * Background: the backend `billing-create-checkout` Edge Function fails closed
 * with a 503 when STRIPE_SECRET_KEY / STRIPE_PRICE_PRO_* are missing, and the
 * Alipay path is explicitly throw-then-fail-closed because no real provider
 * code exists yet. The frontend has no way to interrogate the server's secret
 * store without making an authenticated call, so we mirror the same fail-closed
 * decision in the UI: render the paid plans as "not yet available" unless the
 * deploy explicitly opts in via VITE_BILLING_ENABLED.
 *
 * Setting VITE_BILLING_ENABLED=true is a deploy-time signal that BOTH:
 *   1. The Edge Function has its provider secrets, and
 *   2. The product / billing review has happened.
 *
 * It does NOT, by itself, grant any entitlements — those still come from the
 * server. Flipping this flag only changes which CTA the marketing page renders.
 *
 * Today, in the env shipped by this repo, neither secret is configured and the
 * flag is unset, so this returns false everywhere. That is the desired state.
 */
type EnvLike = {
  VITE_BILLING_ENABLED?: string | boolean | undefined;
};

const TRUTHY = new Set(['true', '1', 'yes', 'on']);

export function isCheckoutAvailable(env: EnvLike = readEnv()): boolean {
  const raw = env.VITE_BILLING_ENABLED;
  if (raw === undefined || raw === null) return false;
  if (typeof raw === 'boolean') return raw;
  return TRUTHY.has(String(raw).trim().toLowerCase());
}

function readEnv(): EnvLike {
  // Vite injects `import.meta.env`; in a non-Vite test runner this object may
  // still be defined (vitest provides it), but we guard anyway so the helper
  // remains import-safe in any environment.
  const meta = (import.meta as unknown as { env?: EnvLike }).env;
  return meta || {};
}

/**
 * Human-readable status for the marketing surface. Returns a discriminated
 * union so the caller can render the right copy without reading env again.
 */
export type CheckoutStatus =
  | { kind: 'available' }
  | { kind: 'coming_soon'; supportEmail: string };

export function getCheckoutStatus(env: EnvLike = readEnv()): CheckoutStatus {
  if (isCheckoutAvailable(env)) {
    return { kind: 'available' };
  }
  return { kind: 'coming_soon', supportEmail: 'support@vocabdaily.ai' };
}

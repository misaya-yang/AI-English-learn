// Source-text guard tests for the billing Edge Functions.
//
// The functions live in `supabase/functions/...` and run under Deno, so they
// can't be imported directly into the Vitest (jsdom + Node) runtime. Instead
// we read the source files and assert that known fail-open patterns stay out
// of the codebase. This is a regression sentinel — if someone re-introduces
// the old behaviour the test fails immediately.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '..', '..');
const readFn = (relPath: string) => readFileSync(resolve(repoRoot, relPath), 'utf8');

describe('billing-webhook-stripe fail-closed', () => {
  const source = readFn('supabase/functions/billing-webhook-stripe/index.ts');

  it('does not return true when STRIPE_WEBHOOK_SECRET is missing', () => {
    expect(source).not.toMatch(/if \(!secret\)\s*{\s*return true;?\s*}/);
  });

  it('returns a missing_secret signal so the handler can 503', () => {
    expect(source).toMatch(/missing_secret/);
  });

  it('responds 503 when the webhook secret is unconfigured', () => {
    expect(source).toMatch(/webhook_not_configured/);
  });
});

describe('billing-create-checkout fail-closed', () => {
  const source = readFn('supabase/functions/billing-create-checkout/index.ts');

  it('does not synthesize a mock success URL when Stripe is unconfigured', () => {
    expect(source).not.toMatch(/stripe_mock_/);
    expect(source).not.toMatch(/`alipay_\$\{Date\.now\(\)\}`/);
  });

  it('throws BillingNotConfiguredError when provider env is absent', () => {
    expect(source).toMatch(/class BillingNotConfiguredError/);
    expect(source).toMatch(/throw new BillingNotConfiguredError\('stripe'/);
    expect(source).toMatch(/throw new BillingNotConfiguredError\(\s*'alipay'/);
  });

  it('responds 503 with billing_provider_not_configured when unconfigured', () => {
    expect(source).toMatch(/billing_provider_not_configured/);
    expect(source).toMatch(/503/);
  });
});

describe('billing RLS migration', () => {
  const source = readFn('supabase/migrations/20260424120000_billing_fail_closed_rls.sql');

  it('drops client write policies on billing tables', () => {
    expect(source).toMatch(/DROP POLICY IF EXISTS "Users can insert own billing customers"/);
    expect(source).toMatch(/DROP POLICY IF EXISTS "Users can insert own subscriptions"/);
    expect(source).toMatch(/DROP POLICY IF EXISTS "Users can update own subscriptions"/);
    expect(source).toMatch(/DROP POLICY IF EXISTS "Users can upsert own entitlements"/);
  });

  it('grants service_role explicit ALL policies on billing tables', () => {
    expect(source).toMatch(/Service role can manage billing customers/);
    expect(source).toMatch(/Service role can manage subscriptions/);
    expect(source).toMatch(/Service role can manage entitlements/);
  });
});

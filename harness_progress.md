# VocabDaily Harness Progress

A running ledger of each Ralph loop iteration. Newest entries at the bottom.
Each entry uses the format defined in `CLAUDE_CODE_RALPH_PROMPT.md` step 8.

---

## 2026-04-24 20:55 - P0-OPS-1..4 (Billing fail-closed + prod env guard)

- Changed:
  - `supabase/functions/billing-webhook-stripe/index.ts`: replaced fail-open
    Stripe signature verification with a `StripeSignatureResult` discriminated
    union. Missing `STRIPE_WEBHOOK_SECRET` now returns 503
    (`webhook_not_configured`); bad signatures still return 400.
  - `supabase/functions/billing-create-checkout/index.ts`: introduced
    `BillingNotConfiguredError`. Stripe checkout throws when
    `STRIPE_SECRET_KEY` or `STRIPE_PRICE_PRO_*` is missing instead of
    synthesising a `?mock=1` success URL. Alipay path also throws (not yet
    implemented). Handler maps these to HTTP 503
    (`billing_provider_not_configured`).
  - New migration `supabase/migrations/20260424120000_billing_fail_closed_rls.sql`:
    drops client INSERT/UPDATE policies on `billing_customers`,
    `subscriptions`, and `user_entitlements` (the worst was a `FOR ALL`
    on `user_entitlements` that let a logged-in user flip their own plan to
    `pro` from the client). Adds explicit `service_role` ALL policies so
    Edge Functions keep working.
  - `src/lib/supabase.ts`: extracted `resolveSupabaseEnv()`. In production
    (`import.meta.env.PROD === true` or `MODE === 'production'`), missing
    `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` throws an explicit error
    rather than silently falling through to the dev project credentials.
    Whitespace-only values are treated as missing.
  - New `src/lib/supabase.test.ts`: 6 cases covering dev fallback, prod
    success, prod missing-each-var, and whitespace handling.
  - New `src/lib/billingFailClosed.test.ts`: 9 source-text guard tests that
    fail if anyone reverts the webhook fail-open, the mock-success
    fallback, or the RLS migration's drops.

- Verified:
  - `npx vitest run src/lib/supabase.test.ts src/lib/billingFailClosed.test.ts`
    → 15/15 passed.
  - `npm test` → 25 files, 315 tests, all green.
  - `npm run build` → tsc + vite build clean (only the pre-existing 500 kB
    chunk-size warning remains).

- Deploy:
  - Vercel auto-deploy will pick up the frontend changes (`src/lib/supabase.ts`)
    on push to `main`.
  - Supabase pieces are NOT deployed by Vercel and need separate commands:
    * `supabase functions deploy billing-webhook-stripe`
    * `supabase functions deploy billing-create-checkout`
    * `supabase db push` (applies the new RLS migration)
  - Required Supabase secrets to set BEFORE redeploying functions or the
    webhook will start returning 503:
    * `STRIPE_WEBHOOK_SECRET`
    * `STRIPE_SECRET_KEY`
    * `STRIPE_PRICE_PRO_MONTHLY`
    * `STRIPE_PRICE_PRO_YEARLY`
  - Required Vercel env on the production project:
    * `VITE_SUPABASE_URL`
    * `VITE_SUPABASE_ANON_KEY`
    (If either is missing the SPA bundle will throw at module load — by
    design.)

- Risks:
  - Until the four Stripe secrets are wired up in Supabase, the production
    webhook will return 503 and checkout will return 503
    (`billing_provider_not_configured`). This is the intended fail-closed
    state but should be coordinated with whoever owns Stripe config.
  - The `user_entitlements` `FOR ALL` policy was the only path a non-
    service caller had to mutate plan state. Need to confirm the Edge
    Functions / `_shared/supabase-admin.ts` use the service role — quick
    grep shows they do (`adminUpsert` in webhook + checkout).
  - Alipay is now hard-disabled (returns 503). UI should hide the option
    until backend is implemented; tracked as a follow-up.

- Next:
  - P0 AI Coach #5: introduce shared `COACHING_POLICY` used by both
    `src/features/chat/runtime/requestPayload.ts` and
    `supabase/functions/ai-chat/index.ts`.
  - Then P0 AI Coach #6: reconcile `weakTags` ↔ `weaknessTags` so
    `learningContext` always sends the canonical name.

-- Billing Fail-Closed RLS
-- =======================
-- Closes a self-upgrade-to-pro vector: prior policies let an authenticated user
-- INSERT/UPDATE rows in subscriptions, billing_customers, and user_entitlements
-- as long as `auth.uid() = user_id`. That means a user could flip their own
-- entitlement to `pro` from the client without any payment.
--
-- After this migration:
--   * Clients can only SELECT their own rows on these tables.
--   * Only the service role (used by Edge Functions verifying webhooks /
--     creating checkout sessions) can INSERT or UPDATE.
--
-- The Stripe webhook (`billing-webhook-stripe`) and checkout function
-- (`billing-create-checkout`) already use the service role via
-- `_shared/supabase-admin.ts`, so this is the right side to enforce writes.

-- ── billing_customers ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can insert own billing customers" ON billing_customers;

DROP POLICY IF EXISTS "Service role can manage billing customers" ON billing_customers;
CREATE POLICY "Service role can manage billing customers" ON billing_customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── subscriptions ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── user_entitlements ──────────────────────────────────────────────────────
-- The previous "FOR ALL" policy was the worst offender — clients could write
-- the plan column directly. Replace with read-only-for-self + service-role
-- write.
DROP POLICY IF EXISTS "Users can upsert own entitlements" ON user_entitlements;

DROP POLICY IF EXISTS "Service role can manage entitlements" ON user_entitlements;
CREATE POLICY "Service role can manage entitlements" ON user_entitlements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

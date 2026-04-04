-- RLS Audit Gap Closure
-- =====================
-- Fixes identified by security audit:
-- 1. content_validation_reports: RLS enabled but NO policies
-- 2. content_review_queue: RLS enabled but NO policies
-- 3. billing_events: missing INSERT policy for service-role webhook writes

-- ── content_validation_reports ──────────────────────────────────────────────
-- Users may read validation reports for their own content generation jobs.
-- Insert/update restricted to service role (Edge Functions).

DROP POLICY IF EXISTS "Users can view own validation reports" ON content_validation_reports;
CREATE POLICY "Users can view own validation reports" ON content_validation_reports
  FOR SELECT
  USING (
    auth.uid() = (
      SELECT created_by FROM content_generation_jobs WHERE id = job_id
    )
  );

-- Service role can insert validation reports (via ai-validate-content Edge Function)
DROP POLICY IF EXISTS "Service role can manage validation reports" ON content_validation_reports;
CREATE POLICY "Service role can manage validation reports" ON content_validation_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── content_review_queue ────────────────────────────────────────────────────
-- Users may read review queue items for their own content generation jobs.
-- Insert/update restricted to service role.

DROP POLICY IF EXISTS "Users can view own review queue items" ON content_review_queue;
CREATE POLICY "Users can view own review queue items" ON content_review_queue
  FOR SELECT
  USING (
    auth.uid() = (
      SELECT created_by FROM content_generation_jobs WHERE id = job_id
    )
  );

DROP POLICY IF EXISTS "Service role can manage review queue" ON content_review_queue;
CREATE POLICY "Service role can manage review queue" ON content_review_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── billing_events ──────────────────────────────────────────────────────────
-- Webhook Edge Functions insert billing events via service role.

DROP POLICY IF EXISTS "Service role can insert billing events" ON billing_events;
CREATE POLICY "Service role can insert billing events" ON billing_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ── content_generation_jobs ─────────────────────────────────────────────────
-- Service role needs to update job status (running, validated, published, failed)

DROP POLICY IF EXISTS "Service role can manage content generation jobs" ON content_generation_jobs;
CREATE POLICY "Service role can manage content generation jobs" ON content_generation_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 15. LEARNING EVENTS + MISSIONS + BILLING FOUNDATION
-- ============================================

CREATE TABLE IF NOT EXISTS user_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  level TEXT NOT NULL DEFAULT 'B1' CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  target TEXT NOT NULL DEFAULT 'general_improvement',
  tracks JSONB NOT NULL DEFAULT '["daily_communication"]',
  daily_minutes INTEGER NOT NULL DEFAULT 20,
  language_preference TEXT NOT NULL DEFAULT 'bilingual' CHECK (language_preference IN ('en', 'zh', 'bilingual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_missions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  estimated_minutes INTEGER NOT NULL DEFAULT 20,
  tasks JSONB NOT NULL DEFAULT '[]',
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_date)
);

CREATE TABLE IF NOT EXISTS learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  event_source TEXT NOT NULL DEFAULT 'web',
  session_id UUID,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'validated', 'published', 'failed')),
  request_json JSONB NOT NULL DEFAULT '{}',
  output_json JSONB,
  validation_report_json JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_validation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES content_generation_jobs(id) ON DELETE CASCADE,
  validator TEXT NOT NULL DEFAULT 'ai-validate-content',
  is_valid BOOLEAN NOT NULL DEFAULT FALSE,
  issues JSONB NOT NULL DEFAULT '[]',
  confidence DECIMAL(4,3) NOT NULL DEFAULT 0.500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES content_generation_jobs(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'retry', 'ignored', 'resolved')),
  snapshot_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'alipay')),
  provider_customer_id TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_customer_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'alipay')),
  provider_subscription_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'inactive', 'pending')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_subscription_id)
);

CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'alipay')),
  event_type TEXT NOT NULL,
  provider_event_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_event_id)
);

ALTER TABLE user_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_validation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own learning profile" ON user_learning_profiles;
CREATE POLICY "Users can view own learning profile" ON user_learning_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own learning profile" ON user_learning_profiles;
CREATE POLICY "Users can upsert own learning profile" ON user_learning_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own missions" ON learning_missions;
CREATE POLICY "Users can view own missions" ON learning_missions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own missions" ON learning_missions;
CREATE POLICY "Users can manage own missions" ON learning_missions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own learning events" ON learning_events;
CREATE POLICY "Users can view own learning events" ON learning_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own learning events" ON learning_events;
CREATE POLICY "Users can insert own learning events" ON learning_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own content generation jobs" ON content_generation_jobs;
CREATE POLICY "Users can view own content generation jobs" ON content_generation_jobs
  FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert own content generation jobs" ON content_generation_jobs;
CREATE POLICY "Users can insert own content generation jobs" ON content_generation_jobs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can view own billing customers" ON billing_customers;
CREATE POLICY "Users can view own billing customers" ON billing_customers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own billing customers" ON billing_customers;
CREATE POLICY "Users can insert own billing customers" ON billing_customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own billing events" ON billing_events;
CREATE POLICY "Users can view own billing events" ON billing_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_learning_events_user_created ON learning_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_name_created ON learning_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_missions_user_date ON learning_missions(user_id, mission_date DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_events_user_created ON billing_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_generation_jobs_status ON content_generation_jobs(status, created_at DESC);

DROP TRIGGER IF EXISTS update_user_learning_profiles_updated_at ON user_learning_profiles;
CREATE TRIGGER update_user_learning_profiles_updated_at
  BEFORE UPDATE ON user_learning_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_missions_updated_at ON learning_missions;
CREATE TRIGGER update_learning_missions_updated_at
  BEFORE UPDATE ON learning_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_generation_jobs_updated_at ON content_generation_jobs;
CREATE TRIGGER update_content_generation_jobs_updated_at
  BEFORE UPDATE ON content_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_review_queue_updated_at ON content_review_queue;
CREATE TRIGGER update_content_review_queue_updated_at
  BEFORE UPDATE ON content_review_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_customers_updated_at ON billing_customers;
CREATE TRIGGER update_billing_customers_updated_at
  BEFORE UPDATE ON billing_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

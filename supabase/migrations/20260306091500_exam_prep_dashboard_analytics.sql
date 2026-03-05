-- 18. EXAM PREP DASHBOARD ANALYTICS FOUNDATION
-- =============================================

CREATE TABLE IF NOT EXISTS user_exam_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL DEFAULT 'IELTS' CHECK (exam_type IN ('IELTS', 'TOEFL')),
  track_id TEXT NOT NULL,
  target_band NUMERIC(2,1) NOT NULL,
  current_band_estimate NUMERIC(2,1),
  completion_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  weak_tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

CREATE TABLE IF NOT EXISTS error_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL CHECK (skill IN ('writing', 'speaking', 'reading', 'listening')),
  criterion TEXT NOT NULL,
  tag TEXT NOT NULL,
  weight NUMERIC(5,2) NOT NULL,
  sample_sentence TEXT,
  source_attempt_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('task1', 'task2')),
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}',
  issues JSONB NOT NULL DEFAULT '[]',
  latency_ms INTEGER,
  provider TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_exam_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own exam track progress" ON user_exam_tracks;
CREATE POLICY "Users can read own exam track progress" ON user_exam_tracks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own exam track progress" ON user_exam_tracks;
CREATE POLICY "Users can manage own exam track progress" ON user_exam_tracks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own error analytics" ON error_analytics;
CREATE POLICY "Users can read own error analytics" ON error_analytics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own error analytics" ON error_analytics;
CREATE POLICY "Users can insert own error analytics" ON error_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own simulation history" ON simulation_history;
CREATE POLICY "Users can read own simulation history" ON simulation_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own simulation history" ON simulation_history;
CREATE POLICY "Users can insert own simulation history" ON simulation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own simulation history" ON simulation_history;
CREATE POLICY "Users can delete own simulation history" ON simulation_history
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_exam_tracks_user_updated ON user_exam_tracks(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_analytics_user_created ON error_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_analytics_user_tag ON error_analytics(user_id, tag, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_history_user_created ON simulation_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_history_track_task ON simulation_history(user_id, track_id, task_type, created_at DESC);

DROP TRIGGER IF EXISTS update_user_exam_tracks_updated_at ON user_exam_tracks;
CREATE TRIGGER update_user_exam_tracks_updated_at
  BEFORE UPDATE ON user_exam_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

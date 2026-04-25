-- Learning Loop Durability
-- ========================
-- Promotes mistakeCollector and coachReviewQueue from localStorage-only to
-- Supabase-backed tables synced via the offline-first syncQueue. IDs are
-- generated client-side (mistakeCollector: random; coachReviewQueue: FNV-1a
-- of the source action) so upserts stay idempotent across replay.

CREATE TABLE IF NOT EXISTS user_mistakes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('practice', 'pronunciation', 'roleplay', 'manual')),
  word TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  review_count INTEGER NOT NULL DEFAULT 0,
  eliminated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_mistakes_user_idx ON user_mistakes (user_id, created_at DESC);

ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mistakes" ON user_mistakes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can write own mistakes" ON user_mistakes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_mistakes_updated_at ON user_mistakes;
CREATE TRIGGER update_user_mistakes_updated_at
  BEFORE UPDATE ON user_mistakes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS coach_review_queue (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  user_input_ref TEXT,
  skill TEXT NOT NULL,
  target_word TEXT,
  prompt TEXT NOT NULL,
  due_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source_action JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coach_review_queue_user_due_idx
  ON coach_review_queue (user_id, due_at)
  WHERE completed_at IS NULL;

ALTER TABLE coach_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coach reviews" ON coach_review_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can write own coach reviews" ON coach_review_queue
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_coach_review_queue_updated_at ON coach_review_queue;
CREATE TRIGGER update_coach_review_queue_updated_at
  BEFORE UPDATE ON coach_review_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

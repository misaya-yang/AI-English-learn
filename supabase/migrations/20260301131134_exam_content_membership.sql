-- 12. EXAM CONTENT & MEMBERSHIP (IELTS-first)
-- ============================================

CREATE TABLE IF NOT EXISTS content_tracks (
  id TEXT PRIMARY KEY,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('IELTS', 'TOEFL')),
  skill TEXT NOT NULL CHECK (skill IN ('writing', 'speaking', 'reading', 'listening')),
  band_target TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  license TEXT NOT NULL,
  attribution TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_units (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL REFERENCES content_tracks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  learning_objectives JSONB NOT NULL DEFAULT '[]',
  item_ids TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL,
  license TEXT NOT NULL,
  attribution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_rubrics (
  id TEXT PRIMARY KEY,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('IELTS', 'TOEFL')),
  skill TEXT NOT NULL CHECK (skill IN ('writing', 'speaking', 'reading', 'listening')),
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '[]',
  source TEXT NOT NULL,
  license TEXT NOT NULL,
  attribution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES content_units(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('IELTS', 'TOEFL')),
  skill TEXT NOT NULL CHECK (skill IN ('writing', 'speaking', 'reading', 'listening')),
  item_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  reference_answer TEXT,
  rubric_id TEXT REFERENCES exam_rubrics(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  license TEXT NOT NULL,
  attribution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT REFERENCES content_items(id) ON DELETE SET NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('IELTS', 'TOEFL')),
  skill TEXT NOT NULL CHECK (skill IN ('writing', 'speaking', 'reading', 'listening')),
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_feedback_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_id TEXT NOT NULL,
  scores JSONB NOT NULL,
  issues JSONB NOT NULL DEFAULT '[]',
  rewrites JSONB NOT NULL DEFAULT '[]',
  next_actions JSONB NOT NULL DEFAULT '[]',
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.50,
  provider TEXT NOT NULL DEFAULT 'edge' CHECK (provider IN ('edge', 'fallback')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, attempt_id)
);

CREATE TABLE IF NOT EXISTS user_entitlements (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  quota JSONB NOT NULL DEFAULT '{"aiAdvancedFeedbackPerDay":2,"simItemsPerDay":2,"microLessonsPerDay":1}',
  period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE content_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Content tracks are publicly readable" ON content_tracks;
CREATE POLICY "Content tracks are publicly readable" ON content_tracks
  FOR SELECT TO PUBLIC USING (TRUE);

DROP POLICY IF EXISTS "Content units are publicly readable" ON content_units;
CREATE POLICY "Content units are publicly readable" ON content_units
  FOR SELECT TO PUBLIC USING (TRUE);

DROP POLICY IF EXISTS "Rubrics are publicly readable" ON exam_rubrics;
CREATE POLICY "Rubrics are publicly readable" ON exam_rubrics
  FOR SELECT TO PUBLIC USING (TRUE);

DROP POLICY IF EXISTS "Content items are publicly readable" ON content_items;
CREATE POLICY "Content items are publicly readable" ON content_items
  FOR SELECT TO PUBLIC USING (TRUE);

DROP POLICY IF EXISTS "Users can view own item attempts" ON item_attempts;
CREATE POLICY "Users can view own item attempts" ON item_attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own item attempts" ON item_attempts;
CREATE POLICY "Users can insert own item attempts" ON item_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own feedback records" ON ai_feedback_records;
CREATE POLICY "Users can view own feedback records" ON ai_feedback_records
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback records" ON ai_feedback_records;
CREATE POLICY "Users can insert own feedback records" ON ai_feedback_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own entitlements" ON user_entitlements;
CREATE POLICY "Users can view own entitlements" ON user_entitlements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own entitlements" ON user_entitlements;
CREATE POLICY "Users can upsert own entitlements" ON user_entitlements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_content_tracks_exam_skill ON content_tracks(exam_type, skill);
CREATE INDEX IF NOT EXISTS idx_content_units_track_id ON content_units(track_id);
CREATE INDEX IF NOT EXISTS idx_content_items_unit_id ON content_items(unit_id);
CREATE INDEX IF NOT EXISTS idx_item_attempts_user_id ON item_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_item_attempts_created_at ON item_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_records_user_id ON ai_feedback_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_records_created_at ON ai_feedback_records(created_at DESC);

DROP TRIGGER IF EXISTS update_content_tracks_updated_at ON content_tracks;
CREATE TRIGGER update_content_tracks_updated_at
  BEFORE UPDATE ON content_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_units_updated_at ON content_units;
CREATE TRIGGER update_content_units_updated_at
  BEFORE UPDATE ON content_units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_rubrics_updated_at ON exam_rubrics;
CREATE TRIGGER update_exam_rubrics_updated_at
  BEFORE UPDATE ON exam_rubrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_entitlements_updated_at ON user_entitlements;
CREATE TRIGGER update_user_entitlements_updated_at
  BEFORE UPDATE ON user_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

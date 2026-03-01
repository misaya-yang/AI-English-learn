-- 13. CHAT QUIZ + EXPERIMENT EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS chat_quiz_items (
  id TEXT PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Quick Quiz',
  stem TEXT NOT NULL,
  options JSONB NOT NULL,
  answer_key_hash TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  skills JSONB NOT NULL DEFAULT '[]',
  question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  estimated_seconds INTEGER NOT NULL DEFAULT 45,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id TEXT NOT NULL REFERENCES chat_quiz_items(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  source_mode TEXT NOT NULL DEFAULT 'study' CHECK (source_mode IN ('chat', 'study', 'quiz', 'canvas')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_experiment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  event_payload_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chat_quiz_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_experiment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quiz items" ON chat_quiz_items;
CREATE POLICY "Users can view own quiz items" ON chat_quiz_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz items" ON chat_quiz_items;
CREATE POLICY "Users can insert own quiz items" ON chat_quiz_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own quiz attempts" ON chat_quiz_attempts;
CREATE POLICY "Users can view own quiz attempts" ON chat_quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON chat_quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts" ON chat_quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own chat experiment events" ON chat_experiment_events;
CREATE POLICY "Users can view own chat experiment events" ON chat_experiment_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat experiment events" ON chat_experiment_events;
CREATE POLICY "Users can insert own chat experiment events" ON chat_experiment_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_quiz_items_user_created ON chat_quiz_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_quiz_items_session ON chat_quiz_items(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_quiz_attempts_user_created ON chat_quiz_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_quiz_attempts_quiz ON chat_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_chat_experiment_events_user_created ON chat_experiment_events(user_id, created_at DESC);

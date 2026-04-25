-- LEARN-02 — Path progress event log
-- ===================================
-- Strict, typed event log written by Today / Practice / Review whenever the
-- learner crosses an evidence boundary (review_completed, practice_correct,
-- practice_wrong, mistake_resolved, session_started, session_ended). The
-- table is named `path_progress_events` to coexist with the existing
-- analytics-style `learning_events` writes (which use free `event_name`
-- strings). Mirrors the user_mistakes pattern: TEXT id (client-generated),
-- RLS by auth.uid().

CREATE TABLE IF NOT EXISTS path_progress_events (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN (
    'review_completed',
    'practice_correct',
    'practice_wrong',
    'mistake_resolved',
    'session_started',
    'session_ended'
  )),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS path_progress_events_user_kind_idx
  ON path_progress_events (user_id, kind);

CREATE INDEX IF NOT EXISTS path_progress_events_user_created_idx
  ON path_progress_events (user_id, created_at DESC);

ALTER TABLE path_progress_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own path progress events" ON path_progress_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can write own path progress events" ON path_progress_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

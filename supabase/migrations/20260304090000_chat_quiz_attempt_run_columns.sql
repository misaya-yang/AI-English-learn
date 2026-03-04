-- Chat quiz attempts: run metadata for continuous quiz recovery and latency analytics.

ALTER TABLE IF EXISTS chat_quiz_attempts
  ADD COLUMN IF NOT EXISTS run_id UUID,
  ADD COLUMN IF NOT EXISTS question_index INTEGER;

CREATE INDEX IF NOT EXISTS idx_chat_quiz_attempts_run_question
  ON chat_quiz_attempts(run_id, question_index);

CREATE INDEX IF NOT EXISTS idx_chat_quiz_attempts_session_question
  ON chat_quiz_attempts(session_id, question_index);

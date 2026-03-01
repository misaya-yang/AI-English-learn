-- 14. HOTFIX: remove user_id FKs for chat quiz/event tables
-- Reason: some environments do not maintain a strict public.users mirror,
-- while chat/auth uses auth.uid()-based identity only.

ALTER TABLE IF EXISTS chat_quiz_items
  DROP CONSTRAINT IF EXISTS chat_quiz_items_user_id_fkey;

ALTER TABLE IF EXISTS chat_quiz_attempts
  DROP CONSTRAINT IF EXISTS chat_quiz_attempts_user_id_fkey;

ALTER TABLE IF EXISTS chat_experiment_events
  DROP CONSTRAINT IF EXISTS chat_experiment_events_user_id_fkey;

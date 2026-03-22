-- Unify FSRS progress sync with local text-based word ids and review logs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.user_word_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  word_id UUID REFERENCES public.words(id) ON DELETE SET NULL,
  word_ref TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  review_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,
  interval INTEGER NOT NULL DEFAULT 0,
  next_review_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  first_learned_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  stability DOUBLE PRECISION,
  difficulty DOUBLE PRECISION,
  retrievability DOUBLE PRECISION,
  lapses INTEGER NOT NULL DEFAULT 0,
  srs_state TEXT CHECK (srs_state IN ('new', 'learning', 'review', 'relearning')),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_word_progress
  ADD COLUMN IF NOT EXISTS word_ref TEXT,
  ADD COLUMN IF NOT EXISTS stability DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS difficulty DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS retrievability DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lapses INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS srs_state TEXT,
  ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_word_progress'
      AND column_name = 'word_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.user_word_progress ALTER COLUMN word_id DROP NOT NULL;
  END IF;
END $$;

UPDATE public.user_word_progress
SET
  word_ref = COALESCE(word_ref, word_id::TEXT),
  due_at = COALESCE(due_at, next_review_at),
  srs_state = COALESCE(srs_state, CASE WHEN status = 'learning' THEN 'learning' ELSE 'review' END),
  lapses = COALESCE(lapses, 0)
WHERE word_ref IS NULL
   OR due_at IS NULL
   OR srs_state IS NULL;

ALTER TABLE public.user_word_progress
  ALTER COLUMN word_ref SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_word_progress_user_id_word_ref_key'
  ) THEN
    ALTER TABLE public.user_word_progress
      ADD CONSTRAINT user_word_progress_user_id_word_ref_key UNIQUE (user_id, word_ref);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_due_at
  ON public.user_word_progress(user_id, due_at ASC NULLS FIRST);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_status_due
  ON public.user_word_progress(user_id, status, due_at ASC NULLS FIRST);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_word_ref
  ON public.user_word_progress(word_ref);

ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_word_progress;
CREATE POLICY "Users can view own progress" ON public.user_word_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_word_progress;
CREATE POLICY "Users can insert own progress" ON public.user_word_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_word_progress;
CREATE POLICY "Users can update own progress" ON public.user_word_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own progress" ON public.user_word_progress;
CREATE POLICY "Users can delete own progress" ON public.user_word_progress
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_word_progress_updated_at ON public.user_word_progress;
CREATE TRIGGER update_user_word_progress_updated_at
  BEFORE UPDATE ON public.user_word_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  word_ref TEXT NOT NULL,
  word_id UUID REFERENCES public.words(id) ON DELETE SET NULL,
  rated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  duration_ms INTEGER,
  pre_stability DOUBLE PRECISION NOT NULL DEFAULT 0,
  post_stability DOUBLE PRECISION NOT NULL DEFAULT 0,
  pre_difficulty DOUBLE PRECISION NOT NULL DEFAULT 0,
  post_difficulty DOUBLE PRECISION NOT NULL DEFAULT 0,
  scheduled_days INTEGER NOT NULL DEFAULT 0,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_logs_user_rated
  ON public.review_logs(user_id, rated_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_word_rated
  ON public.review_logs(user_id, word_ref, rated_at DESC);

ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own review logs" ON public.review_logs;
CREATE POLICY "Users can view own review logs" ON public.review_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own review logs" ON public.review_logs;
CREATE POLICY "Users can insert own review logs" ON public.review_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own review logs" ON public.review_logs;
CREATE POLICY "Users can update own review logs" ON public.review_logs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own review logs" ON public.review_logs;
CREATE POLICY "Users can delete own review logs" ON public.review_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.review_log_daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  word_ref TEXT NOT NULL,
  summary_date DATE NOT NULL,
  review_count INTEGER NOT NULL DEFAULT 0,
  again_count INTEGER NOT NULL DEFAULT 0,
  hard_count INTEGER NOT NULL DEFAULT 0,
  good_count INTEGER NOT NULL DEFAULT 0,
  easy_count INTEGER NOT NULL DEFAULT 0,
  avg_pre_stability DOUBLE PRECISION,
  avg_post_stability DOUBLE PRECISION,
  avg_pre_difficulty DOUBLE PRECISION,
  avg_post_difficulty DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, word_ref, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_review_log_daily_summaries_user_date
  ON public.review_log_daily_summaries(user_id, summary_date DESC);

ALTER TABLE public.review_log_daily_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own review log summaries" ON public.review_log_daily_summaries;
CREATE POLICY "Users can view own review log summaries" ON public.review_log_daily_summaries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own review log summaries" ON public.review_log_daily_summaries;
CREATE POLICY "Users can manage own review log summaries" ON public.review_log_daily_summaries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_review_log_daily_summaries_updated_at ON public.review_log_daily_summaries;
CREATE TRIGGER update_review_log_daily_summaries_updated_at
  BEFORE UPDATE ON public.review_log_daily_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.rollup_review_logs(p_retention_days INTEGER DEFAULT 180)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff TIMESTAMPTZ := NOW() - make_interval(days => GREATEST(p_retention_days, 1));
  deleted_count INTEGER := 0;
BEGIN
  INSERT INTO public.review_log_daily_summaries (
    user_id,
    word_ref,
    summary_date,
    review_count,
    again_count,
    hard_count,
    good_count,
    easy_count,
    avg_pre_stability,
    avg_post_stability,
    avg_pre_difficulty,
    avg_post_difficulty
  )
  SELECT
    user_id,
    word_ref,
    rated_at::DATE AS summary_date,
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE rating = 'again')::INTEGER,
    COUNT(*) FILTER (WHERE rating = 'hard')::INTEGER,
    COUNT(*) FILTER (WHERE rating = 'good')::INTEGER,
    COUNT(*) FILTER (WHERE rating = 'easy')::INTEGER,
    AVG(pre_stability),
    AVG(post_stability),
    AVG(pre_difficulty),
    AVG(post_difficulty)
  FROM public.review_logs
  WHERE rated_at < cutoff
  GROUP BY user_id, word_ref, rated_at::DATE
  ON CONFLICT (user_id, word_ref, summary_date) DO UPDATE SET
    review_count = EXCLUDED.review_count,
    again_count = EXCLUDED.again_count,
    hard_count = EXCLUDED.hard_count,
    good_count = EXCLUDED.good_count,
    easy_count = EXCLUDED.easy_count,
    avg_pre_stability = EXCLUDED.avg_pre_stability,
    avg_post_stability = EXCLUDED.avg_post_stability,
    avg_pre_difficulty = EXCLUDED.avg_pre_difficulty,
    avg_post_difficulty = EXCLUDED.avg_post_difficulty,
    updated_at = NOW();

  DELETE FROM public.review_logs
  WHERE rated_at < cutoff;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

DROP FUNCTION IF EXISTS public.get_due_words(UUID);
CREATE OR REPLACE FUNCTION public.get_due_words(p_user_id UUID)
RETURNS TABLE (
  progress_id UUID,
  word_id UUID,
  word_ref TEXT,
  word TEXT,
  phonetic TEXT,
  definition TEXT,
  definition_zh TEXT,
  status TEXT,
  review_count INTEGER,
  stability DOUBLE PRECISION,
  due_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    uwp.id AS progress_id,
    uwp.word_id,
    uwp.word_ref,
    w.word,
    w.phonetic,
    w.definition,
    w.definition_zh,
    uwp.status,
    uwp.review_count,
    uwp.stability,
    COALESCE(uwp.due_at, uwp.next_review_at) AS due_at,
    uwp.next_review_at
  FROM public.user_word_progress AS uwp
  LEFT JOIN public.words AS w ON w.id = uwp.word_id
  WHERE uwp.user_id = p_user_id
    AND uwp.status IN ('learning', 'review')
    AND COALESCE(uwp.due_at, uwp.next_review_at, NOW()) <= NOW()
  ORDER BY COALESCE(uwp.due_at, uwp.next_review_at) ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

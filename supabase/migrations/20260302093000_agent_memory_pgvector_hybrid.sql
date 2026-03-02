-- Agent memory pgvector + hybrid retrieval upgrade

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE agent_memory_items
  ADD COLUMN IF NOT EXISTS embedding vector(384),
  ADD COLUMN IF NOT EXISTS embedding_model TEXT,
  ADD COLUMN IF NOT EXISTS salience REAL NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS last_recalled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recall_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agent_memory_items_visibility_check'
      AND conrelid = 'agent_memory_items'::regclass
  ) THEN
    ALTER TABLE agent_memory_items
      ADD CONSTRAINT agent_memory_items_visibility_check
      CHECK (visibility IN ('private', 'session', 'public'));
  END IF;
END $$;

ALTER TABLE agent_memory_items
  ADD COLUMN IF NOT EXISTS content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', COALESCE(content, ''))) STORED;

CREATE TABLE IF NOT EXISTS agent_memory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  memory_id UUID REFERENCES agent_memory_items(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('write', 'read', 'reinforce', 'delete', 'pin', 'forget', 'expire_clear')),
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE agent_memory_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own memory events" ON agent_memory_events;
CREATE POLICY "Users can view own memory events" ON agent_memory_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own memory events" ON agent_memory_events;
CREATE POLICY "Users can insert own memory events" ON agent_memory_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_agent_memory_embedding_hnsw
  ON agent_memory_items USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agent_memory_content_tsv
  ON agent_memory_items USING gin (content_tsv);

CREATE INDEX IF NOT EXISTS idx_agent_memory_user_kind_updated
  ON agent_memory_items(user_id, kind, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_memory_events_user_created
  ON agent_memory_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_memory_events_type_created
  ON agent_memory_events(event_type, created_at DESC);

CREATE OR REPLACE FUNCTION match_agent_memory(
  p_user_id UUID,
  p_query_embedding vector(384),
  p_top_k INTEGER DEFAULT 24,
  p_min_sim REAL DEFAULT 0.24,
  p_kind_filter TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  session_id UUID,
  kind TEXT,
  content TEXT,
  tags TEXT[],
  confidence DECIMAL,
  source_ref JSONB,
  dedupe_key TEXT,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  salience REAL,
  is_pinned BOOLEAN,
  visibility TEXT,
  recall_count INTEGER,
  cosine_similarity REAL,
  pedagogical_relevance REAL,
  hybrid_score REAL
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  WITH candidates AS (
    SELECT
      am.id,
      am.user_id,
      am.session_id,
      am.kind,
      am.content,
      am.tags,
      am.confidence,
      am.source_ref,
      am.dedupe_key,
      am.expires_at,
      am.updated_at,
      am.salience,
      am.is_pinned,
      am.visibility,
      am.recall_count,
      (1 - (am.embedding <=> p_query_embedding))::REAL AS cosine_similarity,
      (
        CASE am.kind
          WHEN 'goal' THEN 1.0
          WHEN 'profile' THEN 0.98
          WHEN 'weakness_tag' THEN 0.95
          WHEN 'preference' THEN 0.86
          WHEN 'tool_fact' THEN 0.78
          WHEN 'error_trace' THEN 0.72
          ELSE 0.65
        END
      )::REAL AS pedagogical_relevance,
      EXP(-GREATEST(0, EXTRACT(EPOCH FROM (NOW() - am.updated_at))) / 86400 / 30)::REAL AS recency_decay
    FROM agent_memory_items am
    WHERE am.user_id = p_user_id
      AND am.embedding IS NOT NULL
      AND p_query_embedding IS NOT NULL
      AND (am.expires_at IS NULL OR am.expires_at > NOW())
      AND (p_kind_filter IS NULL OR am.kind = ANY(p_kind_filter))
  )
  SELECT
    c.id,
    c.user_id,
    c.session_id,
    c.kind,
    c.content,
    c.tags,
    c.confidence,
    c.source_ref,
    c.dedupe_key,
    c.expires_at,
    c.updated_at,
    c.salience,
    c.is_pinned,
    c.visibility,
    c.recall_count,
    c.cosine_similarity,
    c.pedagogical_relevance,
    (
      0.55 * c.cosine_similarity +
      0.20 * c.recency_decay +
      0.15 * COALESCE(c.confidence::REAL, 0.7) +
      0.10 * c.pedagogical_relevance
    )::REAL AS hybrid_score
  FROM candidates c
  WHERE c.cosine_similarity >= COALESCE(p_min_sim, 0.24)
     OR c.is_pinned = true
  ORDER BY hybrid_score DESC, c.updated_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_top_k, 24), 1), 64);
$$;

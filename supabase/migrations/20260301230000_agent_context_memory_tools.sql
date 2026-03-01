-- Agent context + memory + tool auditing foundation

CREATE TABLE IF NOT EXISTS agent_memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  kind TEXT NOT NULL CHECK (kind IN ('profile', 'preference', 'weakness_tag', 'goal', 'error_trace', 'tool_fact')),
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  confidence DECIMAL(4,3) NOT NULL DEFAULT 0.700,
  source_ref JSONB NOT NULL DEFAULT '{}',
  dedupe_key TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, dedupe_key)
);

CREATE TABLE IF NOT EXISTS agent_context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  summary TEXT NOT NULL,
  compacted_from_count INTEGER NOT NULL DEFAULT 0,
  source_pointers JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_tool_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  tool TEXT NOT NULL,
  run_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped', 'rate_limited')),
  latency_ms INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  request_payload JSONB NOT NULL DEFAULT '{}',
  response_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_web_sources (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  tool_run_id UUID REFERENCES agent_tool_runs(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  domain TEXT,
  title TEXT,
  snippet TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confidence DECIMAL(4,3) NOT NULL DEFAULT 0.600,
  raw JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS agent_search_quotas (
  user_id UUID PRIMARY KEY,
  window_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('minute', NOW()),
  requests_in_window INTEGER NOT NULL DEFAULT 0,
  max_per_minute INTEGER NOT NULL DEFAULT 8,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE agent_memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_web_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_search_quotas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own agent memory" ON agent_memory_items;
CREATE POLICY "Users can view own agent memory" ON agent_memory_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own agent memory" ON agent_memory_items;
CREATE POLICY "Users can insert own agent memory" ON agent_memory_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own agent memory" ON agent_memory_items;
CREATE POLICY "Users can update own agent memory" ON agent_memory_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own context snapshots" ON agent_context_snapshots;
CREATE POLICY "Users can view own context snapshots" ON agent_context_snapshots
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own context snapshots" ON agent_context_snapshots;
CREATE POLICY "Users can insert own context snapshots" ON agent_context_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own tool runs" ON agent_tool_runs;
CREATE POLICY "Users can view own tool runs" ON agent_tool_runs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tool runs" ON agent_tool_runs;
CREATE POLICY "Users can insert own tool runs" ON agent_tool_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own web sources" ON agent_web_sources;
CREATE POLICY "Users can view own web sources" ON agent_web_sources
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own web sources" ON agent_web_sources;
CREATE POLICY "Users can insert own web sources" ON agent_web_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own search quotas" ON agent_search_quotas;
CREATE POLICY "Users can view own search quotas" ON agent_search_quotas
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own search quotas" ON agent_search_quotas;
CREATE POLICY "Users can insert own search quotas" ON agent_search_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own search quotas" ON agent_search_quotas;
CREATE POLICY "Users can update own search quotas" ON agent_search_quotas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_agent_memory_user_updated ON agent_memory_items(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_kind ON agent_memory_items(user_id, kind, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_context_snapshots_user_created ON agent_context_snapshots(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tool_runs_user_created ON agent_tool_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_web_sources_user_retrieved ON agent_web_sources(user_id, retrieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_web_sources_url ON agent_web_sources(url);

DROP TRIGGER IF EXISTS update_agent_memory_items_updated_at ON agent_memory_items;
CREATE TRIGGER update_agent_memory_items_updated_at
  BEFORE UPDATE ON agent_memory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_search_quotas_updated_at ON agent_search_quotas;
CREATE TRIGGER update_agent_search_quotas_updated_at
  BEFORE UPDATE ON agent_search_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

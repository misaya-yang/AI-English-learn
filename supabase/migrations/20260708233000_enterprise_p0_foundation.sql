-- Enterprise P0 Foundation
-- ========================
-- Additive schema for the first enterprise spine:
-- organizations, cohorts, assignments, canonical skill attempts,
-- remediation, audit events, and organization entitlements.
--
-- This migration does not modify existing personal learning tables. Personal
-- rows remain keyed by user_id, while organization-scoped rows require active
-- organization membership. Sensitive commercial writes are service-role-only.

-- ── Organization core ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'teacher', 'learner')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'teacher', 'learner')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, email)
);

CREATE TABLE IF NOT EXISTS organization_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  seat_count INTEGER NOT NULL DEFAULT 0 CHECK (seat_count >= 0),
  assigned_count INTEGER NOT NULL DEFAULT 0 CHECK (assigned_count >= 0),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('billing', 'manual', 'trial', 'system')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, source)
);

-- ── Cohorts and assignments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('teacher', 'learner')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  due_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  content_ref_type TEXT NOT NULL,
  content_ref_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Commercial controls and audit ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_user_id UUID,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_entitlement_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN (
    'organization',
    'cohorts',
    'assignments',
    'evidence_reports',
    'content_packs',
    'seats',
    'audit',
    'billing',
    'sso',
    'scim'
  )),
  active BOOLEAN NOT NULL DEFAULT FALSE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('billing', 'manual', 'trial', 'system')),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(org_id, feature, source)
);

CREATE TABLE IF NOT EXISTS org_usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  limit_count INTEGER CHECK (limit_count IS NULL OR limit_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, feature, period_start, period_end)
);

-- ── Canonical learning evidence ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  scope TEXT NOT NULL DEFAULT 'personal' CHECK (scope IN ('personal', 'org')),
  surface TEXT NOT NULL CHECK (surface IN (
    'today',
    'review',
    'practice',
    'coach',
    'reading',
    'listening',
    'writing',
    'pronunciation',
    'grammar',
    'exam',
    'vocabulary'
  )),
  skill TEXT NOT NULL CHECK (skill IN (
    'vocabulary',
    'reading',
    'listening',
    'speaking',
    'writing',
    'grammar',
    'exam_strategy'
  )),
  subskill TEXT,
  content_ref_type TEXT NOT NULL,
  content_ref_id TEXT NOT NULL,
  prompt_ref TEXT,
  response_ref TEXT,
  score NUMERIC,
  max_score NUMERIC,
  accuracy NUMERIC CHECK (accuracy IS NULL OR (accuracy >= 0 AND accuracy <= 1)),
  duration_ms INTEGER NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
  rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  mistake_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  source TEXT NOT NULL DEFAULT 'user_action' CHECK (source IN (
    'user_action',
    'assignment',
    'coach',
    'import',
    'system_generated'
  )),
  ai_provider TEXT,
  ai_model TEXT,
  fallback_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK ((scope = 'personal' AND org_id IS NULL) OR (scope = 'org' AND org_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS skill_mistakes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  attempt_id TEXT REFERENCES skill_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  skill TEXT NOT NULL CHECK (skill IN (
    'vocabulary',
    'reading',
    'listening',
    'speaking',
    'writing',
    'grammar',
    'exam_strategy'
  )),
  subskill TEXT,
  tag TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  evidence_excerpt TEXT,
  content_ref_type TEXT NOT NULL,
  content_ref_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_remediations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  mistake_id TEXT REFERENCES skill_mistakes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'scheduled', 'completed', 'dismissed')),
  target_surface TEXT NOT NULL CHECK (target_surface IN (
    'today',
    'review',
    'practice',
    'coach',
    'reading',
    'listening',
    'writing',
    'pronunciation'
  )),
  skill TEXT NOT NULL CHECK (skill IN (
    'vocabulary',
    'reading',
    'listening',
    'speaking',
    'writing',
    'grammar',
    'exam_strategy'
  )),
  subskill TEXT,
  content_ref_type TEXT NOT NULL,
  content_ref_id TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  due_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL DEFAULT 'system' CHECK (created_by IN ('system', 'coach', 'teacher')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Tenant helper functions ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE org_id = target_org_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION has_org_role(target_org_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE org_id = target_org_id
      AND user_id = auth.uid()
      AND status = 'active'
      AND role = ANY(allowed_roles)
  );
$$;

CREATE OR REPLACE FUNCTION can_access_cohort(target_cohort_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM cohorts c
    WHERE c.id = target_cohort_id
      AND (
        has_org_role(c.org_id, ARRAY['owner', 'admin'])
        OR EXISTS (
          SELECT 1
          FROM cohort_members cm
          WHERE cm.cohort_id = target_cohort_id
            AND cm.user_id = auth.uid()
            AND cm.status = 'active'
        )
      )
  );
$$;

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS organization_members_user_idx
  ON organization_members(user_id, status);

CREATE INDEX IF NOT EXISTS organization_members_org_role_idx
  ON organization_members(org_id, role, status);

CREATE INDEX IF NOT EXISTS cohorts_org_idx
  ON cohorts(org_id, status);

CREATE INDEX IF NOT EXISTS cohort_members_user_idx
  ON cohort_members(user_id, status);

CREATE INDEX IF NOT EXISTS assignments_org_status_idx
  ON assignments(org_id, status, due_at);

CREATE INDEX IF NOT EXISTS assignment_items_assignment_idx
  ON assignment_items(assignment_id, position);

CREATE INDEX IF NOT EXISTS org_audit_events_org_created_idx
  ON org_audit_events(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS org_entitlement_grants_org_feature_idx
  ON org_entitlement_grants(org_id, feature, active);

CREATE INDEX IF NOT EXISTS org_usage_counters_org_feature_period_idx
  ON org_usage_counters(org_id, feature, period_start, period_end);

CREATE INDEX IF NOT EXISTS skill_attempts_user_created_idx
  ON skill_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS skill_attempts_org_skill_created_idx
  ON skill_attempts(org_id, skill, created_at DESC);

CREATE INDEX IF NOT EXISTS skill_mistakes_user_created_idx
  ON skill_mistakes(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS learning_remediations_user_status_due_idx
  ON learning_remediations(user_id, status, due_at);

CREATE INDEX IF NOT EXISTS learning_remediations_org_status_due_idx
  ON learning_remediations(org_id, status, due_at);

-- ── RLS enablement ─────────────────────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_remediations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_entitlement_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_usage_counters ENABLE ROW LEVEL SECURITY;

-- ── Organization policies ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Org members can view organizations" ON organizations;
CREATE POLICY "Org members can view organizations" ON organizations
  FOR SELECT
  USING (is_org_member(id));

DROP POLICY IF EXISTS "Service role can manage organizations" ON organizations;
CREATE POLICY "Service role can manage organizations" ON organizations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Org members can view organization members" ON organization_members;
CREATE POLICY "Org members can view organization members" ON organization_members
  FOR SELECT
  USING (auth.uid() = user_id OR is_org_member(org_id));

DROP POLICY IF EXISTS "Service role can manage organization members" ON organization_members;
CREATE POLICY "Service role can manage organization members" ON organization_members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Org admins can view invites" ON organization_invites;
CREATE POLICY "Org admins can view invites" ON organization_invites
  FOR SELECT
  USING (has_org_role(org_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Service role can manage organization invites" ON organization_invites;
CREATE POLICY "Service role can manage organization invites" ON organization_invites
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Org admins can view seats" ON organization_seats;
CREATE POLICY "Org admins can view seats" ON organization_seats
  FOR SELECT
  USING (has_org_role(org_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Service role can manage organization seats" ON organization_seats;
CREATE POLICY "Service role can manage organization seats" ON organization_seats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Cohort and assignment policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "Org members can view cohorts" ON cohorts;
CREATE POLICY "Org members can view cohorts" ON cohorts
  FOR SELECT
  USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Org admins can manage cohorts" ON cohorts;
CREATE POLICY "Org admins can manage cohorts" ON cohorts
  FOR ALL
  USING (has_org_role(org_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(org_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Org members can view cohort members" ON cohort_members;
CREATE POLICY "Org members can view cohort members" ON cohort_members
  FOR SELECT
  USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Org admins can manage cohort members" ON cohort_members;
CREATE POLICY "Org admins can manage cohort members" ON cohort_members
  FOR ALL
  USING (has_org_role(org_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(org_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Org members can view assignments" ON assignments;
CREATE POLICY "Org members can view assignments" ON assignments
  FOR SELECT
  USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Teachers can manage assignments" ON assignments;
CREATE POLICY "Teachers can manage assignments" ON assignments
  FOR ALL
  USING (has_org_role(org_id, ARRAY['owner', 'admin', 'teacher']))
  WITH CHECK (has_org_role(org_id, ARRAY['owner', 'admin', 'teacher']));

DROP POLICY IF EXISTS "Org members can view assignment items" ON assignment_items;
CREATE POLICY "Org members can view assignment items" ON assignment_items
  FOR SELECT
  USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Teachers can manage assignment items" ON assignment_items;
CREATE POLICY "Teachers can manage assignment items" ON assignment_items
  FOR ALL
  USING (has_org_role(org_id, ARRAY['owner', 'admin', 'teacher']))
  WITH CHECK (has_org_role(org_id, ARRAY['owner', 'admin', 'teacher']));

-- ── Audit and entitlement policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "Org admins can view org audit events" ON org_audit_events;
CREATE POLICY "Org admins can view org audit events" ON org_audit_events
  FOR SELECT
  USING (has_org_role(org_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Service role can manage org audit events" ON org_audit_events;
CREATE POLICY "Service role can manage org audit events" ON org_audit_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Org admins can view org entitlement grants" ON org_entitlement_grants;
CREATE POLICY "Org admins can view org entitlement grants" ON org_entitlement_grants
  FOR SELECT
  USING (has_org_role(org_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Service role can manage org entitlement grants" ON org_entitlement_grants;
CREATE POLICY "Service role can manage org entitlement grants" ON org_entitlement_grants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Org admins can view org usage counters" ON org_usage_counters;
CREATE POLICY "Org admins can view org usage counters" ON org_usage_counters
  FOR SELECT
  USING (has_org_role(org_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Service role can manage org usage counters" ON org_usage_counters;
CREATE POLICY "Service role can manage org usage counters" ON org_usage_counters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Skill attempt policies ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own personal skill attempts" ON skill_attempts;
CREATE POLICY "Users can manage own personal skill attempts" ON skill_attempts
  FOR ALL
  USING (
    org_id IS NULL
    AND auth.uid() = user_id
  )
  WITH CHECK (
    org_id IS NULL
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Org members can view org skill attempts" ON skill_attempts;
CREATE POLICY "Org members can view org skill attempts" ON skill_attempts
  FOR SELECT
  USING (org_id IS NOT NULL AND is_org_member(org_id));

DROP POLICY IF EXISTS "Users can insert own org skill attempts" ON skill_attempts;
CREATE POLICY "Users can insert own org skill attempts" ON skill_attempts
  FOR INSERT
  WITH CHECK (org_id IS NOT NULL AND auth.uid() = user_id AND is_org_member(org_id));

DROP POLICY IF EXISTS "Users can update own org skill attempts" ON skill_attempts;
CREATE POLICY "Users can update own org skill attempts" ON skill_attempts
  FOR UPDATE
  USING (org_id IS NOT NULL AND auth.uid() = user_id AND is_org_member(org_id))
  WITH CHECK (org_id IS NOT NULL AND auth.uid() = user_id AND is_org_member(org_id));

DROP POLICY IF EXISTS "Service role can manage skill attempts" ON skill_attempts;
CREATE POLICY "Service role can manage skill attempts" ON skill_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Mistake and remediation policies ───────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own personal skill mistakes" ON skill_mistakes;
CREATE POLICY "Users can manage own personal skill mistakes" ON skill_mistakes
  FOR ALL
  USING (
    org_id IS NULL
    AND auth.uid() = user_id
  )
  WITH CHECK (
    org_id IS NULL
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Org members can view org skill mistakes" ON skill_mistakes;
CREATE POLICY "Org members can view org skill mistakes" ON skill_mistakes
  FOR SELECT
  USING (org_id IS NOT NULL AND is_org_member(org_id));

DROP POLICY IF EXISTS "Users can insert own org skill mistakes" ON skill_mistakes;
CREATE POLICY "Users can insert own org skill mistakes" ON skill_mistakes
  FOR INSERT
  WITH CHECK (org_id IS NOT NULL AND auth.uid() = user_id AND is_org_member(org_id));

DROP POLICY IF EXISTS "Service role can manage skill mistakes" ON skill_mistakes;
CREATE POLICY "Service role can manage skill mistakes" ON skill_mistakes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own personal learning remediations" ON learning_remediations;
CREATE POLICY "Users can manage own personal learning remediations" ON learning_remediations
  FOR ALL
  USING (
    org_id IS NULL
    AND auth.uid() = user_id
  )
  WITH CHECK (
    org_id IS NULL
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Org members can view org learning remediations" ON learning_remediations;
CREATE POLICY "Org members can view org learning remediations" ON learning_remediations
  FOR SELECT
  USING (org_id IS NOT NULL AND is_org_member(org_id));

DROP POLICY IF EXISTS "Users can insert own org learning remediations" ON learning_remediations;
CREATE POLICY "Users can insert own org learning remediations" ON learning_remediations
  FOR INSERT
  WITH CHECK (org_id IS NOT NULL AND auth.uid() = user_id AND is_org_member(org_id));

DROP POLICY IF EXISTS "Users can update own org learning remediations" ON learning_remediations;
CREATE POLICY "Users can update own org learning remediations" ON learning_remediations
  FOR UPDATE
  USING (org_id IS NOT NULL AND auth.uid() = user_id AND is_org_member(org_id))
  WITH CHECK (org_id IS NOT NULL AND auth.uid() = user_id AND is_org_member(org_id));

DROP POLICY IF EXISTS "Service role can manage learning remediations" ON learning_remediations;
CREATE POLICY "Service role can manage learning remediations" ON learning_remediations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

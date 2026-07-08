# Enterprise P0 Database RLS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first enterprise database and RLS foundation for organizations, cohorts, assignments, canonical skill attempts, remediation, and organization entitlements.

**Architecture:** This plan adds one additive Supabase migration plus source-text regression tests. It does not run remote migrations, does not change existing tables, and does not wire UI or Edge Functions yet. The migration creates strict tenant helpers first, then tables, indexes, RLS policies, and service-role-only gates for sensitive writes.

**Tech Stack:** Supabase Postgres SQL migrations, Vitest source-text guard tests, existing fail-closed RLS testing style.

## Global Constraints

- Preserve current public contracts unless a migration explicitly requires a change.
- Prefer additive migrations and adapter layers.
- Keep current route registry as the routing source of truth.
- Do not add dependencies for P0 unless the same result is impractical with current stack.
- Keep personal learning flows working while org scope is introduced.
- Treat billing and entitlements as fail-closed.
- Treat content from imports as untrusted data.
- Do not print or commit secrets.
- This slice must not execute a remote migration or deploy Supabase functions.

---

## File Structure

- Create `supabase/migrations/20260708233000_enterprise_p0_foundation.sql`
  - Defines helper functions: `is_org_member`, `has_org_role`, `can_access_cohort`.
  - Adds organization, membership, cohort, assignment, audit, canonical attempt, mistake, remediation, and org entitlement tables.
  - Enables RLS on all new tables.
  - Allows personal learning rows for the current user.
  - Allows org learning rows only for organization members.
  - Keeps organization entitlement and audit writes service-role-only.

- Create `src/lib/enterpriseP0Rls.test.ts`
  - Reads the migration source and asserts critical table, policy, and fail-closed patterns.
  - Mirrors existing `billingFailClosed.test.ts` style because Deno/Supabase SQL is not imported into Vitest.

---

### Task 1: Save And Verify This Database/RLS Plan

**Files:**
- Create: `docs/superpowers/plans/2026-07-08-enterprise-p0-database-rls.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-08-open-core-enterprise-learning-os-design.md`
- Produces: an execution checklist for the database/RLS slice.

- [x] **Step 1: Write this implementation plan**

Create this file with exact file targets, migration scope, tests, and verification commands.

- [x] **Step 2: Verify the plan has no unresolved markers**

Run:

```bash
node -e "const fs=require('fs');const p='docs/superpowers/plans/2026-07-08-enterprise-p0-database-rls.md';const s=fs.readFileSync(p,'utf8');const bad=['TO'+'DO','T'+'BD','FIX'+'ME','PLACE'+'HOLDER','implement '+'later','fill '+'in'];const hit=bad.find((x)=>s.includes(x));if(hit){console.error(hit);process.exit(1)}"
```

Expected: no output and exit code `0`.

---

### Task 2: Add Source-Text RLS Guard Tests

**Files:**
- Create: `src/lib/enterpriseP0Rls.test.ts`

**Interfaces:**
- Consumes: `supabase/migrations/20260708233000_enterprise_p0_foundation.sql`
- Produces: Vitest regression coverage for enterprise schema/RLS source.

- [x] **Step 1: Write failing source-text tests**

Create `src/lib/enterpriseP0Rls.test.ts` with tests that require:

- core enterprise tables are created,
- RLS is enabled on each new table,
- helper functions exist,
- organization entitlements and audit events have service-role manage policies,
- canonical skill attempt rows allow personal `auth.uid() = user_id` access,
- organization-scoped rows require org membership,
- client writes to org entitlements are absent.

- [x] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- --run src/lib/enterpriseP0Rls.test.ts
```

Expected: FAIL because the migration file does not exist yet.

---

### Task 3: Add Enterprise P0 Foundation Migration

**Files:**
- Create: `supabase/migrations/20260708233000_enterprise_p0_foundation.sql`

**Interfaces:**
- Produces tables:
  - `organizations`
  - `organization_members`
  - `organization_invites`
  - `organization_seats`
  - `cohorts`
  - `cohort_members`
  - `assignments`
  - `assignment_items`
  - `org_audit_events`
  - `skill_attempts`
  - `skill_mistakes`
  - `learning_remediations`
  - `org_entitlement_grants`
  - `org_usage_counters`
- Produces helper functions:
  - `is_org_member(target_org_id UUID)`
  - `has_org_role(target_org_id UUID, allowed_roles TEXT[])`
  - `can_access_cohort(target_cohort_id UUID)`

- [x] **Step 1: Create additive migration**

Add one migration file. Use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, `DROP POLICY IF EXISTS`, and `CREATE POLICY` patterns consistent with existing migrations.

- [x] **Step 2: Keep sensitive writes service-role-only**

For `org_entitlement_grants` and `org_audit_events`, create read policies for allowed org roles and service-role `FOR ALL` policies. Do not create authenticated client insert/update/delete policies for entitlement grants.

- [x] **Step 3: Preserve personal learning access**

For `skill_attempts`, `skill_mistakes`, and `learning_remediations`, allow personal rows where `org_id IS NULL AND auth.uid() = user_id`, and organization rows only where `is_org_member(org_id)` is true.

- [x] **Step 4: Run focused RLS guard test**

Run:

```bash
npm test -- --run src/lib/enterpriseP0Rls.test.ts
```

Expected: PASS.

---

### Task 4: Verify And Commit Database/RLS Slice

**Files:**
- All files from Tasks 1-3.

**Interfaces:**
- Produces a committed database/RLS foundation slice.

- [x] **Step 1: Run focused tests**

Run:

```bash
npm test -- --run src/lib/enterpriseP0Rls.test.ts
```

Expected: PASS.

- [x] **Step 2: Run project checks**

Run:

```bash
npm run lint
npm run check:i18n
npm test -- --run
npm run build
```

Expected: all pass. A Browserslist age warning is acceptable if build exits 0.

- [x] **Step 3: Review staged diff**

Run:

```bash
git diff --check
git status --short
```

Expected: only this plan, the new migration, and the new RLS guard test changed; whitespace check exits 0.

- [x] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-07-08-enterprise-p0-database-rls.md supabase/migrations/20260708233000_enterprise_p0_foundation.sql src/lib/enterpriseP0Rls.test.ts
git commit -m "feat: add enterprise p0 database rls foundation"
```

Expected: commit succeeds on `dev`.

---

## Self-Review

Spec coverage:

- Covers P0 organization tables, cohort/assignment skeleton, canonical attempt persistence tables, remediation tables, org entitlement foundation, and RLS policy direction.
- Does not implement UI, Edge Functions, actual Supabase deployment, or Vocabulary virtualization.

Marker scan:

- This plan intentionally contains no unresolved marker terms.

Type consistency:

- SQL table names match the approved spec and the TypeScript contracts introduced in `src/services/skillAttempts.ts` and `src/services/enterpriseAccess.ts`.

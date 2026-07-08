import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '..', '..');
const migrationPath = 'supabase/migrations/20260708233000_enterprise_p0_foundation.sql';
const readMigration = () => readFileSync(resolve(repoRoot, migrationPath), 'utf8');

describe('enterprise P0 foundation migration', () => {
  const source = readMigration();

  it('creates the enterprise tenant and learning evidence tables', () => {
    [
      'organizations',
      'organization_members',
      'organization_invites',
      'organization_seats',
      'cohorts',
      'cohort_members',
      'assignments',
      'assignment_items',
      'org_audit_events',
      'skill_attempts',
      'skill_mistakes',
      'learning_remediations',
      'org_entitlement_grants',
      'org_usage_counters',
    ].forEach((table) => {
      expect(source).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
    });
  });

  it('enables RLS on every new enterprise table', () => {
    [
      'organizations',
      'organization_members',
      'organization_invites',
      'organization_seats',
      'cohorts',
      'cohort_members',
      'assignments',
      'assignment_items',
      'org_audit_events',
      'skill_attempts',
      'skill_mistakes',
      'learning_remediations',
      'org_entitlement_grants',
      'org_usage_counters',
    ].forEach((table) => {
      expect(source).toMatch(new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
    });
  });

  it('defines tenant helper functions before policies use them', () => {
    expect(source).toMatch(/CREATE OR REPLACE FUNCTION is_org_member\(target_org_id UUID\)/);
    expect(source).toMatch(/CREATE OR REPLACE FUNCTION has_org_role\(target_org_id UUID, allowed_roles TEXT\[\]\)/);
    expect(source).toMatch(/CREATE OR REPLACE FUNCTION can_access_cohort\(target_cohort_id UUID\)/);
  });

  it('keeps org entitlement and audit writes service-role-only', () => {
    expect(source).toMatch(/Service role can manage org entitlement grants/);
    expect(source).toMatch(/Service role can manage org audit events/);
    expect(source).not.toMatch(/Users can insert org entitlement grants/);
    expect(source).not.toMatch(/Users can update org entitlement grants/);
  });

  it('allows personal learning evidence only for the owning user', () => {
    expect(source).toMatch(/Users can manage own personal skill attempts/);
    expect(source).toMatch(/org_id IS NULL\s+AND auth\.uid\(\) = user_id/);
    expect(source).toMatch(/Users can manage own personal learning remediations/);
  });

  it('requires organization membership for org-scoped learning evidence', () => {
    expect(source).toMatch(/Org members can view org skill attempts/);
    expect(source).toMatch(/is_org_member\(org_id\)/);
    expect(source).toMatch(/Org members can view org learning remediations/);
  });
});

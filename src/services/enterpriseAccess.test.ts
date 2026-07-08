import { describe, expect, it } from 'vitest';

import {
  canManageAssignments,
  canManageMembers,
  canViewCohortEvidence,
  hasOrgRole,
  isEnterpriseFeatureEnabled,
  requireEnterpriseFeature,
  type EntitlementGrant,
  type OrganizationMembership,
} from './enterpriseAccess';

const membership = (role: OrganizationMembership['role']): OrganizationMembership => ({
  orgId: 'org-1',
  userId: 'user-1',
  role,
  status: 'active',
});

const grant = (
  feature: EntitlementGrant['feature'],
  active = true,
): EntitlementGrant => ({
  orgId: 'org-1',
  feature,
  active,
  source: 'manual',
  grantedAt: '2026-07-08T00:00:00.000Z',
});

describe('enterprise role helpers', () => {
  it('checks active membership roles only', () => {
    expect(hasOrgRole(membership('owner'), ['owner'])).toBe(true);
    expect(hasOrgRole({ ...membership('owner'), status: 'invited' }, ['owner'])).toBe(false);
    expect(hasOrgRole(null, ['owner'])).toBe(false);
  });

  it('allows owner/admin to manage members and teacher/admin to manage assignments', () => {
    expect(canManageMembers(membership('owner'))).toBe(true);
    expect(canManageMembers(membership('admin'))).toBe(true);
    expect(canManageMembers(membership('teacher'))).toBe(false);
    expect(canManageAssignments(membership('teacher'))).toBe(true);
    expect(canManageAssignments(membership('learner'))).toBe(false);
  });

  it('allows teachers to view cohort evidence but not learners', () => {
    expect(canViewCohortEvidence(membership('teacher'))).toBe(true);
    expect(canViewCohortEvidence(membership('learner'))).toBe(false);
  });
});

describe('enterprise entitlements', () => {
  it('fails closed when a feature has no active grant', () => {
    expect(isEnterpriseFeatureEnabled('assignments', [])).toBe(false);
    expect(isEnterpriseFeatureEnabled('assignments', [grant('assignments', false)])).toBe(false);
  });

  it('allows a feature only with an active matching grant', () => {
    expect(isEnterpriseFeatureEnabled('assignments', [grant('assignments')])).toBe(true);
    expect(isEnterpriseFeatureEnabled('audit', [grant('assignments')])).toBe(false);
  });

  it('returns a readable denial reason for locked features', () => {
    expect(requireEnterpriseFeature('sso', [])).toEqual({
      allowed: false,
      reason: 'missing_entitlement',
      feature: 'sso',
    });
  });
});

export type OrganizationRole = 'owner' | 'admin' | 'teacher' | 'learner';

export type OrganizationMembershipStatus = 'active' | 'invited' | 'suspended' | 'removed';

export type EnterpriseFeature =
  | 'organization'
  | 'cohorts'
  | 'assignments'
  | 'evidence_reports'
  | 'content_packs'
  | 'seats'
  | 'audit'
  | 'billing'
  | 'sso'
  | 'scim';

export interface OrganizationMembership {
  orgId: string;
  userId: string;
  role: OrganizationRole;
  status: OrganizationMembershipStatus;
}

export interface EntitlementGrant {
  orgId: string;
  feature: EnterpriseFeature;
  active: boolean;
  source: 'billing' | 'manual' | 'trial' | 'system';
  grantedAt: string;
  expiresAt?: string;
}

export type EnterpriseAccessDecision =
  | { allowed: true; feature: EnterpriseFeature }
  | { allowed: false; reason: 'missing_entitlement' | 'expired_entitlement'; feature: EnterpriseFeature };

const isActiveMembership = (
  membership: OrganizationMembership | null | undefined,
): membership is OrganizationMembership =>
  Boolean(membership && membership.status === 'active');

export function hasOrgRole(
  membership: OrganizationMembership | null | undefined,
  roles: OrganizationRole[],
): boolean {
  if (!isActiveMembership(membership)) return false;
  return roles.includes(membership.role);
}

export function canManageMembers(
  membership: OrganizationMembership | null | undefined,
): boolean {
  return hasOrgRole(membership, ['owner', 'admin']);
}

export function canManageAssignments(
  membership: OrganizationMembership | null | undefined,
): boolean {
  return hasOrgRole(membership, ['owner', 'admin', 'teacher']);
}

export function canViewCohortEvidence(
  membership: OrganizationMembership | null | undefined,
): boolean {
  return hasOrgRole(membership, ['owner', 'admin', 'teacher']);
}

const grantIsCurrent = (grant: EntitlementGrant, now: Date): boolean => {
  if (!grant.active) return false;
  if (!grant.expiresAt) return true;
  return new Date(grant.expiresAt).getTime() > now.getTime();
};

export function isEnterpriseFeatureEnabled(
  feature: EnterpriseFeature,
  grants: EntitlementGrant[],
  now: Date = new Date(),
): boolean {
  return grants.some((grant) => grant.feature === feature && grantIsCurrent(grant, now));
}

export function requireEnterpriseFeature(
  feature: EnterpriseFeature,
  grants: EntitlementGrant[],
  now: Date = new Date(),
): EnterpriseAccessDecision {
  const matchingGrant = grants.find((grant) => grant.feature === feature);

  if (!matchingGrant) {
    return { allowed: false, reason: 'missing_entitlement', feature };
  }

  if (!grantIsCurrent(matchingGrant, now)) {
    return {
      allowed: false,
      reason: matchingGrant.expiresAt ? 'expired_entitlement' : 'missing_entitlement',
      feature,
    };
  }

  return { allowed: true, feature };
}

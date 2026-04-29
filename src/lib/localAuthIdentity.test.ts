import { describe, expect, it } from 'vitest';

import {
  buildLocalAuthUserId,
  isLocalAuthUserId,
  isUuid,
  LOCAL_AUTH_USER_ID_PREFIX,
} from './localAuthIdentity';

describe('localAuthIdentity', () => {
  it('builds deterministic UUID-shaped IDs for local fallback users', () => {
    const id = buildLocalAuthUserId('demo@example.com');

    expect(id).toBe(buildLocalAuthUserId('DEMO@example.com'));
    expect(id).toMatch(new RegExp(`^${LOCAL_AUTH_USER_ID_PREFIX}[0-9a-f]{12}$`));
    expect(isUuid(id)).toBe(true);
    expect(isLocalAuthUserId(id)).toBe(true);
  });

  it('does not treat legacy local-dev IDs as Supabase-safe IDs', () => {
    expect(isUuid('local-dev-demo-example-com')).toBe(false);
    expect(isLocalAuthUserId('local-dev-demo-example-com')).toBe(false);
  });

  it('keeps different local users distinct', () => {
    expect(buildLocalAuthUserId('demo@example.com')).not.toBe(
      buildLocalAuthUserId('another@example.com'),
    );
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildLocalAuthUserId } from './localAuthIdentity';

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  setSession: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  })),
}));

vi.mock('./supabase', () => ({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  supabase: {
    auth: authMocks,
    from: vi.fn(),
  },
}));

import { getAuthSession, startDemoSession } from './supabase-auth';

describe('demo auth session', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('starts a deterministic local demo user without Supabase auth mutation', async () => {
    const user = startDemoSession();

    expect(user).toMatchObject({
      id: buildLocalAuthUserId('demo@example.com'),
      email: 'demo@example.com',
      displayName: 'Demo Learner',
    });
    expect(localStorage.getItem('vocabdaily-local-auth-user')).toContain('Demo Learner');
    expect(localStorage.getItem('supabase_user')).toContain(user.id);
    expect(localStorage.getItem('supabase_access_token')).toBeNull();
    expect(localStorage.getItem('supabase_refresh_token')).toBeNull();
    expect(authMocks.signUp).not.toHaveBeenCalled();
    expect(authMocks.setSession).not.toHaveBeenCalled();

    const session = await getAuthSession();
    expect(session.data.session?.user).toMatchObject({ id: user.id, email: user.email });
  });
});

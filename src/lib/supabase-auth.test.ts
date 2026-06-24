import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildLocalAuthUserId } from './localAuthIdentity';

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
}));

vi.mock('./supabase', () => ({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_DIRECT_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  supabase: {
    auth: {
      getSession: getSessionMock,
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
    from: vi.fn(),
  },
}));

import { getAuthSession } from './supabase-auth';

const createStorageMock = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
};

describe('supabase-auth local fallback migration', () => {
  let storageMock: Storage;

  beforeEach(() => {
    storageMock = createStorageMock();
    vi.stubGlobal('localStorage', storageMock);
    vi.stubGlobal('window', {
      location: { hostname: 'localhost' },
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    getSessionMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('migrates legacy local auth cache keys to the UUID-shaped user id', async () => {
    const legacyUserId = 'local-dev-demo-example-com';
    const migratedUserId = buildLocalAuthUserId('demo@example.com');

    storageMock.setItem(
      'vocabdaily-local-auth-user',
      JSON.stringify({
        id: legacyUserId,
        email: 'demo@example.com',
        displayName: 'Demo',
        createdAt: '2026-04-29T00:00:00.000Z',
      }),
    );
    storageMock.setItem(
      `vocabdaily-profile-${legacyUserId}`,
      JSON.stringify({
        userId: legacyUserId,
        cefrLevel: 'B1',
        dailyGoal: 10,
        preferredTopics: ['Daily Life'],
        learningStyle: 'visual',
        nativeLanguage: 'zh-CN',
      }),
    );
    storageMock.setItem(
      'vocabdaily_user_learning_profiles',
      JSON.stringify({
        [legacyUserId]: {
          userId: legacyUserId,
          level: 'B1',
          target: 'general_improvement',
          tracks: ['daily_communication'],
          dailyMinutes: 20,
          languagePreference: 'bilingual',
          updatedAt: '2026-04-29T00:00:00.000Z',
        },
      }),
    );
    storageMock.setItem(
      'vocabdaily_learning_missions',
      JSON.stringify({
        [legacyUserId]: [
          {
            id: 'mission_2026-04-29_local-dev',
            userId: legacyUserId,
            date: '2026-04-29',
            status: 'pending',
            estimatedMinutes: 20,
            tasks: [],
            updatedAt: '2026-04-29T00:00:00.000Z',
          },
        ],
      }),
    );
    getSessionMock.mockRejectedValueOnce(new Error('offline'));

    const session = await getAuthSession();

    expect(session.data.session?.user?.id).toBe(migratedUserId);
    expect(JSON.parse(storageMock.getItem('vocabdaily-local-auth-user') || '{}').id).toBe(migratedUserId);
    expect(JSON.parse(storageMock.getItem('supabase_user') || '{}').id).toBe(migratedUserId);

    const profileMap = JSON.parse(storageMock.getItem('vocabdaily_user_learning_profiles') || '{}');
    expect(profileMap[migratedUserId]).toBeDefined();
    expect(profileMap[legacyUserId]).toBeUndefined();

    const missionMap = JSON.parse(storageMock.getItem('vocabdaily_learning_missions') || '{}');
    expect(missionMap[migratedUserId]).toBeDefined();
    expect(missionMap[legacyUserId]).toBeUndefined();

    const migratedProfile = JSON.parse(
      storageMock.getItem(`vocabdaily-profile-${migratedUserId}`) || '{}',
    );
    expect(migratedProfile.userId).toBe(migratedUserId);
  });
});

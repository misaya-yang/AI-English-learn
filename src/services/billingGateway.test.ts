import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  SUBSCRIPTION_PLANS,
  getCurrentSubscription,
  canAccessFeature,
  isPaywalled,
  createCheckoutSession,
  cancelSubscription,
} from './billingGateway';

// ─── localStorage mock ────────────────────────────────────────────────────────

const storage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => { storage[k] = v; },
    removeItem: (k: string) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── SUBSCRIPTION_PLANS ───────────────────────────────────────────────────────

describe('SUBSCRIPTION_PLANS', () => {
  it('contains exactly 3 plans: free, pro, team', () => {
    expect(SUBSCRIPTION_PLANS).toHaveLength(3);
    const ids = SUBSCRIPTION_PLANS.map((p) => p.id);
    expect(ids).toContain('free');
    expect(ids).toContain('pro');
    expect(ids).toContain('team');
  });

  it('free plan limits dailyWords to 10 and aiChats to 5 with no exports', () => {
    const free = SUBSCRIPTION_PLANS.find((p) => p.id === 'free')!;
    expect(free.limits.dailyWords).toBe(10);
    expect(free.limits.aiChats).toBe(5);
    expect(free.limits.exports).toBe(false);
  });

  it('pro and team plans have unlimited words and chats with exports enabled', () => {
    for (const id of ['pro', 'team'] as const) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === id)!;
      expect(plan.limits.dailyWords).toBe(-1);
      expect(plan.limits.aiChats).toBe(-1);
      expect(plan.limits.exports).toBe(true);
    }
  });
});

// ─── getCurrentSubscription ───────────────────────────────────────────────────

describe('getCurrentSubscription', () => {
  it('defaults to free active plan when nothing stored', () => {
    const status = getCurrentSubscription();
    expect(status.planId).toBe('free');
    expect(status.status).toBe('active');
  });

  it('returns stored subscription', () => {
    const stored = { planId: 'pro', status: 'active', currentPeriodEnd: '2026-12-31', cancelAtPeriodEnd: false };
    storage['vocabdaily_subscription_status'] = JSON.stringify(stored);
    expect(getCurrentSubscription().planId).toBe('pro');
  });
});

// ─── canAccessFeature / isPaywalled ──────────────────────────────────────────

describe('canAccessFeature', () => {
  it('free plan cannot access exports', () => {
    expect(canAccessFeature('exports')).toBe(false);
  });

  it('free plan allows up to 10 daily words', () => {
    expect(canAccessFeature('dailyWords', 10)).toBe(true);
    expect(canAccessFeature('dailyWords', 11)).toBe(false);
  });

  it('pro plan allows unlimited words and exports', () => {
    const stored = { planId: 'pro', status: 'active', currentPeriodEnd: '2026-12-31', cancelAtPeriodEnd: false };
    storage['vocabdaily_subscription_status'] = JSON.stringify(stored);
    expect(canAccessFeature('exports')).toBe(true);
    expect(canAccessFeature('dailyWords', 9999)).toBe(true);
  });
});

describe('isPaywalled', () => {
  it('returns true when feature is not accessible on free plan', () => {
    expect(isPaywalled('exports')).toBe(true);
    expect(isPaywalled('aiChats', 6)).toBe(true);
  });

  it('returns false when feature is accessible', () => {
    expect(isPaywalled('dailyWords', 5)).toBe(false);
  });
});

// ─── createCheckoutSession ────────────────────────────────────────────────────

describe('createCheckoutSession', () => {
  it('returns a URL string containing the plan id', async () => {
    const url = await createCheckoutSession('pro');
    expect(typeof url).toBe('string');
    expect(url).toContain('pro');
    expect(url).toMatch(/^https:\/\//);
  });
});

// ─── cancelSubscription ───────────────────────────────────────────────────────

describe('cancelSubscription', () => {
  it('sets cancelAtPeriodEnd to true and status to canceled', async () => {
    const result = await cancelSubscription();
    expect(result.cancelAtPeriodEnd).toBe(true);
    expect(result.status).toBe('canceled');
  });

  it('persists cancellation so subsequent getCurrentSubscription reflects it', async () => {
    await cancelSubscription();
    const status = getCurrentSubscription();
    expect(status.cancelAtPeriodEnd).toBe(true);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PRO_WAITLIST_STORAGE_KEY,
  hasProWaitlistIntent,
  loadProWaitlistIntents,
  saveProWaitlistIntent,
} from './proWaitlist';

describe('proWaitlist', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-13T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores a Pro pricing intent with billing cycle and optional metadata', () => {
    const result = saveProWaitlistIntent({
      billingCycle: 'monthly',
      goal: 'upgrade_from_free',
      userId: 'user-123',
      language: 'en',
    });

    expect(result.status).toBe('created');
    expect(loadProWaitlistIntents()).toEqual([
      expect.objectContaining({
        id: 'pro-monthly-1781337600000',
        planId: 'pro',
        billingCycle: 'monthly',
        source: 'pricing',
        goal: 'upgrade_from_free',
        userId: 'user-123',
        language: 'en',
        createdAt: '2026-06-13T08:00:00.000Z',
      }),
    ]);
    expect(hasProWaitlistIntent('monthly')).toBe(true);
  });

  it('handles duplicate submissions for the same billing cycle gracefully', () => {
    const first = saveProWaitlistIntent({ billingCycle: 'monthly' });
    const second = saveProWaitlistIntent({ billingCycle: 'monthly' });

    expect(first.status).toBe('created');
    expect(second.status).toBe('duplicate');
    expect(loadProWaitlistIntents()).toHaveLength(1);
  });

  it('tracks monthly and yearly interest independently', () => {
    saveProWaitlistIntent({ billingCycle: 'monthly' });
    saveProWaitlistIntent({ billingCycle: 'yearly' });

    const intents = loadProWaitlistIntents();
    expect(intents.map((intent) => intent.billingCycle).sort()).toEqual(['monthly', 'yearly']);
  });

  it('ignores corrupt storage instead of crashing the pricing page', () => {
    localStorage.setItem(PRO_WAITLIST_STORAGE_KEY, '{not-json');

    expect(loadProWaitlistIntents()).toEqual([]);
    expect(saveProWaitlistIntent({ billingCycle: 'monthly' }).status).toBe('created');
  });

  it('returns a failed result when local storage is unavailable', () => {
    const result = saveProWaitlistIntent({ billingCycle: 'monthly' }, null);

    expect(result).toEqual({
      status: 'failed',
      reason: 'storage_unavailable',
      intents: [],
    });
  });
});

import { describe, expect, it } from 'vitest';
import {
  isCheckoutAvailable,
  getCheckoutStatus,
} from './pricingAvailability';

describe('pricingAvailability', () => {
  describe('isCheckoutAvailable', () => {
    it('returns false when no env is provided (current production env)', () => {
      // Mirrors what import.meta.env looks like with neither STRIPE_SECRET_KEY
      // nor VITE_BILLING_ENABLED configured — i.e. the actual deploy today.
      expect(isCheckoutAvailable({})).toBe(false);
    });

    it('returns false when VITE_BILLING_ENABLED is undefined', () => {
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: undefined })).toBe(false);
    });

    it('returns false when VITE_BILLING_ENABLED is the empty string', () => {
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: '' })).toBe(false);
    });

    it('returns false when VITE_BILLING_ENABLED is "false"', () => {
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: 'false' })).toBe(false);
    });

    it('returns false when VITE_BILLING_ENABLED is "0"', () => {
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: '0' })).toBe(false);
    });

    it('returns true only when VITE_BILLING_ENABLED is an explicit truthy string', () => {
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: 'true' })).toBe(true);
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: '1' })).toBe(true);
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: 'yes' })).toBe(true);
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: 'on' })).toBe(true);
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: 'TRUE' })).toBe(true);
    });

    it('accepts boolean true / false directly', () => {
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: true })).toBe(true);
      expect(isCheckoutAvailable({ VITE_BILLING_ENABLED: false })).toBe(false);
    });

    it('using the live import.meta.env returns false in this repo', () => {
      // No-arg call should mirror the deploy. We assert false to lock in the
      // fail-closed default — if someone flips VITE_BILLING_ENABLED locally
      // without wiring a real provider, this test will catch it.
      expect(isCheckoutAvailable()).toBe(false);
    });
  });

  describe('getCheckoutStatus', () => {
    it('returns coming_soon with a contact email when checkout is unavailable', () => {
      const status = getCheckoutStatus({});
      expect(status.kind).toBe('coming_soon');
      if (status.kind === 'coming_soon') {
        expect(status.supportEmail).toMatch(/@/);
      }
    });

    it('returns available when checkout is enabled', () => {
      const status = getCheckoutStatus({ VITE_BILLING_ENABLED: 'true' });
      expect(status.kind).toBe('available');
    });
  });
});

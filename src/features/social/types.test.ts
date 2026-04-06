import { describe, it, expect } from 'vitest';
import {
  LEAGUE_TIERS,
  LEAGUE_GROUP_SIZE,
  getTierIndex,
  getNextTier,
  getPrevTier,
  isPromoted,
  isDemoted,
} from './types';

describe('social league types', () => {
  it('has 5 league tiers', () => {
    expect(LEAGUE_TIERS.length).toBe(5);
  });

  it('group size is 30', () => {
    expect(LEAGUE_GROUP_SIZE).toBe(30);
  });

  describe('getTierIndex', () => {
    it('returns correct indices', () => {
      expect(getTierIndex('bronze')).toBe(0);
      expect(getTierIndex('diamond')).toBe(4);
    });
  });

  describe('getNextTier', () => {
    it('returns next tier', () => {
      expect(getNextTier('bronze')).toBe('silver');
      expect(getNextTier('gold')).toBe('platinum');
    });

    it('returns null for highest tier', () => {
      expect(getNextTier('diamond')).toBeNull();
    });
  });

  describe('getPrevTier', () => {
    it('returns previous tier', () => {
      expect(getPrevTier('silver')).toBe('bronze');
    });

    it('returns null for lowest tier', () => {
      expect(getPrevTier('bronze')).toBeNull();
    });
  });

  describe('isPromoted', () => {
    it('top 10 in bronze are promoted', () => {
      expect(isPromoted('bronze', 1)).toBe(true);
      expect(isPromoted('bronze', 10)).toBe(true);
      expect(isPromoted('bronze', 11)).toBe(false);
    });

    it('nobody is promoted from diamond', () => {
      expect(isPromoted('diamond', 1)).toBe(false);
    });
  });

  describe('isDemoted', () => {
    it('bottom 5 in silver are demoted', () => {
      expect(isDemoted('silver', 30)).toBe(true);
      expect(isDemoted('silver', 26)).toBe(true);
      expect(isDemoted('silver', 25)).toBe(false);
    });

    it('nobody is demoted from bronze', () => {
      expect(isDemoted('bronze', 30)).toBe(false);
    });
  });
});

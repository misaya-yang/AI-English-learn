import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  clearTodayFlags,
  dayKeyFor,
  loadTodayFlags,
  markTodayWordHard,
  toggleTodayBookmark,
  unmarkTodayWordHard,
} from './todayWorkbenchPersistence';

const USER = 'u_today_persist';
const NOW = new Date('2026-04-25T08:00:00Z');
const NEXT_DAY = new Date('2026-04-26T08:00:00Z');

const KEY = { userId: USER, date: NOW };
const KEY_NEXT = { userId: USER, date: NEXT_DAY };

const reset = () => {
  clearTodayFlags(KEY);
  clearTodayFlags(KEY_NEXT);
};

describe('todayWorkbenchPersistence', () => {
  beforeEach(() => reset());
  afterEach(() => reset());

  describe('dayKeyFor', () => {
    it('formats local-time YYYY-MM-DD', () => {
      const expected = `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, '0')}-${String(
        NOW.getDate(),
      ).padStart(2, '0')}`;
      expect(dayKeyFor(NOW)).toBe(expected);
    });
  });

  describe('hard flags', () => {
    it('round-trips a single mark', () => {
      const after = markTodayWordHard(KEY, 'w1');
      expect(after.hard.has('w1')).toBe(true);
      const reloaded = loadTodayFlags(KEY);
      expect(Array.from(reloaded.hard).sort()).toEqual(['w1']);
    });

    it('is idempotent on repeated marks', () => {
      markTodayWordHard(KEY, 'w1');
      markTodayWordHard(KEY, 'w1');
      const reloaded = loadTodayFlags(KEY);
      expect(reloaded.hard.size).toBe(1);
    });

    it('removes a mark', () => {
      markTodayWordHard(KEY, 'w1');
      const cleared = unmarkTodayWordHard(KEY, 'w1');
      expect(cleared.hard.has('w1')).toBe(false);
      expect(loadTodayFlags(KEY).hard.size).toBe(0);
    });

    it('isolates per day', () => {
      markTodayWordHard(KEY, 'today-only');
      markTodayWordHard(KEY_NEXT, 'tomorrow-only');
      expect(loadTodayFlags(KEY).hard).toEqual(new Set(['today-only']));
      expect(loadTodayFlags(KEY_NEXT).hard).toEqual(new Set(['tomorrow-only']));
    });
  });

  describe('bookmark flags', () => {
    it('toggles on and off', () => {
      const first = toggleTodayBookmark(KEY, 'w1');
      expect(first.bookmark.has('w1')).toBe(true);
      const second = toggleTodayBookmark(KEY, 'w1');
      expect(second.bookmark.has('w1')).toBe(false);
    });

    it('does not affect hard set', () => {
      markTodayWordHard(KEY, 'w-hard');
      toggleTodayBookmark(KEY, 'w-bookmark');
      const reloaded = loadTodayFlags(KEY);
      expect(reloaded.hard).toEqual(new Set(['w-hard']));
      expect(reloaded.bookmark).toEqual(new Set(['w-bookmark']));
    });
  });

  describe('robustness', () => {
    it('returns empty sets for an unwritten day', () => {
      const blank = loadTodayFlags(KEY);
      expect(blank.hard.size).toBe(0);
      expect(blank.bookmark.size).toBe(0);
    });

    it('ignores empty / non-string wordIds', () => {
      const before = loadTodayFlags(KEY);
      markTodayWordHard(KEY, '');
      markTodayWordHard(KEY, '   ');
      const after = loadTodayFlags(KEY);
      expect(after.hard.size).toBe(before.hard.size);
    });

    it('recovers from corrupt JSON in storage', () => {
      localStorage.setItem(`vocabdaily_today_flags_${USER}_${dayKeyFor(NOW)}`, '{not-json');
      const reloaded = loadTodayFlags(KEY);
      expect(reloaded.hard.size).toBe(0);
      expect(reloaded.bookmark.size).toBe(0);
    });
  });
});

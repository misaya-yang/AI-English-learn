import { describe, expect, it } from 'vitest';

import { buildSocialLeaderboardSnapshot, inferLeagueTier } from '@/services/socialLeaderboard';

describe('socialLeaderboard', () => {
  const baseInput = {
    userId: 'user-1',
    displayName: 'Yang',
    level: 'B2',
    weeklyXp: 820,
    streak: 12,
    totalWords: 710,
  };

  it('infers league tiers from user progress', () => {
    expect(inferLeagueTier(120, 180)).toBe('bronze');
    expect(inferLeagueTier(350, 200)).toBe('silver');
    expect(inferLeagueTier(900, 820)).toBe('gold');
    expect(inferLeagueTier(1100, 1300)).toBe('platinum');
    expect(inferLeagueTier(1600, 900)).toBe('diamond');
  });

  it('builds a full league table with the current user included', () => {
    const snapshot = buildSocialLeaderboardSnapshot(baseInput);

    expect(snapshot.leagueMembers).toHaveLength(30);
    expect(snapshot.friends).toHaveLength(8);
    expect(snapshot.leagueMembers.some((member) => member.userId === baseInput.userId)).toBe(true);
    expect(snapshot.currentUserRank).toBeGreaterThan(0);
  });

  it('is deterministic for the same user input within the same week', () => {
    const first = buildSocialLeaderboardSnapshot(baseInput);
    const second = buildSocialLeaderboardSnapshot(baseInput);

    expect(first).toEqual(second);
  });
});

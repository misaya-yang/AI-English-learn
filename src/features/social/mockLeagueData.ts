/**
 * Mock league and friend data for development.
 * Replace with Supabase Realtime queries when backend is ready.
 */

import type { LeagueMember, FriendProfile, LeagueTier } from './types';

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-teal-500', 'bg-orange-500',
];

const NAMES = [
  'Meilin Zhang', 'Kai Chen', 'Aria Liu', 'David Park', 'Sophia Tan',
  'Leo Wang', 'Emma Lin', 'Ryan Wu', 'Lily Huang', 'Jack Zhou',
  'Grace Li', 'Alex Kim', 'Chloe Yang', 'Ethan Xu', 'Olivia Zhao',
  'Noah Gao', 'Mia Sun', 'Lucas Ma', 'Isabella Dong', 'Aiden Feng',
  'Zoe Jiang', 'Mason Lu', 'Ava He', 'Logan Liang', 'Emily Zhu',
  'James Shi', 'Harper Wei', 'Ben Tang', 'Ella Xie', 'Owen Pan',
];

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase();
}

export function generateLeagueMembers(
  currentUserId: string,
  currentUserName: string,
  currentUserXp: number,
  tier: LeagueTier,
): LeagueMember[] {
  const xpRanges: Record<LeagueTier, [number, number]> = {
    bronze: [50, 400],
    silver: [200, 800],
    gold: [400, 1200],
    platinum: [600, 1600],
    diamond: [1000, 2500],
  };
  const [minXp, maxXp] = xpRanges[tier];

  const members: LeagueMember[] = NAMES.slice(0, 29).map((name, i) => ({
    userId: `mock-${i}`,
    displayName: name,
    avatarInitials: getInitials(name),
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    weeklyXp: Math.floor(minXp + Math.random() * (maxXp - minXp)),
    streak: Math.floor(Math.random() * 60),
    totalWords: Math.floor(200 + Math.random() * 1500),
    cefrLevel: ['A2', 'B1', 'B2', 'C1'][Math.floor(Math.random() * 4)],
    rank: 0,
  }));

  members.push({
    userId: currentUserId,
    displayName: currentUserName,
    avatarInitials: getInitials(currentUserName),
    avatarColor: 'bg-primary',
    weeklyXp: currentUserXp,
    streak: 0,
    totalWords: 0,
    cefrLevel: 'B1',
    rank: 0,
    isCurrentUser: true,
  });

  members.sort((a, b) => b.weeklyXp - a.weeklyXp);
  members.forEach((m, i) => { m.rank = i + 1; });

  return members;
}

export function generateMockFriends(): FriendProfile[] {
  return NAMES.slice(0, 8).map((name, i) => ({
    userId: `friend-${i}`,
    displayName: name,
    avatarInitials: getInitials(name),
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    cefrLevel: ['A2', 'B1', 'B2', 'C1'][i % 4],
    streak: Math.floor(5 + Math.random() * 50),
    weeklyXp: Math.floor(100 + Math.random() * 1200),
    totalWords: Math.floor(100 + Math.random() * 1000),
    addedAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
    status: 'active' as const,
  }));
}

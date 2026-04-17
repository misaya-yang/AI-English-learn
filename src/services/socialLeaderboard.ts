import type { FriendProfile, LeagueMember, LeagueTier } from '@/features/social/types';
import { LEAGUE_GROUP_SIZE, LEAGUE_TIERS, isDemoted, isPromoted } from '@/features/social/types';

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
] as const;

const DISPLAY_NAMES = [
  'Meilin Zhang',
  'Kai Chen',
  'Aria Liu',
  'David Park',
  'Sophia Tan',
  'Leo Wang',
  'Emma Lin',
  'Ryan Wu',
  'Lily Huang',
  'Jack Zhou',
  'Grace Li',
  'Alex Kim',
  'Chloe Yang',
  'Ethan Xu',
  'Olivia Zhao',
  'Noah Gao',
  'Mia Sun',
  'Lucas Ma',
  'Isabella Dong',
  'Aiden Feng',
  'Zoe Jiang',
  'Mason Lu',
  'Ava He',
  'Logan Liang',
  'Emily Zhu',
  'James Shi',
  'Harper Wei',
  'Ben Tang',
  'Ella Xie',
  'Owen Pan',
  'Mila Qian',
] as const;

const CEFR_LEVELS = ['A2', 'B1', 'B2', 'C1'] as const;

export interface SocialLeaderboardInput {
  userId: string;
  displayName: string;
  level: string;
  weeklyXp: number;
  streak: number;
  totalWords: number;
}

export interface SocialLeaderboardSnapshot {
  weekStart: string;
  leagueTier: LeagueTier;
  leagueMembers: LeagueMember[];
  friends: FriendProfile[];
  currentUserRank: number;
  promotionCutoffRank: number | null;
  demotionCutoffRank: number | null;
  promoted: boolean;
  demoted: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'ME';
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRng(seed: string): () => number {
  let state = hashString(seed) || 1;

  return () => {
    state = Math.imul(state, 1664525) + 1013904223;
    return ((state >>> 0) & 0xffffffff) / 0x100000000;
  };
}

function getWeekStart(date = new Date()): string {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  return start.toISOString().slice(0, 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function inferLeagueTier(totalWords: number, weeklyXp: number): LeagueTier {
  if (totalWords >= 1500 || weeklyXp >= 1800) return 'diamond';
  if (totalWords >= 1000 || weeklyXp >= 1200) return 'platinum';
  if (totalWords >= 650 || weeklyXp >= 800) return 'gold';
  if (totalWords >= 250 || weeklyXp >= 350) return 'silver';
  return 'bronze';
}

function buildLeaguePeers(args: SocialLeaderboardInput, weekStart: string, tier: LeagueTier): LeagueMember[] {
  const rng = createRng(`${args.userId}:${weekStart}:${tier}:league`);
  const tierIndex = LEAGUE_TIERS.findIndex((item) => item.id === tier);
  const baselineXp = Math.max(args.weeklyXp, 120 + tierIndex * 260);
  const baselineWords = Math.max(args.totalWords, 160 + tierIndex * 220);
  const baselineStreak = Math.max(args.streak, 3 + tierIndex * 2);

  const members: LeagueMember[] = DISPLAY_NAMES.slice(0, LEAGUE_GROUP_SIZE - 1).map((name, index) => {
    const xpVariance = Math.round((rng() - 0.45) * 520) + Math.round(index * 7);
    const totalWordsVariance = Math.round((rng() - 0.35) * 420);
    const streakVariance = Math.round((rng() - 0.2) * 24);

    return {
      userId: `league-${tier}-${index}`,
      displayName: name,
      avatarInitials: getInitials(name),
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      weeklyXp: clamp(baselineXp + xpVariance, 40, 3200),
      streak: clamp(baselineStreak + streakVariance, 0, 120),
      totalWords: clamp(baselineWords + totalWordsVariance, 80, 3200),
      cefrLevel: CEFR_LEVELS[Math.floor(rng() * CEFR_LEVELS.length)],
      rank: 0,
    };
  });

  members.push({
    userId: args.userId,
    displayName: args.displayName,
    avatarInitials: getInitials(args.displayName),
    avatarColor: 'bg-emerald-600',
    weeklyXp: args.weeklyXp,
    streak: args.streak,
    totalWords: args.totalWords,
    cefrLevel: args.level,
    rank: 0,
    isCurrentUser: true,
  });

  members.sort((left, right) => {
    if (right.weeklyXp !== left.weeklyXp) return right.weeklyXp - left.weeklyXp;
    if (right.streak !== left.streak) return right.streak - left.streak;
    return right.totalWords - left.totalWords;
  });

  return members.map((member, index) => ({
    ...member,
    rank: index + 1,
  }));
}

function buildFriends(args: SocialLeaderboardInput, weekStart: string): FriendProfile[] {
  const rng = createRng(`${args.userId}:${weekStart}:friends`);

  return DISPLAY_NAMES.slice(4, 12).map((name, index) => ({
    userId: `friend-${index}`,
    displayName: name,
    avatarInitials: getInitials(name),
    avatarColor: AVATAR_COLORS[(index + 3) % AVATAR_COLORS.length],
    cefrLevel: CEFR_LEVELS[(index + 1) % CEFR_LEVELS.length],
    streak: clamp(args.streak + Math.round((rng() - 0.45) * 18), 1, 90),
    weeklyXp: clamp(args.weeklyXp + Math.round((rng() - 0.5) * 460), 50, 2200),
    totalWords: clamp(args.totalWords + Math.round((rng() - 0.45) * 520), 100, 2800),
    addedAt: new Date(`${weekStart}T08:00:00.000Z`).toISOString(),
    status: 'active' as const,
  })).sort((left, right) => right.weeklyXp - left.weeklyXp);
}

export function buildSocialLeaderboardSnapshot(args: SocialLeaderboardInput): SocialLeaderboardSnapshot {
  const weekStart = getWeekStart();
  const leagueTier = inferLeagueTier(args.totalWords, args.weeklyXp);
  const leagueMembers = buildLeaguePeers(args, weekStart, leagueTier);
  const friends = buildFriends(args, weekStart);
  const currentUserRank = leagueMembers.find((member) => member.userId === args.userId)?.rank || leagueMembers.length;
  const tierDef = LEAGUE_TIERS.find((item) => item.id === leagueTier);

  return {
    weekStart,
    leagueTier,
    leagueMembers,
    friends,
    currentUserRank,
    promotionCutoffRank: tierDef?.promotionSlots ? tierDef.promotionSlots : null,
    demotionCutoffRank: tierDef?.demotionSlots ? LEAGUE_GROUP_SIZE - tierDef.demotionSlots + 1 : null,
    promoted: isPromoted(leagueTier, currentUserRank),
    demoted: isDemoted(leagueTier, currentUserRank),
  };
}

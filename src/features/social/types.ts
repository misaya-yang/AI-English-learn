export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LeagueGroup {
  id: string;
  tier: LeagueTier;
  weekStart: string; // ISO date of week start
  members: LeagueMember[];
}

export interface LeagueMember {
  userId: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  weeklyXp: number;
  streak: number;
  totalWords: number;
  cefrLevel: string;
  rank: number;
  isCurrentUser?: boolean;
}

export interface LeagueResult {
  tier: LeagueTier;
  rank: number;
  promoted: boolean;
  demoted: boolean;
  xpEarned: number;
}

export interface FriendProfile {
  userId: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  cefrLevel: string;
  streak: number;
  weeklyXp: number;
  totalWords: number;
  addedAt: string;
  status: 'active' | 'pending';
}

export const LEAGUE_TIERS: { id: LeagueTier; label: string; labelZh: string; icon: string; color: string; promotionSlots: number; demotionSlots: number }[] = [
  { id: 'bronze', label: 'Bronze League', labelZh: '青铜联赛', icon: '🥉', color: 'text-amber-700', promotionSlots: 10, demotionSlots: 0 },
  { id: 'silver', label: 'Silver League', labelZh: '白银联赛', icon: '🥈', color: 'text-gray-400', promotionSlots: 10, demotionSlots: 5 },
  { id: 'gold', label: 'Gold League', labelZh: '黄金联赛', icon: '🥇', color: 'text-yellow-500', promotionSlots: 10, demotionSlots: 5 },
  { id: 'platinum', label: 'Platinum League', labelZh: '铂金联赛', icon: '💎', color: 'text-cyan-400', promotionSlots: 5, demotionSlots: 5 },
  { id: 'diamond', label: 'Diamond League', labelZh: '钻石联赛', icon: '👑', color: 'text-purple-400', promotionSlots: 0, demotionSlots: 5 },
];

export const LEAGUE_GROUP_SIZE = 30;

export function getTierIndex(tier: LeagueTier): number {
  return LEAGUE_TIERS.findIndex((t) => t.id === tier);
}

export function getNextTier(tier: LeagueTier): LeagueTier | null {
  const idx = getTierIndex(tier);
  return idx < LEAGUE_TIERS.length - 1 ? LEAGUE_TIERS[idx + 1].id : null;
}

export function getPrevTier(tier: LeagueTier): LeagueTier | null {
  const idx = getTierIndex(tier);
  return idx > 0 ? LEAGUE_TIERS[idx - 1].id : null;
}

export function isPromoted(tier: LeagueTier, rank: number): boolean {
  const tierDef = LEAGUE_TIERS.find((t) => t.id === tier);
  if (!tierDef) return false;
  return rank <= tierDef.promotionSlots && getNextTier(tier) !== null;
}

export function isDemoted(tier: LeagueTier, rank: number): boolean {
  const tierDef = LEAGUE_TIERS.find((t) => t.id === tier);
  if (!tierDef) return false;
  return rank > LEAGUE_GROUP_SIZE - tierDef.demotionSlots && tierDef.demotionSlots > 0;
}

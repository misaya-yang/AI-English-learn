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
  { id: 'bronze', label: 'Group 1', labelZh: '第 1 组', icon: '1', color: 'text-slate-600', promotionSlots: 10, demotionSlots: 0 },
  { id: 'silver', label: 'Group 2', labelZh: '第 2 组', icon: '2', color: 'text-slate-600', promotionSlots: 10, demotionSlots: 5 },
  { id: 'gold', label: 'Group 3', labelZh: '第 3 组', icon: '3', color: 'text-slate-600', promotionSlots: 10, demotionSlots: 5 },
  { id: 'platinum', label: 'Group 4', labelZh: '第 4 组', icon: '4', color: 'text-slate-600', promotionSlots: 5, demotionSlots: 5 },
  { id: 'diamond', label: 'Group 5', labelZh: '第 5 组', icon: '5', color: 'text-slate-600', promotionSlots: 0, demotionSlots: 5 },
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

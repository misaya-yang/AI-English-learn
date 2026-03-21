/**
 * LeaderboardPage — Community vocabulary challenge leaderboard
 * ─────────────────────────────────────────────────────────────────
 * Phase 4 stub: shows weekly XP rankings + streak leaders.
 * Data is seeded locally (mock) until Supabase leaderboard RPC is live.
 * When real-time is connected, swap MOCK_ENTRIES for a useQuery call.
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Flame,
  BookOpen,
  Crown,
  Medal,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  weeklyXp: number;
  streak: number;
  totalWords: number;
  level: string;        // CEFR level badge
  isCurrentUser?: boolean;
}

type LeaderboardTab = 'weekly' | 'streak' | 'total';

// ─── Seed / mock data ─────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
];

const MOCK_ENTRIES: Omit<LeaderEntry, 'rank' | 'isCurrentUser'>[] = [
  { userId: 'u1', displayName: 'Meilin Zhang', avatarInitials: 'MZ', avatarColor: AVATAR_COLORS[0], weeklyXp: 1420, streak: 34, totalWords: 892, level: 'C1' },
  { userId: 'u2', displayName: 'Kai Chen',     avatarInitials: 'KC', avatarColor: AVATAR_COLORS[1], weeklyXp: 1305, streak: 21, totalWords: 756, level: 'B2' },
  { userId: 'u3', displayName: 'Aria Liu',     avatarInitials: 'AL', avatarColor: AVATAR_COLORS[2], weeklyXp: 1180, streak: 18, totalWords: 640, level: 'B2' },
  { userId: 'u4', displayName: 'David Park',   avatarInitials: 'DP', avatarColor: AVATAR_COLORS[3], weeklyXp: 980,  streak: 45, totalWords: 1203, level: 'C1' },
  { userId: 'u5', displayName: 'Sophia Tan',   avatarInitials: 'ST', avatarColor: AVATAR_COLORS[4], weeklyXp: 870,  streak: 12, totalWords: 445, level: 'B1' },
  { userId: 'u6', displayName: 'Wei Wang',     avatarInitials: 'WW', avatarColor: AVATAR_COLORS[5], weeklyXp: 760,  streak: 8,  totalWords: 382, level: 'B1' },
  { userId: 'u7', displayName: 'Priya Raj',    avatarInitials: 'PR', avatarColor: AVATAR_COLORS[6], weeklyXp: 640,  streak: 29, totalWords: 721, level: 'B2' },
  { userId: 'u8', displayName: 'James Wu',     avatarInitials: 'JW', avatarColor: AVATAR_COLORS[7], weeklyXp: 590,  streak: 5,  totalWords: 298, level: 'A2' },
  { userId: 'u9', displayName: 'Hana Kim',     avatarInitials: 'HK', avatarColor: AVATAR_COLORS[0], weeklyXp: 480,  streak: 16, totalWords: 534, level: 'B2' },
  { userId: 'u10',displayName: 'Carlos Diaz',  avatarInitials: 'CD', avatarColor: AVATAR_COLORS[1], weeklyXp: 390,  streak: 3,  totalWords: 215, level: 'B1' },
];

function buildRankedList(
  entries: typeof MOCK_ENTRIES,
  sortKey: LeaderboardTab,
  currentUserId: string,
  currentUserName: string,
  currentUserXp: number,
  currentUserStreak: number,
  currentUserWords: number,
): LeaderEntry[] {
  // Inject current user if not in mock list
  const augmented = entries.map((e) => ({ ...e }));
  const alreadyIn = augmented.some((e) => e.userId === currentUserId);
  if (!alreadyIn) {
    augmented.push({
      userId: currentUserId,
      displayName: currentUserName,
      avatarInitials: currentUserName.slice(0, 2).toUpperCase() || 'ME',
      avatarColor: 'bg-emerald-600',
      weeklyXp: currentUserXp,
      streak: currentUserStreak,
      totalWords: currentUserWords,
      level: 'B1',
    });
  }

  const sortFn: Record<LeaderboardTab, (a: typeof augmented[0], b: typeof augmented[0]) => number> = {
    weekly:  (a, b) => b.weeklyXp    - a.weeklyXp,
    streak:  (a, b) => b.streak      - a.streak,
    total:   (a, b) => b.totalWords  - a.totalWords,
  };

  return augmented
    .sort(sortFn[sortKey])
    .map((e, i) => ({ ...e, rank: i + 1, isCurrentUser: e.userId === currentUserId }));
}

// ─── Rank icon ────────────────────────────────────────────────────────────────

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal className="h-4.5 w-4.5 text-slate-400 dark:text-slate-300" />;
  if (rank === 3) return <Medal className="h-4.5 w-4.5 text-amber-700" />;
  return <span className="text-sm font-bold text-slate-400 dark:text-white/40">{rank}</span>;
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function LeaderRow({ entry, tab }: { entry: LeaderEntry; tab: LeaderboardTab }) {
  const value = tab === 'weekly' ? entry.weeklyXp : tab === 'streak' ? entry.streak : entry.totalWords;
  const unit  = tab === 'weekly' ? 'XP' : tab === 'streak' ? '天' : '词';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all',
        entry.isCurrentUser
          ? 'border border-emerald-500/25 bg-emerald-500/[0.06]'
          : 'border border-transparent hover:border-black/5 dark:hover:border-white/[0.06] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]',
      )}
    >
      {/* Rank */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
        <RankIcon rank={entry.rank} />
      </div>

      {/* Avatar */}
      <div className={cn(
        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
        entry.avatarColor,
      )}>
        {entry.avatarInitials}
      </div>

      {/* Name + level */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'truncate text-sm font-semibold',
          entry.isCurrentUser ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-800 dark:text-white',
        )}>
          {entry.displayName}
          {entry.isCurrentUser && <span className="ml-1.5 text-[10px] font-normal text-emerald-500">(You)</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="rounded-full bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-white/40">
            {entry.level}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-white/35">
            <Flame className="h-2.5 w-2.5 text-orange-400" />{entry.streak}d
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p className={cn(
          'text-base font-bold',
          entry.isCurrentUser ? 'text-emerald-500' : 'text-slate-800 dark:text-white',
        )}>
          {value.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-white/35">{unit}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { xp, streak, stats } = useUserData();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('weekly');

  const entries = useMemo(() => buildRankedList(
    MOCK_ENTRIES,
    activeTab,
    user?.id ?? 'me',
    user?.displayName || user?.email?.split('@')[0] || 'You',
    xp?.today ?? 0,
    streak?.current ?? 0,
    stats?.totalWords ?? 0,
  ), [activeTab, user, xp, streak, stats]);

  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  const tabs: { id: LeaderboardTab; label: string; labelZh: string; icon: React.ReactNode }[] = [
    { id: 'weekly', label: 'Weekly XP',   labelZh: '本周 XP',  icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: 'streak', label: 'Streak',      labelZh: '连续天数', icon: <Flame className="h-3.5 w-3.5" /> },
    { id: 'total',  label: 'Total Words', labelZh: '累计词量', icon: <BookOpen className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Leaderboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            本周 {entries.length} 名学习者正在竞争
          </p>
        </div>
        {currentUserEntry && (
          <div className="text-right">
            <p className="text-xs text-slate-400 dark:text-white/40">Your rank</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">#{currentUserEntry.rank}</p>
          </div>
        )}
      </div>

      {/* Current user highlight banner */}
      {currentUserEntry && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            {currentUserEntry.avatarInitials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{currentUserEntry.displayName}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              Rank #{currentUserEntry.rank} · {currentUserEntry.weeklyXp} XP this week
            </p>
          </div>
          <Star className="h-5 w-5 text-emerald-500" />
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex rounded-2xl border border-black/5 dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02] p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70',
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.labelZh}</span>
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {entries.slice(0, 3).map((entry) => {
          const podiumHeights = ['h-20', 'h-16', 'h-14'];
          const colors = ['border-amber-400/30 bg-amber-500/[0.08]', 'border-slate-400/20 bg-slate-500/[0.05]', 'border-amber-700/20 bg-amber-700/[0.05]'];
          const idx = entry.rank - 1;
          const value = activeTab === 'weekly' ? entry.weeklyXp : activeTab === 'streak' ? entry.streak : entry.totalWords;
          const unit  = activeTab === 'weekly' ? 'XP' : activeTab === 'streak' ? '天' : '词';
          return (
            <div
              key={entry.userId}
              className={cn(
                'flex flex-col items-center rounded-2xl border p-3 transition-all',
                colors[idx],
                entry.isCurrentUser && 'ring-2 ring-emerald-500/50',
              )}
            >
              <div className="mb-1">
                <RankIcon rank={entry.rank} />
              </div>
              <div className={cn(
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white mb-1',
                entry.avatarColor,
              )}>
                {entry.avatarInitials}
              </div>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-white/80 text-center truncate w-full">
                {entry.displayName.split(' ')[0]}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
              <p className="text-[9px] text-slate-400 dark:text-white/35">{unit}</p>
              {/* Podium bar */}
              <div className={cn('mt-2 w-full rounded-t-lg bg-current opacity-10', podiumHeights[idx])} />
            </div>
          );
        })}
      </div>

      {/* Full ranking */}
      <div>
        <p className="px-1 mb-2 text-[11px] uppercase tracking-wider text-slate-400 dark:text-white/36">Full Ranking</p>
        <div className="space-y-1">
          {entries.map((entry) => (
            <LeaderRow key={entry.userId} entry={entry} tab={activeTab} />
          ))}
        </div>
      </div>

      {/* Coming soon note */}
      <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.05] px-4 py-3 flex items-center gap-2.5">
        <Trophy className="h-4 w-4 text-blue-400 flex-shrink-0" />
        <p className="text-sm text-blue-500 dark:text-blue-400">
          实时排行榜即将上线 — 积分将与好友共享
        </p>
      </div>
    </div>
  );
}

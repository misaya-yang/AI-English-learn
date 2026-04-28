import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Crown,
  Flame,
  Medal,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { LEAGUE_TIERS } from '@/features/social/types';
import { buildSocialLeaderboardSnapshot } from '@/services/socialLeaderboard';

interface LeaderEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  weeklyXp: number;
  streak: number;
  totalWords: number;
  level: string;
  isCurrentUser?: boolean;
}

type LeaderboardTab = 'weekly' | 'streak' | 'total';

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal className="h-4.5 w-4.5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="h-4.5 w-4.5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
}

function sortEntries(entries: LeaderEntry[], tab: LeaderboardTab): LeaderEntry[] {
  const sorted = [...entries].sort((left, right) => {
    if (tab === 'weekly' && right.weeklyXp !== left.weeklyXp) return right.weeklyXp - left.weeklyXp;
    if (tab === 'streak' && right.streak !== left.streak) return right.streak - left.streak;
    if (tab === 'total' && right.totalWords !== left.totalWords) return right.totalWords - left.totalWords;
    return right.weeklyXp - left.weeklyXp;
  });

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

function LeaderRow({ entry, tab }: { entry: LeaderEntry; tab: LeaderboardTab }) {
  const value = tab === 'weekly' ? entry.weeklyXp : tab === 'streak' ? entry.streak : entry.totalWords;
  const unit = tab === 'weekly' ? 'XP' : tab === 'streak' ? '天' : '词';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all',
        entry.isCurrentUser
          ? 'border border-emerald-500/25 bg-emerald-500/[0.06]'
          : 'border border-transparent hover:border-border hover:bg-muted/30',
      )}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        <RankIcon rank={entry.rank} />
      </div>

      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
          entry.avatarColor,
        )}
      >
        {entry.avatarInitials}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-semibold',
            entry.isCurrentUser ? 'text-emerald-600 dark:text-emerald-300' : 'text-foreground',
          )}
        >
          {entry.displayName}
          {entry.isCurrentUser ? <span className="ml-1.5 text-[10px] font-normal text-emerald-500">（我）</span> : null}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
            {entry.level}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Flame className="h-2.5 w-2.5 text-orange-400" />
            {entry.streak}天
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className={cn('text-base font-bold', entry.isCurrentUser ? 'text-emerald-500' : 'text-foreground')}>
          {value.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground">{unit}</p>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { user, profile } = useAuth();
  const { xp, streak, stats } = useUserData();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('weekly');
  const currentStreak = streak.current || 0;

  const snapshot = useMemo(
    () =>
      buildSocialLeaderboardSnapshot({
        userId: user?.id || 'guest',
        displayName: user?.displayName || user?.email?.split('@')[0] || 'You',
        level: profile?.cefrLevel || 'B1',
        weeklyXp: stats.weeklyXP || xp.today || 0,
        streak: currentStreak,
        totalWords: stats.totalWords || 0,
      }),
    [currentStreak, profile?.cefrLevel, stats.totalWords, stats.weeklyXP, user?.displayName, user?.email, user?.id, xp.today],
  );

  const entries = useMemo(() => {
    const baseEntries: LeaderEntry[] = snapshot.leagueMembers.map((member) => ({
      rank: member.rank,
      userId: member.userId,
      displayName: member.displayName,
      avatarInitials: member.avatarInitials,
      avatarColor: member.avatarColor,
      weeklyXp: member.weeklyXp,
      streak: member.streak,
      totalWords: member.totalWords,
      level: member.cefrLevel,
      isCurrentUser: member.isCurrentUser,
    }));

    return sortEntries(baseEntries, activeTab);
  }, [activeTab, snapshot.leagueMembers]);

  const currentUserEntry = entries.find((entry) => entry.isCurrentUser) || null;
  const leagueMeta = LEAGUE_TIERS.find((tier) => tier.id === snapshot.leagueTier);

  const tabs: Array<{ id: LeaderboardTab; label: string; labelZh: string; icon: React.ReactNode }> = [
    { id: 'weekly', label: 'Weekly XP', labelZh: '本周 XP', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: 'streak', label: 'Streak', labelZh: '连续天数', icon: <Flame className="h-3.5 w-3.5" /> },
    { id: 'total', label: 'Total Words', labelZh: '累计词量', icon: <BookOpen className="h-3.5 w-3.5" /> },
  ];

  const movementCopy = snapshot.promoted
    ? '你目前处于晋级区，继续保持就能升到下一联赛。'
    : snapshot.demoted
      ? '你目前处于降级区，建议优先完成今日复习和短测。'
      : snapshot.promotionCutoffRank
        ? `距离晋级区还差 ${Math.max(currentUserEntry ? currentUserEntry.rank - snapshot.promotionCutoffRank : 0, 0)} 名。`
        : '你已经处于最高联赛，继续拉开分差。';

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">排行榜</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {leagueMeta?.labelZh || '联赛'} · 本周 {entries.length} 名学习者
          </p>
        </div>

        {leagueMeta ? (
          <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-right">
            <p className="text-xs text-muted-foreground">当前联赛</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {leagueMeta.icon} {leagueMeta.labelZh}
            </p>
          </div>
        ) : null}
      </div>

      {currentUserEntry ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            {currentUserEntry.avatarInitials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{currentUserEntry.displayName}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              第 {currentUserEntry.rank} 名 · 本周 {currentUserEntry.weeklyXp} XP
            </p>
          </div>
          <Trophy className="h-5 w-5 text-emerald-500" />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">本周状态</p>
              <p className="mt-1 text-sm font-medium text-foreground">{movementCopy}</p>
            </div>
            <BadgeLike text={snapshot.promoted ? '晋级区' : snapshot.demoted ? '降级风险' : '稳定保持'} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <MetricCard label="名次" value={`#${snapshot.currentUserRank}`} />
            <MetricCard label="晋级线" value={snapshot.promotionCutoffRank ? `前 ${snapshot.promotionCutoffRank}` : '已锁定'} />
            <MetricCard label="安全线" value={snapshot.demotionCutoffRank ? `#${snapshot.demotionCutoffRank - 1}` : '安全'} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">好友动态</p>
          <div className="mt-3 space-y-2">
            {snapshot.friends.slice(0, 4).map((friend) => (
              <div key={friend.userId} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white', friend.avatarColor)}>
                  {friend.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{friend.displayName}</p>
                  <p className="text-[11px] text-muted-foreground">{friend.weeklyXp} XP · 连续{friend.streak}天</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-2xl border border-border bg-muted/30 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.labelZh}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {entries.slice(0, 3).map((entry) => {
          const podiumHeights = ['h-20', 'h-16', 'h-14'];
          const colors = ['border-amber-400/30 bg-amber-500/[0.08]', 'border-slate-400/20 bg-slate-500/[0.05]', 'border-amber-700/20 bg-amber-700/[0.05]'];
          const index = entry.rank - 1;
          const value = activeTab === 'weekly' ? entry.weeklyXp : activeTab === 'streak' ? entry.streak : entry.totalWords;
          const unit = activeTab === 'weekly' ? 'XP' : activeTab === 'streak' ? '天' : '词';

          return (
            <div
              key={entry.userId}
              className={cn(
                'flex flex-col items-center rounded-2xl border p-3 transition-all',
                colors[index],
                entry.isCurrentUser && 'ring-2 ring-emerald-500/50',
              )}
            >
              <div className="mb-1">
                <RankIcon rank={entry.rank} />
              </div>
              <div className={cn('mb-1 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white', entry.avatarColor)}>
                {entry.avatarInitials}
              </div>
              <p className="w-full truncate text-center text-[11px] font-semibold text-foreground">
                {entry.displayName.split(' ')[0]}
              </p>
              <p className="text-sm font-bold text-foreground">{value.toLocaleString()}</p>
              <p className="text-[9px] text-muted-foreground">{unit}</p>
              <div className={cn('mt-2 w-full rounded-t-lg bg-current opacity-10', podiumHeights[index])} />
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] tracking-wide text-muted-foreground">完整排名</p>
        <div className="space-y-1">
          {entries.map((entry) => (
            <LeaderRow key={entry.userId} entry={entry} tab={activeTab} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-blue-500/15 bg-blue-500/[0.05] px-4 py-3">
        <Trophy className="h-4 w-4 shrink-0 text-blue-400" />
        <p className="text-sm text-blue-500 dark:text-blue-400">
          联赛按周重置，当前页面会稳定保留你这一周的本地联赛快照，等后端实时榜接入后可无缝切换。
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function BadgeLike({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-foreground">
      {text}
    </span>
  );
}

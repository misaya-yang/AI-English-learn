import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  TrendingUp,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
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
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground">
      {rank}
    </span>
  );
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
  const unit = tab === 'weekly' ? '记录' : tab === 'streak' ? '天' : '词';
  const displayName = entry.isCurrentUser && entry.displayName === 'Demo Learner'
    ? '演示账号'
    : entry.displayName;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 rounded-md px-4 py-3 transition-colors',
        entry.isCurrentUser
          ? 'border border-primary/25 bg-primary/[0.06]'
          : 'border border-transparent hover:border-border hover:bg-muted/30',
      )}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        <RankIcon rank={entry.rank} />
      </div>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-xs font-semibold text-foreground"
      >
        {entry.avatarInitials}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-semibold',
            entry.isCurrentUser ? 'text-primary' : 'text-foreground',
          )}
        >
          {displayName}
          {entry.isCurrentUser ? <span className="ml-1.5 text-[10px] font-normal text-primary">（我）</span> : null}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            {entry.level}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <CalendarDays className="h-2.5 w-2.5" />
            {entry.streak}天
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className={cn('text-base font-semibold', entry.isCurrentUser ? 'text-primary' : 'text-foreground')}>
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
        displayName: user?.displayName || user?.email?.split('@')[0] || '演示账号',
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

  const tabs: Array<{ id: LeaderboardTab; label: string; labelZh: string; icon: React.ReactNode }> = [
    { id: 'weekly', label: 'Weekly records', labelZh: '本周练习', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: 'streak', label: 'Streak', labelZh: '连续天数', icon: <CalendarDays className="h-3.5 w-3.5" /> },
    { id: 'total', label: 'Total Words', labelZh: '累计词量', icon: <BookOpen className="h-3.5 w-3.5" /> },
  ];

  const movementCopy = snapshot.promoted
    ? '你本周记录在前段，继续完成今日学习即可。'
    : snapshot.demoted
      ? '你本周记录偏少，先完成今日复习和短测。'
      : snapshot.promotionCutoffRank
        ? `距离前 ${snapshot.promotionCutoffRank} 还差 ${Math.max(currentUserEntry ? currentUserEntry.rank - snapshot.promotionCutoffRank : 0, 0)} 名。`
        : '你本周记录已经在前列。';

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">排行</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            本周 {entries.length} 名学习者
          </p>
        </div>

        <div className="liquid-glass-control rounded-lg border border-border bg-card/80 px-4 py-3 text-right">
          <p className="text-xs text-muted-foreground">当前视图</p>
          <p className="mt-1 text-lg font-semibold text-foreground">本周记录</p>
        </div>
      </div>

      {currentUserEntry ? (
        <div className="flex items-center gap-3 rounded-xl border border-transparent bg-primary/[0.06] px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-xs font-semibold text-foreground">
            {currentUserEntry.avatarInitials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">
              {currentUserEntry.displayName === 'Demo Learner' ? '演示账号' : currentUserEntry.displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              第 {currentUserEntry.rank} 名 · 本周 {currentUserEntry.weeklyXp} 条记录
            </p>
          </div>
          <RankIcon rank={currentUserEntry.rank} />
        </div>
      ) : null}

      <div className="grid items-start gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-transparent bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">本周状态</p>
              <p className="mt-1 text-sm font-medium text-foreground">{movementCopy}</p>
            </div>
            <BadgeLike text={snapshot.promoted ? '前段' : snapshot.demoted ? '需补练' : '稳定'} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <MetricCard label="名次" value={`#${snapshot.currentUserRank}`} />
            <MetricCard label="前段线" value={snapshot.promotionCutoffRank ? `前 ${snapshot.promotionCutoffRank}` : '前列'} />
            <MetricCard label="参考线" value={snapshot.demotionCutoffRank ? `#${snapshot.demotionCutoffRank - 1}` : '稳定'} />
          </div>
        </div>

        <div className="rounded-xl border border-transparent bg-card p-4">
          <p className="text-xs text-muted-foreground">好友动态</p>
          <div className="mt-3 space-y-2">
            {snapshot.friends.slice(0, 4).map((friend) => (
              <div key={friend.userId} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-[11px] font-semibold text-foreground">
                  {friend.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{friend.displayName}</p>
                  <p className="text-[11px] text-muted-foreground">{friend.weeklyXp} 条记录 · 连续{friend.streak}天</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="liquid-glass-control flex gap-1 rounded-lg border border-border p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary shadow-none'
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
          const value = activeTab === 'weekly' ? entry.weeklyXp : activeTab === 'streak' ? entry.streak : entry.totalWords;
          const unit = activeTab === 'weekly' ? '记录' : activeTab === 'streak' ? '天' : '词';
          const displayName = entry.isCurrentUser && entry.displayName === 'Demo Learner'
            ? '演示账号'
            : entry.displayName;

          return (
            <div
              key={entry.userId}
              className={cn(
                'flex flex-col items-center rounded-xl border border-transparent bg-card p-3 transition-colors',
                entry.isCurrentUser && 'bg-primary/[0.05]',
              )}
            >
              <div className="mb-1">
                <RankIcon rank={entry.rank} />
              </div>
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-xs font-semibold text-foreground">
                {entry.avatarInitials}
              </div>
              <p className="w-full truncate text-center text-[11px] font-semibold text-foreground">
                {displayName.split(' ')[0]}
              </p>
              <p className="text-sm font-bold text-foreground">{value.toLocaleString()}</p>
              <p className="text-[9px] text-muted-foreground">{unit}</p>
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-medium text-muted-foreground">完整记录</p>
        <div className="space-y-1">
          {entries.map((entry) => (
            <LeaderRow key={entry.userId} entry={entry} tab={activeTab} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-transparent bg-card px-4 py-3">
        <Users className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          本页按周重置。当前先展示本地快照，接入后端同步后会切换到实时记录。
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

import { useState, useEffect, useMemo } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { wordsDatabase } from '@/data/words';
import { retrievability } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';
import type { UserProgress } from '@/data/localStorage';
import type { FSRSState } from '@/types/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  BookOpen,
  Target,
  Zap,
  Calendar,
  Flame,
  ChevronUp,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHeatmapData, getWeeklyActivity, type WeeklyActivityPoint } from '@/services/learningEvents';

const TOPIC_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

const generateTopicData = (wordIds: string[]) => {
  const topicCounts: Record<string, number> = {};
  wordIds.forEach((id) => {
    const word = wordsDatabase.find((w) => w.id === id);
    const topic = word?.topic || 'general';
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });
  return Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: TOPIC_COLORS[index % TOPIC_COLORS.length],
    }));
};

export default function AnalyticsPage() {
  const { stats, xp, streak, dailyWords, progress } = useUserData();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week');
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<Array<{ week: number; day: number; value: number }>>([]);

  // Derive topic data from all progress words; fall back to today's daily words if no progress yet
  const topicData = useMemo(() => {
    const ids = progress.length > 0
      ? progress.map((p) => p.wordId)
      : dailyWords.map((w) => w.id);
    return generateTopicData(ids);
  }, [progress, dailyWords]);

  useEffect(() => {
    const userId = user?.id || 'guest';

    const loadAnalytics = async () => {
      const [weekly, heatmap] = await Promise.all([
        getWeeklyActivity(userId),
        getHeatmapData(userId),
      ]);

      setWeeklyData(weekly);
      setHeatmapData(heatmap);
    };

    void loadAnalytics();
  // timeRange is UI-only state — getWeeklyActivity/getHeatmapData don't accept it as a param
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.totalWords, user?.id]);

  // Calculate level based on XP
  const level = Math.floor(xp.total / 100) + 1;
  const levelName = level < 5 ? 'Novice' : level < 10 ? 'Apprentice' : level < 20 ? 'Journeyman' : 'Expert';
  // XP progress within the current level (0–99)
  const xpInCurrentLevel = xp.total % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;

  const statCards = [
    {
      title: 'Total Words',
      titleZh: '总单词数',
      value: stats.totalWords.toString(),
      change: `+${stats.weeklyWords}`,
      icon: BookOpen,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Mastered',
      titleZh: '已掌握',
      value: stats.masteredWords.toString(),
      change: `${Math.round((stats.masteredWords / Math.max(1, stats.totalWords)) * 100)}%`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Current Streak',
      titleZh: '连续学习',
      value: `${streak.current} days`,
      change: streak.current > 0 ? 'On fire!' : 'Start today',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total XP',
      titleZh: '总经验值',
      value: xp.total.toString(),
      change: `Level ${level}`,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // ── FSRS-powered retention analytics ───────────────────────────────────────
  const fsrsStats = useMemo(() => {
    if (!progress.length) return null;
    const now = Date.now();

    // Compute current retrievability for every non-mastered word
    const retrievabilities = progress
      .filter((p) => p.status !== 'mastered')
      .map((p) => {
        const fsrs = ensureFSRS(p as UserProgress & { fsrs?: FSRSState });
        if (fsrs.stability === 0) return 0;
        const elapsedDays = fsrs.lastReviewAt
          ? (now - new Date(fsrs.lastReviewAt).getTime()) / 86_400_000
          : 0;
        return retrievability(fsrs.stability, elapsedDays);
      });

    const avgR = retrievabilities.length
      ? retrievabilities.reduce((s, v) => s + v, 0) / retrievabilities.length
      : 0;

    // Bucket into 5 groups for histogram (0-20%, 20-40%, …, 80-100%)
    const buckets = [0, 0, 0, 0, 0];
    for (const r of retrievabilities) {
      const idx = Math.min(4, Math.floor(r * 5));
      buckets[idx]++;
    }
    const histData = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'].map((label, i) => ({
      label,
      count: buckets[i],
      fill: i >= 3 ? '#10b981' : i === 2 ? '#f59e0b' : '#ef4444',
    }));

    // Forgetting curves: FSRS (target 90%) vs naive baseline (no SRS)
    // Use only non-mastered words to stay consistent with the histogram above
    const nonMasteredWithStability = progress
      .filter((p) => p.status !== 'mastered' && (p as UserProgress & { fsrs?: FSRSState }).fsrs?.stability);
    const avgStability = nonMasteredWithStability.length
      ? nonMasteredWithStability.reduce(
          (s, p) => s + ((p as UserProgress & { fsrs?: FSRSState }).fsrs?.stability ?? 1), 0,
        ) / nonMasteredWithStability.length
      : 7; // default 7-day stability

    const curvePoints = [1, 3, 7, 14, 30, 60, 90].map((day) => ({
      day: `D${day}`,
      fsrs: Math.round(retrievability(avgStability, day) * 100),
      baseline: Math.round(Math.max(5, 100 * Math.exp(-day / 7))), // naive Ebbinghaus
    }));

    return { avgR, histData, curvePoints, total: retrievabilities.length };
  }, [progress]);

  const hasPerfectWeek = weeklyData.length >= 7 && weeklyData.every((point) => point.words > 0);
  const badges = [
    { name: '7-Day Streak', nameZh: '7天连续', icon: Flame, color: 'text-orange-500', earned: streak.current >= 7 },
    { name: '100 Words', nameZh: '100单词', icon: BookOpen, color: 'text-emerald-500', earned: stats.totalWords >= 100 },
    { name: 'Perfect Week', nameZh: '完美一周', icon: Calendar, color: 'text-blue-500', earned: hasPerfectWeek },
    { name: 'Word Wizard', nameZh: '单词巫师', icon: Zap, color: 'text-purple-500', earned: stats.masteredWords >= 50 },
    { name: 'Master Learner', nameZh: '学习大师', icon: Award, color: 'text-yellow-500', earned: xp.total >= 1000 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Learning Progress</h1>
          <p className="text-muted-foreground">学习进度 • Track your vocabulary journey</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.titleZh}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ChevronUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level Progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Level {level} - {levelName}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {xp.total} XP total
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all"
              style={{ width: `${xpInCurrentLevel}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {xpInCurrentLevel} / 100 XP &mdash; {xpToNextLevel} XP needed for level {level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="words">Words</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Activity</CardTitle>
              <p className="text-sm text-muted-foreground">本周活动</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="words" fill="#10b981" name="Words Learned" />
                  <Bar dataKey="xp" fill="#3b82f6" name="XP Earned" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Topic Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Topic Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">主题分布</p>
              </CardHeader>
              <CardContent>
                {topicData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={topicData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {topicData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {topicData.map((topic) => (
                        <div key={topic.name} className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: topic.color }}
                          />
                          <span className="text-xs">{topic.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No topic data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Time</CardTitle>
                <p className="text-sm text-muted-foreground">学习时间</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="minutes"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="words" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Words Learned Over Time</CardTitle>
              <p className="text-sm text-muted-foreground">单词学习趋势</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="words"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Heatmap</CardTitle>
              <p className="text-sm text-muted-foreground">活动热图</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const dataPoint = heatmapData.find(
                        (d) => d.week === weekIndex && d.day === dayIndex
                      );
                      const intensity = dataPoint?.value || 0;
                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            'w-3 h-3 rounded-sm',
                            intensity === 0 && 'bg-gray-100 dark:bg-gray-800',
                            intensity === 1 && 'bg-emerald-200 dark:bg-emerald-900',
                            intensity === 2 && 'bg-emerald-300 dark:bg-emerald-800',
                            intensity === 3 && 'bg-emerald-400 dark:bg-emerald-700',
                            intensity >= 4 && 'bg-emerald-500 dark:bg-emerald-600'
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-muted-foreground">Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm" />
                  <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900 rounded-sm" />
                  <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-800 rounded-sm" />
                  <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-700 rounded-sm" />
                  <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-600 rounded-sm" />
                </div>
                <span className="text-xs text-muted-foreground">More</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          {/* Average retrievability gauge */}
          {fsrsStats && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="col-span-1">
                <CardContent className="p-5 flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Avg. Retrievability</p>
                  <p className="text-[3rem] font-bold text-emerald-500 leading-none">
                    {Math.round(fsrsStats.avgR * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {fsrsStats.total} active words tracked by FSRS-5
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all"
                      style={{ width: `${Math.round(fsrsStats.avgR * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Target: ≥ 85%</p>
                </CardContent>
              </Card>

              {/* Retrievability histogram */}
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Current Retrievability Distribution</CardTitle>
                  <p className="text-xs text-muted-foreground">各单词当前记忆保留率分布</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={fsrsStats.histData} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v} words`, 'Count']} />
                      <Bar dataKey="count" name="Words">
                        {fsrsStats.histData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* FSRS forgetting curve vs baseline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">FSRS-5 vs. Baseline Forgetting Curve</CardTitle>
              <p className="text-sm text-muted-foreground">FSRS 算法 vs. 基础遗忘曲线对比</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={fsrsStats?.curvePoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v: number) => [`${v}%`]} />
                  <Line
                    type="monotone" dataKey="fsrs" name="FSRS-5 (your avg stability)"
                    stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }}
                  />
                  <Line
                    type="monotone" dataKey="baseline" name="No SRS (Ebbinghaus)"
                    stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2">
                <span className="text-emerald-400 text-lg">✓</span>
                <p className="text-sm text-emerald-200/80">
                  FSRS-5 targets <strong>90% retention</strong> at each review interval, scheduling your next review just before you would forget.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <Card
                key={badge.name}
                className={cn(
                  'text-center',
                  !badge.earned && 'opacity-50'
                )}
              >
                <CardContent className="p-4">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3',
                      badge.earned ? 'bg-emerald-100' : 'bg-gray-100'
                    )}
                  >
                    <badge.icon
                      className={cn(
                        'h-8 w-8',
                        badge.earned ? badge.color : 'text-gray-400'
                      )}
                    />
                  </div>
                  <p className="font-medium text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.nameZh}</p>
                  {badge.earned && (
                    <Badge variant="secondary" className="mt-2">
                      Earned
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

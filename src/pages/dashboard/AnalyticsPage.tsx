import { useState, useEffect, useMemo } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { wordsDatabase } from '@/data/words';
import { retrievability } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';
import { computeHighRiskWords } from '@/services/retentionInsights';
import { computeReviewWindows } from '@/services/reviewWindows';
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  BookOpen,
  Target,
  Zap,
  Calendar,
  Flame,
  ChevronUp,
  Award,
  AlertTriangle,
  Clock3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getHeatmapData,
  getLearningEvents,
  getWeeklyActivity,
  type LearningEventRecord,
  type WeeklyActivityPoint,
} from '@/services/learningEvents';
import { computeLevel, getLevelName } from '@/services/gamification';

const TOPIC_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

// ── Theme-aware chart color hook ─────────────────────────────────────────────
function useChartColors() {
  // Reads the current theme tokens from :root CSS vars
  const style = getComputedStyle(document.documentElement);
  return {
    border: `hsl(${style.getPropertyValue('--border').trim()})`,
    foreground: `hsl(${style.getPropertyValue('--foreground').trim()})`,
    mutedForeground: `hsl(${style.getPropertyValue('--muted-foreground').trim()})`,
    card: `hsl(${style.getPropertyValue('--card').trim()})`,
  };
}
const ANALYTICS_NOW = Date.now();

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
  const { stats, xp, streak, dailyWords, customWords, progress } = useUserData();
  const { user } = useAuth();
  const colors = useChartColors();
  const [timeRange, setTimeRange] = useState('week');
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<Array<{ week: number; day: number; value: number }>>([]);
  const [eventHistory, setEventHistory] = useState<LearningEventRecord[]>([]);

  // Derive topic data from all progress words; fall back to today's daily words if no progress yet
  const topicData = useMemo(() => {
    const ids = progress.length > 0
      ? progress.map((p) => p.wordId)
      : dailyWords.map((w) => w.id);
    return generateTopicData(ids);
  }, [progress, dailyWords]);

  const riskWords = useMemo(
    () => computeHighRiskWords(progress, [...customWords, ...dailyWords, ...wordsDatabase]),
    [customWords, dailyWords, progress],
  );
  const reviewWindowInsight = useMemo(() => computeReviewWindows(eventHistory), [eventHistory]);

  useEffect(() => {
    const userId = user?.id || 'guest';

    const loadAnalytics = async () => {
      // Map timeRange to how many days of event history to fetch
      const eventDays = timeRange === 'year' ? 365 : timeRange === 'month' ? 30 : 7;

      const [weekly, heatmap, events] = await Promise.all([
        // getWeeklyActivity always returns last-7-day buckets; only include for week view
        timeRange === 'week' ? getWeeklyActivity(userId) : Promise.resolve([] as WeeklyActivityPoint[]),
        getHeatmapData(userId),
        getLearningEvents(userId, eventDays),
      ]);

      setWeeklyData(weekly);
      setHeatmapData(heatmap);
      setEventHistory(events);
    };

    void loadAnalytics();
  }, [stats.totalWords, user?.id, timeRange]);

  // Calculate level based on XP using the canonical helpers from gamification.ts
  const level = computeLevel(xp.total);
  const levelName = getLevelName(xp.total);
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

    // Compute current retrievability for every non-mastered word
    const retrievabilities = progress
      .filter((p) => p.status !== 'mastered')
      .map((p) => {
        const fsrs = ensureFSRS(p as UserProgress & { fsrs?: FSRSState });
        if (fsrs.stability === 0) return 0;
        const elapsedDays = fsrs.lastReviewAt
          ? (ANALYTICS_NOW - new Date(fsrs.lastReviewAt).getTime()) / 86_400_000
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

  // Vocabulary status distribution
  const vocabDistribution = useMemo(() => {
    const counts = { new: 0, learning: 0, review: 0, mastered: 0 };
    progress.forEach((p) => {
      const status = p.status as keyof typeof counts;
      if (status in counts) counts[status]++;
    });
    return [
      { name: 'New', nameZh: '新学', count: counts.new, fill: '#6b7280' },
      { name: 'Learning', nameZh: '学习中', count: counts.learning, fill: '#3b82f6' },
      { name: 'Review', nameZh: '复习中', count: counts.review, fill: '#f59e0b' },
      { name: 'Mastered', nameZh: '已掌握', count: counts.mastered, fill: '#10b981' },
    ];
  }, [progress]);

  // Skill radar data (multi-dimensional profile)
  const radarData = useMemo(() => {
    const totalWords = Math.max(stats.totalWords, 1);
    const masteryRate = Math.round((stats.masteredWords / totalWords) * 100);
    const retentionScore = fsrsStats ? Math.round(fsrsStats.avgR * 100) : 50;
    const streakScore = Math.min(100, streak.current * 5);
    const practiceScore = Math.min(100, stats.weeklyWords * 4);
    const consistencyScore = Math.min(100, (weeklyData.filter((d) => d.words > 0).length / Math.max(weeklyData.length, 1)) * 100);
    return [
      { subject: 'Vocabulary', value: Math.min(100, Math.round(totalWords / 5)), fullMark: 100 },
      { subject: 'Mastery', value: masteryRate, fullMark: 100 },
      { subject: 'Retention', value: retentionScore, fullMark: 100 },
      { subject: 'Consistency', value: Math.round(consistencyScore), fullMark: 100 },
      { subject: 'Practice', value: practiceScore, fullMark: 100 },
      { subject: 'Streak', value: streakScore, fullMark: 100 },
    ];
  }, [stats, streak, weeklyData, fsrsStats]);

  // AI Weekly Report
  const weeklyReport = useMemo(() => {
    const totalWordsThisWeek = weeklyData.reduce((s, d) => s + d.words, 0);
    const totalXpThisWeek = weeklyData.reduce((s, d) => s + d.xp, 0);
    const activeDays = weeklyData.filter((d) => d.words > 0).length;
    const avgRetention = fsrsStats ? Math.round(fsrsStats.avgR * 100) : 0;

    const highlights: string[] = [];
    if (totalWordsThisWeek >= 30) highlights.push(`学习了 ${totalWordsThisWeek} 个单词，超过平均水平！`);
    else if (totalWordsThisWeek > 0) highlights.push(`本周学习了 ${totalWordsThisWeek} 个单词。`);

    if (activeDays >= 5) highlights.push(`${activeDays}/7 天保持学习，一致性很好。`);
    else if (activeDays > 0) highlights.push(`本周活跃 ${activeDays} 天，尝试每天至少学习一点。`);

    if (avgRetention >= 80) highlights.push(`记忆保留率 ${avgRetention}%，复习节奏掌握得不错。`);
    else if (avgRetention >= 50) highlights.push(`记忆保留率 ${avgRetention}%，建议增加复习频率。`);
    else if (avgRetention > 0) highlights.push(`记忆保留率偏低 (${avgRetention}%)，优先处理到期复习。`);

    if (streak.current >= 7) highlights.push(`连续学习 ${streak.current} 天🔥，保持住！`);

    const suggestion = avgRetention < 60
      ? '本周建议：优先做到期复习，间隔重复是记忆的核心。'
      : activeDays < 4
        ? '本周建议：提高学习频率，每天哪怕 5 分钟也比集中突击更有效。'
        : '本周建议：保持当前节奏，可以尝试提升练习难度。';

    return { totalWordsThisWeek, totalXpThisWeek, activeDays, highlights, suggestion };
  }, [weeklyData, fsrsStats, streak]);

  const hasPerfectWeek = weeklyData.length >= 7 && weeklyData.every((point) => point.words > 0);
  const badges = [
    { name: '7-Day Streak', nameZh: '7天连续', icon: Flame, color: 'text-orange-500', earned: streak.current >= 7 },
    { name: '100 Words', nameZh: '100单词', icon: BookOpen, color: 'text-emerald-500', earned: stats.totalWords >= 100 },
    { name: 'Perfect Week', nameZh: '完美一周', icon: Calendar, color: 'text-blue-500', earned: hasPerfectWeek },
    { name: 'Word Wizard', nameZh: '单词巫师', icon: Zap, color: 'text-purple-500', earned: stats.masteredWords >= 50 },
    { name: 'Master Learner', nameZh: '学习大师', icon: Award, color: 'text-yellow-500', earned: xp.total >= 1000 },
  ];

  const formatRiskDueLabel = (hoursUntilDue: number): string => {
    if (hoursUntilDue <= 0) return 'Overdue now';
    if (hoursUntilDue <= 12) return 'Due later today';
    if (hoursUntilDue <= 48) return 'Due in 1-2 days';
    return `Due in ${Math.ceil(hoursUntilDue / 24)} days`;
  };

  const reviewWindowSummary = reviewWindowInsight
    ? reviewWindowInsight.primary.share >= 0.45
      ? 'This block is already your most reliable study rhythm.'
      : 'This block has the strongest recent signal for getting reviews done.'
    : null;

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
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Activity Chart — title follows the selected time range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {timeRange === 'year' ? 'Annual Activity' : timeRange === 'month' ? 'Monthly Activity' : 'Weekly Activity'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {timeRange === 'year' ? '年度活动' : timeRange === 'month' ? '月度活动' : '本周活动'}
              </p>
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

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-emerald-500" />
                  Best Review Window
                </CardTitle>
                <p className="text-sm text-muted-foreground">推荐复习时间窗口</p>
              </CardHeader>
              <CardContent>
                {reviewWindowInsight ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                            Primary window
                          </p>
                          <p className="mt-2 text-xl font-semibold">
                            {reviewWindowInsight.primary.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reviewWindowInsight.primary.labelZh} · {reviewWindowInsight.primary.hours}
                          </p>
                        </div>
                        <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
                          {Math.round(reviewWindowInsight.primary.share * 100)}% of recent activity
                        </Badge>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        {reviewWindowSummary}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Days observed</p>
                        <p className="mt-2 text-2xl font-semibold">{reviewWindowInsight.activeDays}</p>
                        <p className="text-sm text-muted-foreground">最近 30 天里有学习行为的天数</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Backup window</p>
                        <p className="mt-2 text-lg font-semibold">
                          {reviewWindowInsight.secondary?.label || 'Keep current rhythm'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reviewWindowInsight.secondary
                            ? `${reviewWindowInsight.secondary.labelZh} · ${reviewWindowInsight.secondary.hours}`
                            : '先把主时段稳定下来，再扩展第二时段。'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                    再积累几次不同时段的学习记录，系统就能开始推荐更可信的复习时间窗口。
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Highest Forgetting Risk
                </CardTitle>
                <p className="text-sm text-muted-foreground">未来最容易忘记的词</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskWords.length > 0 ? (
                  riskWords.map((item, index) => (
                    <div
                      key={item.wordId}
                      className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            #{index + 1}
                          </span>
                          <p className="text-base font-semibold">{item.word}</p>
                          <Badge variant="outline" className="rounded-full capitalize">
                            {item.topic}
                          </Badge>
                          {item.isStubborn ? (
                            <Badge variant="secondary" className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                              Reinforce
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          R {item.retrievabilityPct}% · 难度 {item.difficulty} · 遗忘 {item.lapses} 次 · {formatRiskDueLabel(item.hoursUntilDue)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            'rounded-full px-3 py-1',
                            item.riskScore >= 75
                              ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                              : item.riskScore >= 55
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                          )}
                        >
                          {item.riskScore}% risk
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                    先完成几轮复习，系统才会开始给出更可信的遗忘风险排序。
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Weekly Report */}
          <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-500" />
                AI 周报
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-2xl font-bold text-emerald-500">{weeklyReport.totalWordsThisWeek}</p>
                  <p className="text-xs text-muted-foreground">本周单词</p>
                </div>
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-2xl font-bold text-blue-500">{weeklyReport.activeDays}/7</p>
                  <p className="text-xs text-muted-foreground">活跃天数</p>
                </div>
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-2xl font-bold text-purple-500">{weeklyReport.totalXpThisWeek}</p>
                  <p className="text-xs text-muted-foreground">本周 XP</p>
                </div>
              </div>
              <div className="space-y-2">
                {weeklyReport.highlights.map((h, i) => (
                  <p key={i} className="text-sm text-muted-foreground">• {h}</p>
                ))}
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{weeklyReport.suggestion}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Vocabulary Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>词汇掌握分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={vocabDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis type="number" stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                    <YAxis type="category" dataKey="nameZh" stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} width={60} />
                    <Tooltip
                      contentStyle={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.foreground }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {vocabDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>能力雷达图</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke={colors.border} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: colors.mutedForeground, fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: colors.mutedForeground, fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.foreground }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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

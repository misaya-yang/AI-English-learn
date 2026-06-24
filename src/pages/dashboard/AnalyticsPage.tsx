import { useState, useEffect, useMemo, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
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
  Calendar,
  ChevronUp,
  CircleGauge,
  AlertTriangle,
  Clock3,
  MessageCircleMore,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getHeatmapData,
  getLearningEvents,
  getWeeklyActivity,
  type LearningEventRecord,
  type WeeklyActivityPoint,
} from '@/services/learningEvents';
import { getStudySessions } from '@/data/localStorage';
import { computeLevel, getLevelName } from '@/services/gamification';
import { buildWeeklyLearningRecap } from '@/features/learning/weeklyRecap';
import {
  filterStudySessionsByRange,
  getAnalyticsCutoffDate,
  getAnalyticsEventWindowDays,
  type AnalyticsTimeRange,
} from './analyticsRange';

// ── Theme-aware chart color hook ─────────────────────────────────────────────
function readHslToken(style: CSSStyleDeclaration, token: string, alpha?: number): string {
  const value = style.getPropertyValue(token).trim();
  return alpha === undefined ? `hsl(${value})` : `hsl(${value} / ${alpha})`;
}

function useChartColors() {
  // Reads the current theme tokens from :root CSS vars
  const style = getComputedStyle(document.documentElement);
  const primary = readHslToken(style, '--primary');
  const practice = readHslToken(style, '--accent-practice');
  const coach = readHslToken(style, '--accent-coach');
  const exam = readHslToken(style, '--accent-exam');
  const memory = readHslToken(style, '--accent-memory');
  const error = readHslToken(style, '--accent-error');
  const success = readHslToken(style, '--success');
  const warning = readHslToken(style, '--warning');
  const muted = readHslToken(style, '--muted');
  const mutedForeground = readHslToken(style, '--muted-foreground');

  return {
    border: readHslToken(style, '--border'),
    foreground: readHslToken(style, '--foreground'),
    mutedForeground,
    muted,
    card: readHslToken(style, '--card'),
    primary,
    practice,
    coach,
    exam,
    memory,
    error,
    success,
    warning,
    words: memory,
    xp: practice,
    minutes: coach,
    baseline: error,
    topicPalette: [memory, practice, exam, coach, success, warning],
    heatmap: [
      readHslToken(style, '--muted', 0.7),
      readHslToken(style, '--accent-memory', 0.18),
      readHslToken(style, '--accent-memory', 0.35),
      readHslToken(style, '--accent-memory', 0.55),
      readHslToken(style, '--accent-memory', 0.78),
    ],
    retentionLow: error,
    retentionMedium: warning,
    retentionHigh: success,
    vocabNew: mutedForeground,
    vocabLearning: practice,
    vocabReview: warning,
    vocabMastered: success,
  };
}
const ANALYTICS_NOW = Date.now();

const analyticsCopy = {
  en: {
    headerTitle: 'Learning progress',
    headerSubtitle: 'Track completed words, reviews, and practice time.',
    timeRanges: { week: 'This week', month: 'This month', year: 'This year', all: 'All time' },
    stats: {
      totalWords: 'Total Words',
      mastered: 'Mastered',
      streak: 'Current Streak',
      xp: 'Study records',
      streakUnit: 'days',
      streakActive: 'On fire',
      streakStart: 'Start today',
      levelPrefix: 'Stage',
      xpTotal: 'Record total',
      xpNeeded: 'Records needed for next stage',
    },
    tabs: {
      overview: 'Overview',
      words: 'Words',
      retention: 'Retention',
      coach: 'Help',
      insights: 'Summary',
      badges: 'Badges',
    },
    charts: {
      activity: {
        week: 'Weekly activity',
        month: 'Monthly activity',
        year: 'Yearly activity',
        all: 'Historical activity',
        subtitleWeek: 'This week',
        subtitleMonth: 'This month',
        subtitleYear: 'This year',
        subtitleAll: 'All history',
      },
      topics: 'Topic breakdown',
      topicsSubtitle: 'Topics from completed learning evidence',
      studyTime: 'Study time',
      studyTimeSubtitle: 'Minutes practiced',
      wordsTrend: 'Vocabulary trend',
      wordsTrendSubtitle: 'Words learned over time',
      heatmap: 'Learning heatmap',
      heatmapSubtitle: 'Activity heatmap',
      heatmapLow: 'Less',
      heatmapHigh: 'More',
      retentionDistribution: 'Current memory-retention distribution',
      retentionWindow: 'Review time',
      risk: 'Words to review soon',
    },
    empty: {
      activity: {
        title: 'No activity trend yet',
        description: 'Complete a Today, Review, or Practice task before this chart appears.',
        action: 'Open Today',
      },
      topics: {
        title: 'No topic evidence yet',
        description: 'Topic breakdown uses learned and reviewed words.',
        action: 'Start today\'s words',
      },
      duration: {
        title: 'No study duration yet',
        description: 'Complete one short task and the time spent will start appearing here.',
        action: 'Do one practice set',
      },
      wordsTrend: {
        title: 'No vocabulary trend yet',
        description: 'This trend appears after words are learned or reviewed.',
        action: 'Study today\'s words',
      },
      heatmap: {
        title: 'No streak heatmap yet',
        description: 'After a few study days, this heatmap will show when you practiced.',
        action: 'Open Today',
      },
      retention: {
        title: 'No retention estimate yet',
        description: 'Review a few cards first, then this chart can estimate what needs attention.',
        action: 'Go to Review',
      },
      window: {
        title: 'No reliable review window yet',
        description: 'Study at a few different times before this view can find a useful pattern.',
        action: 'Record a study session',
      },
      risk: {
        title: 'No forgetting-risk ranking yet',
        description: 'Complete a few review rounds first.',
        action: 'Open review queue',
      },
      coach: {
        title: 'No help records yet',
        description: 'Start a chat or complete one practice set before follow-ups appear here.',
        action: 'Open help',
      },
      vocabulary: {
        title: 'No vocabulary mastery evidence yet',
        description: 'After learning or reviewing words, they will enter New, Learning, Review, and Mastered buckets.',
        action: 'Start today\'s words',
      },
      radar: {
        title: 'No skill chart yet',
        description: 'This needs vocabulary, review, and practice records.',
        action: 'Open Today',
      },
    },
    coach: {
      description: 'Chat follow-ups, completed practice, repeated mistakes, and review status.',
      diagnosed: 'Help notes',
      completed: 'Completed follow-ups',
      repeatedErrors: 'Repeated error risk',
      retention: 'Predicted retention',
      focus: 'Practice focus',
      focusDescription: 'Today and Help will start here.',
    },
    insights: {
      weeklyReport: 'Weekly summary',
      wordsStrengthened: 'Words strengthened',
      activeDays: 'Active days',
      reviewDebt: 'Review debt signals',
      insufficient: 'Not enough activity yet. Complete a Today, Review, or Practice task first.',
      strongestWaiting: 'Waiting for more activity',
      weakestPrefix: 'Needs attention',
      strongestPrefix: 'Strongest signal',
      openNext: 'Open task',
      vocabDistribution: 'Vocabulary mastery distribution',
      skillRadar: 'Skill balance',
    },
  },
  zh: {
    headerTitle: '学习进度',
    headerSubtitle: '查看已完成的单词、复习和练习时间。',
    timeRanges: { week: '本周', month: '本月', year: '今年', all: '全部' },
    stats: {
      totalWords: '总单词数',
      mastered: '已掌握',
      streak: '连续学习',
      xp: '学习记录',
      streakUnit: '天',
      streakActive: '今日有记录',
      streakStart: '从今天开始',
      levelPrefix: '阶段',
      xpTotal: '记录总数',
      xpNeeded: '到下一阶段',
    },
    tabs: {
      overview: '概览',
      words: '词汇',
      retention: '记忆保留',
      coach: '答疑',
      insights: '总结',
      badges: '成就',
    },
    charts: {
      activity: {
        week: '本周活跃度',
        month: '本月活跃度',
        year: '年度活跃度',
        all: '历史活跃度',
        subtitleWeek: '本周活动',
        subtitleMonth: '月度活动',
        subtitleYear: '年度活动',
        subtitleAll: '全部历史活动',
      },
      topics: '主题分布',
      topicsSubtitle: '来自已完成学习记录的主题',
      studyTime: '学习时长',
      studyTimeSubtitle: '学习时间',
      wordsTrend: '词汇积累趋势',
      wordsTrendSubtitle: '单词学习趋势',
      heatmap: '学习热力图',
      heatmapSubtitle: '活动热图',
      heatmapLow: '少',
      heatmapHigh: '多',
      retentionDistribution: '各单词当前记忆保留率分布',
      retentionWindow: '复习时段',
      risk: '近期要复习的词',
    },
    empty: {
      activity: {
        title: '还没有活动曲线',
        description: '完成一次今日、复习或练习后，这里会显示活动趋势。',
        action: '打开今日',
      },
      topics: {
        title: '还没有主题记录',
        description: '主题分布只使用已学习或已复习的词。',
        action: '开始今日词汇',
      },
      duration: {
        title: '还没有学习时长',
        description: '完成一次练习后，这里会显示用时。',
        action: '做一次练习',
      },
      wordsTrend: {
        title: '还没有词汇趋势',
        description: '学过或复习过单词后，这里会显示趋势。',
        action: '学习今日单词',
      },
      heatmap: {
        title: '还没有连续学习热力',
        description: '连续练几天后，这里会显示你常练习的时间。',
        action: '打开今日',
      },
      retention: {
        title: '还没有可计算的记忆保留率',
        description: '先完成几张复习卡，这里会开始估算哪些词需要注意。',
        action: '去做复习',
      },
      window: {
        title: '还没有可靠复习时段',
        description: '多积累几个时段的学习记录后，这里会显示更稳定的复习时段。',
        action: '记录一次学习',
      },
      risk: {
        title: '还没有遗忘风险排序',
        description: '先完成几轮复习。',
        action: '打开复习队列',
      },
      coach: {
        title: '还没有答疑记录',
        description: '开始一次对话或完成一次练习后，这里会显示跟进记录。',
        action: '打开答疑',
      },
      vocabulary: {
        title: '还没有词汇掌握记录',
        description: '完成学习或复习后，词汇会进入新学、学习中、复习中和已掌握分布。',
        action: '开始今日词汇',
      },
      radar: {
        title: '还没有能力分布',
        description: '这里需要词汇、复习和练习记录。',
        action: '打开今日',
      },
    },
    coach: {
      description: '本周的对话记录、练习完成情况、重复错误和复习状态。',
      diagnosed: '答疑记录',
      completed: '已完成跟进',
      repeatedErrors: '重复错误风险',
      retention: '预测保持率',
      focus: '练习重点',
      focusDescription: '今日和答疑会先处理这个薄弱点。',
    },
    insights: {
      weeklyReport: '本周总结',
      wordsStrengthened: '强化词数',
      activeDays: '活跃天数',
      reviewDebt: '待复习提醒',
      insufficient: '暂时没有足够记录。先完成一次今日、复习或练习。',
      strongestWaiting: '等待更多记录',
      weakestPrefix: '最需要处理',
      strongestPrefix: '最强信号',
      openNext: '打开练习',
      vocabDistribution: '词汇掌握分布',
      skillRadar: '能力分布',
    },
  },
} as const;

const getAnalyticsCopy = (language: string) => (
  language.startsWith('zh') ? analyticsCopy.zh : analyticsCopy.en
);

const LEVEL_NAME_ZH: Record<string, string> = {
  Novice: '入门学习者',
  Apprentice: '稳定学习者',
  Journeyman: '进阶学习者',
  Expert: '熟练学习者',
  'Word Wizard': '词汇积累者',
  'Language Master': '高阶学习者',
};

interface AnalyticsEmptyCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  className?: string;
}

function AnalyticsEmptyCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: AnalyticsEmptyCardProps) {
  return (
    <Empty className={cn('min-h-[220px] border-0 bg-transparent', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="h-5 w-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="glassPrimary" className="rounded-full" asChild>
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

const generateTopicData = (wordIds: string[], palette: string[]) => {
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
      color: palette[index % palette.length],
    }));
};

export default function AnalyticsPage() {
  const { stats, xp, streak, dailyWords, customWords, progress } = useUserData();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const language = i18n.language || 'en';
  const copy = getAnalyticsCopy(language);
  const isZh = language.startsWith('zh');
  const colors = useChartColors();
  const tooltipContentStyle = useMemo(
    () => ({
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      color: colors.foreground,
    }),
    [colors.border, colors.card, colors.foreground],
  );
  const tooltipLabelStyle = useMemo(
    () => ({ color: colors.foreground }),
    [colors.foreground],
  );
  const tooltipItemStyle = useMemo(
    () => ({ color: colors.foreground }),
    [colors.foreground],
  );
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('week');
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<Array<{ week: number; day: number; value: number }>>([]);
  const [eventHistory, setEventHistory] = useState<LearningEventRecord[]>([]);

  // Cutoff date derived from the selected time range
  const cutoffDate = useMemo(() => getAnalyticsCutoffDate(timeRange), [timeRange]);

  // Derive topic data filtered by the selected time range
  const topicData = useMemo(() => {
    if (progress.length === 0) return [];
    const filtered = cutoffDate
      ? progress.filter((p) => {
          const ts = p.updatedAt ?? p.firstSeenAt;
          if (!ts) return false;
          return new Date(ts) >= cutoffDate;
        })
      : progress;
    const ids = filtered.map((p) => p.wordId);
    return generateTopicData(ids, colors.topicPalette);
  }, [progress, cutoffDate, colors.topicPalette]);

  const riskWords = useMemo(
    () => computeHighRiskWords(progress, [...customWords, ...dailyWords, ...wordsDatabase]),
    [customWords, dailyWords, progress],
  );
  const reviewWindowInsight = useMemo(() => computeReviewWindows(eventHistory), [eventHistory]);

  useEffect(() => {
    const userId = user?.id || 'guest';

    const loadAnalytics = async () => {
      // Map timeRange to how many days of event history to fetch
      const eventDays = getAnalyticsEventWindowDays(timeRange);

      const [weekly, heatmap, events] = await Promise.all([
        // getWeeklyActivity always returns last-7-day buckets; only include for week view
        timeRange === 'week' ? getWeeklyActivity(userId) : Promise.resolve([] as WeeklyActivityPoint[]),
        getHeatmapData(userId),
        getLearningEvents(userId, eventDays),
      ]);

      // For month/year/all views build activity buckets from study sessions
      let displayData = weekly;
      if (timeRange !== 'week') {
        const sessions = filterStudySessionsByRange(getStudySessions(userId), timeRange);

        if (timeRange === 'month') {
          // Group by individual day for the last 30 days
          const dayMap = new Map<string, WeeklyActivityPoint>();
          for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const iso = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { month: 'numeric', day: 'numeric' });
            dayMap.set(iso, { day: label, date: iso, words: 0, xp: 0, minutes: 0, events: 0 });
          }
          sessions.forEach((s) => {
            if (dayMap.has(s.date)) {
              const pt = dayMap.get(s.date)!;
              pt.words += s.wordsLearned;
              pt.xp += s.xpEarned;
              pt.minutes += s.duration;
              pt.events += s.wordsStudied;
            }
          });
          displayData = Array.from(dayMap.values());
        } else {
          // year or all: group by calendar month (YYYY-MM label)
          const monthMap = new Map<string, WeeklyActivityPoint>();
          sessions.forEach((s) => {
            const monthKey = s.date.slice(0, 7); // YYYY-MM
            if (!monthMap.has(monthKey)) {
              const [y, m] = monthKey.split('-');
              const label = isZh
                ? `${y}年${parseInt(m)}月`
                : new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              monthMap.set(monthKey, { day: label, date: monthKey, words: 0, xp: 0, minutes: 0, events: 0 });
            }
            const pt = monthMap.get(monthKey)!;
            pt.words += s.wordsLearned;
            pt.xp += s.xpEarned;
            pt.minutes += s.duration;
            pt.events += s.wordsStudied;
          });
          displayData = Array.from(monthMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        }
      }

      setWeeklyData(displayData);
      setHeatmapData(heatmap);
      setEventHistory(events);
    };

    void loadAnalytics();
  }, [isZh, stats.totalWords, user?.id, timeRange]);

  // Calculate level based on XP using the canonical helpers from gamification.ts
  const level = computeLevel(xp.total);
  const levelName = getLevelName(xp.total);
  const levelNameDisplay = isZh ? (LEVEL_NAME_ZH[levelName] || levelName) : levelName;
  const streakCurrent = streak.current;
  // XP progress within the current level (0–99)
  const xpInCurrentLevel = xp.total % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;

  const statCards = [
    {
      title: 'Total Words',
      label: copy.stats.totalWords,
      value: stats.totalWords.toString(),
      change: `+${stats.weeklyWords}`,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Mastered',
      label: copy.stats.mastered,
      value: stats.masteredWords.toString(),
      change: `${Math.round((stats.masteredWords / Math.max(1, stats.totalWords)) * 100)}%`,
      icon: Target,
      color: 'text-[hsl(var(--accent-practice))]',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Current Streak',
      label: copy.stats.streak,
      value: `${streakCurrent} ${copy.stats.streakUnit}`,
      change: streakCurrent > 0 ? copy.stats.streakActive : copy.stats.streakStart,
      icon: Calendar,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      title: 'Study records',
      label: copy.stats.xp,
      value: xp.total.toString(),
      change: `${copy.stats.levelPrefix} ${level}`,
      icon: CircleGauge,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
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
      fill: i >= 3 ? colors.retentionHigh : i === 2 ? colors.retentionMedium : colors.retentionLow,
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
  }, [progress, colors.retentionHigh, colors.retentionLow, colors.retentionMedium]);

  // Vocabulary status distribution
  const vocabDistribution = useMemo(() => {
    const counts = { new: 0, learning: 0, review: 0, mastered: 0 };
    progress.forEach((p) => {
      const status = p.status as keyof typeof counts;
      if (status in counts) counts[status]++;
    });
    return [
      { name: 'New', nameZh: '新学', count: counts.new, fill: colors.vocabNew },
      { name: 'Learning', nameZh: '学习中', count: counts.learning, fill: colors.vocabLearning },
      { name: 'Review', nameZh: '复习中', count: counts.review, fill: colors.vocabReview },
      { name: 'Mastered', nameZh: '已掌握', count: counts.mastered, fill: colors.vocabMastered },
    ];
  }, [progress, colors.vocabLearning, colors.vocabMastered, colors.vocabNew, colors.vocabReview]);

  // Skill radar data (multi-dimensional profile)
  const radarData = useMemo(() => {
    const totalWords = Math.max(stats.totalWords, 1);
    const masteryRate = Math.round((stats.masteredWords / totalWords) * 100);
    const retentionScore = fsrsStats ? Math.round(fsrsStats.avgR * 100) : 50;
    const streakScore = Math.min(100, streakCurrent * 5);
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
  }, [stats, streakCurrent, weeklyData, fsrsStats]);

  const weeklyReport = useMemo(
    () => buildWeeklyLearningRecap({ events: eventHistory, weeklyActivity: weeklyData, progress }),
    [eventHistory, progress, weeklyData],
  );

  const coachImpact = useMemo(() => {
    const coachEvents = eventHistory.filter((event) =>
      event.eventName.startsWith('chat.') ||
      event.eventName.includes('quiz') ||
      event.eventName.includes('writing') ||
      event.eventName.includes('practice'),
    );
    const reinforcementEvents = eventHistory.filter((event) =>
      event.eventName === 'review.word_rated' ||
      event.eventName === 'mission.task_completed',
    );
    const repeatedErrors = riskWords.filter((item) => item.isStubborn).length;
    const retentionPct = fsrsStats ? Math.round(fsrsStats.avgR * 100) : 0;
    const primaryFocus = riskWords[0]?.topic || reviewWindowInsight?.primary.label || null;

    return {
      diagnosed: coachEvents.length,
      completedReinforcements: reinforcementEvents.length,
      repeatedErrors,
      retentionPct,
      primaryFocus,
    };
  }, [eventHistory, fsrsStats, reviewWindowInsight, riskWords]);

  const hasActivitySignal = weeklyData.some((point) =>
    point.words > 0 || point.xp > 0 || point.minutes > 0 || point.events > 0,
  );
  const hasHeatmapSignal = heatmapData.some((point) => point.value > 0);
  const hasVocabularyEvidence = progress.length > 0;
  const hasRetentionEvidence = Boolean(fsrsStats && fsrsStats.total > 0);
  const hasCoachEvidence =
    coachImpact.diagnosed > 0 ||
    coachImpact.completedReinforcements > 0 ||
    coachImpact.repeatedErrors > 0 ||
    coachImpact.retentionPct > 0 ||
    Boolean(coachImpact.primaryFocus);
  const hasAnyLearningEvidence = hasActivitySignal || hasHeatmapSignal || hasVocabularyEvidence || hasCoachEvidence;

  const hasPerfectWeek = weeklyData.length >= 7 && weeklyData.every((point) => point.words > 0);
  const badges = [
    { name: '7-day streak', nameZh: '连续 7 天', detailZh: '按时完成每日学习', detailEn: 'Kept daily study going', icon: Calendar, color: 'text-muted-foreground', earned: streakCurrent >= 7 },
    { name: '100 words', nameZh: '累计 100 词', detailZh: '词汇量达到 100', detailEn: 'Reached 100 learned words', icon: BookOpen, color: 'text-muted-foreground', earned: stats.totalWords >= 100 },
    { name: 'Full week', nameZh: '完整一周', detailZh: '本周每天都有记录', detailEn: 'Recorded activity every day this week', icon: Calendar, color: 'text-muted-foreground', earned: hasPerfectWeek },
    { name: 'Vocabulary milestone', nameZh: '词汇里程碑', detailZh: '已掌握词数达到 50', detailEn: 'Mastered 50 words', icon: Target, color: 'text-muted-foreground', earned: stats.masteredWords >= 50 },
    { name: 'Steady learner', nameZh: '稳定学习者', detailZh: '学习记录达到 1000', detailEn: 'Reached 1000 study records', icon: CircleGauge, color: 'text-muted-foreground', earned: xp.total >= 1000 },
  ];

  const formatRiskDueLabel = (hoursUntilDue: number): string => {
    if (isZh) {
      if (hoursUntilDue <= 0) return '已到期';
      if (hoursUntilDue <= 12) return '今天稍后到期';
      if (hoursUntilDue <= 48) return '1-2 天内到期';
      return `${Math.ceil(hoursUntilDue / 24)} 天后到期`;
    }
    if (hoursUntilDue <= 0) return 'Overdue now';
    if (hoursUntilDue <= 12) return 'Due later today';
    if (hoursUntilDue <= 48) return 'Due in 1-2 days';
    return `Due in ${Math.ceil(hoursUntilDue / 24)} days`;
  };

  const reviewWindowSummary = reviewWindowInsight
    ? reviewWindowInsight.primary.share >= 0.45
      ? (isZh ? '这个时段是你最常练习的时间。' : 'This is your most common study block.')
      : (isZh ? '这个时段最近最容易完成复习。' : 'This block has the strongest recent signal for getting reviews done.')
    : null;
  const activityTitle =
    timeRange === 'year' ? copy.charts.activity.year :
    timeRange === 'month' ? copy.charts.activity.month :
    timeRange === 'all' ? copy.charts.activity.all :
    copy.charts.activity.week;
  const activitySubtitle =
    timeRange === 'year' ? copy.charts.activity.subtitleYear :
    timeRange === 'month' ? copy.charts.activity.subtitleMonth :
    timeRange === 'all' ? copy.charts.activity.subtitleAll :
    copy.charts.activity.subtitleWeek;

  return (
    <div className="dense-solid-route max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{copy.headerTitle}</h1>
          <p className="text-muted-foreground">{copy.headerSubtitle}</p>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as AnalyticsTimeRange)}>
          <SelectTrigger className="liquid-glass-control w-full rounded-full border-border/65 bg-transparent md:w-[150px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder={copy.timeRanges.week} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{copy.timeRanges.week}</SelectItem>
            <SelectItem value="month">{copy.timeRanges.month}</SelectItem>
            <SelectItem value="year">{copy.timeRanges.year}</SelectItem>
            <SelectItem value="all">{copy.timeRanges.all}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hasAnyLearningEvidence && (
        <div className="analytics-solid-panel mb-6 border-l py-2 pl-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-[hsl(var(--accent-memory)/0.1)] text-[hsl(var(--accent-memory))]">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {isZh ? '还没有学习记录，所以这里暂时为空。' : 'No learning records yet, so trends stay empty.'}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {isZh
                    ? '完成一次今日、复习或练习后，图表会开始显示学习记录、复习时段和需要注意的词。'
                    : 'Complete Today, Review, or Practice once and charts will start showing records, review timing, and words to watch.'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link to="/dashboard/today">{isZh ? '开始今日' : 'Start Today'}</Link>
              </Button>
              <Button asChild variant="glass" className="rounded-full">
                <Link to="/dashboard/practice">{isZh ? '做一次练习' : 'Practice'}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ChevronUp className="h-3 w-3 text-[hsl(var(--success))]" />
                    <span className="text-xs text-[hsl(var(--success))]">{stat.change}</span>
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
              <CircleGauge className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{copy.stats.levelPrefix} {level} - {levelNameDisplay}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {xp.total} {copy.stats.xpTotal}
            </span>
          </div>
          <div className="h-2 w-full rounded-md bg-muted">
            <div className="h-2 rounded-md bg-primary transition-all" style={{ width: `${xpInCurrentLevel}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isZh
              ? `${xpInCurrentLevel} / 100 记录，距离阶段 ${level + 1} 还需 ${xpToNextLevel} 记录`
              : `${xpInCurrentLevel} / 100 points, ${xpToNextLevel} points needed for level ${level + 1}`}
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="liquid-glass-control h-auto w-full justify-start overflow-x-auto rounded-full border border-border/60 bg-transparent p-1 sm:w-fit">
          <TabsTrigger value="overview">{copy.tabs.overview}</TabsTrigger>
          <TabsTrigger value="words">{copy.tabs.words}</TabsTrigger>
          <TabsTrigger value="retention">{copy.tabs.retention}</TabsTrigger>
          <TabsTrigger value="coach-impact">{copy.tabs.coach}</TabsTrigger>
          <TabsTrigger value="insights">{copy.tabs.insights}</TabsTrigger>
          <TabsTrigger value="badges">{copy.tabs.badges}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Activity Chart — title follows the selected time range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{activityTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{activitySubtitle}</p>
            </CardHeader>
            <CardContent>
              {hasActivitySignal ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="day" stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                    <YAxis stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                    <Bar dataKey="words" fill={colors.words} name={isZh ? '学习词数' : 'Words learned'} />
                    <Bar dataKey="xp" fill={colors.xp} name={isZh ? '学习记录' : 'Points earned'} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <AnalyticsEmptyCard
                  icon={Calendar}
                  title={copy.empty.activity.title}
                  description={copy.empty.activity.description}
                  actionLabel={copy.empty.activity.action}
                  actionHref="/dashboard/today"
                />
              )}
            </CardContent>
          </Card>

          {/* Topic Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{copy.charts.topics}</CardTitle>
                <p className="text-sm text-muted-foreground">{copy.charts.topicsSubtitle}</p>
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
                        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {topicData.map((topic) => (
                        <div key={topic.name} className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: topic.color }} />
                          <span className="text-xs">{topic.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <AnalyticsEmptyCard
                    icon={BookOpen}
                    title={copy.empty.topics.title}
                    description={copy.empty.topics.description}
                    actionLabel={copy.empty.topics.action}
                    actionHref="/dashboard/today"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{copy.charts.studyTime}</CardTitle>
                <p className="text-sm text-muted-foreground">{copy.charts.studyTimeSubtitle}</p>
            </CardHeader>
            <CardContent>
                {hasActivitySignal ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="day" stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                      <YAxis stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        stroke={colors.minutes}
                        fill={colors.minutes}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <AnalyticsEmptyCard
                    icon={Clock3}
                    title={copy.empty.duration.title}
                    description={copy.empty.duration.description}
                    actionLabel={copy.empty.duration.action}
                    actionHref="/dashboard/practice"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="words" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{copy.charts.wordsTrend}</CardTitle>
              <p className="text-sm text-muted-foreground">{copy.charts.wordsTrendSubtitle}</p>
            </CardHeader>
            <CardContent>
              {hasActivitySignal ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="day" stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                    <YAxis stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                    <Line
                      type="monotone"
                      dataKey="words"
                      stroke={colors.words}
                      strokeWidth={2}
                      dot={{ fill: colors.words }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <AnalyticsEmptyCard
                  icon={BookOpen}
                  title={copy.empty.wordsTrend.title}
                  description={copy.empty.wordsTrend.description}
                  actionLabel={copy.empty.wordsTrend.action}
                  actionHref="/dashboard/today"
                />
              )}
            </CardContent>
          </Card>

          {/* Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{copy.charts.heatmap}</CardTitle>
              <p className="text-sm text-muted-foreground">{copy.charts.heatmapSubtitle}</p>
            </CardHeader>
            <CardContent>
              {hasHeatmapSignal ? (
                <>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 52 }).map((_, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                          const dataPoint = heatmapData.find(
                            (d) => d.week === weekIndex && d.day === dayIndex
                          );
                          const intensity = dataPoint?.value || 0;
                          const heatmapColor = colors.heatmap[Math.min(4, Math.max(0, intensity))];
                          return (
                            <div
                              key={dayIndex}
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: heatmapColor }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs text-muted-foreground">{copy.charts.heatmapLow}</span>
                    <div className="flex gap-1">
                      {colors.heatmap.map((color, index) => (
                        <div key={index} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{copy.charts.heatmapHigh}</span>
                  </div>
                </>
              ) : (
                <AnalyticsEmptyCard
                  icon={Calendar}
                  title={copy.empty.heatmap.title}
                  description={copy.empty.heatmap.description}
                  actionLabel={copy.empty.heatmap.action}
                  actionHref="/dashboard/today"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          {/* Average retrievability gauge */}
          {hasRetentionEvidence && fsrsStats ? (
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="col-span-1">
                <CardContent className="p-5 flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-xs text-muted-foreground">
                    {isZh ? '平均可回忆率' : 'Avg. retrievability'}
                  </p>
                  <p className="text-[2.25rem] font-semibold text-[hsl(var(--success))] leading-none">
                    {Math.round(fsrsStats.avgR * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {isZh ? `${fsrsStats.total} 个词正在由 FSRS-5 跟踪` : `${fsrsStats.total} active words tracked by FSRS-5`}
                  </p>
                  <div className="mt-1 h-2 w-full rounded-md bg-muted">
                    <div
                      className="h-2 rounded-md bg-primary transition-all"
                      style={{ width: `${Math.round(fsrsStats.avgR * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{isZh ? '目标：不低于 85%' : 'Target: >= 85%'}</p>
                </CardContent>
              </Card>

              {/* Retrievability histogram */}
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {isZh ? '当前可回忆率分布' : 'Current retrievability distribution'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{copy.charts.retentionDistribution}</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={fsrsStats.histData} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
                      <XAxis dataKey="label" stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 11 }} />
                      <YAxis allowDecimals={false} stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 11 }} />
                      <Tooltip
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                        formatter={(v: number) => [isZh ? `${v} 个词` : `${v} words`, isZh ? '数量' : 'Count']}
                      />
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
          ) : (
            <AnalyticsEmptyCard
              icon={Target}
              title={copy.empty.retention.title}
              description={copy.empty.retention.description}
              actionLabel={copy.empty.retention.action}
              actionHref="/dashboard/review"
            />
          )}

          {/* FSRS forgetting curve vs baseline */}
          {hasRetentionEvidence && fsrsStats ? (
            <Card>
              <CardHeader>
	                <CardTitle className="text-lg">
                    {isZh ? 'FSRS-5 与基础遗忘曲线对比' : 'FSRS-5 vs. baseline forgetting curve'}
                  </CardTitle>
	                <p className="text-sm text-muted-foreground">
                    {isZh ? '对比当前复习算法和没有间隔复习时的遗忘速度。' : 'Compare the current review model with a no-SRS baseline.'}
                  </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={fsrsStats.curvePoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="day" stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                    <YAxis domain={[0, 100]} unit="%" stroke={colors.border} tick={{ fill: colors.mutedForeground, fontSize: 12 }} />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                      formatter={(v: number) => [`${v}%`]}
                    />
                    <Line
	                      type="monotone" dataKey="fsrs" name={isZh ? 'FSRS-5（你的平均稳定度）' : 'FSRS-5 (your avg stability)'}
                      stroke={colors.retentionHigh} strokeWidth={2.5} dot={{ fill: colors.retentionHigh, r: 3 }}
                    />
                    <Line
	                      type="monotone" dataKey="baseline" name={isZh ? '无间隔复习（艾宾浩斯）' : 'No SRS (Ebbinghaus)'}
                      stroke={colors.baseline} strokeWidth={1.5} strokeDasharray="4 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
		                <div className="mt-3 flex gap-2 border-l border-[hsl(var(--success)/0.34)] bg-[hsl(var(--success)/0.08)] px-3 py-2">
	                  <span className="text-lg text-[hsl(var(--success))]">✓</span>
	                  <p className="text-sm text-[hsl(var(--success))]">
	                    {isZh
                        ? 'FSRS-5 会围绕每次复习后的目标保持率安排下一次复习，尽量在遗忘前提醒你。'
                        : 'FSRS-5 targets strong retention at each review interval, scheduling your next review just before you would forget.'}
	                  </p>
	                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-primary" />
	                  {isZh ? '最佳复习窗口' : 'Best review window'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{copy.charts.retentionWindow}</p>
              </CardHeader>
              <CardContent>
                {reviewWindowInsight ? (
                  <div className="space-y-4">
		                    <div className="border-l border-primary/30 bg-primary/10 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-primary">
	                            {isZh ? '主复习时段' : 'Primary window'}
                          </p>
                          <p className="mt-2 text-xl font-semibold">
	                            {isZh ? reviewWindowInsight.primary.labelZh : reviewWindowInsight.primary.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
	                            {reviewWindowInsight.primary.hours}
                          </p>
                        </div>
	                        <Badge className="rounded-md bg-primary/[0.12] text-primary hover:bg-primary/[0.16]">
	                          {Math.round(reviewWindowInsight.primary.share * 100)}% {isZh ? '近期学习' : 'of recent activity'}
                        </Badge>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        {reviewWindowSummary}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="analytics-muted-panel rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">{isZh ? '观察到的学习日' : 'Days observed'}</p>
                        <p className="mt-2 text-2xl font-semibold">{reviewWindowInsight.activeDays}</p>
                        <p className="text-sm text-muted-foreground">最近 30 天里有学习行为的天数</p>
                      </div>
                      <div className="analytics-muted-panel rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">{isZh ? '备用时段' : 'Backup window'}</p>
                        <p className="mt-2 text-lg font-semibold">
                          {reviewWindowInsight.secondary
                            ? (isZh ? reviewWindowInsight.secondary.labelZh : reviewWindowInsight.secondary.label)
                            : (isZh ? '先固定一个时段' : 'Keep one study block')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reviewWindowInsight.secondary
                            ? reviewWindowInsight.secondary.hours
                            : (isZh ? '先把一个学习时段坚持下来，再增加第二个时段。' : 'Keep one study block before adding a second one.')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <AnalyticsEmptyCard
                    icon={Clock3}
                    title={copy.empty.window.title}
                    description={copy.empty.window.description}
                    actionLabel={copy.empty.window.action}
                    actionHref="/dashboard/today"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
	                <CardTitle className="text-lg flex items-center gap-2">
	                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
	                  {isZh ? '最高遗忘风险' : 'Highest forgetting risk'}
	                </CardTitle>
                <p className="text-sm text-muted-foreground">{copy.charts.risk}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskWords.length > 0 ? (
                  riskWords.map((item, index) => (
                    <div
                      key={item.wordId}
                      className="analytics-muted-panel flex flex-col gap-3 rounded-lg border px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            #{index + 1}
                          </span>
                          <p className="text-base font-semibold">{item.word}</p>
                          <Badge variant="outline" className="rounded-md capitalize">
                            {item.topic}
                          </Badge>
                          {item.isStubborn ? (
                            <Badge variant="secondary" className="rounded-md bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]">
	                              {isZh ? '需要补强' : 'Reinforce'}
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
                            'rounded-md px-3 py-1',
                            item.riskScore >= 75
                              ? 'bg-destructive/10 text-destructive'
                              : item.riskScore >= 55
                                ? 'bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]'
                                : 'bg-[hsl(var(--success)/0.10)] text-[hsl(var(--success))]',
                          )}
                        >
	                          {item.riskScore}% {isZh ? '风险' : 'risk'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <AnalyticsEmptyCard
                    icon={AlertTriangle}
                    title={copy.empty.risk.title}
                    description={copy.empty.risk.description}
                    actionLabel={copy.empty.risk.action}
                    actionHref="/dashboard/review"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coach-impact" className="space-y-6">
          {hasCoachEvidence ? (
            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircleMore className="h-5 w-5 text-primary" />
                  {copy.tabs.coach}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {copy.coach.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		                  <div className="border-l border-border/20 py-1 pl-3">
	                    <p className="text-xs text-muted-foreground">{copy.coach.diagnosed}</p>
	                    <p className="mt-2 text-2xl font-semibold">{coachImpact.diagnosed}</p>
	                    <p className="mt-1 text-xs text-muted-foreground">
                        {isZh ? '对话 / 测验 / 练习事件' : 'chat / quiz / practice events'}
                      </p>
	                  </div>
		                  <div className="border-l border-border/20 py-1 pl-3">
	                    <p className="text-xs text-muted-foreground">{copy.coach.completed}</p>
	                    <p className="mt-2 text-2xl font-semibold">{coachImpact.completedReinforcements}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isZh ? '复习卡片 + 已完成练习' : 'review cards + completed practice'}
                      </p>
	                  </div>
		                  <div className="border-l border-border/20 py-1 pl-3">
	                    <p className="text-xs text-muted-foreground">{copy.coach.repeatedErrors}</p>
	                    <p className="mt-2 text-2xl font-semibold">{coachImpact.repeatedErrors}</p>
	                    <p className="mt-1 text-xs text-muted-foreground">
                        {isZh ? '反复遗忘词' : 'stubborn FSRS items'}
                      </p>
	                  </div>
		                  <div className="border-l border-border/20 py-1 pl-3">
	                    <p className="text-xs text-muted-foreground">{copy.coach.retention}</p>
	                    <p className="mt-2 text-2xl font-semibold">{coachImpact.retentionPct}%</p>
	                    <p className="mt-1 text-xs text-muted-foreground">
                        {isZh ? '活跃词平均保持率' : 'active FSRS average'}
                      </p>
	                  </div>
                </div>

                {coachImpact.primaryFocus ? (
		                  <div className="border-l border-primary/25 bg-primary/5 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {copy.coach.focus}
                    </p>
                    <p className="mt-2 text-lg font-semibold capitalize">{coachImpact.primaryFocus}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {copy.coach.focusDescription}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <AnalyticsEmptyCard
              icon={MessageCircleMore}
              title={copy.empty.coach.title}
              description={copy.empty.coach.description}
              actionLabel={copy.empty.coach.action}
              actionHref="/dashboard/chat"
            />
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Evidence-backed Weekly Report */}
          <Card className="border-primary/20 bg-primary/[0.04]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleGauge className="h-5 w-5 text-muted-foreground" />
                {copy.insights.weeklyReport}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
		                <div className="border-l border-border/20 py-1 pl-3 text-left">
                  <p className="text-2xl font-bold text-[hsl(var(--success))]">{weeklyReport.wordsStrengthened}</p>
                  <p className="text-xs text-muted-foreground">{copy.insights.wordsStrengthened}</p>
                </div>
		                <div className="border-l border-border/20 py-1 pl-3 text-left">
                  <p className="text-2xl font-bold text-[hsl(var(--accent-practice))]">{weeklyReport.activeDays}/7</p>
                  <p className="text-xs text-muted-foreground">{copy.insights.activeDays}</p>
                </div>
		                <div className="border-l border-border/20 py-1 pl-3 text-left">
                  <p className="text-2xl font-bold text-muted-foreground">{weeklyReport.reviewDebtTrend.count}</p>
                  <p className="text-xs text-muted-foreground">{copy.insights.reviewDebt}</p>
                </div>
              </div>
              <div className="space-y-2">
                {weeklyReport.highlights.length > 0 ? weeklyReport.highlights.map((h, i) => (
                  <p key={i} className="text-sm text-muted-foreground">• {h.zh}</p>
                )) : (
                  <p className="text-sm text-muted-foreground">
                    {copy.insights.insufficient}
                  </p>
                )}
              </div>
              <div className="border-l border-primary/25 bg-primary/5 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  {weeklyReport.strongestSkill
                    ? `${copy.insights.strongestPrefix}: ${isZh ? weeklyReport.strongestSkill.labelZh : weeklyReport.strongestSkill.label}`
                    : copy.insights.strongestWaiting}
                  {' · '}
                  {weeklyReport.weakestPattern
                    ? `${copy.insights.weakestPrefix}: ${isZh ? weeklyReport.weakestPattern.labelZh : weeklyReport.weakestPattern.label}`
                    : (isZh ? weeklyReport.reviewDebtTrend.labelZh : weeklyReport.reviewDebtTrend.label)}
                </p>
                <p className="mt-2 text-sm font-medium text-primary">
                  {isZh ? weeklyReport.nextRecommendation.zh : weeklyReport.nextRecommendation.en}
                </p>
                <Button size="sm" variant="glassPrimary" className="mt-3 rounded-full" asChild>
                  <Link to={weeklyReport.nextRecommendation.href}>{copy.insights.openNext}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Vocabulary Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{copy.insights.vocabDistribution}</CardTitle>
              </CardHeader>
              <CardContent>
                {hasVocabularyEvidence ? (
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
                ) : (
                  <AnalyticsEmptyCard
                    icon={BookOpen}
                    title={copy.empty.vocabulary.title}
                    description={copy.empty.vocabulary.description}
                    actionLabel={copy.empty.vocabulary.action}
                    actionHref="/dashboard/today"
                  />
                )}
              </CardContent>
            </Card>

            {/* Skill Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{copy.insights.skillRadar}</CardTitle>
              </CardHeader>
              <CardContent>
                {hasVocabularyEvidence || hasActivitySignal ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData} outerRadius="75%">
                      <PolarGrid stroke={colors.border} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: colors.mutedForeground, fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: colors.mutedForeground, fontSize: 10 }} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke={colors.retentionHigh}
                        fill={colors.retentionHigh}
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.foreground }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <AnalyticsEmptyCard
                    icon={Target}
                    title={copy.empty.radar.title}
                    description={copy.empty.radar.description}
                    actionLabel={copy.empty.radar.action}
                    actionHref="/dashboard/today"
                  />
                )}
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
	                      'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md',
                      badge.earned ? 'bg-muted' : 'bg-muted/50'
                    )}
                  >
                    <badge.icon
                      className={cn(
                        'h-6 w-6',
                        badge.earned ? badge.color : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <p className="font-medium text-sm">{isZh ? badge.nameZh : badge.name}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{isZh ? badge.detailZh : badge.detailEn}</p>
                  {badge.earned && (
                    <Badge variant="secondary" className="mt-2 rounded-md">
                      {isZh ? '已获得' : 'Earned'}
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

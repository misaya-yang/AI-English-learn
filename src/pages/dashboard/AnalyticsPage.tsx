import { useState, useEffect } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
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

const generateTopicData = (dailyWords: Array<{ topic: string }>) => {
  const topicCounts: Record<string, number> = {};
  dailyWords.forEach((word) => {
    topicCounts[word.topic] = (topicCounts[word.topic] || 0) + 1;
  });
  
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];
  return Object.entries(topicCounts).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: colors[index % colors.length],
  }));
};

const badges = [
  { name: '7-Day Streak', nameZh: '7天连续', icon: Flame, color: 'text-orange-500', earned: true },
  { name: '100 Words', nameZh: '100单词', icon: BookOpen, color: 'text-emerald-500', earned: false },
  { name: 'Perfect Week', nameZh: '完美一周', icon: Calendar, color: 'text-blue-500', earned: false },
  { name: 'Word Wizard', nameZh: '单词巫师', icon: Zap, color: 'text-purple-500', earned: false },
  { name: 'Master Learner', nameZh: '学习大师', icon: Award, color: 'text-yellow-500', earned: false },
];

export default function AnalyticsPage() {
  const { stats, xp, streak, dailyWords } = useUserData();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week');
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<Array<{ week: number; day: number; value: number }>>([]);
  const [topicData, setTopicData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    setTopicData(generateTopicData(dailyWords));
  }, [dailyWords]);

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
  }, [stats.totalWords, timeRange, user?.id]);

  // Calculate level based on XP
  const level = Math.floor(xp.total / 100) + 1;
  const levelName = level < 5 ? 'Novice' : level < 10 ? 'Apprentice' : level < 20 ? 'Journeyman' : 'Expert';

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

  // Retention curve data
  const masteryRatio = stats.totalWords > 0 ? stats.masteredWords / stats.totalWords : 0.35;
  const baseline = Math.round(40 + masteryRatio * 45);
  const retentionData = [
    { day: 'Day 1', retention: 100 },
    { day: 'Day 3', retention: Math.min(95, baseline + 18) },
    { day: 'Day 7', retention: Math.min(90, baseline + 10) },
    { day: 'Day 14', retention: Math.min(85, baseline + 4) },
    { day: 'Day 30', retention: baseline },
    { day: 'Day 60', retention: Math.max(30, baseline - 6) },
    { day: 'Day 90', retention: Math.max(25, baseline - 10) },
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
              {xp.total} / {(level * 100)} XP
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all"
              style={{ width: `${(xp.today / 100) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {100 - xp.today} XP needed for next level
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Retention Curve</CardTitle>
              <p className="text-sm text-muted-foreground">记忆保留曲线</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="retention"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Retention Rate:</strong> Using our SRS system helps you retain up to 90% of words after 30 days.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  使用我们的 SRS 系统，30 天后保留率可达 90%。
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

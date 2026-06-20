import { Link, Outlet, useLocation } from 'react-router-dom';
import { useMemo, useState, type ComponentType } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SearchPalette, useSearchPalette } from '@/components/SearchPalette';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BottomNavBar } from '@/components/BottomNavBar';
import { StreakCounter } from '@/components/StreakCounter';
import { XPProgressBar } from '@/components/XPProgressBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStudyReminder } from '@/hooks/useStudyReminder';
import { useTranslation } from 'react-i18next';
import { buildLifecycleNotification } from '@/features/learning/lifecycleNotifications';
import {
  BookOpen,
  BookText,
  Brain,
  BarChart2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Headphones,
  GraduationCap,
  LayoutGrid,
  AudioLines,
  PenTool,
  Library,
  LogOut,
  Menu,
  MessageCircleMore,
  Search,
  Settings,
  Shield,
  Target,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isLocalAuthUserId } from '@/lib/localAuthIdentity';

interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string | number | null;
}

const LEARNING_ROUTE_PREFIXES = ['/dashboard/today', '/dashboard/review', '/dashboard/practice'] as const;

type LocalizedText = { en: string; zh: string };

const pickLocalized = (text: LocalizedText, isZh: boolean): string => (isZh ? text.zh : text.en);

const localDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const shellTitleMap: Record<string, { title: LocalizedText; description: LocalizedText }> = {
  '/dashboard/today': {
    title: { en: 'Today', zh: '今日' },
    description: { en: 'Review, new words, and practice.', zh: '复习、新词和练习。' },
  },
  '/dashboard/review': {
    title: { en: 'Review', zh: '复习' },
    description: { en: 'Cards that are due today.', zh: '今天到期的词卡。' },
  },
  '/dashboard/practice': {
    title: { en: 'Practice', zh: '练习' },
    description: { en: 'Quizzes, dictation, and writing.', zh: '测验、听写和写作。' },
  },
  '/dashboard/chat': {
    title: { en: 'Help', zh: '答疑' },
    description: { en: 'Ask questions, revise sentences, and practice mistakes.', zh: '提问、改句和错题练习。' },
  },
  '/dashboard/exam': {
    title: { en: 'Exam Prep', zh: '考试训练' },
    description: { en: 'IELTS practice, timed prompts, and writing feedback.', zh: 'IELTS 练习、计时题和写作反馈。' },
  },
  '/dashboard/vocabulary': {
    title: { en: 'Vocabulary', zh: '词汇' },
    description: { en: 'Manage word books and imported lists.', zh: '管理词书和导入词表。' },
  },
  '/dashboard/analytics': {
    title: { en: 'Progress', zh: '学习进度' },
    description: { en: 'See completed practice, review, and study time.', zh: '查看已完成的练习、复习和学习时间。' },
  },
  '/dashboard/memory': {
    title: { en: 'Memory', zh: '记忆' },
    description: { en: 'Manage reusable learning notes.', zh: '管理下次练习可用的信息。' },
  },
  '/dashboard/pronunciation': {
    title: { en: 'Pronunciation', zh: '发音练习' },
    description: { en: 'Practice sounds, stress, and short spoken answers.', zh: '练发音、重音和短口语回答。' },
  },
  '/dashboard/writing': {
    title: { en: 'Writing', zh: '写作练习' },
    description: { en: 'Write, score, and revise short answers.', zh: '写一段、看评分、再修改。' },
  },
  '/dashboard/reading': {
    title: { en: 'Reading', zh: '阅读' },
    description: { en: 'Reading drills.', zh: '阅读练习。' },
  },
  '/dashboard/listening': {
    title: { en: 'Listening', zh: '听力' },
    description: { en: 'Listening drills.', zh: '听力练习。' },
  },
  '/dashboard/grammar': {
    title: { en: 'Grammar', zh: '语法' },
    description: { en: 'Grammar drills.', zh: '语法练习。' },
  },
  '/dashboard/learning-path': {
    title: { en: 'Learning Path', zh: '学习路径' },
    description: { en: 'A staged plan.', zh: '分阶段学习计划。' },
  },
  '/dashboard/leaderboard': {
    title: { en: 'Leaderboard', zh: '学习记录' },
    description: { en: 'Compare weekly progress with other learners.', zh: '查看本周学习记录。' },
  },
  '/dashboard/settings': {
    title: { en: 'Settings', zh: '设置' },
    description: { en: 'Adjust preferences, feedback style, and system behavior.', zh: '调整偏好、反馈风格和系统行为。' },
  },
  '/dashboard/profile': {
    title: { en: 'Profile', zh: '个人资料' },
    description: { en: 'Review account information and learner identity.', zh: '查看账号信息和学习身份。' },
  },
};

const learningPrimaryLabelByRoute: Record<(typeof LEARNING_ROUTE_PREFIXES)[number], LocalizedText> = {
  '/dashboard/today': { en: 'Start practice', zh: '开始练习' },
  '/dashboard/review': { en: 'Continue review', zh: '继续复习' },
  '/dashboard/practice': { en: 'Back to Today', zh: '返回今日' },
};

const dashboardLayoutCopy = {
  en: {
    accountMenu: 'My account',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Log out',
    demo: 'Demo',
    todayMissionProgress: "Today's progress",
    coreLearning: 'Core learning',
    skillPractice: 'Skills',
    tools: 'More',
    continueTodayMission: 'Today',
    mission: 'Progress',
    due: 'Due',
    streak: 'Streak',
    learning: 'Learning',
    learner: 'Account',
    continueTodayHeading: 'Today',
    continuePanelDue: (count: number) => `${count} due reviews should go first. Then move on to new content.`,
    continuePanelFresh: 'Finish the next task, then add one practice set if needed.',
    taskProgress: 'Progress',
    todayPlan: 'Today',
    continue: 'Continue',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
  },
  zh: {
    accountMenu: '我的账号',
    profile: '个人资料',
    settings: '设置',
    logout: '退出登录',
    demo: '演示',
    todayMissionProgress: '今日进度',
    coreLearning: '核心学习',
    skillPractice: '技能',
    tools: '更多',
    continueTodayMission: '今日',
    mission: '进度',
    due: '到期',
    streak: '连续',
    learning: '学习',
    learner: '账号',
    continueTodayHeading: '今日',
    continuePanelDue: (count: number) => `${count} 个词到期，优先复习。`,
    continuePanelFresh: '完成下一步，有余力再练一组。',
    taskProgress: '完成进度',
    todayPlan: '今日',
    continue: '继续',
    switchToLight: '切换浅色模式',
    switchToDark: '切换深色模式',
  },
} as const;

export default function DashboardLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { streak, xp, dueWords, dailyMission, settings, learningProfile } = useUserData();
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/dashboard/chat');
  const isLearningRoute = LEARNING_ROUTE_PREFIXES.some((path) => location.pathname.startsWith(path));
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchPalette();
  const isMobile = useIsMobile();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const isZh = i18n.language?.startsWith('zh') ?? false;
  const currentLang = isZh ? 'zh' : 'en';
  const copy = dashboardLayoutCopy[currentLang];
  const lifecycleReminder = (() => {
    const now = new Date();
    const today = localDateKey(now);
    const todayCompleted =
      dailyMission?.status === 'completed' ||
      (!!dailyMission?.tasks.length && dailyMission.tasks.every((task) => task.done));
    const notification = buildLifecycleNotification({
      notificationsEnabled: settings.notifications,
      lifecycleEnabled: settings.lifecycleReminders,
      quietHoursStart: settings.quietHoursStart,
      quietHoursEnd: settings.quietHoursEnd,
      now,
      todayCompleted,
      dueWordsCount: dueWords.length,
      currentStreak: streak?.current || 0,
      hasActivityToday: streak?.lastStudyDate === today || xp.today > 0 || todayCompleted,
      examWeekBoost: settings.examWeekBoost,
      examTargetActive:
        learningProfile.tracks.includes('exam_boost') ||
        /ielts|toefl|exam/i.test(learningProfile.target),
      weeklyRecapReady: now.getDay() === 1,
      weeklyRecapViewed: false,
    });

    if (!notification) return null;
    return {
      title: isZh ? notification.titleZh : notification.title,
      body: isZh ? notification.bodyZh : notification.body,
      tag: `vocabdaily-${notification.kind}`,
      href: notification.href,
    };
  })();

  useStudyReminder(lifecycleReminder);

  const primaryNav = useMemo<NavItem[]>(
    () => [
      {
        path: '/dashboard/today',
        label: t('nav.today'),
        description: pickLocalized({ en: "Today's list", zh: '今天要做的事' }, isZh),
        icon: CalendarDays,
      },
      {
        path: '/dashboard/review',
        label: t('nav.review'),
        description: pickLocalized({ en: 'Cards due today', zh: '到期词卡' }, isZh),
        icon: Brain,
        badge: dueWords.length > 0 ? dueWords.length : null,
      },
      {
        path: '/dashboard/practice',
        label: t('nav.practice'),
        description: pickLocalized({ en: 'Short quiz, dictation, writing', zh: '短测、听写、写作' }, isZh),
        icon: LayoutGrid,
      },
      {
        path: '/dashboard/reading',
        label: t('nav.reading'),
        description: pickLocalized({ en: 'Reading drills', zh: '阅读练习' }, isZh),
        icon: BookOpen,
      },
      {
        path: '/dashboard/listening',
        label: t('nav.listening'),
        description: pickLocalized({ en: 'Listening drills', zh: '听力练习' }, isZh),
        icon: Headphones,
      },
      {
        path: '/dashboard/grammar',
        label: t('nav.grammar'),
        description: pickLocalized({ en: 'Grammar drills', zh: '语法练习' }, isZh),
        icon: GraduationCap,
      },
      {
        path: '/dashboard/pronunciation',
        label: t('nav.pronunciation'),
        description: pickLocalized({ en: 'Pronunciation drills', zh: '发音练习' }, isZh),
        icon: AudioLines,
      },
      {
        path: '/dashboard/writing',
        label: t('nav.writing'),
        description: pickLocalized({ en: 'Writing practice', zh: '写作练习' }, isZh),
        icon: PenTool,
      },
      {
        path: '/dashboard/chat',
        label: t('nav.coach'),
        description: pickLocalized({ en: 'Questions, revision, and drills', zh: '提问、改句、短测' }, isZh),
        icon: MessageCircleMore,
      },
      {
        path: '/dashboard/exam',
        label: t('nav.examPrep'),
        description: pickLocalized({ en: 'IELTS practice', zh: 'IELTS 练习' }, isZh),
        icon: Target,
      },
    ],
    [dueWords.length, isZh, t],
  );

  const toolNav = useMemo<NavItem[]>(
    () => [
      {
        path: '/dashboard/vocabulary',
        label: t('nav.vocabulary'),
        description: pickLocalized({ en: 'Word books and review words', zh: '词书与复习词' }, isZh),
        icon: Library,
      },
      {
        path: '/dashboard/analytics',
        label: t('nav.analytics'),
        description: pickLocalized({ en: 'Learning evidence and trends', zh: '学习数据与趋势' }, isZh),
        icon: BarChart2,
      },
      {
        path: '/dashboard/memory',
        label: t('nav.memory'),
        description: pickLocalized({ en: 'Long-term memory management', zh: '长期记忆管理' }, isZh),
        icon: Shield,
      },
      {
        path: '/dashboard/leaderboard',
        label: pickLocalized({ en: 'Leaderboard', zh: '学习记录' }, isZh),
        description: pickLocalized({ en: 'Weekly progress with other learners', zh: '本周练习记录' }, isZh),
        icon: CalendarDays,
      },
      {
        path: '/dashboard/settings',
        label: t('common.settings'),
        description: pickLocalized({ en: 'System settings', zh: '系统设置' }, isZh),
        icon: Settings,
      },
    ],
    [isZh, t],
  );

  const learningNav = useMemo(() => primaryNav.filter((item) => LEARNING_ROUTE_PREFIXES.includes(item.path as (typeof LEARNING_ROUTE_PREFIXES)[number])), [primaryNav]);
  const learningTools = useMemo(
    () =>
      [
        primaryNav.find((item) => item.path === '/dashboard/chat'),
        primaryNav.find((item) => item.path === '/dashboard/exam'),
        toolNav.find((item) => item.path === '/dashboard/vocabulary'),
      ].filter((item): item is NavItem => Boolean(item)),
    [primaryNav, toolNav],
  );

  const skillsNav = useMemo(
    () =>
      [
        primaryNav.find((item) => item.path === '/dashboard/reading'),
        primaryNav.find((item) => item.path === '/dashboard/listening'),
        primaryNav.find((item) => item.path === '/dashboard/grammar'),
        primaryNav.find((item) => item.path === '/dashboard/pronunciation'),
        primaryNav.find((item) => item.path === '/dashboard/writing'),
      ].filter((item): item is NavItem => Boolean(item)),
    [primaryNav],
  );

  const activeShellEntry =
    shellTitleMap[location.pathname] ||
    shellTitleMap[primaryNav.find((item) => location.pathname.startsWith(item.path))?.path ?? ''] ||
    shellTitleMap['/dashboard/today'];
  const activeShell = {
    title: pickLocalized(activeShellEntry.title, isZh),
    description: pickLocalized(activeShellEntry.description, isZh),
  };

  const missionCompleted = dailyMission?.tasks.filter((task) => task.done).length || 0;
  const missionTotal = dailyMission?.tasks.length || 0;
  const missionProgress = missionTotal > 0 ? Math.round((missionCompleted / missionTotal) * 100) : 0;
  const isDemoSession = Boolean(user?.id && isLocalAuthUserId(user.id));
  const demoBadgeText = copy.demo;
  const displayName =
    isDemoSession && isZh && user?.displayName === 'Demo Learner'
      ? '演示学习者'
      : (user?.displayName || user?.email || copy.learner);
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const levelLabel = isZh ? `阶段 ${xp?.level || 1}` : `Level ${xp?.level || 1}`;

  const learningPrimaryAction = useMemo(() => {
    if (location.pathname.startsWith('/dashboard/review')) {
      return {
        href: '/dashboard/review',
        label: pickLocalized(learningPrimaryLabelByRoute['/dashboard/review'], isZh),
      };
    }
    if (location.pathname.startsWith('/dashboard/practice')) {
      return {
        href: '/dashboard/today',
        label: pickLocalized(learningPrimaryLabelByRoute['/dashboard/practice'], isZh),
      };
    }
    return {
      href: dueWords.length > 0 ? '/dashboard/review' : '/dashboard/practice',
      label: dueWords.length > 0
        ? pickLocalized({ en: 'Review due words', zh: '复习到期词' }, isZh)
        : pickLocalized(learningPrimaryLabelByRoute['/dashboard/today'], isZh),
    };
  }, [dueWords.length, isZh, location.pathname]);

  const changeLanguage = (language: 'en' | 'zh') => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const renderStandardNavItem = (item: NavItem, compact = false) => {
    const active = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link key={item.path} to={item.path}>
        <div
          className={cn(
            'group relative flex items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 transition-colors duration-150',
            active
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/72 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
          )}
        >
          <span
            className={cn(
              'absolute inset-y-2 left-0 w-[2px] rounded-sm transition-colors',
              active ? 'bg-sidebar-primary' : 'bg-transparent',
            )}
          />
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
              active
                ? 'border-sidebar-primary/30 bg-sidebar-accent text-sidebar-primary'
                : 'border-sidebar-border/60 bg-sidebar-accent/30 text-sidebar-foreground/55 group-hover:text-sidebar-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{item.label}</p>
              {item.badge ? (
                <Badge className="rounded-md border border-sidebar-border bg-sidebar-primary/[0.12] px-1.5 text-[10px] text-sidebar-primary hover:bg-sidebar-primary/[0.12]">
                  {item.badge}
                </Badge>
              ) : null}
            </div>
            {!compact ? <p className="truncate text-xs text-sidebar-foreground/52">{item.description}</p> : null}
          </div>
        </div>
      </Link>
    );
  };

  const renderLearningNavItem = (item: NavItem, compact = false) => {
    const active = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link key={item.path} to={item.path}>
        <div
          className={cn(
            'group relative overflow-hidden rounded-md border border-transparent px-2.5 py-2 transition-colors duration-150',
            active
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/72 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
          )}
        >
          <span
            className={cn(
              'absolute inset-y-2 left-0 w-[2px] rounded-sm transition-colors',
              active ? 'bg-sidebar-primary' : 'bg-transparent',
            )}
          />
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                active
                  ? 'border-sidebar-primary/30 bg-sidebar-accent text-sidebar-primary'
                  : 'border-sidebar-border/60 bg-sidebar-accent/30 text-sidebar-foreground/55 group-hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{item.label}</p>
                {item.badge ? (
                  <span className="rounded-md border border-sidebar-border bg-sidebar-primary/[0.12] px-1.5 py-0.5 text-[10px] font-medium text-sidebar-primary">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              {!compact ? <p className="mt-1 truncate text-xs text-sidebar-foreground/52">{item.description}</p> : null}
            </div>
            <ChevronRight className={cn('h-4 w-4 transition-opacity', active ? 'text-sidebar-foreground/70' : 'text-sidebar-foreground/28 group-hover:text-sidebar-foreground/58')} />
          </div>
        </div>
      </Link>
    );
  };

  const learningAccountMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="liquid-glass-control liquid-glass-interactive h-auto border border-current/15 bg-transparent px-1.5 py-1.5 hover:bg-current/5"
          aria-label={currentLang === 'zh' ? '打开账号菜单' : 'Open account menu'}
        >
            <Avatar className="h-9 w-9 rounded-full">
            <AvatarFallback className="rounded-full bg-primary/10 text-primary">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>{copy.accountMenu}</span>
          {isDemoSession && <Badge variant="outline">{demoBadgeText}</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/dashboard/profile">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            {copy.profile}
          </DropdownMenuItem>
        </Link>
        <Link to="/dashboard/settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            {copy.settings}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          {copy.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const standardMobileSheetBody = (
    <div className="flex h-full flex-col gap-4 px-1 text-sidebar-foreground">
      <div className="rounded-md border border-sidebar-border bg-sidebar-accent p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarFallback className="rounded-md">{avatarInitial}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{displayName}</p>
              {isDemoSession && <Badge variant="outline">{demoBadgeText}</Badge>}
            </div>
            <p className="text-xs text-sidebar-foreground/55">{levelLabel}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-sidebar-foreground/55">
            <span>{copy.todayMissionProgress}</span>
            <span>{missionProgress}%</span>
          </div>
          <Progress value={missionProgress} className="h-2" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-2 text-xs text-sidebar-foreground/55">{copy.coreLearning}</p>
        {primaryNav.map((item) => renderStandardNavItem(item))}
      </div>

      <div className="space-y-2">
        <p className="px-2 text-xs text-sidebar-foreground/55">{copy.tools}</p>
        {toolNav.map((item) => renderStandardNavItem(item))}
      </div>

      <div className="mt-auto space-y-2 pb-4">
        <Button className="w-full justify-start rounded-md" asChild>
          <Link to="/dashboard/today">
            <ClipboardList className="mr-2 h-4 w-4" />
            {copy.continueTodayMission}
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start rounded-md" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          {copy.logout}
        </Button>
      </div>
    </div>
  );

  const learningMobileSheetBody = (
    <div className="flex h-full flex-col gap-6 bg-sidebar text-sidebar-foreground">
      <div className="rounded-md border border-sidebar-border/70 bg-sidebar-accent/70 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarFallback className="rounded-md bg-sidebar-primary/14 text-sidebar-primary">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-sidebar-foreground/55">{levelLabel}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-sidebar-border pt-4">
          <div>
            <p className="text-[11px] text-sidebar-foreground/55">{copy.mission}</p>
            <p className="mt-1 text-base font-semibold text-sidebar-primary">{missionProgress}%</p>
          </div>
          <div>
            <p className="text-[11px] text-sidebar-foreground/55">{copy.due}</p>
            <p className="mt-1 text-base font-semibold">{dueWords.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-sidebar-foreground/55">{copy.streak}</p>
            <p className="mt-1 text-base font-semibold">{streak?.current || 0}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] text-sidebar-foreground/55">{copy.coreLearning}</p>
        {learningNav.map((item) => renderLearningNavItem(item))}
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] text-sidebar-foreground/55">{copy.skillPractice}</p>
        {skillsNav.map((item) => renderLearningNavItem(item, true))}
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] text-sidebar-foreground/55">{copy.tools}</p>
        {learningTools.map((item) => renderLearningNavItem(item, true))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="liquid-glass-control inline-flex border border-sidebar-border/70 p-1">
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                currentLang === 'en' ? 'bg-primary/[0.12] text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('zh')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                currentLang === 'zh' ? 'bg-primary/[0.12] text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              中
            </button>
          </div>
        </div>
        <Button variant="outline" className="rounded-md" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          {copy.logout}
        </Button>
      </div>
    </div>
  );

  if (isLearningRoute) {
    return (
      <>
        <div className="study-premium-bg flex h-[100dvh] overflow-hidden bg-background text-foreground">
        <aside className="liquid-glass-panel hidden h-[100dvh] min-h-0 w-[218px] flex-col rounded-none border-y-0 border-l-0 border-r border-sidebar-border/60 bg-sidebar/80 px-2.5 py-3 text-sidebar-foreground lg:flex">
          <Link to="/dashboard/today" className="flex items-center gap-3 rounded-md px-1 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent text-sidebar-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">VocabDaily</p>
              <p className="text-[11px] text-sidebar-foreground/55">{isZh ? '每日练习' : 'Daily practice'}</p>
            </div>
          </Link>

          <div className="mt-4 border-y border-sidebar-border/70 py-3">
            <h2 className="text-sm font-semibold">{activeShell.title}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[11px] text-sidebar-foreground/55">{copy.mission}</p>
                <p className="mt-1 text-sm font-semibold text-sidebar-primary">{missionProgress}%</p>
              </div>
              <div>
                <p className="text-[11px] text-sidebar-foreground/55">{copy.due}</p>
                <p className="mt-1 text-sm font-semibold">{dueWords.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-sidebar-foreground/55">{copy.streak}</p>
                <p className="mt-1 text-sm font-semibold">{streak?.current || 0}</p>
              </div>
            </div>
          </div>

          <ScrollArea
            type="always"
            className={cn(
              'mt-4 min-h-0 flex-1 pr-2',
              '[&_[data-slot=scroll-area-scrollbar]]:w-3',
              '[&_[data-slot=scroll-area-thumb]]:bg-border/90',
              'hover:[&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/45',
            )}
          >
            <div className="space-y-5 pb-4">
              <div className="space-y-2">
                <p className="px-1 text-[11px] text-sidebar-foreground/55">{isZh ? '核心' : 'Core'}</p>
                {learningNav.map((item) => renderLearningNavItem(item, true))}
              </div>

              <div className="space-y-2">
                <p className="px-1 text-[11px] text-sidebar-foreground/55">{copy.skillPractice}</p>
                {skillsNav.map((item) => renderLearningNavItem(item, true))}
              </div>

              <div className="space-y-2">
                <p className="px-1 text-[11px] text-sidebar-foreground/55">{copy.tools}</p>
                {learningTools.map((item) => renderLearningNavItem(item, true))}
              </div>

              <div className="border-t border-sidebar-border/70 pt-3">
                <div className="flex items-center justify-between">
                  <StreakCounter
                    current={streak?.current || 0}
                    longest={streak?.longest || 0}
                  />
                  <span className="text-xs font-semibold text-sidebar-foreground/55">
                    {isZh ? '阶段' : 'Level'} {xp?.level || 1}
                  </span>
                </div>
                <XPProgressBar todayXP={xp?.today || 0} level={xp?.level || 1} />
              </div>
            </div>
          </ScrollArea>

          <div className="mt-3 border-t border-sidebar-border/70 px-1 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{displayName}</p>
                  {isDemoSession && <Badge variant="outline">{demoBadgeText}</Badge>}
                </div>
                <p className="text-xs text-sidebar-foreground/55">{levelLabel}</p>
              </div>
              {learningAccountMenu}
            </div>
          </div>
        </aside>

        <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="liquid-glass-bar rounded-none border-x-0 border-t-0 border-border/45 bg-background/80">
            <div className="flex items-center justify-between gap-3 px-4 py-2 lg:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-md lg:hidden" aria-label={currentLang === 'zh' ? '打开导航菜单' : 'Open navigation menu'}>
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
                    <SheetTitle className="sr-only">
                      {currentLang === 'zh' ? '学习导航' : 'Learning navigation'}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      {currentLang === 'zh' ? '打开学习导航、工具和账号操作。' : 'Open learning navigation, tools, and account actions.'}
                    </SheetDescription>
                    {learningMobileSheetBody}
                  </SheetContent>
                </Sheet>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span>{activeShell.title}</span>
                    {dueWords.length > 0 ? <Badge variant="outline">{dueWords.length} {copy.due}</Badge> : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{activeShell.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="liquid-glass-control hidden items-center border border-border/60 p-1 sm:inline-flex">
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                      currentLang === 'en' ? 'bg-primary/[0.12] text-primary' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('zh')}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                      currentLang === 'zh' ? 'bg-primary/[0.12] text-primary' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    中
                  </button>
                </div>
                <Button variant="glass" className="hidden sm:inline-flex" asChild>
                  <Link to={learningPrimaryAction.href}>{learningPrimaryAction.label}</Link>
                </Button>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  title="Search (⌘K)"
                  aria-label={currentLang === 'zh' ? '打开搜索' : 'Open search'}
                  className="liquid-glass-control liquid-glass-interactive border border-border/60 bg-transparent hover:bg-muted"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                {learningAccountMenu}
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-pb-[calc(7rem+env(safe-area-inset-bottom))]">
            <div
              className={cn(
                'mx-auto w-full max-w-[1180px] px-4 py-4 sm:px-5 lg:px-6 lg:py-5',
                isMobile && 'pb-[calc(7rem+env(safe-area-inset-bottom))]',
              )}
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      {isMobile && (
        <>
          <BottomNavBar isLearningMode onMoreClick={() => setMoreSheetOpen(true)} />
          <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
            <SheetContent side="bottom" className="border-t border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
              <SheetTitle className="sr-only">
                {currentLang === 'zh' ? '更多学习工具' : 'More learning tools'}
              </SheetTitle>
              <SheetDescription className="sr-only">
                {currentLang === 'zh' ? '打开学习导航、工具和账号操作。' : 'Open learning navigation, tools, and account actions.'}
              </SheetDescription>
              {learningMobileSheetBody}
            </SheetContent>
          </Sheet>
        </>
      )}
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  return (
    <div className="study-premium-bg flex h-[100dvh] overflow-hidden bg-background">
      <aside className="premium-sidebar liquid-glass-panel hidden h-[100dvh] min-h-0 w-[284px] flex-col rounded-none border-y-0 border-l-0 border-r border-sidebar-border/60 bg-sidebar/80 px-3 py-3 text-sidebar-foreground lg:flex">
        <Link to="/dashboard/today" className="flex items-center gap-3 rounded-md px-1 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sidebar-primary/20 bg-sidebar-primary text-sidebar-primary-foreground">
            <BookText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">VocabDaily</p>
            <p className="text-xs text-sidebar-foreground/55">{copy.learning}</p>
          </div>
        </Link>

        <ScrollArea
          type="always"
          className={cn(
            'mt-4 min-h-0 flex-1 pr-2',
            '[&_[data-slot=scroll-area-scrollbar]]:w-3',
            '[&_[data-slot=scroll-area-scrollbar]]:rounded-full',
            '[&_[data-slot=scroll-area-thumb]]:bg-border/90',
            '[&_[data-slot=scroll-area-thumb]]:shadow-sm',
            'hover:[&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/45',
          )}
        >
          <div className="space-y-5 pb-4">
            <div className="rounded-md border border-sidebar-border/70 bg-sidebar-accent/70 px-3 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mt-1 text-base font-semibold">{copy.continueTodayHeading}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sidebar-primary/20 bg-sidebar-primary/[0.12] text-sidebar-primary">
                  <ClipboardList className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xs leading-5 text-sidebar-foreground/64">
                {dueWords.length > 0
                  ? copy.continuePanelDue(dueWords.length)
                  : copy.continuePanelFresh}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-sidebar-foreground/55">
                  <span>{copy.taskProgress}</span>
                  <span>{missionCompleted}/{missionTotal || 3}</span>
                </div>
                <Progress value={missionProgress} className="h-2" />
              </div>
              <Button className="mt-4 w-full rounded-md" asChild>
                <Link to="/dashboard/today">
                  {copy.todayPlan}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="rounded-md border border-sidebar-border/70 bg-sidebar-accent/70 px-3 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <StreakCounter current={streak?.current || 0} longest={streak?.longest || 0} />
                <Badge variant="outline" className="rounded-md border-sidebar-border bg-sidebar-accent text-sidebar-foreground">
                  {isZh ? '阶段' : 'Level'} {xp?.level || 1}
                </Badge>
              </div>
              <XPProgressBar todayXP={xp?.today || 0} level={xp?.level || 1} />
            </div>

            <div className="space-y-2">
              <p className="px-2 text-xs text-sidebar-foreground/55">{copy.coreLearning}</p>
              {primaryNav.map((item) => renderStandardNavItem(item, true))}
            </div>

            <div className="space-y-2">
              <p className="px-2 text-xs text-sidebar-foreground/55">{copy.tools}</p>
              {toolNav.map((item) => renderStandardNavItem(item, true))}
            </div>
          </div>
        </ScrollArea>

        <div className="mt-3 rounded-md border border-sidebar-border/70 bg-sidebar-accent/70 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{displayName}</p>
                {isDemoSession && <Badge variant="outline">{demoBadgeText}</Badge>}
              </div>
              <p className="text-xs text-sidebar-foreground/55">{copy.learner}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-md px-2">
                  <Avatar className="h-9 w-9 rounded-md">
                    <AvatarFallback className="rounded-md">{avatarInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{copy.accountMenu}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/dashboard/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    {copy.profile}
                  </DropdownMenuItem>
                </Link>
                <Link to="/dashboard/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    {copy.settings}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  {resolvedTheme === 'dark' ? copy.switchToLight : copy.switchToDark}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {copy.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="liquid-glass-bar rounded-none border-x-0 border-t-0 border-border/45 bg-[hsl(var(--surface-raised))]/80">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-md lg:hidden" aria-label={currentLang === 'zh' ? '打开导航菜单' : 'Open navigation menu'}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
                  <SheetTitle className="sr-only">
                    {currentLang === 'zh' ? '应用导航' : 'App navigation'}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    {currentLang === 'zh' ? '打开应用导航和工具入口。' : 'Open app navigation and tool entries.'}
                  </SheetDescription>
                  {standardMobileSheetBody}
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>{activeShell.title}</span>
                  {dueWords.length > 0 ? <Badge variant="outline">{dueWords.length} {copy.due}</Badge> : null}
                </div>
                <p className="truncate text-xs text-muted-foreground lg:text-sm">{activeShell.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {!isChatRoute ? (
                <Button variant="glass" className="hidden lg:flex" asChild>
                  <Link to="/dashboard/today">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    {copy.continue}
                  </Link>
                </Button>
              ) : null}
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <div className={cn('flex-1 min-h-0', isChatRoute ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden scroll-pb-[calc(7rem+env(safe-area-inset-bottom))]')}>
          <div
            className={cn(
              'mx-auto w-full',
              isChatRoute ? 'h-full max-w-none' : 'max-w-[1360px] px-5 py-6 lg:px-10 lg:py-8',
              isMobile && !isChatRoute && 'pb-[calc(7rem+env(safe-area-inset-bottom))]',
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
      {isMobile && !isChatRoute && (
        <>
          <BottomNavBar isLearningMode={false} onMoreClick={() => setMoreSheetOpen(true)} />
          <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
            <SheetContent side="bottom" className="border-t border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
              <SheetTitle className="sr-only">
                {currentLang === 'zh' ? '更多工具' : 'More tools'}
              </SheetTitle>
              <SheetDescription className="sr-only">
                {currentLang === 'zh' ? '打开应用导航和工具入口。' : 'Open app navigation and tool entries.'}
              </SheetDescription>
              {standardMobileSheetBody}
            </SheetContent>
          </Sheet>
        </>
      )}
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

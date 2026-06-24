import { Link, Outlet, useLocation } from 'react-router-dom';
import { useCallback, useMemo, useState, type ComponentType } from 'react';
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
import { BottomNavBar } from '@/components/BottomNavBar';
import { StreakCounter } from '@/components/StreakCounter';
import { XPProgressBar } from '@/components/XPProgressBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStudyReminder } from '@/hooks/useStudyReminder';
import { useTranslation } from 'react-i18next';
import { buildLifecycleNotification } from '@/features/learning/lifecycleNotifications';
import {
  getDashboardRouteByPath,
  getRoutesByGroup,
  type DashboardRouteMeta,
} from '@/features/learning/routeRegistry';
import {
  BookOpen,
  BookText,
  ChevronRight,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Globe,
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
  const { i18n } = useTranslation();
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

  const routeToNavItem = useCallback((route: DashboardRouteMeta): NavItem => ({
    path: route.path,
    label: pickLocalized(route.label, isZh),
    description: pickLocalized(route.description, isZh),
    icon: route.icon as ComponentType<{ className?: string }>,
    badge: route.id === 'review' && dueWords.length > 0 ? dueWords.length : null,
  }), [dueWords.length, isZh]);

  const primaryNav = useMemo<NavItem[]>(
    () => [...getRoutesByGroup('learning'), ...getRoutesByGroup('practice')].map(routeToNavItem),
    [routeToNavItem],
  );

  const toolNav = useMemo<NavItem[]>(
    () => [
      ...getRoutesByGroup('tools'),
      getRoutesByGroup('admin').find((route) => route.id === 'settings'),
    ].filter((route): route is DashboardRouteMeta => Boolean(route)).map(routeToNavItem),
    [routeToNavItem],
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

  const activeShellEntry = getDashboardRouteByPath(location.pathname) || getDashboardRouteByPath('/dashboard/today')!;
  const activeShell = {
    title: pickLocalized(activeShellEntry.label, isZh),
    description: pickLocalized(activeShellEntry.description, isZh),
  };

  const missionCompleted = dailyMission?.tasks.filter((task) => task.done).length || 0;
  const missionTotal = dailyMission?.tasks.length || 0;
  const missionProgress = missionTotal > 0 ? Math.round((missionCompleted / missionTotal) * 100) : 0;
  const isDemoSession = Boolean(user?.id && isLocalAuthUserId(user.id));
  const demoBadgeText = copy.demo;
  const displayName =
    isDemoSession && isZh && user?.displayName === 'Demo Learner'
      ? '演示账号'
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
            'group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors duration-150',
            active
              ? 'bg-sidebar-accent/58 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
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
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              active
                ? 'text-sidebar-primary'
                : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{item.label}</p>
              {item.badge ? (
                <Badge className="rounded-md border-transparent bg-sidebar-primary/[0.12] px-1.5 text-[10px] text-sidebar-primary hover:bg-sidebar-primary/[0.12]">
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
            'group relative overflow-hidden rounded-md px-2.5 py-2 transition-colors duration-150',
            active
              ? 'bg-sidebar-accent/58 text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
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
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                active
                  ? 'text-sidebar-primary'
                  : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{item.label}</p>
                {item.badge ? (
                  <span className="rounded-md bg-sidebar-primary/[0.12] px-1.5 py-0.5 text-[10px] font-medium text-sidebar-primary">
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
          className="h-auto rounded-full border border-transparent bg-transparent px-1.5 py-1.5 text-foreground hover:bg-muted"
          aria-label={currentLang === 'zh' ? '打开账号菜单' : 'Open account menu'}
        >
            <Avatar className="h-9 w-9 rounded-full">
            <AvatarFallback className="rounded-full bg-muted text-foreground">
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

  const topbarAction = isLearningRoute
    ? learningPrimaryAction
    : {
        href: '/dashboard/today',
        label: copy.continue,
      };

  const renderTopbarControlsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="glass-icon-button liquid-glass-control liquid-glass-interactive h-11 min-h-11 w-11 min-w-11 bg-transparent sm:h-9 sm:min-h-9 sm:w-9 sm:min-w-9"
          aria-label={currentLang === 'zh' ? '打开页面操作' : 'Open page actions'}
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to={topbarAction.href}>
            <ClipboardList className="mr-2 h-4 w-4" />
            {topbarAction.label}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setSearchOpen(true)}>
          <Search className="mr-2 h-4 w-4" />
          {currentLang === 'zh' ? '搜索' : 'Search'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{currentLang === 'zh' ? '外观' : 'Appearance'}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setTheme('light')} className={resolvedTheme === 'light' ? 'bg-muted' : ''}>
          <Sun className="mr-2 h-4 w-4" />
          {currentLang === 'zh' ? '浅色' : 'Light'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('dark')} className={resolvedTheme === 'dark' ? 'bg-muted' : ''}>
          <Moon className="mr-2 h-4 w-4" />
          {currentLang === 'zh' ? '深色' : 'Dark'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{currentLang === 'zh' ? '语言' : 'Language'}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => changeLanguage('zh')} className={currentLang === 'zh' ? 'bg-muted' : ''}>
          <Globe className="mr-2 h-4 w-4" />
          中文
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => changeLanguage('en')} className={currentLang === 'en' ? 'bg-muted' : ''}>
          <Globe className="mr-2 h-4 w-4" />
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const mobileMainHeightClass = 'h-[calc(100dvh_-_5.75rem_-_env(safe-area-inset-bottom))] flex-none';

  const standardMobileSheetBody = (
    <div className="flex h-full flex-col gap-4 px-1 text-sidebar-foreground">
      <div className="rounded-xl bg-sidebar-accent/28 px-3 py-3">
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
          <Progress value={missionProgress} className="h-1 bg-sidebar-border/35 [&_[data-slot=progress-indicator]]:bg-sidebar-primary" />
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

      <div className="mt-auto flex items-center justify-between pb-4 pt-3">
        {renderTopbarControlsMenu()}
        {learningAccountMenu}
      </div>
    </div>
  );

  const learningMobileSheetBody = (
    <div className="flex h-full flex-col gap-6 bg-sidebar text-sidebar-foreground">
      <div className="rounded-xl bg-sidebar-accent/28 px-3 py-3">
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
        <div className="mt-4 grid grid-cols-3 gap-3">
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

      <div className="mt-auto flex items-center justify-between pt-4">
        {renderTopbarControlsMenu()}
        {learningAccountMenu}
      </div>
    </div>
  );

  if (isLearningRoute) {
    return (
      <>
        <div className="study-app-bg flex h-[100dvh] overflow-hidden bg-background text-foreground">
        <aside className="app-glass-bar hidden h-[100dvh] min-h-0 w-[224px] flex-col rounded-none border-0 bg-sidebar/44 px-3 py-4 text-sidebar-foreground lg:flex">
          <Link to="/dashboard/today" className="flex items-center gap-3 rounded-xl px-1 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold">VocabDaily</p>
              <p className="text-[11px] text-sidebar-foreground/55">{isZh ? '每日练习' : 'Daily practice'}</p>
            </div>
          </Link>

          <div className="mt-5 rounded-xl bg-sidebar-accent/28 px-3 py-3">
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
            type="hover"
            className={cn(
              'mt-4 min-h-0 flex-1 pr-2',
              '[&_[data-slot=scroll-area-scrollbar]]:w-1.5',
              '[&_[data-slot=scroll-area-thumb]]:bg-transparent',
              'hover:[&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/22',
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

              <div className="rounded-xl bg-sidebar-accent/22 px-3 py-3">
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

          <div className="mt-3 px-1 py-2.5">
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

        <main
          id="main-content"
          className={cn(
            'flex min-h-0 min-w-0 w-full flex-col overflow-hidden',
            isMobile ? mobileMainHeightClass : 'flex-1',
          )}
        >
          <header className="app-glass-bar rounded-none border-0 bg-background/66 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="glass-icon-button h-11 min-h-11 w-11 min-w-11 rounded-lg sm:h-9 sm:min-h-9 sm:w-9 sm:min-w-9 lg:hidden" aria-label={currentLang === 'zh' ? '打开导航菜单' : 'Open navigation menu'}>
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] border-r border-transparent bg-sidebar p-4 text-sidebar-foreground">
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
                {renderTopbarControlsMenu()}
                {learningAccountMenu}
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-pb-[calc(7rem+env(safe-area-inset-bottom))]">
            <div
              className={cn(
                'mx-auto w-full max-w-[1120px] px-4 py-5 sm:px-5 lg:px-7 lg:py-7',
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
            <SheetContent side="bottom" className="border-t border-transparent bg-sidebar p-4 text-sidebar-foreground">
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
    <div className="study-app-bg flex h-[100dvh] overflow-hidden bg-background">
      <aside className="app-glass-bar hidden h-[100dvh] min-h-0 w-[284px] flex-col rounded-none border-0 bg-sidebar/44 px-4 py-4 text-sidebar-foreground lg:flex">
        <Link to="/dashboard/today" className="flex items-center gap-3 rounded-xl px-1 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
            <BookText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold">VocabDaily</p>
            <p className="text-xs text-sidebar-foreground/55">{copy.learning}</p>
          </div>
        </Link>

        <ScrollArea
          type="hover"
          className={cn(
            'mt-4 min-h-0 flex-1 pr-2',
            '[&_[data-slot=scroll-area-scrollbar]]:w-1.5',
            '[&_[data-slot=scroll-area-scrollbar]]:rounded-full',
            '[&_[data-slot=scroll-area-thumb]]:bg-transparent',
            'hover:[&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/22',
          )}
        >
          <div className="space-y-5 pb-4">
            <div className="rounded-xl bg-sidebar-accent/28 px-3 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mt-1 text-base font-semibold">{copy.continueTodayHeading}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-md text-sidebar-primary">
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
                <Progress value={missionProgress} className="h-1 bg-sidebar-border/35 [&_[data-slot=progress-indicator]]:bg-sidebar-primary" />
              </div>
              <Link
                to="/dashboard/today"
                className="mt-4 flex min-h-10 items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/45 hover:text-sidebar-primary"
              >
                <span>{copy.todayPlan}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3 rounded-xl bg-sidebar-accent/22 px-3 py-3">
              <div className="flex items-center justify-between">
                <StreakCounter current={streak?.current || 0} longest={streak?.longest || 0} />
                <Badge variant="outline" className="rounded-md border-transparent bg-sidebar-accent/35 text-sidebar-foreground">
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

        <div className="mt-3 px-1 py-2.5">
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
                <Button variant="ghost" className="rounded-full px-1.5">
                  <Avatar className="h-9 w-9 rounded-full">
                    <AvatarFallback className="rounded-full bg-muted text-foreground">{avatarInitial}</AvatarFallback>
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

      <main
        className={cn(
          'flex min-h-0 min-w-0 w-full flex-col overflow-hidden',
          isMobile && !isChatRoute ? mobileMainHeightClass : 'flex-1',
        )}
      >
        <header className="app-glass-bar rounded-none border-0 bg-background/66 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="glass-icon-button h-11 min-h-11 w-11 min-w-11 rounded-lg sm:h-9 sm:min-h-9 sm:w-9 sm:min-w-9 lg:hidden" aria-label={currentLang === 'zh' ? '打开导航菜单' : 'Open navigation menu'}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] border-r border-transparent bg-sidebar p-4 text-sidebar-foreground">
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
              {renderTopbarControlsMenu()}
            </div>
          </div>
        </header>

        <div className={cn('flex-1 min-h-0', isChatRoute ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden scroll-pb-[calc(9rem+env(safe-area-inset-bottom))]')}>
          <div
            className={cn(
              'mx-auto w-full',
              isChatRoute ? 'h-full max-w-none' : 'max-w-[1280px] px-5 py-7 lg:px-10 lg:py-9',
              isMobile && !isChatRoute && 'pb-[calc(9rem+env(safe-area-inset-bottom))]',
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
            <SheetContent side="bottom" className="border-t border-transparent bg-sidebar p-4 text-sidebar-foreground">
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

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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  BookText,
  Brain,
  CalendarDays,
  ChevronRight,
  Flame,
  Headphones,
  GraduationCap,
  LayoutGrid,
  AudioLines,
  PenTool,
  Medal,
  Library,
  LogOut,
  Menu,
  MessageCircleMore,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string | number | null;
}

const LEARNING_ROUTE_PREFIXES = ['/dashboard/today', '/dashboard/review', '/dashboard/practice'] as const;

const shellTitleMap: Record<string, { title: string; description: string }> = {
  '/dashboard/today': {
    title: 'Today',
    description: '今天最值得做的一步，从这里开始。',
  },
  '/dashboard/review': {
    title: 'Review',
    description: '清掉到期复习，别让遗忘继续堆积。',
  },
  '/dashboard/practice': {
    title: 'Practice',
    description: '把弱项转成短练习，稳定补强。',
  },
  '/dashboard/chat': {
    title: 'Coach',
    description: '做一轮带上下文的引导学习，把问题讲透。',
  },
  '/dashboard/exam': {
    title: 'Exam Prep',
    description: '冲分路线、仿真题和结构化反馈都在这里。',
  },
  '/dashboard/vocabulary': {
    title: 'Vocabulary',
    description: '管理词书、导入 deck、维护你的底层词汇资产。',
  },
  '/dashboard/analytics': {
    title: 'Analytics',
    description: '查看真实学习数据，而不是随机生成的好看图表。',
  },
  '/dashboard/memory': {
    title: 'Memory',
    description: '管理长期记忆，决定 AI 该记住什么。',
  },
  '/dashboard/pronunciation': {
    title: 'Pronunciation',
    description: '发音评估与口语训练，精准到音素级别。',
  },
  '/dashboard/writing': {
    title: 'Writing',
    description: '写作练习与 AI 批改，提升书面表达。',
  },
  '/dashboard/reading': {
    title: 'Reading',
    description: 'IELTS 阅读理解精读训练，提升阅读速度与准确率。',
  },
  '/dashboard/listening': {
    title: 'Listening',
    description: 'IELTS 听力理解训练，练习不同口音和题型。',
  },
  '/dashboard/grammar': {
    title: 'Grammar',
    description: '语法规则讲解与填空练习，系统巩固语法基础。',
  },
  '/dashboard/learning-path': {
    title: 'Learning Path',
    description: '结构化学习路线，按阶段推进你的英语能力。',
  },
  '/dashboard/settings': {
    title: 'Settings',
    description: '调整偏好、反馈风格和系统行为。',
  },
  '/dashboard/profile': {
    title: 'Profile',
    description: '查看账号信息和学习身份。',
  },
};

const learningPrimaryLabelByRoute: Record<(typeof LEARNING_ROUTE_PREFIXES)[number], string> = {
  '/dashboard/today': 'Open practice',
  '/dashboard/review': 'Continue review',
  '/dashboard/practice': 'Back to today',
};

export default function DashboardLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { streak, xp, dueWords, dailyMission } = useUserData();
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/dashboard/chat');
  const isLearningRoute = LEARNING_ROUTE_PREFIXES.some((path) => location.pathname.startsWith(path));
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchPalette();
  const isMobile = useIsMobile();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const primaryNav = useMemo<NavItem[]>(
    () => [
      {
        path: '/dashboard/today',
        label: t('nav.today'),
        description: '今日主任务与下一步动作',
        icon: CalendarDays,
      },
      {
        path: '/dashboard/review',
        label: t('nav.review'),
        description: '到期复习与稳态记忆',
        icon: Brain,
        badge: dueWords.length > 0 ? dueWords.length : null,
      },
      {
        path: '/dashboard/practice',
        label: t('nav.practice'),
        description: '测验、听力、写作短练习',
        icon: WandSparkles,
      },
      {
        path: '/dashboard/reading',
        label: 'Reading',
        description: 'IELTS 阅读理解精读训练',
        icon: BookOpen,
      },
      {
        path: '/dashboard/listening',
        label: 'Listening',
        description: 'IELTS 听力理解训练',
        icon: Headphones,
      },
      {
        path: '/dashboard/grammar',
        label: 'Grammar',
        description: '语法规则与填空练习',
        icon: GraduationCap,
      },
      {
        path: '/dashboard/pronunciation',
        label: t('nav.pronunciation'),
        description: '发音评估与口语练习',
        icon: AudioLines,
      },
      {
        path: '/dashboard/writing',
        label: t('nav.writing'),
        description: '写作训练与 AI 批改',
        icon: PenTool,
      },
      {
        path: '/dashboard/chat',
        label: 'Coach',
        description: '解释、引导和短测都从这里进入',
        icon: MessageCircleMore,
      },
      {
        path: '/dashboard/exam',
        label: t('nav.examPrep'),
        description: 'IELTS 冲分与高价值反馈',
        icon: Target,
      },
    ],
    [dueWords.length, t],
  );

  const toolNav = useMemo<NavItem[]>(
    () => [
      {
        path: '/dashboard/vocabulary',
        label: t('nav.vocabulary'),
        description: '词书与词汇资产',
        icon: Library,
      },
      {
        path: '/dashboard/analytics',
        label: t('nav.analytics'),
        description: '学习数据与趋势',
        icon: Trophy,
      },
      {
        path: '/dashboard/memory',
        label: t('nav.memory'),
        description: '长期记忆管理',
        icon: Shield,
      },
      {
        path: '/dashboard/leaderboard',
        label: 'Leaderboard',
        description: '周榜排名与社区挑战',
        icon: Medal,
      },
      {
        path: '/dashboard/settings',
        label: 'Settings',
        description: '系统设置',
        icon: Settings,
      },
    ],
    [t],
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

  const activeShell =
    shellTitleMap[location.pathname] ||
    shellTitleMap[primaryNav.find((item) => location.pathname.startsWith(item.path))?.path || '/dashboard/today'];

  const missionCompleted = dailyMission?.tasks.filter((task) => task.done).length || 0;
  const missionTotal = dailyMission?.tasks.length || 0;
  const missionProgress = missionTotal > 0 ? Math.round((missionCompleted / missionTotal) * 100) : 0;
  const currentLang = i18n.language.startsWith('zh') ? 'zh' : 'en';

  const learningPrimaryAction = useMemo(() => {
    if (location.pathname.startsWith('/dashboard/review')) {
      return {
        href: '/dashboard/review',
        label: learningPrimaryLabelByRoute['/dashboard/review'],
      };
    }
    if (location.pathname.startsWith('/dashboard/practice')) {
      return {
        href: '/dashboard/today',
        label: learningPrimaryLabelByRoute['/dashboard/practice'],
      };
    }
    return {
      href: dueWords.length > 0 ? '/dashboard/review' : '/dashboard/practice',
      label: dueWords.length > 0 ? 'Clear due reviews' : learningPrimaryLabelByRoute['/dashboard/today'],
    };
  }, [dueWords.length, location.pathname]);

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
            'group flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-150',
            active
              ? 'border-border bg-muted shadow-sm'
              : 'border-transparent hover:border-border hover:bg-muted/60',
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{item.label}</p>
              {item.badge ? (
                <Badge className="rounded-full bg-emerald-600 px-2 text-[10px] text-white hover:bg-emerald-600">
                  {item.badge}
                </Badge>
              ) : null}
            </div>
            {!compact ? <p className="truncate text-xs text-muted-foreground">{item.description}</p> : null}
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
            'group relative overflow-hidden rounded-xl border border-transparent px-4 py-3 transition-all duration-150',
            active ? 'border-border bg-muted/60' : 'hover:border-border hover:bg-muted/40',
          )}
        >
          <span
            className={cn(
              'absolute inset-y-3 left-0 w-[3px] rounded-full transition-colors',
              active ? 'bg-primary' : 'bg-transparent group-hover:bg-border',
            )}
          />
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                active ? 'border-border bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={cn('truncate text-sm font-semibold', active ? 'text-foreground' : 'text-foreground/85')}>{item.label}</p>
                {item.badge ? (
                  <span className="rounded-full border border-border bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              {!compact ? <p className="mt-1 truncate text-xs text-muted-foreground">{item.description}</p> : null}
            </div>
            <ChevronRight className={cn('h-4 w-4 transition-opacity', active ? 'text-muted-foreground' : 'text-muted-foreground/40 group-hover:text-muted-foreground')} />
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
          className="h-auto rounded-full border bg-card px-2 py-2 hover:bg-muted"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.displayName?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/dashboard/profile">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <Link to="/dashboard/settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const standardMobileSheetBody = (
    <div className="flex h-full flex-col gap-4 px-1">
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{user?.displayName || user?.email}</p>
            <p className="text-xs text-muted-foreground">Level {xp?.level || 1}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>今日任务进度</span>
            <span>{missionProgress}%</span>
          </div>
          <Progress value={missionProgress} className="h-2" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Core</p>
        {primaryNav.map((item) => renderStandardNavItem(item))}
      </div>

      <div className="space-y-2">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tools</p>
        {toolNav.map((item) => renderStandardNavItem(item))}
      </div>

      <div className="mt-auto space-y-2 pb-4">
        <Button className="w-full justify-start rounded-2xl bg-emerald-600 hover:bg-emerald-700" asChild>
          <Link to="/dashboard/today">
            <Sparkles className="mr-2 h-4 w-4" />
            继续今日任务
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start rounded-2xl" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  const learningMobileSheetBody = (
    <div className="flex h-full flex-col gap-6 bg-background text-foreground">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.displayName?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{user?.displayName || user?.email}</p>
            <p className="text-xs text-muted-foreground">Level {xp?.level || 1}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mission</p>
            <p className="mt-1 text-xl font-semibold text-primary">{missionProgress}%</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Due</p>
            <p className="mt-1 text-xl font-semibold">{dueWords.length}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Streak</p>
            <p className="mt-1 text-xl font-semibold">{streak?.current || 0}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Core learning</p>
        {learningNav.map((item) => renderLearningNavItem(item))}
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Skills</p>
        {skillsNav.map((item) => renderLearningNavItem(item, true))}
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Tools</p>
        {learningTools.map((item) => renderLearningNavItem(item, true))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <div className="inline-flex rounded-full border bg-card p-1">
          <button
            type="button"
            onClick={() => changeLanguage('en')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              currentLang === 'en' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => changeLanguage('zh')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              currentLang === 'zh' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            中
          </button>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  if (isLearningRoute) {
    return (
      <>
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <aside className="hidden h-screen min-h-0 w-[292px] flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-sm px-4 py-4 lg:flex">
          <Link to="/dashboard/today" className="flex items-center gap-3 rounded-xl px-1 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight">VocabDaily</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Learning cockpit</p>
            </div>
          </Link>

          <div className="mt-5 rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Current route</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{activeShell.title}</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Mission</p>
                <p className="mt-1 text-lg font-semibold text-primary">{missionProgress}%</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Due</p>
                <p className="mt-1 text-lg font-semibold">{dueWords.length}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Streak</p>
                <p className="mt-1 text-lg font-semibold">{streak?.current || 0}</p>
              </div>
            </div>
          </div>

          <ScrollArea
            type="always"
            className={cn(
              'mt-5 min-h-0 flex-1 pr-2',
              '[&_[data-slot=scroll-area-scrollbar]]:w-3',
              '[&_[data-slot=scroll-area-thumb]]:bg-border/90',
              'hover:[&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/45',
            )}
          >
            <div className="space-y-6 pb-4">
              <div className="space-y-2">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Core learning</p>
                {learningNav.map((item) => renderLearningNavItem(item, true))}
              </div>

              <div className="space-y-2">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Skills</p>
                {skillsNav.map((item) => renderLearningNavItem(item, true))}
              </div>

              <div className="space-y-2">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Tools</p>
                {learningTools.map((item) => renderLearningNavItem(item, true))}
              </div>

              <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <StreakCounter
                    current={streak?.current || 0}
                    longest={streak?.longest || 0}
                  />
                  <span className="text-xs font-bold text-muted-foreground">Lv {xp?.level || 1}</span>
                </div>
                <XPProgressBar todayXP={xp?.today || 0} level={xp?.level || 1} />
              </div>
            </div>
          </ScrollArea>

          <div className="mt-4 rounded-xl border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{user?.displayName || user?.email}</p>
                <p className="text-xs text-muted-foreground">Level {xp?.level || 1}</p>
              </div>
              {learningAccountMenu}
            </div>
          </div>
        </aside>

        <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          <header className="border-b bg-background/88 backdrop-blur supports-[backdrop-filter]:bg-background/68">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-7 lg:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] border-r bg-background p-4">
                    {learningMobileSheetBody}
                  </SheetContent>
                </Sheet>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <span>{activeShell.title}</span>
                    {dueWords.length > 0 ? <Badge variant="outline">{dueWords.length} due</Badge> : null}
                  </div>
                  <p className="truncate text-sm text-muted-foreground lg:text-base">{activeShell.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="hidden items-center rounded-full border bg-card p-1 sm:inline-flex">
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      currentLang === 'en' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('zh')}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      currentLang === 'zh' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    中
                  </button>
                </div>
                <Button
                  variant="outline"
                  className="hidden rounded-full sm:inline-flex"
                  asChild
                >
                  <Link to={learningPrimaryAction.href}>{learningPrimaryAction.label}</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Search (⌘K)"
                  className="rounded-full border bg-card hover:bg-muted"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                {learningAccountMenu}
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className={cn('mx-auto w-full max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8', isMobile && 'pb-20')}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      {isMobile && (
        <>
          <BottomNavBar isLearningMode onMoreClick={() => setMoreSheetOpen(true)} />
          <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
            <SheetContent side="bottom" className="border-t bg-background p-4">
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
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden h-screen min-h-0 w-[320px] flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-sm px-4 py-4 lg:flex">
        <Link to="/dashboard/today" className="flex items-center gap-3 rounded-2xl px-1 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <BookText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold">VocabDaily</p>
            <p className="text-xs text-muted-foreground">Structured English learning</p>
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
            <div className="rounded-xl border bg-card px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Today</p>
                  <p className="mt-1 text-lg font-semibold">继续今日任务</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {dueWords.length > 0
                  ? `${dueWords.length} 个到期复习优先处理，做完后再推进新内容。`
                  : '先完成主任务，再用一次短练习把今天的弱项补上。'}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Mission progress</span>
                  <span>{missionCompleted}/{missionTotal || 3}</span>
                </div>
                <Progress value={missionProgress} className="h-2" />
              </div>
              <Button className="mt-4 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link to="/dashboard/today">
                  Open today plan
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="rounded-2xl border bg-card px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <StreakCounter current={streak?.current || 0} longest={streak?.longest || 0} />
                <Badge variant="outline" className="rounded-full">Lv {xp?.level || 1}</Badge>
              </div>
              <XPProgressBar todayXP={xp?.today || 0} level={xp?.level || 1} />
            </div>

            <div className="space-y-2">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Core learning</p>
              {primaryNav.map((item) => renderStandardNavItem(item))}
            </div>

            <div className="space-y-2">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tools</p>
              {toolNav.map((item) => renderStandardNavItem(item, true))}
            </div>
          </div>
        </ScrollArea>

        <div className="mt-4 rounded-2xl border bg-card px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{user?.displayName || user?.email}</p>
              <p className="text-xs text-muted-foreground">Crafted for uu</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl px-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/dashboard/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link to="/dashboard/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  {resolvedTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="border-b bg-background/88 backdrop-blur supports-[backdrop-filter]:bg-background/68">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-7 lg:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] border-r bg-background p-4">
                  {standardMobileSheetBody}
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <span>{activeShell.title}</span>
                  {dueWords.length > 0 ? <Badge variant="outline">{dueWords.length} due</Badge> : null}
                </div>
                <p className="truncate text-sm text-muted-foreground lg:text-base">{activeShell.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {!isChatRoute ? (
                <Button variant="ghost" className="hidden rounded-2xl border border-border/70 bg-card/70 lg:flex" asChild>
                  <Link to="/dashboard/today">
                    <Zap className="mr-2 h-4 w-4" />
                    Continue
                  </Link>
                </Button>
              ) : null}
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <div className={cn('flex-1 min-h-0', isChatRoute ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden')}>
          <div
            className={cn(
              'mx-auto w-full',
              isChatRoute ? 'h-full max-w-none' : 'max-w-[1360px] px-5 py-6 lg:px-10 lg:py-8',
              isMobile && !isChatRoute && 'pb-20',
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
      {isMobile && (
        <>
          <BottomNavBar isLearningMode={false} onMoreClick={() => setMoreSheetOpen(true)} />
          <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
            <SheetContent side="bottom" className="border-t bg-background p-4">
              {standardMobileSheetBody}
            </SheetContent>
          </Sheet>
        </>
      )}
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

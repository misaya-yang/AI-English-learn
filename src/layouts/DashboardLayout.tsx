import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMemo, type ComponentType } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { useTranslation } from 'react-i18next';
import {
  BookText,
  Brain,
  CalendarDays,
  ChevronRight,
  Flame,
  LayoutGrid,
  Library,
  LogOut,
  Menu,
  MessageCircleMore,
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
    description: '和 AI 家教做一轮真正带上下文的学习。',
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
  '/dashboard/settings': {
    title: 'Settings',
    description: '调整偏好、反馈风格和系统行为。',
  },
  '/dashboard/profile': {
    title: 'Profile',
    description: '查看账号信息和学习身份。',
  },
};

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { streak, xp, dueWords, dailyMission } = useUserData();
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/dashboard/chat');

  const primaryNav = useMemo<NavItem[]>(() => [
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
      path: '/dashboard/chat',
      label: 'Coach',
      description: 'AI 家教与引导式学习',
      icon: MessageCircleMore,
    },
    {
      path: '/dashboard/exam',
      label: t('nav.examPrep'),
      description: 'IELTS 冲分与高价值反馈',
      icon: Target,
    },
  ], [dueWords.length, t]);

  const toolNav = useMemo<NavItem[]>(() => [
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
      path: '/dashboard/settings',
      label: 'Settings',
      description: '系统设置',
      icon: Settings,
    },
  ], [t]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const activeShell =
    shellTitleMap[location.pathname] ||
    shellTitleMap[primaryNav.find((item) => location.pathname.startsWith(item.path))?.path || '/dashboard/today'];

  const missionCompleted = dailyMission?.tasks.filter((task) => task.done).length || 0;
  const missionTotal = dailyMission?.tasks.length || 0;
  const missionProgress = missionTotal > 0 ? Math.round((missionCompleted / missionTotal) * 100) : 0;

  const renderNavItem = (item: NavItem, compact = false) => {
    const active = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link key={item.path} to={item.path}>
        <div
          className={cn(
            'group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-150',
            active
              ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_10px_35px_-25px_rgba(16,185,129,0.8)]'
              : 'border-transparent hover:border-border hover:bg-muted/60',
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              active ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground',
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

  const mobileSheetBody = (
    <div className="flex h-full flex-col gap-5 px-1">
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
        {primaryNav.map((item) => renderNavItem(item))}
      </div>

      <div className="space-y-2">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tools</p>
        {toolNav.map((item) => renderNavItem(item))}
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-[312px] flex-col border-r bg-sidebar/80 px-5 py-5 lg:flex">
        <Link to="/dashboard/today" className="flex items-center gap-3 rounded-2xl px-1 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <BookText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold">VocabDaily</p>
            <p className="text-xs text-muted-foreground">A focused English learning cockpit</p>
          </div>
        </Link>

        <div className="mt-5 rounded-3xl border bg-card px-4 py-4 shadow-sm">
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
              : '今天先推进主任务，再做一次短练习把薄弱点补上。'}
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

        <div className="mt-5 flex items-center gap-2 rounded-2xl border bg-card px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
            <Flame className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{streak?.current || 0} day streak</p>
            <p className="text-xs text-muted-foreground">{xp?.total?.toLocaleString() || 0} total XP</p>
          </div>
          <Badge variant="outline" className="rounded-full">Lv {xp?.level || 1}</Badge>
        </div>

        <div className="mt-6 space-y-2">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Core learning</p>
          {primaryNav.map((item) => renderNavItem(item))}
        </div>

        <div className="mt-6 space-y-2">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tools</p>
          {toolNav.map((item) => renderNavItem(item, true))}
        </div>

        <div className="mt-auto rounded-2xl border bg-card px-4 py-3">
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
                  {mobileSheetBody}
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
                <Button variant="outline" className="hidden rounded-2xl lg:flex" asChild>
                  <Link to="/dashboard/today">
                    <Zap className="mr-2 h-4 w-4" />
                    Continue today
                  </Link>
                </Button>
              ) : null}
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <div className={cn('flex-1 min-h-0', isChatRoute ? 'overflow-hidden' : 'overflow-auto')}>
          <div
            className={cn(
              'mx-auto w-full',
              isChatRoute ? 'h-full max-w-none' : 'max-w-7xl px-4 py-5 lg:px-8 lg:py-7',
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

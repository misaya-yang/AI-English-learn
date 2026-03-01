import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  Flame,
  Library,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Settings,
  Sun,
  Target,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getNavItems = (t: any) => [
  { path: '/dashboard/today', label: t('nav.today'), icon: Calendar },
  { path: '/dashboard/review', label: t('nav.review'), icon: Brain },
  { path: '/dashboard/practice', label: t('nav.practice'), icon: Zap },
  { path: '/dashboard/exam', label: t('nav.examPrep'), icon: Target },
  { path: '/dashboard/vocabulary', label: t('nav.vocabulary'), icon: Library },
  { path: '/dashboard/analytics', label: t('nav.analytics'), icon: Trophy },
  { path: '/dashboard/chat', label: t('nav.chat'), icon: MessageCircle },
];

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, profile, logout, isAuthenticated, isLoading } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const { streak, xp, dueWords } = useUserData();
  const location = useLocation();
  const navItems = getNavItems(t);
  const isChatRoute = location.pathname.startsWith('/dashboard/chat');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path: string) => location.pathname === path;

  const NavContent = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        const dueCount = item.path === '/dashboard/review' ? dueWords.length : 0;

        return (
          <TooltipProvider key={item.path} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={item.path}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      active && 'bg-emerald-600 hover:bg-emerald-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {dueCount > 0 && (
                      <Badge variant="secondary" className="bg-red-500 text-white">
                        {dueCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="hidden lg:block">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </nav>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar p-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">VocabDaily</h1>
            <p className="text-xs text-muted-foreground">AI 智能单词学习</p>
          </div>
        </Link>

        {/* Streak & XP */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">
                {streak?.current || 0} day streak
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {xp?.total?.toLocaleString() || 0} XP
            </span>
          </div>
          <Progress value={(xp?.today || 0)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Level {xp?.level || 1} • {Math.round((xp?.today || 0))}% to next
          </p>
        </div>

        <Separator className="mb-4" />

        {/* Navigation */}
        <div className="flex-1">
          <NavContent />
        </div>

        <Separator className="my-4" />

        {/* Developer Credit */}
        <div className="px-3 py-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Crafted by misaya</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-1">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/dashboard/settings">
                  <Button
                    variant={isActive('/dashboard/settings') ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive('/dashboard/settings') && 'bg-emerald-600 hover:bg-emerald-700'
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>设置</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex items-center justify-between p-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">VocabDaily</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{streak?.current || 0}</span>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.displayName || user?.email}</p>
                        <p className="text-xs text-muted-foreground">Level {xp?.level || 1}</p>
                      </div>
                    </div>
                    <Progress value={xp?.today || 0} className="h-2" />
                  </div>

                  <Separator className="mb-4" />

                  <div className="flex-1">
                    <NavContent />
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-1">
                    <Link to="/dashboard/settings">
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 lg:ml-0 overflow-hidden">
        {/* Desktop Header */}
        {!isChatRoute && (
          <header className="hidden lg:flex items-center justify-between border-b bg-card/80 backdrop-blur px-6 py-3">
          <div>
            <h2 className="text-lg font-semibold">
              {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-medium">{user?.displayName || user?.email}</p>
                    <p className="text-xs text-muted-foreground">Level {xp?.level || 1}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/dashboard/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/dashboard/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </header>
        )}

        {/* Page Content */}
        <div
          className={cn(
            'flex-1',
            isChatRoute
              ? 'p-0 pt-20 lg:pt-0 overflow-hidden min-h-0'
              : 'p-4 lg:p-6 pt-20 lg:pt-6 overflow-auto min-h-0',
          )}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

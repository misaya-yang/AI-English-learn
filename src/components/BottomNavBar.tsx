import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Brain, MessageCircleMore, WandSparkles, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavItem {
  path: string;
  label: string;
  labelZh: string;
  icon: typeof CalendarDays;
}

const NAV_ITEMS: BottomNavItem[] = [
  { path: '/dashboard/today', label: 'Today', labelZh: '今日', icon: CalendarDays },
  { path: '/dashboard/review', label: 'Review', labelZh: '复习', icon: Brain },
  { path: '/dashboard/chat', label: 'Chat', labelZh: '对话', icon: MessageCircleMore },
  { path: '/dashboard/practice', label: 'Practice', labelZh: '练习', icon: WandSparkles },
];

interface BottomNavBarProps {
  isLearningMode: boolean;
  onMoreClick: () => void;
}

export function BottomNavBar({ isLearningMode, onMoreClick }: BottomNavBarProps) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t backdrop-blur-xl',
        'pb-[env(safe-area-inset-bottom)]',
        isLearningMode
          ? 'border-white/[0.06] bg-black/90'
          : 'border-border/60 bg-background/90',
      )}
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors',
              active
                ? isLearningMode
                  ? 'text-emerald-400'
                  : 'text-primary'
                : isLearningMode
                  ? 'text-white/45 active:text-white/70'
                  : 'text-muted-foreground active:text-foreground',
            )}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {active && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className={cn(
                    'absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full',
                    isLearningMode ? 'bg-emerald-400' : 'bg-primary',
                  )}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </div>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onMoreClick}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors',
          isLearningMode
            ? 'text-white/45 active:text-white/70'
            : 'text-muted-foreground active:text-foreground',
        )}
      >
        <MoreHorizontal className="h-5 w-5" strokeWidth={1.8} />
        <span className="text-[10px] font-semibold">More</span>
      </button>
    </nav>
  );
}

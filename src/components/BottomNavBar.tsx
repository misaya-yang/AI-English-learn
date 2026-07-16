import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  getDashboardRoute,
  type DashboardRouteId,
} from '@/features/learning/routeRegistry';

interface BottomNavBarProps {
  isLearningMode: boolean;
  onMoreClick: () => void;
  moreOpen?: boolean;
}

const LEARNING_NAV_IDS: DashboardRouteId[] = ['today', 'review', 'practice', 'chat'];
const STANDARD_NAV_IDS: DashboardRouteId[] = ['today', 'chat', 'exam', 'review'];

export function BottomNavBar({ isLearningMode, onMoreClick, moreOpen = false }: BottomNavBarProps) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh') ?? false;
  const navItems = (isLearningMode ? LEARNING_NAV_IDS : STANDARD_NAV_IDS).map(getDashboardRoute);
  const hasVisibleActiveItem = navItems.some((item) => location.pathname.startsWith(item.path));
  const moreActive = !hasVisibleActiveItem;

  return (
    <nav
      className={cn(
        'liquid-glass-bar fixed inset-x-3 bottom-3 z-50 flex h-16 items-center justify-around border border-transparent',
        'pb-[env(safe-area-inset-bottom)]',
        isLearningMode
          ? 'premium-bottom-nav-learning'
          : 'premium-bottom-nav',
      )}
    >
      {navItems.map((item) => {
        const active = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        const label = isZh ? item.label.zh : item.label.en;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'liquid-glass-interactive relative flex h-12 min-w-[58px] flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl px-2.5 py-1.5 transition-colors',
              active
                ? isLearningMode
                  ? 'text-primary'
                  : 'text-primary'
                : isLearningMode
                  ? 'text-muted-foreground active:text-foreground'
                  : 'text-muted-foreground active:text-foreground',
            )}
          >
            {active && (
              <motion.div
                layoutId="bottomnav-active-pill"
                className="liquid-glass-active absolute inset-0 rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.75 }}
              />
            )}
            <div className="relative z-10">
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {active && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -bottom-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-sm bg-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </div>
            <span className="relative z-10 text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onMoreClick}
        aria-haspopup="dialog"
        aria-expanded={moreOpen}
        data-active={moreActive ? 'true' : 'false'}
        className={cn(
          'liquid-glass-interactive relative flex h-12 min-w-[58px] flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl px-2.5 py-1.5 transition-colors',
          moreActive ? 'text-primary' : 'text-muted-foreground active:text-foreground',
        )}
      >
        {moreActive && (
          <motion.div
            layoutId="bottomnav-active-pill"
            className="liquid-glass-active absolute inset-0 rounded-xl"
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.75 }}
          />
        )}
        <MoreHorizontal className="relative z-10 h-5 w-5" strokeWidth={moreActive ? 2.2 : 1.8} />
        <span className="relative z-10 text-[10px] font-semibold">{isZh ? '更多' : 'More'}</span>
      </button>
    </nav>
  );
}

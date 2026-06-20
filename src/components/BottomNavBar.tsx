import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getMobileNavRoutes } from '@/features/learning/routeRegistry';

interface BottomNavBarProps {
  isLearningMode: boolean;
  onMoreClick: () => void;
}

const NAV_ITEMS = getMobileNavRoutes(4);

export function BottomNavBar({ isLearningMode, onMoreClick }: BottomNavBarProps) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');

  return (
    <nav
      className={cn(
        'liquid-glass-bar fixed inset-x-3 bottom-3 z-50 flex h-16 items-center justify-around border border-border/50',
        'pb-[env(safe-area-inset-bottom)]',
        isLearningMode
          ? 'premium-bottom-nav-learning'
          : 'premium-bottom-nav',
      )}
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        const label = isZh ? item.label.zh : item.label.en;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors',
              active
                ? isLearningMode
                  ? 'text-primary'
                  : 'text-primary'
                : isLearningMode
                  ? 'text-muted-foreground active:text-foreground'
                  : 'text-muted-foreground active:text-foreground',
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {active && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -bottom-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-sm bg-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </div>
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onMoreClick}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors',
          isLearningMode
            ? 'text-muted-foreground active:text-foreground'
            : 'text-muted-foreground active:text-foreground',
        )}
      >
        <MoreHorizontal className="h-5 w-5" strokeWidth={1.8} />
        <span className="text-[10px] font-semibold">{isZh ? '更多' : 'More'}</span>
      </button>
    </nav>
  );
}

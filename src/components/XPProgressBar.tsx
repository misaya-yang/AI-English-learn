import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  todayXP: number;
  dailyGoal?: number;
  level: number;
  className?: string;
}

export function XPProgressBar({ todayXP, dailyGoal = 200, level, className }: XPProgressBarProps) {
  const progress = Math.min((todayXP / dailyGoal) * 100, 100);
  const isComplete = todayXP >= dailyGoal;

  // Track XP gain for fly-in animation
  const [lastXP, setLastXP] = useState(todayXP);
  const [xpGain, setXpGain] = useState<number | null>(null);

  useEffect(() => {
    if (todayXP > lastXP) {
      setXpGain(todayXP - lastXP);
      setLastXP(todayXP);
      const timer = setTimeout(() => setXpGain(null), 1200);
      return () => clearTimeout(timer);
    }
    setLastXP(todayXP);
  }, [todayXP, lastXP]);

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Star className={cn('h-3.5 w-3.5', isComplete ? 'text-warning' : 'text-muted-foreground')} />
          <span className="text-xs font-semibold text-muted-foreground">
            {todayXP} / {dailyGoal} XP
          </span>
        </div>
        <span className="text-xs font-bold text-muted-foreground">Lv {level}</span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-primary to-primary/80',
          )}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
        />
      </div>

      {/* XP gain fly-in */}
      <AnimatePresence>
        {xpGain != null && (
          <motion.span
            key={`xp-${Date.now()}`}
            className="absolute -top-1 right-0 text-xs font-bold text-emerald-500 pointer-events-none"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            +{xpGain} XP
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

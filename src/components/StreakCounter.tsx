import { useState } from 'react';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StreakCounterProps {
  current: number;
  longest: number;
  totalStudyDays?: number;
  className?: string;
}

const MILESTONES = [7, 30, 100, 365] as const;

function getMilestoneGlow(streak: number): string | undefined {
  if (streak >= 365) return 'border-warning/45 bg-warning/10';
  if (streak >= 100) return 'border-primary/35 bg-primary/10';
  if (streak >= 30) return 'border-primary/25 bg-primary/5';
  if (streak >= 7) return 'border-primary/20';
  return undefined;
}

export function StreakCounter({ current, longest, totalStudyDays, className }: StreakCounterProps) {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const milestoneGlow = getMilestoneGlow(current);
  const nextMilestone = MILESTONES.find((m) => m > current);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 transition-colors hover:border-border hover:bg-muted/60',
            milestoneGlow,
            className,
          )}
        >
          <Flame
            className={cn(
              'h-4 w-4 transition-colors',
              current > 0 ? 'text-orange-500' : 'text-muted-foreground',
            )}
          />
          <span className={cn('text-sm font-bold tabular-nums', current > 0 ? 'text-foreground' : 'text-muted-foreground')}>
            {current}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4" align="start">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-lg font-bold">{isZh ? `连续 ${current} 天` : `${current} day streak`}</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>{isZh ? '最长连续' : 'Longest streak'}</span>
                <span className="font-semibold text-foreground">{isZh ? `${longest} 天` : `${longest} days`}</span>
              </div>
              {totalStudyDays != null && (
                <div className="flex justify-between">
                  <span>{isZh ? '累计学习天数' : 'Total study days'}</span>
                  <span className="font-semibold text-foreground">{totalStudyDays}</span>
                </div>
              )}
              {nextMilestone && (
                <div className="mt-3 rounded-md border bg-muted/50 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground">{isZh ? '下一档' : 'Next milestone'}</p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {isZh
                      ? `还差 ${nextMilestone - current} 天到连续 ${nextMilestone} 天`
                      : `${nextMilestone - current} days to ${nextMilestone}-day streak`}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

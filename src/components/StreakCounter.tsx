import { useState } from 'react';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  if (streak >= 365) return 'ring-2 ring-amber-400/50 shadow-[0_0_20px_hsl(var(--warning)/0.4)]';
  if (streak >= 100) return 'ring-2 ring-emerald-400/40 shadow-[0_0_16px_hsl(var(--primary)/0.3)]';
  if (streak >= 30) return 'ring-1 ring-emerald-400/30';
  if (streak >= 7) return 'ring-1 ring-emerald-400/20';
  return undefined;
}

export function StreakCounter({ current, longest, totalStudyDays, className }: StreakCounterProps) {
  const [open, setOpen] = useState(false);
  const milestoneGlow = getMilestoneGlow(current);
  const nextMilestone = MILESTONES.find((m) => m > current);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all hover:scale-105',
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
              <span className="text-lg font-bold">{current} day streak</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Longest streak</span>
                <span className="font-semibold text-foreground">{longest} days</span>
              </div>
              {totalStudyDays != null && (
                <div className="flex justify-between">
                  <span>Total study days</span>
                  <span className="font-semibold text-foreground">{totalStudyDays}</span>
                </div>
              )}
              {nextMilestone && (
                <div className="mt-3 rounded-xl border bg-muted/50 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground">Next milestone</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{nextMilestone - current} days to {nextMilestone}-day streak</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  buildCoachActionPanelData,
  hasCoachActionPanel,
  type CoachActionDisplay,
} from '@/features/chat/utils/coachActions';
import type { CoachingAction } from '@/features/coach/coachingPolicy';

interface CoachActionPanelProps {
  actions: CoachingAction[] | undefined;
  language: string;
  onRunAction: (sendPrompt: string, action: CoachingAction) => void;
}

const iconFor = (icon: CoachActionDisplay['icon']) => {
  switch (icon) {
    case 'retry':
      return RotateCcw;
    case 'task':
      return Timer;
    case 'thinker':
      return HelpCircle;
    case 'celebrate':
      return Sparkles;
    case 'reflection':
    default:
      return Lightbulb;
  }
};

export function CoachActionPanel({ actions, language, onRunAction }: CoachActionPanelProps) {
  const data = useMemo(() => buildCoachActionPanelData(actions), [actions]);
  if (!hasCoachActionPanel(data)) return null;

  const isZh = language.startsWith('zh');
  const heading = isZh ? '教练建议的下一步' : 'Coach: next step';

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="mt-3 w-full rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-3 py-2.5 dark:border-emerald-800/40 dark:bg-emerald-900/10"
      aria-label={heading}
      data-testid="coach-action-panel"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          {heading}
        </span>
        {data.scheduledReviewCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            {isZh
              ? `已加入 ${data.scheduledReviewCount} 个复习`
              : `${data.scheduledReviewCount} review${data.scheduledReviewCount > 1 ? 's' : ''} scheduled`}
          </span>
        )}
      </div>

      {data.actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.actions.map((entry) => {
            const Icon = iconFor(entry.icon);
            const label = isZh ? entry.label.zh : entry.label.en;
            const interactive = Boolean(entry.sendPrompt);
            const hint = entry.action.prompt?.trim();
            const truncatedHint =
              hint && hint.length > 90 ? `${hint.slice(0, 88)}…` : hint;

            const handleClick = () => {
              if (!interactive || !entry.sendPrompt) return;
              onRunAction(entry.sendPrompt, entry.action);
            };

            return (
              <button
                key={entry.key}
                type="button"
                disabled={!interactive}
                onClick={handleClick}
                title={truncatedHint}
                aria-label={interactive ? `${label}: ${truncatedHint}` : label}
                className={cn(
                  'group inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors',
                  entry.variant === 'primary'
                    ? 'border border-emerald-500/60 bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border border-emerald-200/80 bg-white text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-100',
                  !interactive && 'cursor-default opacity-80 hover:bg-current/0',
                )}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium">{label}</span>
                {entry.durationHint && (
                  <span
                    className={cn(
                      'rounded-sm px-1 text-[10px] font-medium',
                      entry.variant === 'primary'
                        ? 'bg-emerald-500/30 text-emerald-50'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-200',
                    )}
                  >
                    {entry.durationHint}
                  </span>
                )}
                {truncatedHint && (
                  <span className="hidden truncate text-[11px] font-normal opacity-90 sm:inline">
                    · {truncatedHint}
                  </span>
                )}
                {interactive && (
                  <ArrowUpRight className="h-3 w-3 flex-shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

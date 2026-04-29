import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  Compass,
  Flame,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getMissionWhyChip,
  type MissionWhyVariant,
} from '@/features/learning/missionWhyChip';

interface MissionWhyBadgeProps {
  reason?: string | null;
  learnerMode?: 'recovery' | 'maintenance' | 'steady' | 'stretch' | 'sprint' | null;
  burnoutRisk?: number;
  language: string;
  className?: string;
}

const VARIANT_TONE: Record<MissionWhyVariant, string> = {
  recovery: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200',
  sprint:   'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200',
  review:   'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
  today:    'border-primary/20 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
  weakness: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200',
  practice: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200',
  default:  'border-border bg-muted/50 text-muted-foreground',
};

const VARIANT_ICON: Record<MissionWhyVariant, typeof Sparkles> = {
  recovery: AlertTriangle,
  sprint:   Flame,
  review:   BookOpen,
  today:    Target,
  weakness: Wrench,
  practice: Compass,
  default:  Sparkles,
};

export function MissionWhyBadge({
  reason,
  learnerMode,
  burnoutRisk,
  language,
  className,
}: MissionWhyBadgeProps) {
  const data = getMissionWhyChip({ reason, learnerMode, burnoutRisk });
  const Icon = VARIANT_ICON[data.variant];
  const isZh = language.startsWith('zh');
  const label = isZh ? data.label.zh : data.label.en;
  const subtitle = isZh ? data.subtitle.zh : data.subtitle.en;
  const whyHeading = isZh ? '为什么是这一步' : 'Why this step';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col gap-2 rounded-2xl border px-3 py-2 sm:flex-row sm:items-center sm:gap-3',
        VARIANT_TONE[data.variant],
        className,
      )}
      data-testid="mission-why-badge"
      data-variant={data.variant}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-current/15 p-1.5 text-current">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold tracking-wide opacity-70">
            {whyHeading}
          </span>
          <span className="text-sm font-semibold leading-tight">{label}</span>
        </div>
      </div>
      <p className="text-xs leading-snug opacity-90 sm:text-sm sm:leading-relaxed">
        {subtitle}
      </p>
    </motion.div>
  );
}

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
  recovery: 'border-red-400/30 bg-red-500/10 text-red-200 dark:text-red-100',
  sprint:   'border-violet-400/30 bg-violet-500/10 text-violet-200 dark:text-violet-100',
  review:   'border-amber-400/30 bg-amber-500/10 text-amber-200 dark:text-amber-100',
  today:    'border-emerald-400/30 bg-emerald-500/10 text-emerald-200 dark:text-emerald-100',
  weakness: 'border-orange-400/30 bg-orange-500/10 text-orange-200 dark:text-orange-100',
  practice: 'border-sky-400/30 bg-sky-500/10 text-sky-200 dark:text-sky-100',
  default:  'border-white/15 bg-white/[0.06] text-white/80',
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
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
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

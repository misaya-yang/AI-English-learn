import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  Compass,
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
  recovery: 'border-border bg-muted/60 text-foreground',
  sprint:   'border-border bg-muted/60 text-foreground',
  review:   'border-border bg-muted/60 text-foreground',
  today:    'border-border bg-muted/60 text-foreground',
  weakness: 'border-border bg-muted/60 text-foreground',
  practice: 'border-border bg-muted/60 text-foreground',
  default:  'border-border bg-muted/50 text-muted-foreground',
};

const VARIANT_ICON: Record<MissionWhyVariant, typeof Target> = {
  recovery: AlertTriangle,
  sprint:   Target,
  review:   BookOpen,
  today:    Target,
  weakness: Wrench,
  practice: Compass,
  default:  Target,
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
  const whyHeading = isZh ? '任务依据' : 'Task basis';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:gap-3',
        VARIANT_TONE[data.variant],
        className,
      )}
      data-testid="mission-why-badge"
      data-variant={data.variant}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-current/15 p-1.5 text-current">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium opacity-70">
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

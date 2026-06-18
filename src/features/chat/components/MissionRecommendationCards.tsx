import { motion } from 'framer-motion';
import {
  Compass,
  RotateCcw,
  Target,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  MissionRecommendation,
  MissionRecommendationIcon,
  MissionRecommendationVariant,
} from '@/features/chat/utils/missionRecommendations';

interface MissionRecommendationCardsProps {
  cards: MissionRecommendation[];
  language: string;
  onLaunch: (prompt: string, card: MissionRecommendation) => void;
  className?: string;
}

const ICON: Record<MissionRecommendationIcon, typeof Target> = {
  'review-pressure': RotateCcw,
  'mission-task': Target,
  'level-up': Compass,
  'exam-boost': Target,
  'beginner-warmup': Compass,
  'pronunciation': Volume2,
};

const VARIANT_TONE: Record<MissionRecommendationVariant, string> = {
  recovery: 'border-border bg-card text-foreground hover:bg-muted/40',
  review:   'border-border bg-card text-foreground hover:bg-muted/40',
  today:    'border-border bg-card text-foreground hover:bg-muted/40',
  sprint:   'border-border bg-card text-foreground hover:bg-muted/40',
  practice: 'border-border bg-card text-foreground hover:bg-muted/40',
  default:  'border-border bg-card text-foreground hover:bg-muted/40',
};

const VARIANT_BADGE: Record<MissionRecommendationVariant, string> = {
  recovery: 'bg-muted text-muted-foreground',
  review:   'bg-muted text-muted-foreground',
  today:    'bg-muted text-muted-foreground',
  sprint:   'bg-muted text-muted-foreground',
  practice: 'bg-muted text-muted-foreground',
  default:  'bg-muted text-muted-foreground',
};

export function MissionRecommendationCards({
  cards,
  language,
  onLaunch,
  className,
}: MissionRecommendationCardsProps) {
  if (!cards || cards.length === 0) return null;
  const isZh = language.startsWith('zh');
  const ctaLabel = isZh ? '开始' : 'Start';

  return (
    <div
      className={cn('w-full max-w-2xl divide-y divide-border rounded-md border border-border bg-background/70', className)}
      data-testid="mission-recommendation-cards"
    >
      {cards.map((card, index) => {
        const Icon = ICON[card.icon] || Target;
        const title = isZh ? card.title.zh : card.title.en;
        const reason = isZh ? card.reason.zh : card.reason.en;
        const estimatedMinutes = Math.max(1, Math.round(card.estimatedMinutes));

        return (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => onLaunch(card.promptZh && isZh ? card.promptZh : card.promptEn, card)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.04 }}
            className={cn(
              'group grid w-full gap-3 p-3 text-left transition-colors duration-150 sm:grid-cols-[1fr_auto] sm:items-center',
              VARIANT_TONE[card.variant],
            )}
            data-testid="mission-recommendation-card"
            data-variant={card.variant}
          >
            <div className="flex items-start gap-3">
              <span className={cn('rounded-md p-2', VARIANT_BADGE[card.variant])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="text-xs leading-snug opacity-85">{reason}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              <span className="text-[11px] text-muted-foreground">
                {isZh ? `${estimatedMinutes} 分钟` : `${estimatedMinutes} min`}
              </span>
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium transition-opacity group-hover:opacity-100',
                  VARIANT_BADGE[card.variant],
                )}
              >
                {ctaLabel}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

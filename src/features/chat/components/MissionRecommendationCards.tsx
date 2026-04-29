import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Compass,
  Flame,
  RotateCcw,
  Sparkles,
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

const ICON: Record<MissionRecommendationIcon, typeof Sparkles> = {
  'review-pressure': RotateCcw,
  'mission-task': Target,
  'level-up': Sparkles,
  'exam-boost': Flame,
  'beginner-warmup': Compass,
  'pronunciation': Volume2,
};

const VARIANT_TONE: Record<MissionRecommendationVariant, string> = {
  recovery: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100/70 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200',
  review:   'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/70 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
  today:    'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15',
  sprint:   'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100/70 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200',
  practice: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100/70 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200',
  default:  'border-border bg-card text-foreground hover:bg-muted/40',
};

const VARIANT_BADGE: Record<MissionRecommendationVariant, string> = {
  recovery: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  review:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  today:    'bg-primary/10 text-primary',
  sprint:   'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200',
  practice: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  default:  'bg-muted text-muted-foreground',
};

const VARIANT_HEADING: Record<MissionRecommendationVariant, { en: string; zh: string }> = {
  recovery: { en: 'Recovery focus', zh: '回稳重点' },
  review:   { en: 'Review pressure', zh: '复习紧迫' },
  today:    { en: 'Today\'s mission', zh: '今日任务' },
  sprint:   { en: 'Exam sprint', zh: '考前冲刺' },
  practice: { en: 'Targeted practice', zh: '针对练习' },
  default:  { en: 'Coach pick', zh: '教练推荐' },
};

const VARIANT_ALERT: Record<MissionRecommendationVariant, typeof Sparkles> = {
  recovery: AlertTriangle,
  review:   RotateCcw,
  today:    Target,
  sprint:   Flame,
  practice: Compass,
  default:  Sparkles,
};

export function MissionRecommendationCards({
  cards,
  language,
  onLaunch,
  className,
}: MissionRecommendationCardsProps) {
  if (!cards || cards.length === 0) return null;
  const isZh = language.startsWith('zh');
  const ctaLabel = isZh ? '让教练带我做' : 'Start with coach';

  return (
    <div
      className={cn('grid w-full max-w-2xl gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}
      data-testid="mission-recommendation-cards"
    >
      {cards.map((card, index) => {
        const Icon = ICON[card.icon] || Sparkles;
        const HeadingIcon = VARIANT_ALERT[card.variant];
        const headingLabel = isZh ? VARIANT_HEADING[card.variant].zh : VARIANT_HEADING[card.variant].en;
        const title = isZh ? card.title.zh : card.title.en;
        const reason = isZh ? card.reason.zh : card.reason.en;

        return (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => onLaunch(card.promptZh && isZh ? card.promptZh : card.promptEn, card)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.04 }}
            className={cn(
              'group relative flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition-colors duration-200 sm:p-5',
              VARIANT_TONE[card.variant],
            )}
            data-testid="mission-recommendation-card"
            data-variant={card.variant}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full p-1.5', VARIANT_BADGE[card.variant])}>
                  <HeadingIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-90">
                  {headingLabel}
                </span>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', VARIANT_BADGE[card.variant])}>
                ~{card.estimatedMinutes} min
              </span>
            </div>

            <div className="flex items-start gap-3">
              <span className={cn('rounded-xl p-2', VARIANT_BADGE[card.variant])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="text-xs leading-snug opacity-85">{reason}</p>
              </div>
            </div>

            <span
              className={cn(
                'mt-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium opacity-90 transition-opacity group-hover:opacity-100',
                VARIANT_BADGE[card.variant],
              )}
            >
              {ctaLabel}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

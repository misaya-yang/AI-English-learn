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
  recovery: 'border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/15',
  review:   'border-amber-400/30 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15',
  today:    'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15',
  sprint:   'border-violet-400/30 bg-violet-500/10 text-violet-100 hover:bg-violet-500/15',
  practice: 'border-sky-400/30 bg-sky-500/10 text-sky-100 hover:bg-sky-500/15',
  default:  'border-white/15 bg-white/[0.06] text-white/85 hover:bg-white/[0.10]',
};

const VARIANT_BADGE: Record<MissionRecommendationVariant, string> = {
  recovery: 'bg-red-500/15 text-red-100',
  review:   'bg-amber-500/15 text-amber-100',
  today:    'bg-emerald-500/15 text-emerald-100',
  sprint:   'bg-violet-500/15 text-violet-100',
  practice: 'bg-sky-500/15 text-sky-100',
  default:  'bg-white/[0.08] text-white/80',
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
              'group relative flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-colors duration-200 sm:p-5',
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

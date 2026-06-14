// UI-03 — Mission cards rendered above the chat composer in the
// welcome (no-messages) state. Pure presentation; the parent owns the
// composer state and decides what to do with the launched prompt.

import { Sparkles, Target, BookOpen, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MissionCard, MissionAccent } from './missionCardSelector';

interface MissionCardsProps {
  selected: MissionCard[];
  onLaunch: (prompt: string) => void;
  language?: string;
  className?: string;
}

const ACCENT_STYLES: Record<MissionAccent, { bg: string; ring: string; icon: typeof Sparkles }> = {
  practice: {
    bg: 'bg-primary/5',
    ring: 'ring-primary/20',
    icon: Sparkles,
  },
  coach: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    ring: 'ring-blue-200/60 dark:ring-blue-800/60',
    icon: Target,
  },
  exam: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    ring: 'ring-amber-200/60 dark:ring-amber-800/60',
    icon: BookOpen,
  },
  memory: {
    bg: 'bg-primary/5',
    ring: 'ring-primary/20',
    icon: Brain,
  },
};

export function MissionCards({ selected, onLaunch, language = 'en', className }: MissionCardsProps) {
  if (!selected || selected.length === 0) return null;
  const isZh = language.startsWith('zh');

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
      data-testid="mission-cards"
    >
      {selected.map((card) => {
        const style = ACCENT_STYLES[card.accent] ?? ACCENT_STYLES.coach;
        const Icon = style.icon;
        const title = isZh ? (card.titleZh || card.title) : card.title;
        const whyRecommended = isZh ? (card.whyRecommendedZh || card.whyRecommended) : card.whyRecommended;
        const prompt = isZh ? (card.promptZh || card.prompt) : card.prompt;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onLaunch(prompt)}
            className={cn(
              'group flex flex-col items-start gap-2 rounded-xl p-4 text-left ring-1 ring-inset transition',
              'hover:scale-[1.01] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              style.bg,
              style.ring,
            )}
            data-mission-id={card.id}
            data-mission-accent={card.accent}
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4" aria-hidden />
              {title}
            </span>
            <span className="text-xs text-muted-foreground">{whyRecommended}</span>
          </button>
        );
      })}
    </div>
  );
}

export default MissionCards;

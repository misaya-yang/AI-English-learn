// UI-03 — Mission cards rendered above the chat composer in the
// welcome (no-messages) state. Pure presentation; the parent owns the
// composer state and decides what to do with the launched prompt.

import { Sparkles, Target, BookOpen, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MissionCard, MissionAccent } from './missionCardSelector';

interface MissionCardsProps {
  selected: MissionCard[];
  onLaunch: (prompt: string) => void;
  className?: string;
}

const ACCENT_STYLES: Record<MissionAccent, { bg: string; ring: string; icon: typeof Sparkles }> = {
  practice: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    ring: 'ring-emerald-200/60 dark:ring-emerald-800/60',
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
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    ring: 'ring-violet-200/60 dark:ring-violet-800/60',
    icon: Brain,
  },
};

export function MissionCards({ selected, onLaunch, className }: MissionCardsProps) {
  if (!selected || selected.length === 0) return null;

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
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onLaunch(card.prompt)}
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
              {card.title}
            </span>
            <span className="text-xs text-muted-foreground">{card.whyRecommended}</span>
          </button>
        );
      })}
    </div>
  );
}

export default MissionCards;

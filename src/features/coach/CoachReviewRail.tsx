import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearningRailSection } from '@/features/learning/components/LearningWorkspace';
import { cn } from '@/lib/utils';
import {
  classifyDueness,
  formatCoachReviewDueLabel,
  partitionCoachReviews,
  type CoachReviewUrgency,
} from '@/features/coach/reviewRailLogic';
import type { ReviewQueueItem } from '@/features/coach/coachingPolicy';
import {
  getCoachReviews,
  markCoachReviewCompleted,
} from '@/services/coachReviewQueue';
import { useAuth } from '@/contexts/AuthContext';

interface CoachReviewRailProps {
  language: string;
  /**
   * Optional now-injection for tests / Storybook. The component otherwise
   * polls a fresh `Date.now()` inside `useMemo` so labels rotate as the
   * page sits open.
   */
  now?: Date;
}

const URGENCY_COLOR: Record<CoachReviewUrgency, string> = {
  overdue: 'border-red-500/30 bg-red-500/[0.08] text-red-200',
  now: 'border-amber-500/35 bg-amber-500/[0.10] text-amber-200',
  soon: 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-200',
  later: 'border-white/10 bg-white/[0.04] text-white/70',
};

const URGENCY_BADGE: Record<CoachReviewUrgency, string> = {
  overdue: 'border border-red-500/40 bg-red-500/15 text-red-200',
  now: 'border border-amber-500/40 bg-amber-500/15 text-amber-200',
  soon: 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
  later: 'border border-white/15 bg-white/[0.06] text-white/65',
};

export function CoachReviewRail({ language, now }: CoachReviewRailProps) {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [tick, setTick] = useState(0);
  const [allItems, setAllItems] = useState<ReviewQueueItem[]>([]);

  // Refresh once a minute so "Due in 5h" labels rotate while the page sits open.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const refresh = useCallback(() => {
    void getCoachReviews(userId).then(setAllItems);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Always run the hook so rules-of-hooks isn't violated when `now` is
  // injected for tests; the dependency on `tick` makes the timestamp
  // refresh once a minute when no override is supplied.
  const liveReference = useMemo(() => new Date(), [tick]);
  const reference = now ?? liveReference;

  const partition = useMemo(
    () => partitionCoachReviews(allItems, { now: reference }),
    [allItems, reference],
  );

  const totalCount = partition.due.length + partition.upcoming.length;
  if (totalCount === 0) return null;

  const isZh = language.startsWith('zh');
  const heading = isZh ? '教练复习队列' : 'Coach reviews';
  const subtitle = isZh
    ? '由 AI 教练在对话中安排，独立于 FSRS 复习卡。'
    : 'Scheduled by the AI coach during chat — separate from FSRS due cards.';
  const dueHeading = isZh ? `到期 ${partition.due.length}` : `${partition.due.length} due`;
  const upcomingHeading = isZh ? '即将到来' : 'Upcoming';

  const handleComplete = (id: string) => {
    void markCoachReviewCompleted(userId, id).then(refresh);
  };

  return (
    <LearningRailSection title={heading}>
      <div className="space-y-4" data-testid="coach-review-rail">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] p-2 text-emerald-300">
            <Brain className="h-4 w-4" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-white/82">{subtitle}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-white/60">
              <span className={cn('rounded-full px-2 py-0.5 font-medium', URGENCY_BADGE.now)}>
                {dueHeading}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-medium text-white/65">
                {isZh
                  ? `等待中 ${partition.upcoming.length}`
                  : `${partition.upcoming.length} upcoming`}
              </span>
            </div>
          </div>
        </div>

        {partition.due.length > 0 && (
          <div className="space-y-2">
            {partition.due.map((entry) => {
              const urgency = classifyDueness(entry.dueAt, { now: reference });
              const dueLabel = formatCoachReviewDueLabel(entry.dueAt, { now: reference, language });
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'rounded-2xl border px-3 py-2.5 text-sm shadow-glass',
                    URGENCY_COLOR[urgency],
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 leading-snug">{entry.prompt}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] opacity-80">
                        <Clock3 className="h-3 w-3" />
                        <span>{dueLabel}</span>
                        {entry.skill && (
                          <span className="rounded-sm border border-current/30 px-1 py-0 font-medium uppercase tracking-wide text-[10px]">
                            {entry.skill}
                          </span>
                        )}
                        {entry.targetWord && (
                          <span className="font-mono text-[11px]">· {entry.targetWord}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 rounded-full border border-current/30 px-2 text-[11px] text-current hover:bg-current/10 hover:text-current"
                      onClick={() => handleComplete(entry.id)}
                      data-testid="coach-review-complete"
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      {isZh ? '完成' : 'Done'}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {partition.upcoming.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              {upcomingHeading}
            </p>
            {partition.upcoming.map((entry) => {
              const urgency = classifyDueness(entry.dueAt, { now: reference });
              const dueLabel = formatCoachReviewDueLabel(entry.dueAt, { now: reference, language });
              return (
                <div
                  key={entry.id}
                  className={cn(
                    'rounded-2xl border px-3 py-2 text-xs',
                    URGENCY_COLOR[urgency],
                  )}
                >
                  <p className="line-clamp-2 leading-snug">{entry.prompt}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] opacity-80">
                    <Clock3 className="h-3 w-3" />
                    {dueLabel}
                    {entry.skill && (
                      <span className="rounded-sm border border-current/30 px-1 py-0 font-medium uppercase tracking-wide text-[10px]">
                        {entry.skill}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LearningRailSection>
  );
}

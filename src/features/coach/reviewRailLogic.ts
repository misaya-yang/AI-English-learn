// coachReviewRail.ts — selector + label helpers for the coach review surface.
//
// The coach review queue (`src/services/coachReviewQueue.ts`) stores
// schedulable coaching actions emitted by the AI tutor. These helpers pick
// the items the Review page rail should show right now and decide how to
// label their dueness in human-friendly terms. Pure module — no React
// imports — so the partitioning and label logic stays unit-testable
// independent of the UI layer.

import type { ReviewQueueItem } from '@/features/coach/coachingPolicy';

export type CoachReviewUrgency = 'overdue' | 'now' | 'soon' | 'later';

export interface CoachReviewPartition {
  /** Items that are due (dueAt <= now), sorted oldest-due first. */
  due: ReviewQueueItem[];
  /** Items not yet due, sorted soonest-due first, capped to `upcomingLimit`. */
  upcoming: ReviewQueueItem[];
}

interface PartitionOpts {
  now?: Date;
  /** Cap upcoming list — defaults to 5 to keep the rail compact. */
  upcomingLimit?: number;
}

const DEFAULT_UPCOMING_LIMIT = 5;

/**
 * Split a coach review queue snapshot into (due, upcoming) buckets sorted
 * appropriately. Invalid `dueAt` values are dropped (they would render
 * "Invalid Date" labels and cannot be evaluated).
 */
export function partitionCoachReviews(
  items: ReviewQueueItem[] | undefined | null,
  opts: PartitionOpts = {},
): CoachReviewPartition {
  if (!Array.isArray(items) || items.length === 0) {
    return { due: [], upcoming: [] };
  }
  const cutoff = (opts.now ?? new Date()).getTime();
  const limit = opts.upcomingLimit ?? DEFAULT_UPCOMING_LIMIT;

  const valid = items.filter((item) => {
    if (!item || typeof item.dueAt !== 'string') return false;
    const t = new Date(item.dueAt).getTime();
    return Number.isFinite(t);
  });

  const due = valid
    .filter((item) => new Date(item.dueAt).getTime() <= cutoff)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  const upcoming = valid
    .filter((item) => new Date(item.dueAt).getTime() > cutoff)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, limit);

  return { due, upcoming };
}

/**
 * Compute a coarse urgency bucket so the UI can pick a colour without
 * doing the date math itself. "now" means within 30 minutes either side
 * of the cutoff.
 */
export function classifyDueness(dueAtIso: string, opts: { now?: Date } = {}): CoachReviewUrgency {
  const dueMs = new Date(dueAtIso).getTime();
  if (!Number.isFinite(dueMs)) return 'later';
  const nowMs = (opts.now ?? new Date()).getTime();
  const diffMin = (dueMs - nowMs) / 60000;
  if (diffMin <= -30) return 'overdue';
  if (diffMin <= 30) return 'now';
  if (diffMin <= 60 * 24) return 'soon';
  return 'later';
}

interface DueLabelOpts {
  now?: Date;
  language?: string;
}

const isZh = (lang?: string): boolean => Boolean(lang && lang.startsWith('zh'));

const formatMinutes = (minutes: number, lang?: string): string => {
  const rounded = Math.max(1, Math.round(minutes));
  return isZh(lang) ? `${rounded} 分钟` : `${rounded} min`;
};

const formatHours = (hours: number, lang?: string): string => {
  const rounded = Math.max(1, Math.round(hours));
  if (isZh(lang)) return `${rounded} 小时`;
  return `${rounded}h`;
};

const formatDays = (days: number, lang?: string): string => {
  const rounded = Math.max(1, Math.round(days));
  if (isZh(lang)) return `${rounded} 天`;
  return `${rounded}d`;
};

/**
 * Human-friendly relative label for the coach review chip.
 *   • Overdue >30 min  → "Overdue 5h" / "已过期 5 小时"
 *   • Within ±30 min   → "Due now" / "即将到期"
 *   • Within 24h       → "Due in 5h"
 *   • Within 7 days    → "Due in 3d"
 *   • Beyond 7 days    → "Apr 12" / "4月12日"
 */
export function formatCoachReviewDueLabel(dueAtIso: string, opts: DueLabelOpts = {}): string {
  const dueMs = new Date(dueAtIso).getTime();
  if (!Number.isFinite(dueMs)) return '';

  const lang = opts.language;
  const nowMs = (opts.now ?? new Date()).getTime();
  const diffMs = dueMs - nowMs;
  const diffMin = diffMs / 60000;
  const diffHours = diffMs / 3_600_000;
  const diffDays = diffMs / 86_400_000;

  if (diffMin <= -30) {
    const overdueAbs = Math.abs(diffMin);
    if (overdueAbs < 60) {
      return isZh(lang) ? `已过期 ${formatMinutes(overdueAbs, lang)}` : `Overdue ${formatMinutes(overdueAbs, lang)}`;
    }
    if (overdueAbs < 60 * 24) {
      return isZh(lang) ? `已过期 ${formatHours(overdueAbs / 60, lang)}` : `Overdue ${formatHours(overdueAbs / 60, lang)}`;
    }
    return isZh(lang) ? `已过期 ${formatDays(overdueAbs / 60 / 24, lang)}` : `Overdue ${formatDays(overdueAbs / 60 / 24, lang)}`;
  }

  if (diffMin <= 30) {
    return isZh(lang) ? '即将到期' : 'Due now';
  }

  if (diffHours <= 24) {
    return isZh(lang) ? `${formatHours(diffHours, lang)}后到期` : `Due in ${formatHours(diffHours, lang)}`;
  }

  if (diffDays <= 7) {
    return isZh(lang) ? `${formatDays(diffDays, lang)}后到期` : `Due in ${formatDays(diffDays, lang)}`;
  }

  const due = new Date(dueMs);
  const month = due.getMonth() + 1;
  const day = due.getDate();
  return isZh(lang) ? `${month}月${day}日` : due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

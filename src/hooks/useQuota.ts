/**
 * useQuota — General-purpose quota enforcement hook
 * ─────────────────────────────────────────────────────────────────
 * Tracks daily usage for AI-powered features across the entire app.
 * Works with localStorage (client-side) so it's instant + offline-safe.
 * Usage resets at midnight local time.
 *
 * Feature keys:
 *   'aiWritingGrade'    — writing feedback requests
 *   'aiReadingGen'      — AI-generated reading passages
 *   'aiChat'            — AI coach chat messages
 *   'aiExamFeedback'    — exam prep advanced feedback
 *   'aiListeningGen'    — AI-generated listening items
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PlanTier } from '@/types/examContent';
import { getEntitlement } from '@/data/examContent';

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuotaFeature =
  | 'aiWritingGrade'
  | 'aiReadingGen'
  | 'aiChat'
  | 'aiExamFeedback'
  | 'aiListeningGen';

export interface QuotaStatus {
  feature: QuotaFeature;
  used: number;
  limit: number;
  remaining: number;
  isExhausted: boolean;
  plan: PlanTier;
}

// ─── Limits per plan ─────────────────────────────────────────────────────────

export const QUOTA_LIMITS: Record<PlanTier, Record<QuotaFeature, number>> = {
  free: {
    aiWritingGrade:   3,
    aiReadingGen:     2,
    aiChat:           10,
    aiExamFeedback:   2,
    aiListeningGen:   2,
  },
  pro: {
    aiWritingGrade:   50,
    aiReadingGen:     20,
    aiChat:           200,
    aiExamFeedback:   30,
    aiListeningGen:   20,
  },
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

const todayKey = (): string => new Date().toISOString().split('T')[0]; // YYYY-MM-DD

function storageKey(userId: string, feature: QuotaFeature): string {
  return `vocabdaily_quota_${userId}_${feature}_${todayKey()}`;
}

function getUsed(userId: string, feature: QuotaFeature): number {
  try {
    const val = parseInt(localStorage.getItem(storageKey(userId, feature)) ?? '0', 10);
    return Number.isNaN(val) ? 0 : val;
  } catch {
    return 0;
  }
}

function incrementUsed(userId: string, feature: QuotaFeature): number {
  const key = storageKey(userId, feature);
  const next = getUsed(userId, feature) + 1;
  try {
    localStorage.setItem(key, String(next));
  } catch {
    // ignore storage errors
  }
  return next;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuota() {
  const { user } = useAuth();
  const userId = user?.id ?? 'anonymous';
  const [plan, setPlan] = useState<PlanTier>('free');

  // Load entitlement (plan tier) on mount
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getEntitlement(user.id).then((entitlement) => {
      if (!cancelled) setPlan(entitlement.plan as PlanTier);
    }).catch(() => { /* stay on free */ });
    return () => { cancelled = true; };
  }, [user?.id]);

  /**
   * Get the current quota status for a feature without consuming it.
   */
  const getStatus = useCallback(
    (feature: QuotaFeature): QuotaStatus => {
      const limit = QUOTA_LIMITS[plan][feature];
      const used = getUsed(userId, feature);
      return {
        feature,
        used,
        limit,
        remaining: Math.max(0, limit - used),
        isExhausted: used >= limit,
        plan,
      };
    },
    [plan, userId],
  );

  /**
   * Consume one unit of quota for a feature.
   * Returns `false` if the limit is already reached (caller should block the action).
   * Returns `true` if consumption succeeded.
   */
  const consume = useCallback(
    (feature: QuotaFeature): boolean => {
      const { isExhausted } = getStatus(feature);
      if (isExhausted) return false;
      incrementUsed(userId, feature);
      return true;
    },
    [getStatus, userId],
  );

  /**
   * Check if a feature has quota remaining without consuming it.
   */
  const canUse = useCallback(
    (feature: QuotaFeature): boolean => !getStatus(feature).isExhausted,
    [getStatus],
  );

  /**
   * Snapshot of all feature quota statuses.
   */
  const allStatuses = useMemo(
    () => (Object.keys(QUOTA_LIMITS.free) as QuotaFeature[]).map((f) => getStatus(f)),
    [getStatus],
  );

  return { plan, getStatus, consume, canUse, allStatuses };
}

import { useCallback, useEffect, useMemo, useState } from 'react';

import { getEntitlement, getQuotaSnapshot } from '@/data/examContent';
import { FEATURE_TOTAL_BY_PLAN } from '@/features/exam/constants';
import type { ExamQuotaRemaining } from '@/features/exam/types';
import type { PlanTier } from '@/types/examContent';

const EMPTY_QUOTA: ExamQuotaRemaining = {
  aiAdvancedFeedbackPerDay: 0,
  simItemsPerDay: 0,
  microLessonsPerDay: 0,
};

export function useExamQuotaState(userId: string) {
  const [plan, setPlan] = useState<PlanTier>('free');
  const [remainingQuota, setRemainingQuota] = useState<ExamQuotaRemaining>(EMPTY_QUOTA);

  const refreshQuota = useCallback(async () => {
    const quota = await getQuotaSnapshot(userId);
    setRemainingQuota(quota.remaining);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    const loadEntitlement = async () => {
      const entitlement = await getEntitlement(userId);
      if (cancelled) return;
      setPlan(entitlement.plan);

      const quota = await getQuotaSnapshot(userId);
      if (cancelled) return;
      setRemainingQuota(quota.remaining);
    };

    void loadEntitlement();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const quotaTotal = useMemo(() => FEATURE_TOTAL_BY_PLAN[plan] || FEATURE_TOTAL_BY_PLAN.free, [plan]);

  return {
    plan,
    remainingQuota,
    quotaTotal,
    refreshQuota,
  };
}

import { useEffect, useState } from 'react';

import type { ExamDraftSnapshot } from '@/features/exam/types';

interface UseExamDraftPersistenceArgs {
  draftKey: string;
  snapshot: ExamDraftSnapshot;
  onHydrate: (snapshot: ExamDraftSnapshot) => void;
}

export function useExamDraftPersistence({
  draftKey,
  snapshot,
  onHydrate,
}: UseExamDraftPersistenceArgs) {
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(draftKey);
    if (!raw) {
      setDraftHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ExamDraftSnapshot;
      onHydrate(parsed);
    } catch {
      // Ignore malformed draft snapshots.
    } finally {
      setDraftHydrated(true);
    }
  }, [draftKey, onHydrate]);

  useEffect(() => {
    if (!draftHydrated) return;

    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(snapshot));
      setAutosavedAt(new Date().toLocaleTimeString());
    }, 500);

    return () => window.clearTimeout(timer);
  }, [draftHydrated, draftKey, snapshot]);

  return {
    draftHydrated,
    autosavedAt,
  };
}

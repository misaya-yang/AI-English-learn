import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DashboardSkeleton() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  return (
    <div
      role="status"
      aria-live="polite"
      className="p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {isZh ? '正在打开学习任务' : 'Opening learning task'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isZh ? '读取词书和本轮进度。' : 'Reading your word book and round progress.'}
            </p>
          </div>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 rounded-full bg-primary/55 animate-shimmer" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_260px]">
          <Skeleton className="h-28 rounded-md bg-muted/70" />
          <Skeleton className="h-40 rounded-md bg-muted/70" />
          <Skeleton className="h-28 rounded-md bg-muted/70" />
        </div>
      </div>
    </div>
  );
}

/**
 * Branded skeleton for public pages (landing, pricing, auth, etc.)
 * Shows VocabDaily logo + emerald progress animation.
 */
export function PageSkeleton() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center bg-background animate-in fade-in duration-300"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">VocabDaily</p>
        <p className="text-xs text-muted-foreground">{isZh ? '正在打开页面' : 'Opening page'}</p>
        <div className="h-0.5 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-primary/60 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

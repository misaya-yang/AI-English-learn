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
      className="bg-background p-4 text-foreground animate-in fade-in duration-200 sm:p-6"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="study-sheet flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--paper-line)/0.8)] bg-[hsl(var(--paper-muted)/0.6)] text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {isZh ? '正在打开' : 'Opening'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isZh ? '读取词书和进度' : 'Loading words and progress'}
            </p>
          </div>
          <div className="hidden h-1 w-24 overflow-hidden rounded-full bg-muted sm:block">
            <div className="h-full w-1/2 rounded-full bg-primary/55 animate-shimmer" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <Skeleton className="h-56 rounded-xl bg-muted/60" />
          <Skeleton className="h-40 rounded-xl bg-muted/60" />
        </div>
      </div>
    </div>
  );
}

/**
 * Branded skeleton for public pages (landing, pricing, auth, etc.)
 * Shows VocabDaily logo with a quiet study progress cue.
 */
export function PageSkeleton() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[42vh] flex-col items-center justify-center bg-background px-6 text-foreground animate-in fade-in duration-300"
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

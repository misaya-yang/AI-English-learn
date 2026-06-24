import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DashboardSkeleton() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const rows = isZh
    ? ['今天', '复习', '练习', '进度']
    : ['Today', 'Review', 'Practice', 'Progress'];

  return (
    <div
      role="status"
      aria-live="polite"
      className="study-app-bg min-h-[calc(100vh-5rem)] bg-background p-4 text-foreground animate-in fade-in duration-200 sm:p-6"
    >
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden rounded-xl border border-transparent bg-[hsl(var(--paper)/0.74)] p-3 shadow-none md:block">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[hsl(var(--paper-muted)/0.6)] text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">VocabDaily</p>
              <p className="text-xs text-muted-foreground">{isZh ? '学习' : 'Study'}</p>
            </div>
          </div>
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={row}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground"
              >
                <span>{row}</span>
                <span className={index === 0 ? 'h-1.5 w-1.5 rounded-full bg-primary/70' : 'h-1.5 w-8 rounded-full bg-muted'} />
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="study-sheet flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[hsl(var(--paper-muted)/0.6)] text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {isZh ? '正在加载' : 'Loading'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isZh ? '保持当前页面，马上继续。' : 'Keeping this page ready.'}
              </p>
            </div>
            <div className="hidden h-1 w-24 overflow-hidden rounded-full bg-muted sm:block">
              <div className="h-full w-1/2 rounded-full bg-primary/55 animate-shimmer" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="rounded-xl border border-transparent bg-[hsl(var(--paper)/0.72)] p-5 shadow-none">
              <Skeleton className="mb-5 h-4 w-24 rounded-md bg-muted/65" />
              <Skeleton className="mb-6 h-8 w-2/3 rounded-md bg-muted/70" />
              <div className="space-y-3">
                <Skeleton className="h-12 rounded-lg bg-muted/60" />
                <Skeleton className="h-12 rounded-lg bg-muted/55" />
                <Skeleton className="h-12 rounded-lg bg-muted/50" />
              </div>
            </div>
            <div className="rounded-xl border border-transparent bg-[hsl(var(--paper)/0.7)] p-4 shadow-none">
              <p className="mb-3 text-xs font-medium text-muted-foreground">{isZh ? '当前页面' : 'Current page'}</p>
              <Skeleton className="mb-3 h-8 w-20 rounded-md bg-muted/65" />
              <Skeleton className="h-2 w-full rounded-full bg-muted/60" />
            </div>
          </div>
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

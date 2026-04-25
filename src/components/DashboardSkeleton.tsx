import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

/**
 * Skeleton placeholder shown while dashboard pages are lazy-loading.
 * Mimics the typical dashboard page layout: header + cards grid.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Hero card */}
      <Skeleton className="h-44 w-full rounded-xl" />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-60 rounded-lg" />
        <Skeleton className="h-60 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Branded skeleton for public pages (landing, pricing, auth, etc.)
 * Shows VocabDaily logo + emerald progress animation.
 */
export function PageSkeleton() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-background animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium tracking-tight text-foreground">VocabDaily</p>
        <div className="h-0.5 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-primary/60 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

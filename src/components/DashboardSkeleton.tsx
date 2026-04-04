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
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
        {/* Logo */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse">
          <BookOpen className="h-7 w-7" />
        </div>

        {/* Brand */}
        <div className="text-center">
          <p className="text-lg font-bold tracking-tight text-foreground">VocabDaily</p>
          <p className="mt-1 text-sm text-muted-foreground">Loading your experience...</p>
        </div>

        {/* Emerald progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

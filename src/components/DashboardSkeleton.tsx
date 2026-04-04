import { Skeleton } from '@/components/ui/skeleton';

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
 * Minimal skeleton for public pages (landing, pricing, etc.)
 */
export function PageSkeleton() {
  return (
    <div className="flex h-[40vh] items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-10 w-32 mx-auto mt-6" />
      </div>
    </div>
  );
}

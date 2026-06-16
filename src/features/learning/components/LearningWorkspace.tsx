import type { ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type AccentTone =
  | 'default'
  | 'emerald'
  | 'warm'
  | 'memory'
  | 'practice'
  | 'coach'
  | 'exam'
  | 'success'
  | 'warning'
  | 'danger';

export interface MetricItem {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: AccentTone;
}

interface LearningShellFrameProps {
  children: ReactNode;
  className?: string;
}

interface LearningHeroPanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  progress?: number | null;
  progressLabel?: string;
  progressValueLabel?: string;
  metrics?: MetricItem[];
  actions?: ReactNode;
  className?: string;
}

interface LearningRailSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

interface LearningWorkspaceSurfaceProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface LearningMetricStripProps {
  items: MetricItem[];
  className?: string;
}

interface LearningActionClusterProps {
  children: ReactNode;
  className?: string;
}

interface LearningStatePanelProps {
  icon: ComponentType<{ className?: string }>;
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  metrics?: MetricItem[];
  className?: string;
}

export const learningFrameClassName =
  'relative rounded-md border border-border bg-[hsl(var(--surface-raised))] shadow-[0_1px_2px_hsl(var(--shadow-studio)/0.045)] transition-colors duration-150';

const metricToneClass: Record<AccentTone, string> = {
  default: 'text-foreground',
  emerald: 'text-primary',
  warm: 'text-amber-600 dark:text-amber-300',
  memory: 'text-[hsl(var(--accent-memory))]',
  practice: 'text-[hsl(var(--accent-practice))]',
  coach: 'text-[hsl(var(--accent-coach))]',
  exam: 'text-amber-600 dark:text-amber-300',
  success: 'text-[hsl(var(--success))]',
  warning: 'text-amber-600 dark:text-amber-300',
  danger: 'text-destructive',
};

export function LearningShellFrame({ children, className }: LearningShellFrameProps) {
  return <div className={cn('space-y-6 lg:space-y-8', className)}>{children}</div>;
}

export function LearningHeroPanel({
  eyebrow,
  title,
  description,
  progress,
  progressLabel,
  progressValueLabel,
  metrics = [],
  actions,
  className,
}: LearningHeroPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(learningFrameClassName, 'premium-hero-panel overflow-hidden p-4 sm:p-5', className)}
    >
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
          {eyebrow ? (
            <Badge className="rounded-md border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted">
              {eyebrow}
            </Badge>
          ) : null}
          <div className="space-y-2">
            <h1 className="max-w-3xl text-xl font-semibold leading-snug text-foreground sm:text-2xl lg:text-[1.7rem]">
              {title}
            </h1>
            {description ? <p className="line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:line-clamp-none">{description}</p> : null}
          </div>
          </div>
          {actions ? <LearningActionCluster className="shrink-0 lg:justify-end">{actions}</LearningActionCluster> : null}
        </div>

        {(typeof progress === 'number' || metrics.length > 0) ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {typeof progress === 'number' ? (
            <div className="premium-metric-card rounded-md border border-border bg-[hsl(var(--surface-raised))] px-3 py-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">{progressLabel || '进度'}</p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {progressValueLabel || `${progress}%`}
                  </p>
                </div>
                <p className="hidden max-w-[7rem] text-right text-xs leading-5 text-muted-foreground lg:block">
                  {progress >= 100 ? '任务完成' : '继续'}
                </p>
              </div>
              <Progress
                value={progress}
                className="h-1.5 bg-muted [&_[data-slot=progress-indicator]]:bg-primary"
              />
            </div>
          ) : null}

          {metrics.map((item) => (
            <div key={`${item.label}-${String(item.value)}`} className="premium-metric-card rounded-md border border-border bg-[hsl(var(--surface-raised))] px-3 py-2">
              <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
              <div className={cn('mt-1 text-base font-semibold', metricToneClass[item.accent || 'default'])}>
                {item.value}
              </div>
            </div>
          ))}
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

export function LearningRailSection({ title, description, children, className }: LearningRailSectionProps) {
  return (
    <section className={cn(learningFrameClassName, 'space-y-3 p-4', className)}>
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
        {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LearningWorkspaceSurface({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: LearningWorkspaceSurfaceProps) {
  return (
    <section className={cn(learningFrameClassName, 'overflow-hidden', className)}>
      <div className="border-b border-border bg-[hsl(var(--surface-sunken))]/62 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            {eyebrow ? <p className="text-[11px] font-medium text-muted-foreground">{eyebrow}</p> : null}
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
            {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
      <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  );
}

export function LearningMetricStrip({ items, className }: LearningMetricStripProps) {
  return (
    <div className={cn('grid gap-2 border-t border-border pt-3 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {items.map((item) => (
        <div key={`${item.label}-${String(item.value)}`} className="premium-metric-card space-y-1 rounded-md border border-border bg-[hsl(var(--surface-raised))] px-3 py-2">
          <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
          <div className={cn('text-lg font-semibold', metricToneClass[item.accent || 'default'])}>
            {item.value}
          </div>
          {item.hint ? <p className="hidden text-xs leading-5 text-muted-foreground xl:block">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function LearningActionCluster({ children, className }: LearningActionClusterProps) {
  return <div className={cn('flex flex-col gap-2 sm:flex-row sm:flex-wrap', className)}>{children}</div>;
}

export function LearningEmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  metrics,
  className,
}: LearningStatePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(learningFrameClassName, 'px-5 py-8 text-center sm:px-8', className)}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      {eyebrow ? <p className="mt-5 text-[11px] font-medium text-muted-foreground">{eyebrow}</p> : null}
      <h2 className="mt-3 text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      {metrics && metrics.length > 0 ? <LearningMetricStrip items={metrics} className="mx-auto mt-8 max-w-3xl text-left" /> : null}
      {actions ? <LearningActionCluster className="mt-8 justify-center">{actions}</LearningActionCluster> : null}
    </motion.section>
  );
}

export function LearningCompletionState({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  metrics,
  className,
}: LearningStatePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(learningFrameClassName, 'overflow-hidden px-5 py-8 sm:px-8', className)}
    >
      <div className="relative text-center z-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        {eyebrow ? <p className="mt-6 text-[11px] font-medium text-muted-foreground">{eyebrow}</p> : null}
        <h2 className="mt-3 text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {metrics && metrics.length > 0 ? <LearningMetricStrip items={metrics} className="mt-8" /> : null}
      {actions ? <LearningActionCluster className="mt-8 justify-center">{actions}</LearningActionCluster> : null}
    </motion.section>
  );
}

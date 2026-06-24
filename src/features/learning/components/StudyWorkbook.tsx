import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StudyShellProps {
  children: ReactNode;
  className?: string;
}

interface StudySheetProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

interface StudyRailProps {
  children: ReactNode;
  className?: string;
}

interface StudyRailSectionProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface StudyTaskItem {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  note?: ReactNode;
  action?: ReactNode;
}

interface StudyTaskListProps {
  items: StudyTaskItem[];
  className?: string;
}

interface StudyStatItem {
  label: ReactNode;
  value: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'practice';
}

interface StudyStatRowsProps {
  items: StudyStatItem[];
  className?: string;
}

interface QuestionSheetProps {
  children: ReactNode;
  className?: string;
  title: ReactNode;
  meta?: ReactNode;
  prompt?: ReactNode;
  actions?: ReactNode;
}

interface InlineStudyNoteProps {
  title: ReactNode;
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'practice';
  className?: string;
  testId?: string;
}

const toneClass = {
  default: 'text-foreground',
  success: 'text-[hsl(var(--success))]',
  warning: 'text-[hsl(var(--warning))]',
  danger: 'text-destructive',
  practice: 'text-[hsl(var(--accent-practice))]',
} satisfies Record<NonNullable<StudyStatItem['tone']>, string>;

const noteToneClass = {
  neutral: 'border-[hsl(var(--paper-line)/0.86)] bg-[hsl(var(--paper-muted)/0.5)]',
  success: 'border-[hsl(var(--success)/0.34)] bg-[hsl(var(--success)/0.08)]',
  warning: 'border-[hsl(var(--warning)/0.38)] bg-[hsl(var(--warning)/0.1)]',
  danger: 'border-destructive/30 bg-destructive/5',
  practice: 'border-[hsl(var(--accent-practice)/0.34)] bg-[hsl(var(--accent-practice)/0.08)]',
} satisfies Record<NonNullable<InlineStudyNoteProps['tone']>, string>;

export function StudyShell({ children, className }: StudyShellProps) {
  return <div className={cn('workbook-page space-y-5', className)}>{children}</div>;
}

export function StudySheet({ children, className, title, eyebrow, description, actions }: StudySheetProps) {
  return (
    <section className={cn('study-sheet', className)}>
      {(title || eyebrow || description || actions) ? (
        <div className="mb-5 flex flex-col gap-4 border-b border-[hsl(var(--paper-line)/0.72)] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? <p className="study-label">{eyebrow}</p> : null}
            {title ? <h1 className="study-heading mt-2">{title}</h1> : null}
            {description ? <p className="study-copy mt-2 max-w-2xl">{description}</p> : null}
          </div>
          {actions ? (
            <div className="study-action-cluster flex shrink-0 flex-wrap gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function QuestionSheet({ children, className, title, meta, prompt, actions }: QuestionSheetProps) {
  return (
    <section className={cn('question-sheet', className)}>
      <div className="border-b border-[hsl(var(--paper-line)/0.76)] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {meta ? <div className="study-label">{meta}</div> : null}
          {actions ? (
            <div className="study-action-cluster flex flex-wrap gap-2">
              {actions}
            </div>
          ) : null}
        </div>
        <h2 className="question-title mt-4">{title}</h2>
        {prompt ? <div className="study-copy mt-3 text-base leading-7">{prompt}</div> : null}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

export function StudyRail({ children, className }: StudyRailProps) {
  return <aside className={cn('study-rail space-y-4', className)}>{children}</aside>;
}

export function StudyRailSection({ title, children, className }: StudyRailSectionProps) {
  return (
    <section className={cn('study-rail-section', className)}>
      {title ? <p className="study-label mb-3">{title}</p> : null}
      {children}
    </section>
  );
}

export function StudyTaskList({ items, className }: StudyTaskListProps) {
  return (
    <div className={cn('study-task-list', className)}>
      {items.map((item) => (
        <div key={String(item.label)} className="study-task-row">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            {item.note ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.note}</p> : null}
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex min-w-[76px] items-baseline justify-end gap-1">
              <span className="study-number text-3xl text-foreground">{item.value}</span>
              {item.unit ? <span className="text-xs text-muted-foreground">{item.unit}</span> : null}
            </div>
            {item.action ? <div className="shrink-0">{item.action}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StudyStatRows({ items, className }: StudyStatRowsProps) {
  return (
    <div className={cn('divide-y divide-[hsl(var(--paper-line)/0.7)]', className)}>
      {items.map((item) => (
        <div key={String(item.label)} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <span className="text-sm text-muted-foreground">{item.label}</span>
          <span className={cn('study-number text-xl', toneClass[item.tone || 'default'])}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function InlineStudyNote({ title, children, tone = 'neutral', className, testId }: InlineStudyNoteProps) {
  return (
    <div className={cn('inline-study-note', noteToneClass[tone], className)} data-testid={testId}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div>
    </div>
  );
}

export const WorkbookPage = StudyShell;
export const SolidStudySurface = StudySheet;
export const StudyMetricRail = StudyRail;

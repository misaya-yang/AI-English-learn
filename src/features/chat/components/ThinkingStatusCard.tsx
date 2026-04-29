import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface ThinkingStatusCardProps {
  label: string;
  language: string;
  isStreaming: boolean;
  toolRuns: Array<{ name: string; status: 'success' | 'error' | 'skipped' | 'rate_limited' }>;
}

export const ThinkingStatusCard = ({ label, language, isStreaming, toolRuns }: ThinkingStatusCardProps) => {
  const latestRuns = toolRuns.slice(-3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 py-2"
    >
      <Avatar className="w-8 h-8 bg-primary/10">
        <AvatarFallback>
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <p className="font-medium">{label}</p>
          <motion.span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isStreaming
            ? language.startsWith('zh')
              ? '正在流式输出...'
              : 'Streaming response...'
            : language.startsWith('zh')
              ? '正在组织回答...'
              : 'Composing response...'}
        </p>

        {latestRuns.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {latestRuns.map((run, idx) => {
              const statusClass =
                run.status === 'success'
                  ? 'border-[hsl(var(--success)/0.35)] text-[hsl(var(--success))]'
                  : run.status === 'error'
                    ? 'border-red-300/60 text-red-600 dark:text-red-300'
                    : run.status === 'rate_limited'
                      ? 'border-amber-300/60 text-amber-700 dark:text-amber-300'
                      : 'border-border text-muted-foreground';

              return (
                <span
                  key={`${run.name}-${idx}`}
                  className={cn('rounded-full border bg-background/70 px-2 py-0.5 text-[11px]', statusClass)}
                >
                  {run.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

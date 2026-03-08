import { cn } from '@/lib/utils';
import type { MemoryUsedTrace, MemoryWriteTrace } from '@/types/chatAgent';

interface ChatMemoryBannerProps {
  language: string;
  contentWidthClass: string;
  memoryUsed: MemoryUsedTrace[];
  memoryWrites: MemoryWriteTrace[];
  memoryTraceId?: string | null;
}

export function ChatMemoryBanner({
  language,
  contentWidthClass,
  memoryUsed,
  memoryWrites,
  memoryTraceId,
}: ChatMemoryBannerProps) {
  if (memoryUsed.length === 0 && memoryWrites.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-2">
      <div className={cn(contentWidthClass, 'mx-auto rounded-xl border border-cyan-300/45 bg-cyan-50/55 p-3 dark:bg-cyan-900/20')}>
        <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
          {language.startsWith('zh') ? '记忆透明卡' : 'Memory transparency'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {memoryUsed.length > 0
            ? language.startsWith('zh')
              ? `本轮命中 ${memoryUsed.length} 条记忆`
              : `${memoryUsed.length} memory items used this turn`
            : language.startsWith('zh')
              ? '本轮未命中历史记忆'
              : 'No historical memory used this turn'}
          {memoryWrites.length > 0
            ? language.startsWith('zh')
              ? `，新增 ${memoryWrites.length} 条记忆`
              : `, ${memoryWrites.length} memory writes saved`
            : ''}
        </p>
        {memoryTraceId && (
          <p className="mt-1 text-[10px] text-muted-foreground">trace: {memoryTraceId}</p>
        )}
      </div>
    </div>
  );
}

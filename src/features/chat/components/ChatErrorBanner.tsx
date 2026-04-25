import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatRequestError } from '@/features/chat/state/types';

export interface ChatErrorBannerProps {
  error: ChatRequestError;
  language: string;
  contentWidthClass: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const ChatErrorBanner = ({
  error,
  language,
  contentWidthClass,
  isRetrying,
  onRetry,
}: ChatErrorBannerProps) => {
  const isZh = language.startsWith('zh');
  return (
    <div className="px-4 pb-2">
      <div className={cn(contentWidthClass, 'mx-auto rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-900/20 p-3 flex items-start gap-3')}>
        <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {isZh ? 'AI 暂时不可用' : 'AI is temporarily unavailable'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {error.message}
            {error.requestId ? ` · requestId: ${error.requestId}` : ''}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          {isZh ? '重试' : 'Retry'}
        </Button>
      </div>
    </div>
  );
};

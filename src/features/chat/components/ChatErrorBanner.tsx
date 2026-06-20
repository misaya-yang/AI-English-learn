import { Link } from 'react-router-dom';
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
      <div className={cn(contentWidthClass, 'mx-auto flex items-start gap-3 rounded-2xl border border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning)/0.10)] p-3')}>
        <AlertTriangle className="h-4 w-4 mt-0.5 text-[hsl(var(--warning))] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {isZh ? '在线答疑暂时不可用' : 'Online help is temporarily unavailable'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {error.message}
            {error.requestId ? ` · requestId: ${error.requestId}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button size="sm" variant="glass" asChild>
            <Link to="/dashboard/practice">
              {isZh ? '本地练习' : 'Practice locally'}
            </Link>
          </Button>
          <Button size="sm" variant="glass" onClick={onRetry} disabled={isRetrying}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            {isZh ? '重试' : 'Retry'}
          </Button>
        </div>
      </div>
    </div>
  );
};

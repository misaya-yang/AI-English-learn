import { useState } from 'react';
import { Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildDbSetupGuide } from '@/features/chat/utils/dbSetupGuide';

export interface DatabaseStatusBannerProps {
  language: string;
  dbStatus: Record<string, boolean>;
}

export const DatabaseStatusBanner = ({ language, dbStatus }: DatabaseStatusBannerProps) => {
  const [showDbSetup, setShowDbSetup] = useState(false);

  const entries = Object.entries(dbStatus);
  if (entries.length === 0 || entries.every(([, exists]) => exists)) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 max-w-lg shadow-lg">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{language.startsWith('zh') ? '需要初始化数据库表' : 'Database tables need initialization'}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {language.startsWith('zh')
              ? '检测到数据库对象缺失。请使用项目 migration 完成初始化，不要再手动粘贴旧 SQL。'
              : 'Database objects are missing. Use the project migrations instead of pasting the old bootstrap SQL.'}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {entries.map(([table, exists]) => (
              <span
                key={table}
                className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  exists
                    ? 'bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]'
                    : 'bg-destructive/10 text-destructive',
                )}
              >
                {table}: {exists ? '✓' : '✗'}
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                navigator.clipboard.writeText(buildDbSetupGuide(language));
                toast.success(language.startsWith('zh') ? '初始化步骤已复制到剪贴板' : 'Setup steps copied to clipboard');
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              {language.startsWith('zh') ? '复制初始化步骤' : 'Copy Setup Steps'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => setShowDbSetup(!showDbSetup)}
            >
              {showDbSetup
                ? (language.startsWith('zh') ? '收起' : 'Collapse')
                : (language.startsWith('zh') ? '查看 SQL' : 'View SQL')}
            </Button>
          </div>
          {showDbSetup && (
            <pre className="mt-2 bg-muted rounded p-2 text-xs overflow-x-auto max-h-64 overflow-y-auto">
              {buildDbSetupGuide(language)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

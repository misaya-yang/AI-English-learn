import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Pin, PinOff, RefreshCw, Trash2, Search, Sparkles, Shield, Clock3 } from 'lucide-react';
import { AuthRequiredError, EdgeFunctionError } from '@/services/aiGateway';
import {
  clearExpiredMemoryItems,
  deleteMemoryItems,
  listMemoryItems,
  pinMemoryItem,
} from '@/services/memoryCenter';
import type { MemoryItemView, MemoryKind } from '@/types/memory';

const KINDS: Array<{ value: MemoryKind | 'all'; labelEn: string; labelZh: string }> = [
  { value: 'all', labelEn: 'All', labelZh: '全部' },
  { value: 'goal', labelEn: 'Goals', labelZh: '目标' },
  { value: 'weakness_tag', labelEn: 'Weakness', labelZh: '薄弱点' },
  { value: 'preference', labelEn: 'Preferences', labelZh: '偏好' },
  { value: 'profile', labelEn: 'Profile', labelZh: '用户画像' },
  { value: 'tool_fact', labelEn: 'Tool Facts', labelZh: '工具事实' },
  { value: 'error_trace', labelEn: 'Error Traces', labelZh: '错误轨迹' },
];

const kindLabel = (kind: MemoryKind, language: string): string => {
  const map: Record<MemoryKind, { en: string; zh: string }> = {
    profile: { en: 'Profile', zh: '用户画像' },
    preference: { en: 'Preference', zh: '偏好' },
    weakness_tag: { en: 'Weakness', zh: '薄弱点' },
    goal: { en: 'Goal', zh: '目标' },
    error_trace: { en: 'Error Trace', zh: '错误轨迹' },
    tool_fact: { en: 'Tool Fact', zh: '工具事实' },
  };

  return language.startsWith('zh') ? map[kind].zh : map[kind].en;
};

const formatDate = (value?: string): string => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString();
};

export default function MemoryCenterPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const [items, setItems] = useState<MemoryItemView[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<MemoryKind | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  const toFriendlyErrorMessage = useCallback((err: unknown): string => {
    if (err instanceof AuthRequiredError) {
      return language.startsWith('zh')
        ? '登录状态已失效，请重新登录后再试。'
        : 'Your session has expired. Please sign in again.';
    }

    if (err instanceof EdgeFunctionError) {
      if (err.status === 0 || err.status >= 500 || err.status === 404) {
        return language.startsWith('zh')
          ? '记忆服务暂时不可用，请稍后重试。'
          : 'Memory service is temporarily unavailable. Please try again later.';
      }
      return err.message;
    }

    return language.startsWith('zh')
      ? '记忆加载失败，请稍后重试。'
      : 'Failed to load memory. Please try again later.';
  }, [language]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMemoryItems({
        kind,
        query,
        limit: 120,
      });
      setItems(data);
    } catch (err) {
      setError(toFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [kind, query, toFriendlyErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const pinnedCount = useMemo(() => items.filter((item) => item.isPinned).length, [items]);

  const handlePinToggle = useCallback(
    async (item: MemoryItemView) => {
      try {
        const updated = await pinMemoryItem(item.id, !item.isPinned);
        setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
        toast.success(
          language.startsWith('zh')
            ? updated.isPinned
              ? '已置顶记忆'
              : '已取消置顶'
            : updated.isPinned
              ? 'Memory pinned'
              : 'Pin removed',
        );
      } catch (err) {
        toast.error(toFriendlyErrorMessage(err));
      }
    },
    [language, toFriendlyErrorMessage],
  );

  const handleDelete = useCallback(async (item: MemoryItemView) => {
    try {
      const result = await deleteMemoryItems({ ids: [item.id] });
      if (result.deletedCount > 0) {
        setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      }
      toast.success(
        language.startsWith('zh')
          ? `已删除 ${result.deletedCount} 条记忆`
          : `Deleted ${result.deletedCount} memory item(s)`,
      );
    } catch (err) {
      toast.error(toFriendlyErrorMessage(err));
    }
  }, [language, toFriendlyErrorMessage]);

  const handleClearExpired = useCallback(async () => {
    try {
      const result = await clearExpiredMemoryItems();
      toast.success(
        language.startsWith('zh')
          ? `已清理 ${result.deletedCount} 条过期记忆`
          : `Cleared ${result.deletedCount} expired memory item(s)`,
      );
      await load();
    } catch (err) {
      toast.error(toFriendlyErrorMessage(err));
    }
  }, [language, load, toFriendlyErrorMessage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.memory.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.memory.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Pin className="h-3.5 w-3.5" /> {language.startsWith('zh') ? `置顶 ${pinnedCount}` : `Pinned ${pinnedCount}`}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock3 className="h-3.5 w-3.5" /> {language.startsWith('zh') ? `总计 ${items.length}` : `Total ${items.length}`}
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[260px] flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={language.startsWith('zh') ? '搜索记忆内容或标签...' : 'Search memory content or tags...'}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((option) => (
              <Button
                key={option.value}
                variant={kind === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKind(option.value)}
              >
                {language.startsWith('zh') ? option.labelZh : option.labelEn}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            {language.startsWith('zh') ? '刷新' : 'Refresh'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleClearExpired} disabled={loading}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            {language.startsWith('zh') ? '清理过期记忆' : 'Clear expired'}
          </Button>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3.5 w-3.5" />
            {t('dashboard.memory.privacyHint')}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300/60 bg-red-50/70 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card min-h-[420px]">
        <ScrollArea className="h-[520px]">
          <div className="p-3 space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-60" />
                <p>{loading ? t('common.loading') : t('dashboard.memory.empty')}</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-lg border bg-background p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{kindLabel(item.kind, language)}</Badge>
                      {item.isPinned && (
                        <Badge className="bg-emerald-600 text-white">
                          {language.startsWith('zh') ? '置顶' : 'Pinned'}
                        </Badge>
                      )}
                      <Badge variant="secondary">{Math.round(item.confidence * 100)}%</Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => void handlePinToggle(item)}>
                        {item.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => void handleDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={`${item.id}-${tag}`} variant="outline" className="text-[11px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                    <span>{language.startsWith('zh') ? '更新时间' : 'Updated'}: {formatDate(item.updatedAt)}</span>
                    <span>{language.startsWith('zh') ? '召回次数' : 'Recall count'}: {item.recallCount}</span>
                    {item.expiresAt && <span>{language.startsWith('zh') ? '过期时间' : 'Expires'}: {formatDate(item.expiresAt)}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

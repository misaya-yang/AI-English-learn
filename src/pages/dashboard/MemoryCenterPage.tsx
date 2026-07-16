import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Pin, PinOff, RefreshCw, Trash2, Search, BookOpen, Shield, Clock3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredError, EdgeFunctionError } from '@/services/aiGateway';
import { isLocalAuthUserId } from '@/lib/localAuthIdentity';
import {
  clearExpiredMemoryItems,
  deleteMemoryItems,
  listMemoryItems,
  pinMemoryItem,
} from '@/services/memoryCenter';
import type { MemoryItemView, MemoryKind } from '@/types/memory';

const SEARCH_DEBOUNCE_MS = 300;

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
  const { user } = useAuth();
  const language = i18n.language;
  const isZh = language.startsWith('zh');
  const isLocalDemo = Boolean(user?.id && isLocalAuthUserId(user.id));

  const [items, setItems] = useState<MemoryItemView[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [kind, setKind] = useState<MemoryKind | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [loadedCriteriaKey, setLoadedCriteriaKey] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestVersionRef = useRef(0);

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

  const criteriaKey = `${kind}\u0000${debouncedQuery}`;

  const load = useCallback(async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    setLoading(true);
    setError(null);
    try {
      const data = await listMemoryItems({
        kind,
        query: debouncedQuery,
        limit: 120,
      });
      if (requestVersion !== requestVersionRef.current) return;
      setItems(data);
      setLoadedCriteriaKey(criteriaKey);
    } catch (err) {
      if (requestVersion !== requestVersionRef.current) return;
      if (err instanceof AuthRequiredError && isLocalDemo) {
        setItems([]);
        setLoadedCriteriaKey(criteriaKey);
        return;
      }
      setItems([]);
      setLoadedCriteriaKey(criteriaKey);
      setError(toFriendlyErrorMessage(err));
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setLoading(false);
      }
    }
  }, [criteriaKey, debouncedQuery, isLocalDemo, kind, toFriendlyErrorMessage]);

  useEffect(() => {
    void load();
    return () => {
      requestVersionRef.current += 1;
    };
  }, [load, refreshVersion]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery === debouncedQuery) return;

    const timer = window.setTimeout(() => {
      setDebouncedQuery(normalizedQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [debouncedQuery, query]);

  const requestRefresh = useCallback(() => {
    setLoading(true);
    setDebouncedQuery(query.trim());
    setRefreshVersion((version) => version + 1);
  }, [query]);

  const isDebouncing = query.trim() !== debouncedQuery;
  const resultsAreCurrent = !isDebouncing && loadedCriteriaKey === criteriaKey;
  const showLoading = loading || !resultsAreCurrent;
  const visibleItems = resultsAreCurrent && !loading ? items : [];
  const pinnedCount = visibleItems.filter((item) => item.isPinned).length;

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
      requestRefresh();
    } catch (err) {
      toast.error(toFriendlyErrorMessage(err));
    }
  }, [language, requestRefresh, toFriendlyErrorMessage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.memory.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.memory.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Pin className="h-3.5 w-3.5" /> {isZh ? `置顶 ${pinnedCount}` : `Pinned ${pinnedCount}`}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock3 className="h-3.5 w-3.5" /> {isZh ? `总计 ${visibleItems.length}` : `Total ${visibleItems.length}`}
          </Badge>
        </div>
      </div>

        <div className="liquid-glass-bar rounded-xl border border-transparent bg-card/72 p-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[260px] flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="rounded-xl bg-card pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={isZh ? '搜索记忆' : 'Search memory'}
              placeholder={isZh ? '搜索记忆内容或标签...' : 'Search memory content or tags...'}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((option) => (
              <Button
                key={option.value}
                variant={kind === option.value ? 'glassPrimary' : 'glass'}
                size="sm"
                className="rounded-lg"
                aria-pressed={kind === option.value}
                onClick={() => setKind(option.value)}
              >
                {isZh ? option.labelZh : option.labelEn}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="glass" className="rounded-lg" onClick={requestRefresh} disabled={showLoading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            {isZh ? '刷新' : 'Refresh'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="glass" className="rounded-lg" disabled={showLoading}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {isZh ? '清理过期记忆' : 'Clear expired'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{isZh ? '清理所有过期记忆？' : 'Clear all expired memories?'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {isZh
                    ? '这会永久删除已经过期的记忆记录，仍在有效期内的内容不会受影响。'
                    : 'This permanently deletes expired memory records. Active records will not be affected.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{isZh ? '取消' : 'Cancel'}</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleClearExpired()}>
                  {isZh ? '确认清理' : 'Confirm clear'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3.5 w-3.5" />
            {t('dashboard.memory.privacyHint')}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-transparent bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-transparent bg-card" aria-busy={showLoading}>
          <div className="space-y-2 p-3">
            {showLoading ? (
              <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-10 text-center" role="status" aria-live="polite">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-8 text-center sm:py-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {isZh ? '还没有保存的线索' : 'No saved learning records yet'}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  {isZh
                    ? '完成练习、复习或答疑后，这里会保存目标、薄弱点、偏好和错误轨迹。'
                    : 'After practice, review, or help sessions, this page stores goals, weaknesses, preferences, and error traces.'}
                </p>
                <div className="mt-5 grid w-full gap-2 sm:grid-cols-3">
                  {[
                    isZh ? '目标' : 'Goals',
                    isZh ? '薄弱点' : 'Weaknesses',
                    isZh ? '错误轨迹' : 'Error traces',
                  ].map((label) => (
                    <div key={label} className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button asChild variant="glassPrimary" className="rounded-lg">
                    <Link to="/dashboard/chat">{isZh ? '打开答疑' : 'Open help'}</Link>
                  </Button>
                  <Button asChild variant="glass" className="rounded-lg">
                    <Link to="/dashboard/practice">{isZh ? '做一次练习' : 'Start practice'}</Link>
                  </Button>
                </div>
              </div>
            ) : (
              visibleItems.map((item) => (
                <div key={item.id} className="space-y-2 rounded-xl border border-transparent bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
	                      <Badge variant="outline">{kindLabel(item.kind, language)}</Badge>
	                      {item.isPinned && (
	                        <Badge className="border border-[hsl(var(--accent-memory)/0.28)] bg-[hsl(var(--accent-memory)/0.12)] text-foreground hover:bg-[hsl(var(--accent-memory)/0.16)]">
	                          {isZh ? '置顶' : 'Pinned'}
	                        </Badge>
	                      )}
                      <Badge variant="secondary">{Math.round(item.confidence * 100)}%</Badge>
                    </div>

                    <div className="flex items-center gap-1">
	                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={isZh ? '切换置顶' : 'Toggle pin'} onClick={() => void handlePinToggle(item)}>
	                        {item.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
	                      </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
	                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" aria-label={isZh ? '删除记忆' : 'Delete memory'}>
	                            <Trash2 className="h-4 w-4" />
	                          </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{isZh ? '删除这条记忆？' : 'Delete this memory?'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {isZh
                                  ? `删除后无法恢复：“${item.content.slice(0, 120)}”`
                                  : `This cannot be undone: “${item.content.slice(0, 120)}”`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{isZh ? '取消' : 'Cancel'}</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => void handleDelete(item)}
                              >
                                {isZh ? '确认删除' : 'Confirm delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>

                  {(item.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.map((tag) => (
                        <Badge key={`${item.id}-${tag}`} variant="outline" className="text-[11px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
	                    <span>{isZh ? '更新时间' : 'Updated'}: {formatDate(item.updatedAt)}</span>
	                    <span>{isZh ? '召回次数' : 'Recall count'}: {item.recallCount}</span>
	                    {item.expiresAt && <span>{isZh ? '过期时间' : 'Expires'}: {formatDate(item.expiresAt)}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
      </section>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@/contexts/UserDataContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { wordsDatabase } from '@/data/words';
import {
  getAllDashboardRoutes,
  getDashboardRoute,
  type DashboardRouteId,
} from '@/features/learning/routeRegistry';
import { isEnterpriseUiEnabled } from '@/features/enterprise/enterpriseUi';

const QUICK_ROUTE_IDS: DashboardRouteId[] = [
  'today',
  'review',
  'practice',
  'chat',
  'vocabulary',
  'settings',
];

interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchPalette({ open, onOpenChange }: SearchPaletteProps) {
  const navigate = useNavigate();
  const { progress } = useUserData();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh') ?? false;
  const [query, setQuery] = useState('');
  const enterpriseEnabled = isEnterpriseUiEnabled();
  const visibleRoutes = useMemo(
    () => getAllDashboardRoutes().filter((route) => enterpriseEnabled || !route.enterpriseOnly),
    [enterpriseEnabled],
  );
  const quickRoutes = useMemo(
    () => QUICK_ROUTE_IDS.map(getDashboardRoute),
    [],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) setQuery('');
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  // Collect the set of word IDs the user has interacted with
  const progressIds = new Set(progress.map((p) => p.wordId));

  // Filter words: search by word, definition, or Chinese definition
  const results = query.trim().length >= 1
    ? wordsDatabase
        .filter((w) => {
          const q = query.toLowerCase();
          return (
            w.word.toLowerCase().includes(q) ||
            w.definition.toLowerCase().includes(q) ||
            w.definitionZh?.includes(query)
          );
        })
        .slice(0, 12)
    : [];

  const learnedResults = results.filter((w) => progressIds.has(w.id));
  const newResults = results.filter((w) => !progressIds.has(w.id));
  const normalizedQuery = query.trim().toLowerCase();
  const routeResults = normalizedQuery.length >= 1
    ? visibleRoutes.filter((route) => {
        const searchText = [
          route.label.en,
          route.label.zh,
          route.description.en,
          route.description.zh,
          ...route.searchAliases,
        ].join(' ').toLowerCase();
        return searchText.includes(normalizedQuery);
      }).slice(0, 10)
    : [];

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      navigate(href);
    },
    [navigate, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder={isZh ? '搜索单词或跳转页面… (Cmd+K)' : 'Search words or pages… (Cmd+K)'}
        value={query}
        onValueChange={setQuery}
        className="border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
          {isZh ? '没有找到匹配的单词或页面' : 'No matching words or pages'}
        </CommandEmpty>

        {/* Quick navigation — shown only when no query */}
        {query.trim().length === 0 && (
          <CommandGroup heading={isZh ? '快速导航' : 'Quick navigation'}>
            {quickRoutes.map((route) => (
              <CommandItem
                key={route.path}
                value={`${route.label.en} ${route.label.zh}`}
                onSelect={() => handleSelect(route.path)}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <route.icon className="h-4 w-4 shrink-0 text-[hsl(var(--accent-practice))]" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="font-medium text-foreground">{isZh ? route.label.zh : route.label.en}</span>
                  <span className="text-xs text-muted-foreground">{isZh ? route.label.en : route.label.zh}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {routeResults.length > 0 && (
          <CommandGroup heading={isZh ? '页面' : 'Pages'}>
            {routeResults.map((route) => (
              <CommandItem
                key={route.path}
                value={`${route.label.en} ${route.label.zh} ${route.searchAliases.join(' ')}`}
                onSelect={() => handleSelect(route.path)}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <route.icon className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {isZh ? route.label.zh : route.label.en}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {isZh ? route.description.zh : route.description.en}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Words already in learning progress */}
        {learnedResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={isZh ? '已学词汇' : 'Learned words'}>
              {learnedResults.map((word) => (
                <CommandItem
                  key={word.id}
                  value={`${word.word} ${word.definition} ${word.definitionZh}`}
                  onSelect={() => handleSelect('/dashboard/review')}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--success)/0.32)] bg-[hsl(var(--success)/0.12)]">
                    <span className="text-[10px] font-bold text-[hsl(var(--success))]">{word.level}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{word.word}</p>
                    <p className="truncate text-xs text-muted-foreground">{word.definitionZh || word.definition}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{word.partOfSpeech}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Words not yet in progress */}
        {newResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={isZh ? '词库' : 'Lexicon'}>
              {newResults.map((word) => (
                <CommandItem
                  key={word.id}
                  value={`${word.word} ${word.definition} ${word.definitionZh}`}
                  onSelect={() => handleSelect('/dashboard/today')}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                    <span className="text-[10px] font-bold text-muted-foreground">{word.level}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{word.word}</p>
                    <p className="truncate text-xs text-muted-foreground">{word.definitionZh || word.definition}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{word.partOfSpeech}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

/** Hook that manages the open state and attaches the Cmd+K / Ctrl+K shortcut globally. */
export function useSearchPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { BookOpen, CalendarDays, Brain, BarChart2, Trophy, Settings } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Today', labelZh: '今日任务', href: '/dashboard/today', icon: CalendarDays },
  { label: 'Review', labelZh: '复习', href: '/dashboard/review', icon: Brain },
  { label: 'Analytics', labelZh: '统计', href: '/dashboard/analytics', icon: BarChart2 },
  { label: 'Vocabulary', labelZh: '词书', href: '/dashboard/vocabulary', icon: BookOpen },
  { label: 'Exam', labelZh: '考试练习', href: '/dashboard/exam', icon: Trophy },
  { label: 'Settings', labelZh: '设置', href: '/dashboard/settings', icon: Settings },
];

interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchPalette({ open, onOpenChange }: SearchPaletteProps) {
  const navigate = useNavigate();
  const { progress } = useUserData();
  const [query, setQuery] = useState('');

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

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

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      navigate(href);
    },
    [navigate, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="搜索单词或跳转页面… (Cmd+K)"
        value={query}
        onValueChange={setQuery}
        className="border-0 text-white placeholder:text-white/35 focus-visible:ring-0"
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty className="py-8 text-center text-sm text-white/45">
          没有找到匹配的单词或页面
        </CommandEmpty>

        {/* Quick navigation — shown only when no query */}
        {query.trim().length === 0 && (
          <CommandGroup heading="快速导航">
            {QUICK_LINKS.map((link) => (
              <CommandItem
                key={link.href}
                value={`${link.label} ${link.labelZh}`}
                onSelect={() => handleSelect(link.href)}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <link.icon className="h-4 w-4 shrink-0 text-emerald-400" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="font-medium text-white">{link.label}</span>
                  <span className="text-xs text-white/45">{link.labelZh}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Words already in learning progress */}
        {learnedResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="已学词汇">
              {learnedResults.map((word) => (
                <CommandItem
                  key={word.id}
                  value={`${word.word} ${word.definition} ${word.definitionZh}`}
                  onSelect={() => handleSelect('/dashboard/review')}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
                    <span className="text-[10px] font-bold text-emerald-300">{word.level}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{word.word}</p>
                    <p className="truncate text-xs text-white/48">{word.definitionZh || word.definition}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-white/30">{word.partOfSpeech}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Words not yet in progress */}
        {newResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="词库">
              {newResults.map((word) => (
                <CommandItem
                  key={word.id}
                  value={`${word.word} ${word.definition} ${word.definitionZh}`}
                  onSelect={() => handleSelect('/dashboard/today')}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <span className="text-[10px] font-bold text-white/50">{word.level}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{word.word}</p>
                    <p className="truncate text-xs text-white/48">{word.definitionZh || word.definition}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-white/30">{word.partOfSpeech}</span>
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

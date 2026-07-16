import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WordData } from '@/data/words';

interface TodayWordNavigationProps {
  words: WordData[];
  currentWordIndex: number;
  learnedWordIds: Set<string>;
  hardWordIds: Set<string>;
  isZh: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelectWord: (index: number) => void;
}

function buildDirectionalLabel(args: {
  isZh: boolean;
  direction: 'previous' | 'next';
  targetWord?: WordData;
}): string {
  const base = args.isZh
    ? args.direction === 'previous'
      ? '查看上一个单词'
      : '查看下一个单词'
    : args.direction === 'previous'
      ? 'View previous word'
      : 'View next word';

  return args.targetWord ? `${base}: ${args.targetWord.word}` : base;
}

function buildWordDotLabel(args: {
  word: WordData;
  index: number;
  total: number;
  isCurrent: boolean;
  isLearned: boolean;
  isHard: boolean;
  isZh: boolean;
}): string {
  const status = args.isLearned
    ? args.isZh ? '，已学会' : ', learned'
    : args.isHard ? args.isZh ? '，需复习' : ', needs review'
      : '';
  const current = args.isCurrent ? args.isZh ? '，当前单词' : ', current word' : '';

  return args.isZh
    ? `查看第 ${args.index + 1}/${args.total} 个单词：${args.word.word}${current}${status}`
    : `Go to word ${args.index + 1} of ${args.total}: ${args.word.word}${current}${status}`;
}

export function TodayWordNavigation({
  words,
  currentWordIndex,
  learnedWordIds,
  hardWordIds,
  isZh,
  onPrevious,
  onNext,
  onSelectWord,
}: TodayWordNavigationProps) {
  const previousWord = words[currentWordIndex - 1];
  const nextWord = words[currentWordIndex + 1];

  return (
    <nav
      aria-label={isZh ? '今日单词导航' : "Today's word navigation"}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={currentWordIndex === 0}
          aria-label={buildDirectionalLabel({ isZh, direction: 'previous', targetWord: previousWord })}
          className="glass-icon-button h-11 w-11 rounded-lg bg-transparent text-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={currentWordIndex === words.length - 1}
          aria-label={buildDirectionalLabel({ isZh, direction: 'next', targetWord: nextWord })}
          className="glass-icon-button h-11 w-11 rounded-lg bg-transparent text-foreground hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <div
        role="group"
        aria-label={isZh ? '选择今天的单词' : "Choose today's word"}
        className="flex flex-wrap gap-1"
      >
        {words.map((word, index) => {
          const isCurrent = index === currentWordIndex;
          const isLearned = learnedWordIds.has(word.id);
          const isHard = hardWordIds.has(word.id);

          return (
            <button
              key={word.id}
              type="button"
              onClick={() => onSelectWord(index)}
              aria-label={buildWordDotLabel({
                word,
                index,
                total: words.length,
                isCurrent,
                isLearned,
                isHard,
                isZh,
              })}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'liquid-glass-interactive grid h-10 min-w-10 place-items-center rounded-lg border border-transparent px-1 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-primary/20 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 sm:h-9 sm:min-w-9',
                isCurrent && 'bg-primary/8',
              )}
              title={word.word}
            >
              <span
                className={cn(
                  'h-2.5 rounded-full transition-all duration-300',
                  isCurrent
                    ? 'w-9 bg-primary'
                    : isLearned
                      ? 'w-2.5 bg-green-600'
                      : isHard
                        ? 'w-2.5 bg-amber-500'
                        : 'w-2.5 bg-muted-foreground/[0.22]',
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

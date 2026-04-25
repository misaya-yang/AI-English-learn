import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CoachReviewRail } from '@/features/coach/CoachReviewRail';
import {
  LearningCompletionState,
  LearningEmptyState,
  LearningHeroPanel,
  LearningMetricStrip,
  LearningRailSection,
  LearningShellFrame,
  LearningWorkspaceSurface,
  learningFrameClassName,
} from '@/features/learning/components/LearningWorkspace';
import {
  RotateCcw,
  Volume2,
  Check,
  X,
  Zap,
  Clock3,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { wordsDatabase, type WordData } from '@/data/words';
import type { UserProgress } from '@/data/localStorage';
import { speakEnglishText } from '@/services/tts';
import { isStubbornWord } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';
import type { FSRSState } from '@/types/core';
import { cn } from '@/lib/utils';

interface ReviewItem {
  wordId: string;
  word: WordData;
  reviewCount: number;
  fsrs: FSRSState;
}

interface ReviewCardProps {
  item: ReviewItem;
  isRevealed: boolean;
  onReveal: () => void;
}

const FALLBACK_REVIEW_COUNT = 10;

function buildReviewItems(dueWords: UserProgress[], dailyWords: WordData[]): ReviewItem[] {
  const wordsById = new Map<string, WordData>();
  [...dailyWords, ...wordsDatabase].forEach((word) => {
    if (!wordsById.has(word.id)) {
      wordsById.set(word.id, word);
    }
  });

  const dueItems = dueWords
    .map((dueWord) => {
      const word = wordsById.get(dueWord.wordId);
      if (!word) return null;
      return {
        wordId: dueWord.wordId,
        word,
        reviewCount: dueWord.reviewCount,
        fsrs: ensureFSRS(dueWord as UserProgress & { fsrs?: FSRSState }),
      } as ReviewItem;
    })
    .filter((item): item is ReviewItem => item !== null);

  if (dueItems.length > 0) {
    return dueItems;
  }

  return dailyWords.slice(0, Math.min(FALLBACK_REVIEW_COUNT, dailyWords.length)).map((word) => ({
    wordId: word.id,
    word,
    reviewCount: 0,
    fsrs: {
      stability: 0,
      difficulty: 0,
      retrievability: 0,
      lapses: 0,
      state: 'new',
      dueAt: new Date().toISOString(),
      lastReviewAt: null,
    },
  }));
}

function ReviewCard({ item, isRevealed, onReveal }: ReviewCardProps) {
  const { word } = item;

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  const handleRevealKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onReveal();
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(learningFrameClassName, 'min-h-[520px] p-6 sm:p-8')}
    >
      {!isRevealed ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onReveal}
          onKeyDown={handleRevealKeyDown}
          className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020303]"
        >
          <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/72 hover:bg-white/[0.03]">
            {word.level} · 第 {item.reviewCount + 1} 次复习
          </Badge>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Recall first</p>
          <h2 className="mt-5 text-[3.8rem] font-semibold leading-[0.92] tracking-[-0.065em] text-white sm:text-[5.2rem]">
            {word.word}
          </h2>
          <p className="mt-4 font-mono text-lg text-white/45">{word.partOfSpeech} · {word.phonetic}</p>

          <div className="mt-10 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
              onClick={(event) => {
                event.stopPropagation();
                playAudio(word.word);
              }}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <span className="text-sm text-white/48">先回忆，再揭晓答案</span>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Answer revealed</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{word.word}</h2>
              <p className="mt-1 font-mono text-sm text-white/45">{word.partOfSpeech} · {word.phonetic}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
              onClick={() => playAudio(word.word)}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
            <div className="space-y-4">
              <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Definition</p>
                <p className="mt-3 text-base leading-7 text-white">{word.definition}</p>
                <p className="mt-2 text-sm leading-7 text-white/58">{word.definitionZh}</p>
              </section>

              {word.examples[0] ? (
                <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Example</p>
                  <p className="mt-3 text-sm leading-7 text-white">{word.examples[0].en}</p>
                  <p className="mt-2 text-sm leading-7 text-white/58">{word.examples[0].zh}</p>
                </section>
              ) : null}
            </div>

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Clues</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {word.synonyms.slice(0, 5).map((synonym) => (
                  <span key={synonym} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    {synonym}
                  </span>
                ))}
                {word.collocations.slice(0, 4).map((collocation) => (
                  <span key={collocation} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/70">
                    {collocation}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </motion.section>
  );
}

const ratingMeta = {
  again: { label: '忘记', delay: '< 1 min', key: '1', accent: 'border-red-500/25 bg-red-500/10 text-red-300' },
  hard:  { label: '较难', delay: '2 days',  key: '2', accent: 'border-amber-500/25 bg-amber-500/10 text-amber-300' },
  good:  { label: '良好', delay: '5 days',  key: '3', accent: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' },
  easy:  { label: '简单', delay: '10 days', key: '4', accent: 'border-sky-500/25 bg-sky-500/10 text-sky-300' },
} as const;

export default function ReviewPage() {
  const { dailyWords, reviewWord, dueWords, dailyMission, completeMissionTask } = useUserData();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [sessionQueue, setSessionQueue] = useState<ReviewItem[] | null>(null);

  const totalReviewed = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
  const reviewItems = sessionQueue ?? buildReviewItems(dueWords, dailyWords);
  const isComplete = reviewItems.length > 0 && currentIndex >= reviewItems.length;
  const reviewTaskTarget =
    Number(
      dailyMission?.tasks.find((task) => task.id === 'task_review_today')?.meta?.target,
    ) || reviewItems.length;
  const reviewedProgress = reviewItems.length > 0 ? (totalReviewed / reviewItems.length) * 100 : 0;

  const currentItem = reviewItems[currentIndex];
  const remainingCount = Math.max(reviewItems.length - totalReviewed, 0);
  const isCurrentCardStubborn = currentItem ? isStubbornWord(currentItem.fsrs) : false;

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleRate = useCallback(async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentItem) return;
    if (!sessionQueue) {
      setSessionQueue(reviewItems);
    }

    setSessionStats((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    reviewWord(currentItem.wordId, rating);
    if (totalReviewed + 1 >= reviewTaskTarget) {
      completeMissionTask('task_review_today');
    }

    const intervals = {
      again: '< 1 min',
      hard: '2 days',
      good: '5 days',
      easy: '10 days',
    };

    toast.success(`+${rating === 'again' ? 3 : rating === 'hard' ? 5 : rating === 'good' ? 7 : 10} XP • Next: ${intervals[rating]}`);

    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      return;
    }

    setCurrentIndex(reviewItems.length);
  }, [currentIndex, currentItem, reviewItems, reviewWord, sessionQueue, totalReviewed, reviewTaskTarget, completeMissionTask]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ignore when focus is inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (isComplete || reviewItems.length === 0 || !currentItem) return;

      if (!isRevealed) {
        if (e.code === 'Space') { e.preventDefault(); handleReveal(); }
      } else {
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('hard');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRevealed, isComplete, currentItem, reviewItems.length, handleReveal, handleRate]);

  const handleRestart = () => {
    setSessionQueue(null);
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  if (reviewItems.length === 0) {
    return (
      <LearningShellFrame>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <LearningEmptyState
            icon={Check}
            eyebrow="Review queue"
            title="今天没有待处理复习"
            description="当前没有到期复习卡。"
            metrics={[
              { label: 'Due reviews', value: 0, accent: 'emerald' },
              { label: 'Fallback set', value: Math.min(FALLBACK_REVIEW_COUNT, dailyWords.length) },
            ]}
            actions={
              <>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white" asChild>
                  <Link to="/dashboard/today">回到 Today</Link>
                </Button>
                <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" asChild>
                  <Link to="/dashboard/practice">去做练习</Link>
                </Button>
              </>
            }
          />
          <div className="space-y-6">
            <CoachReviewRail language={language} />
          </div>
        </div>
      </LearningShellFrame>
    );
  }

  if (isComplete) {
    const accuracy = totalReviewed > 0 ? Math.round(((sessionStats.good + sessionStats.easy) / totalReviewed) * 100) : 0;

    return (
      <LearningShellFrame>
        <LearningCompletionState
          icon={Check}
          eyebrow="Review complete"
          title="本轮复习已经完成"
          description="这一轮已经结束。"
          metrics={[
            { label: 'Reviewed', value: totalReviewed, accent: 'emerald' },
            { label: 'Accuracy', value: `${accuracy}%`, accent: 'emerald' },
            { label: 'Again / Hard', value: `${sessionStats.again} / ${sessionStats.hard}`, accent: 'warm' },
          ]}
          actions={
            <>
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white" onClick={handleRestart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Review again
              </Button>
              <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" asChild>
                <Link to="/dashboard/practice">继续做 Practice</Link>
              </Button>
            </>
          }
        />
      </LearningShellFrame>
    );
  }

  return (
    <LearningShellFrame>
      <LearningHeroPanel
        eyebrow="Review round"
        title="先回忆，再揭晓答案。把复习做成一个完整回合。"
        progress={Math.round(reviewedProgress)}
        progressLabel="Round progress"
        metrics={[
          { label: 'Remaining', value: remainingCount, accent: 'emerald' },
          { label: 'Mission target', value: reviewTaskTarget },
          { label: 'Current card', value: `${Math.min(currentIndex + 1, reviewItems.length)} / ${reviewItems.length}` },
          ...(isCurrentCardStubborn ? [{ label: 'Reinforcement', value: `Lapse ${currentItem?.fsrs.lapses || 0}`, accent: 'warm' as const }] : []),
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <LearningWorkspaceSurface
            eyebrow="SRS workspace"
            title={isRevealed ? '答案已揭晓，给这次回忆打分' : '先在脑中回忆，再决定是否揭晓'}
            description={isRevealed ? '直接评分，然后继续。' : undefined}
          >
            <div className="space-y-5">
              {currentItem ? <ReviewCard item={currentItem} isRevealed={isRevealed} onReveal={handleReveal} /> : null}

              {isRevealed ? (
                <div className="grid gap-3 lg:grid-cols-4">
                  {(Object.entries(ratingMeta) as Array<[keyof typeof ratingMeta, (typeof ratingMeta)[keyof typeof ratingMeta]]>).map(([rating, meta]) => (
                    <Button
                      key={rating}
                      variant="outline"
                      className={cn(
                        'h-auto flex-col items-start gap-1 rounded-3xl border px-4 py-4 text-left hover:text-current hover-lift',
                        meta.accent,
                      )}
                      onClick={() => handleRate(rating)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-base font-semibold">{meta.label}</span>
                        <kbd className="rounded border border-current/20 bg-current/10 px-1.5 py-0.5 font-mono text-[10px] font-bold opacity-70">
                          {meta.key}
                        </kbd>
                      </div>
                      <span className="text-xs opacity-80">Next: {meta.delay}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between shadow-glass">
                  <p className="text-sm leading-6 text-white/54">先回忆，再揭晓。</p>
                  <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={handleReveal}>
                    Reveal answer
                    <kbd className="ml-2 rounded border border-black/20 bg-black/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                      Space
                    </kbd>
                  </Button>
                </div>
              )}
            </div>
          </LearningWorkspaceSurface>
        </div>

        <div className="space-y-6">
          <CoachReviewRail language={language} />

          <LearningRailSection title="Session stats">
            <LearningMetricStrip
              items={[
                { label: 'Again', value: sessionStats.again, accent: 'warm' },
                { label: 'Hard', value: sessionStats.hard, accent: 'warm' },
                { label: 'Good', value: sessionStats.good, accent: 'emerald' },
              ]}
              className="border-t-0 pt-0"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Completed</p>
                <p className="mt-2 text-2xl font-semibold text-white">{totalReviewed} / {reviewItems.length}</p>
              </div>
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Current stage</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">{isRevealed ? 'Rate it' : 'Recall first'}</p>
              </div>
            </div>
          </LearningRailSection>

          <LearningRailSection title="Rating guide">
            <div className="space-y-3">
              <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-4">
                <div className="flex items-center gap-2 text-red-300">
                  <X className="h-4 w-4" />
                  <p className="text-sm font-semibold">Again</p>
                </div>
                  <p className="mt-2 text-sm text-white/58">马上重见</p>
                </div>
              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <Zap className="h-4 w-4" />
                  <p className="text-sm font-semibold">Hard</p>
                </div>
                  <p className="mt-2 text-sm text-white/58">短间隔复现</p>
                </div>
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="h-4 w-4" />
                  <p className="text-sm font-semibold">Good / Easy</p>
                </div>
                  <p className="mt-2 text-sm text-white/58">拉长间隔</p>
                </div>
              {isCurrentCardStubborn ? (
                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Zap className="h-4 w-4" />
                    <p className="text-sm font-semibold">Reinforcement path</p>
                  </div>
                  <p className="mt-2 text-sm text-white/58">
                    这张卡已经遗忘 {currentItem?.fsrs.lapses || 0} 次，系统会把它放进更短的强化复习回路。
                  </p>
                </div>
              ) : null}
            </div>
          </LearningRailSection>

          {currentItem ? (
            <LearningRailSection title="Current card">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-4">
                <div className="flex items-center gap-2 text-white/72">
                  <Clock3 className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm font-medium">第 {currentItem.reviewCount + 1} 次复习</p>
                </div>
                {isCurrentCardStubborn ? (
                  <Badge className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-300 hover:bg-amber-500/10">
                    顽固词强化中
                  </Badge>
                ) : null}

                {/* Memory strength bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-white/36">Memory strength</p>
                    <p className="text-xs font-semibold text-white/70">
                      {Math.round(currentItem.fsrs.retrievability * 100)}%
                    </p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full transition-colors',
                        currentItem.fsrs.retrievability >= 0.75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-300' :
                        currentItem.fsrs.retrievability >= 0.5  ? 'bg-gradient-to-r from-amber-500 to-amber-300' :
                        currentItem.fsrs.retrievability >= 0.25 ? 'bg-gradient-to-r from-orange-500 to-orange-300' :
                                                                   'bg-gradient-to-r from-red-500 to-red-300',
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(currentItem.fsrs.retrievability * 100)}%` }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>

                <p className="text-sm leading-6 text-white/54">
                  {currentItem.fsrs.lastReviewAt
                    ? `上次复习：${new Date(currentItem.fsrs.lastReviewAt).toLocaleString('zh-CN')}`
                    : '今日首次接触这张卡'}
                </p>
                <div className="rounded-2xl border border-white/[0.06] bg-black/30 px-3 py-2 text-sm text-white/60">
                  FSRS stability: {currentItem.fsrs.stability.toFixed(1)} 天 · 难度 {currentItem.fsrs.difficulty.toFixed(1)}
                </div>
              </div>
            </LearningRailSection>
          ) : null}

          {/* AI Mnemonic hint */}
          {currentItem && isRevealed && (currentItem.word.memoryTip || currentItem.word.etymology) ? (
            <LearningRailSection title="Memory cue">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4"
              >
                <div className="flex items-center gap-2 text-emerald-300 mb-2">
                  <Lightbulb className="h-4 w-4" />
                  <p className="text-sm font-semibold">AI 助记提示</p>
                </div>
                <p className="text-sm leading-6 text-white/65">
                  {currentItem.word.memoryTip || currentItem.word.etymology}
                </p>
              </motion.div>
            </LearningRailSection>
          ) : null}
        </div>
      </div>
    </LearningShellFrame>
  );
}

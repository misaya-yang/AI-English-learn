import { useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { wordsDatabase, type WordData } from '@/data/words';
import type { UserProgress } from '@/data/localStorage';
import { speakEnglishText } from '@/services/tts';
import { cn } from '@/lib/utils';

interface ReviewItem {
  wordId: string;
  word: WordData;
  reviewCount: number;
  easeFactor: number;
  nextReview: string | null;
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
        easeFactor: dueWord.easeFactor,
        nextReview: dueWord.nextReview,
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
    easeFactor: 2.5,
    nextReview: null,
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
                <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
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
              <p className="mt-4 text-sm leading-6 text-white/54">
                现在只做一件事：给这次回忆打分，再继续下一张。不要在这里切去别的页面。
              </p>
            </section>
          </div>
        </div>
      )}
    </motion.section>
  );
}

const ratingMeta = {
  again: { label: '忘记', delay: '< 1 min', accent: 'border-red-500/25 bg-red-500/10 text-red-300' },
  hard: { label: '较难', delay: '2 days', accent: 'border-amber-500/25 bg-amber-500/10 text-amber-300' },
  good: { label: '良好', delay: '5 days', accent: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' },
  easy: { label: '简单', delay: '10 days', accent: 'border-sky-500/25 bg-sky-500/10 text-sky-300' },
} as const;

export default function ReviewPage() {
  const { dailyWords, reviewWord, dueWords, dailyMission, completeMissionTask } = useUserData();
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

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
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
  };

  const handleRestart = () => {
    setSessionQueue(null);
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  if (reviewItems.length === 0) {
    return (
      <LearningShellFrame>
        <LearningEmptyState
          icon={Check}
          eyebrow="Review queue"
          title="今天没有待处理复习"
          description="你当前没有到期复习卡。保持现在的节奏，下一步更适合回到 Today 或做一轮短练习。"
          metrics={[
            { label: 'Due reviews', value: 0, accent: 'emerald' },
            { label: 'Fallback set', value: Math.min(FALLBACK_REVIEW_COUNT, dailyWords.length), hint: '需要时仍可从今日词生成一轮复习。' },
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
          description="这轮复习已经给出了足够信号。先看恢复率，再决定是继续做 Practice，还是回到 Today 开下一步。"
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
        description="Review 不是翻卡广场，而是一轮稳定节奏的回忆工作台。每次只处理一张卡，给出评分，然后继续前进。"
        progress={Math.round(reviewedProgress)}
        progressLabel="Round progress"
        metrics={[
          { label: 'Remaining', value: remainingCount, hint: '先做完这一轮，不在中途切走。', accent: 'emerald' },
          { label: 'Mission target', value: reviewTaskTarget, hint: '今日任务会在达到目标后结算。' },
          { label: 'Current card', value: `${Math.min(currentIndex + 1, reviewItems.length)} / ${reviewItems.length}`, hint: '保持稳定节奏比刷很快更重要。' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <LearningWorkspaceSurface
            eyebrow="SRS workspace"
            title={isRevealed ? '答案已揭晓，给这次回忆打分' : '先在脑中回忆，再决定是否揭晓'}
            description={isRevealed ? '现在只需要一个动作：根据回忆难度评分。评分后系统会安排下一次出现时间。' : '在真正点开答案前，先在脑中做一次检索。这样复习才有价值。'}
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
                        'h-auto flex-col items-start gap-1 rounded-[24px] border px-4 py-4 text-left hover:text-current',
                        meta.accent,
                      )}
                      onClick={() => handleRate(rating)}
                    >
                      <span className="text-base font-semibold">{meta.label}</span>
                      <span className="text-xs opacity-80">Next: {meta.delay}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-[26px] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-white/54">
                    在显示答案前，先试着回想意思、例句或使用场景。回忆越明确，SRS 信号越可靠。
                  </p>
                  <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={handleReveal}>
                    Reveal answer
                  </Button>
                </div>
              )}
            </div>
          </LearningWorkspaceSurface>
        </div>

        <div className="space-y-6">
          <LearningRailSection
            title="Session stats"
            description="不要看一堆卡片，只看这轮回合是否稳定。"
          >
            <LearningMetricStrip
              items={[
                { label: 'Again', value: sessionStats.again, accent: 'warm' },
                { label: 'Hard', value: sessionStats.hard, accent: 'warm' },
                { label: 'Good', value: sessionStats.good, accent: 'emerald' },
              ]}
              className="border-t-0 pt-0"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Completed</p>
                <p className="mt-2 text-2xl font-semibold text-white">{totalReviewed} / {reviewItems.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Current stage</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">{isRevealed ? 'Rate it' : 'Recall first'}</p>
              </div>
            </div>
          </LearningRailSection>

          <LearningRailSection
            title="Interval guide"
            description="每次评分后的信号应该非常清晰。只保留 next interval，不堆多余反馈。"
          >
            <div className="space-y-3">
              <div className="rounded-[22px] border border-red-500/20 bg-red-500/[0.08] p-4">
                <div className="flex items-center gap-2 text-red-300">
                  <X className="h-4 w-4" />
                  <p className="text-sm font-semibold">Again</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">说明当前回忆失败，应该马上再次出现。</p>
              </div>
              <div className="rounded-[22px] border border-amber-500/20 bg-amber-500/[0.08] p-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <Zap className="h-4 w-4" />
                  <p className="text-sm font-semibold">Hard</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">有印象但不稳，保留短间隔再次确认。</p>
              </div>
              <div className="rounded-[22px] border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="h-4 w-4" />
                  <p className="text-sm font-semibold">Good / Easy</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">当前记忆已经成型，可以把间隔拉长，把精力留给更弱的点。</p>
              </div>
            </div>
          </LearningRailSection>

          {currentItem ? (
            <LearningRailSection title="Current card" description="只展示当前卡的最小必要上下文。">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-white/72">
                  <Clock3 className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm font-medium">第 {currentItem.reviewCount + 1} 次复习</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/54">
                  {currentItem.nextReview
                    ? `系统上次安排的下次复习时间：${new Date(currentItem.nextReview).toLocaleString('zh-CN')}`
                    : '这是一次新生成的回顾卡，用来把今天的内容快速重新激活。'}
                </p>
                <div className="mt-4 rounded-[18px] border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/65">
                  Ease factor: {currentItem.easeFactor.toFixed(1)}
                </div>
              </div>
            </LearningRailSection>
          ) : null}
        </div>
      </div>
    </LearningShellFrame>
  );
}

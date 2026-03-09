import { useEffect, useState } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LearningActionCluster,
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
  Sparkles,
  Volume2,
  Check,
  Brain,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Star,
  TrendingUp,
  BookOpen,
  MessageCircleMore,
  ShieldCheck,
  Target,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { WordData } from '@/data/words';
import { toast } from 'sonner';
import { getRecommendedUnit } from '@/data/examContent';
import { recordLearningEvent } from '@/services/learningEvents';
import { speakEnglishText } from '@/services/tts';
import { useLearningOverviewQuery } from '@/features/learning/hooks/useLearningOverviewQuery';

interface WordWorkbenchProps {
  word: WordData;
  isFlipped: boolean;
  onFlip: () => void;
  onMarkStatus: (status: 'learned' | 'hard') => void;
  isLearned: boolean;
  isHard: boolean;
}

function WordWorkbench({ word, isFlipped, onFlip, onMarkStatus, isLearned, isHard }: WordWorkbenchProps) {
  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  return (
    <div className="perspective-1000 mx-auto w-full max-w-[880px]">
      <motion.div
        className="relative min-h-[520px] w-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.58, type: 'spring', stiffness: 240, damping: 22 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <section
          className={cn(
            learningFrameClassName,
            'flex min-h-[520px] cursor-pointer flex-col justify-between p-6 backface-hidden sm:p-8',
            isFlipped && 'invisible',
          )}
          onClick={onFlip}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/70 hover:bg-white/[0.04]">
                {word.level}
              </Badge>
              {isLearned ? (
                <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 hover:bg-emerald-500/10">
                  <Check className="mr-1 h-3 w-3" />
                  已学会
                </Badge>
              ) : null}
              {isHard ? (
                <Badge className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-300 hover:bg-amber-500/10">
                  <Brain className="mr-1 h-3 w-3" />
                  需复习
                </Badge>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
              onClick={(event) => {
                event.stopPropagation();
                playAudio(word.word);
              }}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6 py-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Current word</p>
            <h2 className="text-[3.6rem] font-semibold leading-[0.9] tracking-[-0.065em] text-white sm:text-[5rem]">
              {word.word}
            </h2>
            <div className="space-y-2">
              <p className="text-base font-medium text-white/72">{word.partOfSpeech}</p>
              <p className="font-mono text-lg text-white/48">{word.phonetic}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-white/48">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              点击翻面，查看释义、例句和搭配
            </div>
            <LearningActionCluster className="justify-center">
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkStatus('hard');
                }}
                disabled={isHard}
              >
                <Brain className="mr-2 h-4 w-4" />
                {isHard ? '已标记较难' : '标记较难'}
              </Button>
              <Button
                className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400"
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkStatus('learned');
                }}
                disabled={isLearned}
              >
                <Check className="mr-2 h-4 w-4" />
                {isLearned ? '已学会' : '标记学会'}
              </Button>
            </LearningActionCluster>
          </div>
        </section>

        <section
          className={cn(
            learningFrameClassName,
            'absolute inset-0 min-h-[520px] p-6 backface-hidden sm:p-8',
            !isFlipped && 'invisible',
          )}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Word detail</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{word.word}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                  onClick={() => playAudio(word.word)}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                  onClick={onFlip}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  返回正面
                </Button>
              </div>
            </div>

            <ScrollArea className="mt-6 flex-1 pr-2">
              <div className="space-y-5">
                <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Definition</p>
                  <p className="mt-3 text-base leading-7 text-white">{word.definition}</p>
                  <p className="mt-2 text-sm leading-7 text-white/62">{word.definitionZh}</p>
                </section>

                {word.examples.length > 0 ? (
                  <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Examples</p>
                    <div className="mt-3 space-y-3">
                      {word.examples.slice(0, 2).map((example, index) => (
                        <div key={`${example.en}-${index}`} className="rounded-[20px] border border-white/10 bg-black/30 p-4">
                          <p className="text-sm leading-7 text-white">{example.en}</p>
                          <p className="mt-2 text-sm leading-7 text-white/58">{example.zh}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-2">
                  {word.collocations.length > 0 ? (
                    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Collocations</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {word.collocations.slice(0, 8).map((collocation) => (
                          <span
                            key={collocation}
                            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                          >
                            {collocation}
                          </span>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {(word.memoryTip || word.etymology) ? (
                    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Memory cue</p>
                      <p className="mt-3 text-sm leading-7 text-white/62">{word.memoryTip || word.etymology}</p>
                    </section>
                  ) : null}
                </div>
              </div>
            </ScrollArea>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

export default function TodayPage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const {
    dailyWords,
    activeBook,
    activeBookSummary,
    dueWords,
    learningProfile,
    markWordAsLearned,
    refreshDailyWords,
    dailyMission,
    completeMissionTask,
    refreshDailyMission,
  } = useUserData();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [hardWords, setHardWords] = useState<Set<string>>(new Set());
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(new Set());

  const words = dailyWords.length > 0 ? dailyWords : [];
  const currentWord = words[currentWordIndex];
  const progress = words.length > 0 ? (learnedWords.size / words.length) * 100 : 0;
  const recommendedUnit = getRecommendedUnit(userId);

  useEffect(() => {
    refreshDailyWords();
    refreshDailyMission();
  }, [refreshDailyMission, refreshDailyWords]);

  const learningOverviewQuery = useLearningOverviewQuery({
    userId,
    mission: dailyMission,
    profile: learningProfile,
    dueWordsCount: dueWords.length,
    dailyWordsCount: words.length,
    learnedTodayCount: learnedWords.size,
    recommendedUnitTitle: recommendedUnit?.title || null,
    activeBookName: activeBook?.name || null,
  });

  const missionCard = learningOverviewQuery.data?.missionCard;
  const weaknesses = learningOverviewQuery.data?.weaknesses || [];
  const adaptiveDifficulty = learningOverviewQuery.data?.adaptiveDifficulty;
  const activityPoints = learningOverviewQuery.data?.activity || [];

  const handleFlip = (wordId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const handleMarkStatus = (status: 'learned' | 'hard') => {
    if (!currentWord) return;

    if (status === 'learned') {
      if (learnedWords.has(currentWord.id)) {
        toast.info('这个单词已经标记为已学会');
        return;
      }

      setLearnedWords((prev) => new Set(prev).add(currentWord.id));
      markWordAsLearned(currentWord.id);
      void recordLearningEvent({
        userId,
        eventName: 'today.word_marked',
        payload: {
          wordId: currentWord.id,
          word: currentWord.word,
          status: 'learned',
        },
      });

      if (learnedWords.size + 1 >= words.length) {
        completeMissionTask('task_vocab_today');
      }

      toast.success(`已学会 "${currentWord.word}"! +5 XP`, {
        icon: <Star className="h-4 w-4 text-yellow-500" />,
      });
    } else {
      if (hardWords.has(currentWord.id)) {
        toast.info('这个单词已经标记为较难');
        return;
      }

      setHardWords((prev) => new Set(prev).add(currentWord.id));
      void recordLearningEvent({
        userId,
        eventName: 'today.word_marked',
        payload: {
          wordId: currentWord.id,
          word: currentWord.word,
          status: 'hard',
        },
      });
      toast.info(`已标记 "${currentWord.word}" 为较难，将加入复习列表`, {
        icon: <Brain className="h-4 w-4 text-amber-500" />,
      });
    }

    window.setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setFlippedCards(new Set());
      }
    }, 700);
  };

  const handleBookmark = () => {
    if (!currentWord) return;

    setBookmarkedWords((prev) => {
      const next = new Set(prev);
      if (next.has(currentWord.id)) {
        next.delete(currentWord.id);
        toast.info(`已取消收藏 "${currentWord.word}"`);
      } else {
        next.add(currentWord.id);
        toast.success(`已收藏 "${currentWord.word}"`);
      }
      return next;
    });
  };

  const handleShare = async () => {
    if (!currentWord) return;

    const shareText = `我正在学习单词 "${currentWord.word}" - ${currentWord.definitionZh}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `VocabDaily - ${currentWord.word}`,
          text: shareText,
        });
      } catch {
        // user cancelled
      }
      return;
    }

    await navigator.clipboard.writeText(shareText);
    toast.success('已复制到剪贴板');
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((prev) => prev - 1);
      setFlippedCards(new Set());
    }
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setFlippedCards(new Set());
    }
  };

  const missionDone = dailyMission?.tasks.filter((task) => task.done).length || 0;
  const missionTotal = dailyMission?.tasks.length || 0;
  const missionProgress = missionTotal > 0 ? Math.round((missionDone / missionTotal) * 100) : 0;

  if (words.length === 0) {
    return (
      <LearningShellFrame>
        <LearningEmptyState
          icon={Sparkles}
          eyebrow="Today mission"
          title="先确定今天的学习入口"
          description={
            activeBook
              ? `当前词书是《${activeBook.name}》。先生成今天的新词，再根据到期复习和弱项安排下一步。`
              : '你还没有激活词书。先选词书或导入 deck，再开始今天的任务链路。'
          }
          metrics={[
            { label: 'Due reviews', value: dueWords.length, hint: '先知道是否有旧账要清。' },
            { label: 'Daily target', value: activeBookSummary.dailyGoal, hint: '让今天的学习规模保持可完成。' },
            { label: 'Target', value: learningProfile.target, hint: '主任务会围绕这个目标排优先级。' },
          ]}
          actions={
            <>
              {activeBook ? (
                <Button size="lg" className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={refreshDailyWords}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  生成今日任务
                </Button>
              ) : (
                <Button size="lg" className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" asChild>
                  <Link to="/dashboard/vocabulary">
                    <BookOpen className="mr-2 h-5 w-5" />
                    去选择词书
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white" asChild>
                <Link to="/dashboard/chat">
                  <MessageCircleMore className="mr-2 h-5 w-5" />
                  让 AI 帮我规划
                </Link>
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
        eyebrow={`Today mission · ${new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}`}
        title={missionCard?.headlineZh || '先做最该做的一步'}
        description={missionCard?.supportZh || '今天先清掉复习压力，再用一轮针对性练习把薄弱点补上。'}
        progress={missionProgress}
        progressLabel="Mission progress"
        metrics={[
          {
            label: 'Estimated time',
            value: `${missionCard?.estimatedMinutes || learningProfile.dailyMinutes} min`,
            hint: '把今天的学习边界压缩在一段清晰时间内。',
          },
          {
            label: 'Words left',
            value: `${Math.max(words.length - learnedWords.size, 0)} / ${words.length}`,
            hint: '先做完这组，再决定下一步。',
            accent: 'emerald',
          },
          {
            label: 'Due reviews',
            value: dueWords.length,
            hint: dueWords.length > 0 ? '如果旧账变多，优先切去 Review。' : '当前没有复习积压，可以继续推进新词。',
          },
        ]}
        actions={
          <>
            <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" asChild>
              <Link to={missionCard?.primaryAction.href || '/dashboard/today'}>
                {missionCard?.primaryAction.ctaZh || '继续今日任务'}
              </Link>
            </Button>
            {(missionCard?.secondaryActions || []).slice(0, 2).map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                asChild
              >
                <Link to={action.href}>{action.ctaZh}</Link>
              </Button>
            ))}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <LearningWorkspaceSurface
            eyebrow="Vocabulary workspace"
            title={currentWord ? `${currentWord.word} · 当前主练单词` : 'Vocabulary workspace'}
            description="新词学习仍然保留在同一页，但它现在从属于主任务，不再是整个产品唯一的入口。"
          >
            <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
              <div className="space-y-4">
                <section className={cn(learningFrameClassName, 'p-4')}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">Current HUD</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-3xl font-semibold tracking-[-0.05em] text-emerald-300">
                        {currentWordIndex + 1}
                        <span className="mx-2 text-white/24">/</span>
                        <span className="text-white">{words.length}</span>
                      </p>
                      <p className="mt-1 text-sm text-white/52">当前位次。保持节奏，不要频繁切模式。</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-white/48">
                        <span>词汇完成度</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/10">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className={cn(learningFrameClassName, 'p-4')}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock3 className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-medium">还需 {Math.max(3, (words.length - learnedWords.size) * 2)} 分钟</p>
                    </div>
                    <p className="text-sm leading-6 text-white/54">
                      把今天这组单词做完，再去练习或复习。不要让当前回合被太多选择打断。
                    </p>
                  </div>
                </section>

                <LearningMetricStrip
                  items={[
                    { label: 'Learned', value: learnedWords.size, accent: 'emerald' },
                    { label: 'Hard', value: hardWords.size, accent: 'warm' },
                    { label: 'Saved', value: bookmarkedWords.size },
                  ]}
                />
              </div>

              <div className="space-y-5">
                <AnimatePresence mode="wait">
                  {currentWord ? (
                    <motion.div
                      key={currentWord.id}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.25 }}
                    >
                      <WordWorkbench
                        word={currentWord}
                        isFlipped={flippedCards.has(currentWord.id)}
                        onFlip={() => handleFlip(currentWord.id)}
                        onMarkStatus={handleMarkStatus}
                        isLearned={learnedWords.has(currentWord.id)}
                        isHard={hardWords.has(currentWord.id)}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={currentWordIndex === 0}
                      className="h-11 w-11 rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNext}
                      disabled={currentWordIndex === words.length - 1}
                      className="h-11 w-11 rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex gap-2 px-1">
                    {words.map((word, index) => (
                      <button
                        key={word.id}
                        type="button"
                        onClick={() => {
                          setCurrentWordIndex(index);
                          setFlippedCards(new Set());
                        }}
                        className={cn(
                          'h-2.5 rounded-full transition-all duration-300',
                          index === currentWordIndex
                            ? 'w-9 bg-gradient-to-r from-emerald-400 to-emerald-500'
                            : learnedWords.has(word.id)
                              ? 'w-2.5 bg-emerald-400'
                              : hardWords.has(word.id)
                                ? 'w-2.5 bg-amber-400'
                                : 'w-2.5 bg-white/18 hover:bg-white/30',
                        )}
                        title={word.word}
                      />
                    ))}
                  </div>

                  <LearningActionCluster className="sm:justify-end">
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                      onClick={handleBookmark}
                      disabled={!currentWord}
                    >
                      <Bookmark className={cn('mr-2 h-4 w-4', bookmarkedWords.has(currentWord?.id || '') && 'fill-current')} />
                      收藏
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                      onClick={handleShare}
                      disabled={!currentWord}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      分享
                    </Button>
                  </LearningActionCluster>
                </div>
              </div>
            </div>
          </LearningWorkspaceSurface>

          {learnedWords.size === words.length && words.length > 0 ? (
            <LearningCompletionState
              icon={Check}
              eyebrow="Today complete"
              title="今天的新词任务已完成"
              description={`你已经学完今天的 ${words.length} 个单词。现在最有价值的下一步，是去补一下弱项或者清空复习压力。`}
              metrics={[
                { label: 'Words completed', value: words.length, accent: 'emerald' },
                { label: 'Hard words', value: hardWords.size, accent: 'warm' },
                { label: 'Mission progress', value: `${missionProgress}%` },
              ]}
              actions={
                <>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white" asChild>
                    <Link to="/dashboard/review">去做复习</Link>
                  </Button>
                  <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" asChild>
                    <Link to="/dashboard/practice">做一次短练习</Link>
                  </Button>
                </>
              }
            />
          ) : null}
        </div>

        <div className="space-y-6">
          <LearningRailSection
            title="Learning context"
            description="词书、复习压力和当下节奏会在这里收口，不再和主舞台抢中心。"
          >
            <div className="space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Active book</p>
                <p className="mt-2 text-lg font-semibold text-white">{activeBook?.name || '未选择词书'}</p>
                <p className="mt-2 text-sm leading-6 text-white/54">今日词量 {words.length} / {activeBookSummary.dailyGoal}</p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Review pressure</p>
                <p className="mt-2 text-lg font-semibold text-white">{dueWords.length} 个到期复习</p>
                <p className="mt-2 text-sm leading-6 text-white/54">
                  {activeBookSummary.isNearlyCompleted ? '当前词书接近完成，建议准备下一本。' : '先处理到期复习，再推进新词，记忆效率更高。'}
                </p>
              </div>

              {adaptiveDifficulty ? (
                <div className="rounded-[22px] border border-cyan-500/20 bg-cyan-500/[0.06] p-4">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm font-semibold">当前节奏：{adaptiveDifficulty.labelZh}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">{adaptiveDifficulty.reason}</p>
                </div>
              ) : null}
            </div>
          </LearningRailSection>

          <LearningRailSection
            title="Weakness map"
            description="系统只显示最近最该补的 2-3 个点，不把所有信息同时推到主舞台。"
          >
            <div className="space-y-3">
              {weaknesses.length > 0 ? (
                weaknesses.map((weakness) => (
                  <div key={weakness.tag} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{weakness.titleZh}</p>
                        <p className="mt-1 text-xs text-white/45">{weakness.title}</p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium',
                          weakness.emphasis === 'urgent'
                            ? 'bg-red-500/15 text-red-300'
                            : weakness.emphasis === 'watch'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-white/8 text-white/65',
                        )}
                      >
                        {weakness.count} 次
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/12 px-4 py-5 text-sm leading-6 text-white/50">
                  先完成一次练习或写作反馈，系统才会生成更可信的弱项图谱。
                </div>
              )}

              {recommendedUnit ? (
                <div className="rounded-[22px] border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Target className="h-4 w-4" />
                    <p className="text-sm font-semibold">推荐补强微课：{recommendedUnit.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">预计 {recommendedUnit.estimatedMinutes} 分钟，适合接在今天主任务之后。</p>
                  <Button variant="outline" size="sm" className="mt-3 rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white" asChild>
                    <Link to="/dashboard/exam">去补强</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </LearningRailSection>

          {activityPoints.length > 0 ? (
            <LearningRailSection title="7-day spark" description="只看最近一周的活跃度，让节奏感可见。">
              <div className="flex items-end gap-2">
                {activityPoints.map((point) => {
                  const barHeight = Math.max(22, Math.min(88, point.words * 6 + point.xp * 0.35));
                  return (
                    <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={cn(
                          'w-full rounded-full transition-colors',
                          point.active ? 'bg-gradient-to-t from-emerald-500 to-emerald-300' : 'bg-white/10',
                        )}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[11px] text-white/42">{point.label}</span>
                    </div>
                  );
                })}
              </div>
              {learningOverviewQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-white/45">
                  <TrendingUp className="h-4 w-4 text-emerald-300" />
                  正在同步最近学习活动
                </div>
              ) : null}
            </LearningRailSection>
          ) : null}
        </div>
      </div>
    </LearningShellFrame>
  );
}

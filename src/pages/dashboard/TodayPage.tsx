import { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motionPresets } from '@/lib/motion';
import { FlashCard } from '@/components/FlashCard';
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
import {
  computeLearnerModel,
  MODE_LABELS,
  MODE_DESCRIPTIONS,
} from '@/services/learnerModel';
import {
  loadTodayFlags,
  markTodayWordHard,
  toggleTodayBookmark,
  type DayKey,
} from '@/services/todayWorkbenchPersistence';
import { createEvidenceEvent, recordEvidence } from '@/services/evidenceEvents';
import { LearningCockpitShell } from '@/features/learning/components/LearningCockpitShell';
import { deriveMissionSourceSignal } from '@/features/learning/missionSourceSignal';
import { useTranslation } from 'react-i18next';
import type { UserProgress } from '@/data/localStorage';

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

  const frontContent = (
    <section
      className={cn(
        learningFrameClassName,
        'flex h-full min-h-[520px] cursor-pointer flex-col justify-between p-6 sm:p-8',
      )}
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

      <div className="space-y-6 py-8 text-center flex-1 flex flex-col justify-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">Current word</p>
        <h2 className="text-[3.6rem] font-semibold leading-[0.9] tracking-[-0.065em] text-slate-900 dark:text-white sm:text-[5rem]">
          {word.word}
        </h2>
        <div className="space-y-2">
          <p className="text-base font-medium text-slate-600 dark:text-white/72">{word.partOfSpeech}</p>
          <p className="font-mono text-lg text-slate-400 dark:text-white/48">{word.phonetic}</p>
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
  );

  const backContent = (
    <section
      className={cn(
        learningFrameClassName,
        'h-full min-h-[520px] p-6 sm:p-8',
      )}
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
          <div className="space-y-4">
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Definition</p>
              <p className="mt-3 text-base leading-7 text-white">{word.definition}</p>
              <p className="mt-2 text-sm leading-7 text-white/62">{word.definitionZh}</p>
            </section>

            {word.examples.length > 0 ? (
              <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Examples</p>
                <div className="mt-3 space-y-3">
                  {word.examples.slice(0, 2).map((example, index) => (
                    <div key={`${example.en}-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-sm leading-7 text-white">{example.en}</p>
                      <p className="mt-2 text-sm leading-7 text-white/58">{example.zh}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              {word.collocations.length > 0 ? (
                <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
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
                <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Memory cue</p>
                  <p className="mt-3 text-sm leading-7 text-white/62">{word.memoryTip || word.etymology}</p>
                </section>
              ) : null}
            </div>
          </div>
        </ScrollArea>
      </div>
    </section>
  );

  return (
    <div className="mx-auto w-full max-w-[880px] relative">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/5 dark:bg-emerald-500/10 blur-[120px] animate-pulse-glow z-0" />
      <FlashCard
        front={frontContent}
        back={backContent}
        isFlipped={isFlipped}
        onFlip={onFlip}
        className="z-10 relative"
      />
    </div>
  );
}

// Circular SVG progress ring used in the Today HUD
const CircularProgress = memo(function CircularProgress({
  value,
  size = 88,
  strokeWidth = 7,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, value / 100)));
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* centre text rendered at 0° (compensate the -90° rotation) */}
        <text
          x={center} y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${center}px ${center}px`, fill: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}
        >
          {Math.round(value)}%
        </text>
      </svg>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">{label}</p>
      {sublabel && <p className="text-xs text-white/55">{sublabel}</p>}
    </div>
  );
});

// Confetti celebration component
const CONFETTI_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

function ConfettiCelebration({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${1.2 + Math.random() * 0.8}s`,
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
          }}
        />
      ))}
    </div>
  );
}

// Streak fire display
const StreakFire = memo(function StreakFire({ days }: { days: number }) {
  if (days <= 0) return null;
  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.span
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-base"
      >
        🔥
      </motion.span>
      <span className="text-xs font-bold text-amber-400">{days} day streak</span>
    </motion.div>
  );
});

// Animated XP counter
const XPCounter = memo(function XPCounter({ value }: { value: number }) {
  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
    >
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-xs font-bold text-emerald-400"
      >
        +{value} XP
      </motion.span>
    </motion.div>
  );
});

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
    progress: wordProgress,
    streak,
  } = useUserData();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  // Persistence keys derived from (userId, today). The day rolls over at
  // local midnight so refresh-after-midnight starts a new workbench, not
  // yesterday's flags.
  const dayKey: DayKey = useMemo(() => ({ userId, date: new Date() }), [userId]);
  const initialFlags = useMemo(() => loadTodayFlags(dayKey), [dayKey]);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [hardWords, setHardWords] = useState<Set<string>>(initialFlags.hard);
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(initialFlags.bookmark);
  const currentStreak = streak.current;
  const [showConfetti, setShowConfetti] = useState(false);

  const words = dailyWords.length > 0 ? dailyWords : [];
  const currentWord = words[currentWordIndex];
  const progress = words.length > 0 ? (learnedWords.size / words.length) * 100 : 0;
  const recommendedUnit = getRecommendedUnit(userId);

  useEffect(() => {
    refreshDailyWords();
    refreshDailyMission();
  }, [refreshDailyMission, refreshDailyWords]);

  // Hydrate `learnedWords` from durable progress so a refresh does not
  // reset the workbench. Only words that the daily list still contains
  // and that have been touched today are counted as "learned today" — a
  // word reviewed last week is durable progress, not part of this
  // session's hero metric.
  useEffect(() => {
    if (words.length === 0) return;
    const todayKey = `${dayKey.date.getFullYear()}-${String(dayKey.date.getMonth() + 1).padStart(2, '0')}-${String(dayKey.date.getDate()).padStart(2, '0')}`;
    const wordIdsToday = new Set(words.map((word) => word.id));
    const learnedToday = new Set<string>();
    for (const entry of wordProgress as UserProgress[]) {
      if (!wordIdsToday.has(entry.wordId)) continue;
      const last = entry.lastReviewed ? new Date(entry.lastReviewed) : null;
      if (!last) continue;
      const lastKey = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
      const counts = lastKey === todayKey || entry.status === 'mastered';
      if (counts) learnedToday.add(entry.wordId);
    }
    setLearnedWords((prev) => {
      // Preserve any optimistic adds (e.g. mid-session marks the user just
      // tapped) so we never visually undo a fresh tap if the durable write
      // hasn't roundtripped yet.
      let changed = false;
      const next = new Set(prev);
      learnedToday.forEach((id) => {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [dayKey.date, wordProgress, words]);

  // ── FSRS-5 Learner Model ──────────────────────────────────────────────────
  const learnerModel = useMemo(() => {
    if (!wordProgress.length) return null;
    return computeLearnerModel(
      userId,
      wordProgress as UserProgress[],
      currentStreak,
      activeBookSummary.dailyGoal,
    );
  }, [activeBookSummary.dailyGoal, currentStreak, userId, wordProgress]);

  const learningOverviewQuery = useLearningOverviewQuery({
    userId,
    mission: dailyMission,
    profile: learningProfile,
    dueWordsCount: dueWords.length,
    dailyWordsCount: words.length,
    learnedTodayCount: learnedWords.size,
    recommendedUnitTitle: recommendedUnit?.title || null,
    activeBookName: activeBook?.name || null,
    learnerModel,
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
      void recordEvidence(
        createEvidenceEvent({
          type: 'vocab.learned',
          userId,
          wordId: currentWord.id,
          bookId: activeBook?.id,
        }),
      );

      if (learnedWords.size + 1 >= words.length) {
        completeMissionTask('task_vocab_today');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      toast.success(`已学会 "${currentWord.word}"! +5 XP`, {
        icon: <Star className="h-4 w-4 text-yellow-500" />,
      });
    } else {
      if (hardWords.has(currentWord.id)) {
        toast.info('这个单词已经标记为较难');
        return;
      }

      const updated = markTodayWordHard(dayKey, currentWord.id);
      setHardWords(new Set(updated.hard));
      void recordLearningEvent({
        userId,
        eventName: 'today.word_marked',
        payload: {
          wordId: currentWord.id,
          word: currentWord.word,
          status: 'hard',
        },
      });
      void recordEvidence(
        createEvidenceEvent({
          type: 'vocab.hard',
          userId,
          wordId: currentWord.id,
          bookId: activeBook?.id,
        }),
      );
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
    const wasBookmarked = bookmarkedWords.has(currentWord.id);
    const updated = toggleTodayBookmark(dayKey, currentWord.id);
    setBookmarkedWords(new Set(updated.bookmark));
    if (wasBookmarked) {
      toast.info(`已取消收藏 "${currentWord.word}"`);
    } else {
      toast.success(`已收藏 "${currentWord.word}"`);
    }
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

  const todayXP = learnedWords.size * 5;

  // LEARN-01 — single-label "source signal" for the hero metric strip.
  const sourceSignal = deriveMissionSourceSignal({
    reason: missionCard?.primaryAction.reason,
    learnerMode: learnerModel?.mode || null,
    burnoutRisk: learnerModel?.burnoutRisk,
    examType: learningProfile.target,
  });

  return (
    <LearningCockpitShell
      language={language}
      eyebrow={`${language.startsWith('zh') ? '今日任务' : 'Today mission'} · ${new Date().toLocaleDateString(language.startsWith('zh') ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' })}`}
      progress={missionProgress}
      progressLabel={language.startsWith('zh') ? '任务进度' : 'Mission progress'}
      mission={{
        title: (language.startsWith('zh') ? missionCard?.headlineZh : missionCard?.headline)
          || (language.startsWith('zh') ? '先做最该做的一步' : 'Pick the highest-impact next step'),
        description: (language.startsWith('zh') ? missionCard?.supportZh : missionCard?.support) || undefined,
        estimatedMinutes: missionCard?.estimatedMinutes || learningProfile.dailyMinutes,
        primaryAction: {
          label: (language.startsWith('zh') ? missionCard?.primaryAction.ctaZh : missionCard?.primaryAction.cta)
            || (language.startsWith('zh') ? '继续今日任务' : 'Continue today'),
          href: missionCard?.primaryAction.href || '/dashboard/today',
        },
        secondaryActions: (missionCard?.secondaryActions || []).slice(0, 2).map((action) => ({
          label: language.startsWith('zh') ? action.ctaZh : action.cta,
          href: action.href,
          variant: 'outline' as const,
        })),
        why: {
          reason: missionCard?.primaryAction.reason,
          learnerMode: learnerModel?.mode || null,
          burnoutRisk: learnerModel?.burnoutRisk,
        },
      }}
      metrics={[
        {
          label: language.startsWith('zh') ? '信号来源' : 'Source signal',
          value: language.startsWith('zh') ? sourceSignal.label.zh : sourceSignal.label.en,
          accent: sourceSignal.signal === 'streak recovery' ? 'warm' : 'emerald',
        },
        {
          label: language.startsWith('zh') ? '预计用时' : 'Estimated time',
          value: `${missionCard?.estimatedMinutes || learningProfile.dailyMinutes} min`,
        },
        {
          label: language.startsWith('zh') ? '今日剩余' : 'Words left',
          value: `${Math.max(words.length - learnedWords.size, 0)} / ${words.length}`,
          accent: 'emerald',
        },
        {
          label: language.startsWith('zh') ? '到期复习' : 'Due reviews',
          value: dueWords.length,
          accent: dueWords.length > 0 ? 'warm' : 'default',
        },
      ]}
    >
      <ConfettiCelebration active={showConfetti} />

      {/* Streak & XP indicators */}
      <div className="flex items-center gap-3 flex-wrap">
        <StreakFire days={currentStreak} />
        {todayXP > 0 && <XPCounter value={todayXP} />}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <LearningWorkspaceSurface
            eyebrow="Vocabulary workspace"
            title={currentWord ? `${currentWord.word} · 当前主练单词` : 'Vocabulary workspace'}
          >
            <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
              <div className="space-y-4">
                <section className={cn(learningFrameClassName, 'p-4')}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">Current HUD</p>
                  <div className="mt-4 flex items-center gap-5">
                    <CircularProgress
                      value={progress}
                      label="词汇完成度"
                      sublabel={`${learnedWords.size} / ${words.length}`}
                    />
                    <div className="space-y-1">
                      <p className="text-3xl font-semibold tracking-[-0.05em] text-emerald-300">
                        {learnedWords.size}
                        <span className="mx-2 text-white/24">/</span>
                        <span className="text-white">{words.length}</span>
                      </p>
                      <p className="text-xs text-white/45">今日已学 / 今日计划</p>
                    </div>
                  </div>
                </section>

                <section className={cn(learningFrameClassName, 'p-4')}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock3 className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-medium">还需 {Math.max(3, (words.length - learnedWords.size) * 2)} 分钟</p>
                    </div>
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

                <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between shadow-glass">
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
              description={`今天的 ${words.length} 个单词已经完成。`}
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
          <LearningRailSection title="Learning context">
            <div className="space-y-3">
              <div className="rounded-2xl border border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.01] p-4 glass transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover hover:glass-strong">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-white/42">Active book</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{activeBook?.name || '未选择词书'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/54">今日词量 {words.length} / {activeBookSummary.dailyGoal}</p>
              </div>

              <div className="rounded-2xl border border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.01] p-4 glass transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover hover:glass-strong">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-white/42">Review pressure</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{dueWords.length} 个到期复习</p>
                {activeBookSummary.isNearlyCompleted ? <p className="mt-2 text-sm text-slate-500 dark:text-white/48">当前词书接近完成</p> : null}
              </div>

              {learnerModel ? (() => {
                const modeInfo = MODE_LABELS[learnerModel.mode];
                return (
                  <div className={cn(
                    'rounded-2xl border p-4 space-y-3',
                    learnerModel.mode === 'recovery'    && 'border-red-500/20 bg-red-500/[0.06]',
                    learnerModel.mode === 'maintenance' && 'border-amber-500/20 bg-amber-500/[0.06]',
                    learnerModel.mode === 'steady'      && 'border-emerald-500/20 bg-emerald-500/[0.06]',
                    learnerModel.mode === 'stretch'     && 'border-blue-500/20 bg-blue-500/[0.06]',
                    learnerModel.mode === 'sprint'      && 'border-violet-500/20 bg-violet-500/[0.06]',
                  )}>
                    {/* Mode header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={cn('h-4 w-4', modeInfo.color)} />
                        <span className={cn('text-sm font-semibold', modeInfo.color)}>
                          {modeInfo.labelZh}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40">
                        {modeInfo.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs leading-5 text-slate-500 dark:text-white/50">
                      {MODE_DESCRIPTIONS[learnerModel.mode]}
                    </p>

                    {/* Daily targets */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/36">新词</p>
                        <p className="mt-0.5 text-base font-bold text-slate-800 dark:text-white">
                          {learnerModel.recommendedDailyNew}
                        </p>
                      </div>
                      <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/36">复习</p>
                        <p className="mt-0.5 text-base font-bold text-slate-800 dark:text-white">
                          {learnerModel.recommendedDailyReview}
                        </p>
                      </div>
                    </div>

                    {/* Avg retrievability bar */}
                    {learnerModel.avgRetrievability > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/36">记忆保留率</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-white/70">
                            {Math.round(learnerModel.avgRetrievability * 100)}%
                          </p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-700',
                              learnerModel.avgRetrievability >= 0.75 ? 'bg-emerald-500' :
                              learnerModel.avgRetrievability >= 0.5  ? 'bg-amber-500' : 'bg-red-500',
                            )}
                            style={{ width: `${Math.round(learnerModel.avgRetrievability * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Weak topics */}
                    {learnerModel.weakTopics.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/36 mb-1.5">需加强</p>
                        <div className="flex flex-wrap gap-1.5">
                          {learnerModel.weakTopics.map((t) => (
                            <span key={t} className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] text-red-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {learnerModel.stubbornWordCount > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/36 mb-1.5">强化路径</p>
                        <div className="flex items-center justify-between rounded-xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                              顽固词 {learnerModel.stubbornWordCount} 个
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                              {learnerModel.stubbornTopics.length > 0
                                ? `集中在 ${learnerModel.stubbornTopics.join(' / ')}`
                                : '这些词会被安排进更短的强化复习回路。'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="rounded-full">
                            Reinforce
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : null}

              {adaptiveDifficulty ? (
                <div className="rounded-2xl border border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.01] p-4 glass transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover hover:glass-strong">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-white/42">Pacing today</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{adaptiveDifficulty.labelZh}</p>
                    <Badge variant="secondary" className="rounded-full">
                      {adaptiveDifficulty.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/54">{adaptiveDifficulty.reason}</p>
                </div>
              ) : null}
            </div>
          </LearningRailSection>

          <LearningRailSection title="Weakness map">
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
                <div className="rounded-3xl border border-dashed border-white/[0.1] px-4 py-5 text-sm leading-6 text-white/50">
                  先完成一次练习或写作反馈，系统才会生成更可信的弱项图谱。
                </div>
              )}

              {recommendedUnit ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Target className="h-4 w-4" />
                    <p className="text-sm font-semibold">推荐补强微课：{recommendedUnit.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-white/58">{recommendedUnit.estimatedMinutes} 分钟</p>
                  <Button variant="outline" size="sm" className="mt-3 rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white" asChild>
                    <Link to="/dashboard/exam">去补强</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </LearningRailSection>

          {activityPoints.length > 0 ? (
            <LearningRailSection title="7-day spark">
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
              {learningOverviewQuery.isLoading ? <TrendingUp className="h-4 w-4 text-emerald-300" /> : null}
            </LearningRailSection>
          ) : null}
        </div>
      </div>
    </LearningCockpitShell>
  );
}

import { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FlashCard } from '@/components/FlashCard';
import {
  LearningActionCluster,
  LearningCompletionState,
  LearningEmptyState,
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
  Flame,
  Bookmark,
  Share2,
  Star,
  TrendingUp,
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
import { applyLearnerControls } from '@/services/learnerControls';
import {
  loadTodayFlags,
  markTodayWordHard,
  toggleTodayBookmark,
  type DayKey,
} from '@/services/todayWorkbenchPersistence';
import { createEvidenceEvent, recordEvidence } from '@/services/evidenceEvents';
import { LearningCockpitShell } from '@/features/learning/components/LearningCockpitShell';
import { deriveMissionSourceSignal } from '@/features/learning/missionSourceSignal';
import {
  buildDailyCoachPlan,
  getDailyCoachEvidenceToneClass,
} from '@/features/learning/dailyCoachPlan';
import { buildLexicalSummary, toLexicalEntry } from '@/features/lexicon/lexicalEntry';
import { getActiveLearningPathNextLesson } from '@/features/learning/learningPathRouting';
import { useTranslation } from 'react-i18next';
import type { UserProgress } from '@/data/localStorage';
import { TodayWordNavigation } from './TodayWordNavigation';

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
        'premium-word-card flex h-full min-h-[430px] cursor-pointer flex-col justify-between p-5 sm:min-h-[520px] sm:p-8',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
            {word.level}
          </Badge>
          {isLearned ? (
            <Badge className="rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
              <Check className="mr-1 h-3 w-3" />
              已学会
            </Badge>
          ) : null}
          {isHard ? (
            <Badge className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-600 hover:bg-amber-500/10">
              <Brain className="mr-1 h-3 w-3" />
              需复习
            </Badge>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md border border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            playAudio(word.word);
          }}
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6 py-8 text-center flex-1 flex flex-col justify-center">
        <p className="text-xs text-muted-foreground">当前单词</p>
        <h2 className="text-[3.1rem] font-semibold leading-none text-foreground sm:text-[4.6rem] lg:text-[5rem]">
          {word.word}
        </h2>
        <div className="space-y-2">
          <p className="text-base font-medium text-foreground">{word.partOfSpeech}</p>
          <p className="font-mono text-lg text-muted-foreground">{word.phonetic}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-practice))]" />
          点击翻面，查看释义、例句和搭配
        </div>
        <LearningActionCluster className="justify-center">
          <Button
            variant="outline"
            className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
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
        'premium-word-card-back h-full min-h-[430px] p-5 sm:min-h-[520px] sm:p-8',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-3xl font-semibold text-foreground">{word.word}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md border border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
              onClick={() => playAudio(word.word)}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
              onClick={onFlip}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              返回正面
            </Button>
          </div>
        </div>

        <ScrollArea className="mt-6 flex-1 pr-2">
          <div className="space-y-4">
            <section className="premium-panel-soft rounded-lg border border-border bg-card p-4">
              <p className="mt-1 text-base leading-7 text-foreground">{word.definition}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.definitionZh}</p>
            </section>

            {word.examples.length > 0 ? (
              <section className="premium-panel-soft rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">例句</p>
                <div className="mt-3 space-y-3">
                  {word.examples.slice(0, 2).map((example, index) => (
                    <div key={`${example.en}-${index}`} className="rounded-lg border border-border bg-muted p-4">
                      <p className="text-sm leading-7 text-foreground">{example.en}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{example.zh}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              {word.collocations.length > 0 ? (
                <section className="premium-panel-soft rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">搭配</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {word.collocations.slice(0, 8).map((collocation) => (
                      <span
                        key={collocation}
                        className="rounded-md border border-border bg-[hsl(var(--accent-practice)/0.08)] px-3 py-1 text-xs font-medium text-[hsl(var(--accent-practice))]"
                      >
                        {collocation}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {(word.memoryTip || word.etymology) ? (
                <section className="premium-panel-soft rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">助记</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.memoryTip || word.etymology}</p>
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
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="hsl(var(--accent-practice))"
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
          style={{ transform: 'rotate(90deg)', transformOrigin: `${center}px ${center}px`, fill: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}
        >
          {Math.round(value)}%
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
});

// Confetti celebration component
const CONFETTI_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent-practice))',
  'hsl(var(--accent-exam))',
  'hsl(var(--accent-coach))',
  'hsl(var(--success))',
  'hsl(var(--info))',
];
const seededFraction = (seed: number): number => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};
const CONFETTI_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${seededFraction(i + 1) * 100}%`,
  top: `${seededFraction(i + 31) * 40}%`,
  animationDelay: `${seededFraction(i + 61) * 0.8}s`,
  animationDuration: `${1.2 + seededFraction(i + 91) * 0.8}s`,
  size: `${6 + seededFraction(i + 121) * 6}px`,
}));

function ConfettiCelebration({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {CONFETTI_PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            left: particle.left,
            top: particle.top,
            backgroundColor: CONFETTI_COLORS[particle.id % CONFETTI_COLORS.length],
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration,
            width: particle.size,
            height: particle.size,
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
      className="premium-status-chip flex items-center gap-1.5 rounded-md border px-3 py-1"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.span
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-amber-600 dark:text-amber-300"
        aria-hidden="true"
      >
        <Flame className="h-4 w-4" />
      </motion.span>
      <span className="text-xs font-bold text-amber-600">{days} day streak</span>
    </motion.div>
  );
});

// Animated XP counter
const XPCounter = memo(function XPCounter({ value }: { value: number }) {
  return (
    <motion.div
      className="premium-metric-card flex items-center gap-1.5 rounded-md border border-border bg-[hsl(var(--accent-practice)/0.08)] px-3 py-1"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
    >
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-xs font-bold text-[hsl(var(--accent-practice))]"
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
    settings,
  } = useUserData();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const isZh = language.startsWith('zh');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  // Persistence keys derived from (userId, today). The day rolls over at
  // local midnight so refresh-after-midnight starts a new workbench, not
  // yesterday's flags.
  const dayKey: DayKey = useMemo(() => ({ userId, date: new Date() }), [userId]);
  const initialFlags = useMemo(() => loadTodayFlags(dayKey), [dayKey]);
  const [optimisticLearnedWords, setOptimisticLearnedWords] = useState<Set<string>>(new Set());
  const [hardWords, setHardWords] = useState<Set<string>>(initialFlags.hard);
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(initialFlags.bookmark);
  const currentStreak = streak.current;
  const [showConfetti, setShowConfetti] = useState(false);

  const words = useMemo(() => (dailyWords.length > 0 ? dailyWords : []), [dailyWords]);
  const currentWord = words[currentWordIndex];
  const lexicalFocus = useMemo(() => currentWord ? toLexicalEntry(currentWord) : null, [currentWord]);
  const durableLearnedWords = useMemo(() => {
    if (words.length === 0) return new Set<string>();
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
    return learnedToday;
  }, [dayKey.date, wordProgress, words]);
  const learnedWords = useMemo(() => {
    const next = new Set(durableLearnedWords);
    optimisticLearnedWords.forEach((id) => next.add(id));
    return next;
  }, [durableLearnedWords, optimisticLearnedWords]);
  const progress = words.length > 0 ? (learnedWords.size / words.length) * 100 : 0;
  const recommendedUnit = getRecommendedUnit(userId);
  const activePathNextLesson = useMemo(() => getActiveLearningPathNextLesson(userId), [userId]);

  useEffect(() => {
    refreshDailyWords();
    refreshDailyMission();
  }, [refreshDailyMission, refreshDailyWords]);

  // ── FSRS-5 Learner Model ──────────────────────────────────────────────────
  const learnerModel = useMemo(() => {
    if (!wordProgress.length) return null;
    return applyLearnerControls(
      computeLearnerModel(
        userId,
        wordProgress as UserProgress[],
        currentStreak,
        activeBookSummary.dailyGoal,
      ),
      settings,
    );
  }, [activeBookSummary.dailyGoal, currentStreak, settings, userId, wordProgress]);

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
  const weaknesses = useMemo(() => learningOverviewQuery.data?.weaknesses ?? [], [learningOverviewQuery.data?.weaknesses]);
  const adaptiveDifficulty = learningOverviewQuery.data?.adaptiveDifficulty;
  const activityPoints = useMemo(() => learningOverviewQuery.data?.activity ?? [], [learningOverviewQuery.data?.activity]);
  const dailyCoachPlan = useMemo(() => {
    if (!missionCard) return null;
    return buildDailyCoachPlan({
      userId,
      profile: learningProfile,
      missionCard,
      dueWordsCount: dueWords.length,
      dailyWordsCount: words.length,
      learnedTodayCount: learnedWords.size,
      weaknesses,
      activeBookName: activeBook?.name || null,
      lexicalFocus,
    });
  }, [
    activeBook?.name,
    dueWords.length,
    learnedWords.size,
    learningProfile,
    lexicalFocus,
    missionCard,
    userId,
    weaknesses,
    words.length,
  ]);

  const handleFlip = useCallback((wordId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  }, []);

  const handleMarkStatus = (status: 'learned' | 'hard') => {
    if (!currentWord) return;

    if (status === 'learned') {
      if (learnedWords.has(currentWord.id)) {
        toast.info('这个单词已经标记为已学会');
        return;
      }

      setOptimisticLearnedWords((prev) => new Set(prev).add(currentWord.id));
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

  const handlePrevious = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((prev) => prev - 1);
      setFlippedCards(new Set());
    }
  }, [currentWordIndex]);

  const handleNext = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setFlippedCards(new Set());
    }
  }, [currentWordIndex, words.length]);

  const scrollToVocabularyWorkspace = useCallback(() => {
    document.getElementById('today-vocabulary-workspace')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  // Keyboard shortcuts: Space flips the current card; ArrowLeft/ArrowRight navigate cards.
  // handleFlip is defined in this component scope and takes a wordId parameter,
  // so we wrap it with the current word's id here.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (currentWord) handleFlip(currentWord.id);
      }
      if (e.code === 'ArrowLeft') { e.preventDefault(); handlePrevious(); }
      if (e.code === 'ArrowRight') { e.preventDefault(); handleNext(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentWord, handleFlip, handlePrevious, handleNext]);

  const missionDone = dailyMission?.tasks.filter((task) => task.done).length || 0;
  const missionTotal = dailyMission?.tasks.length || 0;
  const missionProgress = missionTotal > 0 ? Math.round((missionDone / missionTotal) * 100) : 0;

  if (words.length === 0) {
    return (
      <LearningShellFrame>
        <LearningEmptyState
          icon={Sparkles}
          eyebrow={isZh ? '今日任务' : 'Today mission'}
          title={isZh ? '先准备今天的单词' : 'Prepare today\'s words first'}
          description={
            activeBook
              ? (isZh
                ? '先生成今天的新词，再看是否需要复习。'
                : 'Generate today\'s words, then check reviews.')
              : (isZh
                ? '你还没有激活词书。先选词书或导入 deck。'
                : 'No active word book yet. Pick a word book or import a deck.')
          }
          metrics={[
            { label: isZh ? '到期复习' : 'Due reviews', value: dueWords.length, hint: isZh ? '先看有没有今天该复习的词。' : 'Check whether any words are due.' },
            { label: isZh ? '今日目标' : 'Daily target', value: activeBookSummary.dailyGoal, hint: isZh ? '控制在今天能完成的数量。' : 'Keep today small enough to finish.' },
            { label: isZh ? '目标' : 'Target', value: learningProfile.target, hint: isZh ? '任务会按这个目标排序。' : 'Tasks are ordered around this goal.' },
          ]}
          actions={
            <>
              {activeBook ? (
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" onClick={refreshDailyWords}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isZh ? '生成今日单词' : 'Generate today\'s words'}
                </Button>
              ) : (
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" asChild>
                  <Link to="/onboarding?redirect=%2Fdashboard%2Ftoday">
                    <Target className="mr-2 h-5 w-5" />
                    {isZh ? '重新设置学习目标' : 'Set learning goal again'}
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground" asChild>
                <Link to="/dashboard/chat">
                  <MessageCircleMore className="mr-2 h-5 w-5" />
                  {isZh ? '打开答疑' : 'Open help'}
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
  const primaryMissionTask = dailyCoachPlan?.primaryTask ?? missionCard?.primaryAction ?? null;
  const primaryMissionLabel = primaryMissionTask
    ? (language.startsWith('zh') ? primaryMissionTask.ctaZh : primaryMissionTask.cta)
    : (language.startsWith('zh') ? '继续今日任务' : 'Continue today');
  const secondaryMissionTasks = (dailyCoachPlan?.secondaryTasks ?? missionCard?.secondaryActions ?? [])
    .filter((action) => action.id !== primaryMissionTask?.id && action.href !== primaryMissionTask?.href)
    .slice(0, 2);
  const primaryMissionAction = primaryMissionTask?.surface === 'today'
    ? {
        label: primaryMissionLabel,
        onClick: scrollToVocabularyWorkspace,
        testId: 'today-primary-mission-cta',
      }
    : {
        label: primaryMissionLabel,
        href: primaryMissionTask?.href || '/dashboard/today',
        testId: 'today-primary-mission-cta',
      };
  const isPlanLoading = learningOverviewQuery.isLoading && !dailyCoachPlan;
  const heroTitle = dailyCoachPlan
    ? (language.startsWith('zh') ? dailyCoachPlan.briefTitle.zh : dailyCoachPlan.briefTitle.en)
    : (language.startsWith('zh') ? missionCard?.headlineZh : missionCard?.headline)
      || (isPlanLoading
        ? (language.startsWith('zh') ? '正在读取今日任务' : 'Loading today\'s tasks')
        : (language.startsWith('zh') ? '先完成一个小任务' : 'Start with one small task'));
  const heroDescription = dailyCoachPlan
    ? (language.startsWith('zh') ? dailyCoachPlan.brief.zh : dailyCoachPlan.brief.en)
    : (language.startsWith('zh') ? missionCard?.supportZh : missionCard?.support)
      || (isPlanLoading
        ? (language.startsWith('zh')
          ? '正在读取词书、到期复习和最近错题。'
          : 'Reading your word book, due reviews, and recent mistakes.')
        : undefined);
  const heroEstimatedMinutes = primaryMissionTask?.estimatedMinutes || missionCard?.estimatedMinutes || learningProfile.dailyMinutes;

  return (
    <LearningCockpitShell
      language={language}
      eyebrow={`${language.startsWith('zh') ? '今日任务' : 'Today mission'} · ${new Date().toLocaleDateString(language.startsWith('zh') ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' })}`}
      progress={missionProgress}
      progressLabel={language.startsWith('zh') ? '任务进度' : 'Mission progress'}
      mission={{
        title: heroTitle,
        description: heroDescription,
        estimatedMinutes: heroEstimatedMinutes,
        primaryAction: primaryMissionAction,
        secondaryActions: secondaryMissionTasks.map((action) => ({
          label: language.startsWith('zh') ? action.ctaZh : action.cta,
          href: action.href,
          variant: 'outline' as const,
          testId: `today-secondary-mission-${action.id}`,
        })),
        why: {
          reason: primaryMissionTask?.reason,
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
          value: `${heroEstimatedMinutes} min`,
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

      {dailyCoachPlan ? (
        <div
          data-testid="today-primary-evidence"
          className="flex flex-wrap gap-2"
          aria-label={isZh ? '今日主任务证据' : 'Today primary mission evidence'}
        >
          {dailyCoachPlan.evidence.slice(0, 5).map((item) => (
            <span
              key={item.id}
              className={cn(
                'rounded-md border px-2.5 py-1 text-[11px] font-medium',
                getDailyCoachEvidenceToneClass(item.tone),
              )}
            >
              {isZh ? item.label.zh : item.label.en}: {isZh ? (item.valueZh ?? item.value) : item.value}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div id="today-vocabulary-workspace" data-testid="today-vocabulary-workspace">
            <LearningWorkspaceSurface
              eyebrow={isZh ? '今日单词' : 'Today words'}
              title={currentWord ? `${currentWord.word} · 当前单词` : 'Vocabulary workspace'}
            >
            <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
              <div className="space-y-4">
                <section className={cn(learningFrameClassName, 'p-4')}>
                  <p className="text-xs text-muted-foreground">今日进度</p>
                  <div className="mt-4 flex items-center gap-5">
                    <CircularProgress
                      value={progress}
                      label="词汇完成度"
                      sublabel={`${learnedWords.size} / ${words.length}`}
                    />
                    <div className="space-y-1">
                      <p className="text-3xl font-semibold text-[hsl(var(--accent-practice))]">
                        {learnedWords.size}
                        <span className="mx-2 text-muted-foreground">/</span>
                        <span className="text-foreground">{words.length}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">今日已学 / 今日计划</p>
                    </div>
                  </div>
                </section>

                <section className={cn(learningFrameClassName, 'p-4')}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock3 className="h-4 w-4 text-[hsl(var(--accent-practice))]" />
                      <p className="text-sm font-medium">还需 {Math.max(3, (words.length - learnedWords.size) * 2)} 分钟</p>
                    </div>
                  </div>
                </section>

                <LearningMetricStrip
                  items={[
                    { label: isZh ? '已学会' : 'Learned', value: learnedWords.size, accent: 'emerald' },
                    { label: isZh ? '较难' : 'Hard', value: hardWords.size, accent: 'warm' },
                    { label: isZh ? '已收藏' : 'Saved', value: bookmarkedWords.size },
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

                <div className="premium-action-bar flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
                  <TodayWordNavigation
                    words={words}
                    currentWordIndex={currentWordIndex}
                    learnedWordIds={learnedWords}
                    hardWordIds={hardWords}
                    isZh={isZh}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSelectWord={(index) => {
                      setCurrentWordIndex(index);
                      setFlippedCards(new Set());
                    }}
                  />

                  <LearningActionCluster className="sm:justify-end">
                    <Button
                      variant="outline"
                      className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                      onClick={handleBookmark}
                      disabled={!currentWord}
                    >
                      <Bookmark className={cn('mr-2 h-4 w-4', bookmarkedWords.has(currentWord?.id || '') && 'fill-current')} />
                      收藏
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
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
          </div>

          {learnedWords.size === words.length && words.length > 0 ? (
            <LearningCompletionState
              icon={Check}
              eyebrow={isZh ? '今日完成' : 'Today complete'}
              title="今天的新词任务已完成"
              description={`今天的 ${words.length} 个单词已经完成。`}
              metrics={[
                { label: isZh ? '已学词数' : 'Words completed', value: words.length, accent: 'emerald' },
                { label: isZh ? '较难词' : 'Hard words', value: hardWords.size, accent: 'warm' },
                { label: isZh ? '任务完成度' : 'Mission progress', value: `${missionProgress}%` },
              ]}
              actions={
                <>
                  <Button variant="outline" className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground" asChild>
                    <Link to="/dashboard/review">去做复习</Link>
                  </Button>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" asChild>
                    <Link to="/dashboard/practice">做一次短练习</Link>
                  </Button>
                </>
              }
            />
          ) : null}
        </div>

        <div className="space-y-6">
          {dailyCoachPlan?.dictionaryFocus && lexicalFocus ? (
            <LearningRailSection title={isZh ? '词典焦点' : 'Lexicon focus'}>
              <div className="premium-panel-soft rounded-lg border border-[hsl(var(--accent-practice)/0.25)] bg-[hsl(var(--accent-practice)/0.08)] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {isZh ? '今日词汇知识点' : 'Today lexical signal'}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">
                      {dailyCoachPlan.dictionaryFocus.headword}
                    </h3>
                  </div>
                  <Badge variant="outline" className="rounded-md bg-background/60">
                    {dailyCoachPlan.dictionaryFocus.cefrLevel}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {buildLexicalSummary(lexicalFocus, language)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-md">
                    {dailyCoachPlan.dictionaryFocus.topic}
                  </Badge>
                  <Badge variant="secondary" className="rounded-md">
                    IELTS {dailyCoachPlan.dictionaryFocus.ieltsRelevance}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="mt-4 rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground" asChild>
                  <Link to={`/dashboard/vocabulary?q=${encodeURIComponent(dailyCoachPlan.dictionaryFocus.headword)}`}>
                    {isZh ? '打开词典条目' : 'Open lexicon entry'}
                  </Link>
                </Button>
              </div>
            </LearningRailSection>
          ) : null}

          <LearningRailSection title={isZh ? '学习背景' : 'Learning context'}>
            <div className="space-y-3">
              <div className="premium-panel-soft rounded-lg border border-border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">当前词书</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{activeBook?.name || '未选择词书'}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">今日词量 {words.length} / {activeBookSummary.dailyGoal}</p>
              </div>

              {activePathNextLesson ? (
                <div className="premium-panel-soft rounded-lg border border-primary/20 bg-primary/5 p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">{isZh ? '学习路径' : 'Learning path'}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {isZh ? activePathNextLesson.lesson.titleZh : activePathNextLesson.lesson.title}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {isZh ? activePathNextLesson.target.labelZh : activePathNextLesson.target.label}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 rounded-md" asChild>
                    <Link to={activePathNextLesson.target.href}>
                      {isZh ? '打开具体任务' : 'Open exact task'}
                    </Link>
                  </Button>
                </div>
              ) : null}

              <div className="premium-panel-soft rounded-lg border border-border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">到期复习</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{dueWords.length} 个到期复习</p>
                {activeBookSummary.isNearlyCompleted ? <p className="mt-2 text-sm text-muted-foreground">当前词书接近完成</p> : null}
              </div>

              {learnerModel ? (() => {
                const modeInfo = MODE_LABELS[learnerModel.mode];
                return (
                  <div className={cn(
                    'premium-panel-soft rounded-lg border p-4 space-y-3',
                    learnerModel.mode === 'recovery'    && 'border-red-500/20 bg-red-500/[0.06]',
                    learnerModel.mode === 'maintenance' && 'border-amber-500/20 bg-amber-500/[0.06]',
                    learnerModel.mode === 'steady'      && 'border-primary/20 bg-primary/10',
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
                      <span className="text-[10px] text-muted-foreground">
                        {modeInfo.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs leading-5 text-muted-foreground">
                      {MODE_DESCRIPTIONS[learnerModel.mode]}
                    </p>

                    {/* Daily targets */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">新词</p>
                        <p className="mt-0.5 text-base font-bold text-foreground">
                          {learnerModel.recommendedDailyNew}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">复习</p>
                        <p className="mt-0.5 text-base font-bold text-foreground">
                          {learnerModel.recommendedDailyReview}
                        </p>
                      </div>
                    </div>

                    {/* Avg retrievability bar */}
                    {learnerModel.avgRetrievability > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] text-muted-foreground">记忆保留率</p>
                          <p className="text-xs font-semibold text-foreground">
                            {Math.round(learnerModel.avgRetrievability * 100)}%
                          </p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-700',
                              learnerModel.avgRetrievability >= 0.75 ? 'bg-[hsl(var(--accent-practice))]' :
                              learnerModel.avgRetrievability >= 0.5  ? 'bg-amber-500' : 'bg-destructive',
                            )}
                            style={{ width: `${Math.round(learnerModel.avgRetrievability * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Weak topics */}
                    {learnerModel.weakTopics.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">需加强</p>
                        <div className="flex flex-wrap gap-1.5">
                          {learnerModel.weakTopics.map((t) => (
                            <span key={t} className="rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {learnerModel.stubbornWordCount > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">强化路径</p>
                        <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              顽固词 {learnerModel.stubbornWordCount} 个
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {learnerModel.stubbornTopics.length > 0
                                ? `集中在 ${learnerModel.stubbornTopics.join(' / ')}`
                                : '这些词会被安排进更短的强化复习回路。'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="rounded-md">
                            Reinforce
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : null}

              {adaptiveDifficulty ? (
                <div className="premium-panel-soft rounded-lg border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">{isZh ? '今日难度' : 'Today difficulty'}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-foreground">{adaptiveDifficulty.labelZh}</p>
                    <Badge variant="secondary" className="rounded-md">
                      {adaptiveDifficulty.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{adaptiveDifficulty.reason}</p>
                </div>
              ) : null}
            </div>
          </LearningRailSection>

          <LearningRailSection title={isZh ? '问题记录' : 'Practice notes'}>
            <div className="space-y-3">
              {weaknesses.length > 0 ? (
                weaknesses.map((weakness) => (
                  <div key={weakness.tag} className="premium-panel-soft rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{weakness.titleZh}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{weakness.title}</p>
                      </div>
                      <span
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-medium',
                          weakness.emphasis === 'urgent'
                            ? 'bg-destructive/10 text-destructive'
                            : weakness.emphasis === 'watch'
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {weakness.count} 次
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border px-4 py-5 text-sm leading-6 text-muted-foreground">
                  先完成一次练习或写作反馈，这里会显示需要多练的地方。
                </div>
              )}

              {recommendedUnit ? (
                <div className="premium-panel-soft rounded-lg border border-border bg-[hsl(var(--accent-practice)/0.08)] p-4">
                  <div className="flex items-center gap-2 text-[hsl(var(--accent-practice))]">
                    <Target className="h-4 w-4" />
                    <p className="text-sm font-semibold">推荐补强微课：{recommendedUnit.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{recommendedUnit.estimatedMinutes} 分钟</p>
                  <Button variant="outline" size="sm" className="mt-3 rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground" asChild>
                    <Link to="/dashboard/exam">去补强</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </LearningRailSection>

          {activityPoints.length > 0 ? (
            <LearningRailSection title={isZh ? '7日活跃度' : '7-day spark'}>
              <div className="flex items-end gap-2">
                {activityPoints.map((point) => {
                  const barHeight = Math.max(22, Math.min(88, point.words * 6 + point.xp * 0.35));
                  return (
                    <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={cn(
                          'w-full rounded-md transition-colors',
                          point.active ? 'bg-[hsl(var(--accent-practice))]' : 'bg-muted',
                        )}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[11px] text-muted-foreground">{point.label}</span>
                    </div>
                  );
                })}
              </div>
              {learningOverviewQuery.isLoading ? <TrendingUp className="h-4 w-4 text-[hsl(var(--accent-practice))]" /> : null}
            </LearningRailSection>
          ) : null}
        </div>
      </div>

    </LearningCockpitShell>
  );
}

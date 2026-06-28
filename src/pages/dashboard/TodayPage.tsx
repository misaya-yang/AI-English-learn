import { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  InlineStudyNote,
  StudyRail,
  StudyRailSection,
  StudySheet,
  StudyShell,
  StudyStatRows,
  StudyTaskList,
} from '@/features/learning/components/StudyWorkbook';
import {
  ClipboardList,
  Volume2,
  Check,
  Brain,
  CalendarDays,
  Bookmark,
  Share2,
  Target,
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
} from '@/services/learnerModel';
import { applyLearnerControls } from '@/services/learnerControls';
import {
  loadTodayFlags,
  markTodayWordHard,
  toggleTodayBookmark,
  type DayKey,
} from '@/services/todayWorkbenchPersistence';
import { createEvidenceEvent, recordEvidence } from '@/services/evidenceEvents';
import { buildDailyCoachPlan } from '@/features/learning/dailyCoachPlan';
import { buildLexicalSummary, toLexicalEntry } from '@/features/lexicon/lexicalEntry';
import { getActiveLearningPathNextLesson } from '@/features/learning/learningPathRouting';
import { getExamUnitTitle } from '@/features/exam/examDisplayCopy';
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
  isZh: boolean;
}

function WordWorkbench({ word, isFlipped, onFlip, onMarkStatus, isLearned, isHard, isZh }: WordWorkbenchProps) {
  const usesCompactHeadword = word.word.length > 18 || word.word.includes(' ');

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  return (
    <section className="study-sheet word-entry">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-muted/45 px-2.5 py-1 text-xs text-muted-foreground">
            {word.level}
          </span>
          {isLearned ? <span className="rounded-md bg-[hsl(var(--success)/0.1)] px-2.5 py-1 text-xs text-[hsl(var(--success))]">{isZh ? '已学会' : 'Learned'}</span> : null}
          {isHard ? <span className="rounded-md bg-[hsl(var(--warning)/0.12)] px-2.5 py-1 text-xs text-[hsl(var(--warning))]">{isZh ? '较难' : 'Marked hard'}</span> : null}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="glass-icon-button h-11 min-h-11 w-11 min-w-11 rounded-lg text-foreground hover:text-foreground sm:h-9 sm:min-h-9 sm:w-9 sm:min-w-9"
          onClick={() => playAudio(word.word)}
          aria-label={`Play ${word.word}`}
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      </div>

      <div>
        <p className="study-label">{isZh ? '单词' : 'Word'}</p>
        <h2 className={cn('word-entry-headword mt-3 text-foreground', usesCompactHeadword && 'word-entry-headword-compact')}>
          {word.word}
        </h2>
        <p className="mt-3 font-mono text-sm text-muted-foreground">{word.partOfSpeech} / {word.phonetic}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.45fr)]">
        <div className="space-y-4">
          <div className="pt-2">
            <p className="study-label">{isZh ? '释义' : 'Meaning'}</p>
            <p className="mt-2 text-lg leading-8 text-foreground">{word.definition}</p>
            {isZh ? <p className="mt-2 text-base leading-8 text-muted-foreground">{word.definitionZh}</p> : null}
          </div>

          {word.examples[0] ? (
            <div className="pt-2">
              <p className="study-label">{isZh ? '例句' : 'Example'}</p>
              <p className="mt-2 lexical-type text-xl leading-8 text-foreground">{word.examples[0].en}</p>
              {isZh ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.examples[0].zh}</p> : null}
              {isFlipped ? (
                <div className="mt-3 space-y-3">
                  {word.examples.slice(1, 3).map((example, index) => (
                    <div key={`${example.en}-${index}`} className="rounded-lg bg-[hsl(var(--paper-muted)/0.34)] px-3 py-2">
                      <p className="text-sm leading-7 text-foreground">{example.en}</p>
                      {isZh ? <p className="mt-1 text-sm leading-7 text-muted-foreground">{example.zh}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-xl bg-[hsl(var(--paper-muted)/0.28)] p-4 lg:p-5">
          {word.collocations.length > 0 ? (
            <div>
              <p className="study-label">{isZh ? '搭配' : 'Collocations'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {word.collocations.slice(0, isFlipped ? 8 : 4).map((collocation) => (
                  <span key={collocation} className="rounded-md bg-[hsl(var(--accent-practice)/0.08)] px-3 py-1 text-sm text-[hsl(var(--accent-practice))]">
                    {collocation}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {(word.memoryTip || word.etymology) && isFlipped ? (
            <InlineStudyNote title={isZh ? '助记' : 'Memory hint'} tone="practice">
              {word.memoryTip || word.etymology}
            </InlineStudyNote>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" className="rounded-md bg-transparent text-foreground hover:bg-muted" onClick={onFlip}>
          {isFlipped ? (isZh ? '收起例句' : 'Hide examples') : (isZh ? '看例句' : 'Show examples')}
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="rounded-md bg-transparent text-foreground hover:bg-muted" onClick={() => onMarkStatus('hard')} disabled={isHard}>
            <Brain className="mr-2 h-4 w-4" />
            {isHard ? (isZh ? '已标较难' : 'Marked hard') : (isZh ? '标为较难' : 'Mark hard')}
          </Button>
          <Button className="rounded-md px-4" onClick={() => onMarkStatus('learned')} disabled={isLearned}>
            <Check className="mr-2 h-4 w-4" />
            {isLearned ? (isZh ? '已完成' : 'Done') : (isZh ? '完成' : 'Complete')}
          </Button>
        </div>
      </div>
    </section>
  );
}

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

const StreakStatus = memo(function StreakStatus({ days }: { days: number }) {
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');

  if (days <= 0) return null;
  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-md bg-muted/40 px-3 py-1 text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <CalendarDays className="h-4 w-4" />
      <span className="text-xs font-medium">
        {isZh ? `连续 ${days} 天` : `${days}-day streak`}
      </span>
    </motion.div>
  );
});

// Animated daily progress counter
const XPCounter = memo(function XPCounter({ value }: { value: number }) {
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');

  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-md bg-[hsl(var(--accent-practice)/0.08)] px-3 py-1"
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
        {isZh ? `今日积分 +${value}` : `Today +${value}`}
      </motion.span>
    </motion.div>
  );
});

const TOPIC_LABELS: Record<string, { en: string; zh: string }> = {
  daily: { en: 'Daily', zh: '日常' },
  business: { en: 'Business', zh: '商务' },
  academic: { en: 'Academic', zh: '学术' },
  science: { en: 'Science', zh: '科学' },
  technology: { en: 'Technology', zh: '科技' },
  travel: { en: 'Travel', zh: '旅行' },
  nature: { en: 'Nature', zh: '自然' },
  history: { en: 'History', zh: '历史' },
  math: { en: 'Math', zh: '数学' },
  general: { en: 'General', zh: '综合' },
  'IELTS general': { en: 'IELTS General', zh: 'IELTS 综合' },
};

const formatTopicLabel = (topic: string, isZh: boolean): string => {
  const label = TOPIC_LABELS[topic];
  return label ? (isZh ? label.zh : label.en) : topic;
};

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
        toast.info(isZh ? '这个单词已经标记为已学会' : 'This word is already marked as learned.');
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

      toast.success(isZh ? `已学会 "${currentWord.word}"` : `Marked "${currentWord.word}" as learned`, {
        icon: <Check className="h-4 w-4 text-muted-foreground" />,
      });
    } else {
      if (hardWords.has(currentWord.id)) {
        toast.info(isZh ? '这个单词已经标记为较难' : 'This word is already marked as hard for today.');
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
      toast.info(isZh
        ? `已标记 "${currentWord.word}" 为较难；复习排程会在 Review 中评分后更新`
        : `Marked "${currentWord.word}" as hard for today. Review scheduling updates after you rate it in Review.`,
      {
        icon: <Brain className="h-4 w-4 text-[hsl(var(--warning))]" />,
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
      toast.info(isZh ? `已取消收藏 "${currentWord.word}"` : `Removed bookmark for "${currentWord.word}"`);
    } else {
      toast.success(isZh ? `已收藏 "${currentWord.word}"` : `Bookmarked "${currentWord.word}"`);
    }
  };

  const handleShare = async () => {
    if (!currentWord) return;

    const shareText = isZh
      ? `我正在学习单词 "${currentWord.word}" - ${currentWord.definitionZh}`
      : `I am studying "${currentWord.word}" - ${currentWord.definition}`;

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
    toast.success(isZh ? '已复制到剪贴板' : 'Copied to clipboard');
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
      <StudyShell>
        <StudySheet
          eyebrow={isZh ? '今日' : 'Today'}
          title={isZh ? '准备单词' : 'Prepare words'}
          description={activeBook ? (isZh ? '先生成今天的词。' : 'Prepare today\'s words first.') : (isZh ? '先选择词书。' : 'Pick a word book first.')}
          actions={
            <>
              {activeBook ? (
                <Button size="lg" className="rounded-md" onClick={refreshDailyWords}>
                  <ClipboardList className="mr-2 h-5 w-5" />
                  {isZh ? '准备单词' : 'Prepare words'}
                </Button>
              ) : (
                <Button size="lg" className="rounded-md" asChild>
                  <Link to="/onboarding?redirect=%2Fdashboard%2Ftoday">
                    <Target className="mr-2 h-5 w-5" />
                    {isZh ? '调整学习设置' : 'Change setup'}
                  </Link>
                </Button>
              )}
            </>
          }
        >
          <StudyTaskList
            items={[
              { label: isZh ? '复习' : 'Review', value: dueWords.length, unit: isZh ? '个' : 'due', note: isZh ? '今天到期' : 'Due today' },
              { label: isZh ? '新词' : 'New words', value: activeBookSummary.dailyGoal, unit: isZh ? '个' : 'words', note: activeBook?.name || (isZh ? '未选择词书' : 'No book selected') },
              { label: isZh ? '练习' : 'Practice', value: 1, unit: isZh ? '组' : 'set', note: learningProfile.target },
            ]}
          />
        </StudySheet>
      </StudyShell>
    );
  }

  const todayXP = learnedWords.size * 5;

  const primaryMissionTask = dailyCoachPlan?.primaryTask ?? missionCard?.primaryAction ?? null;
  const remainingWords = Math.max(words.length - learnedWords.size, 0);
  const heroEstimatedMinutes = primaryMissionTask?.estimatedMinutes || missionCard?.estimatedMinutes || learningProfile.dailyMinutes;
  const todayPrimaryLabel = dueWords.length > 0
    ? (isZh ? '开始复习' : 'Review')
    : remainingWords > 0
      ? (isZh ? '开始新词' : 'Start words')
      : (isZh ? '开始练习' : 'Practice');
  const todayPrimaryHref = dueWords.length > 0
    ? '/dashboard/review'
    : remainingWords > 0
      ? null
      : '/dashboard/practice';
  const todayPlanRows = [
    {
      label: isZh ? '复习' : 'Review',
      value: dueWords.length,
      unit: isZh ? '个' : 'due',
      note: dueWords.length > 0 ? (isZh ? '今天到期' : 'Due today') : (isZh ? '暂无到期' : 'None due'),
      href: '/dashboard/review',
    },
    {
      label: isZh ? '新词' : 'New words',
      value: remainingWords,
      unit: isZh ? '个' : 'left',
      note: `${learnedWords.size} / ${words.length}`,
      onClick: scrollToVocabularyWorkspace,
    },
    {
      label: isZh ? '练习' : 'Practice',
      value: 1,
      unit: isZh ? '组' : 'set',
      note: isZh ? '词义、听写或写作' : 'Meaning, dictation, or writing',
      href: '/dashboard/practice',
    },
  ];

  return (
    <StudyShell>
      <ConfettiCelebration active={showConfetti} />

      <StudySheet
        eyebrow={new Date().toLocaleDateString(language.startsWith('zh') ? 'zh-CN' : 'en-US', {
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })}
        title={isZh ? '今天' : 'Today'}
        description={isZh ? `预计 ${heroEstimatedMinutes} 分钟` : `About ${heroEstimatedMinutes} min`}
        actions={todayPrimaryHref ? (
          <Button className="min-h-11 rounded-lg px-5" asChild data-testid="today-primary-mission-cta">
            <Link to={todayPrimaryHref}>{todayPrimaryLabel}</Link>
          </Button>
        ) : (
          <Button className="min-h-11 rounded-lg px-5" onClick={scrollToVocabularyWorkspace} data-testid="today-primary-mission-cta">
            {todayPrimaryLabel}
          </Button>
        )}
      >
        <StudyTaskList
          items={todayPlanRows.map((row) => ({
            label: row.label,
            value: row.value,
            unit: row.unit,
            note: row.note,
            action: row.href ? (
              <Button variant="outline" size="sm" className="min-h-11 rounded-lg bg-transparent px-4" asChild>
                <Link to={row.href}>{isZh ? '开始' : 'Open'}</Link>
              </Button>
            ) : row.onClick ? (
              <Button variant="outline" size="sm" className="min-h-11 rounded-lg bg-transparent px-4" onClick={row.onClick}>
                {isZh ? '开始' : 'Open'}
              </Button>
            ) : null,
          }))}
        />
      </StudySheet>

      <div className="flex items-center gap-3 flex-wrap">
        <StreakStatus days={currentStreak} />
        {todayXP > 0 && <XPCounter value={todayXP} />}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <div id="today-vocabulary-workspace" data-testid="today-vocabulary-workspace">
            <div className="space-y-4">
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
                        isZh={isZh}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <StudySheet className="p-4 sm:p-4">
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

                  <div className="mt-4 flex flex-col gap-2 rounded-lg bg-[hsl(var(--paper-muted)/0.34)] p-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      className="rounded-md bg-transparent text-foreground hover:bg-muted hover:text-foreground"
                      onClick={handleBookmark}
                      disabled={!currentWord}
                    >
                      <Bookmark className={cn('mr-2 h-4 w-4', bookmarkedWords.has(currentWord?.id || '') && 'fill-current')} />
                      {isZh ? '收藏' : 'Bookmark'}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-md bg-transparent text-foreground hover:bg-muted hover:text-foreground"
                      onClick={handleShare}
                      disabled={!currentWord}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {isZh ? '分享' : 'Share'}
                    </Button>
                  </div>
                </StudySheet>
            </div>
          </div>

          {learnedWords.size === words.length && words.length > 0 ? (
            <StudySheet
              title={isZh ? '今日完成' : 'Done today'}
              description={isZh ? `${words.length} 个新词已完成。` : `${words.length} words completed.`}
              actions={
                <>
                  <Button variant="outline" className="rounded-md bg-transparent text-foreground hover:bg-muted hover:text-foreground" asChild>
                    <Link to="/dashboard/review">{isZh ? '去复习' : 'Review'}</Link>
                  </Button>
                  <Button className="rounded-md" asChild>
                    <Link to="/dashboard/practice">{isZh ? '去练习' : 'Practice'}</Link>
                  </Button>
                </>
              }
            >
              <StudyStatRows
                items={[
                  { label: isZh ? '已完成' : 'Completed', value: words.length, tone: 'success' },
                  { label: isZh ? '需复习' : 'Review', value: hardWords.size, tone: hardWords.size > 0 ? 'warning' : 'default' },
                  { label: isZh ? '进度' : 'Progress', value: `${missionProgress}%`, tone: 'practice' },
                ]}
              />
            </StudySheet>
          ) : null}
        </div>

        <StudyRail>
          {dailyCoachPlan?.dictionaryFocus && lexicalFocus ? (
            <StudyRailSection title={isZh ? '当前词' : 'Current word'}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="lexical-type text-2xl font-semibold text-foreground">
                      {dailyCoachPlan.dictionaryFocus.headword}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{dailyCoachPlan.dictionaryFocus.cefrLevel}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-md bg-transparent" asChild>
                    <Link to={`/dashboard/vocabulary?q=${encodeURIComponent(dailyCoachPlan.dictionaryFocus.headword)}`}>
                      {isZh ? '词条' : 'Entry'}
                    </Link>
                  </Button>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {buildLexicalSummary(lexicalFocus, language)}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{formatTopicLabel(dailyCoachPlan.dictionaryFocus.topic, isZh)}</span>
                  <span>IELTS {formatTopicLabel(dailyCoachPlan.dictionaryFocus.ieltsRelevance, isZh)}</span>
                </div>
              </div>
            </StudyRailSection>
          ) : null}

          <StudyRailSection title={isZh ? '今天' : 'Today'}>
            <StudyStatRows
              items={[
                { label: isZh ? '连续' : 'Streak', value: `${currentStreak} ${isZh ? '天' : 'd'}` },
                { label: isZh ? '新词' : 'Words', value: `${learnedWords.size} / ${words.length}`, tone: 'practice' },
                { label: isZh ? '进度' : 'Progress', value: `${Math.round(progress)}%`, tone: 'practice' },
                { label: isZh ? '到期' : 'Due', value: dueWords.length, tone: dueWords.length > 0 ? 'warning' : 'default' },
              ]}
            />
          </StudyRailSection>

          <StudyRailSection title={isZh ? '词书' : 'Book'}>
            <p className="text-sm font-semibold text-foreground">{activeBook?.name || (isZh ? '未选择词书' : 'No book selected')}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isZh ? `每日 ${activeBookSummary.dailyGoal} 个新词` : `${activeBookSummary.dailyGoal} new words per day`}
            </p>
            {activeBookSummary.isNearlyCompleted ? (
              <InlineStudyNote className="mt-3" title={isZh ? '快完成了' : 'Almost done'} tone="success">
                {isZh ? '当前词书接近完成。' : 'This book is almost finished.'}
              </InlineStudyNote>
            ) : null}
          </StudyRailSection>

          {(activePathNextLesson || recommendedUnit) ? (
            <StudyRailSection title={isZh ? '下一步' : 'Next'}>
              <div className="space-y-3">
                {activePathNextLesson ? (
                  <div className="rounded-lg bg-[hsl(var(--paper-muted)/0.36)] px-3 py-3">
                    <p className="text-sm font-semibold text-foreground">
                      {isZh ? activePathNextLesson.lesson.titleZh : activePathNextLesson.lesson.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {isZh ? activePathNextLesson.target.labelZh : activePathNextLesson.target.label}
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 rounded-md bg-transparent" asChild>
                      <Link to={activePathNextLesson.target.href}>{isZh ? '打开' : 'Open'}</Link>
                    </Button>
                  </div>
                ) : null}

                {recommendedUnit ? (
                  <div className="rounded-lg bg-[hsl(var(--paper-muted)/0.36)] px-3 py-3">
                    <div className="flex items-start gap-2">
                      <Target className="mt-0.5 h-4 w-4 text-[hsl(var(--accent-practice))]" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {isZh ? getExamUnitTitle(recommendedUnit) : recommendedUnit.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{recommendedUnit.estimatedMinutes} {isZh ? '分钟' : 'min'}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 rounded-md bg-transparent" asChild>
                      <Link to="/dashboard/exam">{isZh ? '打开' : 'Open'}</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </StudyRailSection>
          ) : null}

          <StudyRailSection title={isZh ? '需要多练' : 'Needs practice'}>
            <div className="space-y-2">
              {weaknesses.length > 0 ? (
                weaknesses.slice(0, 3).map((weakness) => (
                  <div key={weakness.tag} className="flex items-center justify-between gap-3 rounded-lg bg-[hsl(var(--paper-muted)/0.30)] px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{isZh ? weakness.titleZh : weakness.title}</p>
                      {isZh ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{weakness.title}</p> : null}
                    </div>
                    <span
                      className={cn(
                        'rounded-md px-2 py-1 text-xs',
                        weakness.emphasis === 'urgent'
                          ? 'bg-destructive/8 text-destructive'
                          : weakness.emphasis === 'watch'
                            ? 'bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]'
                            : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {weakness.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  {isZh ? '练过以后会出现在这里。' : 'Items appear here after practice.'}
                </p>
              )}
            </div>
          </StudyRailSection>
        </StudyRail>
      </div>

    </StudyShell>
  );
}

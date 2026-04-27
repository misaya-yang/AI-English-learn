import { useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LearningActionCluster,
  LearningCompletionState,
  LearningEmptyState,
  LearningHeroPanel,
  LearningMetricStrip,
  LearningRailSection,
  LearningShellFrame,
  LearningWorkspaceSurface,
} from '@/features/learning/components/LearningWorkspace';
import {
  HelpCircle,
  Check,
  X,
  Lightbulb,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  PenTool,
  Headphones,
  ChevronRight,
  Clock3,
  AlertTriangle,
  ThumbsUp,
  Quote,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { AiFeedback } from '@/types/examContent';
import { getContentItemsByUnit, getContentUnits, getQuotaSnapshot, saveAiFeedbackRecord, saveItemAttempt } from '@/data/examContent';
import { consumeExamFeatureQuota, createAttempt, gradeIeltsWriting } from '@/services/aiExamCoach';
import { recordLearningEvent, recordEvent } from '@/services/learningEvents';
import { speakEnglishText } from '@/services/tts';
import { addMistake } from '@/services/mistakeCollector';
import { buildPracticeMistakeRecord } from '@/services/practiceMistakes';
import { createEvidenceEvent, recordEvidence } from '@/services/evidenceEvents';
import { SessionRecapCard } from '@/features/learning/components/SessionRecapCard';
import { LearningCockpitShell } from '@/features/learning/components/LearningCockpitShell';
import { getDueCoachReviews } from '@/services/coachReviewQueue';
import { useTranslation } from 'react-i18next';
import { buildListeningQueue, buildPracticeQuestions } from '@/features/practice/runtime';

const practiceModes = [
  {
    id: 'quiz',
    name: 'Multiple Choice',
    nameZh: '选择题',
    description: 'Test your knowledge with multiple choice questions',
    icon: HelpCircle,
  },
  {
    id: 'fill_blank',
    name: 'Fill in the Blank',
    nameZh: '填空题',
    description: 'Complete sentences with the correct word',
    icon: PenTool,
  },
  {
    id: 'listening',
    name: 'Listening Quiz',
    nameZh: '听力测验',
    description: 'Listen and identify the correct word',
    icon: Headphones,
  },
  {
    id: 'writing',
    name: 'Writing Practice',
    nameZh: '写作练习',
    description: 'Write sentences and get AI feedback',
    icon: Zap,
  },
] as const;

const lightInputClass =
  'border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-primary/30';

const lightSelectContentClass = 'border-border bg-background text-foreground';

export default function PracticePage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const { dailyWords, dueWords, progress, streak, addStudySession, completeMissionTask, reviewWord } = useUserData();
  const { i18n } = useTranslation();
  const practiceLanguage = i18n.language;
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [dueCoachReviewCount, setDueCoachReviewCount] = useState(0);
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState<AiFeedback | null>(null);
  const [writingPrompt, setWritingPrompt] = useState('');
  const [writingTaskType, setWritingTaskType] = useState<'task1' | 'task2'>('task2');
  const [writingItemId, setWritingItemId] = useState('practice_ielts_manual');
  const [feedbackQuotaRemaining, setFeedbackQuotaRemaining] = useState<number | null>(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [isWritingSubmitting, setIsWritingSubmitting] = useState(false);
  const [writingRound, setWritingRound] = useState(1);
  const [previousFeedback, setPreviousFeedback] = useState<AiFeedback | null>(null);
  const [listeningInput, setListeningInput] = useState('');
  const [listeningResult, setListeningResult] = useState<{
    isCorrect: boolean;
    expected: string;
    submitted: string;
  } | null>(null);
  // Gamification state
  const [timedMode, setTimedMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answerAnim, setAnswerAnim] = useState<'correct' | 'incorrect' | null>(null);
  const [errorNotebook, setErrorNotebook] = useState<Array<{ word: string; question: string; correctAnswer: string }>>([]);

  const listeningInputRef = useRef<HTMLInputElement | null>(null);
  const quizQuestions = useMemo(
    () =>
      selectedMode === 'quiz' || selectedMode === 'fill_blank'
        ? buildPracticeQuestions(dailyWords, selectedMode, `${userId}:${selectedMode}`, { progress })
        : [],
    [dailyWords, progress, selectedMode, userId],
  );
  const listeningWords = useMemo(
    () => (selectedMode === 'listening' ? buildListeningQueue(dailyWords, `${userId}:listening`, { progress }) : []),
    [dailyWords, progress, selectedMode, userId],
  );

  const resetPracticeRuntime = () => {
    setHasStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
    setListeningInput('');
    setListeningResult(null);
    setWritingInput('');
    setWritingFeedback(null);
    setWritingRound(1);
    setPreviousFeedback(null);
    setCombo(0);
    setMaxCombo(0);
    setAnswerAnim(null);
    setTimeLeft(60);
    setErrorNotebook([]);
  };

  const applyWritingDefaults = () => {
    const writingUnits = getContentUnits({ examType: 'IELTS', skill: 'writing' });
    const firstUnit = writingUnits[0];
    const firstItem = firstUnit ? getContentItemsByUnit(firstUnit.id)[0] : null;
    if (firstItem) {
      setWritingPrompt(firstItem.prompt);
      setWritingTaskType(firstItem.itemType === 'writing_task_1' ? 'task1' : 'task2');
      setWritingItemId(firstItem.id);
      return;
    }

    setWritingPrompt(
      'Some people think governments should invest more in public transport than in building new roads. To what extent do you agree or disagree?',
    );
    setWritingTaskType('task2');
    setWritingItemId('practice_ielts_manual');
  };

  useEffect(() => {
    if (selectedMode !== 'writing') return;

    let cancelled = false;
    setIsQuotaLoading(true);
    setFeedbackQuotaRemaining(null);

    void getQuotaSnapshot(userId)
      .then((snapshot) => {
        if (cancelled) return;
        setFeedbackQuotaRemaining(snapshot.remaining.aiAdvancedFeedbackPerDay);
      })
      .catch(() => {
        if (cancelled) return;
        setFeedbackQuotaRemaining(0);
        toast.error('Failed to load quota, please retry.');
      })
      .finally(() => {
        if (cancelled) return;
        setIsQuotaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMode, userId]);

  useEffect(() => {
    if (selectedMode !== 'listening' || !hasStarted || !listeningWords[0]?.word) return;

    requestAnimationFrame(() => {
      listeningInputRef.current?.focus();
    });

    const timer = window.setTimeout(() => {
      playAudio(listeningWords[0].word);
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasStarted, listeningWords, selectedMode]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = selectedMode === 'listening' ? listeningWords.length : quizQuestions.length;
  const sessionProgress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

  // Timer for timed challenge mode
  useEffect(() => {
    if (!timedMode || !hasStarted || isComplete) return;
    if (timeLeft <= 0) {
      setIsComplete(true);
      addStudySession(totalQuestions, score, score * 10, 1);
      completeMissionTask('task_quiz_today');
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timedMode, hasStarted, isComplete, timeLeft, totalQuestions, score, addStudySession, completeMissionTask]);

  // LEARN-05 — emit session_ended + load coach review count once when the
  // practice session finishes. Must stay above any conditional return so the
  // hook order is stable across renders.
  useEffect(() => {
    if (!isComplete) return;
    void getDueCoachReviews(userId).then((items) => setDueCoachReviewCount(items.length));
    void recordEvent(userId, {
      kind: 'session_ended',
      payload: { surface: 'practice', mode: selectedMode, score, total: totalQuestions },
    });
  }, [isComplete, userId, selectedMode, score, totalQuestions]);

  const recommendedModeId = useMemo(() => {
    if (dueWords.length >= 5) return 'quiz';
    if (dailyWords.length >= 8) return 'fill_blank';
    if (dailyWords.length >= 4) return 'listening';
    return 'writing';
  }, [dailyWords.length, dueWords.length]);

  const focusedModeId = selectedMode || recommendedModeId;
  const focusedMode = practiceModes.find((mode) => mode.id === focusedModeId) || practiceModes[0];

  const modeBlueprints = useMemo(
    () => ({
      quiz: {
        label: 'Recommended for today',
        labelZh: '今日推荐',
        focus: '快速检查词义匹配与基础理解，最适合先把今天的薄弱点扫一遍。',
        estimatedQuestions: Math.min(Math.max(dailyWords.length, 5), 10),
        estimatedMinutes: 6,
        reason: dueWords.length >= 5 ? `你当前有 ${dueWords.length} 个到期复习，先用短测把最容易错的点找出来。` : '先做一次短测，最快知道今天该补哪一块。',
        insight: '适合先热身，进入成本最低。',
      },
      fill_blank: {
        label: 'Recall drill',
        labelZh: '回想训练',
        focus: '把认识单词推进到主动提取，适合巩固今天刚学过的词。',
        estimatedQuestions: Math.min(Math.max(dailyWords.length, 5), 10),
        estimatedMinutes: 8,
        reason: '如果你想从“认得”过渡到“会用”，填空是更有效的中间层。',
        insight: '更偏记忆提取和句子语境。',
      },
      listening: {
        label: 'Sound to word',
        labelZh: '听辨训练',
        focus: '强化发音到拼写的映射，适合补听感和拼写准确度。',
        estimatedQuestions: Math.min(Math.max(dailyWords.length, 4), 10),
        estimatedMinutes: 7,
        reason: dailyWords.length >= 4 ? '今天可练词量够了，适合插一轮听辨把音形对齐。' : '用短听辨把音形映射补起来。',
        insight: '适合短时间提升听感和拼写反应。',
      },
      writing: {
        label: 'Deep practice',
        labelZh: '深度输出',
        focus: '用结构化写作反馈修正逻辑、词汇和句法，是最重但最值的一轮。',
        estimatedQuestions: 1,
        estimatedMinutes: 18,
        reason: '如果你今天想拉高输出质量，写作反馈的价值最高。',
        insight: '更适合做一次完整的主动输出。',
      },
    }),
    [dailyWords.length, dueWords.length],
  );

  const focusedBlueprint = modeBlueprints[focusedModeId as keyof typeof modeBlueprints];
  const accuracyPct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const sessionStage = !selectedMode ? '先选模式' : !hasStarted ? '准备开始' : isComplete ? '本轮完成' : '进行中';

  const pickMode = (modeId: string) => {
    resetPracticeRuntime();
    if (modeId === 'writing') {
      applyWritingDefaults();
    }
    setSelectedMode(modeId);
  };

  const exitToPicker = () => {
    resetPracticeRuntime();
    setSelectedMode(null);
  };

  const startFocusedMode = () => {
    if (!selectedMode) {
      setSelectedMode(focusedModeId);
      if (focusedModeId === 'writing') {
        applyWritingDefaults();
      }
    }
    setHasStarted(true);
    void recordEvent(userId, {
      kind: 'session_started',
      payload: { surface: 'practice', mode: selectedMode || focusedModeId },
    });
  };

  const handleAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowResult(true);

    // Combo tracking
    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setAnswerAnim('correct');
      setScore((prev) => prev + 1);
      const comboBonus = newCombo >= 5 ? ' 🔥 Combo x5!' : newCombo >= 3 ? ' ⚡ Combo x3!' : '';
      toast.success(`Correct! +10 XP${comboBonus}`);
      // Bump per-word progress through FSRS so a correct answer is reflected
      // in the durable progress store, not just the session score.
      try {
        reviewWord(currentQuestion.word.id, 'good');
      } catch {
        // reviewWord guards itself; never let a sync hiccup fail the turn.
      }
    } else {
      setCombo(0);
      setAnswerAnim('incorrect');
      toast.error('Incorrect. Try again!');
      // Save to error notebook
      setErrorNotebook((prev) => [...prev, {
        word: currentQuestion.word.word,
        question: currentQuestion.question,
        correctAnswer: currentQuestion.correctAnswer,
      }]);
      // Persist into the shared mistake collector so the AI coach can pick
      // it up via getChatLearnerProfile() on the next chat turn (COACH-01)
      // and the Mistakes book stays in sync.
      const mistakeRecord = buildPracticeMistakeRecord({
        word: currentQuestion.word,
        isCorrect: false,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        mode: selectedMode || 'quiz',
      });
      if (mistakeRecord) {
        try {
          void addMistake(userId, mistakeRecord);
        } catch {
          // localStorage failure is silent — never block the user's drill.
        }
      }
      // Schedule the missed word for an earlier FSRS revisit so the next
      // review session surfaces it again.
      try {
        reviewWord(currentQuestion.word.id, 'again');
      } catch {
        // see above
      }
    }

    // Clear animation after delay
    setTimeout(() => setAnswerAnim(null), 600);

    void recordLearningEvent({
      userId,
      eventName: 'practice.quiz_submitted',
      payload: {
        mode: selectedMode || 'quiz',
        isCorrect,
        questionId: currentQuestion.id,
        word: currentQuestion.word.word,
        combo: isCorrect ? combo + 1 : 0,
      },
    });
    // Typed evidence event in addition to the analytics-style event above.
    // The two writes serve different consumers: analytics keeps its
    // historical event names, derivation reads the strict
    // `evidence.practice.*` rows.
    void recordEvidence(
      createEvidenceEvent({
        type: isCorrect ? 'practice.correct' : 'practice.incorrect',
        userId,
        wordId: currentQuestion.word.id,
        mode: selectedMode || 'quiz',
      }),
    );
    // LEARN-02 strict typed evidence — used by LearningPath progress
    // derivation. Two writes (analytics + strict) by design — see the
    // comment block in services/learningEvents.ts.
    void recordEvent(userId, {
      kind: isCorrect ? 'practice_correct' : 'practice_wrong',
      payload: { wordId: currentQuestion.word.id, word: currentQuestion.word.word, mode: selectedMode || 'quiz' },
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      return;
    }

    setIsComplete(true);
    addStudySession(quizQuestions.length, score, score * 10, 15);
    completeMissionTask('task_quiz_today');
  };

  const handleWritingSubmit = async () => {
    if (isWritingSubmitting) return;

    if (isQuotaLoading || feedbackQuotaRemaining === null) {
      toast.info('Loading quota status, please wait a moment.');
      return;
    }

    if (feedbackQuotaRemaining <= 0) {
      toast.error('Today AI writing feedback quota is exhausted. Upgrade to Pro or try tomorrow.');
      return;
    }

    if (!writingInput.trim()) {
      toast.error('Please write a sentence first');
      return;
    }

    if (!writingPrompt.trim()) {
      toast.error('Please provide an IELTS prompt first');
      return;
    }

    setIsWritingSubmitting(true);
    try {
      const quotaResult = await consumeExamFeatureQuota(userId, 'aiAdvancedFeedbackPerDay');
      if (!quotaResult.allowed) {
        setFeedbackQuotaRemaining(quotaResult.remaining);
        toast.error('Today AI writing feedback quota is exhausted. Upgrade to Pro or try tomorrow.');
        return;
      }

      const attempt = createAttempt({
        userId,
        itemId: writingItemId,
        answer: writingInput.trim(),
        skill: 'writing',
      });
      saveItemAttempt(attempt);

      const feedback = await gradeIeltsWriting({
        userId,
        attemptId: attempt.id,
        prompt: writingPrompt,
        answer: writingInput.trim(),
        taskType: writingTaskType,
      });

      saveAiFeedbackRecord(userId, feedback);
      setWritingFeedback(feedback);
      setFeedbackQuotaRemaining(quotaResult.remaining);

      const earnedXp = feedback.scores.overallBand >= 6 ? 20 : 12;
      addStudySession(1, feedback.scores.overallBand >= 6 ? 1 : 0, earnedXp, 8);
      completeMissionTask('task_review_today');

      void recordLearningEvent({
        userId,
        eventName: 'practice.writing_submitted',
        payload: {
          itemId: writingItemId,
          taskType: writingTaskType,
          overallBand: feedback.scores.overallBand,
          issues: feedback.issues.map((issue) => issue.tag),
        },
      });
      toast.success(`AI feedback ready. Overall band ${feedback.scores.overallBand}`);
    } finally {
      setIsWritingSubmitting(false);
    }
  };

  const handleRestart = () => {
    resetPracticeRuntime();
  };

  const handleRevise = () => {
    // Save current feedback as the previous round's result, then return to editing
    setPreviousFeedback(writingFeedback);
    setWritingFeedback(null);
    setWritingRound((r) => r + 1);
  };

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  const normalizeListeningAnswer = (value: string): string =>
    value
      .trim()
      .toLowerCase()
      .replace(/[“”"'.!?,:;()[\]{}]/g, '')
      .replace(/\s+/g, ' ');

  const handleListeningCheck = () => {
    const currentWord = listeningWords[currentQuestionIndex];
    if (!currentWord || !listeningInput.trim()) return;

    const isCorrect = normalizeListeningAnswer(listeningInput) === normalizeListeningAnswer(currentWord.word);
    setListeningResult({
      isCorrect,
      expected: currentWord.word,
      submitted: listeningInput.trim(),
    });

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success('Correct! +10 XP');
      try {
        reviewWord(currentWord.id, 'good');
      } catch {
        // see comment in handleAnswer
      }
    } else {
      toast.error(`Not quite. Correct answer: ${currentWord.word}`);
      const mistakeRecord = buildPracticeMistakeRecord({
        word: currentWord,
        isCorrect: false,
        userAnswer: listeningInput.trim(),
        correctAnswer: currentWord.word,
        mode: 'listening',
      });
      if (mistakeRecord) {
        try {
          void addMistake(userId, mistakeRecord);
        } catch {
          // see comment in handleAnswer
        }
      }
      try {
        reviewWord(currentWord.id, 'again');
      } catch {
        // see comment in handleAnswer
      }
    }

    void recordLearningEvent({
      userId,
      eventName: 'practice.listening_submitted',
      payload: {
        isCorrect,
        word: currentWord.word,
        answer: listeningInput.trim(),
        questionIndex: currentQuestionIndex + 1,
      },
    });
    void recordEvidence(
      createEvidenceEvent({
        type: isCorrect ? 'practice.correct' : 'practice.incorrect',
        userId,
        wordId: currentWord.id,
        mode: 'listening',
      }),
    );
    void recordEvent(userId, {
      kind: isCorrect ? 'practice_correct' : 'practice_wrong',
      payload: { wordId: currentWord.id, word: currentWord.word, mode: 'listening' },
    });
  };

  const handleListeningNext = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < listeningWords.length) {
      setCurrentQuestionIndex(nextIndex);
      setListeningInput('');
      setListeningResult(null);
      requestAnimationFrame(() => {
        listeningInputRef.current?.focus();
      });
      const nextWord = listeningWords[nextIndex];
      if (nextWord?.word) {
        playAudio(nextWord.word);
      }
      return;
    }

    setIsComplete(true);
    addStudySession(listeningWords.length, score, score * 10, 10);
    completeMissionTask('task_quiz_today');
  };

  const renderModeSelector = () => (
    <LearningRailSection title="练习模式">
      <nav className="space-y-2" aria-label="Practice modes">
        {practiceModes.map((mode) => {
          const active = focusedModeId === mode.id;
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => pickMode(mode.id)}
              className={cn(
                'group relative w-full rounded-xl border border-transparent px-4 py-3 text-left transition-all',
                active ? 'bg-muted border-border' : 'hover:border-border hover:bg-muted',
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-3 left-0 w-[3px] rounded-full transition-colors',
                  active ? 'bg-primary' : 'bg-transparent group-hover:bg-border',
                )}
              />
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border text-muted-foreground',
                    active ? 'border-border bg-[hsl(var(--accent-practice)/0.08)] text-[hsl(var(--accent-practice))]' : 'border-border bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{mode.name}</span>
                    {mode.id === recommendedModeId ? (
                      <span className="rounded-md border border-border bg-[hsl(var(--accent-practice)/0.08)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--accent-practice))]">
                        推荐
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{mode.nameZh}</span>
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </LearningRailSection>
  );

  const renderInsightRail = () => (
    <div className="space-y-6">
      <LearningRailSection title="Session">
        <LearningMetricStrip
          items={[
            { label: 'Due', value: dueWords.length, accent: dueWords.length > 0 ? 'warm' : 'default' },
            { label: 'Ready', value: dailyWords.length },
            { label: 'Streak', value: streak.current, accent: 'emerald' },
          ]}
          className="border-t-0 pt-0"
        />
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">当前模式</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{focusedMode.nameZh}</p>
          <p className="mt-1 text-sm text-muted-foreground">{focusedBlueprint.insight}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">当前阶段</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{sessionStage}</p>
        </div>
        {selectedMode === 'writing' ? (
          <div className="rounded-xl border border-border bg-[hsl(var(--accent-practice)/0.08)] p-4">
            <div className="flex items-center gap-2 text-[hsl(var(--accent-practice))]">
              <Zap className="h-4 w-4" />
              <p className="text-sm font-semibold">Advanced feedback quota</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
            </p>
          </div>
        ) : null}
      </LearningRailSection>
    </div>
  );

  const pageTitle = !selectedMode
    ? '先锁定今天最值得练的一种模式。'
    : !hasStarted
      ? `准备进入 ${focusedMode.nameZh}`
      : isComplete
        ? '这轮短练习已经完成。'
        : `${focusedMode.nameZh} 进行中`;

  const pageDescription = !selectedMode
    ? undefined
    : !hasStarted
      ? focusedBlueprint.insight
      : isComplete
        ? '看结果，再决定下一步。'
        : undefined;

  const heroProgress =
    selectedMode && hasStarted && !isComplete && selectedMode !== 'writing'
      ? Math.min(100, Math.round(sessionProgress))
      : selectedMode === 'writing' && writingFeedback
        ? 100
        : null;

  const renderPageShell = (mainContent: ReactNode) => {
    const primaryAction = !selectedMode
      ? { label: 'Review this mode', onClick: () => pickMode(focusedModeId) }
      : !hasStarted
        ? { label: 'Start practice', onClick: startFocusedMode }
        : null;
    const secondaryActions: Array<{ label: string; onClick?: () => void; href?: string; variant?: 'outline' }> = [];
    if (selectedMode && !hasStarted && (selectedMode === 'quiz' || selectedMode === 'fill_blank')) {
      secondaryActions.push({
        label: timedMode ? '⏱️ 60s 限时 ON' : '60s 限时',
        onClick: () => setTimedMode((prev) => !prev),
        variant: 'outline',
      });
    }
    if (selectedMode) {
      secondaryActions.push({
        label: 'Change mode',
        onClick: exitToPicker,
        variant: 'outline',
      });
    }

    return (
      <LearningCockpitShell
        language={practiceLanguage}
        eyebrow="练习"
        progress={heroProgress}
        progressLabel="Session progress"
        mission={{
          title: pageTitle,
          description: pageDescription,
          estimatedMinutes: !hasStarted ? focusedBlueprint.estimatedMinutes : undefined,
          primaryAction: primaryAction ?? undefined,
          secondaryActions,
        }}
        metrics={[
          { label: 'Recommended', value: focusedMode.nameZh, accent: 'emerald' },
          ...(hasStarted && timedMode ? [{ label: '⏱️ Time', value: `${timeLeft}s`, accent: timeLeft <= 10 ? 'warm' as const : undefined }] : []),
          ...(hasStarted && combo > 0 ? [{ label: '🔥 Combo', value: `${combo}x`, accent: 'emerald' as const }] : []),
          ...(!hasStarted ? [
            { label: 'Estimated', value: `${focusedBlueprint.estimatedMinutes} min` },
            { label: 'Prompts', value: focusedBlueprint.estimatedQuestions },
          ] : [
            { label: 'Score', value: `${score}/${totalQuestions}` },
          ]),
        ]}
      >
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_300px] xl:items-start">
          <div className="min-w-0">{renderModeSelector()}</div>
          <div className="min-w-0">{mainContent}</div>
          <div className="min-w-0">{renderInsightRail()}</div>
        </div>
      </LearningCockpitShell>
    );
  };

  const renderFactStrip = (items: { label: string; value: ReactNode; hint: string; accent?: 'default' | 'emerald' | 'warm' }[]) => (
    <LearningMetricStrip items={items.map((item) => ({ label: item.label, value: item.value, hint: item.hint, accent: item.accent }))} />
  );

  if (!selectedMode) {
    return renderPageShell(
      <LearningWorkspaceSurface
        eyebrow="Recommended for today"
        title={`${focusedMode.name} · ${focusedMode.nameZh}`}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-md border border-border bg-[hsl(var(--accent-practice)/0.08)] px-3 py-1 text-[hsl(var(--accent-practice))] hover:bg-[hsl(var(--accent-practice)/0.08)]">
              {focusedBlueprint.labelZh}
            </Badge>
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              {focusedBlueprint.estimatedQuestions} 题
            </Badge>
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              {focusedBlueprint.estimatedMinutes} 分钟
            </Badge>
          </div>

          {renderFactStrip([
            { label: '训练目标', value: focusedMode.description, hint: '' },
            { label: '预计时长', value: `${focusedBlueprint.estimatedMinutes} min`, hint: '', accent: 'emerald' },
            { label: '今日素材', value: `${dailyWords.length} words`, hint: '' },
          ])}

          <div className="border-t border-border pt-5">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" onClick={() => pickMode(focusedModeId)}>
              Review this mode
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </LearningWorkspaceSurface>,
    );
  }

  if (!hasStarted) {
    return renderPageShell(
      <LearningWorkspaceSurface
        eyebrow="Prepare the session"
        title={`${focusedMode.name} · ${focusedMode.nameZh}`}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-md border border-border bg-[hsl(var(--accent-practice)/0.08)] px-3 py-1 text-[hsl(var(--accent-practice))] hover:bg-[hsl(var(--accent-practice)/0.08)]">
              {focusedBlueprint.label}
            </Badge>
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              <Clock3 className="mr-1.5 h-3.5 w-3.5" />
              {focusedBlueprint.estimatedMinutes} min
            </Badge>
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              {focusedBlueprint.estimatedQuestions} prompts
            </Badge>
            {selectedMode === 'writing' ? (
              <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
                AI feedback left: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
              </Badge>
            ) : null}
          </div>

          {renderFactStrip([
            { label: '这轮会做什么', value: focusedMode.description, hint: '' },
            { label: '为什么现在做', value: focusedBlueprint.labelZh, hint: '', accent: 'emerald' },
            {
              label: '完成后得到什么',
              value: selectedMode === 'writing' ? '结构化评分' : '正确率 + 下一步建议',
              hint: '',
            },
          ])}

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
            <LearningActionCluster>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" onClick={startFocusedMode}>
                Start practice
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                onClick={exitToPicker}
              >
                Back to mode picker
              </Button>
            </LearningActionCluster>
          </div>
        </div>
      </LearningWorkspaceSurface>,
    );
  }

  if (selectedMode === 'writing') {
    return renderPageShell(
      <LearningWorkspaceSurface
        eyebrow="Writing workspace"
        title="IELTS Writing Coach"
        actions={
          <div className="flex items-center gap-2">
            {writingRound > 1 && (
              <Badge className="rounded-md border border-border bg-[hsl(var(--accent-practice)/0.08)] px-3 py-1 text-[hsl(var(--accent-practice))]">
                Round {writingRound}
              </Badge>
            )}
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              AI feedback left: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
            </Badge>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
            <div className="space-y-3">
              <Label className="text-foreground">Task Type</Label>
              <Select value={writingTaskType} onValueChange={(value: 'task1' | 'task2') => setWritingTaskType(value)}>
                <SelectTrigger className={cn('rounded-md', lightInputClass)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={lightSelectContentClass}>
                  <SelectItem value="task1" className="focus:bg-muted focus:text-foreground">Task 1</SelectItem>
                  <SelectItem value="task2" className="focus:bg-muted focus:text-foreground">Task 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">Prompt</Label>
              <Textarea
                value={writingPrompt}
                onChange={(event) => setWritingPrompt(event.target.value)}
                className={cn('min-h-[140px] rounded-xl p-4', lightInputClass)}
              />
            </div>
          </div>

          {/* Previous round summary banner shown while revising */}
          {writingRound > 1 && previousFeedback && !writingFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2"
            >
              <p className="text-xs font-semibold text-amber-600">
                第 {writingRound - 1} 轮得分 · 修改后提交
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  ['Task', previousFeedback.scores.taskResponse],
                  ['Coherence', previousFeedback.scores.coherenceCohesion],
                  ['Lexical', previousFeedback.scores.lexicalResource],
                  ['Grammar', previousFeedback.scores.grammaticalRangeAccuracy],
                  ['Overall', previousFeedback.scores.overallBand],
                ].map(([label, value]) => (
                  <span key={label as string} className="text-xs text-muted-foreground">
                    {label}: <span className="text-foreground font-medium">{(value as number).toFixed(1)}</span>
                  </span>
                ))}
              </div>
              {previousFeedback.issues.length > 0 && (
                <p className="text-xs text-muted-foreground pt-1">
                  Key issue: {previousFeedback.issues[0].message}
                </p>
              )}
            </motion.div>
          )}

          <div className="space-y-3 border-t border-border pt-5">
            <Label className="text-foreground">Your response</Label>
            <Textarea
              value={writingInput}
              onChange={(event) => setWritingInput(event.target.value)}
              placeholder="Write your IELTS response here..."
              className={cn('min-h-[300px] rounded-xl p-5 text-base leading-7', lightInputClass)}
            />
          </div>

          {!writingFeedback ? (
            <div className="flex flex-col gap-4 border-t border-border pt-5 lg:flex-row lg:items-center lg:justify-between">
              <Button
                onClick={handleWritingSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5"
                disabled={
                  isWritingSubmitting ||
                  isQuotaLoading ||
                  feedbackQuotaRemaining === null ||
                  feedbackQuotaRemaining <= 0
                }
              >
                <Zap className="mr-2 h-4 w-4" />
                {isQuotaLoading
                  ? 'Loading quota...'
                  : isWritingSubmitting
                    ? 'Generating feedback...'
                    : feedbackQuotaRemaining !== null && feedbackQuotaRemaining <= 0
                      ? 'Quota exhausted today'
                      : 'Get IELTS AI Feedback'}
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 border-t border-border pt-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  {writingRound > 1 ? `Round ${writingRound} Feedback` : 'Writing feedback'}
                </div>
                {previousFeedback && (
                  <span className="text-xs text-muted-foreground">
                    vs Round {writingRound - 1}: {previousFeedback.scores.overallBand.toFixed(1)} → {writingFeedback.scores.overallBand.toFixed(1)}
                    {writingFeedback.scores.overallBand > previousFeedback.scores.overallBand
                      ? ' ↑'
                      : writingFeedback.scores.overallBand < previousFeedback.scores.overallBand
                        ? ' ↓'
                        : ' ='}
                  </span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                {(
                  [
                    ['Task', writingFeedback.scores.taskResponse, previousFeedback?.scores.taskResponse],
                    ['Coherence', writingFeedback.scores.coherenceCohesion, previousFeedback?.scores.coherenceCohesion],
                    ['Lexical', writingFeedback.scores.lexicalResource, previousFeedback?.scores.lexicalResource],
                    ['Grammar', writingFeedback.scores.grammaticalRangeAccuracy, previousFeedback?.scores.grammaticalRangeAccuracy],
                    ['Overall', writingFeedback.scores.overallBand, previousFeedback?.scores.overallBand],
                  ] as [string, number, number | undefined][]
                ).map(([label, value, prevValue], index) => {
                  const delta = prevValue !== undefined ? value - prevValue : 0;
                  return (
                  <div
                    key={label}
                    className={cn(
                      'rounded-xl border border-border bg-card p-4',
                      index === 4 && 'border-border bg-[hsl(var(--accent-practice)/0.08)] text-[hsl(var(--accent-practice))]',
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-3 text-2xl font-semibold">{value.toFixed(1)}</p>
                    {prevValue !== undefined && delta !== 0 && (
                      <p className={cn('text-[11px] mt-1', delta > 0 ? 'text-green-600' : 'text-destructive')}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </p>
                    )}
                  </div>
                  );
                })}
              </div>

              {/* ── Summary ───────────────────────────────────────────── */}
              {writingFeedback.summary && (
                <div className="rounded-xl border border-border bg-card p-4 flex gap-3">
                  <Quote className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                  <div>
                    <p className="text-sm leading-6 text-foreground">{writingFeedback.summary}</p>
                    {writingFeedback.summaryZh && (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{writingFeedback.summaryZh}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Strengths ──────────────────────────────────────────── */}
              {writingFeedback.strengths && writingFeedback.strengths.length > 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      优点
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {writingFeedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Issues ─────────────────────────────────────────────── */}
              <div className="space-y-3">
                {writingFeedback.issues.map((issue, index) => {
                  const severityColor =
                    issue.severity === 'high'
                      ? 'border-destructive/20 bg-destructive/5'
                      : issue.severity === 'medium'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-border bg-card';
                  const tagColors: Record<string, string> = {
                    grammar:       'bg-destructive/10 text-destructive',
                    lexical:       'bg-violet-500/10 text-violet-600',
                    coherence:     'bg-blue-500/10 text-blue-600',
                    task_response: 'bg-amber-500/10 text-amber-600',
                    collocation:   'bg-pink-500/10 text-pink-600',
                    tense:         'bg-orange-500/10 text-orange-600',
                    logic:         'bg-cyan-500/10 text-cyan-600',
                    word_count:    'bg-yellow-500/10 text-yellow-600',
                  };
                  return (
                    <div
                      key={`${issue.tag}-${index}`}
                      className={cn('rounded-xl border p-4 space-y-2', severityColor)}
                    >
                      {/* header row */}
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={cn(
                          'h-3.5 w-3.5 shrink-0',
                          issue.severity === 'high' ? 'text-destructive' : issue.severity === 'medium' ? 'text-amber-500' : 'text-muted-foreground',
                        )} />
                        <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium', tagColors[issue.tag] ?? 'bg-muted text-muted-foreground')}>
                          {issue.tag.replace('_', ' ')}
                        </span>
                      </div>

                      {/* problematic sentence (highlighted) */}
                      {issue.sentence && (
                        <div className="rounded-lg border border-border bg-muted px-3 py-2">
                          <p className="text-[11px] text-muted-foreground mb-1">原句</p>
                          <p className="text-sm italic text-foreground leading-relaxed">"{issue.sentence}"</p>
                        </div>
                      )}

                      {/* problem description */}
                      <p className="text-sm font-medium text-foreground">{issue.message}</p>
                      {issue.messageZh && (
                        <p className="text-xs text-muted-foreground">{issue.messageZh}</p>
                      )}

                      {/* suggestion */}
                      <p className="text-sm leading-6 text-muted-foreground">{issue.suggestion}</p>
                      {issue.suggestionZh && (
                        <p className="text-xs text-muted-foreground">{issue.suggestionZh}</p>
                      )}

                      {/* corrected version */}
                      {issue.correction && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                          <p className="text-[11px] text-green-600 mb-1">建议改为</p>
                          <p className="text-sm text-green-600 leading-relaxed italic">"{issue.correction}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Improved sentence example ──────────────────────────── */}
              {writingFeedback.improvedSentence && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 flex gap-3">
                  <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <div>
                    <p className="text-[11px] text-sky-600 mb-1">Band 7+ 示范句</p>
                    <p className="text-sm italic leading-relaxed text-sky-700">"{writingFeedback.improvedSentence}"</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-5">
                <Button
                  onClick={handleRevise}
                  disabled={feedbackQuotaRemaining !== null && feedbackQuotaRemaining <= 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 disabled:opacity-50"
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  Revise &amp; Resubmit
                  {writingRound < 3 && (
                    <span className="ml-1.5 text-primary-foreground/60 text-xs">Round {writingRound + 1}</span>
                  )}
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try another
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </LearningWorkspaceSurface>,
    );
  }

  if (selectedMode === 'listening') {
    const currentWord = listeningWords[currentQuestionIndex];

    if (!currentWord) {
      return renderPageShell(
        <LearningEmptyState
          icon={Target}
          eyebrow="Listening workspace"
          title="没有可用的听辨素材"
          description="先准备一组词。"
          actions={
            <Button
              variant="outline"
              className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
              onClick={exitToPicker}
            >
              Back to modes
            </Button>
          }
        />,
      );
    }

    return renderPageShell(
      <LearningWorkspaceSurface
        eyebrow="Listening workspace"
        title="Listen, then type"
      >
        <div className="space-y-6">
          <div className="space-y-2 border-b border-border pb-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {listeningWords.length}</span>
              <span>{Math.round(sessionProgress)}%</span>
            </div>
            <Progress value={sessionProgress} className="h-2 bg-muted [&_[data-slot=progress-indicator]]:bg-primary" />
          </div>

          <div className="mx-auto max-w-2xl space-y-6 py-6 text-center">
            <Headphones className="mx-auto h-16 w-16 text-[hsl(var(--accent-practice))]" />

            <div className="space-y-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" onClick={() => playAudio(currentWord.word)}>
                <Headphones className="mr-2 h-5 w-5" />
                Play word
              </Button>

              <div className="mx-auto max-w-md">
                <Input
                  ref={listeningInputRef}
                  type="text"
                  value={listeningInput}
                  onChange={(event) => setListeningInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    if (!listeningResult) {
                      handleListeningCheck();
                    } else {
                      handleListeningNext();
                    }
                  }}
                  placeholder="Type what you hear..."
                  className={cn('h-14 rounded-md px-5 text-center text-lg', lightInputClass)}
                />
              </div>

              {!listeningResult ? (
                <Button
                  variant="outline"
                  className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                  onClick={handleListeningCheck}
                  disabled={!listeningInput.trim()}
                >
                  Check answer
                </Button>
              ) : (
                <div className="space-y-3">
                  <div
                    className={cn(
                      'mx-auto max-w-md rounded-xl px-4 py-3 text-sm',
                      listeningResult.isCorrect ? 'bg-green-50 text-green-600' : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {listeningResult.isCorrect ? 'Correct!' : `Expected: ${listeningResult.expected}`}
                  </div>
                  <Button onClick={handleListeningNext} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                    {currentQuestionIndex < listeningWords.length - 1 ? 'Next question' : 'Finish listening quiz'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </LearningWorkspaceSurface>,
    );
  }

  if (isComplete) {
    const safeTotal = Math.max(totalQuestions, 1);
    const accuracy = Math.round((score / safeTotal) * 100);
    const incorrect = Math.max(0, totalQuestions - score);

    return renderPageShell(
      <>
        <SessionRecapCard
          input={{
            kind: 'practice',
            stats: { total: totalQuestions, correct: score, incorrect },
            language: practiceLanguage,
            coachReviews: { dueCount: dueCoachReviewCount },
          }}
        />
        <LearningCompletionState
          icon={Trophy}
          eyebrow="Session summary"
          title={timedMode && timeLeft <= 0 ? '时间到!' : '这轮短练习已经完成'}
          description={maxCombo >= 3 ? `最高连击 ${maxCombo}x! 🔥` : '这轮结果已经出来了。'}
          metrics={[
            { label: 'Correct', value: `${score}/${safeTotal}`, accent: 'emerald' },
            { label: 'Accuracy', value: `${accuracy}%`, accent: 'emerald' },
            { label: 'Max Combo', value: `${maxCombo}x`, accent: maxCombo >= 5 ? 'emerald' : undefined },
            { label: 'Mode', value: `${focusedMode.nameZh}${timedMode ? ' ⏱️' : ''}` },
          ]}
          actions={
            <>
              <Button
                onClick={handleRestart}
                variant="outline"
                className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" onClick={exitToPicker}>
                Other modes
              </Button>
            </>
          }
        />
        {/* Error notebook */}
        {errorNotebook.length > 0 && (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="text-base font-semibold text-destructive mb-4">
              📝 错题本 · {errorNotebook.length} 个需要加强
            </h3>
            <div className="space-y-3">
              {errorNotebook.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-xs font-bold text-destructive">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.word}</p>
                    <p className="text-xs text-muted-foreground mt-1">正确答案: {item.correctAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>,
    );
  }

  if (quizQuestions.length === 0) {
    return renderPageShell(
      <LearningEmptyState
        icon={Target}
        eyebrow="Practice workspace"
        title="没有足够的练习素材"
        description="先学一组单词。"
        actions={
          <Button
            variant="outline"
            className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
            onClick={exitToPicker}
          >
            Back to modes
          </Button>
        }
      />,
    );
  }

  return renderPageShell(
    <LearningWorkspaceSurface
      eyebrow="Practice workspace"
      title={`${focusedMode.name} · ${focusedMode.nameZh}`}
      actions={
        <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
          Question {currentQuestionIndex + 1} / {quizQuestions.length}
        </Badge>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2 border-b border-border pb-5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
            <span>{Math.round(sessionProgress)}%</span>
          </div>
          <Progress value={sessionProgress} className="h-2 bg-muted [&_[data-slot=progress-indicator]]:bg-primary" />
        </div>

        <div className="max-w-3xl space-y-5">
          <div className="space-y-3">
            <Badge className="rounded-md border border-border bg-[hsl(var(--accent-practice)/0.08)] px-3 py-1 text-[hsl(var(--accent-practice))] hover:bg-[hsl(var(--accent-practice)/0.08)]">
              {currentQuestion?.word.word}
            </Badge>
            <h3 className="text-3xl font-semibold tracking-tight text-foreground">{currentQuestion?.question}</h3>
            <p className="text-base leading-7 text-muted-foreground">{currentQuestion?.questionZh}</p>
          </div>

          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={setSelectedAnswer}
            disabled={showResult}
            className="space-y-2"
          >
            {currentQuestion?.options.map((option, index) => (
              <motion.div
                key={index}
                animate={
                  showResult && option === currentQuestion.correctAnswer
                    ? { scale: [1, 1.02, 1], transition: { duration: 0.3 } }
                    : showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer
                      ? { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.4 } }
                      : {}
                }
                className={cn(
                  'flex items-center space-x-3 rounded-xl border px-4 py-4 transition-all',
                  showResult && option === currentQuestion.correctAnswer
                    ? 'border-green-200 bg-green-50 text-green-600'
                    : showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer
                      ? 'border-destructive/20 bg-destructive/10 text-destructive'
                      : selectedAnswer === option
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:bg-muted hover:border-border',
                )}
              >
                <RadioGroupItem value={option} id={`option-${index}`} className="border-border text-primary" />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm leading-6 text-foreground">
                  {option}
                </Label>
                {showResult && option === currentQuestion.correctAnswer ? <Check className="h-5 w-5 text-green-600" /> : null}
                {showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer ? <X className="h-5 w-5 text-destructive" /> : null}
              </motion.div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 lg:flex-row lg:items-center lg:justify-between">
          {!showResult ? (
            <Button onClick={handleAnswer} disabled={!selectedAnswer} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md lg:min-w-[180px]">
              Check answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md lg:min-w-[180px]">
              Next question
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <div className="text-sm leading-6 text-muted-foreground">
            {showResult ? `当前正确率 ${accuracyPct}%` : '先选一个最合适的答案，再检查。'}
          </div>
        </div>
      </div>
    </LearningWorkspaceSurface>,
  );
}

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  LearningMetricStrip,
  LearningRailSection,
  LearningWorkspaceSurface,
  type AccentTone,
} from '@/features/learning/components/LearningWorkspace';
import {
  HelpCircle,
  Check,
  X,
  Lightbulb,
  RotateCcw,
  Target,
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
import { getLearningStylePersonalization } from '@/features/learning/learningStylePersonalization';
import {
  getRecommendedPracticeMode,
  isStylePracticeRecommendation,
} from '@/features/practice/recommendedMode';
import { getDueCoachReviews } from '@/services/coachReviewQueue';
import { useTranslation } from 'react-i18next';
import { buildListeningQueue, buildPracticeQuestions } from '@/features/practice/runtime';
import { wordsDatabase } from '@/data/words';
import {
  buildPracticeHint,
  createInitialPracticeAttemptState,
  gradePracticeAttempt,
  revealPracticeAnswer,
  type PracticeAttemptOutcome,
} from '@/features/practice/attemptState';

const practiceModes = [
  {
    id: 'quiz',
    name: 'Multiple Choice',
    nameZh: '选择题',
    description: 'Check meaning and context.',
    descriptionZh: '查词义和语境判断。',
    icon: HelpCircle,
  },
  {
    id: 'fill_blank',
    name: 'Fill in the Blank',
    nameZh: '填空题',
    description: 'Put the word back into a sentence.',
    descriptionZh: '把单词放回句子。',
    icon: PenTool,
  },
  {
    id: 'listening',
    name: 'Listening Quiz',
    nameZh: '听写',
    description: 'Listen and type the word.',
    descriptionZh: '听后输入单词。',
    icon: Headphones,
  },
  {
    id: 'writing',
    name: 'Writing Practice',
    nameZh: '写作练习',
    description: 'Write a short response and revise it.',
    descriptionZh: '写一段，看修改点。',
    icon: PenTool,
  },
] as const;

const lightInputClass =
  'border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-primary/30';

const lightSelectContentClass = 'border-border bg-background text-foreground';

const workbookButtonClass =
  'rounded-md bg-primary text-primary-foreground shadow-none hover:bg-primary/90';
const workbookOutlineButtonClass =
  'rounded-md border-border bg-card text-foreground shadow-none hover:bg-muted/70 hover:text-foreground';
const practiceBadgeClass =
  'rounded-md border border-[hsl(var(--accent-practice)/0.22)] bg-[hsl(var(--accent-practice)/0.08)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--accent-practice))] hover:bg-[hsl(var(--accent-practice)/0.08)]';
const practiceProgressClass =
  'h-1.5 bg-muted [&_[data-slot=progress-indicator]]:bg-[hsl(var(--accent-practice))]';

const practiceFeedbackToneClass: Record<PracticeAttemptOutcome, string> = {
  firstTryCorrect: 'border-[hsl(var(--success)/0.42)] bg-[hsl(var(--success)/0.13)] text-foreground',
  recovered: 'border-[hsl(var(--accent-practice)/0.42)] bg-[hsl(var(--accent-practice)/0.14)] text-foreground',
  tryAgain: 'border-destructive/24 bg-destructive/5 text-foreground',
  needsReview: 'border-[hsl(var(--warning)/0.48)] bg-[hsl(var(--warning)/0.14)] text-foreground',
};

const correctOptionClass =
  'border-[hsl(var(--success)/0.52)] bg-[hsl(var(--success)/0.13)] text-foreground';
const blockedOptionClass =
  'border-destructive/40 bg-destructive/10 text-foreground';

export default function PracticePage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const { dailyWords, dueWords, progress, learningProfile, addStudySession, completeMissionTask, reviewWord, customWords = [] } = useUserData();
  const { i18n } = useTranslation();
  const practiceLanguage = i18n.language;
  const isZh = practiceLanguage.startsWith('zh');
  const [searchParams] = useSearchParams();
  const focusWordId = searchParams.get('wordId') || undefined;
  const focusQuery = searchParams.get('q')?.trim().toLowerCase() || undefined;
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [recoveredCount, setRecoveredCount] = useState(0);
  const [needsReviewCount, setNeedsReviewCount] = useState(0);
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
  const [choiceAttemptState, setChoiceAttemptState] = useState(createInitialPracticeAttemptState);
  const [choiceOutcome, setChoiceOutcome] = useState<PracticeAttemptOutcome | null>(null);
  const [listeningAttemptState, setListeningAttemptState] = useState(createInitialPracticeAttemptState);
  const [listeningOutcome, setListeningOutcome] = useState<PracticeAttemptOutcome | null>(null);
  // Gamification state
  const [timedMode, setTimedMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [errorNotebook, setErrorNotebook] = useState<Array<{ word: string; question: string; correctAnswer: string }>>([]);

  const listeningInputRef = useRef<HTMLInputElement | null>(null);
  const practiceWordCatalog = useMemo(() => {
    const seen = new Set<string>();
    const out: typeof dailyWords = [];

    for (const word of [...dailyWords, ...customWords, ...wordsDatabase]) {
      if (!word?.id || seen.has(word.id)) continue;
      seen.add(word.id);
      out.push(word);
    }

    return out;
  }, [customWords, dailyWords]);
  const focusedPracticeWord = useMemo(() => {
    if (!focusWordId && !focusQuery) return null;
    return practiceWordCatalog.find((word) => (
      (focusWordId && word.id === focusWordId) ||
      (focusQuery && word.word.toLowerCase() === focusQuery)
    )) || null;
  }, [focusQuery, focusWordId, practiceWordCatalog]);
  const practiceWords = useMemo(() => {
    if (!focusedPracticeWord) return dailyWords;
    const seen = new Set([focusedPracticeWord.id]);
    const out = [
      focusedPracticeWord,
      ...dailyWords.filter((word) => {
        if (seen.has(word.id)) return false;
        seen.add(word.id);
        return true;
      }),
    ];

    for (const word of practiceWordCatalog) {
      if (out.length >= 10) break;
      if (seen.has(word.id)) continue;
      seen.add(word.id);
      out.push(word);
    }

    return out;
  }, [dailyWords, focusedPracticeWord, practiceWordCatalog]);
  const quizQuestions = useMemo(
    () =>
      selectedMode === 'quiz' || selectedMode === 'fill_blank'
        ? buildPracticeQuestions(practiceWords, selectedMode, `${userId}:${selectedMode}`, {
          progress,
          focusWordId: focusedPracticeWord?.id,
        })
        : [],
    [focusedPracticeWord?.id, practiceWords, progress, selectedMode, userId],
  );
  const listeningWords = useMemo(
    () => (selectedMode === 'listening'
      ? buildListeningQueue(practiceWords, `${userId}:listening`, {
        progress,
        focusWordId: focusedPracticeWord?.id,
      })
      : []),
    [focusedPracticeWord?.id, practiceWords, progress, selectedMode, userId],
  );

  const resetPracticeRuntime = () => {
    setHasStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setChoiceAttemptState(createInitialPracticeAttemptState());
    setChoiceOutcome(null);
    setScore(0);
    setFirstTryCorrect(0);
    setRecoveredCount(0);
    setNeedsReviewCount(0);
    setIsComplete(false);
    setListeningInput('');
    setListeningResult(null);
    setListeningAttemptState(createInitialPracticeAttemptState());
    setListeningOutcome(null);
    setWritingInput('');
    setWritingFeedback(null);
    setWritingRound(1);
    setPreviousFeedback(null);
    setCombo(0);
    setMaxCombo(0);
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
  const answeredCount = firstTryCorrect + recoveredCount + needsReviewCount;
  const completedCorrectCount = firstTryCorrect + recoveredCount;
  const firstTryAccuracyPct = totalQuestions > 0 ? Math.round((firstTryCorrect / totalQuestions) * 100) : 0;

  // Timer for timed challenge mode
  useEffect(() => {
    if (!timedMode || !hasStarted || isComplete) return;
    if (timeLeft <= 0) {
      setIsComplete(true);
      addStudySession(totalQuestions, completedCorrectCount, firstTryCorrect * 10 + recoveredCount * 6, 1);
      completeMissionTask('task_quiz_today');
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timedMode, hasStarted, isComplete, timeLeft, totalQuestions, completedCorrectCount, firstTryCorrect, recoveredCount, addStudySession, completeMissionTask]);

  // LEARN-05 — emit session_ended + load coach review count once when the
  // practice session finishes. Must stay above any conditional return so the
  // hook order is stable across renders.
  useEffect(() => {
    if (!isComplete) return;
    void getDueCoachReviews(userId).then((items) => setDueCoachReviewCount(items.length));
    void recordEvent(userId, {
      kind: 'session_ended',
      payload: {
        surface: 'practice',
        mode: selectedMode,
        score,
        firstTryCorrect,
        recovered: recoveredCount,
        needsReview: needsReviewCount,
        total: totalQuestions,
      },
    });
  }, [isComplete, userId, selectedMode, score, firstTryCorrect, recoveredCount, needsReviewCount, totalQuestions]);

  const recommendedMode = useMemo(
    () => getRecommendedPracticeMode({
      dueWordCount: dueWords.length,
      dailyWordCount: dailyWords.length,
      learningStyle: learningProfile.learningStyle,
    }),
    [dailyWords.length, dueWords.length, learningProfile.learningStyle],
  );
  const recommendedModeId = recommendedMode.modeId;
  const stylePersonalization = getLearningStylePersonalization(learningProfile.learningStyle);
  const isStyleRecommended = isStylePracticeRecommendation(recommendedMode.reason);

  const focusedModeId = selectedMode || recommendedModeId;
  const focusedMode = practiceModes.find((mode) => mode.id === focusedModeId) || practiceModes[0];
  const focusedModeLabel = isZh ? focusedMode.nameZh : focusedMode.name;
  const focusedModeDescription = isZh ? focusedMode.descriptionZh : focusedMode.description;
  const writingScoreLabels = {
    task: isZh ? '题目回应' : 'Task',
    coherence: isZh ? '连贯衔接' : 'Coherence',
    lexical: isZh ? '词汇资源' : 'Lexical',
    grammar: isZh ? '语法准确' : 'Grammar',
    overall: isZh ? '总分' : 'Overall',
  };
  const issueTagLabels: Record<string, string> = {
    grammar: isZh ? '语法' : 'grammar',
    lexical: isZh ? '词汇' : 'lexical',
    coherence: isZh ? '连贯' : 'coherence',
    task_response: isZh ? '题目回应' : 'task response',
    collocation: isZh ? '搭配' : 'collocation',
    tense: isZh ? '时态' : 'tense',
    logic: isZh ? '逻辑' : 'logic',
    word_count: isZh ? '字数' : 'word count',
  };

  const modeBlueprints = useMemo(
    () => ({
      quiz: {
        label: 'Start here',
        labelZh: '开始',
        focus: '检查词义和语境。',
        estimatedQuestions: Math.min(Math.max(dailyWords.length, 5), 10),
        estimatedMinutes: 6,
        reason: dueWords.length >= 5 ? `${dueWords.length} 个词到期，先查词义。` : '看词义是否记住。',
        insight: '约 6 分钟。',
      },
      fill_blank: {
        label: 'Sentence drill',
        labelZh: '填空',
        focus: '把词放回句子里。',
        estimatedQuestions: Math.min(Math.max(dailyWords.length, 5), 10),
        estimatedMinutes: 8,
        reason: '练语境里的回想。',
        insight: '约 8 分钟。',
      },
      listening: {
        label: 'Dictation',
        labelZh: '听写',
        focus: '听后输入单词。',
        estimatedQuestions: Math.min(Math.max(dailyWords.length, 4), 10),
        estimatedMinutes: 7,
        reason: dailyWords.length >= 4 ? '把发音和拼写对上。' : '补一轮音形对应。',
        insight: '约 7 分钟。',
      },
      writing: {
        label: 'Writing',
        labelZh: '写作',
        focus: '写一段，看修改点。',
        estimatedQuestions: 1,
        estimatedMinutes: 18,
        reason: '需要输出时选它。',
        insight: '约 18 分钟。',
      },
    }),
    [dailyWords.length, dueWords.length],
  );

  const focusedBlueprint = modeBlueprints[focusedModeId as keyof typeof modeBlueprints];
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

  const commitPracticeOutcome = (args: {
    outcome: PracticeAttemptOutcome;
    wordId: string;
    word: string;
    mode: string;
    eventName: string;
    attempts: number;
    questionId?: string;
    userAnswer?: string;
  }) => {
    const isCorrectOutcome = args.outcome === 'firstTryCorrect' || args.outcome === 'recovered';
    const evidenceType =
      args.outcome === 'firstTryCorrect'
        ? 'practice.correct'
        : args.outcome === 'recovered'
          ? 'practice.recovered'
          : 'practice.incorrect';
    const strictKind =
      args.outcome === 'firstTryCorrect'
        ? 'practice_correct'
        : args.outcome === 'recovered'
          ? 'practice_recovered'
          : 'practice_wrong';

    void recordLearningEvent({
      userId,
      eventName: args.eventName,
      payload: {
        mode: args.mode,
        isCorrect: isCorrectOutcome,
        outcome: args.outcome,
        attempts: args.attempts,
        questionId: args.questionId,
        word: args.word,
        answer: args.userAnswer,
      },
    });
    void recordEvidence(
      createEvidenceEvent({
        type: evidenceType,
        userId,
        wordId: args.wordId,
        mode: args.mode,
      }),
    );
    void recordEvent(userId, {
      kind: strictKind,
      payload: {
        wordId: args.wordId,
        word: args.word,
        mode: args.mode,
        outcome: args.outcome,
        attempts: args.attempts,
      },
    });
  };

  const recordNeedsReviewMistake = (args: {
    word: typeof dailyWords[number];
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    mode: string;
  }) => {
    setErrorNotebook((prev) => [...prev, {
      word: args.word.word,
      question: args.question,
      correctAnswer: args.correctAnswer,
    }]);
    const mistakeRecord = buildPracticeMistakeRecord({
      word: args.word,
      isCorrect: false,
      userAnswer: args.selectedAnswer,
      correctAnswer: args.correctAnswer,
      mode: args.mode,
    });
    if (mistakeRecord) {
      try {
        void addMistake(userId, mistakeRecord);
      } catch {
        // localStorage failure is silent — never block the user's drill.
      }
    }
  };

  const handleAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const result = gradePracticeAttempt(choiceAttemptState, selectedAnswer, currentQuestion.correctAnswer);
    setChoiceAttemptState(result.state);
    setChoiceOutcome(result.outcome);

    if (result.outcome === 'tryAgain') {
      setCombo(0);
      setSelectedAnswer(null);
      return;
    }

    if (result.outcome === 'firstTryCorrect') {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setScore((prev) => prev + 1);
      setFirstTryCorrect((prev) => prev + 1);
      try {
        reviewWord(currentQuestion.word.id, 'good');
      } catch {
        // reviewWord guards itself; never let a sync hiccup fail the turn.
      }
    } else if (result.outcome === 'recovered') {
      setCombo(0);
      setRecoveredCount((prev) => prev + 1);
      try {
        reviewWord(currentQuestion.word.id, 'hard');
      } catch {
        // see above
      }
    } else {
      setCombo(0);
      setNeedsReviewCount((prev) => prev + 1);
      recordNeedsReviewMistake({
        word: currentQuestion.word,
        question: currentQuestion.question,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        mode: selectedMode || 'quiz',
      });
      try {
        reviewWord(currentQuestion.word.id, 'again');
      } catch {
        // see above
      }
    }

    commitPracticeOutcome({
      outcome: result.outcome,
      wordId: currentQuestion.word.id,
      word: currentQuestion.word.word,
      mode: selectedMode || 'quiz',
      eventName: 'practice.quiz_submitted',
      attempts: result.state.attempts.length,
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
    });
  };

  const handleRevealAnswer = () => {
    if (!currentQuestion) return;
    const result = revealPracticeAnswer(choiceAttemptState, selectedAnswer || undefined);
    setChoiceAttemptState(result.state);
    setChoiceOutcome(result.outcome);
    setCombo(0);
    setNeedsReviewCount((prev) => prev + 1);
    recordNeedsReviewMistake({
      word: currentQuestion.word,
      question: currentQuestion.question,
      selectedAnswer: selectedAnswer || '',
      correctAnswer: currentQuestion.correctAnswer,
      mode: selectedMode || 'quiz',
    });
    try {
      reviewWord(currentQuestion.word.id, 'again');
    } catch {
      // see above
    }
    commitPracticeOutcome({
      outcome: 'needsReview',
      wordId: currentQuestion.word.id,
      word: currentQuestion.word.word,
      mode: selectedMode || 'quiz',
      eventName: 'practice.quiz_submitted',
      attempts: result.state.attempts.length,
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer || '',
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setChoiceAttemptState(createInitialPracticeAttemptState());
      setChoiceOutcome(null);
      return;
    }

    setIsComplete(true);
    addStudySession(quizQuestions.length, completedCorrectCount, firstTryCorrect * 10 + recoveredCount * 6, 15);
    completeMissionTask('task_quiz_today');
  };

  const handleWritingSubmit = async () => {
    if (isWritingSubmitting) return;

    if (isQuotaLoading || feedbackQuotaRemaining === null) {
      toast.info('Loading quota status, please wait a moment.');
      return;
    }

    if (feedbackQuotaRemaining <= 0) {
      toast.error('Today\'s writing feedback quota is exhausted. Upgrade to Pro or try tomorrow.');
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
        toast.error('Today\'s writing feedback quota is exhausted. Upgrade to Pro or try tomorrow.');
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
      toast.success(`Feedback ready. Overall band ${feedback.scores.overallBand}`);
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

    const result = gradePracticeAttempt(
      listeningAttemptState,
      normalizeListeningAnswer(listeningInput),
      normalizeListeningAnswer(currentWord.word),
    );
    setListeningAttemptState(result.state);
    setListeningOutcome(result.outcome);
    setListeningResult({
      isCorrect: result.isCorrect,
      expected: result.shouldRevealAnswer ? currentWord.word : '',
      submitted: listeningInput.trim(),
    });

    if (result.outcome === 'tryAgain') {
      setCombo(0);
      setListeningInput('');
      playAudio(currentWord.word);
      requestAnimationFrame(() => {
        listeningInputRef.current?.focus();
      });
      return;
    }

    if (result.outcome === 'firstTryCorrect') {
      setScore((prev) => prev + 1);
      setFirstTryCorrect((prev) => prev + 1);
      try {
        reviewWord(currentWord.id, 'good');
      } catch {
        // see comment in handleAnswer
      }
    } else if (result.outcome === 'recovered') {
      setRecoveredCount((prev) => prev + 1);
      try {
        reviewWord(currentWord.id, 'hard');
      } catch {
        // see comment in handleAnswer
      }
    } else {
      setNeedsReviewCount((prev) => prev + 1);
      recordNeedsReviewMistake({
        word: currentWord,
        question: isZh ? '听写单词' : 'Listening dictation',
        selectedAnswer: listeningInput.trim(),
        correctAnswer: currentWord.word,
        mode: 'listening',
      });
      try {
        reviewWord(currentWord.id, 'again');
      } catch {
        // see comment in handleAnswer
      }
    }

    commitPracticeOutcome({
      outcome: result.outcome,
      wordId: currentWord.id,
      word: currentWord.word,
      mode: 'listening',
      eventName: 'practice.listening_submitted',
      attempts: result.state.attempts.length,
      questionId: `listening-${currentQuestionIndex + 1}`,
      userAnswer: listeningInput.trim(),
    });
  };

  const handleListeningReveal = () => {
    const currentWord = listeningWords[currentQuestionIndex];
    if (!currentWord) return;
    const result = revealPracticeAnswer(
      listeningAttemptState,
      listeningInput.trim() ? normalizeListeningAnswer(listeningInput) : undefined,
    );
    setListeningAttemptState(result.state);
    setListeningOutcome(result.outcome);
    setListeningResult({
      isCorrect: false,
      expected: currentWord.word,
      submitted: listeningInput.trim(),
    });
    setNeedsReviewCount((prev) => prev + 1);
    recordNeedsReviewMistake({
      word: currentWord,
      question: isZh ? '听写单词' : 'Listening dictation',
      selectedAnswer: listeningInput.trim(),
      correctAnswer: currentWord.word,
      mode: 'listening',
    });
    try {
      reviewWord(currentWord.id, 'again');
    } catch {
      // see comment in handleAnswer
    }
    commitPracticeOutcome({
      outcome: 'needsReview',
      wordId: currentWord.id,
      word: currentWord.word,
      mode: 'listening',
      eventName: 'practice.listening_submitted',
      attempts: result.state.attempts.length,
      questionId: `listening-${currentQuestionIndex + 1}`,
      userAnswer: listeningInput.trim(),
    });
  };

  const handleListeningNext = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < listeningWords.length) {
      setCurrentQuestionIndex(nextIndex);
      setListeningInput('');
      setListeningResult(null);
      setListeningAttemptState(createInitialPracticeAttemptState());
      setListeningOutcome(null);
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
    addStudySession(listeningWords.length, completedCorrectCount, firstTryCorrect * 10 + recoveredCount * 6, 10);
    completeMissionTask('task_quiz_today');
  };

  const renderModeSelector = () => (
    <LearningRailSection title={isZh ? '选择' : 'Choose'}>
      <nav className="space-y-2" aria-label={isZh ? '练习模式' : 'Practice modes'}>
        {practiceModes.map((mode) => {
          const active = focusedModeId === mode.id;
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => pickMode(mode.id)}
              className={cn(
                'group relative w-full rounded-md border px-3 py-3 text-left transition-colors',
                active ? 'border-border bg-[hsl(var(--surface-sunken))]' : 'border-transparent hover:border-border hover:bg-muted/60',
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-3 left-0 w-[3px] rounded-full transition-colors',
                  active ? 'bg-[hsl(var(--accent-practice))]' : 'bg-transparent group-hover:bg-border',
                )}
              />
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground',
                    active ? 'border-border bg-card text-[hsl(var(--accent-practice))]' : 'border-border bg-muted/70',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {isZh ? mode.nameZh : mode.name}
                    </span>
                    {mode.id === recommendedModeId ? (
                      <span className={practiceBadgeClass}>
                        {isZh ? '开始' : 'Start'}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {isZh ? mode.descriptionZh : mode.description}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </LearningRailSection>
  );

  const renderInsightRail = () => (
    <div className="space-y-4">
      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground">{isZh ? '本次练习统计' : 'This session'}</p>
        <div className="mt-4 divide-y divide-border/70">
          {[
            { icon: Check, label: isZh ? '首答正确' : 'First try', value: firstTryCorrect, tone: 'text-[hsl(var(--success))]' },
            { icon: RotateCcw, label: isZh ? '已修正' : 'Recovered', value: recoveredCount, tone: 'text-[hsl(var(--accent-practice))]' },
            { icon: AlertTriangle, label: isZh ? '需复习' : 'Review', value: needsReviewCount, tone: needsReviewCount > 0 ? 'text-[hsl(var(--warning))]' : 'text-muted-foreground' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[hsl(var(--surface-sunken))]', item.tone)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <span className="text-lg font-semibold text-foreground">{item.value}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{isZh ? '本轮进度' : 'Progress'}</span>
          <span>{Math.round(sessionProgress || 0)}%</span>
        </div>
        <Progress value={sessionProgress} className={cn('mt-3', practiceProgressClass)} />
        <p className="mt-3 text-xs text-muted-foreground">
          {isZh ? `已完成 ${answeredCount} / ${totalQuestions || focusedBlueprint.estimatedQuestions} 题` : `${answeredCount} / ${totalQuestions || focusedBlueprint.estimatedQuestions} answered`}
        </p>
      </section>

      {selectedMode === 'writing' ? (
        <section className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PenTool className="h-4 w-4" />
            <p className="text-sm font-medium">{isZh ? '反馈次数' : 'Feedback left'}</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
          </p>
        </section>
      ) : null}
    </div>
  );

  const pageTitle = !selectedMode
    ? (isZh ? '练习' : 'Practice')
    : !hasStarted
      ? focusedModeLabel
      : isComplete
        ? (isZh ? '完成' : 'Done')
        : focusedModeLabel;

  const pageDescription = !selectedMode
    ? (isZh ? '选一项开始。' : 'Pick one.')
    : !hasStarted
      ? focusedBlueprint.insight
      : isComplete
        ? (isZh ? '看结果。' : 'Review the result.')
        : undefined;

  const heroProgress =
    selectedMode && hasStarted && !isComplete && selectedMode !== 'writing'
      ? Math.min(100, Math.round(sessionProgress))
      : selectedMode === 'writing' && writingFeedback
        ? 100
        : null;

  const renderPageShell = (mainContent: ReactNode) => {
    const primaryAction = selectedMode && !hasStarted
      ? { label: isZh ? '开始练习' : 'Start practice', onClick: startFocusedMode }
      : null;
    const secondaryActions: Array<{ label: string; onClick?: () => void; href?: string; variant?: 'outline' }> = [];
    if (selectedMode && !hasStarted && (selectedMode === 'quiz' || selectedMode === 'fill_blank')) {
      secondaryActions.push({
        label: timedMode ? (isZh ? '60 秒限时：开' : '60s timer on') : (isZh ? '60 秒限时' : '60s timer'),
        onClick: () => setTimedMode((prev) => !prev),
        variant: 'outline',
      });
    }
    if (selectedMode) {
      secondaryActions.push({
        label: isZh ? '换一项' : 'Change mode',
        onClick: exitToPicker,
        variant: 'outline',
      });
    }

    return (
      <section className="focus-study-page space-y-5">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{isZh ? '练习' : 'Practice'}</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span>{selectedMode ? focusedModeLabel : isZh ? '选择' : 'Choose'}</span>
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                {selectedMode && hasStarted && !isComplete
                  ? (isZh ? '练习' : 'Practice')
                  : pageTitle}
              </h1>
              {pageDescription ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{pageDescription}</p>
              ) : null}
            </div>

            {primaryAction || secondaryActions.length > 0 ? (
              <LearningActionCluster className="lg:justify-end">
                {primaryAction ? (
                  <Button className={workbookButtonClass} onClick={primaryAction.onClick}>
                    {primaryAction.label}
                  </Button>
                ) : null}
                {secondaryActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className={workbookOutlineButtonClass}
                    onClick={action.onClick}
                    asChild={Boolean(action.href)}
                  >
                    {action.href ? <a href={action.href}>{action.label}</a> : action.label}
                  </Button>
                ))}
              </LearningActionCluster>
            ) : null}
          </div>

          {typeof heroProgress === 'number' ? (
            <div className="max-w-4xl">
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {selectedMode === 'writing'
                    ? (isZh ? '写作进度' : 'Writing progress')
                    : isZh
                      ? `第 ${Math.min(currentQuestionIndex + 1, totalQuestions)} / ${totalQuestions} 题`
                      : `Question ${Math.min(currentQuestionIndex + 1, totalQuestions)} / ${totalQuestions}`}
                </span>
                <span>{heroProgress}%</span>
              </div>
              <Progress value={heroProgress} className={practiceProgressClass} />
            </div>
          ) : null}
        </div>

        <div className={cn(
          'grid gap-6 xl:items-start',
          hasStarted ? 'xl:grid-cols-[minmax(0,1fr)_280px]' : 'xl:grid-cols-[240px_minmax(0,1fr)_280px]',
        )}>
          {!hasStarted ? <div className="min-w-0">{renderModeSelector()}</div> : null}
          <div className="min-w-0">{mainContent}</div>
          <div className="min-w-0">{renderInsightRail()}</div>
        </div>
      </section>
    );
  };

  const renderFactStrip = (items: { label: string; value: ReactNode; hint: string; accent?: AccentTone }[]) => (
    <LearningMetricStrip items={items.map((item) => ({ label: item.label, value: item.value, hint: item.hint, accent: item.accent }))} />
  );

  if (!selectedMode) {
    return renderPageShell(
      <LearningWorkspaceSurface
        eyebrow={isZh ? '练习' : 'Practice'}
        title={focusedModeLabel}
        description={focusedModeDescription}
        actions={
          <Button className={workbookButtonClass} onClick={() => pickMode(focusedModeId)}>
            {isZh ? '开始' : 'Start'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        }
        className="border-0 bg-transparent shadow-none"
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={practiceBadgeClass}>
              {isStyleRecommended
                ? (isZh ? stylePersonalization.practiceBadge.zh : stylePersonalization.practiceBadge.en)
                : (isZh ? focusedBlueprint.labelZh : focusedBlueprint.label)}
            </Badge>
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              {focusedBlueprint.estimatedQuestions} 题
            </Badge>
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              {focusedBlueprint.estimatedMinutes} 分钟
            </Badge>
          </div>

          {renderFactStrip([
            { label: isZh ? '内容' : 'Focus', value: focusedModeDescription, hint: '' },
            {
              label: isZh ? '建议' : 'Suggestion',
              value: isStyleRecommended
                ? (isZh ? stylePersonalization.label.zh : stylePersonalization.label.en)
                : (isZh ? focusedBlueprint.labelZh : focusedBlueprint.label),
              hint: '',
            },
            { label: isZh ? '用时' : 'Time', value: `${focusedBlueprint.estimatedMinutes}${isZh ? ' 分钟' : ' min'}`, hint: '', accent: 'practice' },
            { label: isZh ? '词' : 'Words', value: `${dailyWords.length}${isZh ? ' 个' : ''}`, hint: '' },
          ])}
        </div>
      </LearningWorkspaceSurface>,
    );
  }

  if (!hasStarted) {
    return renderPageShell(
      <LearningWorkspaceSurface
        eyebrow={isZh ? '练习' : 'Practice'}
        title={focusedModeLabel}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={practiceBadgeClass}>
              {isZh ? focusedBlueprint.labelZh : focusedBlueprint.label}
            </Badge>
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              <Clock3 className="mr-1.5 h-3.5 w-3.5" />
              {focusedBlueprint.estimatedMinutes}{isZh ? ' 分钟' : ' min'}
            </Badge>
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              {focusedBlueprint.estimatedQuestions} {isZh ? '题' : 'prompts'}
            </Badge>
            {selectedMode === 'writing' ? (
              <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
                {isZh ? '反馈次数' : 'Feedback left'}: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
              </Badge>
            ) : null}
          </div>

          {renderFactStrip([
            { label: isZh ? '内容' : 'Focus', value: focusedModeDescription, hint: '' },
            {
              label: isZh ? '建议' : 'Suggestion',
              value: isZh ? focusedBlueprint.labelZh : focusedBlueprint.label,
              hint: '',
              accent: 'practice',
            },
            {
              label: isZh ? '结果' : 'Result',
              value: selectedMode === 'writing'
                ? (isZh ? '评分与修改点' : 'Score and revision notes')
                : (isZh ? '正确率和错题' : 'Accuracy and mistakes'),
              hint: '',
            },
          ])}

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
            <LearningActionCluster>
              <Button className={workbookButtonClass} onClick={startFocusedMode}>
                {isZh ? '开始练习' : 'Start practice'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                onClick={exitToPicker}
              >
                {isZh ? '返回列表' : 'Back to mode picker'}
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
        eyebrow={isZh ? '写作' : 'Writing'}
        title={isZh ? 'IELTS 写作练习' : 'IELTS Writing Practice'}
        actions={
          <div className="flex items-center gap-2">
            {writingRound > 1 && (
              <Badge className={practiceBadgeClass}>
                {isZh ? `第 ${writingRound} 轮` : `Round ${writingRound}`}
              </Badge>
            )}
            <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
              {isZh ? '反馈次数' : 'Feedback left'}: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
            </Badge>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
            <div className="space-y-3">
              <Label className="text-foreground">{isZh ? '题型' : 'Essay type'}</Label>
              <Select value={writingTaskType} onValueChange={(value: 'task1' | 'task2') => setWritingTaskType(value)}>
                <SelectTrigger className={cn('rounded-md', lightInputClass)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={lightSelectContentClass}>
                  <SelectItem value="task1" className="focus:bg-muted focus:text-foreground">
                    {isZh ? 'Task 1 小作文' : 'Task 1'}
                  </SelectItem>
                  <SelectItem value="task2" className="focus:bg-muted focus:text-foreground">
                    {isZh ? '大作文' : 'Task 2'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">{isZh ? '题目' : 'Prompt'}</Label>
              <Textarea
                value={writingPrompt}
                onChange={(event) => setWritingPrompt(event.target.value)}
                className={cn('min-h-[140px] rounded-md p-4', lightInputClass)}
              />
            </div>
          </div>

          {writingRound > 1 && previousFeedback && !writingFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 rounded-md border border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning)/0.1)] p-4"
            >
              <p className="text-xs font-semibold text-[hsl(var(--warning))]">
                {isZh ? `第 ${writingRound - 1} 轮得分，修改后再交` : `Round ${writingRound - 1} score. Revise, then submit again.`}
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  [writingScoreLabels.task, previousFeedback.scores.taskResponse],
                  [writingScoreLabels.coherence, previousFeedback.scores.coherenceCohesion],
                  [writingScoreLabels.lexical, previousFeedback.scores.lexicalResource],
                  [writingScoreLabels.grammar, previousFeedback.scores.grammaticalRangeAccuracy],
                  [writingScoreLabels.overall, previousFeedback.scores.overallBand],
                ].map(([label, value]) => (
                  <span key={label as string} className="text-xs text-muted-foreground">
                    {label}: <span className="text-foreground font-medium">{(value as number).toFixed(1)}</span>
                  </span>
                ))}
              </div>
              {previousFeedback.issues.length > 0 && (
                <p className="text-xs text-muted-foreground pt-1">
                  {isZh ? '主要问题' : 'Key issue'}:{' '}
                  {isZh && previousFeedback.issues[0].messageZh
                    ? previousFeedback.issues[0].messageZh
                    : previousFeedback.issues[0].message}
                </p>
              )}
            </motion.div>
          )}

          <div className="space-y-3 border-t border-border pt-5">
            <Label className="text-foreground">{isZh ? '你的作答' : 'Your response'}</Label>
            <Textarea
              value={writingInput}
              onChange={(event) => setWritingInput(event.target.value)}
              placeholder={isZh ? '输入你的 IELTS 作文' : 'Write your IELTS response'}
              className={cn('min-h-[300px] rounded-md p-5 text-base leading-7', lightInputClass)}
            />
          </div>

          {!writingFeedback ? (
            <div className="flex flex-col gap-4 border-t border-border pt-5 lg:flex-row lg:items-center lg:justify-between">
              <Button
                onClick={handleWritingSubmit}
                className={cn(workbookButtonClass, 'px-5')}
                disabled={
                  isWritingSubmitting ||
                  isQuotaLoading ||
                  feedbackQuotaRemaining === null ||
                  feedbackQuotaRemaining <= 0
                }
              >
                <PenTool className="mr-2 h-4 w-4" />
                {isQuotaLoading
                  ? (isZh ? '正在读取额度...' : 'Loading quota...')
                  : isWritingSubmitting
                    ? (isZh ? '正在评分...' : 'Scoring...')
                    : feedbackQuotaRemaining !== null && feedbackQuotaRemaining <= 0
                      ? (isZh ? '今日额度已用完' : 'Quota exhausted today')
                      : (isZh ? '查看 IELTS 评分' : 'Score IELTS response')}
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
                  {writingRound > 1
                    ? (isZh ? `第 ${writingRound} 轮反馈` : `Round ${writingRound} feedback`)
                    : (isZh ? '写作反馈' : 'Writing feedback')}
                </div>
                {previousFeedback && (
                  <span className="text-xs text-muted-foreground">
                    {isZh ? `对比第 ${writingRound - 1} 轮` : `vs Round ${writingRound - 1}`}: {previousFeedback.scores.overallBand.toFixed(1)} → {writingFeedback.scores.overallBand.toFixed(1)}
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
                    [writingScoreLabels.task, writingFeedback.scores.taskResponse, previousFeedback?.scores.taskResponse],
                    [writingScoreLabels.coherence, writingFeedback.scores.coherenceCohesion, previousFeedback?.scores.coherenceCohesion],
                    [writingScoreLabels.lexical, writingFeedback.scores.lexicalResource, previousFeedback?.scores.lexicalResource],
                    [writingScoreLabels.grammar, writingFeedback.scores.grammaticalRangeAccuracy, previousFeedback?.scores.grammaticalRangeAccuracy],
                    [writingScoreLabels.overall, writingFeedback.scores.overallBand, previousFeedback?.scores.overallBand],
                  ] as [string, number, number | undefined][]
                ).map(([label, value, prevValue], index) => {
                  const delta = prevValue !== undefined ? value - prevValue : 0;
                  return (
                  <div
                    key={label}
                    className={cn(
                      'rounded-md border border-border bg-card p-4',
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

              {writingFeedback.summary && (
                <div className="flex gap-3 rounded-md border border-border bg-card p-4">
                  <Quote className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                  <div>
                    <p className="text-sm leading-6 text-foreground">
                      {isZh && writingFeedback.summaryZh ? writingFeedback.summaryZh : writingFeedback.summary}
                    </p>
                    {writingFeedback.summaryZh && !isZh && (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{writingFeedback.summaryZh}</p>
                    )}
                    {isZh && writingFeedback.summaryZh ? (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{writingFeedback.summary}</p>
                    ) : null}
                  </div>
                </div>
              )}

              {writingFeedback.strengths && writingFeedback.strengths.length > 0 && (
                <div className="rounded-md border border-[hsl(var(--success)/0.32)] bg-[hsl(var(--success)/0.1)] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ThumbsUp className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                    <span className="text-xs font-medium text-[hsl(var(--success))]">
                      {isZh ? '做得好的地方' : 'What worked'}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {writingFeedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--success))]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                {writingFeedback.issues.map((issue, index) => {
                  const severityColor =
                    issue.severity === 'high'
                      ? 'border-destructive/20 bg-destructive/5'
                      : issue.severity === 'medium'
                        ? 'border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning)/0.1)]'
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
                      className={cn('space-y-2 rounded-md border p-4', severityColor)}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={cn(
                          'h-3.5 w-3.5 shrink-0',
                          issue.severity === 'high' ? 'text-destructive' : issue.severity === 'medium' ? 'text-amber-500' : 'text-muted-foreground',
                        )} />
                        <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium', tagColors[issue.tag] ?? 'bg-muted text-muted-foreground')}>
                          {issueTagLabels[issue.tag] ?? issue.tag.replace('_', ' ')}
                        </span>
                      </div>

                      {issue.sentence && (
                        <div className="rounded-md border border-border bg-muted px-3 py-2">
                          <p className="text-[11px] text-muted-foreground mb-1">原句</p>
                          <p className="text-sm italic text-foreground leading-relaxed">"{issue.sentence}"</p>
                        </div>
                      )}

                      <p className="text-sm font-medium text-foreground">
                        {isZh && issue.messageZh ? issue.messageZh : issue.message}
                      </p>
                      {issue.messageZh && !isZh && (
                        <p className="text-xs text-muted-foreground">{issue.messageZh}</p>
                      )}

                      <p className="text-sm leading-6 text-muted-foreground">
                        {isZh && issue.suggestionZh ? issue.suggestionZh : issue.suggestion}
                      </p>
                      {issue.suggestionZh && !isZh && (
                        <p className="text-xs text-muted-foreground">{issue.suggestionZh}</p>
                      )}

                      {issue.correction && (
                        <div className="rounded-md border border-[hsl(var(--success)/0.32)] bg-[hsl(var(--success)/0.1)] px-3 py-2">
                          <p className="text-[11px] text-[hsl(var(--success))] mb-1">{isZh ? '可改为' : 'Try this'}</p>
                          <p className="text-sm text-[hsl(var(--success))] leading-relaxed italic">"{issue.correction}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Improved sentence example ──────────────────────────── */}
              {writingFeedback.improvedSentence && (
                <div className="flex gap-3 rounded-md border border-[hsl(var(--info)/0.3)] bg-[hsl(var(--info)/0.08)] p-4">
                  <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--info))]" />
                  <div>
                    <p className="text-[11px] text-[hsl(var(--info))] mb-1">{isZh ? '示范改写' : 'Stronger version'}</p>
                    <p className="text-sm italic leading-relaxed text-[hsl(var(--info))]">"{writingFeedback.improvedSentence}"</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  onClick={handleRevise}
                  disabled={feedbackQuotaRemaining !== null && feedbackQuotaRemaining <= 0}
                  className={cn(workbookButtonClass, 'px-5 disabled:opacity-50')}
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  {isZh ? '修改后再评分' : 'Revise and score again'}
                  {writingRound < 3 && (
                    <span className="ml-1.5 text-xs text-primary-foreground/60">
                      {isZh ? `第 ${writingRound + 1} 轮` : `Round ${writingRound + 1}`}
                    </span>
                  )}
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {isZh ? '换一题' : 'Try another'}
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
    const isListeningTerminal =
      listeningOutcome === 'firstTryCorrect' ||
      listeningOutcome === 'recovered' ||
      listeningOutcome === 'needsReview';
    const isListeningRetrying = listeningOutcome === 'tryAgain';

    if (!currentWord) {
      return renderPageShell(
        <LearningEmptyState
          icon={Target}
          eyebrow={isZh ? '听力' : 'Listening'}
          title={isZh ? '没有可用的听辨素材' : 'No listening material yet'}
          description={isZh ? '学一组单词后再来听写。' : 'Learn a small word set first.'}
          actions={
            <Button
              variant="outline"
              className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
              onClick={exitToPicker}
            >
              {isZh ? '返回模式列表' : 'Back to modes'}
            </Button>
          }
        />,
      );
    }

    return renderPageShell(
      <LearningWorkspaceSurface
        eyebrow={isZh ? '听力' : 'Listening'}
        title={isZh ? '听后输入' : 'Listen, then type'}
      >
        <div className="space-y-6">
          <div className="mx-auto max-w-2xl space-y-6 py-4 text-center">
            <Headphones className="mx-auto h-16 w-16 text-[hsl(var(--accent-practice))]" />

            <div className="space-y-4">
              <Button size="lg" className={workbookButtonClass} onClick={() => playAudio(currentWord.word)}>
                <Headphones className="mr-2 h-5 w-5" />
                {isZh ? '播放发音' : 'Play word'}
              </Button>

              <div className="mx-auto max-w-md">
                <Input
                  ref={listeningInputRef}
                  type="text"
                  value={listeningInput}
                  onChange={(event) => setListeningInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    if (isListeningTerminal) {
                      handleListeningNext();
                    } else {
                      handleListeningCheck();
                    }
                  }}
                  placeholder={isZh ? '输入你听到的单词...' : 'Type what you hear...'}
                  disabled={isListeningTerminal}
                  className={cn('h-14 rounded-md px-5 text-center text-lg', lightInputClass)}
                />
              </div>

              {listeningOutcome ? (
                <div
                  className={cn(
                    'mx-auto max-w-md rounded-md border px-4 py-3 text-left text-sm leading-6',
                    practiceFeedbackToneClass[listeningOutcome],
                  )}
                >
                  <p className="font-semibold">
                    {listeningOutcome === 'firstTryCorrect'
                      ? (isZh ? '首答正确' : 'First try correct')
                      : listeningOutcome === 'recovered'
                        ? (isZh ? '重试后答对' : 'Recovered after retry')
                        : listeningOutcome === 'needsReview'
                          ? (isZh ? '正确答案' : 'Correct answer')
                          : (isZh ? '再听一次' : 'Listen once more')}
                  </p>
                  <p className="mt-1">
                    {listeningOutcome === 'needsReview'
                      ? (isZh ? `答案是：${listeningResult?.expected || currentWord.word}` : `Expected: ${listeningResult?.expected || currentWord.word}`)
                      : listeningOutcome === 'tryAgain'
                        ? buildPracticeHint(currentWord, { mode: 'listening', isZh })
                        : (isZh ? '已保存。' : 'Saved.')}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                {!isListeningTerminal ? (
                  <>
                    <Button
                      className={workbookButtonClass}
                      onClick={handleListeningCheck}
                      disabled={!listeningInput.trim()}
                    >
                      {isListeningRetrying ? (isZh ? '再试一次' : 'Try again') : (isZh ? '检查答案' : 'Check answer')}
                    </Button>
                    {listeningAttemptState.attempts.length > 0 ? (
                      <Button
                        variant="outline"
                        className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                        onClick={handleListeningReveal}
                      >
                        {isZh ? '看答案' : 'Show answer'}
                      </Button>
                    ) : null}
                  </>
                ) : (
                  <Button onClick={handleListeningNext} className={workbookButtonClass}>
                    {currentQuestionIndex < listeningWords.length - 1 ? (isZh ? '下一题' : 'Next question') : (isZh ? '完成听力练习' : 'Finish listening quiz')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </LearningWorkspaceSurface>,
    );
  }

  if (isComplete) {
    const safeTotal = Math.max(totalQuestions, 1);
    const accuracy = Math.round((firstTryCorrect / safeTotal) * 100);

    return renderPageShell(
      <>
        <SessionRecapCard
          input={{
            kind: 'practice',
            stats: {
              total: totalQuestions,
              firstTryCorrect,
              recovered: recoveredCount,
              needsReview: needsReviewCount,
            },
            language: practiceLanguage,
            coachReviews: { dueCount: dueCoachReviewCount },
          }}
        />
        <LearningCompletionState
          icon={Check}
          eyebrow={isZh ? '练习总结' : 'Session summary'}
          title={timedMode && timeLeft <= 0 ? (isZh ? '时间到' : 'Time is up') : (isZh ? '这轮练习已完成' : 'This practice set is complete')}
          description={maxCombo >= 3 ? (isZh ? `最高连击 ${maxCombo}x。` : `Best streak: ${maxCombo}x.`) : (isZh ? '本轮结果如下。' : 'Your result is ready.')}
          metrics={[
            { label: isZh ? '首答正确' : 'First try', value: `${firstTryCorrect}/${safeTotal}`, accent: 'success' },
            { label: isZh ? '已修正' : 'Recovered', value: recoveredCount, accent: 'practice' },
            { label: isZh ? '需复习' : 'Needs review', value: needsReviewCount, accent: needsReviewCount > 0 ? 'danger' : undefined },
            { label: isZh ? '首答正确率' : 'First-try accuracy', value: `${accuracy}%`, accent: 'success' },
            { label: isZh ? '最高连击' : 'Best streak', value: `${maxCombo}x`, accent: maxCombo >= 5 ? 'success' : undefined },
            { label: isZh ? '内容' : 'Mode', value: `${focusedModeLabel}${timedMode ? (isZh ? ' · 限时' : ' · timed') : ''}` },
          ]}
          actions={
            <>
              <Button
                onClick={handleRestart}
                variant="outline"
                className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {isZh ? '再练一次' : 'Try again'}
              </Button>
              <Button className={workbookButtonClass} onClick={exitToPicker}>
                {isZh ? '换一项' : 'Other modes'}
              </Button>
            </>
          }
        />
        {errorNotebook.length > 0 && (
          <div className="mt-6 rounded-md border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {isZh ? `错题本（${errorNotebook.length}）` : `Mistake notebook (${errorNotebook.length})`}
            </h3>
            <div className="space-y-3">
              {errorNotebook.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-xs font-bold text-destructive">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.word}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isZh ? '正确答案' : 'Correct answer'}: {item.correctAnswer}
                    </p>
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
        eyebrow={isZh ? '练习' : 'Practice'}
        title={isZh ? '没有足够的练习素材' : 'Not enough practice material'}
        description={isZh ? '学一组单词后再来练。' : 'Learn a small word set first.'}
        actions={
          <Button
            variant="outline"
            className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
            onClick={exitToPicker}
          >
            {isZh ? '返回模式列表' : 'Back to modes'}
          </Button>
        }
      />,
    );
  }

  const isChoiceTerminal =
    choiceOutcome === 'firstTryCorrect' ||
    choiceOutcome === 'recovered' ||
    choiceOutcome === 'needsReview';
  const isChoiceRetrying = choiceOutcome === 'tryAgain';
  const shouldRevealChoiceAnswer = choiceOutcome === 'needsReview' && choiceAttemptState.revealed;

  return renderPageShell(
    <LearningWorkspaceSurface
      eyebrow={isZh ? '练习' : 'Practice'}
      title={focusedModeLabel}
      actions={
        <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
          {isZh ? `第 ${currentQuestionIndex + 1} / ${quizQuestions.length} 题` : `Question ${currentQuestionIndex + 1} / ${quizQuestions.length}`}
        </Badge>
      }
    >
      <div className="space-y-6">
        <div className="max-w-3xl space-y-5">
          <div className="space-y-3">
            <Badge className={practiceBadgeClass}>
              {currentQuestion?.word.word}
            </Badge>
            <h3 className="text-3xl font-semibold text-foreground">{currentQuestion?.question}</h3>
            <p className="text-base leading-7 text-muted-foreground">{currentQuestion?.questionZh}</p>
          </div>

          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={(value) => {
              if (choiceAttemptState.blockedAnswers.includes(value)) return;
              setSelectedAnswer(value);
            }}
            disabled={isChoiceTerminal}
            className="space-y-2"
          >
            {currentQuestion?.options.map((option, index) => {
              const blocked = choiceAttemptState.blockedAnswers.includes(option);
              const selected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              const showCorrect = (shouldRevealChoiceAnswer && isCorrectOption) || (isChoiceTerminal && selected && isCorrectOption);
              return (
                <motion.div
                  key={index}
                  animate={
                    showCorrect
                      ? { scale: [1, 1.01, 1], transition: { duration: 0.2 } }
                      : blocked
                        ? { x: [0, -3, 3, 0], transition: { duration: 0.22 } }
                        : {}
                  }
                  className={cn(
                    'flex items-center space-x-3 rounded-md border px-4 py-4 transition-all',
                    showCorrect
                      ? correctOptionClass
                      : blocked
                        ? blockedOptionClass
                        : selected
                          ? 'border-[hsl(var(--accent-practice)/0.42)] bg-[hsl(var(--accent-practice)/0.08)] text-foreground'
                          : 'border-border bg-[hsl(var(--surface-raised))] hover:border-border hover:bg-muted',
                    (blocked || isChoiceTerminal) && 'cursor-default',
                  )}
                >
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    disabled={blocked || isChoiceTerminal}
                    className="border-border text-[hsl(var(--accent-practice))]"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className={cn(
                      'flex-1 text-sm leading-6 text-foreground',
                      blocked || isChoiceTerminal ? 'cursor-default' : 'cursor-pointer',
                    )}
                  >
                    {option}
                  </Label>
                  {showCorrect ? <Check className="h-5 w-5 text-[hsl(var(--success))]" /> : null}
                  {blocked ? <X className="h-5 w-5 text-destructive" /> : null}
                </motion.div>
              );
            })}
          </RadioGroup>

          {choiceOutcome ? (
            <div
              className={cn(
                'rounded-md border px-4 py-3 text-sm leading-6',
                practiceFeedbackToneClass[choiceOutcome],
              )}
            >
              <p className="font-semibold">
                {choiceOutcome === 'firstTryCorrect'
                  ? (isZh ? '首答正确' : 'First try correct')
                  : choiceOutcome === 'recovered'
                    ? (isZh ? '重试后答对' : 'Recovered after retry')
                    : choiceOutcome === 'needsReview'
                      ? (isZh ? '正确答案' : 'Correct answer')
                      : (isZh ? '还没对，再试一次' : 'Not yet. Try once more')}
              </p>
              <p className="mt-1">
                {choiceOutcome === 'needsReview'
                  ? currentQuestion?.correctAnswer
                  : choiceOutcome === 'tryAgain' && currentQuestion
                    ? buildPracticeHint(currentQuestion.word, { mode: selectedMode === 'fill_blank' ? 'fill_blank' : 'quiz', isZh })
                    : choiceOutcome === 'recovered'
                      ? (isZh ? '已标记为修正。' : 'Marked as recovered.')
                      : (isZh ? '首答正确，已保存。' : 'Saved as first-try correct.')}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 lg:flex-row lg:items-center lg:justify-between">
          {!isChoiceTerminal ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleAnswer} disabled={!selectedAnswer} className={cn(workbookButtonClass, 'lg:min-w-[180px]')}>
                {isChoiceRetrying ? (isZh ? '再试一次' : 'Try again') : (isZh ? '检查答案' : 'Check answer')}
              </Button>
              {choiceAttemptState.attempts.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={handleRevealAnswer}
                  className="rounded-md border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                >
                  {isZh ? '看答案' : 'Show answer'}
                </Button>
              ) : null}
            </div>
          ) : (
            <Button onClick={handleNext} className={cn(workbookButtonClass, 'lg:min-w-[180px]')}>
              {isZh ? '下一题' : 'Next question'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <div className="text-sm leading-6 text-muted-foreground">
            {isChoiceTerminal
              ? (isZh ? `首答正确率 ${firstTryAccuracyPct}%` : `First-try accuracy ${firstTryAccuracyPct}%`)
              : isChoiceRetrying
                ? (isZh ? '换一个选项，不会直接显示答案。' : 'Choose another option; the answer stays hidden.')
                : (isZh ? '选择答案后检查。' : 'Choose the best answer, then check.')}
          </div>
        </div>
      </div>
    </LearningWorkspaceSurface>,
  );
}

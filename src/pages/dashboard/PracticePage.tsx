import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  Layers3,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { AiFeedback } from '@/types/examContent';
import { getContentItemsByUnit, getContentUnits, getQuotaSnapshot, saveAiFeedbackRecord, saveItemAttempt } from '@/data/examContent';
import { consumeExamFeatureQuota, createAttempt, gradeIeltsWriting } from '@/services/aiExamCoach';
import { recordLearningEvent } from '@/services/learningEvents';
import { speakEnglishText } from '@/services/tts';
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

const darkInputClass =
  'border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus-visible:border-emerald-400/40 focus-visible:ring-emerald-400/30';

const darkSelectContentClass = 'border-white/10 bg-[#101010] text-white';

export default function PracticePage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const { dailyWords, dueWords, streak, addStudySession, completeMissionTask } = useUserData();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState<AiFeedback | null>(null);
  const [writingPrompt, setWritingPrompt] = useState('');
  const [writingTaskType, setWritingTaskType] = useState<'task1' | 'task2'>('task2');
  const [writingItemId, setWritingItemId] = useState('practice_ielts_manual');
  const [feedbackQuotaRemaining, setFeedbackQuotaRemaining] = useState<number | null>(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [isWritingSubmitting, setIsWritingSubmitting] = useState(false);
  const [listeningInput, setListeningInput] = useState('');
  const [listeningResult, setListeningResult] = useState<{
    isCorrect: boolean;
    expected: string;
    submitted: string;
  } | null>(null);
  const listeningInputRef = useRef<HTMLInputElement | null>(null);
  const quizQuestions = useMemo(
    () =>
      selectedMode === 'quiz' || selectedMode === 'fill_blank'
        ? buildPracticeQuestions(dailyWords, selectedMode, `${userId}:${selectedMode}`)
        : [],
    [dailyWords, selectedMode, userId],
  );
  const listeningWords = useMemo(
    () => (selectedMode === 'listening' ? buildListeningQueue(dailyWords, `${userId}:listening`) : []),
    [dailyWords, selectedMode, userId],
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
  const progress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;
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
  };

  const handleAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowResult(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success('Correct! +10 XP');
    } else {
      toast.error('Incorrect. Try again!');
    }

    void recordLearningEvent({
      userId,
      eventName: 'practice.quiz_submitted',
      payload: {
        mode: selectedMode || 'quiz',
        isCorrect,
        questionId: currentQuestion.id,
        word: currentQuestion.word.word,
      },
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
    } else {
      toast.error(`Not quite. Correct answer: ${currentWord.word}`);
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
    <LearningRailSection
      title="Mode switcher"
      description="先定训练方式，再进入一个完整工作区。不要把所有入口同时摆在首屏。"
    >
      <nav className="space-y-2" aria-label="Practice modes">
        {practiceModes.map((mode) => {
          const active = focusedModeId === mode.id;
          const Icon = mode.icon;
          const blueprint = modeBlueprints[mode.id as keyof typeof modeBlueprints];

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => pickMode(mode.id)}
              className={cn(
                'group relative w-full rounded-[22px] border border-transparent px-4 py-3 text-left transition-colors',
                active ? 'bg-white/[0.06]' : 'hover:border-white/8 hover:bg-white/[0.03]',
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-3 left-0 w-[3px] rounded-full transition-colors',
                  active ? 'bg-emerald-400' : 'bg-transparent group-hover:bg-white/20',
                )}
              />
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border text-white/72',
                    active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/[0.04]',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white">{mode.name}</span>
                    {mode.id === recommendedModeId ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        推荐
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/45">{mode.nameZh}</span>
                  <span className="mt-2 block text-xs leading-5 text-white/54">{blueprint.focus}</span>
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
      <LearningRailSection title="Next best move" description="解释为什么今天先练这一轮，而不是四个模式一起打开。">
        <div className="space-y-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold">{focusedMode.nameZh} · {focusedMode.name}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">{focusedBlueprint.reason}</p>
            <p className="mt-3 text-sm leading-6 text-emerald-300">{focusedBlueprint.insight}</p>
          </div>
        </div>
      </LearningRailSection>

      <LearningRailSection title="Today at a glance" description="只保留会影响训练节奏的少量事实。">
        <LearningMetricStrip
          items={[
            { label: 'Due', value: dueWords.length, accent: dueWords.length > 0 ? 'warm' : 'default', hint: '先清旧账，再做新练习。' },
            { label: 'Ready', value: dailyWords.length, hint: '今天的素材会直接转成题目。' },
            { label: 'Streak', value: streak.current, accent: 'emerald', hint: '稳住节奏，比偶尔猛冲更有效。' },
          ]}
          className="border-t-0 pt-0"
        />
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-white/72">
            <Layers3 className="h-4 w-4 text-emerald-300" />
            <p className="text-sm font-medium">当前阶段</p>
          </div>
          <p className="mt-3 text-lg font-semibold text-white">{sessionStage}</p>
          <p className="mt-2 text-sm leading-6 text-white/54">只做当前这一步，不要同时处理所有信息。</p>
        </div>
        {selectedMode === 'writing' ? (
          <div className="rounded-[22px] border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
            <div className="flex items-center gap-2 text-emerald-300">
              <Zap className="h-4 w-4" />
              <p className="text-sm font-semibold">Advanced feedback quota</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">
              {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/58">把配额留给完整输出，不要浪费在半成品上。</p>
          </div>
        ) : null}
      </LearningRailSection>
    </div>
  );

  const pageTitle = !selectedMode
    ? '先锁定今天最值得练的一种模式。'
    : !hasStarted
      ? `准备进入 ${focusedMode.nameZh}，把这轮边界先定清楚。`
      : isComplete
        ? '这轮短练习已经完成。'
        : `把这一轮 ${focusedMode.nameZh} 做完，不要中途切走。`;

  const pageDescription = !selectedMode
    ? '练习页不该像模式广场。这里先给你一个清晰推荐，再把主要空间留给当前任务，减少干扰和无意义选择。'
    : !hasStarted
      ? focusedBlueprint.reason
      : isComplete
        ? '先看这轮结果，再决定是否换模式或重新来一遍。'
        : focusedBlueprint.focus;

  const heroProgress =
    selectedMode && hasStarted && !isComplete && selectedMode !== 'writing'
      ? Math.min(100, Math.round(progress))
      : selectedMode === 'writing' && writingFeedback
        ? 100
        : null;

  const renderPageShell = (mainContent: ReactNode) => (
    <LearningShellFrame>
      <LearningHeroPanel
        eyebrow="Practice mode"
        title={pageTitle}
        description={pageDescription}
        progress={heroProgress}
        progressLabel="Session progress"
        metrics={[
          { label: 'Recommended', value: focusedMode.nameZh, accent: 'emerald', hint: focusedBlueprint.labelZh },
          { label: 'Estimated', value: `${focusedBlueprint.estimatedMinutes} min`, hint: '先把当前回合做完，不在中途加码。' },
          { label: 'Prompts', value: focusedBlueprint.estimatedQuestions, hint: '小回合比大而散的训练更容易完成。' },
        ]}
        actions={
          <>
            {!selectedMode ? (
              <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={() => pickMode(focusedModeId)}>
                Review this mode
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : !hasStarted ? (
              <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={startFocusedMode}>
                Start practice
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
            {selectedMode ? (
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                onClick={exitToPicker}
              >
                Change mode
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_300px] xl:items-start">
        <div className="min-w-0">{renderModeSelector()}</div>
        <div className="min-w-0">{mainContent}</div>
        <div className="min-w-0">{renderInsightRail()}</div>
      </div>
    </LearningShellFrame>
  );

  const renderFactStrip = (items: { label: string; value: ReactNode; hint: string; accent?: 'default' | 'emerald' | 'warm' }[]) => (
    <LearningMetricStrip items={items.map((item) => ({ label: item.label, value: item.value, hint: item.hint, accent: item.accent }))} />
  );

  if (!selectedMode) {
    return renderPageShell(
      <LearningWorkspaceSurface
        eyebrow="Recommended for today"
        title={`${focusedMode.name} · ${focusedMode.nameZh}`}
        description="首屏只保留一个主动作。先看清楚为什么做这轮，再进入练习工作区。"
      >
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 hover:bg-emerald-500/10">
              {focusedBlueprint.labelZh}
            </Badge>
            <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/65 hover:bg-white/[0.03]">
              {focusedBlueprint.estimatedQuestions} 题
            </Badge>
            <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/65 hover:bg-white/[0.03]">
              {focusedBlueprint.estimatedMinutes} 分钟
            </Badge>
          </div>

          <div className="max-w-3xl space-y-3">
            <p className="text-lg leading-8 text-white">{focusedBlueprint.focus}</p>
            <p className="text-base leading-7 text-white/58">{focusedBlueprint.reason}</p>
          </div>

          {renderFactStrip([
            { label: '训练目标', value: focusedMode.description, hint: '先把这轮任务边界说清楚。' },
            { label: '预计时长', value: `${focusedBlueprint.estimatedMinutes} min`, hint: '给你一个可预期的完成成本。', accent: 'emerald' },
            { label: '今日素材', value: `${dailyWords.length} words`, hint: '直接用今天的词，减少切换。' },
          ])}

          <div className="grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
            <ol className="grid gap-3 sm:grid-cols-3">
              {[
                ['1', '先选模式', '决定是理解、回想、听辨还是输出。'],
                ['2', '进入工作区', '只显示当前任务需要的信息。'],
                ['3', '拿到反馈', '做完一轮后再决定下一步。'],
              ].map(([step, title, note]) => (
                <li key={step} className="space-y-2 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
                    {step}
                  </span>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-sm leading-6 text-white/54">{note}</p>
                </li>
              ))}
            </ol>
            <div className="space-y-3 lg:border-l lg:border-white/10 lg:pl-6">
              <Button className="w-full rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={() => pickMode(focusedModeId)}>
                Review this mode
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-sm leading-6 text-white/54">
                先看模式说明，再进入练习。首屏只保留一个主动作，避免被四个入口同时拉扯。
              </p>
            </div>
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
        description="进入后只保留当前训练需要的内容。模式切换仍在左侧，但不再把首屏重新塞满说明卡。"
      >
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 hover:bg-emerald-500/10">
              {focusedBlueprint.label}
            </Badge>
            <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/65 hover:bg-white/[0.03]">
              <Clock3 className="mr-1.5 h-3.5 w-3.5" />
              {focusedBlueprint.estimatedMinutes} min
            </Badge>
            <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/65 hover:bg-white/[0.03]">
              <Layers3 className="mr-1.5 h-3.5 w-3.5" />
              {focusedBlueprint.estimatedQuestions} prompts
            </Badge>
            {selectedMode === 'writing' ? (
              <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/65 hover:bg-white/[0.03]">
                AI feedback left: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
              </Badge>
            ) : null}
          </div>

          <div className="max-w-3xl space-y-3">
            <p className="text-lg leading-8 text-white">{focusedBlueprint.focus}</p>
            <p className="text-base leading-7 text-white/58">{focusedBlueprint.reason}</p>
          </div>

          {renderFactStrip([
            { label: '这轮会做什么', value: focusedMode.description, hint: '明确任务边界，减少开始前焦虑。' },
            { label: '为什么现在做', value: focusedBlueprint.labelZh, hint: focusedBlueprint.reason, accent: 'emerald' },
            {
              label: '完成后得到什么',
              value: selectedMode === 'writing' ? '结构化评分' : '正确率 + 下一步建议',
              hint: selectedMode === 'writing' ? '拿到可执行的改写与问题标签。' : '知道是否继续补同一块。',
            },
          ])}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl text-sm leading-6 text-white/54">
              进入后只保留当前训练需要的内容。你可以随时改模式，但不该在开始前被四种工作区同时拉扯。
            </div>
            <LearningActionCluster>
              <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={startFocusedMode}>
                Start practice
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
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
        description="编辑器是主舞台。先把草稿写完，再决定是否调用评分，不要一上来就在多个辅助工具之间切换。"
        actions={
          <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/65 hover:bg-white/[0.03]">
            AI feedback left: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
          </Badge>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
            <div className="space-y-3">
              <Label className="text-white">Task Type</Label>
              <Select value={writingTaskType} onValueChange={(value: 'task1' | 'task2') => setWritingTaskType(value)}>
                <SelectTrigger className={cn('rounded-[22px]', darkInputClass)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={darkSelectContentClass}>
                  <SelectItem value="task1" className="focus:bg-white/10 focus:text-white">Task 1</SelectItem>
                  <SelectItem value="task2" className="focus:bg-white/10 focus:text-white">Task 2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm leading-6 text-white/54">先定题型，再用同一工作区完成 prompt、写作和反馈。</p>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Prompt</Label>
              <Textarea
                value={writingPrompt}
                onChange={(event) => setWritingPrompt(event.target.value)}
                className={cn('min-h-[140px] rounded-[24px] p-4', darkInputClass)}
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-5">
            <Label className="text-white">Your response</Label>
            <Textarea
              value={writingInput}
              onChange={(event) => setWritingInput(event.target.value)}
              placeholder="Write your IELTS response here..."
              className={cn('min-h-[300px] rounded-[26px] p-5 text-base leading-7', darkInputClass)}
            />
          </div>

          {!writingFeedback ? (
            <div className="flex flex-col gap-4 border-t border-white/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-xl text-sm leading-6 text-white/54">
                先交一版，再根据四维评分修改。不要一开始就试图把答案写到完美。
              </p>
              <Button
                onClick={handleWritingSubmit}
                className="rounded-full bg-emerald-500 px-5 text-black hover:bg-emerald-400"
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
              className="space-y-5 border-t border-white/10 pt-6"
            >
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                Writing feedback
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                {[
                  ['Task', writingFeedback.scores.taskResponse.toFixed(1)],
                  ['Coherence', writingFeedback.scores.coherenceCohesion.toFixed(1)],
                  ['Lexical', writingFeedback.scores.lexicalResource.toFixed(1)],
                  ['Grammar', writingFeedback.scores.grammaticalRangeAccuracy.toFixed(1)],
                  ['Overall', writingFeedback.scores.overallBand.toFixed(1)],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={cn(
                      'rounded-[22px] border border-white/10 bg-white/[0.03] p-4',
                      index === 4 && 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300',
                    )}
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{label}</p>
                    <p className="mt-3 text-2xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {writingFeedback.issues.map((issue, index) => (
                  <div key={`${issue.tag}-${index}`} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-white">{issue.message}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">{issue.suggestion}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end border-t border-white/10 pt-5">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
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
          description="先学一组新词，系统才有足够素材生成一轮听辨训练。"
          actions={
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
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
        description="播放单词，输入你听到的内容。先把发音和拼写对齐，再进入下一题。"
      >
        <div className="space-y-6">
          <div className="space-y-2 border-b border-white/10 pb-5">
            <div className="flex items-center justify-between text-sm text-white/48">
              <span>Question {currentQuestionIndex + 1} of {listeningWords.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10 [&_[data-slot=progress-indicator]]:bg-emerald-400" />
          </div>

          <div className="mx-auto max-w-2xl space-y-6 py-6 text-center">
            <Headphones className="mx-auto h-16 w-16 text-emerald-300" />

            <div className="space-y-4">
              <Button size="lg" className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={() => playAudio(currentWord.word)}>
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
                  className={cn('h-14 rounded-full px-5 text-center text-lg', darkInputClass)}
                />
              </div>

              {!listeningResult ? (
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
                  onClick={handleListeningCheck}
                  disabled={!listeningInput.trim()}
                >
                  Check answer
                </Button>
              ) : (
                <div className="space-y-3">
                  <div
                    className={cn(
                      'mx-auto max-w-md rounded-[22px] px-4 py-3 text-sm',
                      listeningResult.isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300',
                    )}
                  >
                    {listeningResult.isCorrect ? 'Correct!' : `Expected: ${listeningResult.expected}`}
                  </div>
                  <Button onClick={handleListeningNext} className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400">
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

    return renderPageShell(
      <LearningCompletionState
        icon={Trophy}
        eyebrow="Session summary"
        title="这轮短练习已经完成"
        description="先看这轮结果，再决定下一步。不要在完成前频繁换模式；完成后再切换，学习信号才足够清晰。"
        metrics={[
          { label: 'Correct', value: `${score}/${safeTotal}`, accent: 'emerald' },
          { label: 'Accuracy', value: `${accuracy}%`, accent: 'emerald' },
          { label: 'Mode', value: focusedMode.nameZh },
        ]}
        actions={
          <>
            <Button
              onClick={handleRestart}
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={exitToPicker}>
              Other modes
            </Button>
          </>
        }
      />,
    );
  }

  if (quizQuestions.length === 0) {
    return renderPageShell(
      <LearningEmptyState
        icon={Target}
        eyebrow="Practice workspace"
        title="没有足够的练习素材"
        description="请先学一组单词，再回来做这轮短练习。"
        actions={
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
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
      description="当前工作区只服务这一题。选答案、检查、继续，直到这轮练完。"
      actions={
        <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/65 hover:bg-white/[0.03]">
          Question {currentQuestionIndex + 1} / {quizQuestions.length}
        </Badge>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2 border-b border-white/10 pb-5">
          <div className="flex items-center justify-between text-sm text-white/48">
            <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10 [&_[data-slot=progress-indicator]]:bg-emerald-400" />
        </div>

        <div className="max-w-3xl space-y-5">
          <div className="space-y-3">
            <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 hover:bg-emerald-500/10">
              {currentQuestion?.word.word}
            </Badge>
            <h3 className="text-3xl font-semibold tracking-tight text-white">{currentQuestion?.question}</h3>
            <p className="text-base leading-7 text-white/58">{currentQuestion?.questionZh}</p>
          </div>

          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={setSelectedAnswer}
            disabled={showResult}
            className="space-y-2"
          >
            {currentQuestion?.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-3 rounded-[22px] border px-4 py-4 transition-all',
                  showResult && option === currentQuestion.correctAnswer
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                    : showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer
                      ? 'border-red-500/20 bg-red-500/10 text-red-300'
                      : selectedAnswer === option
                        ? 'border-white/12 bg-white/[0.05]'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]',
                )}
              >
                <RadioGroupItem value={option} id={`option-${index}`} className="border-white/20 text-emerald-300" />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm leading-6 text-white">
                  {option}
                </Label>
                {showResult && option === currentQuestion.correctAnswer ? <Check className="h-5 w-5 text-emerald-300" /> : null}
                {showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer ? <X className="h-5 w-5 text-red-300" /> : null}
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
          {!showResult ? (
            <Button onClick={handleAnswer} disabled={!selectedAnswer} className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400 lg:min-w-[180px]">
              Check answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400 lg:min-w-[180px]">
              Next question
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <div className="text-sm leading-6 text-white/54">
            {showResult ? `当前正确率 ${accuracyPct}%` : '先选一个最合适的答案，再检查。'}
          </div>
        </div>
      </div>
    </LearningWorkspaceSurface>,
  );
}

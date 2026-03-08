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
    color: 'bg-blue-500',
  },
  {
    id: 'fill_blank',
    name: 'Fill in the Blank',
    nameZh: '填空题',
    description: 'Complete sentences with the correct word',
    icon: PenTool,
    color: 'bg-purple-500',
  },
  {
    id: 'listening',
    name: 'Listening Quiz',
    nameZh: '听力测验',
    description: 'Listen and identify the correct word',
    icon: Headphones,
    color: 'bg-pink-500',
  },
  {
    id: 'writing',
    name: 'Writing Practice',
    nameZh: '写作练习',
    description: 'Write sentences and get AI feedback',
    icon: Zap,
    color: 'bg-emerald-500',
  },
];

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

  const modeBlueprints = useMemo(() => ({
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
  }), [dailyWords.length, dueWords.length]);

  const focusedBlueprint = modeBlueprints[focusedModeId as keyof typeof modeBlueprints];
  const accuracyPct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
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
  <section className="space-y-5">
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Mode switcher</p>
      <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">
        先定训练方式，再进入一个完整工作区。不要把所有入口同时摆在首屏。
      </p>
    </div>

    <nav className="space-y-1.5" aria-label="Practice modes">
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
              'group relative flex w-full items-start gap-3 rounded-[22px] px-3 py-3 text-left transition-colors duration-150',
              active ? 'bg-emerald-500/[0.09]' : 'hover:bg-muted/35',
            )}
          >
            <span
              className={cn(
                'absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-colors',
                active ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-border',
              )}
            />
            <span className={cn('mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm', mode.color)}>
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-foreground">{mode.name}</span>
                {mode.id === recommendedModeId ? (
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                    推荐
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{mode.nameZh}</span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">{blueprint.focus}</span>
            </span>
          </button>
        );
      })}
    </nav>
  </section>
);

const renderInsightRail = () => {
  const sessionStage = !selectedMode
    ? '先选模式'
    : !hasStarted
      ? '准备开始'
      : isComplete
        ? '本轮完成'
        : '进行中';

  return (
    <aside className="space-y-8 xl:border-l xl:border-border/70 xl:pl-7">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          Next best move
        </div>
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground">{focusedMode.nameZh} · {focusedMode.name}</p>
          <p className="text-sm leading-6 text-muted-foreground">{focusedBlueprint.reason}</p>
          <div className="text-sm leading-6 text-emerald-800 dark:text-emerald-200">{focusedBlueprint.insight}</div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <Layers3 className="h-3.5 w-3.5 text-emerald-600" />
          Today at a glance
        </div>
        <div className="space-y-3 text-sm">
          {[
            { label: '到期复习', value: dueWords.length, note: '先清旧账，再做新练习。' },
            { label: '今日素材', value: dailyWords.length, note: '可直接转成练习题。' },
            { label: '连续学习', value: streak.current, note: '稳住节奏，比偶尔猛冲更有效。' },
            { label: '当前阶段', value: sessionStage, note: '只做当前这一步，不要同时处理所有信息。' },
          ].map((item) => (
            <div key={item.label} className="space-y-1 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-foreground">{item.label}</p>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
              <p className="leading-6 text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};

const renderPageShell = (mainContent: ReactNode) => (
  <div className="space-y-10">
    <section className="grid gap-8 border-b border-border/70 pb-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Practice</span>
          {dueWords.length > 0 ? (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              {dueWords.length} due
            </span>
          ) : null}
        </div>
        <div className="space-y-3">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground lg:text-[3.2rem] lg:leading-[1.05]">
            用一轮更聚焦的短练习，把今天最值得补的那一块真正做完。
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground lg:text-lg">
            练习页不该像模式广场。这里先给你一个清晰推荐，再把主要空间留给当前任务，减少干扰和无意义选择。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 lg:border-l lg:border-border/70 lg:pl-6">
        {[
          { label: 'Due', value: dueWords.length },
          { label: 'Ready', value: dailyWords.length },
          { label: 'Streak', value: streak.current },
        ].map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </section>

    <div className="grid gap-10 xl:grid-cols-[240px_minmax(0,1fr)_260px] xl:items-start">
      <div className="min-w-0">{renderModeSelector()}</div>
      <div className="min-w-0">{mainContent}</div>
      <div className="min-w-0">{renderInsightRail()}</div>
    </div>
  </div>
);

const renderWorkspaceSurface = (
  title: string,
  subtitle: string,
  body: ReactNode,
  actions?: ReactNode,
) => (
  <section className="overflow-hidden rounded-[34px] border border-border/75 bg-background/78 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
    <div className="border-b border-border/70 px-6 py-5 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
    <div className="px-6 py-6 lg:px-8 lg:py-7">{body}</div>
  </section>
);

const renderSplitFacts = (items: { label: string; value: ReactNode; note: string }[]) => (
  <div className="grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-3">
    {items.map((item) => (
      <div key={item.label} className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
        <div className="text-lg font-semibold text-foreground">{item.value}</div>
        <p className="text-sm leading-6 text-muted-foreground">{item.note}</p>
      </div>
    ))}
  </div>
);

if (!selectedMode) {
  return renderPageShell(
    renderWorkspaceSurface(
      `${focusedMode.name} · ${focusedMode.nameZh}`,
      'Recommended for today',
      <div className="space-y-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
            {focusedBlueprint.labelZh}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {focusedBlueprint.estimatedQuestions} 题
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {focusedBlueprint.estimatedMinutes} 分钟
          </Badge>
        </div>

        <div className="max-w-3xl space-y-3">
          <p className="text-lg leading-8 text-foreground">{focusedBlueprint.focus}</p>
          <p className="text-base leading-7 text-muted-foreground">{focusedBlueprint.reason}</p>
        </div>

        {renderSplitFacts([
          { label: '训练目标', value: focusedMode.description, note: '先把这轮任务边界说清楚。' },
          { label: '预计时长', value: `${focusedBlueprint.estimatedMinutes} min`, note: '给你一个可预期的完成成本。' },
          { label: '今日素材', value: `${dailyWords.length} words`, note: '直接用今天的词，减少切换。' },
        ])}

        <div className="grid gap-4 border-t border-border/70 pt-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              ['1', '先选模式', '决定是理解、回想、听辨还是输出。'],
              ['2', '进入工作区', '只显示当前任务需要的信息。'],
              ['3', '拿到反馈', '做完一轮后再决定下一步。'],
            ].map(([step, title, note]) => (
              <li key={step} className="space-y-2 rounded-[22px] bg-muted/35 px-4 py-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                  {step}
                </span>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{note}</p>
              </li>
            ))}
          </ol>
          <div className="space-y-3 lg:border-l lg:border-border/70 lg:pl-6">
            <Button className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700" onClick={() => pickMode(focusedModeId)}>
              Review this mode
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm leading-6 text-muted-foreground">
              先看模式说明，再进入练习。首屏只保留一个主动作，避免被四张并列卡片打断。
            </p>
          </div>
        </div>
      </div>,
    ),
  );
}

if (!hasStarted) {
  return renderPageShell(
    renderWorkspaceSurface(
      `${focusedMode.name} · ${focusedMode.nameZh}`,
      'Prepare the session',
      <div className="space-y-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
            {focusedBlueprint.label}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            <Clock3 className="mr-1.5 h-3.5 w-3.5" />
            {focusedBlueprint.estimatedMinutes} min
          </Badge>
          <Badge variant="outline" className="rounded-full">
            <Layers3 className="mr-1.5 h-3.5 w-3.5" />
            {focusedBlueprint.estimatedQuestions} prompts
          </Badge>
          {selectedMode === 'writing' ? (
            <Badge variant="outline" className="rounded-full">
              feedback left: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
            </Badge>
          ) : null}
        </div>

        <div className="max-w-3xl space-y-3">
          <p className="text-lg leading-8 text-foreground">{focusedBlueprint.focus}</p>
          <p className="text-base leading-7 text-muted-foreground">{focusedBlueprint.reason}</p>
        </div>

        {renderSplitFacts([
          { label: '这轮会做什么', value: focusedMode.description, note: '明确任务边界，减少开始前焦虑。' },
          { label: '为什么现在做', value: focusedBlueprint.labelZh, note: focusedBlueprint.reason },
          {
            label: '完成后得到什么',
            value: selectedMode === 'writing' ? '结构化评分' : '正确率 + 下一步建议',
            note: selectedMode === 'writing' ? '拿到可执行的改写与问题标签。' : '知道是否继续补同一块。',
          },
        ])}

        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl text-sm leading-6 text-muted-foreground">
            进入后只保留当前训练需要的内容。模式切换仍在左侧，不会把整个首屏重新塞满说明卡。
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="rounded-2xl bg-emerald-600 px-5 hover:bg-emerald-700" onClick={startFocusedMode}>
              Start practice
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-2xl" onClick={exitToPicker}>
              Back to mode picker
            </Button>
          </div>
        </div>
      </div>,
      <Button variant="outline" className="rounded-2xl" onClick={exitToPicker}>
        Change mode
      </Button>,
    ),
  );
}

if (selectedMode === 'writing') {
  return renderPageShell(
    renderWorkspaceSurface(
      'IELTS Writing Coach',
      'Writing workspace',
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-3">
            <Label>Task Type</Label>
            <Select value={writingTaskType} onValueChange={(value: 'task1' | 'task2') => setWritingTaskType(value)}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task1">Task 1</SelectItem>
                <SelectItem value="task2">Task 2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm leading-6 text-muted-foreground">
              先定题型，再用同一工作区完成 prompt、写作和反馈。
            </p>
          </div>
          <div className="space-y-3">
            <Label>Prompt</Label>
            <Textarea
              value={writingPrompt}
              onChange={(e) => setWritingPrompt(e.target.value)}
              className="min-h-[140px] rounded-[24px] border-border/80 bg-muted/20 p-4"
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-border/70 pt-5">
          <Label>Your response</Label>
          <Textarea
            value={writingInput}
            onChange={(e) => setWritingInput(e.target.value)}
            placeholder="Write your IELTS response here..."
            className="min-h-[280px] rounded-[26px] border-border/80 bg-muted/15 p-5 text-base leading-7"
          />
        </div>

        {!writingFeedback ? (
          <div className="flex flex-col gap-4 border-t border-border/70 pt-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              先交一版，再根据四维评分修改。不要一开始就试图把答案写到完美。
            </p>
            <Button
              onClick={handleWritingSubmit}
              className="rounded-2xl bg-emerald-600 px-5 hover:bg-emerald-700"
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
            className="space-y-5 border-t border-border/70 pt-6"
          >
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
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
                <div key={label} className={cn('space-y-1 border-b border-border/70 pb-3 md:border-b-0 md:pb-0', index === 4 && 'text-emerald-700 dark:text-emerald-300')}>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-border/70 pt-5">
              {writingFeedback.issues.map((issue, index) => (
                <div key={`${issue.tag}-${index}`} className="space-y-1 border-l border-border pl-4">
                  <p className="text-sm font-medium text-foreground">{issue.message}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{issue.suggestion}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-border/70 pt-5">
              <Button onClick={handleRestart} variant="outline" className="rounded-2xl">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try another
              </Button>
            </div>
          </motion.div>
        )}
      </div>,
      <>
        <Badge variant="outline" className="rounded-full">
          feedback left: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
        </Badge>
        <Button variant="outline" className="rounded-2xl" onClick={exitToPicker}>
          Change mode
        </Button>
      </>,
    ),
  );
}

if (selectedMode === 'listening') {
  const currentWord = listeningWords[currentQuestionIndex];

  if (!currentWord) {
    return renderPageShell(
      renderWorkspaceSurface(
        'No words available',
        'Listening workspace',
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900">
            <Target className="h-8 w-8" />
          </div>
          <p className="max-w-md text-base leading-7 text-muted-foreground">Please learn some words first, then come back for a listening round.</p>
          <Button variant="outline" className="mt-5 rounded-2xl" onClick={exitToPicker}>
            Back to modes
          </Button>
        </div>,
      ),
    );
  }

  return renderPageShell(
    renderWorkspaceSurface(
      'Listening Quiz',
      'Listening workspace',
      <div className="space-y-6">
        <div className="space-y-2 border-b border-border/70 pb-5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {listeningWords.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mx-auto max-w-2xl space-y-6 py-4 text-center">
          <Headphones className="mx-auto h-16 w-16 text-emerald-500" />
          <div className="space-y-2">
            <h3 className="text-3xl font-semibold tracking-tight text-foreground">Listen, then type</h3>
            <p className="text-base leading-7 text-muted-foreground">
              播放单词，输入你听到的内容。先把发音和拼写对齐，再进入下一题。
            </p>
          </div>

          <div className="space-y-4">
            <Button size="lg" className="rounded-2xl bg-emerald-600 hover:bg-emerald-700" onClick={() => playAudio(currentWord.word)}>
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
                className="h-14 rounded-2xl border-border/80 bg-background px-5 text-center text-lg text-foreground caret-emerald-500 placeholder:text-muted-foreground"
              />
            </div>

            {!listeningResult ? (
              <Button variant="outline" className="rounded-2xl" onClick={handleListeningCheck} disabled={!listeningInput.trim()}>
                Check answer
              </Button>
            ) : (
              <div className="space-y-3">
                <div
                  className={cn(
                    'mx-auto max-w-md rounded-2xl px-4 py-3 text-sm',
                    listeningResult.isCorrect
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300',
                  )}
                >
                  {listeningResult.isCorrect ? 'Correct!' : `Expected: ${listeningResult.expected}`}
                </div>
                <Button onClick={handleListeningNext} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700">
                  {currentQuestionIndex < listeningWords.length - 1 ? 'Next question' : 'Finish listening quiz'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>,
      <Button variant="outline" className="rounded-2xl" onClick={exitToPicker}>
        Change mode
      </Button>,
    ),
  );
}

if (isComplete) {
  const safeTotal = Math.max(totalQuestions, 1);
  const accuracy = Math.round((score / safeTotal) * 100);
  return renderPageShell(
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
      {renderWorkspaceSurface(
        'Practice complete',
        'Session summary',
        <div className="space-y-7 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Trophy className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <p className="text-base leading-7 text-muted-foreground">这轮短练习已经完成，先看结果，再决定下一步。</p>
          </div>
          <div className="grid gap-6 border-t border-border/70 pt-5 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Correct</p>
              <p className="text-4xl font-semibold text-emerald-600">{score}/{safeTotal}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Accuracy</p>
              <p className="text-4xl font-semibold text-emerald-600">{accuracy}%</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:justify-center">
            <Button onClick={handleRestart} variant="outline" className="rounded-2xl">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button onClick={exitToPicker} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700">
              Other modes
            </Button>
          </div>
        </div>,
      )}
    </motion.div>,
  );
}

if (quizQuestions.length === 0) {
  return renderPageShell(
    renderWorkspaceSurface(
      'No words available',
      'Practice workspace',
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900">
          <Target className="h-8 w-8" />
        </div>
        <p className="max-w-md text-base leading-7 text-muted-foreground">Please learn some words first, then come back for a quiz round.</p>
        <Button variant="outline" className="mt-5 rounded-2xl" onClick={exitToPicker}>
          Back to modes
        </Button>
      </div>,
    ),
  );
}

return renderPageShell(
  renderWorkspaceSurface(
    `${focusedMode.name} · ${focusedMode.nameZh}`,
    'Practice workspace',
    <div className="space-y-6">
      <div className="space-y-2 border-b border-border/70 pb-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="max-w-3xl space-y-5">
        <div className="space-y-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
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
            <div
              key={index}
              className={cn(
                'flex items-center space-x-3 rounded-[22px] px-4 py-4 transition-all',
                showResult && option === currentQuestion.correctAnswer
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                  : showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer
                    ? 'bg-red-500/10 text-red-800 dark:text-red-200'
                    : selectedAnswer === option
                      ? 'bg-muted/60'
                      : 'hover:bg-muted/35',
              )}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm leading-6">
                {option}
              </Label>
              {showResult && option === currentQuestion.correctAnswer ? <Check className="h-5 w-5 text-emerald-500" /> : null}
              {showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer ? <X className="h-5 w-5 text-red-500" /> : null}
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 pt-5 lg:flex-row lg:items-center lg:justify-between">
        {!showResult ? (
          <Button onClick={handleAnswer} disabled={!selectedAnswer} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 lg:min-w-[180px]">
            Check answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 lg:min-w-[180px]">
            Next question
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        <div className="text-sm leading-6 text-muted-foreground">
          {showResult ? `当前正确率 ${accuracyPct}%` : '先选一个最合适的答案，再检查。'}
        </div>
      </div>
    </div>,
    <Button variant="outline" className="rounded-2xl" onClick={exitToPicker}>
      Change mode
    </Button>,
  ),
);
}

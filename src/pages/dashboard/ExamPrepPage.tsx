import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Crown,
  Flame,
  Gauge,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  WandSparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAuth } from '@/contexts/AuthContext';
import {
  getAiFeedbackHistory,
  getContentItemsByUnit,
  getContentUnits,
  getEntitlement,
  getErrorGraph,
  getExamTracks,
  getItemAttempts,
  getLatestAiFeedback,
  getQuotaSnapshot,
  saveAiFeedbackRecord,
  saveItemAttempt,
} from '@/data/examContent';
import {
  askWritingTutor,
  buildQuickOutline,
  consumeExamFeatureQuota,
  createAttempt,
  enhanceVocabularyDraft,
  generateMicroLessonFromErrors,
  generateRandomIeltsPrompt,
  generateSimulationItem,
  gradeIeltsWriting,
} from '@/services/aiExamCoach';
import { recordLearningEvent } from '@/services/learningEvents';
import type { AiFeedback, ContentUnit, ExamItem, FeedbackIssue, PlanTier } from '@/types/examContent';

import { ErrorGraph } from '@/features/exam/components/ErrorGraph';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const ISSUE_LABELS: Record<FeedbackIssue['tag'], string> = {
  task_response: '任务回应',
  coherence: '连贯衔接',
  lexical: '词汇资源',
  grammar: '语法准确',
  logic: '论证逻辑',
  collocation: '搭配自然度',
  tense: '时态控制',
};

const ISSUE_VOCAB_QUERY: Record<FeedbackIssue['tag'], string> = {
  task_response: 'thesis argument opinion discuss',
  coherence: 'linking words coherence cohesion transition',
  lexical: 'academic vocabulary synonyms lexical resource',
  grammar: 'articles tense clauses grammar',
  logic: 'reasoning claim evidence logic',
  collocation: 'collocation phrase chunks',
  tense: 'verb tense consistency',
};

const QUIET_TOPICS = ['hello', 'hi', '你好', '在吗', 'hey'];

const FEATURE_TOTAL_BY_PLAN: Record<PlanTier, { aiAdvancedFeedbackPerDay: number; simItemsPerDay: number; microLessonsPerDay: number }> = {
  free: {
    aiAdvancedFeedbackPerDay: 2,
    simItemsPerDay: 2,
    microLessonsPerDay: 1,
  },
  pro: {
    aiAdvancedFeedbackPerDay: 30,
    simItemsPerDay: 20,
    microLessonsPerDay: 20,
  },
};

const DRAFT_PREFIX = 'vocabdaily_exam_prep_draft_v2';

type LoadingStage = 'idle' | 'simulating' | 'grading' | 'tutoring' | 'micro' | 'outlining' | 'vocab';

type TaskType = 'task1' | 'task2';

const parseTargetBand = (value: string): number => {
  const matched = value.match(/(\d(?:\.\d)?)(?:\s*[-~]\s*(\d(?:\.\d)?))?/);
  if (!matched) return 6.5;
  return Number(matched[2] || matched[1]);
};

const formatSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const calcStreakDays = (history: AiFeedback[]): number => {
  if (history.length === 0) return 0;
  const days = [...new Set(history.map((item) => item.createdAt.slice(0, 10)))].sort((a, b) => b.localeCompare(a));
  if (days.length === 0) return 0;

  let streak = 1;
  for (let index = 1; index < days.length; index += 1) {
    const prev = new Date(`${days[index - 1]}T00:00:00`);
    const curr = new Date(`${days[index]}T00:00:00`);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays !== 1) break;
    streak += 1;
  }

  return streak;
};

const toWordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

const scoreColor = (value: number): string => {
  if (value >= 7) return 'text-emerald-500';
  if (value >= 6) return 'text-amber-500';
  return 'text-rose-500';
};

function QuotaRing({ label, remaining, total, hint }: { label: string; remaining: number; total: number; hint: string }) {
  const safeTotal = Math.max(1, total);
  const percent = Math.max(0, Math.min(100, Math.round((remaining / safeTotal) * 100)));
  const deg = (percent / 100) * 360;

  return (
    <div className="rounded-xl border border-border/70 bg-card/90 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">
            {remaining}
            <span className="ml-1 text-xs font-normal text-muted-foreground">/ {safeTotal}</span>
          </p>
        </div>
        <div
          className="relative h-11 w-11 rounded-full"
          style={{
            background: `conic-gradient(#10b981 ${deg}deg, rgba(148,163,184,0.25) ${deg}deg)`,
          }}
        >
          <span className="absolute inset-[4px] rounded-full bg-background" />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-emerald-500">
            {percent}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function ScoreCell({ title, value, highlight = false }: { title: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-center',
        highlight && 'border-emerald-400/60 bg-emerald-500/10',
      )}
    >
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className={cn('text-xl font-semibold tabular-nums', scoreColor(value))}>{value.toFixed(1)}</p>
    </div>
  );
}

function EmptyKickoffCard({ onQuickStart }: { onQuickStart: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-emerald-400/40 bg-emerald-500/[0.06] p-4 text-sm">
      <p className="font-semibold text-emerald-500">还没有错因图谱</p>
      <p className="mt-1 text-muted-foreground">先做 1 次写作反馈，我们会自动生成你的四维弱项分析和下一步冲分建议。</p>
      <Button className="mt-3" size="sm" onClick={onQuickStart}>
        <Sparkles className="mr-1.5 h-4 w-4" />
        立即开始首次冲分
      </Button>
    </div>
  );
}

function LoadingPipeline({ stage }: { stage: LoadingStage }) {
  if (stage === 'idle') return null;

  const steps: Array<{ id: LoadingStage; label: string; detail: string }> = [
    { id: 'simulating', label: '生成题目中', detail: '正在构造 IELTS 官方风格仿真题...' },
    { id: 'outlining', label: '构建提纲中', detail: '正在梳理可执行的段落结构...' },
    { id: 'vocab', label: '词汇升级中', detail: '正在识别低阶表达并给出替换建议...' },
    { id: 'tutoring', label: '教练响应中', detail: '正在结合你的草稿生成可执行建议...' },
    { id: 'grading', label: '评分分析中', detail: '正在按 IELTS 四维标准评分并生成证据...' },
    { id: 'micro', label: '生成补救课中', detail: '正在根据错因生成 5 分钟微课...' },
  ];

  const activeIndex = Math.max(0, steps.findIndex((item) => item.id === stage));
  const progress = Math.round(((activeIndex + 1) / steps.length) * 100);

  return (
    <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/[0.08] p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-emerald-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-500">{steps[activeIndex]?.label ?? '处理中'}</p>
          <p className="text-sm text-muted-foreground">{steps[activeIndex]?.detail ?? '正在处理请求...'}</p>
          <Progress value={progress} className="mt-3 h-2 bg-emerald-500/20 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function MiniTrendChart({ history }: { history: AiFeedback[] }) {
  const trendData = useMemo(() => {
    return [...history]
      .slice(0, 7)
      .reverse()
      .map((item, index) => ({
        round: index + 1,
        band: Number(item.scores.overallBand.toFixed(1)),
      }));
  }, [history]);

  if (trendData.length < 2) {
    return <p className="text-xs text-muted-foreground">完成 2 次以上反馈后展示 Band 趋势。</p>;
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="round" tickLine={false} axisLine={false} />
          <YAxis domain={[4.5, 9]} tickCount={5} tickLine={false} axisLine={false} width={30} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              borderColor: 'rgba(16,185,129,0.35)',
              background: 'var(--background)',
            }}
          />
          <Line
            type="monotone"
            dataKey="band"
            stroke="#10b981"
            strokeWidth={2.4}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ExamPrepPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || 'guest';

  const draftKey = `${DRAFT_PREFIX}:${userId}`;

  const [tracks, setTracks] = useState(getExamTracks());
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [units, setUnits] = useState<ContentUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedItem, setSelectedItem] = useState<ExamItem | null>(null);

  const [trackSearch, setTrackSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');

  const [taskType, setTaskType] = useState<TaskType>('task2');
  const [promptTopic, setPromptTopic] = useState('public transport and city planning');
  const [promptDifficulty, setPromptDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [writingPrompt, setWritingPrompt] = useState('');
  const [writingAnswer, setWritingAnswer] = useState('');

  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<AiFeedback[]>([]);
  const [feedbackLatencyMs, setFeedbackLatencyMs] = useState<number | null>(null);

  const [outline, setOutline] = useState<ReturnType<typeof buildQuickOutline> | null>(null);
  const [vocabSuggestions, setVocabSuggestions] = useState<ReturnType<typeof enhanceVocabularyDraft>>([]);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorReply, setTutorReply] = useState('');

  const [simItem, setSimItem] = useState<ExamItem | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulationTotalSec, setSimulationTotalSec] = useState(0);
  const [simulationRemainingSec, setSimulationRemainingSec] = useState(0);

  const [microUnit, setMicroUnit] = useState<ContentUnit | null>(null);
  const [activeErrorTag, setActiveErrorTag] = useState<FeedbackIssue['tag'] | null>(null);

  const [plan, setPlan] = useState<PlanTier>('free');
  const [remainingQuota, setRemainingQuota] = useState({
    aiAdvancedFeedbackPerDay: 0,
    simItemsPerDay: 0,
    microLessonsPerDay: 0,
  });

  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);

  const streakDays = useMemo(() => calcStreakDays(feedbackHistory), [feedbackHistory]);
  const thisWeekRuns = useMemo(() => {
    const start = new Date();
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    return feedbackHistory.filter((item) => new Date(item.createdAt).getTime() >= start.getTime()).length;
  }, [feedbackHistory]);

  const attempts = getItemAttempts(userId, 400);

  const allWritingUnits = getContentUnits({ examType: 'IELTS', skill: 'writing' });

  const unitProgressMap = useMemo(() => {
    const attemptedItemIds = new Set(attempts.map((attempt) => attempt.itemId));
    const progress = new Map<string, number>();

    allWritingUnits.forEach((unit) => {
      const total = Math.max(1, unit.itemIds.length);
      const done = unit.itemIds.filter((itemId) => attemptedItemIds.has(itemId)).length;
      progress.set(unit.id, Math.round((done / total) * 100));
    });

    return progress;
  }, [allWritingUnits, attempts]);

  const trackProgressMap = useMemo(() => {
    const progress = new Map<string, number>();

    tracks.forEach((track) => {
      const trackUnits = allWritingUnits.filter((unit) => unit.trackId === track.id);
      if (trackUnits.length === 0) {
        progress.set(track.id, 0);
        return;
      }

      const total = trackUnits.reduce((sum, unit) => sum + (unitProgressMap.get(unit.id) || 0), 0);
      progress.set(track.id, Math.round(total / trackUnits.length));
    });

    return progress;
  }, [allWritingUnits, tracks, unitProgressMap]);

  const filteredTracks = useMemo(() => {
    const query = trackSearch.trim().toLowerCase();
    if (!query) return tracks;
    return tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.bandTarget.toLowerCase().includes(query) ||
        track.skill.toLowerCase().includes(query),
    );
  }, [trackSearch, tracks]);

  const filteredUnits = useMemo(() => {
    const query = unitSearch.trim().toLowerCase();
    if (!query) return units;
    return units.filter((unit) => unit.title.toLowerCase().includes(query));
  }, [unitSearch, units]);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) || null,
    [tracks, selectedTrackId],
  );

  const targetBand = parseTargetBand(selectedTrack?.bandTarget || '6.5');
  const currentBand = feedback?.scores.overallBand || feedbackHistory[0]?.scores.overallBand || 0;
  const targetProgress = Math.round(Math.min(100, (currentBand / targetBand) * 100));

  const errorGraph = getErrorGraph(userId);
  const errorAnalytics = useMemo(() => {
    const total = Math.max(1, errorGraph.reduce((sum, node) => sum + node.count, 0));
    return errorGraph.slice(0, 6).map((node) => ({
      tag: node.tag,
      label: ISSUE_LABELS[node.tag] || node.tag,
      weight: Math.max(1, Math.round((node.count / total) * 100)),
    }));
  }, [errorGraph]);

  const topWeakTag = (activeErrorTag || errorGraph[0]?.tag || null) as FeedbackIssue['tag'] | null;

  const refreshQuota = useCallback(async () => {
    const quota = await getQuotaSnapshot(userId);
    setRemainingQuota(quota.remaining);
  }, [userId]);

  const refreshFeedbackState = useCallback(() => {
    const history = getAiFeedbackHistory(userId, 12);
    setFeedbackHistory(history);
    setFeedback(getLatestAiFeedback(userId));
  }, [userId]);

  const resetCoachPanels = () => {
    setOutline(null);
    setVocabSuggestions([]);
    setTutorReply('');
  };

  useEffect(() => {
    const initialTracks = getExamTracks();
    setTracks(initialTracks);
    setSelectedTrackId(initialTracks[0]?.id || '');
  }, [dataVersion]);

  useEffect(() => {
    const track = tracks.find((item) => item.id === selectedTrackId);
    if (!track) {
      setUnits([]);
      setSelectedUnitId('');
      return;
    }

    const nextUnits = getContentUnits({
      examType: track.examType,
      skill: track.skill,
      bandTarget: track.bandTarget,
    });

    setUnits(nextUnits);
    setSelectedUnitId((prev) => {
      if (prev && nextUnits.some((unit) => unit.id === prev)) {
        return prev;
      }
      return nextUnits[0]?.id || '';
    });
  }, [selectedTrackId, tracks, dataVersion]);

  useEffect(() => {
    const item = getContentItemsByUnit(selectedUnitId)[0] || null;
    setSelectedItem(item);
    if (!item) return;

    setWritingPrompt(item.prompt);
    setTaskType(item.itemType === 'writing_task_1' ? 'task1' : 'task2');
    resetCoachPanels();
  }, [selectedUnitId]);

  useEffect(() => {
    const loadEntitlement = async () => {
      const entitlement = await getEntitlement(userId);
      setPlan(entitlement.plan);
      await refreshQuota();
      refreshFeedbackState();
    };

    void loadEntitlement();
  }, [refreshFeedbackState, refreshQuota, userId]);

  useEffect(() => {
    const raw = localStorage.getItem(draftKey);
    if (!raw) {
      setDraftHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        selectedTrackId?: string;
        selectedUnitId?: string;
        taskType?: TaskType;
        promptTopic?: string;
        promptDifficulty?: 'easy' | 'medium' | 'hard';
        writingPrompt?: string;
        writingAnswer?: string;
        simulation?: { totalSec: number; remainingSec: number; isRunning: boolean };
      };

      if (parsed.selectedTrackId) setSelectedTrackId(parsed.selectedTrackId);
      if (parsed.selectedUnitId) setSelectedUnitId(parsed.selectedUnitId);
      if (parsed.taskType) setTaskType(parsed.taskType);
      if (parsed.promptTopic) setPromptTopic(parsed.promptTopic);
      if (parsed.promptDifficulty) setPromptDifficulty(parsed.promptDifficulty);
      if (parsed.writingPrompt) setWritingPrompt(parsed.writingPrompt);
      if (parsed.writingAnswer) setWritingAnswer(parsed.writingAnswer);

      if (parsed.simulation?.isRunning && parsed.simulation.remainingSec > 0) {
        setIsSimulationMode(true);
        setSimulationTotalSec(parsed.simulation.totalSec);
        setSimulationRemainingSec(parsed.simulation.remainingSec);
      }
    } catch {
      // Ignore malformed draft snapshots.
    } finally {
      setDraftHydrated(true);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftHydrated) return;

    const timer = window.setTimeout(() => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          selectedTrackId,
          selectedUnitId,
          taskType,
          promptTopic,
          promptDifficulty,
          writingPrompt,
          writingAnswer,
          simulation: {
            totalSec: simulationTotalSec,
            remainingSec: simulationRemainingSec,
            isRunning: isSimulationMode,
          },
        }),
      );
      setAutosavedAt(new Date().toLocaleTimeString());
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    draftHydrated,
    draftKey,
    isSimulationMode,
    promptDifficulty,
    promptTopic,
    selectedTrackId,
    selectedUnitId,
    simulationRemainingSec,
    simulationTotalSec,
    taskType,
    writingAnswer,
    writingPrompt,
  ]);

  useEffect(() => {
    if (!isSimulationMode || simulationRemainingSec <= 0) return;

    const intervalId = window.setInterval(() => {
      setSimulationRemainingSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          setIsSimulationMode(false);
          toast.info('模拟时间结束，你可以继续提交答案获取反馈。');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isSimulationMode, simulationRemainingSec]);

  useEffect(() => {
    if (!activeErrorTag && errorGraph[0]?.tag) {
      setActiveErrorTag(errorGraph[0].tag);
    }
  }, [activeErrorTag, errorGraph]);

  useEffect(() => {
    if (!showCelebrate) return;
    const timer = window.setTimeout(() => setShowCelebrate(false), 2800);
    return () => window.clearTimeout(timer);
  }, [showCelebrate]);

  const startSimulationClock = (nextTaskType: TaskType) => {
    const total = nextTaskType === 'task1' ? 20 * 60 : 40 * 60;
    setSimulationTotalSec(total);
    setSimulationRemainingSec(total);
    setIsSimulationMode(true);
  };

  const handleGeneratePrompt = () => {
    const generated = generateRandomIeltsPrompt({
      taskType,
      difficulty: promptDifficulty,
      topic: promptTopic,
    });

    setWritingPrompt(generated.prompt);
    setSimItem(null);
    resetCoachPanels();
    toast.success('已生成新的 IELTS 题目');
  };

  const handleBuildOutline = () => {
    if (!writingPrompt.trim()) {
      toast.error('请先输入题目内容');
      return;
    }

    setLoadingStage('outlining');
    setOutline(
      buildQuickOutline({
        prompt: writingPrompt,
        taskType,
      }),
    );
    setLoadingStage('idle');
  };

  const handleEnhanceVocabulary = () => {
    const draft = writingAnswer.trim() || writingPrompt;
    if (!draft.trim()) {
      toast.error('请先输入作文草稿或题目');
      return;
    }

    setLoadingStage('vocab');
    const suggestions = enhanceVocabularyDraft(draft);
    setVocabSuggestions(suggestions);
    setLoadingStage('idle');

    if (suggestions.length === 0) {
      toast.info('暂未检测到可升级表达，建议写到 120 词以上再试。');
      return;
    }

    toast.success(`已生成 ${suggestions.length} 条词汇升级建议`);
  };

  const handleAskTutor = async () => {
    const question = tutorQuestion.trim();
    if (!question) {
      toast.error('请先输入问题');
      return;
    }

    setLoadingStage('tutoring');
    try {
      const responseStyle = QUIET_TOPICS.includes(question.toLowerCase()) ? 'concise' : 'coach';
      const reply = await askWritingTutor({
        userId,
        taskType,
        prompt: writingPrompt,
        draft: writingAnswer,
        question: responseStyle === 'concise' ? `${question}\n请只回答 1-2 句，避免长模板。` : question,
      });
      setTutorReply(reply);
    } finally {
      setLoadingStage('idle');
    }
  };

  const handleGenerateSimItem = async () => {
    const quotaResult = await consumeExamFeatureQuota(userId, 'simItemsPerDay');
    if (!quotaResult.allowed) {
      toast.error('今日仿真题次数已用完，请明天再试或升级 Pro。');
      return;
    }

    setLoadingStage('simulating');
    try {
      const generated = await generateSimulationItem({
        userId,
        skill: 'writing',
        bandTarget: selectedTrack?.bandTarget || '6.5',
        topic: promptTopic,
      });

      const nextTaskType: TaskType = generated.itemType === 'writing_task_1' ? 'task1' : 'task2';
      setTaskType(nextTaskType);
      setSimItem(generated);
      setWritingPrompt(generated.prompt);
      setWritingAnswer('');
      resetCoachPanels();
      startSimulationClock(nextTaskType);

      await refreshQuota();
      await recordLearningEvent({
        userId,
        eventName: 'practice.writing_submitted',
        payload: {
          source: 'exam_simulation_generated',
          taskType: nextTaskType,
          trackId: selectedTrackId,
        },
      });

      toast.success('仿真题已生成，计时已启动。');
    } catch (error) {
      console.error(error);
      toast.error('仿真题生成失败，请稍后重试。');
    } finally {
      setLoadingStage('idle');
    }
  };

  const handleSubmitWriting = async () => {
    if (!writingPrompt.trim()) {
      toast.error('请先输入或生成题目');
      return;
    }

    if (!writingAnswer.trim()) {
      toast.error('请先完成作文内容');
      return;
    }

    const quotaResult = await consumeExamFeatureQuota(userId, 'aiAdvancedFeedbackPerDay');
    if (!quotaResult.allowed) {
      toast.error('今日高级反馈次数已用完，请明天再试或升级 Pro。');
      return;
    }

    setLoadingStage('grading');

    const priorBand = feedbackHistory[0]?.scores.overallBand || 0;

    try {
      const attempt = createAttempt({
        userId,
        itemId: simItem?.id || selectedItem?.id || `manual_${taskType}`,
        answer: writingAnswer,
        skill: 'writing',
      });

      saveItemAttempt(attempt);

      const startedAt = performance.now();
      const result = await gradeIeltsWriting({
        userId,
        attemptId: attempt.id,
        prompt: writingPrompt,
        answer: writingAnswer,
        taskType,
      });

      const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));
      setFeedbackLatencyMs(latencyMs);

      const enrichedResult: AiFeedback = {
        ...result,
        prompt: writingPrompt,
        taskType,
        trackId: selectedTrackId,
        unitId: selectedUnitId,
        answerPreview: writingAnswer.slice(0, 260),
        latencyMs,
        sourceMode: simItem ? 'simulation' : 'manual',
      };

      saveAiFeedbackRecord(userId, enrichedResult);
      setFeedback(enrichedResult);
      setDataVersion((prev) => prev + 1);
      refreshFeedbackState();
      await refreshQuota();

      await recordLearningEvent({
        userId,
        eventName: 'practice.writing_submitted',
        payload: {
          taskType,
          sourceMode: simItem ? 'simulation' : 'manual',
          latencyMs,
          overallBand: enrichedResult.scores.overallBand,
          trackId: selectedTrackId,
        },
      });

      await recordLearningEvent({
        userId,
        eventName: 'chat.ttft',
        payload: {
          feature: 'ai-grade-writing',
          latencyMs,
        },
      });

      if (enrichedResult.scores.overallBand - priorBand >= 0.5) {
        setShowCelebrate(true);
      }

      if (isSimulationMode) {
        setIsSimulationMode(false);
      }

      toast.success(`评分完成：Overall Band ${enrichedResult.scores.overallBand.toFixed(1)}`);
    } catch (error) {
      console.error(error);
      toast.error('评分失败，请稍后重试。');
    } finally {
      setLoadingStage('idle');
    }
  };

  const handleGenerateMicroLesson = async () => {
    const tags = (feedback?.issues || []).map((issue) => issue.tag);
    if (tags.length === 0) {
      toast.info('先完成一次写作评分，再生成错因微课。');
      return;
    }

    const quotaResult = await consumeExamFeatureQuota(userId, 'microLessonsPerDay');
    if (!quotaResult.allowed) {
      toast.error('今日补救微课次数已用完。');
      return;
    }

    setLoadingStage('micro');
    try {
      const lesson = await generateMicroLessonFromErrors({
        userId,
        errorTags: tags,
        targetLevel: 'B1',
      });

      setMicroUnit(lesson.unit);
      setTracks(getExamTracks());
      setDataVersion((prev) => prev + 1);

      if (lesson.unit.trackId) {
        setSelectedTrackId(lesson.unit.trackId);
      }

      setSelectedUnitId(lesson.unit.id);
      await refreshQuota();

      toast.success('已生成错因补救微课，并切换到对应单元。');
    } catch (error) {
      console.error(error);
      toast.error('补救微课生成失败，请稍后重试。');
    } finally {
      setLoadingStage('idle');
    }
  };

  const handleJumpToVocabulary = () => {
    const tag = topWeakTag || 'lexical';
    const query = ISSUE_VOCAB_QUERY[tag];
    navigate(`/dashboard/vocabulary?q=${encodeURIComponent(query)}`);
  };

  const handleRetryFeedback = (item: AiFeedback) => {
    if (item.prompt) {
      setWritingPrompt(item.prompt);
    }
    if (item.taskType) {
      setTaskType(item.taskType);
    }
    if (item.answerPreview) {
      setWritingAnswer(item.answerPreview);
    }
    setSimItem(null);
    toast.success('已将历史反馈内容载入到编辑器。');
  };

  const quotaTotal = FEATURE_TOTAL_BY_PLAN[plan] || FEATURE_TOTAL_BY_PLAN.free;
  const isBusy = loadingStage !== 'idle';
  const activeWordCount = toWordCount(writingAnswer);
  const selectedErrorNode = errorGraph.find((node) => node.tag === topWeakTag) || errorGraph[0] || null;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 px-2 pb-8 sm:px-4 lg:px-6">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-4 sm:p-5"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn('rounded-full border px-2.5 py-1 text-xs', plan === 'pro' ? 'bg-emerald-600 text-white' : '')}>
                {plan === 'pro' ? <Crown className="mr-1 h-3.5 w-3.5" /> : <BookOpen className="mr-1 h-3.5 w-3.5" />}
                Plan {plan.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                <Flame className="mr-1 h-3.5 w-3.5" /> 连续学习 {streakDays} 天
              </Badge>
              <Badge variant="outline" className="rounded-full">
                <TrendingUp className="mr-1 h-3.5 w-3.5" /> 本周模拟 {thisWeekRuns} 次
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">考试冲分 · IELTS Exam Prep</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                从仿真题到结构化评分再到错因补救，形成可持续提分闭环。
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">目标 Band 进度</p>
                  <p className="text-sm font-medium">
                    当前 {currentBand ? currentBand.toFixed(1) : '0.0'} / 目标 {targetBand.toFixed(1)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-500">{targetProgress}%</span>
              </div>
              <Progress value={targetProgress} className="h-2 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
              <p className="mt-2 text-xs text-muted-foreground">下一步：{selectedErrorNode ? `优先修复 ${ISSUE_LABELS[selectedErrorNode.tag]}` : '先完成一次写作获取弱项图谱'}</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            <QuotaRing
              label="高级评分反馈"
              remaining={remainingQuota.aiAdvancedFeedbackPerDay}
              total={quotaTotal.aiAdvancedFeedbackPerDay}
              hint="每次评分都会写入你的冲分轨迹。"
            />
            <QuotaRing
              label="仿真题生成"
              remaining={remainingQuota.simItemsPerDay}
              total={quotaTotal.simItemsPerDay}
              hint="建议每天至少完成 1 次完整仿真。"
            />
            <QuotaRing
              label="错因补救微课"
              remaining={remainingQuota.microLessonsPerDay}
              total={quotaTotal.microLessonsPerDay}
              hint="自动把错因转为 5 分钟补救训练。"
            />
            <Link to="/pricing" className="sm:col-span-3 xl:col-span-1">
              <Button variant="outline" className="w-full">
                升级会员解锁完整冲分能力
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <motion.aside initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-base">Exam Tracks</CardTitle>
              <CardDescription>选择目标分段并按微课推进</CardDescription>
              <Input
                value={trackSearch}
                onChange={(event) => setTrackSearch(event.target.value)}
                placeholder="搜索 Track / Band / Skill"
                className="h-9"
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredTracks.length === 0 ? (
                <p className="text-sm text-muted-foreground">没有匹配的 Track。</p>
              ) : (
                filteredTracks.map((track) => {
                  const active = track.id === selectedTrackId;
                  const progress = trackProgressMap.get(track.id) || 0;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedTrackId(track.id)}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition-colors',
                        active
                          ? 'border-emerald-500/60 bg-emerald-500/[0.12]'
                          : 'border-border/60 hover:border-emerald-500/30 hover:bg-muted/40',
                      )}
                    >
                      <p className="text-sm font-medium leading-snug">{track.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{track.bandTarget} · {track.skill}</p>
                      <Progress value={progress} className="mt-2 h-1.5 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                      <p className="mt-1 text-[11px] text-muted-foreground">完成度 {progress}%</p>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-base">Micro Units</CardTitle>
              <Input
                value={unitSearch}
                onChange={(event) => setUnitSearch(event.target.value)}
                placeholder="搜索单元"
                className="h-9"
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredUnits.length === 0 ? (
                <p className="text-sm text-muted-foreground">当前 Track 暂无可用单元。</p>
              ) : (
                filteredUnits.map((unit) => {
                  const active = unit.id === selectedUnitId;
                  const progress = unitProgressMap.get(unit.id) || 0;
                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setSelectedUnitId(unit.id)}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-colors',
                        active
                          ? 'border-emerald-500/60 bg-emerald-500/[0.12]'
                          : 'border-border/60 hover:border-emerald-500/30 hover:bg-muted/30',
                      )}
                    >
                      <p className="text-sm font-medium leading-snug">{unit.title}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{unit.estimatedMinutes} min</span>
                        <span>{unit.cefrLevel}</span>
                      </div>
                      <Progress value={progress} className="mt-2 h-1.5 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.aside>

        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Simulation & Writing Workspace</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={taskType === 'task1' ? 'default' : 'outline'}
                    onClick={() => setTaskType('task1')}
                  >
                    Task 1
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={taskType === 'task2' ? 'default' : 'outline'}
                    onClick={() => setTaskType('task2')}
                  >
                    Task 2
                  </Button>
                  <Badge variant="outline" className="rounded-full">
                    <Gauge className="mr-1 h-3 w-3" />
                    {selectedTrack?.title ?? '未选择轨道'}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Track → Simulation → Grading → Micro Lesson，一次完成完整冲分闭环。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_130px]">
                <Input
                  value={promptTopic}
                  onChange={(event) => setPromptTopic(event.target.value)}
                  placeholder="Topic: public transport / education / AI"
                  className="h-10"
                />
                <Select
                  value={promptDifficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => setPromptDifficulty(value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleGeneratePrompt} disabled={isBusy} variant="outline" className="h-10">
                  <RefreshCw className="mr-1.5 h-4 w-4" /> 随机题
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleGenerateSimItem} disabled={isBusy}>
                  <Target className="mr-1.5 h-4 w-4" /> 生成仿真题
                </Button>
                <Button variant="outline" onClick={handleBuildOutline} disabled={isBusy}>
                  <ListActionIcon icon={WandSparkles} label="提纲" />
                </Button>
                <Button variant="outline" onClick={handleEnhanceVocabulary} disabled={isBusy}>
                  <ListActionIcon icon={Sparkles} label="词汇升级" />
                </Button>
                <Button variant="outline" onClick={handleGenerateMicroLesson} disabled={isBusy || !feedback}>
                  <ListActionIcon icon={Brain} label="错题转课" />
                </Button>
              </div>

              {isSimulationMode && (
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/[0.08] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-emerald-500">仿真计时进行中</p>
                      <p className="text-xs text-muted-foreground">{taskType === 'task1' ? 'Task 1 建议 20 分钟' : 'Task 2 建议 40 分钟'}</p>
                    </div>
                    <Badge className="rounded-full bg-emerald-600 text-white">
                      <Timer className="mr-1 h-3.5 w-3.5" /> {formatSeconds(simulationRemainingSec)}
                    </Badge>
                  </div>
                  <Progress
                    value={simulationTotalSec ? Math.round(((simulationTotalSec - simulationRemainingSec) / simulationTotalSec) * 100) : 0}
                    className="mt-3 h-2 [&>[data-slot=progress-indicator]]:bg-emerald-500"
                  />
                </div>
              )}

              {simItem && (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline">{simItem.itemType}</Badge>
                    <span className="text-xs text-muted-foreground">{simItem.attribution}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{simItem.prompt}</p>
                </div>
              )}

              <LoadingPipeline stage={loadingStage} />

              <div className="space-y-2">
                <Label>Writing Prompt</Label>
                <Textarea
                  value={writingPrompt}
                  onChange={(event) => setWritingPrompt(event.target.value)}
                  className="min-h-[110px]"
                  placeholder="IELTS prompt"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Your Answer</Label>
                  <span className="text-xs text-muted-foreground">
                    {activeWordCount} words · {autosavedAt ? `自动保存 ${autosavedAt}` : '未保存'}
                  </span>
                </div>
                <Textarea
                  value={writingAnswer}
                  onChange={(event) => setWritingAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !isBusy) {
                      event.preventDefault();
                      void handleSubmitWriting();
                    }
                  }}
                  className="min-h-[220px] leading-relaxed"
                  placeholder="Write your IELTS response here..."
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Task {taskType === 'task1' ? '1 目标 >=150 词' : '2 目标 >=250 词'}</span>
                  <span>·</span>
                  <span>Ctrl/Cmd + Enter 快速提交评分</span>
                </div>
              </div>

              <Button
                onClick={handleSubmitWriting}
                disabled={isBusy}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {loadingStage === 'grading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                获取结构化评分反馈
              </Button>

              {outline && (
                <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                  <p className="mb-2 text-sm font-semibold">Outline Builder</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><span className="font-medium text-foreground">Intro:</span> {outline.intro}</li>
                    <li><span className="font-medium text-foreground">Body 1:</span> {outline.body1}</li>
                    <li><span className="font-medium text-foreground">Body 2:</span> {outline.body2}</li>
                    <li><span className="font-medium text-foreground">Conclusion:</span> {outline.conclusion}</li>
                  </ul>
                  <Separator className="my-2" />
                  <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {outline.checklist.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {vocabSuggestions.length > 0 && (
                <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                  <p className="mb-2 text-sm font-semibold">Vocabulary Enhancer</p>
                  <div className="space-y-2">
                    {vocabSuggestions.map((item, index) => (
                      <div key={`${item.from}-${index}`} className="rounded-lg border border-border/60 p-2.5">
                        <p className="text-sm">
                          <span className="font-medium">{item.from}</span>
                          <span className="mx-1.5 text-muted-foreground">→</span>
                          <span className="font-medium text-emerald-500">{item.to}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{item.rationale}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                <p className="mb-2 text-sm font-semibold">AI Writing Tutor</p>
                <Textarea
                  value={tutorQuestion}
                  onChange={(event) => setTutorQuestion(event.target.value)}
                  className="min-h-[80px]"
                  placeholder="例如：我的论证不够深入，如何改到 6.5+？"
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" onClick={handleAskTutor} disabled={isBusy}>
                    {loadingStage === 'tutoring' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    问教练
                  </Button>
                </div>
                {tutorReply && (
                  <div className="mt-3 whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm leading-relaxed">
                    {tutorReply}
                  </div>
                )}
              </div>

              {feedback && (
                <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Feedback Result</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="rounded-full">Provider: {feedback.provider}</Badge>
                      {(feedbackLatencyMs || feedback.latencyMs) && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded-full',
                            (feedbackLatencyMs || feedback.latencyMs)! > 8000 ? 'border-amber-400/60 text-amber-500' : 'border-emerald-400/60 text-emerald-500',
                          )}
                        >
                          Latency {(feedbackLatencyMs || feedback.latencyMs)}ms
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    <ScoreCell title="Task" value={feedback.scores.taskResponse} />
                    <ScoreCell title="Coherence" value={feedback.scores.coherenceCohesion} />
                    <ScoreCell title="Lexical" value={feedback.scores.lexicalResource} />
                    <ScoreCell title="Grammar" value={feedback.scores.grammaticalRangeAccuracy} />
                    <ScoreCell title="Overall" value={feedback.scores.overallBand} highlight />
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">核心问题</p>
                    {feedback.issues.length === 0 ? (
                      <p className="text-sm text-muted-foreground">未发现明显问题，建议继续做下一次模拟巩固稳定性。</p>
                    ) : (
                      feedback.issues.map((issue, index) => (
                        <div key={`${issue.tag}-${index}`} className="rounded-lg border border-border/60 p-2.5">
                          <p className="text-sm font-medium">[{ISSUE_LABELS[issue.tag] || issue.tag}] {issue.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{issue.suggestion}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {feedback.rewrites.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">句级改写建议</p>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {feedback.rewrites.map((rewrite, index) => (
                          <li key={`${rewrite}-${index}`}>{rewrite}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.main>

        <motion.aside initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Error Graph</CardTitle>
              <CardDescription>按 IELTS 四维与错因标签展示弱项权重</CardDescription>
            </CardHeader>
            <CardContent>
              {errorAnalytics.length === 0 ? (
                <EmptyKickoffCard onQuickStart={handleGenerateSimItem} />
              ) : (
                <ErrorGraph
                  analytics={errorAnalytics}
                  activeTag={activeErrorTag}
                  onSelectTag={(tag) => setActiveErrorTag(tag as FeedbackIssue['tag'])}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Next Best Action</CardTitle>
              <CardDescription>根据当前最弱项自动推荐下一步</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedErrorNode ? (
                <>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.1] p-3">
                    <p className="text-sm font-semibold text-emerald-500">优先修复：{ISSUE_LABELS[selectedErrorNode.tag]}</p>
                    <p className="mt-1 text-xs text-muted-foreground">近期命中 {selectedErrorNode.count} 次</p>
                  </div>
                  <div className="grid gap-2">
                    <Button onClick={handleGenerateMicroLesson} disabled={isBusy || !feedback}>
                      <Sparkles className="mr-1.5 h-4 w-4" /> 一键错题转课程
                    </Button>
                    <Button variant="outline" onClick={handleJumpToVocabulary}>
                      <BookOpen className="mr-1.5 h-4 w-4" /> 跳转词库补强
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">完成首次反馈后会自动生成下一步行动建议。</p>
              )}

              {microUnit && (
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-sm font-medium">最新补救微课</p>
                  <p className="text-sm">{microUnit.title}</p>
                  <p className="text-xs text-muted-foreground">预计 {microUnit.estimatedMinutes} 分钟 · {microUnit.cefrLevel}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Band Trend</CardTitle>
              <CardDescription>最近 7 次反馈走势</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniTrendChart history={feedbackHistory} />
            </CardContent>
          </Card>
        </motion.aside>
      </div>

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Recent Feedback Feed</CardTitle>
                <CardDescription>历史评分、弱项标签与快速再练入口</CardDescription>
              </div>
              {feedbackHistory.length > 0 && (
                <Badge variant="outline" className="rounded-full">共 {feedbackHistory.length} 条</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {feedbackHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无反馈记录，先完成一次写作评分。</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {feedbackHistory.map((item) => {
                  const tags = item.issues.slice(0, 3).map((issue) => ISSUE_LABELS[issue.tag] || issue.tag);
                  return (
                    <div key={item.attemptId} className="rounded-xl border border-border/70 bg-card/80 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                          <p className="text-lg font-semibold">Band {item.scores.overallBand.toFixed(1)}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full">{item.provider}</Badge>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <span className="rounded-md bg-muted/40 px-2 py-1">Task {item.scores.taskResponse.toFixed(1)}</span>
                        <span className="rounded-md bg-muted/40 px-2 py-1">Coherence {item.scores.coherenceCohesion.toFixed(1)}</span>
                        <span className="rounded-md bg-muted/40 px-2 py-1">Lexical {item.scores.lexicalResource.toFixed(1)}</span>
                        <span className="rounded-md bg-muted/40 px-2 py-1">Grammar {item.scores.grammaticalRangeAccuracy.toFixed(1)}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.length === 0 ? (
                          <span className="text-xs text-muted-foreground">暂无明显问题</span>
                        ) : (
                          tags.map((tag) => (
                            <span key={`${item.attemptId}-${tag}`} className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                              {tag}
                            </span>
                          ))
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRetryFeedback(item)}>
                          再练一次
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-500"
                          onClick={() => {
                            const firstTag = item.issues[0]?.tag;
                            if (firstTag) {
                              setActiveErrorTag(firstTag);
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          查看错因
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {showCelebrate && (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
          <div className="rounded-full border border-emerald-400/50 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-500 backdrop-blur-sm">
            <CheckCircle2 className="mr-1 inline h-4 w-4" /> Band 提升 +0.5，继续保持这波节奏！
          </div>
        </div>
      )}
    </div>
  );
}

function ListActionIcon({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <>
      <Icon className="mr-1.5 h-4 w-4" /> {label}
    </>
  );
}

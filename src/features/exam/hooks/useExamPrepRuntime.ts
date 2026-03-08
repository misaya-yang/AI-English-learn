import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  getAiFeedbackHistory,
  getLatestAiFeedback,
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
import { ISSUE_VOCAB_QUERY, QUIET_TOPICS } from '@/features/exam/constants';
import type { ExamDraftSnapshot, InsightView, LoadingStage, PromptDifficulty, TaskType, ToolPanel, WorkspaceView } from '@/features/exam/types';
import type { AiFeedback, ContentUnit, ExamItem, FeedbackIssue } from '@/types/examContent';

interface UseExamPrepRuntimeArgs {
  userId: string;
  selectedTrackBandTarget: string | null;
  selectedTrackId: string;
  selectedUnitId: string;
  selectedItem: ExamItem | null;
  refreshQuota: () => Promise<void>;
  onSwitchTrack: (trackId: string) => void;
  onSwitchUnit: (unitId: string) => void;
  onCatalogChange?: () => void;
}

const nextSimulationDuration = (taskType: TaskType): number => (taskType === 'task1' ? 20 * 60 : 40 * 60);

export function useExamPrepRuntime({
  userId,
  selectedTrackBandTarget,
  selectedTrackId,
  selectedUnitId,
  selectedItem,
  refreshQuota,
  onSwitchTrack,
  onSwitchUnit,
  onCatalogChange,
}: UseExamPrepRuntimeArgs) {
  const navigate = useNavigate();

  const [taskType, setTaskType] = useState<TaskType>('task2');
  const [promptTopic, setPromptTopic] = useState('public transport and city planning');
  const [promptDifficulty, setPromptDifficulty] = useState<PromptDifficulty>('medium');
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

  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [dataVersion, setDataVersion] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('brief');
  const [insightView, setInsightView] = useState<InsightView>('weakness');
  const [toolPanel, setToolPanel] = useState<ToolPanel | undefined>(undefined);

  const resetCoachPanels = useCallback(() => {
    setOutline(null);
    setVocabSuggestions([]);
    setTutorReply('');
  }, []);

  const refreshFeedbackState = useCallback(() => {
    const history = getAiFeedbackHistory(userId, 12);
    setFeedbackHistory(history);
    setFeedback(getLatestAiFeedback(userId));
  }, [userId]);

  useEffect(() => {
    refreshFeedbackState();
  }, [refreshFeedbackState]);

  useEffect(() => {
    if (!selectedItem) return;

    setWritingPrompt(selectedItem.prompt);
    setTaskType(selectedItem.itemType === 'writing_task_1' ? 'task1' : 'task2');
    resetCoachPanels();
  }, [resetCoachPanels, selectedItem]);

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
    if (!showCelebrate) return;
    const timer = window.setTimeout(() => setShowCelebrate(false), 2800);
    return () => window.clearTimeout(timer);
  }, [showCelebrate]);

  const startSimulationClock = useCallback((nextTaskType: TaskType) => {
    const total = nextSimulationDuration(nextTaskType);
    setSimulationTotalSec(total);
    setSimulationRemainingSec(total);
    setIsSimulationMode(true);
  }, []);

  const handleGeneratePrompt = useCallback(() => {
    const generated = generateRandomIeltsPrompt({
      taskType,
      difficulty: promptDifficulty,
      topic: promptTopic,
    });

    setWritingPrompt(generated.prompt);
    setSimItem(null);
    resetCoachPanels();
    setWorkspaceView('draft');
    setToolPanel(undefined);
    toast.success('已生成新的 IELTS 题目');
  }, [promptDifficulty, promptTopic, resetCoachPanels, taskType]);

  const handleBuildOutline = useCallback(() => {
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
    setWorkspaceView('draft');
    setToolPanel('outline');
    setLoadingStage('idle');
  }, [taskType, writingPrompt]);

  const handleEnhanceVocabulary = useCallback(() => {
    const draft = writingAnswer.trim() || writingPrompt;
    if (!draft.trim()) {
      toast.error('请先输入作文草稿或题目');
      return;
    }

    setLoadingStage('vocab');
    const suggestions = enhanceVocabularyDraft(draft);
    setVocabSuggestions(suggestions);
    setWorkspaceView('draft');
    setToolPanel('vocab');
    setLoadingStage('idle');

    if (suggestions.length === 0) {
      toast.info('暂未检测到可升级表达，建议写到 120 词以上再试。');
      return;
    }

    toast.success(`已生成 ${suggestions.length} 条词汇升级建议`);
  }, [writingAnswer, writingPrompt]);

  const handleAskTutor = useCallback(async () => {
    const question = tutorQuestion.trim();
    if (!question) {
      toast.error('请先输入问题');
      return;
    }

    setLoadingStage('tutoring');
    setWorkspaceView('draft');
    setToolPanel('coach');
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
  }, [taskType, tutorQuestion, userId, writingAnswer, writingPrompt]);

  const handleGenerateSimItem = useCallback(async () => {
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
        bandTarget: selectedTrackBandTarget || '6.5',
        topic: promptTopic,
      });

      const nextTaskType: TaskType = generated.itemType === 'writing_task_1' ? 'task1' : 'task2';
      setTaskType(nextTaskType);
      setSimItem(generated);
      setWritingPrompt(generated.prompt);
      setWritingAnswer('');
      resetCoachPanels();
      setWorkspaceView('draft');
      setToolPanel(undefined);
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
  }, [
    promptTopic,
    refreshQuota,
    resetCoachPanels,
    selectedTrackBandTarget,
    selectedTrackId,
    startSimulationClock,
    userId,
  ]);

  const handleSubmitWriting = useCallback(async () => {
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
      setWorkspaceView('review');
      setInsightView('history');
      setToolPanel(undefined);
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
  }, [
    feedbackHistory,
    isSimulationMode,
    refreshFeedbackState,
    refreshQuota,
    selectedItem,
    selectedTrackId,
    selectedUnitId,
    simItem,
    taskType,
    userId,
    writingAnswer,
    writingPrompt,
  ]);

  const handleGenerateMicroLesson = useCallback(async () => {
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
      setDataVersion((prev) => prev + 1);
      onCatalogChange?.();

      if (lesson.unit.trackId) {
        onSwitchTrack(lesson.unit.trackId);
      }

      onSwitchUnit(lesson.unit.id);
      setInsightView('weakness');
      await refreshQuota();

      toast.success('已生成错因补救微课，并切换到对应单元。');
    } catch (error) {
      console.error(error);
      toast.error('补救微课生成失败，请稍后重试。');
    } finally {
      setLoadingStage('idle');
    }
  }, [feedback, onCatalogChange, onSwitchTrack, onSwitchUnit, refreshQuota, userId]);

  const handleJumpToVocabulary = useCallback((tag: FeedbackIssue['tag']) => {
    navigate(`/dashboard/vocabulary?q=${encodeURIComponent(ISSUE_VOCAB_QUERY[tag])}`);
  }, [navigate]);

  const handleRetryFeedback = useCallback((item: AiFeedback) => {
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
    setWorkspaceView('draft');
    setInsightView('history');
    setToolPanel(undefined);
    toast.success('已将历史反馈内容载入到编辑器。');
  }, []);

  const hydrateRuntimeDraft = useCallback((snapshot: ExamDraftSnapshot) => {
    if (snapshot.taskType) setTaskType(snapshot.taskType);
    if (snapshot.promptTopic) setPromptTopic(snapshot.promptTopic);
    if (snapshot.promptDifficulty) setPromptDifficulty(snapshot.promptDifficulty);
    if (snapshot.writingPrompt) setWritingPrompt(snapshot.writingPrompt);
    if (snapshot.writingAnswer) setWritingAnswer(snapshot.writingAnswer);
    if (snapshot.simulation?.isRunning && snapshot.simulation.remainingSec > 0) {
      setIsSimulationMode(true);
      setSimulationTotalSec(snapshot.simulation.totalSec);
      setSimulationRemainingSec(snapshot.simulation.remainingSec);
    }
  }, []);

  const draftRuntimeSnapshot = useMemo(
    () => ({
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
    [
      isSimulationMode,
      promptDifficulty,
      promptTopic,
      simulationRemainingSec,
      simulationTotalSec,
      taskType,
      writingAnswer,
      writingPrompt,
    ],
  );

  return {
    taskType,
    setTaskType,
    promptTopic,
    setPromptTopic,
    promptDifficulty,
    setPromptDifficulty,
    writingPrompt,
    setWritingPrompt,
    writingAnswer,
    setWritingAnswer,
    feedback,
    feedbackHistory,
    feedbackLatencyMs,
    outline,
    vocabSuggestions,
    tutorQuestion,
    setTutorQuestion,
    tutorReply,
    simItem,
    isSimulationMode,
    simulationTotalSec,
    simulationRemainingSec,
    microUnit,
    activeErrorTag,
    setActiveErrorTag,
    loadingStage,
    dataVersion,
    showCelebrate,
    workspaceView,
    setWorkspaceView,
    insightView,
    setInsightView,
    toolPanel,
    setToolPanel,
    handleGeneratePrompt,
    handleBuildOutline,
    handleEnhanceVocabulary,
    handleAskTutor,
    handleGenerateSimItem,
    handleSubmitWriting,
    handleGenerateMicroLesson,
    handleJumpToVocabulary,
    handleRetryFeedback,
    hydrateRuntimeDraft,
    draftRuntimeSnapshot,
  };
}

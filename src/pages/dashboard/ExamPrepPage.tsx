import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { getContentItemsByUnit, getContentUnits, getErrorGraph, getExamTracks, getItemAttempts } from '@/data/examContent';
import { ISSUE_LABELS } from '@/features/exam/constants';
import { HeroSummary } from '@/features/exam/components/HeroSummary';
import { RouteConsole } from '@/features/exam/components/RouteConsole';
import { ExamWorkspaceTabs } from '@/features/exam/components/ExamWorkspaceTabs';
import { useExamDraftPersistence } from '@/features/exam/hooks/useExamDraftPersistence';
import { useExamPrepRuntime } from '@/features/exam/hooks/useExamPrepRuntime';
import { useExamQuotaState } from '@/features/exam/hooks/useExamQuotaState';
import type { ExamDraftSnapshot, WorkspaceCopy } from '@/features/exam/types';
import type { AiFeedback, ExamItem, FeedbackIssue } from '@/types/examContent';

const DRAFT_PREFIX = 'vocabdaily_exam_prep_draft_v2';

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

export default function ExamPrepPage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const draftKey = `${DRAFT_PREFIX}:${userId}`;

  const [trackCatalogVersion, setTrackCatalogVersion] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [trackSearch, setTrackSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');

  void trackCatalogVersion;
  const tracks = getExamTracks();
  const selectedTrackIdSafe = useMemo(
    () => (tracks.some((track) => track.id === selectedTrackId) ? selectedTrackId : tracks[0]?.id || ''),
    [selectedTrackId, tracks],
  );
  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackIdSafe) || null,
    [tracks, selectedTrackIdSafe],
  );
  const units = useMemo(() => {
    if (!selectedTrack) return [];
    return getContentUnits({
      examType: selectedTrack.examType,
      skill: selectedTrack.skill,
      bandTarget: selectedTrack.bandTarget,
    });
  }, [selectedTrack]);
  const selectedUnitIdSafe = useMemo(
    () => (units.some((unit) => unit.id === selectedUnitId) ? selectedUnitId : units[0]?.id || ''),
    [selectedUnitId, units],
  );
  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitIdSafe) || null,
    [selectedUnitIdSafe, units],
  );
  const selectedItem = useMemo<ExamItem | null>(
    () => getContentItemsByUnit(selectedUnitIdSafe)[0] || null,
    [selectedUnitIdSafe],
  );

  const { plan, remainingQuota, quotaTotal, refreshQuota } = useExamQuotaState(userId);

  const runtime = useExamPrepRuntime({
    userId,
    selectedTrackBandTarget: selectedTrack?.bandTarget || null,
    selectedTrackId: selectedTrackIdSafe,
    selectedUnitId: selectedUnitIdSafe,
    selectedItem,
    refreshQuota,
    onSwitchTrack: setSelectedTrackId,
    onSwitchUnit: setSelectedUnitId,
    onCatalogChange: () => setTrackCatalogVersion((prev) => prev + 1),
  });
  const {
    activeErrorTag,
    draftRuntimeSnapshot,
    feedback,
    feedbackHistory,
    handleJumpToVocabulary: jumpToVocabularyByTag,
    hydrateRuntimeDraft,
    setActiveErrorTag,
  } = runtime;

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

  const handleHydrateDraft = useCallback((snapshot: ExamDraftSnapshot) => {
    if (snapshot.selectedTrackId) setSelectedTrackId(snapshot.selectedTrackId);
    if (snapshot.selectedUnitId) setSelectedUnitId(snapshot.selectedUnitId);
    hydrateRuntimeDraft(snapshot);
  }, [hydrateRuntimeDraft]);

  const draftSnapshot = useMemo<ExamDraftSnapshot>(() => ({
    selectedTrackId: selectedTrackIdSafe,
    selectedUnitId: selectedUnitIdSafe,
    ...draftRuntimeSnapshot,
  }), [draftRuntimeSnapshot, selectedTrackIdSafe, selectedUnitIdSafe]);

  const { autosavedAt } = useExamDraftPersistence({
    draftKey,
    snapshot: draftSnapshot,
    onHydrate: handleHydrateDraft,
  });

  const errorGraph = getErrorGraph(userId);
  const errorAnalytics = useMemo(() => {
    const total = Math.max(1, errorGraph.reduce((sum, node) => sum + node.count, 0));
    return errorGraph.slice(0, 6).map((node) => ({
      tag: node.tag,
      label: ISSUE_LABELS[node.tag] || node.tag,
      weight: Math.max(1, Math.round((node.count / total) * 100)),
    }));
  }, [errorGraph]);

  useEffect(() => {
    if (!activeErrorTag && errorGraph[0]?.tag) {
      setActiveErrorTag(errorGraph[0].tag);
    }
  }, [activeErrorTag, errorGraph, setActiveErrorTag]);

  const streakDays = useMemo(() => calcStreakDays(feedbackHistory), [feedbackHistory]);
  const thisWeekRuns = useMemo(() => {
    const start = new Date();
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    return feedbackHistory.filter((item) => new Date(item.createdAt).getTime() >= start.getTime()).length;
  }, [feedbackHistory]);

  const targetBand = parseTargetBand(selectedTrack?.bandTarget || '6.5');
  const currentBand = feedback?.scores.overallBand || feedbackHistory[0]?.scores.overallBand || 0;
  const targetProgress = Math.round(Math.min(100, (currentBand / targetBand) * 100));
  const selectedUnitProgress = selectedUnit ? unitProgressMap.get(selectedUnit.id) || 0 : 0;

  const topWeakTag = (activeErrorTag || errorGraph[0]?.tag || null) as FeedbackIssue['tag'] | null;
  const selectedErrorNode = errorGraph.find((node) => node.tag === topWeakTag) || errorGraph[0] || null;

  const nextActionLabel = selectedErrorNode
    ? `优先修复 ${ISSUE_LABELS[selectedErrorNode.tag]}，把弱项从"知道"推进到"会用"。`
    : '先完成一次写作评分，建立你的弱项图谱和下一步训练路径。';

  const unitObjectives = selectedUnit?.learningObjectives || [];
  const recentHistory = feedbackHistory.slice(0, 6);
  const latestNextActions = feedback?.nextActions?.slice(0, 3) || [];
  const activeWordCount = toWordCount(runtime.writingAnswer);

  const workspaceCopy: WorkspaceCopy = ({
    brief: {
      eyebrow: '策略规划',
      title: '先把这次冲分回合排清楚',
      body: '从轨道、题型、话题和时间预算开始。先确定这次要练什么，再进入写作工作台，避免一上来就被所有工具打断。',
    },
    draft: {
      eyebrow: '写作工作台',
      title: '把草稿写完，再决定是否调用辅助工具',
      body: '编辑器是主舞台。提纲、词汇升级和教练问答全部折叠在下方，需要时再展开，不抢正文注意力。',
    },
    review: {
      eyebrow: '结果复盘',
      title: '先看证据，再决定补救动作',
      body: '评分、错因、改写和下一步行动放在同一层，但只围绕一次反馈展开，避免回顾和新写作混在一起。',
    },
    insight: {
      eyebrow: '数据洞察',
      title: '只看当前需要的那一维数据',
      body: '弱项图谱、Band 走势、历史回顾分开放置，按需切换，避免一次看完所有指标。',
    },
  })[runtime.workspaceView] ?? {
    eyebrow: '数据洞察',
    title: '只看当前需要的那一维数据',
    body: '弱项图谱、Band 走势、历史回顾分开放置，按需切换，避免一次看完所有指标。',
  };

  const handleJumpToVocabulary = useCallback(() => {
    jumpToVocabularyByTag(topWeakTag || 'lexical');
  }, [jumpToVocabularyByTag, topWeakTag]);

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 px-2 pb-10 sm:px-4 lg:px-6">
      <HeroSummary
        plan={plan}
        streakDays={streakDays}
        thisWeekRuns={thisWeekRuns}
        currentBand={currentBand}
        targetBand={targetBand}
        targetProgress={targetProgress}
        nextActionLabel={nextActionLabel}
        selectedTrackTitle={selectedTrack?.title || null}
        selectedUnitTitle={selectedUnit?.title || null}
        selectedUnitProgress={selectedUnitProgress}
        taskType={runtime.taskType}
        remainingQuota={remainingQuota}
        quotaTotal={quotaTotal}
        onContinueWriting={() => runtime.setWorkspaceView('draft')}
        onStartSimulation={() => void runtime.handleGenerateSimItem()}
        onShowWeakness={() => runtime.setWorkspaceView('insight')}
        isBusy={runtime.loadingStage !== 'idle'}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <RouteConsole
          trackSearch={trackSearch}
          onTrackSearchChange={setTrackSearch}
          filteredTracks={filteredTracks}
          selectedTrackId={selectedTrackIdSafe}
          trackProgressMap={trackProgressMap}
          onSelectTrack={setSelectedTrackId}
          unitSearch={unitSearch}
          onUnitSearchChange={setUnitSearch}
          filteredUnits={filteredUnits}
          selectedUnitId={selectedUnitIdSafe}
          selectedUnit={selectedUnit}
          selectedUnitProgress={selectedUnitProgress}
          unitProgressMap={unitProgressMap}
          onSelectUnit={setSelectedUnitId}
        />

        <ExamWorkspaceTabs
          workspaceView={runtime.workspaceView}
          onWorkspaceViewChange={runtime.setWorkspaceView}
          workspaceCopy={workspaceCopy}
          loadingStage={runtime.loadingStage}
          promptTopic={runtime.promptTopic}
          onPromptTopicChange={runtime.setPromptTopic}
          promptDifficulty={runtime.promptDifficulty}
          onPromptDifficultyChange={runtime.setPromptDifficulty}
          onGeneratePrompt={runtime.handleGeneratePrompt}
          onGenerateSimulation={runtime.handleGenerateSimItem}
          isBusy={runtime.loadingStage !== 'idle'}
          simItem={runtime.simItem}
          writingPrompt={runtime.writingPrompt}
          taskType={runtime.taskType}
          selectedUnit={selectedUnit}
          selectedTrackTitle={selectedTrack?.title || null}
          unitObjectives={unitObjectives}
          isSimulationMode={runtime.isSimulationMode}
          simulationTotalSec={runtime.simulationTotalSec}
          simulationRemainingSec={runtime.simulationRemainingSec}
          formatSeconds={formatSeconds}
          activeWordCount={activeWordCount}
          autosavedAt={autosavedAt}
          writingAnswer={runtime.writingAnswer}
          onWritingAnswerChange={runtime.setWritingAnswer}
          onSubmitWriting={runtime.handleSubmitWriting}
          toolPanel={runtime.toolPanel}
          onToolPanelChange={runtime.setToolPanel}
          outline={runtime.outline}
          onBuildOutline={runtime.handleBuildOutline}
          vocabSuggestions={runtime.vocabSuggestions}
          onEnhanceVocabulary={runtime.handleEnhanceVocabulary}
          tutorQuestion={runtime.tutorQuestion}
          onTutorQuestionChange={runtime.setTutorQuestion}
          tutorReply={runtime.tutorReply}
          onAskTutor={runtime.handleAskTutor}
          feedback={runtime.feedback}
          feedbackLatencyMs={runtime.feedbackLatencyMs}
          latestNextActions={latestNextActions}
          onGenerateMicroLesson={runtime.handleGenerateMicroLesson}
          onJumpToVocabulary={handleJumpToVocabulary}
          onBackToBrief={() => runtime.setWorkspaceView('brief')}
          onReturnToDraft={() => runtime.setWorkspaceView('draft')}
          onQuickStart={runtime.handleGenerateSimItem}
          errorAnalytics={errorAnalytics}
          activeErrorTag={runtime.activeErrorTag}
          onSelectErrorTag={runtime.setActiveErrorTag}
          selectedErrorNode={selectedErrorNode}
          feedbackHistory={runtime.feedbackHistory}
          selectedTrackBandTarget={selectedTrack?.bandTarget || null}
          selectedUnitProgress={selectedUnitProgress}
          thisWeekRuns={thisWeekRuns}
          recentHistory={recentHistory}
          onRetryFeedback={runtime.handleRetryFeedback}
          onViewError={(tag) => {
            runtime.setActiveErrorTag(tag);
            runtime.setWorkspaceView('insight');
          }}
          microUnit={runtime.microUnit}
        />
      </div>

      {runtime.showCelebrate && (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
          <div className="rounded-full border border-emerald-400/50 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-500 backdrop-blur-sm">
            <CheckCircle2 className="mr-1 inline h-4 w-4" /> Band 提升 +0.5，继续保持这波节奏！
          </div>
        </div>
      )}
    </div>
  );
}

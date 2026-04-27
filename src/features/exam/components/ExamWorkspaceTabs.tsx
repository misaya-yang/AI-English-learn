import { BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ISSUE_LABELS } from '@/features/exam/constants';
import { ErrorGraph } from '@/features/exam/components/ErrorGraph';
import { ExamBriefPanel } from '@/features/exam/components/ExamBriefPanel';
import { ExamDraftPanel } from '@/features/exam/components/ExamDraftPanel';
import { EmptyKickoffCard, LoadingPipeline, MiniTrendChart, WorkspaceLead } from '@/features/exam/components/ExamPrepShared';
import { ExamReviewPanel } from '@/features/exam/components/ExamReviewPanel';
import type { LoadingStage, PromptDifficulty, TaskType, ToolPanel, WorkspaceCopy, WorkspaceView } from '@/features/exam/types';
import type { VocabUpgradeSuggestion, WritingOutlineResult } from '@/services/aiExamCoach';
import type { AiFeedback, ContentUnit, ExamItem, FeedbackIssue } from '@/types/examContent';

interface ExamWorkspaceTabsProps {
  workspaceView: WorkspaceView;
  onWorkspaceViewChange: (view: WorkspaceView) => void;
  workspaceCopy: WorkspaceCopy;
  loadingStage: LoadingStage;
  promptTopic: string;
  onPromptTopicChange: (value: string) => void;
  promptDifficulty: PromptDifficulty;
  onPromptDifficultyChange: (value: PromptDifficulty) => void;
  onGeneratePrompt: () => void;
  onGenerateSimulation: () => Promise<void>;
  isBusy: boolean;
  simItem: ExamItem | null;
  writingPrompt: string;
  taskType: TaskType;
  selectedUnit: ContentUnit | null;
  selectedTrackTitle: string | null;
  unitObjectives: string[];
  isSimulationMode: boolean;
  simulationTotalSec: number;
  simulationRemainingSec: number;
  formatSeconds: (seconds: number) => string;
  activeWordCount: number;
  autosavedAt: string | null;
  writingAnswer: string;
  onWritingAnswerChange: (value: string) => void;
  onSubmitWriting: () => Promise<void>;
  toolPanel?: ToolPanel;
  onToolPanelChange: (value: ToolPanel | undefined) => void;
  outline: WritingOutlineResult | null;
  onBuildOutline: () => void;
  vocabSuggestions: VocabUpgradeSuggestion[];
  onEnhanceVocabulary: () => void;
  tutorQuestion: string;
  onTutorQuestionChange: (value: string) => void;
  tutorReply: string;
  onAskTutor: () => Promise<void>;
  feedback: AiFeedback | null;
  feedbackLatencyMs: number | null;
  latestNextActions: string[];
  onGenerateMicroLesson: () => Promise<void>;
  onJumpToVocabulary: () => void;
  onBackToBrief: () => void;
  onReturnToDraft: () => void;
  onQuickStart: () => Promise<void>;
  // Insight props (merged from InsightRail)
  errorAnalytics: Array<{ tag: string; label: string; weight: number }>;
  activeErrorTag: FeedbackIssue['tag'] | null;
  onSelectErrorTag: (tag: FeedbackIssue['tag']) => void;
  selectedErrorNode: { tag: FeedbackIssue['tag']; count: number } | null;
  feedbackHistory: AiFeedback[];
  selectedTrackBandTarget: string | null;
  selectedUnitProgress: number;
  thisWeekRuns: number;
  recentHistory: AiFeedback[];
  onRetryFeedback: (item: AiFeedback) => void;
  onViewError: (tag: FeedbackIssue['tag']) => void;
  microUnit: ContentUnit | null;
}

export function ExamWorkspaceTabs({
  workspaceView,
  onWorkspaceViewChange,
  workspaceCopy,
  loadingStage,
  promptTopic,
  onPromptTopicChange,
  promptDifficulty,
  onPromptDifficultyChange,
  onGeneratePrompt,
  onGenerateSimulation,
  isBusy,
  simItem,
  writingPrompt,
  taskType,
  selectedUnit,
  selectedTrackTitle,
  unitObjectives,
  isSimulationMode,
  simulationTotalSec,
  simulationRemainingSec,
  formatSeconds,
  activeWordCount,
  autosavedAt,
  writingAnswer,
  onWritingAnswerChange,
  onSubmitWriting,
  toolPanel,
  onToolPanelChange,
  outline,
  onBuildOutline,
  vocabSuggestions,
  onEnhanceVocabulary,
  tutorQuestion,
  onTutorQuestionChange,
  tutorReply,
  onAskTutor,
  feedback,
  feedbackLatencyMs,
  latestNextActions,
  onGenerateMicroLesson,
  onJumpToVocabulary,
  onBackToBrief,
  onReturnToDraft,
  onQuickStart,
  errorAnalytics,
  activeErrorTag,
  onSelectErrorTag,
  selectedErrorNode,
  feedbackHistory,
  selectedTrackBandTarget,
  selectedUnitProgress,
  thisWeekRuns,
  recentHistory,
  onRetryFeedback,
  onViewError,
  microUnit,
}: ExamWorkspaceTabsProps) {
  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <section className="overflow-hidden rounded-[28px] border border-border/70 bg-card/90">
        <Tabs
          value={workspaceView}
          onValueChange={(value) => onWorkspaceViewChange(value as WorkspaceView)}
          className="gap-0"
        >
          <div className="border-b border-border/70 px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <WorkspaceLead eyebrow={workspaceCopy.eyebrow} title={workspaceCopy.title} body={workspaceCopy.body} />
              <TabsList className="grid h-auto w-full max-w-[420px] grid-cols-4 rounded-full bg-muted/70 p-1">
                <TabsTrigger value="brief" className="rounded-full">概览</TabsTrigger>
                <TabsTrigger value="draft" className="rounded-full">写作</TabsTrigger>
                <TabsTrigger value="review" className="rounded-full">结果</TabsTrigger>
                <TabsTrigger value="insight" className="rounded-full">洞察</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="px-5 py-5">
            <LoadingPipeline stage={loadingStage} />

            <TabsContent value="brief" className="mt-0 space-y-5">
              <ExamBriefPanel
                promptTopic={promptTopic}
                onPromptTopicChange={onPromptTopicChange}
                promptDifficulty={promptDifficulty}
                onPromptDifficultyChange={onPromptDifficultyChange}
                onGeneratePrompt={onGeneratePrompt}
                onGenerateSimulation={onGenerateSimulation}
                onOpenDraft={() => onWorkspaceViewChange('draft')}
                isBusy={isBusy}
                simItem={simItem}
                writingPrompt={writingPrompt}
                taskType={taskType}
                selectedUnit={selectedUnit}
                selectedTrackTitle={selectedTrackTitle}
                unitObjectives={unitObjectives}
                isSimulationMode={isSimulationMode}
                simulationTotalSec={simulationTotalSec}
                simulationRemainingSec={simulationRemainingSec}
                formatSeconds={formatSeconds}
              />
            </TabsContent>

            <TabsContent value="draft" className="mt-0 space-y-5">
              <ExamDraftPanel
                taskType={taskType}
                activeWordCount={activeWordCount}
                autosavedAt={autosavedAt}
                writingPrompt={writingPrompt}
                writingAnswer={writingAnswer}
                onWritingAnswerChange={onWritingAnswerChange}
                onSubmitWriting={onSubmitWriting}
                isBusy={isBusy}
                loadingStage={loadingStage}
                toolPanel={toolPanel}
                onToolPanelChange={onToolPanelChange}
                outline={outline}
                onBuildOutline={onBuildOutline}
                vocabSuggestions={vocabSuggestions}
                onEnhanceVocabulary={onEnhanceVocabulary}
                tutorQuestion={tutorQuestion}
                onTutorQuestionChange={onTutorQuestionChange}
                tutorReply={tutorReply}
                onAskTutor={onAskTutor}
                onBackToBrief={onBackToBrief}
              />
            </TabsContent>

            <TabsContent value="review" className="mt-0 space-y-5">
              {feedback ? (
                <ExamReviewPanel
                  feedback={feedback}
                  feedbackLatencyMs={feedbackLatencyMs}
                  latestNextActions={latestNextActions}
                  isBusy={isBusy}
                  onGenerateMicroLesson={onGenerateMicroLesson}
                  onJumpToVocabulary={onJumpToVocabulary}
                  onReturnToDraft={onReturnToDraft}
                  onQuickStart={onQuickStart}
                />
              ) : (
                <EmptyKickoffCard onQuickStart={() => void onQuickStart()} />
              )}
            </TabsContent>

            <TabsContent value="insight" className="mt-0 space-y-5">
              <InsightPanel
                errorAnalytics={errorAnalytics}
                activeErrorTag={activeErrorTag}
                onSelectErrorTag={onSelectErrorTag}
                onQuickStart={onQuickStart}
                selectedErrorNode={selectedErrorNode}
                feedback={feedback}
                isBusy={isBusy}
                onGenerateMicroLesson={onGenerateMicroLesson}
                onJumpToVocabulary={onJumpToVocabulary}
                microUnit={microUnit}
                feedbackHistory={feedbackHistory}
                selectedTrackBandTarget={selectedTrackBandTarget}
                selectedUnitProgress={selectedUnitProgress}
                thisWeekRuns={thisWeekRuns}
                recentHistory={recentHistory}
                onRetryFeedback={onRetryFeedback}
                onViewError={onViewError}
              />
            </TabsContent>
          </div>
        </Tabs>
      </section>
    </motion.main>
  );
}

// Inline insight panel (formerly InsightRail) — no separate right column
interface InsightPanelProps {
  errorAnalytics: Array<{ tag: string; label: string; weight: number }>;
  activeErrorTag: FeedbackIssue['tag'] | null;
  onSelectErrorTag: (tag: FeedbackIssue['tag']) => void;
  onQuickStart: () => Promise<void>;
  selectedErrorNode: { tag: FeedbackIssue['tag']; count: number } | null;
  feedback: AiFeedback | null;
  isBusy: boolean;
  onGenerateMicroLesson: () => Promise<void>;
  onJumpToVocabulary: () => void;
  microUnit: ContentUnit | null;
  feedbackHistory: AiFeedback[];
  selectedTrackBandTarget: string | null;
  selectedUnitProgress: number;
  thisWeekRuns: number;
  recentHistory: AiFeedback[];
  onRetryFeedback: (item: AiFeedback) => void;
  onViewError: (tag: FeedbackIssue['tag']) => void;
}

function InsightPanel({
  errorAnalytics,
  activeErrorTag,
  onSelectErrorTag,
  onQuickStart,
  selectedErrorNode,
  feedback,
  isBusy,
  onGenerateMicroLesson,
  onJumpToVocabulary,
  microUnit,
  feedbackHistory,
  selectedTrackBandTarget,
  selectedUnitProgress,
  thisWeekRuns,
  recentHistory,
  onRetryFeedback,
  onViewError,
}: InsightPanelProps) {
  return (
    <Tabs defaultValue="weakness" className="gap-0">
      <TabsList className="grid w-full max-w-[300px] grid-cols-3 rounded-full bg-muted/70 p-1">
        <TabsTrigger value="weakness" className="rounded-full">弱项</TabsTrigger>
        <TabsTrigger value="trend" className="rounded-full">走势</TabsTrigger>
        <TabsTrigger value="history" className="rounded-full">历史</TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="weakness" className="mt-0 space-y-4">
          {errorAnalytics.length === 0 ? (
            <EmptyKickoffCard onQuickStart={() => void onQuickStart()} />
          ) : (
            <div className="rounded-[20px] border border-border/70 bg-background/35 p-4">
              <ErrorGraph
                analytics={errorAnalytics}
                activeTag={activeErrorTag}
                onSelectTag={(tag) => onSelectErrorTag(tag as FeedbackIssue['tag'])}
              />
            </div>
          )}

          <div className="rounded-[20px] border border-border/70 bg-background/35 p-4">
            <p className="text-sm font-semibold">下一步最优行动</p>
            {selectedErrorNode ? (
              <>
                <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-3">
                  <p className="text-sm font-medium text-emerald-500">优先修复：{ISSUE_LABELS[selectedErrorNode.tag]}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    近期命中 {selectedErrorNode.count} 次，建议先做一次补救微课，再回到写作工作台复写。
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={() => void onGenerateMicroLesson()} disabled={isBusy || !feedback}>
                    <Sparkles className="mr-1.5 h-4 w-4" /> 一键错题转课程
                  </Button>
                  <Button variant="outline" onClick={onJumpToVocabulary}>
                    <BookOpen className="mr-1.5 h-4 w-4" /> 跳转词库补强
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">完成首次反馈后，这里会自动生成下一步行动建议。</p>
            )}

            {microUnit && (
              <div className="mt-4 rounded-xl border border-border/60 bg-background/50 p-3">
                <p className="text-sm font-medium">最新补救微课</p>
                <p className="mt-1 text-sm text-foreground">{microUnit.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">预计 {microUnit.estimatedMinutes} 分钟 · {microUnit.cefrLevel}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trend" className="mt-0 space-y-4">
          <div className="rounded-[20px] border border-border/70 bg-background/35 p-4">
            <p className="text-sm font-semibold">Band 走势</p>
            <p className="mt-1 text-xs text-muted-foreground">最近 7 次反馈走势</p>
            <div className="mt-4">
              <MiniTrendChart history={feedbackHistory} />
            </div>
          </div>

          <div className="rounded-[20px] border border-border/70 bg-background/35 p-4">
            <p className="text-sm font-semibold">本轮状态</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>当前轨道</span>
                <span className="font-medium text-foreground">{selectedTrackBandTarget || '未选择'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>当前单元</span>
                <span className="font-medium text-foreground">{selectedUnitProgress}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>本周完成反馈</span>
                <span className="font-medium text-foreground">{thisWeekRuns} 次</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          {recentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无反馈记录，先完成一次写作评分。</p>
          ) : (
            <ScrollArea className="h-[560px] pr-2">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recentHistory.map((item) => {
                  const tags = item.issues.slice(0, 3).map((issue) => ISSUE_LABELS[issue.tag] || issue.tag);
                  return (
                    <div key={item.attemptId} className="rounded-[20px] border border-border/70 bg-background/35 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                          <p className="mt-1 text-lg font-semibold">Band {item.scores.overallBand.toFixed(1)}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full">{item.provider}</Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                        <span className="rounded-md bg-muted/40 px-2 py-1">Task {item.scores.taskResponse.toFixed(1)}</span>
                        <span className="rounded-md bg-muted/40 px-2 py-1">Coherence {item.scores.coherenceCohesion.toFixed(1)}</span>
                        <span className="rounded-md bg-muted/40 px-2 py-1">Lexical {item.scores.lexicalResource.toFixed(1)}</span>
                        <span className="rounded-md bg-muted/40 px-2 py-1">Grammar {item.scores.grammaticalRangeAccuracy.toFixed(1)}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
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

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onRetryFeedback(item)}>
                          再练一次
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-500"
                          onClick={() => {
                            const firstTag = item.issues[0]?.tag;
                            if (firstTag) {
                              onViewError(firstTag);
                            }
                          }}
                        >
                          查看错因
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}

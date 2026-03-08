import { motion } from 'framer-motion';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExamBriefPanel } from '@/features/exam/components/ExamBriefPanel';
import { ExamDraftPanel } from '@/features/exam/components/ExamDraftPanel';
import { EmptyKickoffCard, LoadingPipeline, WorkspaceLead } from '@/features/exam/components/ExamPrepShared';
import { ExamReviewPanel } from '@/features/exam/components/ExamReviewPanel';
import type { LoadingStage, PromptDifficulty, TaskType, ToolPanel, WorkspaceCopy, WorkspaceView } from '@/features/exam/types';
import type { VocabUpgradeSuggestion, WritingOutlineResult } from '@/services/aiExamCoach';
import type { AiFeedback, ContentUnit, ExamItem } from '@/types/examContent';

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
              <TabsList className="grid h-auto w-full max-w-[340px] grid-cols-3 rounded-full bg-muted/70 p-1">
                <TabsTrigger value="brief" className="rounded-full">策略</TabsTrigger>
                <TabsTrigger value="draft" className="rounded-full">写作</TabsTrigger>
                <TabsTrigger value="review" className="rounded-full">复盘</TabsTrigger>
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
          </div>
        </Tabs>
      </section>
    </motion.main>
  );
}

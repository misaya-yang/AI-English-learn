import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizArtifactCard } from '@/features/chat/components/QuizArtifactCard';
import type {
  QuizRunArtifactEntry,
  QuizSequenceState,
} from '@/features/chat/runtime/quizSequenceState';
import type { ChatArtifact, ChatMode } from '@/types/chatAgent';

type QuizArtifact = Extract<ChatArtifact, { type: 'quiz' }>;

export interface QuizCanvasPanelProps {
  language: string;
  sequence: QuizSequenceState;
  canvasIndex: number;
  artifacts: QuizRunArtifactEntry[];
  activeArtifact: QuizRunArtifactEntry | null;
  attemptedQuizMap: Record<string, { selected: string }>;
  sessionId: string | null;
  mode: ChatMode;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmitQuiz: (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => void | Promise<void>;
  onAddReviewCard: (artifact: QuizArtifact) => void;
  onGenerateLesson: (artifact: QuizArtifact) => void;
}

export const QuizCanvasPanel = ({
  language,
  sequence,
  canvasIndex,
  artifacts,
  activeArtifact,
  attemptedQuizMap,
  sessionId,
  mode,
  isLoading,
  onPrevious,
  onNext,
  onSubmitQuiz,
  onAddReviewCard,
  onGenerateLesson,
}: QuizCanvasPanelProps) => {
  const isZh = language.startsWith('zh');
  const nextDisabled = canvasIndex >= Math.min(artifacts.length - 1, sequence.answeredCount);

  return (
    <div className="pt-2">
      <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50/55 dark:bg-emerald-900/20 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {isZh ? '连续测验画布' : 'Quiz Canvas'}
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
              {isZh
                ? `第 ${Math.min(canvasIndex + 1, sequence.targetCount)}/${sequence.targetCount} 题 · 已完成 ${sequence.answeredCount} 题`
                : `Question ${Math.min(canvasIndex + 1, sequence.targetCount)}/${sequence.targetCount} · ${sequence.answeredCount} completed`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={canvasIndex <= 0}
              onClick={onPrevious}
              title={isZh ? '上一题' : 'Previous question'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={nextDisabled}
              onClick={onNext}
              title={isZh ? '下一题' : 'Next question'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {activeArtifact ? (
          <QuizArtifactCard
            key={`quiz-canvas-${activeArtifact.artifact.payload.quizId}`}
            artifact={activeArtifact.artifact}
            sessionId={sessionId}
            mode={mode}
            hasAttempt={Boolean(attemptedQuizMap[activeArtifact.artifact.payload.quizId])}
            attemptedOption={attemptedQuizMap[activeArtifact.artifact.payload.quizId]?.selected}
            onSubmit={onSubmitQuiz}
            onAddReviewCard={onAddReviewCard}
            onGenerateLesson={onGenerateLesson}
            language={language}
          />
        ) : (
          <div className="rounded-xl border border-emerald-300/35 bg-background/70 px-3 py-4 text-sm text-muted-foreground">
            {isLoading
              ? (isZh ? '正在生成测验题目...' : 'Generating quiz questions...')
              : (isZh ? '暂未拿到题目，请重试或稍后继续。' : 'No quiz item returned yet. Please retry.')}
          </div>
        )}
      </div>
    </div>
  );
};

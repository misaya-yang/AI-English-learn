import { Link2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatArtifact, ChatMode } from '@/types/chatAgent';
import type { AttemptedQuizMapEntry } from '@/features/chat/types';
import { QuizArtifactCard } from '@/features/chat/components/QuizArtifactCard';

interface ChatArtifactRendererProps {
  messageId: string;
  artifacts?: ChatArtifact[];
  isStreaming?: boolean;
  sessionId: string | null;
  mode: ChatMode;
  attemptedQuizMap: Record<string, AttemptedQuizMapEntry>;
  onSubmitQuiz: (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => void | Promise<void>;
  onAddReviewCard: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onGenerateLesson: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onUseCanvasSummary: (summary: string) => void;
  language: string;
}

export function ChatArtifactRenderer({
  messageId,
  artifacts,
  isStreaming,
  sessionId,
  mode,
  attemptedQuizMap,
  onSubmitQuiz,
  onAddReviewCard,
  onGenerateLesson,
  onUseCanvasSummary,
  language,
}: ChatArtifactRendererProps) {
  if (isStreaming || !artifacts || artifacts.length === 0) {
    return null;
  }

  return (
    <>
      {artifacts.map((artifact, index) => {
        if (artifact.type === 'quiz') {
          const attempt = attemptedQuizMap[artifact.payload.quizId];
          return (
            <QuizArtifactCard
              key={`${messageId}-quiz-${index}`}
              artifact={artifact}
              sessionId={sessionId}
              mode={mode}
              hasAttempt={Boolean(attempt)}
              attemptedOption={attempt?.selected}
              onSubmit={onSubmitQuiz}
              onAddReviewCard={onAddReviewCard}
              onGenerateLesson={onGenerateLesson}
              language={language}
            />
          );
        }

        if (artifact.type === 'web_sources') {
          return (
            <div
              key={`${messageId}-sources-${index}`}
              className="mt-3 space-y-2 rounded-xl border border-blue-300/40 bg-blue-50/50 p-3 dark:bg-blue-900/20"
            >
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {artifact.payload.title || (language.startsWith('zh') ? '资料来源' : 'Sources')}
              </p>
              <div className="space-y-2">
                {artifact.payload.sources.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-blue-200/60 bg-background/70 px-3 py-2 transition-colors hover:border-blue-400/70 dark:border-blue-800/60"
                  >
                    <div className="flex items-start gap-2">
                      <Link2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{source.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{source.domain}</p>
                        {source.snippet && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                            {source.snippet}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        }

        if (artifact.type === 'canvas_summary') {
          return (
            <div
              key={`${messageId}-canvas-summary-${index}`}
              className="mt-3 space-y-2 rounded-xl border border-violet-300/40 bg-violet-50/50 p-3 dark:bg-violet-900/20"
            >
              <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                {artifact.payload.title}
              </p>
              <p className="text-sm text-muted-foreground">{artifact.payload.summary}</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onUseCanvasSummary(artifact.payload.summary)}
              >
                {language.startsWith('zh') ? '同步到主对话输入框' : 'Sync summary to input'}
              </Button>
            </div>
          );
        }

        if (artifact.type === 'study_plan') {
          return (
            <div
              key={`${messageId}-study-plan-${index}`}
              className="mt-3 space-y-2 rounded-xl border border-emerald-300/40 bg-emerald-50/50 p-3 dark:bg-emerald-900/20"
            >
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {artifact.payload.title}
              </p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {artifact.payload.steps.map((step, stepIndex) => (
                  <li key={`${messageId}-study-step-${stepIndex}`}>{step}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (artifact.type === 'canvas_hint') {
          return (
            <div
              key={`${messageId}-canvas-hint-${index}`}
              className="mt-3 space-y-2 rounded-xl border border-amber-300/40 bg-amber-50/50 p-3 dark:bg-amber-900/20"
            >
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                {artifact.payload.title}
              </p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                {artifact.payload.hints.map((hint, hintIndex) => (
                  <div key={`${messageId}-hint-${hintIndex}`} className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                    <p>{hint}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

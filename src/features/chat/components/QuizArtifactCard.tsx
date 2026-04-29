import { useState } from 'react';
import { Layers3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMode, ChatArtifact } from '@/types/chatAgent';

interface QuizArtifactCardProps {
  artifact: Extract<ChatArtifact, { type: 'quiz' }>;
  sessionId: string | null;
  mode: ChatMode;
  hasAttempt: boolean;
  attemptedOption?: string;
  onSubmit: (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => void | Promise<void>;
  onAddReviewCard: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onGenerateLesson: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  language: string;
}

export function QuizArtifactCard({
  artifact,
  sessionId,
  mode,
  hasAttempt,
  attemptedOption,
  onSubmit,
  onAddReviewCard,
  onGenerateLesson,
  language,
}: QuizArtifactCardProps) {
  const initialSelection = attemptedOption || '';
  const [selected, setSelected] = useState(initialSelection);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [localAttempted, setLocalAttempted] = useState(hasAttempt);
  const [localSelected, setLocalSelected] = useState(initialSelection);

  const effectiveSelected = localSelected || selected;
  const isCorrect = effectiveSelected === artifact.payload.answerKey;
  const canSubmit = !!sessionId && !localAttempted && selected.length > 0;

  return (
    <div className="mt-2 space-y-3 p-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary">
          {artifact.payload.title}
        </p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
          {artifact.payload.difficulty}
        </span>
      </div>

      <p className="text-sm leading-relaxed">{artifact.payload.stem}</p>

      <div className="space-y-2">
        {artifact.payload.options.map((option) => {
          const checked = effectiveSelected === option.id;
          const disabled = localAttempted;
          const optionIsCorrect = localAttempted && option.id === artifact.payload.answerKey;
          const optionIsWrongSelected =
            localAttempted && checked && option.id !== artifact.payload.answerKey;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (disabled) return;
                if (!startedAt) {
                  setStartedAt(Date.now());
                }
                setSelected(option.id);
              }}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                checked
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border hover:border-primary/40',
                optionIsCorrect && 'border-[hsl(var(--success)/0.5)] bg-[hsl(var(--success)/0.12)]',
                optionIsWrongSelected && 'border-destructive/50 bg-destructive/10',
              )}
              disabled={disabled}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {!localAttempted ? (
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!canSubmit}
          onClick={() => {
            if (!sessionId || !selected) return;
            const durationMs = startedAt ? Math.max(1200, Date.now() - startedAt) : 1200;
            const correct = selected === artifact.payload.answerKey;
            onSubmit(artifact.payload.quizId, selected, correct, durationMs);
            setLocalSelected(selected);
            setLocalAttempted(true);
          }}
        >
          {language.startsWith('zh') ? '提交答案' : 'Submit'}
        </Button>
      ) : (
        <div className="rounded-lg border border-border bg-background/70 px-3 py-2 text-sm">
          <p className={cn('font-medium', isCorrect ? 'text-[hsl(var(--success))]' : 'text-destructive')}>
            {isCorrect
              ? language.startsWith('zh')
                ? '回答正确'
                : 'Correct'
              : language.startsWith('zh')
                ? '回答不正确'
                : 'Not quite'}
          </p>
          <p className="mt-1 text-muted-foreground">{artifact.payload.explanation}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onAddReviewCard(artifact)}>
          <Layers3 className="mr-1.5 h-3.5 w-3.5" />
          {language.startsWith('zh') ? '加入复习卡' : 'Add to review'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onGenerateLesson(artifact)}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {language.startsWith('zh') ? '生成补救微课' : 'Generate micro lesson'}
        </Button>
        <span className="self-center text-xs text-muted-foreground">
          {mode.toUpperCase()} · {artifact.payload.estimatedSeconds}s
        </span>
      </div>
    </div>
  );
}

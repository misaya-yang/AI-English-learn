import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuizSequenceState } from '@/features/chat/runtime/quizSequenceState';

export interface QuizRunFooterProps {
  language: string;
  contentWidthClass: string;
  sequence: QuizSequenceState;
  completed: boolean;
  onEnd: () => void;
}

export const QuizRunFooter = ({
  language,
  contentWidthClass,
  sequence,
  completed,
  onEnd,
}: QuizRunFooterProps) => {
  const isZh = language.startsWith('zh');
  return (
    <div className="px-4 pb-2">
      <div
        className={cn(
          contentWidthClass,
          'mx-auto rounded-xl border border-emerald-300/40 bg-emerald-50/60 dark:bg-emerald-900/20 px-3 py-2 flex items-center justify-between gap-3',
        )}
      >
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          {isZh
            ? completed
              ? `连续测验已完成：${sequence.targetCount}/${sequence.targetCount} 题`
              : `连续测验进行中：已完成 ${sequence.answeredCount}/${sequence.targetCount} 题`
            : completed
              ? `Quiz completed: ${sequence.targetCount}/${sequence.targetCount}`
              : `Quiz streak in progress: ${sequence.answeredCount}/${sequence.targetCount} completed`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-emerald-700 hover:text-emerald-800"
          onClick={onEnd}
        >
          {isZh
            ? (completed ? '收起测验画布' : '结束连续测验')
            : (completed ? 'Close quiz canvas' : 'End quiz run')}
        </Button>
      </div>
    </div>
  );
};

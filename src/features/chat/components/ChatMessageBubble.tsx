import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import { toast } from 'sonner';
import type { TFunction } from 'i18next';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatArtifactRenderer } from '@/features/chat/components/ChatArtifactRenderer';
import { CoachActionPanel } from '@/features/chat/components/CoachActionPanel';
import type { AttemptedQuizMapEntry, ChatMessageView } from '@/features/chat/types';
import type { CoachingAction } from '@/features/coach/coachingPolicy';
import type { ChatArtifact, ChatMode } from '@/types/chatAgent';

interface ChatMessageBubbleProps {
  message: ChatMessageView;
  isStreaming?: boolean;
  t: TFunction;
  language: string;
  sessionId: string | null;
  mode: ChatMode;
  attemptedQuizMap: Record<string, AttemptedQuizMapEntry>;
  onSubmitQuiz: (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => void | Promise<void>;
  onAddReviewCard: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onGenerateLesson: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onUseCanvasSummary: (summary: string) => void;
  onCoachAction?: (sendPrompt: string, action: CoachingAction) => void;
}

export function ChatMessageBubble({
  message,
  isStreaming,
  t,
  language,
  sessionId,
  mode,
  attemptedQuizMap,
  onSubmitQuiz,
  onAddReviewCard,
  onGenerateLesson,
  onUseCanvasSummary,
  onCoachAction,
}: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const quizArtifacts =
    message.artifacts?.filter(
      (artifact): artifact is Extract<ChatArtifact, { type: 'quiz' }> => artifact.type === 'quiz',
    ) || [];
  const hasUnansweredQuiz = quizArtifacts.some(
    (artifact) => !attemptedQuizMap[artifact.payload.quizId],
  );
  const shouldHideAssistantText = !isUser && !isStreaming && hasUnansweredQuiz;

  // Strip the raw coaching_actions JSON block the LLM sometimes appends to its text.
  // Old stored messages may contain **coaching_actions**\n```json...``` which renders as [object Object].
  const displayContent = isUser
    ? message.content
    : message.content.replace(/\*\*coaching_actions\*\*[\s\S]*?```[\s\S]*?```/g, '').trimEnd();

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    toast.success(t('chat.copySuccess'));
  }, [message.content, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('group flex gap-3 py-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <Avatar
        className={cn(
          'h-8 w-8 flex-shrink-0',
          isUser
            ? 'bg-gradient-to-br from-blue-100 to-indigo-100'
            : 'bg-primary/10',
        )}
      >
        <AvatarFallback className="text-xs">
          {isUser ? (
            <User className="h-4 w-4 text-blue-600" />
          ) : (
            <Bot className="h-4 w-4 text-primary" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex min-w-0 flex-col',
          isUser ? 'max-w-[90%] items-end lg:max-w-[70%]' : 'w-full max-w-[760px] items-start xl:max-w-[800px]',
        )}
      >
        {isUser ? (
          <div className="relative overflow-hidden rounded-xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground">
            <p className="relative z-10 whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
            {isStreaming && (
              <span className="relative z-10 ml-1 inline-block h-4 w-2 animate-pulse bg-primary-foreground/70 align-middle" />
            )}
          </div>
        ) : (
          <div className="relative w-full">
            {isStreaming && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(100deg, transparent 8%, hsl(var(--primary) / 0.12) 46%, transparent 82%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-120% 0%', '120% 0%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {!shouldHideAssistantText && displayContent.trim().length > 0 && (
              <div className="prose relative z-10 max-w-none dark:prose-invert">
                <MarkdownRenderer content={displayContent} />
                {isStreaming && (
                  <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary align-middle" />
                )}
              </div>
            )}
          </div>
        )}

        <ChatArtifactRenderer
          messageId={message.id}
          artifacts={message.artifacts}
          isStreaming={isStreaming}
          sessionId={sessionId}
          mode={mode}
          attemptedQuizMap={attemptedQuizMap}
          onSubmitQuiz={onSubmitQuiz}
          onAddReviewCard={onAddReviewCard}
          onGenerateLesson={onGenerateLesson}
          onUseCanvasSummary={onUseCanvasSummary}
          language={language}
        />

        {!isUser && !isStreaming && message.coachingActions && message.coachingActions.length > 0 && onCoachAction && (
          <CoachActionPanel
            actions={message.coachingActions}
            language={language}
            onRunAction={onCoachAction}
          />
        )}

        {!isUser && !isStreaming && (
          <div className="mt-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={copyToClipboard}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={language.startsWith('zh') ? '复制' : 'Copy'}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={language.startsWith('zh') ? '有用' : 'Helpful'}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={language.startsWith('zh') ? '无用' : 'Not helpful'}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

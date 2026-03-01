import { useState, useRef, useEffect, useCallback, useMemo, type ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  BookOpen,
  MessageSquare,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  StopCircle,
  MoreVertical,
  Trash2,
  Plus,
  History,
  Menu,
  Edit2,
  Check,
  AlertTriangle,
  RefreshCw,
  FlaskConical,
  NotebookPen,
  Layers3,
  GraduationCap,
  Globe,
  Link2,
  Wand2,
  ChevronUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import { INIT_ALL_SQL } from '@/lib/supabase';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useTranslation } from 'react-i18next';
import type { ChatArtifact, ChatMode } from '@/types/chatAgent';
import { useUserData } from '@/contexts/UserDataContext';
import type { WordData } from '@/data/words';
import { generateMicroLessonFromErrors } from '@/services/aiExamCoach';
import { useAuth } from '@/contexts/AuthContext';
import type { FeedbackIssue } from '@/types/examContent';
import { saveAiFeedbackRecord } from '@/data/examContent';

// Quick prompt suggestions - English prompts for learning (not translated)
const getQuickPrompts = (t: any) => [
  {
    icon: BookOpen,
    text: 'Explain the difference between "affect" and "effect"',
    textZh: t('chat.quickPrompts.affectEffect'),
  },
  {
    icon: Lightbulb,
    text: 'Give me 5 collocations with "make"',
    textZh: t('chat.quickPrompts.collocations'),
  },
  {
    icon: MessageSquare,
    text: 'Create a short dialogue at a restaurant',
    textZh: t('chat.quickPrompts.dialogue'),
  },
  {
    icon: Sparkles,
    text: 'Help me practice using "serendipity"',
    textZh: t('chat.quickPrompts.practice'),
  },
];

const CHAT_MODE_OPTIONS: Array<{ id: ChatMode; label: string; labelZh: string; icon: ComponentType<{ className?: string }> }> = [
  { id: 'chat', label: 'Chat', labelZh: '对话', icon: MessageSquare },
  { id: 'study', label: 'Study', labelZh: '学习', icon: GraduationCap },
  { id: 'quiz', label: 'Quiz', labelZh: '测验', icon: FlaskConical },
  { id: 'canvas', label: 'Canvas', labelZh: '写作', icon: NotebookPen },
];

interface QuizSequenceState {
  targetCount: number;
  answeredCount: number;
  seedPrompt: string;
  usedWords: string[];
}

interface QuizRunArtifactEntry {
  messageId: string;
  artifact: Extract<ChatArtifact, { type: 'quiz' }>;
  createdAt: number;
}

const QUIZ_INTENT_RE = /(quiz|测验|測驗|测试|測試|题目|題目|考我|考考|questions?)/i;
const ARABIC_QUIZ_COUNT_RE =
  /(\d{1,2})\s*(?:道|题|題|个|個)?\s*(?:题|題|questions?|question|道|quiz|quizzes|单词|詞彙|vocab|words?)/i;
const ZH_NUMBER_RE = /([零一二三四五六七八九十两兩]{1,3})\s*(?:道|题|題)/;
const EN_NUMBER_WORD_RE =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/i;

const EN_WORD_TO_NUMBER: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

const zhNumeralToNumber = (input: string): number | null => {
  const normalized = input.replace(/兩/g, '两');
  const digits = normalized.match(/\d+/);
  if (digits) {
    const parsed = Number(digits[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (normalized === '十') return 10;
  if (normalized.length === 1) {
    return (
      {
        零: 0,
        一: 1,
        二: 2,
        两: 2,
        三: 3,
        四: 4,
        五: 5,
        六: 6,
        七: 7,
        八: 8,
        九: 9,
      } as Record<string, number>
    )[normalized] ?? null;
  }

  if (normalized.includes('十')) {
    const [head, tail] = normalized.split('十');
    const headValue = head ? zhNumeralToNumber(head) ?? 0 : 1;
    const tailValue = tail ? zhNumeralToNumber(tail) ?? 0 : 0;
    return headValue * 10 + tailValue;
  }

  return null;
};

const parseRequestedQuizCount = (text: string): number | null => {
  const trimmed = text.trim();
  if (!trimmed || !QUIZ_INTENT_RE.test(trimmed)) {
    return null;
  }

  const arabicMatch = trimmed.match(ARABIC_QUIZ_COUNT_RE);
  if (arabicMatch?.[1]) {
    const parsed = Number(arabicMatch[1]);
    if (Number.isFinite(parsed) && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  const zhMatch = trimmed.match(ZH_NUMBER_RE);
  if (zhMatch?.[1]) {
    const parsed = zhNumeralToNumber(zhMatch[1]);
    if (parsed && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  const lower = trimmed.toLowerCase();
  const enWord = lower.match(EN_NUMBER_WORD_RE)?.[1];
  if (enWord && /(quiz|question|questions|vocab|word)/i.test(lower)) {
    const parsed = EN_WORD_TO_NUMBER[enWord.toLowerCase()];
    if (parsed && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  return null;
};

const buildQuizSequencePrompt = (args: {
  language: string;
  seedPrompt: string;
  startIndex: number;
  questionCount: number;
  targetCount: number;
  usedWords: string[];
}): string => {
  const usedWords = args.usedWords.filter((item) => item.length > 0).slice(-10);
  if (args.language.startsWith('zh')) {
    return [
      `请为同一套英语测验一次性生成 ${args.questionCount} 道四选一题（从第 ${args.startIndex} 题开始，总目标 ${args.targetCount} 题）。`,
      `用户原始需求：${args.seedPrompt}`,
      usedWords.length > 0 ? `避免重复这些词：${usedWords.join('、')}。` : '',
      `必须返回 ${args.questionCount} 个 quiz artifact（每题一个）。`,
      'content 只允许简短引导语，不要泄露答案，不要在 content 给解析。',
      '题目要按序编号并覆盖不同场景。',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `Generate ${args.questionCount} multiple-choice quiz questions in one response (starting from #${args.startIndex}, total target ${args.targetCount}).`,
    `Original user intent: ${args.seedPrompt}`,
    usedWords.length > 0 ? `Avoid repeating these target words: ${usedWords.join(', ')}.` : '',
    `Return exactly ${args.questionCount} quiz artifacts (one artifact per question).`,
    'Keep content as a short instruction only. Do not reveal answers in content.',
    'Diversify contexts across questions.',
  ]
    .filter(Boolean)
    .join('\n');
};

interface QuizCardProps {
  artifact: Extract<ChatArtifact, { type: 'quiz' }>;
  sessionId: string | null;
  mode: ChatMode;
  hasAttempt: boolean;
  attemptedOption?: string;
  onSubmit: (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => void | Promise<void>;
  onAddReviewCard: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onGenerateLesson: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  t: any;
  language: string;
}

const QuizArtifactCard = ({
  artifact,
  sessionId,
  mode,
  hasAttempt,
  attemptedOption,
  onSubmit,
  onAddReviewCard,
  onGenerateLesson,
  t,
  language,
}: QuizCardProps) => {
  const [selected, setSelected] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [localAttempted, setLocalAttempted] = useState(hasAttempt);
  const [localSelected, setLocalSelected] = useState(attemptedOption || '');

  useEffect(() => {
    setLocalAttempted(hasAttempt);
    setLocalSelected(attemptedOption || '');
  }, [attemptedOption, hasAttempt]);

  const effectiveSelected = localSelected || selected;
  const isCorrect = effectiveSelected === artifact.payload.answerKey;
  const canSubmit = !!sessionId && !localAttempted && selected.length > 0;

  return (
    <div className="mt-2 p-0 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{artifact.payload.title}</p>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
          {artifact.payload.difficulty}
        </span>
      </div>

      <p className="text-sm leading-relaxed">{artifact.payload.stem}</p>

      <div className="space-y-2">
        {artifact.payload.options.map((option) => {
          const checked = effectiveSelected === option.id;
          const disabled = localAttempted;
          const optionIsCorrect = localAttempted && option.id === artifact.payload.answerKey;
          const optionIsWrongSelected = localAttempted && checked && option.id !== artifact.payload.answerKey;

          return (
            <button
              key={option.id}
              onClick={() => {
                if (disabled) return;
                if (!startedAt) {
                  setStartedAt(Date.now());
                }
                setSelected(option.id);
              }}
              className={cn(
                'w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors',
                checked ? 'border-emerald-500 bg-emerald-100/80 dark:bg-emerald-900/50' : 'border-border hover:border-emerald-400/60',
                optionIsCorrect && 'border-emerald-600 bg-emerald-100 dark:bg-emerald-900/60',
                optionIsWrongSelected && 'border-red-500 bg-red-50 dark:bg-red-950/40',
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
          className="bg-emerald-600 hover:bg-emerald-700"
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
          <p className={cn('font-medium', isCorrect ? 'text-emerald-600' : 'text-red-500')}>
            {isCorrect ? (language.startsWith('zh') ? '回答正确' : 'Correct') : (language.startsWith('zh') ? '回答不正确' : 'Not quite')}
          </p>
          <p className="mt-1 text-muted-foreground">{artifact.payload.explanation}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddReviewCard(artifact)}
        >
          <Layers3 className="h-3.5 w-3.5 mr-1.5" />
          {language.startsWith('zh') ? '加入复习卡' : 'Add to review'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGenerateLesson(artifact)}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          {language.startsWith('zh') ? '生成补救微课' : 'Generate micro lesson'}
        </Button>
        <span className="text-xs text-muted-foreground self-center">
          {mode.toUpperCase()} · {artifact.payload.estimatedSeconds}s
        </span>
      </div>
    </div>
  );
};

// Welcome message component
const WelcomeMessage = ({ onPromptClick, t, prompts }: { onPromptClick: (text: string) => void; t: any; prompts: any[] }) => (
  <div className="flex flex-col items-center justify-center py-8 px-4">
    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
      <Bot className="h-8 w-8 text-emerald-600" />
    </div>
    <h2 className="text-2xl font-bold mb-2 text-center">{t('chat.welcomeTitle')}</h2>
    <p className="text-muted-foreground text-center max-w-md mb-8">
      {t('chat.welcomeDesc')}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
      {prompts.map((prompt: any, index: number) => (
        <button
          key={index}
          onClick={() => onPromptClick(prompt.text)}
          className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
            <prompt.icon className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium">{prompt.textZh}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{prompt.text}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

interface ThinkingStatusCardProps {
  label: string;
  language: string;
  isStreaming: boolean;
  toolRuns: Array<{ name: string; status: 'success' | 'error' | 'skipped' | 'rate_limited' }>;
}

const ThinkingStatusCard = ({ label, language, isStreaming, toolRuns }: ThinkingStatusCardProps) => {
  const latestRuns = toolRuns.slice(-3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 py-3"
    >
      <Avatar className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900/40 dark:to-cyan-900/30">
        <AvatarFallback>
          <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
        </AvatarFallback>
      </Avatar>
      <div className="relative flex-1 overflow-hidden rounded-2xl rounded-bl-sm border border-emerald-300/30 bg-emerald-50/60 dark:bg-emerald-900/15 p-3">
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(100deg, transparent 10%, rgba(16, 185, 129, 0.18) 48%, transparent 86%)',
            backgroundSize: '220% 100%',
          }}
          animate={{ backgroundPosition: ['-120% 0%', '130% 0%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isStreaming
              ? language.startsWith('zh')
                ? '正在渲染并流式输出内容...'
                : 'Rendering and streaming response...'
              : language.startsWith('zh')
                ? '正在分析上下文与学习状态...'
                : 'Analyzing context and learning state...'}
          </p>

          <div className="mt-2 h-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 overflow-hidden">
            <motion.div
              className="h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500"
              animate={{ x: ['-120%', '180%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {latestRuns.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {latestRuns.map((run, idx) => {
                const statusClass =
                  run.status === 'success'
                    ? 'border-emerald-300/60 text-emerald-700 dark:text-emerald-300'
                    : run.status === 'error'
                      ? 'border-red-300/60 text-red-600 dark:text-red-300'
                      : run.status === 'rate_limited'
                        ? 'border-amber-300/60 text-amber-700 dark:text-amber-300'
                        : 'border-border text-muted-foreground';

                return (
                  <span
                    key={`${run.name}-${idx}`}
                    className={cn('rounded-full border bg-background/70 px-2 py-0.5 text-[11px]', statusClass)}
                  >
                    {run.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Message bubble component
interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: number;
    artifacts?: ChatArtifact[];
  };
  isStreaming?: boolean;
  t: any;
  language: string;
  sessionId: string | null;
  mode: ChatMode;
  attemptedQuizMap: Record<string, { selected: string }>;
  onSubmitQuiz: (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => void | Promise<void>;
  onAddReviewCard: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onGenerateLesson: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onUseCanvasSummary: (summary: string) => void;
}

const MessageBubble = ({
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
}: MessageBubbleProps & { t: any }) => {
  const isUser = message.role === 'user';
  const quizArtifacts =
    message.artifacts?.filter(
      (artifact): artifact is Extract<ChatArtifact, { type: 'quiz' }> => artifact.type === 'quiz',
    ) || [];
  const hasUnansweredQuiz = quizArtifacts.some((artifact) => !attemptedQuizMap[artifact.payload.quizId]);
  const shouldHideAssistantText = !isUser && !isStreaming && hasUnansweredQuiz;
  
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    toast.success(t('chat.copySuccess'));
  }, [message.content, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 py-4 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        'w-8 h-8 flex-shrink-0',
        isUser 
          ? 'bg-gradient-to-br from-blue-100 to-indigo-100' 
          : 'bg-gradient-to-br from-emerald-100 to-teal-100'
      )}>
        <AvatarFallback className="text-xs">
          {isUser ? <User className="h-4 w-4 text-blue-600" /> : <Bot className="h-4 w-4 text-emerald-600" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        'flex flex-col min-w-0',
        isUser ? 'items-end max-w-[92%] lg:max-w-[74%]' : 'items-start w-full max-w-[900px]'
      )}>
        {isUser ? (
          <div className="relative overflow-hidden px-4 py-3 rounded-2xl bg-emerald-600 text-white rounded-br-sm">
            <p className="relative z-10 text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            {isStreaming && (
              <span className="relative z-10 inline-block w-2 h-4 bg-emerald-100 animate-pulse ml-1 align-middle" />
            )}
          </div>
        ) : (
          <div className="relative w-full">
            {isStreaming && (
              <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(100deg, transparent 8%, rgba(16, 185, 129, 0.12) 46%, transparent 82%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-120% 0%', '120% 0%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {!shouldHideAssistantText && message.content.trim().length > 0 && (
              <div className="relative z-10 prose dark:prose-invert max-w-none">
                <MarkdownRenderer content={message.content} />
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-1 align-middle" />
                )}
              </div>
            )}
          </div>
        )}

        {!isUser &&
          !isStreaming &&
          message.artifacts?.map((artifact, index) => {
            if (artifact.type === 'quiz') {
              const attempt = attemptedQuizMap[artifact.payload.quizId];
              return (
                <QuizArtifactCard
                  key={`${message.id}-quiz-${index}`}
                  artifact={artifact}
                  sessionId={sessionId}
                  mode={mode}
                  hasAttempt={!!attempt}
                  attemptedOption={attempt?.selected}
                  onSubmit={onSubmitQuiz}
                  onAddReviewCard={onAddReviewCard}
                  onGenerateLesson={onGenerateLesson}
                  t={t}
                  language={language}
                />
              );
            }

            if (artifact.type === 'web_sources') {
              return (
                <div
                  key={`${message.id}-sources-${index}`}
                  className="mt-3 rounded-xl border border-blue-300/40 bg-blue-50/50 dark:bg-blue-900/20 p-3 space-y-2"
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
                        className="block rounded-lg border border-blue-200/60 dark:border-blue-800/60 bg-background/70 px-3 py-2 hover:border-blue-400/70 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <Link2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{source.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{source.domain}</p>
                            {source.snippet && (
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{source.snippet}</p>
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
                  key={`${message.id}-canvas-summary-${index}`}
                  className="mt-3 rounded-xl border border-violet-300/40 bg-violet-50/50 dark:bg-violet-900/20 p-3 space-y-2"
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

            return null;
          })}

        {/* Actions */}
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="复制"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="有用"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="无用"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Editable session title component
const EditableTitle = ({ 
  title, 
  onSave 
}: { 
  title: string; 
  onSave: (newTitle: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 min-w-0 text-sm bg-transparent border-b border-emerald-500 outline-none px-1"
        />
        <button
          onClick={handleSave}
          className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0 group/title">
      <p className="text-sm font-medium truncate flex-1" title={title}>{title}</p>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover/title:opacity-100 p-1 rounded hover:bg-muted text-muted-foreground transition-all"
      >
        <Edit2 className="h-3 w-3" />
      </button>
    </div>
  );
};

// Main Chat Page Component
export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { user } = useAuth();
  const chatUserId = user?.id || 'guest';
  const { addCustomWord, completeMissionTask } = useUserData();
  const {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    streamingContent,
    syncState,
    quizAttemptsById,
    quizRunState,
    lastAgentMeta,
    lastRenderState,
    lastSources,
    lastToolRuns,
    lastContextMeta,
    chatError,
    sendMessage,
    submitQuizAttempt,
    startQuizRun,
    advanceQuizRun,
    recoverQuizRunFromSession,
    clearQuizRun,
    createSession,
    deleteSession,
    switchSession,
    updateSessionTitle,
    retryLastFailedMessage,
    stopGeneration,
    clearMessages,
    deleteAllSessions,
  } = useSupabaseChat();
  
  const quickPrompts = getQuickPrompts(t);
  const attemptedQuizMap = Object.fromEntries(
    Object.entries(quizAttemptsById)
      .filter(([, attempt]) => !currentSessionId || attempt.sessionId === currentSessionId)
      .map(([quizId, attempt]) => [quizId, { selected: attempt.selected }]),
  );

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('study');
  const [searchMode, setSearchMode] = useState<'auto' | 'off'>('auto');
  const [quizSequence, setQuizSequence] = useState<QuizSequenceState | null>(null);
  const [dbStatus, setDbStatus] = useState<Record<string, boolean>>({});
  const [showDbSetup, setShowDbSetup] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const messagesScrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const quizSequenceRef = useRef<QuizSequenceState | null>(null);
  const handledSequenceQuizIdsRef = useRef<Set<string>>(new Set());
  const quizBatchRequestingRef = useRef(false);
  const quizPrefetchAttemptedRef = useRef(false);

  const syncQuizSequence = useCallback((next: QuizSequenceState | null) => {
    quizSequenceRef.current = next;
    setQuizSequence(next);
  }, []);

  useEffect(() => {
    if (!quizRunState) return;
    syncQuizSequence({
      targetCount: quizRunState.targetCount,
      answeredCount: quizRunState.answeredCount,
      seedPrompt: quizRunState.seedPrompt,
      usedWords: quizRunState.usedWords,
    });
  }, [quizRunState, syncQuizSequence]);

  const contentWidthClass = sidebarOpen
    ? 'max-w-[980px]'
    : 'max-w-[1060px]';

  const [quizCanvasIndex, setQuizCanvasIndex] = useState(0);
  const quizArtifactsRef = useRef<QuizRunArtifactEntry[]>([]);

  const loadingStages = useMemo(
    () =>
      language.startsWith('zh')
        ? ['正在解析学习意图', '正在检索学习资料', '正在组织教学答案', '正在渲染内容']
        : ['Understanding your goal', 'Retrieving learning context', 'Composing teaching response', 'Rendering output'],
    [language],
  );

  const getMessagesViewport = useCallback(() => {
    const root = messagesScrollAreaRef.current;
    if (!root) return null;
    return root.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement | null;
  }, []);

  // Check database status - disabled as tables are confirmed to exist
  useEffect(() => {
    // Tables are confirmed to exist in Supabase, skip check
    setDbStatus({
      users: true,
      words: true,
      user_word_progress: true,
      chat_sessions: true,
      chat_messages: true,
    });
  }, []);

  useEffect(() => {
    const viewport = getMessagesViewport();
    if (!viewport) return;

    const handleScroll = () => {
      const distanceToBottom = viewport.scrollHeight - (viewport.scrollTop + viewport.clientHeight);
      shouldAutoScrollRef.current = distanceToBottom < 72;
    };

    handleScroll();
    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [getMessagesViewport, currentSessionId, sidebarOpen]);

  const quizRunArtifacts = useMemo<QuizRunArtifactEntry[]>(() => {
    if (!quizSequence) return [];

    const entries: QuizRunArtifactEntry[] = [];
    const seen = new Set<string>();

    for (const message of messages) {
      if (!message.artifacts || message.role !== 'assistant') continue;
      for (const artifact of message.artifacts) {
        if (artifact.type !== 'quiz') continue;
        if (seen.has(artifact.payload.quizId)) continue;
        seen.add(artifact.payload.quizId);
        entries.push({
          messageId: message.id,
          artifact,
          createdAt: message.createdAt,
        });
      }
    }

    return entries.sort((a, b) => a.createdAt - b.createdAt);
  }, [messages, quizSequence]);

  useEffect(() => {
    if (!quizSequence) {
      quizArtifactsRef.current = [];
      setQuizCanvasIndex(0);
      quizBatchRequestingRef.current = false;
      quizPrefetchAttemptedRef.current = false;
      return;
    }

    quizArtifactsRef.current = quizRunArtifacts;

    setQuizCanvasIndex((current) => {
      if (quizRunArtifacts.length === 0) return 0;
      const preferred = Math.max(0, Math.min(quizSequence.answeredCount, quizRunArtifacts.length - 1));
      return Math.min(Math.max(current, preferred), quizRunArtifacts.length - 1);
    });
  }, [quizRunArtifacts, quizSequence]);

  useEffect(() => {
    setQuizCanvasIndex(0);
    quizBatchRequestingRef.current = false;
    quizPrefetchAttemptedRef.current = false;
  }, [currentSessionId]);

  const activeQuizRunArtifact = quizRunArtifacts[quizCanvasIndex] || null;

  // Auto scroll to bottom when user is near bottom.
  useEffect(() => {
    const viewport = getMessagesViewport();
    if (!viewport) return;
    if (!shouldAutoScrollRef.current) return;

    const raf = requestAnimationFrame(() => {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(raf);
  }, [messages, streamingContent, getMessagesViewport]);

  // Force scroll to bottom when switching session.
  useEffect(() => {
    const viewport = getMessagesViewport();
    if (!viewport) return;
    shouldAutoScrollRef.current = true;
    viewport.scrollTop = viewport.scrollHeight;
  }, [currentSessionId, getMessagesViewport]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStageIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStageIndex((current) => (current + 1) % loadingStages.length);
    }, 1100);

    return () => window.clearInterval(timer);
  }, [isLoading, loadingStages.length]);

  // Handle send
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    const requestedQuizCount = parseRequestedQuizCount(text);
    const shouldStartQuizSequence = Boolean(requestedQuizCount && requestedQuizCount >= 2);
    const nextSequence = shouldStartQuizSequence
      ? {
          targetCount: requestedQuizCount!,
          answeredCount: 0,
          seedPrompt: text,
          usedWords: [],
        }
      : null;
    const payload = shouldStartQuizSequence
      ? buildQuizSequencePrompt({
          language,
          seedPrompt: text,
          startIndex: 1,
          questionCount: requestedQuizCount!,
          targetCount: requestedQuizCount!,
          usedWords: [],
        })
      : text;
    let startedRunId: string | undefined;
    let startedRunTarget = requestedQuizCount || undefined;

    if (shouldStartQuizSequence && nextSequence) {
      syncQuizSequence(nextSequence);
      setQuizCanvasIndex(0);
      quizBatchRequestingRef.current = false;
      quizPrefetchAttemptedRef.current = false;
      if (currentSessionId) {
        const started = startQuizRun(nextSequence.targetCount, nextSequence.seedPrompt, currentSessionId);
        startedRunId = started?.runId;
        startedRunTarget = started?.targetCount || nextSequence.targetCount;
      }
      handledSequenceQuizIdsRef.current.clear();
    } else if (quizSequenceRef.current) {
      syncQuizSequence(null);
      setQuizCanvasIndex(0);
      quizBatchRequestingRef.current = false;
      quizPrefetchAttemptedRef.current = false;
      clearQuizRun(currentSessionId);
      handledSequenceQuizIdsRef.current.clear();
    }

    setInput('');
    setToolsExpanded(false);
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    await sendMessage(text, {
      mode: shouldStartQuizSequence ? 'quiz' : chatMode,
      searchMode,
      trigger: 'manual_input',
      apiContentOverride: shouldStartQuizSequence ? payload : undefined,
      quizRun:
        shouldStartQuizSequence && (startedRunId || quizRunState?.runId)
          ? {
              runId: startedRunId || quizRunState!.runId,
              questionIndex: 1,
              targetCount: startedRunTarget || quizRunState?.targetCount || requestedQuizCount!,
            }
          : undefined,
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        allowAutoQuiz: shouldStartQuizSequence ? true : chatMode !== 'chat',
        forceQuiz: shouldStartQuizSequence || undefined,
      },
    });
  }, [chatMode, clearQuizRun, currentSessionId, input, isLoading, language, quizRunState, searchMode, sendMessage, startQuizRun, syncQuizSequence]);

  // Handle quick prompt
  const handleQuickPrompt = useCallback((text: string) => {
    syncQuizSequence(null);
    setQuizCanvasIndex(0);
    quizBatchRequestingRef.current = false;
    quizPrefetchAttemptedRef.current = false;
    clearQuizRun(currentSessionId);
    handledSequenceQuizIdsRef.current.clear();
    setToolsExpanded(false);
    sendMessage(text, {
      mode: chatMode,
      searchMode,
      trigger: 'quick_prompt',
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        allowAutoQuiz: chatMode === 'study' || chatMode === 'quiz',
      },
    });
  }, [chatMode, clearQuizRun, currentSessionId, searchMode, sendMessage, syncQuizSequence]);

  const handleManualQuiz = useCallback(() => {
    const text =
      language.startsWith('zh')
        ? '基于我们刚才的对话，给我一题英语测验（四选一），并给出中文解析。'
        : 'Based on our recent chat, give me one 4-option English quiz and explain it.';
    syncQuizSequence(null);
    setQuizCanvasIndex(0);
    quizBatchRequestingRef.current = false;
    quizPrefetchAttemptedRef.current = false;
    clearQuizRun(currentSessionId);
    handledSequenceQuizIdsRef.current.clear();
    setToolsExpanded(false);
    void sendMessage(text, {
      mode: chatMode,
      searchMode,
      trigger: 'quiz_button',
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        forceQuiz: true,
        allowAutoQuiz: true,
      },
    });
  }, [chatMode, clearQuizRun, currentSessionId, language, searchMode, sendMessage, syncQuizSequence]);

  const handleForceWebSearch = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;

    syncQuizSequence(null);
    setQuizCanvasIndex(0);
    quizBatchRequestingRef.current = false;
    quizPrefetchAttemptedRef.current = false;
    clearQuizRun(currentSessionId);
    handledSequenceQuizIdsRef.current.clear();
    setInput('');
    setToolsExpanded(false);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    void sendMessage(text, {
      mode: chatMode,
      searchMode: 'force',
      trigger: 'manual_input',
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        allowAutoQuiz: chatMode !== 'chat',
        forceWebSearch: true,
      },
    });
  }, [chatMode, clearQuizRun, currentSessionId, input, isLoading, sendMessage, syncQuizSequence]);

  const handleUseCanvasSummary = useCallback((summary: string) => {
    setInput(summary);
    setChatMode('chat');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const extractWordCandidate = (artifact: Extract<ChatArtifact, { type: 'quiz' }>): string => {
    if (artifact.payload.targetWord) {
      return artifact.payload.targetWord.trim().toLowerCase();
    }

    const first = artifact.payload.stem.match(/["“'`](\w[\w-]*)["”'`]/);
    if (first?.[1]) return first[1].toLowerCase();

    const fallback = artifact.payload.stem.match(/\\b[a-zA-Z][a-zA-Z-]{2,}\\b/);
    return fallback?.[0]?.toLowerCase() || 'focus';
  };

  const addReviewCardFromQuiz = useCallback(
    (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => {
      const word = extractWordCandidate(artifact);
      const item: WordData = {
        id: `quiz_word_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        word,
        phonetic: '',
        partOfSpeech: 'phrase',
        definition: artifact.payload.explanation || artifact.payload.stem,
        definitionZh: language.startsWith('zh') ? '来自 AI 测验回流' : 'Imported from AI quiz',
        examples: [
          {
            en: artifact.payload.stem,
            zh: language.startsWith('zh') ? '来自测验题干' : 'From quiz stem',
          },
        ],
        synonyms: [],
        antonyms: [],
        collocations: [],
        level: 'B1',
        topic: 'quiz',
      };

      addCustomWord(item);
      toast.success(language.startsWith('zh') ? '已加入复习卡' : 'Added to review cards');
    },
    [addCustomWord, language],
  );

  const generateLessonFromQuiz = useCallback(
    async (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => {
      const normalizeTag = (value: string): FeedbackIssue['tag'] => {
        if (value === 'task_response') return 'task_response';
        if (value === 'coherence') return 'coherence';
        if (value === 'grammar') return 'grammar';
        if (value === 'logic') return 'logic';
        if (value === 'collocation') return 'collocation';
        if (value === 'tense') return 'tense';
        return 'lexical';
      };

      const tags = (artifact.payload.tags || [])
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => normalizeTag(item));
      const fallbackTag: FeedbackIssue['tag'] = artifact.payload.skills.some((skill) => skill.includes('grammar'))
        ? 'grammar'
        : artifact.payload.skills.some((skill) => skill.includes('coherence'))
          ? 'coherence'
          : 'lexical';

      const lesson = await generateMicroLessonFromErrors({
        userId: chatUserId,
        errorTags: tags.length > 0 ? tags : [fallbackTag],
        targetLevel: 'B1',
      });

      toast.success(
        language.startsWith('zh')
          ? `已生成补救微课：${lesson.unit.title}`
          : `Micro lesson generated: ${lesson.unit.title}`,
      );
    },
    [chatUserId, language],
  );

  const findQuizArtifact = useCallback(
    (quizId: string): Extract<ChatArtifact, { type: 'quiz' }> | null => {
      for (let i = messages.length - 1; i >= 0; i -= 1) {
        const artifacts = messages[i].artifacts || [];
        for (const artifact of artifacts) {
          if (artifact.type === 'quiz' && artifact.payload.quizId === quizId) {
            return artifact;
          }
        }
      }
      return null;
    },
    [messages],
  );

  const requestQuizBatch = useCallback(
    async (args: {
      sequence: QuizSequenceState;
      startIndex: number;
      questionCount: number;
      runId?: string;
    }) => {
      if (args.questionCount <= 0) return;
      const prompt = buildQuizSequencePrompt({
        language,
        seedPrompt: args.sequence.seedPrompt,
        startIndex: args.startIndex,
        questionCount: args.questionCount,
        targetCount: args.sequence.targetCount,
        usedWords: args.sequence.usedWords,
      });
      quizBatchRequestingRef.current = true;
      try {
        await sendMessage(args.sequence.seedPrompt, {
          mode: 'quiz',
          searchMode,
          trigger: 'quiz_button',
          apiContentOverride: prompt,
          hideUserMessage: true,
          quizRun: args.runId
            ? {
                runId: args.runId,
                questionIndex: args.startIndex,
                targetCount: args.sequence.targetCount,
              }
            : undefined,
          featureFlags: {
            enableQuizArtifacts: true,
            enableStudyArtifacts: true,
            forceQuiz: true,
            allowAutoQuiz: true,
          },
        });
      } finally {
        quizBatchRequestingRef.current = false;
      }
    },
    [language, searchMode, sendMessage],
  );

  useEffect(() => {
    if (!quizSequence || isLoading || quizBatchRequestingRef.current || quizPrefetchAttemptedRef.current) {
      return;
    }
    if (quizRunArtifacts.length <= 0 || quizSequence.answeredCount > 0) {
      return;
    }

    const missingCount = quizSequence.targetCount - quizRunArtifacts.length;
    if (missingCount <= 0) {
      return;
    }

    quizPrefetchAttemptedRef.current = true;
    void requestQuizBatch({
      sequence: quizSequence,
      startIndex: quizRunArtifacts.length + 1,
      questionCount: missingCount,
      runId: quizRunState?.runId,
    });
  }, [isLoading, quizRunArtifacts.length, quizRunState?.runId, quizSequence, requestQuizBatch]);

  const handleQuizSubmit = useCallback(
    async (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => {
      if (!currentSessionId) return;
      await submitQuizAttempt({
        quizId,
        sessionId: currentSessionId,
        selected,
        isCorrect,
        durationMs,
        sourceMode: chatMode,
      });
      completeMissionTask('task_quiz_today');
      if (!isCorrect) {
        const artifact = findQuizArtifact(quizId);
        if (artifact) {
          addReviewCardFromQuiz(artifact);

          const normalizeTag = (value: string): FeedbackIssue['tag'] => {
            if (value === 'task_response') return 'task_response';
            if (value === 'coherence') return 'coherence';
            if (value === 'grammar') return 'grammar';
            if (value === 'logic') return 'logic';
            if (value === 'collocation') return 'collocation';
            if (value === 'tense') return 'tense';
            return 'lexical';
          };

          const inferredTag =
            artifact.payload.tags && artifact.payload.tags.length > 0
              ? normalizeTag(artifact.payload.tags[0])
              : artifact.payload.skills.some((skill) => skill.includes('grammar'))
                ? 'grammar'
                : 'lexical';

          saveAiFeedbackRecord(chatUserId, {
            attemptId: `chat_quiz_${quizId}_${Date.now()}`,
            scores: {
              taskResponse: 5.5,
              coherenceCohesion: 5.5,
              lexicalResource: inferredTag === 'lexical' || inferredTag === 'collocation' ? 5 : 6,
              grammaticalRangeAccuracy: inferredTag === 'grammar' || inferredTag === 'tense' ? 5 : 6,
              overallBand: 5.5,
            },
            issues: [
              {
                tag: inferredTag,
                severity: 'medium',
                message: language.startsWith('zh') ? '来自对话测验的错误回流。' : 'Captured from chat quiz attempt.',
                suggestion: language.startsWith('zh')
                  ? '建议完成对应补救微课并加入复习。'
                  : 'Take the remediation micro-lesson and review this card again.',
              },
            ],
            rewrites: [artifact.payload.explanation],
            nextActions: [
              language.startsWith('zh') ? '完成 1 次补救练习' : 'Complete 1 remediation drill',
              language.startsWith('zh') ? '24 小时后再次测验' : 'Retry in 24 hours',
            ],
            confidence: 0.7,
            provider: 'fallback',
            createdAt: new Date().toISOString(),
          });
        }
      }
      toast.success(
        isCorrect
          ? language.startsWith('zh')
            ? '回答正确，继续保持'
            : 'Correct answer'
          : language.startsWith('zh')
            ? '已记录错误，建议复习'
            : 'Attempt saved',
      );

      const sequence = quizSequenceRef.current;
      if (!sequence || handledSequenceQuizIdsRef.current.has(quizId)) {
        return;
      }

      handledSequenceQuizIdsRef.current.add(quizId);
      const artifact = findQuizArtifact(quizId);
      const usedWord = artifact ? extractWordCandidate(artifact) : '';
      const persistedRun = advanceQuizRun({
        sessionId: currentSessionId,
        quizId,
        isCorrect,
        usedWord,
      });
      const nextAnsweredCount = Math.min(sequence.targetCount, sequence.answeredCount + 1);
      const nextUsedWords = usedWord
        ? Array.from(new Set([...sequence.usedWords, usedWord]))
        : sequence.usedWords;

      if (nextAnsweredCount >= sequence.targetCount) {
        syncQuizSequence(null);
        setQuizCanvasIndex(0);
        quizBatchRequestingRef.current = false;
        quizPrefetchAttemptedRef.current = false;
        clearQuizRun(currentSessionId);
        handledSequenceQuizIdsRef.current.clear();
        toast.success(
          language.startsWith('zh')
            ? `已完成 ${sequence.targetCount} 题连续测验`
            : `Completed ${sequence.targetCount} quiz questions`,
        );
        return;
      }

      const nextSequence: QuizSequenceState = {
        ...sequence,
        answeredCount: nextAnsweredCount,
        usedWords: nextUsedWords,
      };
      syncQuizSequence(nextSequence);
      setQuizCanvasIndex(Math.max(0, Math.min(nextAnsweredCount, quizArtifactsRef.current.length - 1)));

      const nextQuestionIndex = nextAnsweredCount + 1;
      const persistedRunId =
        persistedRun && typeof persistedRun === 'object' && 'runId' in persistedRun
          ? (persistedRun as { runId?: string }).runId
          : undefined;
      const availableCount = quizArtifactsRef.current.length;
      if (nextAnsweredCount < availableCount) {
        toast.info(
          language.startsWith('zh')
            ? `继续下一题（${nextQuestionIndex}/${nextSequence.targetCount}）`
            : `Next question (${nextQuestionIndex}/${nextSequence.targetCount})`,
          { duration: 2200 },
        );
        return;
      }

      const missingCount = Math.max(0, nextSequence.targetCount - availableCount);
      if (missingCount <= 0 || quizBatchRequestingRef.current) {
        return;
      }

      toast.info(
        language.startsWith('zh')
          ? `正在生成剩余题目（${nextQuestionIndex}-${nextSequence.targetCount}）`
          : `Generating remaining questions (${nextQuestionIndex}-${nextSequence.targetCount})`,
        { duration: 2200 },
      );
      void requestQuizBatch({
        sequence: nextSequence,
        startIndex: nextQuestionIndex,
        questionCount: missingCount,
        runId: persistedRunId || quizRunState?.runId,
      });
    },
    [
      addReviewCardFromQuiz,
      advanceQuizRun,
      chatMode,
      chatUserId,
      clearQuizRun,
      completeMissionTask,
      currentSessionId,
      findQuizArtifact,
      language,
      quizRunState?.runId,
      requestQuizBatch,
      syncQuizSequence,
      submitQuizAttempt,
    ],
  );

  const syncLabel =
    syncState.source === 'remote'
      ? language.startsWith('zh')
        ? '云端同步'
        : 'Cloud Sync'
      : syncState.source === 'merged'
        ? language.startsWith('zh')
          ? '云端+本地回补'
          : 'Cloud + Local Sync'
        : language.startsWith('zh')
          ? '本地模式'
          : 'Local Mode';

  const loadingLabel = (() => {
    if (lastRenderState?.stage === 'planning') {
      return language.startsWith('zh') ? '正在理解问题' : 'Understanding request';
    }
    if (lastRenderState?.stage === 'searching') {
      return language.startsWith('zh') ? '正在检索学习资料' : 'Searching evidence';
    }
    if (lastRenderState?.stage === 'composing') {
      return language.startsWith('zh') ? '正在组织教学答案' : 'Composing response';
    }
    if (lastRenderState?.stage === 'streaming' || (isLoading && streamingContent)) {
      return language.startsWith('zh') ? '正在渲染回答' : 'Rendering response';
    }
    return loadingStages[loadingStageIndex] || loadingStages[0];
  })();

  return (
    <div className="h-full min-h-0 flex overflow-hidden">
      {/* Database Status */}
      {Object.keys(dbStatus).length > 0 && !Object.values(dbStatus).every(Boolean) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 max-w-lg shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{language.startsWith('zh') ? '需要初始化数据库表' : 'Database tables need initialization'}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {language.startsWith('zh') 
                  ? '检测到以下表未创建，请在 Supabase SQL Editor 中运行完整 SQL：'
                  : 'The following tables are not created. Please run the complete SQL in Supabase SQL Editor:'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(dbStatus).map(([table, exists]) => (
                  <span 
                    key={table} 
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      exists ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {table}: {exists ? '✓' : '✗'}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(INIT_ALL_SQL);
                    toast.success(language.startsWith('zh') ? '完整 SQL 已复制到剪贴板' : 'Full SQL copied to clipboard');
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {language.startsWith('zh') ? '复制完整 SQL' : 'Copy Full SQL'}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs"
                  onClick={() => setShowDbSetup(!showDbSetup)}
                >
                  {showDbSetup 
                    ? (language.startsWith('zh') ? '收起' : 'Collapse')
                    : (language.startsWith('zh') ? '查看 SQL' : 'View SQL')}
                </Button>
              </div>
              {showDbSetup && (
                <pre className="mt-2 bg-muted rounded p-2 text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  {INIT_ALL_SQL}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - History Panel */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex-shrink-0 border-r border-border bg-card overflow-hidden min-h-0"
          >
            <div className="flex flex-col h-full min-h-0 w-[280px]">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {t('chat.history')}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    syncQuizSequence(null);
                    setQuizCanvasIndex(0);
                    quizBatchRequestingRef.current = false;
                    quizPrefetchAttemptedRef.current = false;
                    clearQuizRun(currentSessionId);
                    handledSequenceQuizIdsRef.current.clear();
                    void createSession();
                  }}
                  title={t('chat.newConversation')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Session List */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-1">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">{t('chat.emptyHistory')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('chat.emptyHistoryHint')}</p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          'group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all overflow-hidden',
                          currentSessionId === session.id
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                            : 'hover:bg-muted border border-transparent'
                        )}
                        onClick={() => {
                          const recovered = recoverQuizRunFromSession(session.id);
                          if (recovered) {
                            syncQuizSequence({
                              targetCount: recovered.targetCount,
                              answeredCount: recovered.answeredCount,
                              seedPrompt: recovered.seedPrompt,
                              usedWords: recovered.usedWords,
                            });
                            setQuizCanvasIndex(Math.max(0, Math.min(recovered.answeredCount, recovered.targetCount - 1)));
                          } else {
                            syncQuizSequence(null);
                            setQuizCanvasIndex(0);
                          }
                          quizBatchRequestingRef.current = false;
                          quizPrefetchAttemptedRef.current = false;
                          handledSequenceQuizIdsRef.current.clear();
                          switchSession(session.id);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          {currentSessionId === session.id ? (
                            <EditableTitle 
                              title={session.title} 
                              onSave={(newTitle) => updateSessionTitle(session.id, newTitle)}
                            />
                          ) : (
                            <p className="text-sm font-medium truncate">{session.title}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {session.messages.length} {t('common.messages')} · {formatDate(session.updatedAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-all"
                          title={language.startsWith('zh') ? '删除对话' : 'Delete conversation'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => deleteAllSessions()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('chat.deleteAll')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen 
                ? (language.startsWith('zh') ? '收起侧边栏' : 'Collapse sidebar')
                : (language.startsWith('zh') ? '展开侧边栏' : 'Expand sidebar')}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{t('chat.title')}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('chat.subtitle')} · {messages.length > 0 ? `${messages.length} ${t('common.messages')}` : t('chat.ready')}
                {quizSequence && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-600">
                      {language.startsWith('zh')
                        ? `连续测验 ${quizSequence.answeredCount + 1}/${quizSequence.targetCount}`
                        : `Quiz run ${quizSequence.answeredCount + 1}/${quizSequence.targetCount}`}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                syncQuizSequence(null);
                setQuizCanvasIndex(0);
                quizBatchRequestingRef.current = false;
                quizPrefetchAttemptedRef.current = false;
                clearQuizRun(currentSessionId);
                handledSequenceQuizIdsRef.current.clear();
                void createSession();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('chat.newConversation')}
            </Button>

            {messages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={clearMessages}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('chat.clearConversation')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0 px-4" ref={messagesScrollAreaRef}>
          <div className={cn(contentWidthClass, 'mx-auto')}>
            {messages.length === 0 ? (
              <WelcomeMessage onPromptClick={handleQuickPrompt} t={t} prompts={quickPrompts} />
            ) : (
              <div className="py-4 space-y-2">
                {messages.map((message) => (
                  (() => {
                    const hasQuizArtifact =
                      message.role === 'assistant' &&
                      Array.isArray(message.artifacts) &&
                      message.artifacts.some((artifact) => artifact.type === 'quiz');

                    if (quizSequence && hasQuizArtifact) {
                      return null;
                    }

                    return (
                      <div key={message.id} className="group">
                        <MessageBubble
                          message={message}
                          t={t}
                          language={language}
                          sessionId={currentSessionId}
                          mode={chatMode}
                          attemptedQuizMap={attemptedQuizMap}
                          onSubmitQuiz={handleQuizSubmit}
                          onAddReviewCard={addReviewCardFromQuiz}
                          onGenerateLesson={generateLessonFromQuiz}
                          onUseCanvasSummary={handleUseCanvasSummary}
                        />
                      </div>
                    );
                  })()
                ))}

                {quizSequence && (
                  <div className="pt-2">
                    <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50/55 dark:bg-emerald-900/20 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            {language.startsWith('zh') ? '连续测验画布' : 'Quiz Canvas'}
                          </p>
                          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                            {language.startsWith('zh')
                              ? `第 ${Math.min(quizCanvasIndex + 1, quizSequence.targetCount)}/${quizSequence.targetCount} 题 · 已完成 ${quizSequence.answeredCount} 题`
                              : `Question ${Math.min(quizCanvasIndex + 1, quizSequence.targetCount)}/${quizSequence.targetCount} · ${quizSequence.answeredCount} completed`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={quizCanvasIndex <= 0}
                            onClick={() => setQuizCanvasIndex((current) => Math.max(0, current - 1))}
                            title={language.startsWith('zh') ? '上一题' : 'Previous question'}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={
                              quizCanvasIndex >= Math.min(quizRunArtifacts.length - 1, quizSequence.answeredCount)
                            }
                            onClick={() =>
                              setQuizCanvasIndex((current) =>
                                Math.min(Math.min(quizRunArtifacts.length - 1, quizSequence.answeredCount), current + 1),
                              )
                            }
                            title={language.startsWith('zh') ? '下一题' : 'Next question'}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {activeQuizRunArtifact ? (
                        <QuizArtifactCard
                          key={`quiz-canvas-${activeQuizRunArtifact.artifact.payload.quizId}`}
                          artifact={activeQuizRunArtifact.artifact}
                          sessionId={currentSessionId}
                          mode={chatMode}
                          hasAttempt={Boolean(attemptedQuizMap[activeQuizRunArtifact.artifact.payload.quizId])}
                          attemptedOption={attemptedQuizMap[activeQuizRunArtifact.artifact.payload.quizId]?.selected}
                          onSubmit={handleQuizSubmit}
                          onAddReviewCard={addReviewCardFromQuiz}
                          onGenerateLesson={generateLessonFromQuiz}
                          t={t}
                          language={language}
                        />
                      ) : (
                        <div className="rounded-xl border border-emerald-300/35 bg-background/70 px-3 py-4 text-sm text-muted-foreground">
                          {isLoading
                            ? (language.startsWith('zh') ? '正在生成测验题目...' : 'Generating quiz questions...')
                            : (language.startsWith('zh') ? '暂未拿到题目，请重试或稍后继续。' : 'No quiz item returned yet. Please retry.')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Streaming message */}
                {isLoading && streamingContent && !quizSequence && (
                  <MessageBubble
                    message={{
                      id: 'streaming',
                      role: 'assistant',
                      content: streamingContent,
                      createdAt: Date.now(),
                    }}
                    isStreaming
                    t={t}
                    language={language}
                    sessionId={currentSessionId}
                    mode={chatMode}
                    attemptedQuizMap={{}}
                    onSubmitQuiz={handleQuizSubmit}
                    onAddReviewCard={addReviewCardFromQuiz}
                    onGenerateLesson={generateLessonFromQuiz}
                    onUseCanvasSummary={handleUseCanvasSummary}
                  />
                )}

                {isLoading && (
                  <ThinkingStatusCard
                    label={loadingLabel}
                    language={language}
                    isStreaming={Boolean(streamingContent)}
                    toolRuns={lastToolRuns}
                  />
                )}
                
              </div>
            )}
          </div>
        </ScrollArea>

        {chatError && (
          <div className="px-4 pb-2">
            <div className={cn(contentWidthClass, 'mx-auto rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-900/20 p-3 flex items-start gap-3')}>
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {language.startsWith('zh') ? 'AI 暂时不可用' : 'AI is temporarily unavailable'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {chatError.message}
                  {chatError.requestId ? ` · requestId: ${chatError.requestId}` : ''}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={retryLastFailedMessage} disabled={isLoading}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                {language.startsWith('zh') ? '重试' : 'Retry'}
              </Button>
            </div>
          </div>
        )}

        {quizSequence && (
          <div className="px-4 pb-2">
            <div
              className={cn(
                contentWidthClass,
                'mx-auto rounded-xl border border-emerald-300/40 bg-emerald-50/60 dark:bg-emerald-900/20 px-3 py-2 flex items-center justify-between gap-3',
              )}
            >
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {language.startsWith('zh')
                  ? `连续测验进行中：已完成 ${quizSequence.answeredCount}/${quizSequence.targetCount} 题`
                  : `Quiz streak in progress: ${quizSequence.answeredCount}/${quizSequence.targetCount} completed`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-emerald-700 hover:text-emerald-800"
                onClick={() => {
                  syncQuizSequence(null);
                  setQuizCanvasIndex(0);
                  quizBatchRequestingRef.current = false;
                  quizPrefetchAttemptedRef.current = false;
                  clearQuizRun(currentSessionId);
                  handledSequenceQuizIdsRef.current.clear();
                }}
              >
                {language.startsWith('zh') ? '结束连续测验' : 'End quiz run'}
              </Button>
            </div>
          </div>
        )}

        {/* Input Area - Enhanced */}
        <div className="border-t border-border bg-background/95 backdrop-blur p-4">
          <div className={cn(contentWidthClass, 'mx-auto relative')}>
            <AnimatePresence initial={false}>
              {toolsExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute bottom-[calc(100%+10px)] left-0 right-0 z-20 overflow-hidden rounded-2xl border border-border/90 bg-background/96 shadow-xl p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      {language.startsWith('zh') ? 'Agent 工具与模式' : 'Agent tools & mode'}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setToolsExpanded(false)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {CHAT_MODE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setChatMode(option.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                            chatMode === option.id
                              ? 'border-emerald-500 bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'border-border hover:border-emerald-400/60',
                          )}
                        >
                          <option.icon className="h-3.5 w-3.5" />
                          <span>{language.startsWith('zh') ? option.labelZh : option.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full text-xs"
                        onClick={handleManualQuiz}
                        disabled={isLoading}
                      >
                        <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                        {language.startsWith('zh') ? '马上测我' : 'Quiz me now'}
                      </Button>

                      <Button
                        size="sm"
                        variant={searchMode === 'auto' ? 'default' : 'outline'}
                        className={cn(
                          'h-8 rounded-full text-xs',
                          searchMode === 'auto' ? 'bg-blue-600 hover:bg-blue-700 text-white' : '',
                        )}
                        onClick={() => setSearchMode((prev) => (prev === 'auto' ? 'off' : 'auto'))}
                        disabled={isLoading}
                      >
                        <Globe className="h-3.5 w-3.5 mr-1.5" />
                        {searchMode === 'auto'
                          ? language.startsWith('zh')
                            ? '联网检索：自动'
                            : 'WebSearch: Auto'
                          : language.startsWith('zh')
                            ? '联网检索：关闭'
                            : 'WebSearch: Off'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full text-xs"
                        onClick={handleForceWebSearch}
                        disabled={isLoading || !input.trim()}
                      >
                        <Globe className="h-3.5 w-3.5 mr-1.5" />
                        {language.startsWith('zh') ? '强制搜索本条' : 'Search this input'}
                      </Button>
                    </div>

                    {(lastAgentMeta?.triggerReason || lastContextMeta) && (
                      <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-[11px] text-muted-foreground space-y-1">
                        {lastAgentMeta?.triggerReason && (
                          <p>{language.startsWith('zh') ? '触发原因' : 'Trigger'}: {lastAgentMeta.triggerReason}</p>
                        )}
                        {lastContextMeta && (
                          <p>
                            {language.startsWith('zh') ? '上下文' : 'Context'}: {lastContextMeta.inputTokensEst}t ·
                            {lastContextMeta.compacted
                              ? language.startsWith('zh')
                                ? ' 已压缩'
                                : ' compacted'
                              : language.startsWith('zh')
                                ? ' 未压缩'
                                : ' raw'}
                            {lastContextMeta.searchTriggered
                              ? language.startsWith('zh')
                                ? ' · 已搜索'
                                : ' · searched'
                              : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Prompts (only when no messages) */}
            {messages.length === 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {quickPrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="flex-shrink-0 px-4 py-2 text-sm rounded-full border border-border hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all whitespace-nowrap"
                  >
                    {prompt.textZh}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="relative flex gap-2 items-end bg-card rounded-2xl border border-border/80 p-3 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'mb-1 h-10 w-10 rounded-xl border transition-colors',
                  toolsExpanded
                    ? 'border-emerald-400 bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'border-border hover:border-emerald-400/50',
                )}
                onClick={() => setToolsExpanded((current) => !current)}
                title={language.startsWith('zh') ? '工具与模式' : 'Tools & mode'}
              >
                <Wand2 className="h-4 w-4" />
              </Button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none min-h-[44px] max-h-[200px] py-2.5 px-1 text-base"
              />
              
              <div className="flex items-center gap-2 pb-1">
                {isLoading ? (
                  <Button
                    onClick={stopGeneration}
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-10 w-10 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  >
                    <StopCircle className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10 w-10 p-0 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-2">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {t('common.poweredBy')}
              </span>
              <span>·</span>
              <span>
                {language.startsWith('zh') ? '模式' : 'Mode'}: {language.startsWith('zh')
                  ? CHAT_MODE_OPTIONS.find((option) => option.id === chatMode)?.labelZh
                  : CHAT_MODE_OPTIONS.find((option) => option.id === chatMode)?.label}
              </span>
              <span>·</span>
              <span>
                {language.startsWith('zh') ? '检索' : 'Search'}: {searchMode === 'auto'
                  ? (language.startsWith('zh') ? '自动' : 'Auto')
                  : (language.startsWith('zh') ? '关闭' : 'Off')}
              </span>
              <span>·</span>
              <span>{t('common.markdownSupport')}</span>
              <span>·</span>
              <span>{t('common.streaming')}</span>
              {(lastSources.length > 0 || lastToolRuns.length > 0) && (
                <>
                  <span>·</span>
                  <span>
                    {language.startsWith('zh')
                      ? `来源 ${lastSources.length} / 工具 ${lastToolRuns.length}`
                      : `Sources ${lastSources.length} / Tools ${lastToolRuns.length}`}
                  </span>
                </>
              )}
              <span>·</span>
              <span className={cn(
                "flex items-center gap-1",
                syncState.source === 'remote'
                  ? 'text-emerald-600'
                  : syncState.source === 'merged'
                    ? 'text-blue-600'
                    : 'text-amber-600'
              )}>
                {syncState.source === 'remote' ? '✓' : syncState.source === 'merged' ? '↻' : '⚠'} {syncLabel}
                {syncState.pendingSyncCount > 0 ? ` (${syncState.pendingSyncCount})` : ''}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

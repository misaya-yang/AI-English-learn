import { useState, useRef, useEffect, useCallback, type ComponentType } from 'react';
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
  X,
  Menu,
  Edit2,
  Check,
  AlertTriangle,
  RefreshCw,
  FlaskConical,
  NotebookPen,
  Layers3,
  GraduationCap,
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

interface QuizCardProps {
  artifact: Extract<ChatArtifact, { type: 'quiz' }>;
  sessionId: string | null;
  mode: ChatMode;
  hasAttempt: boolean;
  attemptedOption?: string;
  onSubmit: (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => void;
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
    <div className="mt-3 rounded-xl border border-emerald-300/40 bg-emerald-50/50 dark:bg-emerald-900/20 p-3 space-y-3">
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
    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
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
  onSubmitQuiz: (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => void;
  onAddReviewCard: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
  onGenerateLesson: (artifact: Extract<ChatArtifact, { type: 'quiz' }>) => void;
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
}: MessageBubbleProps & { t: any }) => {
  const isUser = message.role === 'user';
  
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
        'flex flex-col max-w-[85%] sm:max-w-[75%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-sm'
              : 'bg-muted border border-border rounded-bl-sm'
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-1 align-middle" />
          )}
        </div>

        {!isUser &&
          !isStreaming &&
          message.artifacts?.map((artifact, index) => {
            if (artifact.type !== 'quiz') return null;
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
  const { addCustomWord } = useUserData();
  const {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    streamingContent,
    syncState,
    quizAttemptsById,
    lastAgentMeta,
    chatError,
    sendMessage,
    submitQuizAttempt,
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
    Object.entries(quizAttemptsById).map(([quizId, attempt]) => [quizId, { selected: attempt.selected }]),
  );

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatMode, setChatMode] = useState<ChatMode>('study');
  const [dbStatus, setDbStatus] = useState<Record<string, boolean>>({});
  const [showDbSetup, setShowDbSetup] = useState(false);
  const messagesScrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const getMessagesViewport = useCallback(() => {
    const root = messagesScrollAreaRef.current;
    if (!root) return null;
    return root.querySelector('[data-slot=\"scroll-area-viewport\"]') as HTMLDivElement | null;
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

  // Handle send
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    await sendMessage(text, {
      mode: chatMode,
      trigger: 'manual_input',
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        allowAutoQuiz: chatMode !== 'chat',
      },
    });
  }, [chatMode, input, isLoading, sendMessage]);

  // Handle quick prompt
  const handleQuickPrompt = useCallback((text: string) => {
    sendMessage(text, {
      mode: chatMode,
      trigger: 'quick_prompt',
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        allowAutoQuiz: chatMode === 'study' || chatMode === 'quiz',
      },
    });
  }, [chatMode, sendMessage]);

  const handleManualQuiz = useCallback(() => {
    const text =
      language.startsWith('zh')
        ? '基于我们刚才的对话，给我一题英语测验（四选一），并给出中文解析。'
        : 'Based on our recent chat, give me one 4-option English quiz and explain it.';
    void sendMessage(text, {
      mode: chatMode,
      trigger: 'quiz_button',
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        forceQuiz: true,
        allowAutoQuiz: true,
      },
    });
  }, [chatMode, language, sendMessage]);

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

  const handleQuizSubmit = useCallback(
    (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => {
      if (!currentSessionId) return;
      void submitQuizAttempt({
        quizId,
        sessionId: currentSessionId,
        selected,
        isCorrect,
        durationMs,
        sourceMode: chatMode,
      });
      toast.success(
        isCorrect
          ? language.startsWith('zh')
            ? '回答正确，继续保持'
            : 'Correct answer'
          : language.startsWith('zh')
            ? '已记录错误，建议复习'
            : 'Attempt saved',
      );
    },
    [chatMode, currentSessionId, language, submitQuizAttempt],
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
                  onClick={() => createSession()}
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
                          'group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all',
                          currentSessionId === session.id
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                            : 'hover:bg-muted border border-transparent'
                        )}
                        onClick={() => switchSession(session.id)}
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
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
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-100 hover:text-red-600 transition-all"
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
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => createSession()}
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
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <WelcomeMessage onPromptClick={handleQuickPrompt} t={t} prompts={quickPrompts} />
            ) : (
              <div className="py-4 space-y-2">
                {messages.map((message) => (
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
                    />
                  </div>
                ))}
                
                {/* Streaming message */}
                {isLoading && streamingContent && (
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
                  />
                )}

                {/* Loading indicator */}
                {isLoading && !streamingContent && (
                  <div className="flex gap-3 py-4">
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100">
                      <AvatarFallback><Bot className="h-4 w-4 text-emerald-600" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200" />
                        <span className="text-xs text-muted-foreground ml-2">{t('common.thinking')}</span>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
        </ScrollArea>

        {chatError && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-900/20 p-3 flex items-start gap-3">
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

        {/* Input Area - Enhanced */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-3 flex flex-wrap items-center gap-2">
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

              {lastAgentMeta?.triggerReason && (
                <span className="text-[11px] text-muted-foreground">
                  {language.startsWith('zh') ? '触发原因' : 'Trigger'}: {lastAgentMeta.triggerReason}
                </span>
              )}
            </div>

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
            <div className="relative flex gap-2 items-end bg-muted rounded-2xl border border-border p-3 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
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
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl h-10 w-10 p-0 disabled:opacity-50"
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
              <span>{t('common.markdownSupport')}</span>
              <span>·</span>
              <span>{t('common.streaming')}</span>
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

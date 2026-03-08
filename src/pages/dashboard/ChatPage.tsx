import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Sparkles,
  Lightbulb,
  BookOpen,
  MessageSquare,
  RotateCcw,
  Copy,
  MoreVertical,
  Plus,
  Menu,
  AlertTriangle,
  RefreshCw,
  FlaskConical,
  NotebookPen,
  GraduationCap,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import { INIT_ALL_SQL } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import type { ChatArtifact, ChatMode } from '@/types/chatAgent';
import { useUserData } from '@/contexts/UserDataContext';
import type { WordData } from '@/data/words';
import { generateMicroLessonFromErrors } from '@/services/aiExamCoach';
import { useAuth } from '@/contexts/AuthContext';
import type { FeedbackIssue } from '@/types/examContent';
import { saveAiFeedbackRecord } from '@/data/examContent';
import { deleteMemoryItems, rememberMemoryItems } from '@/services/memoryCenter';
import { buildQuizSequencePrompt, parseRequestedQuizCount } from '@/features/chat/quizSequence';
import { ChatComposer } from '@/features/chat/components/ChatComposer';
import { ChatHistorySidebar } from '@/features/chat/components/ChatHistorySidebar';
import { ChatMemoryBanner } from '@/features/chat/components/ChatMemoryBanner';
import { ChatMessageBubble } from '@/features/chat/components/ChatMessageBubble';
import { ChatWelcome } from '@/features/chat/components/ChatWelcome';
import { QuizArtifactCard } from '@/features/chat/components/QuizArtifactCard';
import type { ChatModeOption, QuickPromptOption } from '@/features/chat/types';
import { buildChatGoalContext, deriveChatWeakTags } from '@/features/chat/utils/learnerContext';

// Quick prompt suggestions - English prompts for learning (not translated)
const getQuickPrompts = (t: (key: string) => string): QuickPromptOption[] => [
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

const CHAT_MODE_OPTIONS: ChatModeOption[] = [
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
  startedAt: number;
}

interface QuizRunArtifactEntry {
  messageId: string;
  artifact: Extract<ChatArtifact, { type: 'quiz' }>;
  createdAt: number;
}

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
      className="flex gap-3 py-2"
    >
      <Avatar className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900/40 dark:to-cyan-900/30">
        <AvatarFallback>
          <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <p className="font-medium">{label}</p>
          <motion.span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isStreaming
            ? language.startsWith('zh')
              ? '正在流式输出...'
              : 'Streaming response...'
            : language.startsWith('zh')
              ? '正在组织回答...'
              : 'Composing response...'}
        </p>

        {latestRuns.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
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
    </motion.div>
  );
};

// Main Chat Page Component
export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { user } = useAuth();
  const chatUserId = user?.id || 'guest';
  const {
    activeBook,
    addCustomWord,
    completeMissionTask,
    dailyMission,
    dueWords,
    learningProfile,
  } = useUserData();
  const {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    streamingContent,
    quizAttemptsById,
    quizRunState,
    lastAgentMeta,
    lastRenderState,
    lastSources,
    lastToolRuns,
    lastContextMeta,
    lastMemoryUsed,
    lastMemoryWrites,
    lastMemoryTraceId,
    chatPerf,
    chatError,
    sendMessage,
    submitQuizAttempt,
    startQuizRun,
    advanceQuizRun,
    goToNextQuizQuestion,
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
  const [visibleMessageCount, setVisibleMessageCount] = useState(120);
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
  const quizBackgroundPrefetchRef = useRef(false);

  const syncQuizSequence = useCallback((next: QuizSequenceState | null) => {
    quizSequenceRef.current = next;
    setQuizSequence(next);
  }, []);

  useEffect(() => {
    if (!quizRunState) return;
    const current = quizSequenceRef.current;
    if (
      current &&
      quizRunState.targetCount === current.targetCount &&
      quizRunState.answeredCount <= current.answeredCount
    ) {
      return;
    }

    syncQuizSequence({
      targetCount: quizRunState.targetCount,
      answeredCount: quizRunState.answeredCount,
      seedPrompt: quizRunState.seedPrompt,
      usedWords: quizRunState.usedWords,
      startedAt: quizRunState.startedAt,
    });
  }, [quizRunState, syncQuizSequence]);

  useEffect(() => {
    if (!quizSequence || !currentSessionId || quizRunState) return;
    if (quizSequence.answeredCount >= quizSequence.targetCount) return;
    const started = startQuizRun(quizSequence.targetCount, quizSequence.seedPrompt, currentSessionId);
    if (!started) return;
    syncQuizSequence({
      ...quizSequence,
      startedAt: started.startedAt,
    });
  }, [currentSessionId, quizRunState, quizSequence, startQuizRun, syncQuizSequence]);

  const contentWidthClass = sidebarOpen
    ? 'max-w-[760px] 2xl:max-w-[820px]'
    : 'max-w-[840px] 2xl:max-w-[900px]';

  const [quizCanvasIndex, setQuizCanvasIndex] = useState(0);
  const quizArtifactsRef = useRef<QuizRunArtifactEntry[]>([]);

  const chatWeakTags = useMemo(
    () =>
      deriveChatWeakTags({
        learningProfile,
        activeBookName: activeBook?.name,
        dueCount: dueWords.length,
        dailyMission,
      }),
    [activeBook?.name, dailyMission, dueWords.length, learningProfile],
  );

  const goalContext = useMemo(
    () =>
      buildChatGoalContext({
        learningProfile,
        activeBookName: activeBook?.name,
        dueCount: dueWords.length,
        dailyMission,
      }),
    [activeBook?.name, dailyMission, dueWords.length, learningProfile],
  );

  const loadingStages = useMemo(
    () =>
      language.startsWith('zh')
        ? ['正在回复', '正在组织回答', '正在输出中']
        : ['Thinking', 'Composing response', 'Streaming'],
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
    const runStartedAt = quizSequence.startedAt || 0;

    const entries: QuizRunArtifactEntry[] = [];
    const seen = new Set<string>();

    for (const message of messages) {
      if (runStartedAt > 0 && message.createdAt < runStartedAt - 500) continue;
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
      quizBackgroundPrefetchRef.current = false;
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
    quizBackgroundPrefetchRef.current = false;
    setVisibleMessageCount(120);
  }, [currentSessionId]);

  useEffect(() => {
    if (messages.length <= 120) {
      setVisibleMessageCount(120);
      return;
    }
    if (shouldAutoScrollRef.current) {
      setVisibleMessageCount((current) => Math.max(current, 120));
    }
  }, [messages.length]);

  const activeQuizRunArtifact = quizRunArtifacts[quizCanvasIndex] || null;
  const quizCompleted = Boolean(quizSequence && quizSequence.answeredCount >= quizSequence.targetCount);
  const quizDisplayIndex = quizSequence
    ? (quizCompleted
        ? quizSequence.targetCount
        : activeQuizRunArtifact
          ? Math.min(quizSequence.targetCount, quizCanvasIndex + 1)
          : Math.min(quizSequence.targetCount, quizSequence.answeredCount + 1))
    : 0;

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
    const startedAt = Date.now();
    const nextSequence = shouldStartQuizSequence
      ? {
          targetCount: requestedQuizCount!,
          answeredCount: 0,
          seedPrompt: text,
          usedWords: [],
          startedAt,
        }
      : null;
    const payload = shouldStartQuizSequence
      ? buildQuizSequencePrompt({
          language,
          seedPrompt: text,
          startIndex: 1,
          questionCount: 1,
          targetCount: requestedQuizCount!,
          usedWords: [],
        })
      : text;
    let startedRunId: string | undefined;
    let startedRunTarget = requestedQuizCount || undefined;
    let startedRunStartedAt = startedAt;

    if (shouldStartQuizSequence && nextSequence) {
      syncQuizSequence(nextSequence);
      setQuizCanvasIndex(0);
      quizBatchRequestingRef.current = false;
      quizPrefetchAttemptedRef.current = false;
      quizBackgroundPrefetchRef.current = false;
      if (currentSessionId) {
        const started = startQuizRun(nextSequence.targetCount, nextSequence.seedPrompt, currentSessionId);
        startedRunId = started?.runId;
        startedRunTarget = started?.targetCount || nextSequence.targetCount;
        startedRunStartedAt = started?.startedAt || startedAt;
      }
      syncQuizSequence({ ...nextSequence, startedAt: startedRunStartedAt });
      handledSequenceQuizIdsRef.current.clear();
    } else if (quizSequenceRef.current) {
      syncQuizSequence(null);
      setQuizCanvasIndex(0);
      quizBatchRequestingRef.current = false;
      quizPrefetchAttemptedRef.current = false;
      quizBackgroundPrefetchRef.current = false;
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
      surface: 'chat',
      goalContext,
      weakTags: chatWeakTags,
      mode: shouldStartQuizSequence ? 'quiz' : chatMode,
      responseStyle: shouldStartQuizSequence ? 'coach' : 'coach',
      searchMode: shouldStartQuizSequence ? 'off' : searchMode,
      trigger: 'manual_input',
      apiContentOverride: shouldStartQuizSequence ? payload : undefined,
      quizPolicy: shouldStartQuizSequence ? { revealAnswer: 'after_submit' } : undefined,
      quizRun:
        shouldStartQuizSequence && (startedRunId || quizRunState?.runId)
          ? {
              runId: startedRunId || quizRunState!.runId,
              questionIndex: 1,
              targetCount: startedRunTarget || quizRunState?.targetCount || requestedQuizCount!,
              status: 'requesting_next',
            }
          : undefined,
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        allowAutoQuiz: shouldStartQuizSequence ? true : chatMode !== 'chat',
        forceQuiz: shouldStartQuizSequence || undefined,
      },
    });
  }, [chatMode, chatWeakTags, clearQuizRun, currentSessionId, goalContext, input, isLoading, language, quizRunState, searchMode, sendMessage, startQuizRun, syncQuizSequence]);

  // Handle quick prompt
  const handleQuickPrompt = useCallback((text: string) => {
    syncQuizSequence(null);
    setQuizCanvasIndex(0);
    quizBatchRequestingRef.current = false;
    quizPrefetchAttemptedRef.current = false;
    quizBackgroundPrefetchRef.current = false;
    clearQuizRun(currentSessionId);
    handledSequenceQuizIdsRef.current.clear();
    setToolsExpanded(false);
    sendMessage(text, {
      surface: 'chat',
      goalContext,
      weakTags: chatWeakTags,
      mode: chatMode,
      responseStyle: 'coach',
      searchMode,
      trigger: 'quick_prompt',
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        allowAutoQuiz: chatMode === 'study' || chatMode === 'quiz',
      },
    });
  }, [chatMode, chatWeakTags, clearQuizRun, currentSessionId, goalContext, searchMode, sendMessage, syncQuizSequence]);

  const handleManualQuiz = useCallback(() => {
    const text =
      language.startsWith('zh')
        ? '基于我们刚才的对话，给我一题英语测验（四选一），并给出中文解析。'
        : 'Based on our recent chat, give me one 4-option English quiz and explain it.';
    syncQuizSequence(null);
    setQuizCanvasIndex(0);
    quizBatchRequestingRef.current = false;
    quizPrefetchAttemptedRef.current = false;
    quizBackgroundPrefetchRef.current = false;
    clearQuizRun(currentSessionId);
    handledSequenceQuizIdsRef.current.clear();
    setToolsExpanded(false);
    void sendMessage(text, {
      surface: 'chat',
      goalContext,
      weakTags: chatWeakTags,
      mode: chatMode,
      responseStyle: 'coach',
      searchMode,
      trigger: 'quiz_button',
      quizPolicy: { revealAnswer: 'after_submit' },
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        forceQuiz: true,
        allowAutoQuiz: true,
      },
    });
  }, [chatMode, chatWeakTags, clearQuizRun, currentSessionId, goalContext, language, searchMode, sendMessage, syncQuizSequence]);

  const handleForceWebSearch = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;

    syncQuizSequence(null);
    setQuizCanvasIndex(0);
    quizBatchRequestingRef.current = false;
    quizPrefetchAttemptedRef.current = false;
    quizBackgroundPrefetchRef.current = false;
    clearQuizRun(currentSessionId);
    handledSequenceQuizIdsRef.current.clear();
    setInput('');
    setToolsExpanded(false);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    void sendMessage(text, {
      surface: 'chat',
      goalContext,
      weakTags: chatWeakTags,
      mode: chatMode,
      responseStyle: 'coach',
      searchMode: 'force',
      trigger: 'manual_input',
      featureFlags: {
        enableQuizArtifacts: true,
        enableStudyArtifacts: true,
        allowAutoQuiz: chatMode !== 'chat',
        forceWebSearch: true,
      },
    });
  }, [chatMode, chatWeakTags, clearQuizRun, currentSessionId, goalContext, input, isLoading, sendMessage, syncQuizSequence]);

  const handleUseCanvasSummary = useCallback((summary: string) => {
    setInput(summary);
    setChatMode('chat');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleRememberInput = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    try {
      const result = await rememberMemoryItems({
        items: [text],
        kind: 'preference',
      });
      toast.success(
        language.startsWith('zh')
          ? `已记住 ${result.writes?.length || 0} 条内容`
          : `Remembered ${result.writes?.length || 0} item(s)`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (language.startsWith('zh') ? '记忆写入失败' : 'Failed to remember'));
    }
  }, [input, language]);

  const handleForgetInput = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    try {
      const result = await deleteMemoryItems({ query: text });
      toast.success(
        language.startsWith('zh')
          ? `已删除 ${result.deletedCount} 条匹配记忆`
          : `Deleted ${result.deletedCount} matching memory item(s)`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (language.startsWith('zh') ? '记忆删除失败' : 'Failed to delete memory'));
    }
  }, [input, language]);

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
      quizBatchRequestingRef.current = true;
      try {
        const activeSequence = quizSequenceRef.current;
        if (!activeSequence) return;
        if (args.runId && quizRunState?.runId && quizRunState.runId !== args.runId) return;

        const questionIndex = Math.max(1, args.startIndex);
        const prompt = buildQuizSequencePrompt({
          language,
          seedPrompt: args.sequence.seedPrompt,
          startIndex: questionIndex,
          questionCount: 1,
          targetCount: args.sequence.targetCount,
          usedWords: args.sequence.usedWords,
        });

        await sendMessage(args.sequence.seedPrompt, {
          surface: 'chat',
          goalContext,
          weakTags: chatWeakTags,
          mode: 'quiz',
          responseStyle: 'coach',
          searchMode: 'off',
          trigger: 'quiz_button',
          apiContentOverride: prompt,
          hideUserMessage: true,
          quizPolicy: { revealAnswer: 'after_submit' },
          quizRun: args.runId
            ? {
                runId: args.runId,
                questionIndex,
                targetCount: args.sequence.targetCount,
                status: 'requesting_next',
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
    [chatWeakTags, goalContext, language, quizRunState?.runId, sendMessage],
  );

  const handleQuizSubmit = useCallback(
    (quizId: string, selected: string, isCorrect: boolean, durationMs: number) => {
      if (!currentSessionId) return;
      const sequenceAtSubmit = quizSequenceRef.current;
      const questionIndex = Math.max(1, (sequenceAtSubmit?.answeredCount || 0) + 1);
      void submitQuizAttempt({
        quizId,
        sessionId: currentSessionId,
        runId: quizRunState?.runId,
        questionIndex,
        selected,
        isCorrect,
        durationMs,
        sourceMode: chatMode,
      });
      void Promise.resolve()
        .then(() => completeMissionTask('task_quiz_today'))
        .catch(() => {
          // Non-critical mission sync should not block quiz progression.
        });
      if (!isCorrect) {
        const artifact = findQuizArtifact(quizId);
        if (artifact) {
          try {
            addReviewCardFromQuiz(artifact);
          } catch {
            // Review-card fallback should not block quiz flow.
          }

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

          try {
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
          } catch {
            // Feedback record persistence is non-blocking for quiz progression.
          }
        }
      }
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
        const completedSequence: QuizSequenceState = {
          ...sequence,
          answeredCount: sequence.targetCount,
          usedWords: nextUsedWords,
          startedAt: sequence.startedAt,
        };
        syncQuizSequence(completedSequence);
        setQuizCanvasIndex(Math.max(0, Math.min(sequence.targetCount - 1, quizArtifactsRef.current.length - 1)));
        quizBatchRequestingRef.current = false;
        quizPrefetchAttemptedRef.current = false;
        quizBackgroundPrefetchRef.current = false;
        clearQuizRun(currentSessionId);
        handledSequenceQuizIdsRef.current.clear();
        return;
      }

      const nextSequence: QuizSequenceState = {
        ...sequence,
        answeredCount: nextAnsweredCount,
        usedWords: nextUsedWords,
        startedAt: sequence.startedAt,
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
        return;
      }

      const missingCount = Math.max(0, nextSequence.targetCount - availableCount);
      if (missingCount <= 0 || quizBatchRequestingRef.current) {
        return;
      }
      goToNextQuizQuestion({
        sessionId: currentSessionId,
        runId: persistedRunId || quizRunState?.runId,
        currentQuizId: quizId,
      });
      void requestQuizBatch({
        sequence: nextSequence,
        startIndex: nextQuestionIndex,
        questionCount: 1,
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
      goToNextQuizQuestion,
      quizRunState?.runId,
      requestQuizBatch,
      syncQuizSequence,
      submitQuizAttempt,
    ],
  );

  useEffect(() => {
    if (!quizSequence || isLoading || quizBatchRequestingRef.current || quizPrefetchAttemptedRef.current) {
      return;
    }
    if (quizSequence.answeredCount > 0 || quizRunArtifacts.length > 0) {
      return;
    }

    quizPrefetchAttemptedRef.current = true;
    void requestQuizBatch({
      sequence: quizSequence,
      startIndex: 1,
      questionCount: 1,
      runId: quizRunState?.runId,
    });
  }, [isLoading, quizRunArtifacts.length, quizRunState?.runId, quizSequence, requestQuizBatch]);

  useEffect(() => {
    if (!quizSequence || isLoading || quizBatchRequestingRef.current || quizBackgroundPrefetchRef.current) {
      return;
    }
    if (quizRunArtifacts.length <= 0 || quizRunArtifacts.length >= quizSequence.targetCount) {
      return;
    }

    const missingCount = quizSequence.targetCount - quizRunArtifacts.length;
    if (missingCount <= 0) {
      return;
    }

    quizBackgroundPrefetchRef.current = true;
    void requestQuizBatch({
      sequence: quizSequence,
      startIndex: quizRunArtifacts.length + 1,
      questionCount: 1,
      runId: quizRunState?.runId,
    });
  }, [isLoading, quizRunArtifacts.length, quizRunState?.runId, quizSequence, requestQuizBatch]);

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

  const shouldWindowMessages = messages.length > 120;
  const hiddenMessageCount = shouldWindowMessages ? Math.max(0, messages.length - visibleMessageCount) : 0;
  const renderedMessages = hiddenMessageCount > 0 ? messages.slice(-visibleMessageCount) : messages;

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
            <ChatHistorySidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              t={t}
              language={language}
              formatDate={formatDate}
              onCreateSession={() => {
                stopGeneration();
                syncQuizSequence(null);
                setQuizCanvasIndex(0);
                quizBatchRequestingRef.current = false;
                quizPrefetchAttemptedRef.current = false;
                quizBackgroundPrefetchRef.current = false;
                clearQuizRun(currentSessionId);
                handledSequenceQuizIdsRef.current.clear();
                void createSession();
              }}
              onSelectSession={(sessionId) => {
                const recovered = recoverQuizRunFromSession(sessionId);
                if (recovered) {
                  syncQuizSequence({
                    targetCount: recovered.targetCount,
                    answeredCount: recovered.answeredCount,
                    seedPrompt: recovered.seedPrompt,
                    usedWords: recovered.usedWords,
                    startedAt: recovered.startedAt,
                  });
                  setQuizCanvasIndex(
                    Math.max(0, Math.min(recovered.answeredCount, recovered.targetCount - 1)),
                  );
                } else {
                  syncQuizSequence(null);
                  setQuizCanvasIndex(0);
                }
                quizBatchRequestingRef.current = false;
                quizPrefetchAttemptedRef.current = false;
                quizBackgroundPrefetchRef.current = false;
                handledSequenceQuizIdsRef.current.clear();
                switchSession(sessionId);
              }}
              onUpdateSessionTitle={updateSessionTitle}
              onDeleteSession={deleteSession}
              onDeleteAllSessions={() => deleteAllSessions()}
            />
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
                        ? `连续测验 ${quizDisplayIndex}/${quizSequence.targetCount}`
                        : `Quiz run ${quizDisplayIndex}/${quizSequence.targetCount}`}
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
                stopGeneration();
                syncQuizSequence(null);
                setQuizCanvasIndex(0);
                quizBatchRequestingRef.current = false;
                quizPrefetchAttemptedRef.current = false;
                quizBackgroundPrefetchRef.current = false;
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
        <ScrollArea className="flex-1 min-h-0 px-4 md:px-6 lg:px-8" ref={messagesScrollAreaRef}>
          <div className={cn(contentWidthClass, 'mx-auto')}>
            {messages.length === 0 ? (
              <ChatWelcome
                title={t('chat.welcomeTitle')}
                description={t('chat.welcomeDesc')}
                prompts={quickPrompts}
                onPromptClick={handleQuickPrompt}
              />
            ) : (
              <div className="py-4 space-y-2">
                {hiddenMessageCount > 0 && (
                  <div className="pb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => setVisibleMessageCount((current) => Math.min(messages.length, current + 60))}
                    >
                      {language.startsWith('zh')
                        ? `加载更早消息（${hiddenMessageCount} 条）`
                        : `Load earlier messages (${hiddenMessageCount})`}
                    </Button>
                  </div>
                )}
                {renderedMessages.map((message) => (
                  (() => {
                    const hideMessageDuringQuizRun =
                      Boolean(quizSequence) &&
                      message.role === 'assistant' &&
                      message.createdAt >= ((quizSequence?.startedAt || 0) - 500);
                    if (hideMessageDuringQuizRun) {
                      return null;
                    }

                    const hasQuizArtifact =
                      message.role === 'assistant' &&
                      Array.isArray(message.artifacts) &&
                      message.artifacts.some((artifact) => artifact.type === 'quiz');

                    if (quizSequence && hasQuizArtifact) {
                      return null;
                    }

                    return (
                      <div key={message.id} className="group">
                        <ChatMessageBubble
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
                  <ChatMessageBubble
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

        <ChatMemoryBanner
          language={language}
          contentWidthClass={contentWidthClass}
          memoryUsed={lastMemoryUsed}
          memoryWrites={lastMemoryWrites}
          memoryTraceId={lastMemoryTraceId}
        />

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
                  ? quizCompleted
                    ? `连续测验已完成：${quizSequence.targetCount}/${quizSequence.targetCount} 题`
                    : `连续测验进行中：已完成 ${quizSequence.answeredCount}/${quizSequence.targetCount} 题`
                  : quizCompleted
                    ? `Quiz completed: ${quizSequence.targetCount}/${quizSequence.targetCount}`
                    : `Quiz streak in progress: ${quizSequence.answeredCount}/${quizSequence.targetCount} completed`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-emerald-700 hover:text-emerald-800"
                onClick={() => {
                  stopGeneration();
                  syncQuizSequence(null);
                  setQuizCanvasIndex(0);
                  quizBatchRequestingRef.current = false;
                  quizPrefetchAttemptedRef.current = false;
                  quizBackgroundPrefetchRef.current = false;
                  clearQuizRun(currentSessionId);
                  handledSequenceQuizIdsRef.current.clear();
                }}
              >
                {language.startsWith('zh')
                  ? (quizCompleted ? '收起测验画布' : '结束连续测验')
                  : (quizCompleted ? 'Close quiz canvas' : 'End quiz run')}
              </Button>
            </div>
          </div>
        )}

        <ChatComposer
          language={language}
          contentWidthClass={contentWidthClass}
          toolsExpanded={toolsExpanded}
          onToggleTools={() => setToolsExpanded((current) => !current)}
          onCloseTools={() => setToolsExpanded(false)}
          chatModeOptions={CHAT_MODE_OPTIONS}
          currentMode={chatMode}
          onSelectMode={setChatMode}
          searchMode={searchMode}
          onToggleSearchMode={() => setSearchMode((prev) => (prev === 'auto' ? 'off' : 'auto'))}
          onManualQuiz={handleManualQuiz}
          onForceWebSearch={handleForceWebSearch}
          onRememberInput={handleRememberInput}
          onForgetInput={handleForgetInput}
          canSearchInput={Boolean(input.trim())}
          canRememberInput={Boolean(input.trim())}
          canForgetInput={Boolean(input.trim())}
          isLoading={isLoading}
          quickPrompts={quickPrompts}
          showQuickPrompts={messages.length === 0}
          onQuickPrompt={handleQuickPrompt}
          inputRef={inputRef}
          input={input}
          onInputChange={handleInputChange}
          onInputKeyDown={handleKeyDown}
          placeholder={t('chat.placeholder')}
          onSend={handleSend}
          onStop={stopGeneration}
          poweredByLabel={t('common.poweredBy')}
          markdownSupportLabel={t('common.markdownSupport')}
          streamingLabel={t('common.streaming')}
          lastAgentMeta={lastAgentMeta}
          lastContextMeta={lastContextMeta}
          lastMemoryUsed={lastMemoryUsed}
          lastMemoryWrites={lastMemoryWrites}
          lastMemoryTraceId={lastMemoryTraceId}
          lastSources={lastSources}
          lastToolRuns={lastToolRuns}
          chatPerf={chatPerf}
        />
      </div>
    </div>
  );
}

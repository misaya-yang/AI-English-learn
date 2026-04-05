import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronUp,
  FlaskConical,
  Globe,
  Mic,
  MicOff,
  Send,
  Sparkles,
  StopCircle,
  Trash2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AgentMeta, ChatPerfSnapshot, ContextMeta, MemoryUsedTrace, MemoryWriteTrace, ToolRun } from '@/types/chatAgent';
import type { ChatModeOption, QuickPromptOption } from '@/features/chat/types';
import { ChatAgentSignals } from '@/features/chat/components/ChatAgentSignals';

interface ChatComposerProps {
  language: string;
  contentWidthClass: string;
  toolsExpanded: boolean;
  onToggleTools: () => void;
  onCloseTools: () => void;
  chatModeOptions: ChatModeOption[];
  currentMode: ChatModeOption['id'];
  onSelectMode: (mode: ChatModeOption['id']) => void;
  searchMode: 'auto' | 'off';
  onToggleSearchMode: () => void;
  onManualQuiz: () => void;
  onForceWebSearch: () => void;
  onRememberInput: () => void;
  onForgetInput: () => void;
  canSearchInput: boolean;
  canRememberInput: boolean;
  canForgetInput: boolean;
  isLoading: boolean;
  quickPrompts: QuickPromptOption[];
  showQuickPrompts: boolean;
  onQuickPrompt: (text: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  input: string;
  onInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  onSend: () => void;
  onStop: () => void;
  poweredByLabel: string;
  markdownSupportLabel: string;
  streamingLabel: string;
  lastAgentMeta: AgentMeta | null;
  lastContextMeta: ContextMeta | null;
  lastMemoryUsed: MemoryUsedTrace[];
  lastMemoryWrites: MemoryWriteTrace[];
  lastMemoryTraceId?: string | null;
  lastSources: unknown[];
  lastToolRuns: ToolRun[];
  chatPerf: ChatPerfSnapshot;
  voiceSupported?: boolean;
  voiceListening?: boolean;
  onToggleVoice?: () => void;
}

export function ChatComposer({
  language,
  contentWidthClass,
  toolsExpanded,
  onToggleTools,
  onCloseTools,
  chatModeOptions,
  currentMode,
  onSelectMode,
  searchMode,
  onToggleSearchMode,
  onManualQuiz,
  onForceWebSearch,
  onRememberInput,
  onForgetInput,
  canSearchInput,
  canRememberInput,
  canForgetInput,
  isLoading,
  quickPrompts,
  showQuickPrompts,
  onQuickPrompt,
  inputRef,
  input,
  onInputChange,
  onInputKeyDown,
  placeholder,
  onSend,
  onStop,
  poweredByLabel,
  markdownSupportLabel,
  streamingLabel,
  lastAgentMeta,
  lastContextMeta,
  lastMemoryUsed,
  lastMemoryWrites,
  lastMemoryTraceId,
  lastSources,
  lastToolRuns,
  chatPerf,
  voiceSupported,
  voiceListening,
  onToggleVoice,
}: ChatComposerProps) {
  const currentModeOption = chatModeOptions.find((option) => option.id === currentMode);

  return (
    <div className="border-t border-border bg-background p-4">
      <div className={cn(contentWidthClass, 'relative mx-auto')}>
        <AnimatePresence initial={false}>
          {toolsExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-[calc(100%+10px)] left-0 right-0 z-20 overflow-hidden rounded-2xl border border-border/90 bg-popover px-3 py-3 text-popover-foreground shadow-xl"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {language.startsWith('zh') ? 'Agent 工具与模式' : 'Agent tools & mode'}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onCloseTools}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {chatModeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onSelectMode(option.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                        currentMode === option.id
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
                    onClick={onManualQuiz}
                    disabled={isLoading}
                  >
                    <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
                    {language.startsWith('zh') ? '马上测我' : 'Quiz me now'}
                  </Button>

                  <Button
                    size="sm"
                    variant={searchMode === 'auto' ? 'default' : 'outline'}
                    className={cn(
                      'h-8 rounded-full text-xs',
                      searchMode === 'auto' ? 'bg-blue-600 text-white hover:bg-blue-700' : '',
                    )}
                    onClick={onToggleSearchMode}
                    disabled={isLoading}
                  >
                    <Globe className="mr-1.5 h-3.5 w-3.5" />
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
                    onClick={onForceWebSearch}
                    disabled={isLoading || !canSearchInput}
                  >
                    <Globe className="mr-1.5 h-3.5 w-3.5" />
                    {language.startsWith('zh') ? '强制搜索本条' : 'Search this input'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full text-xs"
                    onClick={onRememberInput}
                    disabled={isLoading || !canRememberInput}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {language.startsWith('zh') ? '记住这条输入' : 'Remember this input'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full text-xs"
                    onClick={onForgetInput}
                    disabled={isLoading || !canForgetInput}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    {language.startsWith('zh') ? '别记这条输入' : 'Forget matching memory'}
                  </Button>
                </div>

                <ChatAgentSignals
                  language={language}
                  agentMeta={lastAgentMeta}
                  contextMeta={lastContextMeta}
                  memoryUsed={lastMemoryUsed}
                  memoryWrites={lastMemoryWrites}
                  memoryTraceId={lastMemoryTraceId}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showQuickPrompts && (
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-3">
            {quickPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => onQuickPrompt(prompt.text)}
                className="flex-shrink-0 whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm transition-all hover:border-emerald-500/50 hover:bg-emerald-50/50"
              >
                {prompt.textZh}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 rounded-2xl border border-border/80 bg-card p-3 transition-all focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/15">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'mb-1 h-10 w-10 rounded-xl border transition-colors',
              toolsExpanded
                ? 'border-emerald-400 bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'border-border hover:border-emerald-400/50',
            )}
            onClick={onToggleTools}
            title={language.startsWith('zh') ? '工具与模式' : 'Tools & mode'}
          >
            <Wand2 className="h-4 w-4" />
          </Button>

          <textarea
            ref={inputRef}
            id="chat-input"
            name="chat-input"
            value={input}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="min-h-[44px] max-h-[200px] flex-1 resize-none bg-transparent px-1 py-2.5 text-base outline-none"
          />

          <div className="flex items-center gap-1.5 pb-1">
            {voiceSupported && onToggleVoice && !isLoading && (
              <Button
                onClick={onToggleVoice}
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-xl transition-colors',
                  voiceListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                    : 'hover:bg-muted text-muted-foreground',
                )}
                title={voiceListening ? 'Stop listening' : 'Voice input'}
              >
                {voiceListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            {isLoading ? (
              <Button
                onClick={onStop}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={onSend}
                disabled={!input.trim()}
                className="h-10 w-10 rounded-xl bg-emerald-600 p-0 hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {poweredByLabel}
          </span>
          <span>·</span>
          <span>
            {language.startsWith('zh') ? '模式' : 'Mode'}: {language.startsWith('zh') ? currentModeOption?.labelZh : currentModeOption?.label}
          </span>
          <span>·</span>
          <span>
            {language.startsWith('zh') ? '检索' : 'Search'}: {searchMode === 'auto'
              ? (language.startsWith('zh') ? '自动' : 'Auto')
              : (language.startsWith('zh') ? '关闭' : 'Off')}
          </span>
          <span>·</span>
          <span>{markdownSupportLabel}</span>
          <span>·</span>
          <span>{streamingLabel}</span>
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
          {(chatPerf.ttftMs !== null || chatPerf.nextQuestionMs !== null) && (
            <>
              <span>·</span>
              <span>
                {language.startsWith('zh') ? '性能' : 'Perf'}:
                {chatPerf.ttftMs !== null ? ` TTFT ${chatPerf.ttftMs}ms` : ''}
                {chatPerf.nextQuestionMs !== null ? ` / Next ${chatPerf.nextQuestionMs}ms` : ''}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

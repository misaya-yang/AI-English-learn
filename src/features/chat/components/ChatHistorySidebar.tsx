import { useEffect, useRef, useState } from 'react';
import type { TFunction } from 'i18next';
import { Check, Edit2, History, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/features/chat/state/types';

function EditableTitle({
  title,
  onSave,
}: {
  title: string;
  onSave: (newTitle: string) => void;
}) {
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
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="min-w-0 flex-1 border-b border-emerald-500 bg-transparent px-1 text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group/title flex min-w-0 flex-1 items-center gap-1">
      <p className="flex-1 truncate text-sm font-medium" title={title}>
        {title}
      </p>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-muted group-hover/title:opacity-100"
      >
        <Edit2 className="h-3 w-3" />
      </button>
    </div>
  );
}

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  t: TFunction;
  language: string;
  formatDate: (timestamp: number) => string;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onUpdateSessionTitle: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteAllSessions: () => void;
}

export function ChatHistorySidebar({
  sessions,
  currentSessionId,
  t,
  language,
  formatDate,
  onCreateSession,
  onSelectSession,
  onUpdateSessionTitle,
  onDeleteSession,
  onDeleteAllSessions,
}: ChatHistorySidebarProps) {
  return (
    <div className="flex h-full min-h-0 w-[280px] flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <History className="h-4 w-4" />
          {t('chat.history')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onCreateSession}
          title={t('chat.newConversation')}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {sessions.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t('chat.emptyHistory')}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('chat.emptyHistoryHint')}</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'group flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 pr-2 transition-all',
                  currentSessionId === session.id
                    ? 'border-emerald-200 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30'
                    : 'border-transparent hover:bg-muted',
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 overflow-hidden">
                  {currentSessionId === session.id ? (
                    <EditableTitle
                      title={session.title}
                      onSave={(newTitle) => onUpdateSessionTitle(session.id, newTitle)}
                    />
                  ) : (
                    <p className="truncate text-sm font-medium">{session.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {session.messages.length} {t('common.messages')} · {formatDate(session.updatedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className={cn(
                    'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border bg-red-50/70 text-red-600 opacity-100 shadow-sm transition-colors',
                    'border-red-300/60 hover:border-red-400 hover:bg-red-100/80 hover:text-red-700',
                    'dark:border-red-800/80 dark:bg-red-950/40 dark:text-red-300 dark:hover:border-red-700 dark:hover:bg-red-950/55',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    currentSessionId === session.id ? 'border-emerald-300/50' : '',
                  )}
                  aria-label={language.startsWith('zh') ? '删除对话' : 'Delete conversation'}
                  title={language.startsWith('zh') ? '删除对话' : 'Delete conversation'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <Button variant="outline" className="w-full justify-start text-sm" onClick={onDeleteAllSessions}>
          <Trash2 className="mr-2 h-4 w-4" />
          {t('chat.deleteAll')}
        </Button>
      </div>
    </div>
  );
}

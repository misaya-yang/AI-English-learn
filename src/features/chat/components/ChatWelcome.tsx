import { Bot } from 'lucide-react';
import type { QuickPromptOption } from '@/features/chat/types';

interface ChatWelcomeProps {
  title: string;
  description: string;
  prompts: QuickPromptOption[];
  onPromptClick: (text: string) => void;
}

export function ChatWelcome({
  title,
  description,
  prompts,
  onPromptClick,
}: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 shadow-lg dark:bg-emerald-900/40">
        <Bot className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="mb-2 text-center text-2xl font-bold">{title}</h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">{description}</p>
      <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.text}
            onClick={() => onPromptClick(prompt.text)}
            className="flex items-start gap-3 rounded-xl border border-border p-4 text-left transition-all hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <prompt.icon className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{prompt.textZh}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{prompt.text}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

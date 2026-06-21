import { MessageSquare } from 'lucide-react';
import type { QuickPromptOption } from '@/features/chat/types';
import {
  buildMissionRecommendations,
  type MissionRecommendation,
} from '@/features/chat/utils/missionRecommendations';
import { MissionRecommendationCards } from '@/features/chat/components/MissionRecommendationCards';

interface ChatWelcomeProps {
  title: string;
  description: string;
  prompts: QuickPromptOption[];
  onPromptClick: (text: string) => void;
  recommendations?: MissionRecommendation[];
  language?: string;
}

export function ChatWelcome({
  title,
  description,
  prompts,
  onPromptClick,
  recommendations,
  language,
}: ChatWelcomeProps) {
  const lang = language ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  const isZh = lang.startsWith('zh');

  return (
    <div className="py-2">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="mt-4 w-full">
          <MissionRecommendationCards
            cards={recommendations}
            language={lang}
            onLaunch={(prompt) => onPromptClick(prompt)}
          />
        </div>
      )}

      <div className="mt-4 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.text}
            onClick={() => onPromptClick(prompt.text)}
            className="flex min-h-11 items-start gap-3 border-t border-border/20 py-3 text-left transition-colors hover:bg-primary/5"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <prompt.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{isZh ? prompt.textZh : prompt.text}</p>
              {!isZh && prompt.textZh ? (
                <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                  {prompt.textZh}
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Backwards-compatible adapter: the old `buildRecommendations` returned an
 * `AIRecommendation[]` shape. The new `buildMissionRecommendations` is what
 * the cards consume — exported here so existing callers can migrate one
 * import at a time.
 */
export const buildRecommendations = buildMissionRecommendations;

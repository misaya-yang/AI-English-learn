import { Bot, Zap, RotateCcw, Target } from 'lucide-react';
import type { QuickPromptOption } from '@/features/chat/types';

export interface AIRecommendation {
  icon: typeof Bot;
  label: string;
  action: string;
}

interface ChatWelcomeProps {
  title: string;
  description: string;
  prompts: QuickPromptOption[];
  onPromptClick: (text: string) => void;
  recommendations?: AIRecommendation[];
}

export function ChatWelcome({
  title,
  description,
  prompts,
  onPromptClick,
  recommendations,
}: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 shadow-lg dark:bg-emerald-900/40">
        <Bot className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="mb-2 text-center text-2xl font-bold">{title}</h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">{description}</p>

      {/* AI Proactive Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mb-6 w-full max-w-lg space-y-2">
          {recommendations.map((rec, i) => (
            <button
              key={i}
              onClick={() => onPromptClick(rec.action)}
              className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 px-4 py-3 text-left transition-all hover:border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <rec.icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{rec.label}</span>
              <Zap className="ml-auto h-3.5 w-3.5 text-emerald-500/50" />
            </button>
          ))}
        </div>
      )}

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

/** Build proactive AI recommendations based on learning context */
export function buildRecommendations(ctx: {
  dueCount: number;
  incompleteTasks: string[];
  level: string;
  language: string;
}): AIRecommendation[] {
  const recs: AIRecommendation[] = [];
  const isZh = ctx.language.startsWith('zh');

  // Scenario 1: Review pressure
  if (ctx.dueCount >= 3) {
    recs.push({
      icon: RotateCcw,
      label: isZh ? `你有 ${ctx.dueCount} 个词汇需要复习，我来帮你在对话中练习` : `You have ${ctx.dueCount} words due — let me help you practice them`,
      action: `I have ${ctx.dueCount} words due for review. Create a short story or dialogue that naturally uses some of them so I can practice in context.`,
    });
  }

  // Scenario 2: Incomplete daily tasks
  if (ctx.incompleteTasks.length > 0) {
    const taskLabel = ctx.incompleteTasks[0];
    const taskNames: Record<string, [string, string]> = {
      writing: ['完成今天的写作练习', 'Complete today\'s writing practice'],
      quiz: ['做一组快速测验', 'Take a quick quiz'],
      review: ['开始间隔复习', 'Start spaced review'],
      vocabulary: ['学习今天的新词汇', 'Learn today\'s new words'],
    };
    const [labelZh, labelEn] = taskNames[taskLabel] || ['继续今天的学习任务', 'Continue today\'s learning'];
    recs.push({
      icon: Target,
      label: isZh ? labelZh : labelEn,
      action: `Help me with my daily mission: I need to ${labelEn.toLowerCase()}. Guide me through it step by step.`,
    });
  }

  // Scenario 3: Level-based encouragement
  if (ctx.level && recs.length < 3) {
    const levelTips: Record<string, [string, string, string]> = {
      A1: ['从基础日常用语开始练习', 'Practice basic daily expressions', 'Help me practice basic English expressions I can use every day, like greetings and simple requests.'],
      A2: ['扩展你的日常对话能力', 'Expand your daily conversation skills', 'Help me expand my conversational English with common phrases for shopping, travel, and socializing.'],
      B1: ['提升语法准确性和词汇深度', 'Improve grammar accuracy and vocabulary depth', 'Help me improve my grammar accuracy. Give me a sentence with a common B1-level error and let me correct it.'],
      B2: ['练习复杂表达和学术写作', 'Practice complex expressions', 'Challenge me with an advanced vocabulary exercise that tests nuance and register.'],
      C1: ['精进高级表达和惯用语', 'Refine advanced expressions', 'Test me on advanced collocations and idiomatic expressions that distinguish C1 from B2 speakers.'],
      C2: ['挑战母语级精准度', 'Challenge native-level precision', 'Give me a subtle language nuance challenge — something that even advanced learners often get wrong.'],
    };
    const tip = levelTips[ctx.level];
    if (tip) {
      recs.push({
        icon: Zap,
        label: isZh ? tip[0] : tip[1],
        action: tip[2],
      });
    }
  }

  return recs.slice(0, 3);
}

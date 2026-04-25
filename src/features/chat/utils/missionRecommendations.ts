// missionRecommendations.ts — coach-mission recommendations for the chat
// welcome screen. Replaces the old single-line `AIRecommendation` row with
// rich mission cards that explain *why* the coach is recommending this
// step, how long it should take, and what specific prompt to fire when
// the learner taps it. Pure module — UI-agnostic.

export type MissionRecommendationIcon =
  | 'review-pressure'
  | 'mission-task'
  | 'level-up'
  | 'exam-boost'
  | 'beginner-warmup'
  | 'pronunciation';

export type MissionRecommendationVariant = 'recovery' | 'review' | 'today' | 'sprint' | 'practice' | 'default';

export interface MissionRecommendation {
  id: string;
  icon: MissionRecommendationIcon;
  variant: MissionRecommendationVariant;
  title: { en: string; zh: string };
  reason: { en: string; zh: string };
  estimatedMinutes: number;
  /** Prompt sent to the coach when the learner taps the card. */
  promptEn: string;
  /** Optional Chinese-leaning launch text — most cards reuse promptEn. */
  promptZh?: string;
}

interface BuildMissionContext {
  dueCount?: number;
  incompleteTasks?: string[];
  level?: string;
  language?: string;
  /** When set to "ielts" the level fallback prefers exam-prep prompts. */
  examType?: string | null;
  hasExamGoal?: boolean;
}

const TASK_LABELS: Record<string, { titleEn: string; titleZh: string; reasonEn: string; reasonZh: string; promptEn: string }> = {
  writing: {
    titleEn: 'Finish today\'s writing',
    titleZh: '完成今天的写作任务',
    reasonEn: 'Your daily mission lists a writing task that\'s still open.',
    reasonZh: '今日任务里还有未完成的写作练习。',
    promptEn: 'Help me with today\'s writing task — give me one IELTS-style prompt and walk me through structuring my answer step by step.',
  },
  quiz: {
    titleEn: 'Take a 5-question retrieval quiz',
    titleZh: '做一组 5 题快速测验',
    reasonEn: 'A retrieval drill is the fastest way to lock in what you just learned.',
    reasonZh: '检索式测验是把今天学到的内容固化下来最快的方式。',
    promptEn: 'Give me a 5-question English quiz drawn from words and grammar I\'ve been practicing recently. Show one at a time, then explain in Chinese after I answer.',
  },
  review: {
    titleEn: 'Run today\'s spaced review',
    titleZh: '完成今日间隔复习',
    reasonEn: 'Your daily mission has an open review block.',
    reasonZh: '今日任务里有一段间隔复习还没完成。',
    promptEn: 'Walk me through a short spaced review session for the words I owe today. Use them in tiny sentences I can repeat back.',
  },
  vocabulary: {
    titleEn: 'Learn today\'s new words',
    titleZh: '学习今天的新词',
    reasonEn: 'Today\'s new-word block is still open in your daily mission.',
    reasonZh: '今日新词任务还没完成。',
    promptEn: 'Teach me 5 new English words I haven\'t studied today, with bilingual examples and a tiny quiz at the end.',
  },
};

const LEVEL_TIPS: Record<string, { titleEn: string; titleZh: string; reasonEn: string; reasonZh: string; promptEn: string; minutes: number }> = {
  A1: {
    titleEn: 'Practice everyday English',
    titleZh: '从基础日常用语开始练习',
    reasonEn: 'A1 learners gain the most from short, scenario-driven dialogues.',
    reasonZh: 'A1 阶段最适合做场景化的短对话练习。',
    promptEn: 'Help me practice basic English expressions I can use every day, like greetings, polite requests, and ordering food.',
    minutes: 8,
  },
  A2: {
    titleEn: 'Expand daily-conversation skills',
    titleZh: '扩展日常对话能力',
    reasonEn: 'A2 learners level up fastest by chaining short scenarios end to end.',
    reasonZh: 'A2 阶段把多个场景串起来练，最容易看到提升。',
    promptEn: 'Help me expand my conversational English with common phrases for shopping, travel, and meeting new people.',
    minutes: 10,
  },
  B1: {
    titleEn: 'Tighten grammar accuracy',
    titleZh: '提升语法准确性',
    reasonEn: 'B1-level errors cluster around tense and articles — a focused drill gives the biggest jump.',
    reasonZh: 'B1 阶段的错误集中在时态和冠词，针对练最容易提分。',
    promptEn: 'Give me a sentence with a common B1-level grammar error and let me correct it. After I answer, explain the rule in Chinese.',
    minutes: 10,
  },
  B2: {
    titleEn: 'Practice complex expressions',
    titleZh: '练习复杂表达',
    reasonEn: 'B2 learners need to push beyond familiar phrasing to reach C1.',
    reasonZh: 'B2 阶段最值得做的是脱离熟练表达，向 C1 靠近。',
    promptEn: 'Challenge me with an advanced vocabulary exercise that tests nuance and register, then explain why each option works.',
    minutes: 12,
  },
  C1: {
    titleEn: 'Refine advanced expressions',
    titleZh: '精进高级表达',
    reasonEn: 'C1 → C2 progress comes from idiom range and pragmatic accuracy.',
    reasonZh: 'C1 到 C2 的提升靠惯用语广度和语境精准。',
    promptEn: 'Test me on advanced collocations and idiomatic expressions that distinguish C1 from B2 speakers.',
    minutes: 12,
  },
  C2: {
    titleEn: 'Push native-level precision',
    titleZh: '挑战母语级精准度',
    reasonEn: 'At C2, the gains come from subtle nuance most learners miss.',
    reasonZh: 'C2 阶段最值得练的是大多数学习者忽略的细微差别。',
    promptEn: 'Give me a subtle language-nuance challenge — something even advanced learners often get wrong.',
    minutes: 12,
  },
};

const BEGINNER_FALLBACKS: MissionRecommendation[] = [
  {
    id: 'fallback-greetings',
    icon: 'beginner-warmup',
    variant: 'today',
    title: { en: 'Warm up with everyday greetings', zh: '用日常问候热身' },
    reason: {
      en: 'A friendly warm-up makes the rest of the session easier.',
      zh: '先用一段日常问候热身，后面的练习会更顺畅。',
    },
    estimatedMinutes: 5,
    promptEn: 'Help me practice 5 friendly English greetings and a short response for each. After I try, give me brief feedback in Chinese.',
  },
  {
    id: 'fallback-roleplay-coffee',
    icon: 'beginner-warmup',
    variant: 'practice',
    title: { en: 'Order coffee in English', zh: '用英文点一杯咖啡' },
    reason: {
      en: 'Concrete scenarios beat abstract drills when learner context is unknown.',
      zh: '在没有学习数据时，具体场景比抽象练习更有帮助。',
    },
    estimatedMinutes: 6,
    promptEn: 'Roleplay ordering a coffee with me. You play the barista. After my replies, point out one small improvement in Chinese.',
  },
  {
    id: 'fallback-mini-quiz',
    icon: 'beginner-warmup',
    variant: 'today',
    title: { en: 'Quick 3-question warm-up quiz', zh: '3 题热身小测' },
    reason: {
      en: 'A tiny quiz gives the coach a baseline before recommending more.',
      zh: '先做个小测，让教练能更准地推荐下一步。',
    },
    estimatedMinutes: 5,
    promptEn: 'Give me 3 quick English questions to gauge my current level. After I answer, summarize what to focus on first.',
  },
];

const isExamFocused = (ctx: BuildMissionContext): boolean => {
  if (ctx.hasExamGoal) return true;
  const exam = (ctx.examType || '').trim().toLowerCase();
  return exam.length > 0 && exam !== 'none';
};

export function buildMissionRecommendations(ctx: BuildMissionContext = {}): MissionRecommendation[] {
  const out: MissionRecommendation[] = [];

  // 1. Review backlog — highest priority when present.
  const dueCount = typeof ctx.dueCount === 'number' && Number.isFinite(ctx.dueCount) ? Math.max(0, Math.round(ctx.dueCount)) : 0;
  if (dueCount >= 3) {
    out.push({
      id: 'review-pressure',
      icon: 'review-pressure',
      variant: dueCount >= 12 ? 'recovery' : 'review',
      title: {
        en: `Clear ${dueCount} due reviews in chat`,
        zh: `用一次对话清掉 ${dueCount} 个到期复习`,
      },
      reason: {
        en: dueCount >= 12
          ? 'Backlog is high — practice them in short bursts so retention does not slip.'
          : 'Practising due words in context is the fastest way to keep retention up.',
        zh: dueCount >= 12
          ? '复习积压偏高，先用对话分批清掉，避免遗忘曲线掉得更快。'
          : '在语境里练到期词，是把记忆稳住最有效的方式。',
      },
      estimatedMinutes: dueCount >= 12 ? 14 : 10,
      promptEn: `I have ${dueCount} words due for review. Use 5 of them in a short story or dialogue, then ask me to recall their meanings.`,
    });
  }

  // 2. Daily-mission task — surface the first incomplete task.
  const incomplete = Array.isArray(ctx.incompleteTasks) ? ctx.incompleteTasks : [];
  for (const taskName of incomplete) {
    if (typeof taskName !== 'string') continue;
    const tip = TASK_LABELS[taskName];
    if (!tip) continue;
    out.push({
      id: `mission-${taskName}`,
      icon: 'mission-task',
      variant: 'today',
      title: { en: tip.titleEn, zh: tip.titleZh },
      reason: { en: tip.reasonEn, zh: tip.reasonZh },
      estimatedMinutes: 8,
      promptEn: tip.promptEn,
    });
    if (out.length >= 3) break;
  }

  // 3. Exam-prep promotion if the goal is exam-focused.
  if (out.length < 3 && isExamFocused(ctx)) {
    out.push({
      id: 'exam-boost',
      icon: 'exam-boost',
      variant: 'sprint',
      title: { en: 'IELTS Task 2 sprint', zh: 'IELTS 写作冲刺' },
      reason: {
        en: 'Structured Task 2 practice with feedback is the fastest path to a band gain.',
        zh: '结构化的 Task 2 训练加针对反馈，是提分最快的入口。',
      },
      estimatedMinutes: 18,
      promptEn: 'Give me an IELTS Writing Task 2 prompt and walk me through a 4-paragraph structure before I draft. After I write, evaluate band 1-9.',
    });
  }

  // 4. Level-based suggestion fills the remaining slot.
  if (out.length < 3 && ctx.level) {
    const tip = LEVEL_TIPS[ctx.level];
    if (tip) {
      out.push({
        id: `level-${ctx.level.toLowerCase()}`,
        icon: 'level-up',
        variant: 'practice',
        title: { en: tip.titleEn, zh: tip.titleZh },
        reason: { en: tip.reasonEn, zh: tip.reasonZh },
        estimatedMinutes: tip.minutes,
        promptEn: tip.promptEn,
      });
    }
  }

  // 5. Final fallback — never leave the chat welcome empty.
  if (out.length === 0) {
    return BEGINNER_FALLBACKS.slice(0, 3);
  }

  return out.slice(0, 3);
}

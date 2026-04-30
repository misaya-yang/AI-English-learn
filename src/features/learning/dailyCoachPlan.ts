import type { DailyMissionCard, NextBestAction, WeaknessSnapshot } from '@/types/learning';
import type { LearningProfile } from '@/types/examContent';
import type { LexicalEntry } from '@/features/lexicon/lexicalEntry';

export type DailyCoachPlanReason =
  | 'review_pressure'
  | 'exam_boost'
  | 'weakness_drill'
  | 'daily_vocabulary'
  | 'coach_checkin';

export interface DailyCoachEvidenceItem {
  id: string;
  label: { en: string; zh: string };
  value: string;
  tone: 'neutral' | 'coach' | 'practice' | 'warning';
}

export interface DailyCoachPlan {
  id: string;
  reason: DailyCoachPlanReason;
  briefTitle: { en: string; zh: string };
  brief: { en: string; zh: string };
  primaryTask: NextBestAction;
  secondaryTasks: NextBestAction[];
  evidence: DailyCoachEvidenceItem[];
  dictionaryFocus?: Pick<LexicalEntry, 'id' | 'headword' | 'cefrLevel' | 'topic' | 'ieltsRelevance'>;
  coachPrompt: string;
  coachHref: string;
  completion: { en: string; zh: string };
}

export interface BuildDailyCoachPlanArgs {
  userId: string;
  profile: LearningProfile;
  missionCard: DailyMissionCard;
  dueWordsCount: number;
  dailyWordsCount: number;
  learnedTodayCount: number;
  weaknesses: WeaknessSnapshot[];
  activeBookName?: string | null;
  lexicalFocus?: LexicalEntry | null;
}

const reasonFromMission = (reason: string): DailyCoachPlanReason => {
  switch (reason) {
    case 'recovery_mode':
    case 'due_words':
      return 'review_pressure';
    case 'exam_boost':
      return 'exam_boost';
    case 'weakness_drill':
    case 'practice_gap':
      return 'weakness_drill';
    case 'today_words':
      return 'daily_vocabulary';
    default:
      return 'coach_checkin';
  }
};

const reasonCopy: Record<DailyCoachPlanReason, { title: { en: string; zh: string }; lead: { en: string; zh: string } }> = {
  review_pressure: {
    title: { en: 'Stabilize retention first', zh: '先稳住记忆压力' },
    lead: {
      en: 'Your coach is reducing review pressure before adding more new material.',
      zh: '教练会先降低复习压力，再决定是否加入新内容。',
    },
  },
  exam_boost: {
    title: { en: 'Use today for score impact', zh: '今天优先做提分动作' },
    lead: {
      en: 'Your coach is routing today toward the highest-impact exam task.',
      zh: '教练会把今天导向最可能提分的考试任务。',
    },
  },
  weakness_drill: {
    title: { en: 'Turn the weak signal into a drill', zh: '把弱项信号转成训练' },
    lead: {
      en: 'Your recent evidence points to one weakness worth training now.',
      zh: '最近证据指向了一个现在值得训练的弱项。',
    },
  },
  daily_vocabulary: {
    title: { en: 'Build the next lexical layer', zh: '推进今天的词汇层' },
    lead: {
      en: 'Your coach is keeping the daily vocabulary block small and review-ready.',
      zh: '教练会把今日词汇控制在可完成、可复习的范围内。',
    },
  },
  coach_checkin: {
    title: { en: 'Run a short coach check-in', zh: '先做一次教练诊断' },
    lead: {
      en: 'Your coach needs one fresh signal before selecting a harder task.',
      zh: '教练需要一个新信号，再安排更明确的任务。',
    },
  },
};

const encodeParam = (value: string): string => encodeURIComponent(value).replace(/%20/g, '+');

const reasonPromptLabel: Record<DailyCoachPlanReason, string> = {
  review_pressure: 'due review pressure',
  exam_boost: 'exam score impact',
  weakness_drill: 'weakness drill',
  daily_vocabulary: 'daily vocabulary',
  coach_checkin: 'coach check-in',
};

function buildCoachPrompt(args: {
  reason: DailyCoachPlanReason;
  profile: LearningProfile;
  primaryTask: NextBestAction;
  dueWordsCount: number;
  dailyWordsCount: number;
  learnedTodayCount: number;
  weaknesses: WeaknessSnapshot[];
  lexicalFocus?: LexicalEntry | null;
}): string {
  const topWeakness = args.weaknesses[0];
  const lines = [
    `Daily Coach OS plan: ${args.primaryTask.title}.`,
    `Learner target: ${args.profile.target || 'general English'}; level: ${args.profile.level}.`,
    `Reason: ${reasonPromptLabel[args.reason]}.`,
    `Progress: ${args.learnedTodayCount}/${args.dailyWordsCount} daily words; ${args.dueWordsCount} due reviews.`,
  ];

  if (topWeakness) {
    lines.push(`Weakness focus: ${topWeakness.title} (${topWeakness.count} recent signals).`);
  }

  if (args.lexicalFocus) {
    const sense = args.lexicalFocus.senses[0];
    lines.push(`Dictionary focus: ${args.lexicalFocus.headword} (${args.lexicalFocus.cefrLevel}, ${args.lexicalFocus.ieltsRelevance}) - ${sense.definition}.`);
  }

  lines.push('Start by confirming the diagnosis in one question, then run a tiny drill, and end with a review action.');
  return lines.join('\n');
}

export function buildDailyCoachPlan(args: BuildDailyCoachPlanArgs): DailyCoachPlan {
  const reason = reasonFromMission(args.missionCard.primaryAction.reason);
  const topWeakness = args.weaknesses[0];
  const dictionaryFocus = args.lexicalFocus
    ? {
        id: args.lexicalFocus.id,
        headword: args.lexicalFocus.headword,
        cefrLevel: args.lexicalFocus.cefrLevel,
        topic: args.lexicalFocus.topic,
        ieltsRelevance: args.lexicalFocus.ieltsRelevance,
      }
    : undefined;

  const evidence: DailyCoachEvidenceItem[] = [
    {
      id: 'target',
      label: { en: 'Target', zh: '目标' },
      value: args.profile.target || args.profile.level,
      tone: 'coach',
    },
    {
      id: 'due-reviews',
      label: { en: 'Due reviews', zh: '到期复习' },
      value: String(args.dueWordsCount),
      tone: args.dueWordsCount > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'daily-progress',
      label: { en: 'Daily words', zh: '今日词汇' },
      value: `${args.learnedTodayCount}/${args.dailyWordsCount}`,
      tone: 'practice',
    },
  ];

  if (topWeakness) {
    evidence.push({
      id: 'weakness',
      label: { en: 'Weakness', zh: '弱项' },
      value: topWeakness.title,
      tone: topWeakness.emphasis === 'urgent' ? 'warning' : 'coach',
    });
  }

  if (dictionaryFocus) {
    evidence.push({
      id: 'dictionary-focus',
      label: { en: 'Lexicon', zh: '词典' },
      value: `${dictionaryFocus.headword} · ${dictionaryFocus.cefrLevel}`,
      tone: 'practice',
    });
  }

  const coachPrompt = buildCoachPrompt({
    reason,
    profile: args.profile,
    primaryTask: args.missionCard.primaryAction,
    dueWordsCount: args.dueWordsCount,
    dailyWordsCount: args.dailyWordsCount,
    learnedTodayCount: args.learnedTodayCount,
    weaknesses: args.weaknesses,
    lexicalFocus: args.lexicalFocus,
  });
  const planId = `daily-${args.userId}-${reason}-${args.missionCard.primaryAction.id}`;
  const focus = dictionaryFocus?.headword || topWeakness?.title || args.profile.target || args.missionCard.primaryAction.title;
  const query = [
    `dailyPlan=${encodeParam(planId)}`,
    `reason=${encodeParam(reason)}`,
    `focus=${encodeParam(focus)}`,
    `prompt=${encodeParam(coachPrompt)}`,
  ].join('&');
  const copy = reasonCopy[reason];

  return {
    id: planId,
    reason,
    briefTitle: copy.title,
    brief: {
      en: `${copy.lead.en} ${args.missionCard.primaryAction.description}`,
      zh: `${copy.lead.zh} ${args.missionCard.primaryAction.descriptionZh}`,
    },
    primaryTask: args.missionCard.primaryAction,
    secondaryTasks: args.missionCard.secondaryActions.slice(0, 2),
    evidence,
    dictionaryFocus,
    coachPrompt,
    coachHref: `/dashboard/chat?${query}`,
    completion: {
      en: 'After this task, the coach should turn the result into a retry, review card, or next drill.',
      zh: '完成后，教练会把结果转成重练、复习卡或下一步训练。',
    },
  };
}

export function getDailyCoachEvidenceToneClass(tone: DailyCoachEvidenceItem['tone']): string {
  switch (tone) {
    case 'coach':
      return 'border-[hsl(var(--accent-coach)/0.25)] bg-[hsl(var(--accent-coach)/0.08)] text-[hsl(var(--accent-coach))]';
    case 'practice':
      return 'border-[hsl(var(--accent-practice)/0.25)] bg-[hsl(var(--accent-practice)/0.08)] text-[hsl(var(--accent-practice))]';
    case 'warning':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-600';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}

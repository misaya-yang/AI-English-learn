import type { DailyMissionCard, NextBestAction, WeaknessSnapshot } from '@/types/learning';
import type { LearningProfile } from '@/types/examContent';
import type { LexicalEntry } from '@/features/lexicon/lexicalEntry';
import { getLearningStylePersonalization } from '@/features/learning/learningStylePersonalization';

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
  valueZh?: string;
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
    title: { en: 'Review due words first', zh: '先复习到期词' },
    lead: {
      en: 'Clear the review queue before adding more words.',
      zh: '先清掉今天到期的词，再决定是否学新词。',
    },
  },
  exam_boost: {
    title: { en: 'Do one exam task', zh: '做一个考试任务' },
    lead: {
      en: 'Use today for one focused exam exercise.',
      zh: '今天先完成一个考试练习。',
    },
  },
  weakness_drill: {
    title: { en: 'Practice the weak spot', zh: '练一个薄弱点' },
    lead: {
      en: 'Pick one recent mistake and practice it now.',
      zh: '从最近的错题里挑一个，现在练掉。',
    },
  },
  daily_vocabulary: {
    title: { en: 'Learn today\'s words', zh: '学习今日单词' },
    lead: {
      en: 'Keep the word list short enough to finish.',
      zh: '今天的新词数量不多，先学完。',
    },
  },
  coach_checkin: {
    title: { en: 'Check one problem', zh: '先检查一个问题' },
    lead: {
      en: 'Answer one short prompt before choosing a harder task.',
      zh: '先答一个短题，再决定下一步练什么。',
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

const formatTargetValue = (value: string | undefined, level: string, isZh: boolean): string => {
  const target = value?.trim();
  if (!target) return level;
  const normalized = target.toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'general_improvement') return isZh ? '综合提升' : 'General improvement';
  return target.replace(/_/g, ' ');
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
    `Preferred learning style: ${args.profile.learningStyle}; ${getLearningStylePersonalization(args.profile.learningStyle).coachInstruction}`,
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
  const stylePersonalization = getLearningStylePersonalization(args.profile.learningStyle);

  const evidence: DailyCoachEvidenceItem[] = [
    {
      id: 'target',
      label: { en: 'Target', zh: '目标' },
      value: formatTargetValue(args.profile.target, args.profile.level, false),
      valueZh: formatTargetValue(args.profile.target, args.profile.level, true),
      tone: 'coach',
    },
    {
      id: 'learning-style',
      label: { en: 'Style', zh: '偏好' },
      value: stylePersonalization.label.en,
      valueZh: stylePersonalization.label.zh,
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
  const briefTitle = reason === 'daily_vocabulary'
    ? { en: args.missionCard.primaryAction.title, zh: args.missionCard.primaryAction.titleZh }
    : copy.title;

  return {
    id: planId,
    reason,
    briefTitle,
    brief: {
      en: `${copy.lead.en} ${args.missionCard.primaryAction.description} ${stylePersonalization.todayNudge.en}`,
      zh: `${copy.lead.zh} ${args.missionCard.primaryAction.descriptionZh} ${stylePersonalization.todayNudge.zh}`,
    },
    primaryTask: args.missionCard.primaryAction,
    secondaryTasks: args.missionCard.secondaryActions.slice(0, 2),
    evidence,
    dictionaryFocus,
    coachPrompt,
    coachHref: `/dashboard/chat?${query}`,
    completion: {
      en: 'After this task, save the result and review any mistake later.',
      zh: '完成后保存结果，错题稍后再复习。',
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

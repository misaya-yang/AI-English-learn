import type { ChatMode } from '@/types/chatAgent';
import type { AiFeedback, FeedbackIssue, LearningProfile } from '@/types/examContent';
import type { LearnerModel } from '@/services/learnerModel';
import type { MistakeEntry } from '@/services/mistakeCollector';

export type CoachStudioMode = 'diagnose' | 'drill' | 'review';

export interface CoachStudioCopy {
  label: { en: string; zh: string };
  description: { en: string; zh: string };
  chatMode: ChatMode;
}

export interface CoachEvidenceSnapshot {
  userId: string;
  level: LearningProfile['level'];
  ieltsTarget: string;
  primaryFocus: string;
  dueReviewCount: number;
  recentMistakeCount: number;
  repeatedMistakeCount: number;
  weakTags: string[];
  retention: {
    avgRetrievability: number;
    predicted30d: number;
  };
  nextAction?: string;
}

const STUDIO_COPY: Record<CoachStudioMode, CoachStudioCopy> = {
  diagnose: {
    label: { en: 'Diagnose', zh: '诊断' },
    description: {
      en: 'Find the one IELTS weakness worth training now.',
      zh: '先找出现在最值得训练的雅思弱项。',
    },
    chatMode: 'study',
  },
  drill: {
    label: { en: 'Drill', zh: '训练' },
    description: {
      en: 'Turn the diagnosis into a focused retry or quiz.',
      zh: '把诊断变成一次聚焦重练或短测。',
    },
    chatMode: 'quiz',
  },
  review: {
    label: { en: 'Review', zh: '复盘' },
    description: {
      en: 'Schedule the mistake so it does not disappear after feedback.',
      zh: '把错误排进复习，不让反馈停在当下。',
    },
    chatMode: 'chat',
  },
};

const normalizeTag = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '_');

const issueTag = (issue: FeedbackIssue): string => issue.tag;

const firstMeaningful = (values: Array<string | undefined>): string | undefined =>
  values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim();

export function getCoachStudioCopy(mode: CoachStudioMode): CoachStudioCopy {
  return STUDIO_COPY[mode];
}

export function buildCoachEvidenceSnapshot(args: {
  userId: string;
  learningProfile: LearningProfile;
  dueCount: number;
  learnerModel?: LearnerModel | null;
  recentMistakes?: MistakeEntry[];
  lastFeedback?: AiFeedback | null;
}): CoachEvidenceSnapshot {
  const activeMistakes = (args.recentMistakes || []).filter((mistake) => !mistake.eliminated);
  const repeatedMistakes = activeMistakes.filter((mistake) => mistake.reviewCount > 0);
  const issueTags = args.lastFeedback?.issues.map(issueTag) || [];
  const mistakeTags = activeMistakes.map((mistake) => normalizeTag(mistake.category));
  const learnerWeakTags = args.learnerModel?.weakTopics.map(normalizeTag) || [];
  const weakTags = Array.from(new Set([...issueTags, ...mistakeTags, ...learnerWeakTags])).slice(0, 6);

  const primaryFocus =
    firstMeaningful([
      issueTags[0],
      args.learnerModel?.weakTopics[0],
      activeMistakes[0]?.category,
      args.learningProfile.tracks.includes('exam_boost') ? 'ielts_writing' : undefined,
    ]) || 'ielts_coach';

  const predicted = args.learnerModel?.predictedRetention30d ?? 0;
  const predicted30d = predicted > 1 ? predicted / 100 : predicted;

  return {
    userId: args.userId,
    level: args.learningProfile.level,
    ieltsTarget: args.learningProfile.target || 'IELTS 7.0',
    primaryFocus,
    dueReviewCount: args.learnerModel?.dueCount ?? args.dueCount,
    recentMistakeCount: activeMistakes.length,
    repeatedMistakeCount: repeatedMistakes.length,
    weakTags,
    retention: {
      avgRetrievability: args.learnerModel?.avgRetrievability ?? 0,
      predicted30d: Math.max(0, Math.min(1, predicted30d)),
    },
    nextAction: args.lastFeedback?.nextActions[0],
  };
}

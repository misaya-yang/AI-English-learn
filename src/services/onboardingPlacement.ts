import { BUILT_IN_WORD_BOOK_IDS } from '@/data/wordBooks';
import type { CEFRLevel, LearningStyle, Topic } from '@/types';
import type { LearningProfile, LearningTrack } from '@/types/examContent';

export type OnboardingExamTarget = 'general' | 'ielts' | 'toefl';
export type OnboardingDeadline = 'none' | 'lt_1_month' | '1_3_months' | '3_6_months' | '6_plus_months';

export interface OnboardingPlacementInput {
  cefrLevel: CEFRLevel;
  examTarget: OnboardingExamTarget;
  targetBand?: string;
  deadline: OnboardingDeadline;
  dailyGoal: number;
  dailyMinutes: number;
  preferredTopics: Topic[];
  learningStyle: LearningStyle;
}

export interface OnboardingFirstMission {
  title: string;
  titleZh: string;
  route: string;
}

export interface OnboardingPlacement {
  starterBookId: string;
  starterBookName: string;
  learningPathId: string;
  learningPathName: string;
  firstMission: OnboardingFirstMission;
  learningProfile: Partial<Omit<LearningProfile, 'userId' | 'updatedAt'>>;
  reasons: {
    en: string;
    zh: string;
  }[];
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const DEFAULT_IELTS_TARGET_BY_LEVEL: Record<CEFRLevel, string> = {
  A1: 'IELTS 5.0',
  A2: 'IELTS 5.5',
  B1: 'IELTS 6.0',
  B2: 'IELTS 7.0',
  C1: 'IELTS 7.5',
  C2: 'IELTS 8.0',
};

const DEFAULT_TOEFL_TARGET_BY_LEVEL: Record<CEFRLevel, string> = {
  A1: 'TOEFL 45+',
  A2: 'TOEFL 60+',
  B1: 'TOEFL 75+',
  B2: 'TOEFL 90+',
  C1: 'TOEFL 105+',
  C2: 'TOEFL 110+',
};

const BOOK_NAMES: Record<string, string> = {
  [BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION]: 'A1 Foundation',
  [BUILT_IN_WORD_BOOK_IDS.A2_HIGH_FREQUENCY]: 'A2 High Frequency',
  [BUILT_IN_WORD_BOOK_IDS.B1_CORE]: 'B1 Core',
  [BUILT_IN_WORD_BOOK_IDS.BUSINESS_ENGLISH]: 'Business English',
  [BUILT_IN_WORD_BOOK_IDS.TECHNOLOGY_ENGLISH]: 'Technology English',
  [BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE]: 'IELTS Academic Core',
};

const PATH_NAMES: Record<string, string> = {
  'daily-english': 'Daily English',
  'business-english': 'Business English',
  'ielts-prep': 'IELTS Preparation',
  'academic-english': 'Academic English',
  'travel-english': 'Travel English',
};

const normalizeTopics = (topics: Topic[]): Set<string> =>
  new Set(topics.map((topic) => topic.toLowerCase()));

const pushTrack = (tracks: LearningTrack[], track: LearningTrack): void => {
  if (!tracks.includes(track)) tracks.push(track);
};

const getBookForPlacement = (
  level: CEFRLevel,
  topicSet: Set<string>,
  examTarget: OnboardingExamTarget,
): string => {
  if (examTarget !== 'general' || topicSet.has('academic')) {
    return BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE;
  }

  if (topicSet.has('business')) {
    return BUILT_IN_WORD_BOOK_IDS.BUSINESS_ENGLISH;
  }

  if (topicSet.has('technology') || topicSet.has('science')) {
    return BUILT_IN_WORD_BOOK_IDS.TECHNOLOGY_ENGLISH;
  }

  if (topicSet.has('travel') && (level === 'A1' || level === 'A2')) {
    return BUILT_IN_WORD_BOOK_IDS.A2_HIGH_FREQUENCY;
  }

  if (level === 'A1') return BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION;
  if (level === 'A2') return BUILT_IN_WORD_BOOK_IDS.A2_HIGH_FREQUENCY;
  if (level === 'B1') return BUILT_IN_WORD_BOOK_IDS.B1_CORE;

  return BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE;
};

const getLearningPathForPlacement = (
  level: CEFRLevel,
  topicSet: Set<string>,
  examTarget: OnboardingExamTarget,
): string => {
  if (examTarget === 'ielts') return 'ielts-prep';
  if (examTarget === 'toefl' || topicSet.has('academic')) return 'academic-english';
  if (topicSet.has('business')) return 'business-english';
  if (topicSet.has('travel') && (level === 'A1' || level === 'A2')) return 'travel-english';
  if (level === 'B2' || level === 'C1' || level === 'C2') return 'academic-english';
  return 'daily-english';
};

const buildTracks = (topicSet: Set<string>, examTarget: OnboardingExamTarget): LearningTrack[] => {
  const tracks: LearningTrack[] = [];

  if (examTarget !== 'general' || topicSet.has('academic')) {
    pushTrack(tracks, 'exam_boost');
  }
  if (topicSet.has('business') || topicSet.has('technology') || topicSet.has('science')) {
    pushTrack(tracks, 'workplace_english');
  }
  if (topicSet.has('travel')) {
    pushTrack(tracks, 'travel_survival');
  }
  if (
    topicSet.has('daily life') ||
    topicSet.has('food') ||
    topicSet.has('entertainment') ||
    topicSet.has('health') ||
    topicSet.has('sports')
  ) {
    pushTrack(tracks, 'daily_communication');
  }
  if (tracks.length === 0) {
    pushTrack(tracks, 'daily_communication');
  }

  return tracks;
};

const getTarget = (input: OnboardingPlacementInput): string => {
  if (input.examTarget === 'ielts') {
    return input.targetBand || DEFAULT_IELTS_TARGET_BY_LEVEL[input.cefrLevel];
  }
  if (input.examTarget === 'toefl') {
    return input.targetBand || DEFAULT_TOEFL_TARGET_BY_LEVEL[input.cefrLevel];
  }
  return 'general_improvement';
};

const getFirstMission = (
  examTarget: OnboardingExamTarget,
  pathId: string,
  starterBookName: string,
): OnboardingFirstMission => {
  if (examTarget === 'ielts') {
    return {
      title: 'Finish one IELTS writing baseline task',
      titleZh: '完成 1 次 IELTS 写作基线任务',
      route: '/dashboard/exam',
    };
  }

  if (examTarget === 'toefl' || pathId === 'academic-english') {
    return {
      title: 'Complete one academic reading baseline',
      titleZh: '完成 1 次学术阅读基线练习',
      route: '/dashboard/reading',
    };
  }

  if (pathId === 'business-english') {
    return {
      title: 'Learn the first workplace vocabulary set',
      titleZh: '学习第一组职场词汇',
      route: '/dashboard/today',
    };
  }

  return {
    title: `Start today's words from ${starterBookName}`,
    titleZh: `从《${starterBookName}》开始今日单词`,
    route: '/dashboard/today',
  };
};

const buildReasons = (
  input: OnboardingPlacementInput,
  topicSet: Set<string>,
  starterBookName: string,
): OnboardingPlacement['reasons'] => {
  const reasons: OnboardingPlacement['reasons'] = [
    {
      en: `${input.cefrLevel} learners start above the beginner foundation.`,
      zh: `${input.cefrLevel} 学习者会从高于入门基础的内容开始。`,
    },
    {
      en: `${input.dailyMinutes} minutes and ${input.dailyGoal} words keep the plan realistic for daily use.`,
      zh: `${input.dailyMinutes} 分钟、${input.dailyGoal} 个词的节奏更适合每天坚持。`,
    },
  ];

  if (input.examTarget !== 'general') {
    reasons.unshift({
      en: `${input.examTarget.toUpperCase()} goal detected, so the starter book is ${starterBookName}.`,
      zh: `检测到 ${input.examTarget.toUpperCase()} 目标，因此起始词书选择《${starterBookName}》。`,
    });
  } else if (topicSet.has('business')) {
    reasons.unshift({
      en: `Business interest detected, so the starter book is ${starterBookName}.`,
      zh: `检测到商务兴趣，因此起始词书选择《${starterBookName}》。`,
    });
  } else if (topicSet.has('technology') || topicSet.has('science')) {
    reasons.unshift({
      en: `Technology or science interest detected, so the starter book is ${starterBookName}.`,
      zh: `检测到科技/科学兴趣，因此起始词书选择《${starterBookName}》。`,
    });
  }

  if (input.deadline !== 'none' && input.examTarget !== 'general') {
    reasons.push({
      en: 'The exam deadline keeps review and output practice on the main track.',
      zh: '备考截止时间会让复习和输出练习保持在主线里。',
    });
  }

  return reasons;
};

export function buildOnboardingPlacement(input: OnboardingPlacementInput): OnboardingPlacement {
  const topicSet = normalizeTopics(input.preferredTopics);
  const starterBookId = getBookForPlacement(input.cefrLevel, topicSet, input.examTarget);
  const starterBookName = BOOK_NAMES[starterBookId] || 'Starter Vocabulary';
  const learningPathId = getLearningPathForPlacement(input.cefrLevel, topicSet, input.examTarget);
  const learningPathName = PATH_NAMES[learningPathId] || 'Daily English';
  const dailyMinutes = clamp(input.dailyMinutes, 10, 90);
  const firstMission = getFirstMission(input.examTarget, learningPathId, starterBookName);

  return {
    starterBookId,
    starterBookName,
    learningPathId,
    learningPathName,
    firstMission,
    learningProfile: {
      level: input.cefrLevel,
      target: getTarget(input),
      tracks: buildTracks(topicSet, input.examTarget),
      dailyMinutes,
      learningStyle: input.learningStyle,
      languagePreference: 'bilingual',
    },
    reasons: buildReasons({ ...input, dailyMinutes }, topicSet, starterBookName),
  };
}

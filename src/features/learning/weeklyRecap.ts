import type { UserProgress } from '@/data/localStorage';
import type { LearningEventRecord, WeeklyActivityPoint } from '@/services/learningEvents';

export interface WeeklyRecapFocus {
  label: string;
  labelZh: string;
  count: number;
}

export interface WeeklyLearningRecap {
  hasEvidence: boolean;
  wordsStrengthened: number;
  activeDays: number;
  xp: number;
  reviewDebtTrend: {
    label: string;
    labelZh: string;
    count: number;
    direction: 'down' | 'flat' | 'up';
  };
  strongestSkill: WeeklyRecapFocus | null;
  weakestPattern: WeeklyRecapFocus | null;
  highlights: Array<{ en: string; zh: string }>;
  nextRecommendation: { en: string; zh: string; href: string };
}

const wordIdFrom = (event: LearningEventRecord): string => {
  const raw = event.payload?.wordId;
  return typeof raw === 'string' ? raw : '';
};

const isReviewSuccess = (event: LearningEventRecord): boolean => {
  const rating = event.payload?.rating;
  return (
    (event.eventName === 'evidence.review.rated' || event.eventName === 'review.word_rated') &&
    (rating === 'good' || rating === 'easy')
  );
};

const isReviewDebt = (event: LearningEventRecord): boolean => {
  const rating = event.payload?.rating;
  return (
    ((event.eventName === 'evidence.review.rated' || event.eventName === 'review.word_rated') &&
      (rating === 'again' || rating === 'hard')) ||
    ((event.eventName === 'evidence.review.recovery_marked' || event.eventName === 'review.stubborn_recovery') &&
      event.payload?.outcome === 'still_confusing')
  );
};

const isPracticeCorrect = (event: LearningEventRecord): boolean =>
  event.eventName === 'evidence.practice.correct' ||
  (event.eventName === 'practice.quiz_submitted' && event.payload?.isCorrect === true) ||
  (event.eventName === 'practice.listening_submitted' && event.payload?.isCorrect === true);

const isPracticeIncorrect = (event: LearningEventRecord): boolean =>
  event.eventName === 'evidence.practice.incorrect' ||
  (event.eventName === 'practice.quiz_submitted' && event.payload?.isCorrect === false) ||
  (event.eventName === 'practice.listening_submitted' && event.payload?.isCorrect === false);

const isVocabLearned = (event: LearningEventRecord): boolean =>
  event.eventName === 'evidence.vocab.learned' || event.eventName === 'today.word_marked';

const focusMax = (items: WeeklyRecapFocus[]): WeeklyRecapFocus | null =>
  items.filter((item) => item.count > 0).sort((a, b) => b.count - a.count)[0] || null;

export function buildWeeklyLearningRecap(args: {
  events: LearningEventRecord[];
  weeklyActivity: WeeklyActivityPoint[];
  progress: UserProgress[];
}): WeeklyLearningRecap {
  const strengthened = new Set<string>();
  const recentDebt = args.events.filter(isReviewDebt).length;
  const dueNow = args.progress.filter((item) => item.status !== 'mastered' && item.nextReview && item.nextReview <= new Date().toISOString().slice(0, 10)).length;

  args.events.forEach((event) => {
    if (isVocabLearned(event) || isPracticeCorrect(event) || isReviewSuccess(event)) {
      const wordId = wordIdFrom(event);
      if (wordId) strengthened.add(wordId);
    }
  });

  const activeDays = args.weeklyActivity.filter((point) => point.words > 0 || point.events > 0).length;
  const xp = args.weeklyActivity.reduce((sum, point) => sum + point.xp, 0);
  const evidenceCount = args.events.length + args.weeklyActivity.reduce((sum, point) => sum + point.events, 0);
  const hasEvidence = evidenceCount > 0 || args.progress.length > 0;

  const strongestSkill = focusMax([
    { label: 'Vocabulary', labelZh: '词汇', count: args.events.filter(isVocabLearned).length },
    { label: 'Review recall', labelZh: '复习回忆', count: args.events.filter(isReviewSuccess).length },
    { label: 'Practice accuracy', labelZh: '练习准确度', count: args.events.filter(isPracticeCorrect).length },
  ]);

  const weakestPattern = focusMax([
    { label: 'Review debt', labelZh: '复习债', count: recentDebt + dueNow },
    { label: 'Practice misses', labelZh: '练习错题', count: args.events.filter(isPracticeIncorrect).length },
    { label: 'Consistency', labelZh: '学习频率', count: activeDays > 0 && activeDays < 4 ? 4 - activeDays : 0 },
  ]);

  const reviewDebtTrend = {
    count: recentDebt + dueNow,
    direction: recentDebt + dueNow === 0 ? 'down' as const : recentDebt + dueNow <= 3 ? 'flat' as const : 'up' as const,
    label: recentDebt + dueNow === 0 ? 'Review debt is clear' : `${recentDebt + dueNow} review-debt signals`,
    labelZh: recentDebt + dueNow === 0 ? '复习债已清空' : `${recentDebt + dueNow} 个复习债信号`,
  };

  const highlights: WeeklyLearningRecap['highlights'] = [];
  if (strengthened.size > 0) {
    highlights.push({
      en: `${strengthened.size} words were strengthened by real learning evidence.`,
      zh: `${strengthened.size} 个词有真实学习证据支撑。`,
    });
  }
  if (activeDays > 0) {
    highlights.push({
      en: `${activeDays}/7 active days were recorded.`,
      zh: `本周记录到 ${activeDays}/7 个活跃学习日。`,
    });
  }
  if (strongestSkill) {
    highlights.push({
      en: `Strongest signal: ${strongestSkill.label}.`,
      zh: `最强信号：${strongestSkill.labelZh}。`,
    });
  }

  const nextRecommendation =
    !hasEvidence
      ? {
          en: 'Complete one Today task so next week has real evidence to summarize.',
          zh: '先完成一个 Today 任务，这样下周才有真实证据可复盘。',
          href: '/dashboard/today',
        }
      : weakestPattern?.label === 'Review debt'
        ? {
            en: 'Start with Review next week and clear the due queue before adding new words.',
            zh: '下周先从 Review 开始，清掉到期复习再加新词。',
            href: '/dashboard/review',
          }
        : weakestPattern?.label === 'Practice misses'
          ? {
              en: 'Use Practice to turn recurring misses into targeted drills.',
              zh: '用 Practice 把反复错题变成专项训练。',
              href: '/dashboard/practice',
            }
          : {
              en: 'Keep the cadence and add one slightly harder coach drill.',
              zh: '保持节奏，下周加一个略难的 Coach 训练。',
              href: '/dashboard/chat',
            };

  return {
    hasEvidence,
    wordsStrengthened: strengthened.size,
    activeDays,
    xp,
    reviewDebtTrend,
    strongestSkill,
    weakestPattern,
    highlights,
    nextRecommendation,
  };
}

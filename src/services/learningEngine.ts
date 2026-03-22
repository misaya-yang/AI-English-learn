import type { LearningMission, LearningProfile } from '@/types/examContent';
import type { LearnerModel } from '@/services/learnerModel';
import type { LearningEventRecord, WeeklyActivityPoint } from '@/services/learningEvents';
import type {
  ActivitySparkPoint,
  AdaptiveDifficultyState,
  DailyMissionCard,
  LearningOverview,
  NextBestAction,
  WeaknessSnapshot,
} from '@/types/learning';

const weaknessCatalog: Record<string, { title: string; titleZh: string }> = {
  lexical: { title: 'Lexical precision', titleZh: '词汇精度' },
  grammar: { title: 'Grammar control', titleZh: '语法准确度' },
  coherence: { title: 'Coherence', titleZh: '连贯衔接' },
  collocation: { title: 'Collocations', titleZh: '搭配使用' },
  tense: { title: 'Tense control', titleZh: '时态控制' },
  logic: { title: 'Argument logic', titleZh: '论证逻辑' },
  listening_accuracy: { title: 'Listening accuracy', titleZh: '听辨准确度' },
  retention: { title: 'Retention recall', titleZh: '记忆保持' },
  vocabulary_recall: { title: 'Word recall', titleZh: '词义回想' },
  meaning_match: { title: 'Meaning match', titleZh: '词义匹配' },
};

const weakTagToWeakness: Record<string, keyof typeof weaknessCatalog> = {
  review_pressure: 'retention',
  spaced_review: 'retention',
  retrieval_practice: 'vocabulary_recall',
  core_vocabulary: 'lexical',
  ielts_writing: 'coherence',
};

const missionProgress = (mission: LearningMission | null): number => {
  if (!mission || mission.tasks.length === 0) return 0;
  const completed = mission.tasks.filter((task) => task.done).length;
  return Math.round((completed / mission.tasks.length) * 100);
};

const isExamFocused = (profile: LearningProfile, recommendedUnitTitle?: string | null): boolean =>
  profile.target.toLowerCase().includes('ielts') || Boolean(recommendedUnitTitle);

const toWeakness = (tag: string, count: number): WeaknessSnapshot => {
  const catalog = weaknessCatalog[tag] || { title: tag, titleZh: tag };
  return {
    tag,
    title: catalog.title,
    titleZh: catalog.titleZh,
    count,
    emphasis: count >= 5 ? 'urgent' : count >= 3 ? 'watch' : 'stable',
  };
};

export const deriveWeaknessesFromEvents = (events: LearningEventRecord[]): WeaknessSnapshot[] => {
  const scores = new Map<string, number>();

  events.slice(0, 120).forEach((event) => {
    switch (event.eventName) {
      case 'practice.writing_submitted': {
        const issues = event.payload.issues;
        if (Array.isArray(issues)) {
          issues.forEach((issue) => {
            if (typeof issue === 'string') {
              scores.set(issue, (scores.get(issue) || 0) + 2);
            }
          });
        }
        break;
      }
      case 'review.word_rated': {
        const rating = event.payload.rating;
        if (rating === 'again') {
          scores.set('retention', (scores.get('retention') || 0) + 2);
        } else if (rating === 'hard') {
          scores.set('retention', (scores.get('retention') || 0) + 1);
        }
        break;
      }
      case 'today.word_marked': {
        if (event.payload.status === 'hard') {
          scores.set('vocabulary_recall', (scores.get('vocabulary_recall') || 0) + 1);
        }
        break;
      }
      case 'practice.quiz_submitted': {
        if (!event.payload.isCorrect) {
          scores.set('meaning_match', (scores.get('meaning_match') || 0) + 1);
        }
        break;
      }
      case 'practice.listening_submitted': {
        if (!event.payload.isCorrect) {
          scores.set('listening_accuracy', (scores.get('listening_accuracy') || 0) + 1);
        }
        break;
      }
      case 'chat.quiz_attempted': {
        if (event.payload.isCorrect === false) {
          scores.set('meaning_match', (scores.get('meaning_match') || 0) + 1);
        }
        break;
      }
      case 'chat.message_sent': {
        const weakTags = event.payload.weakTags;
        if (Array.isArray(weakTags)) {
          weakTags.forEach((tag) => {
            if (typeof tag !== 'string') return;
            const normalized = weakTagToWeakness[tag];
            if (!normalized) return;
            scores.set(normalized, (scores.get(normalized) || 0) + 1);
          });
        }
        break;
      }
      default:
        break;
    }
  });

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => toWeakness(tag, count));
};

const buildAction = (action: Omit<NextBestAction, 'reason'> & { reason?: string }): NextBestAction => ({
  reason: action.reason || '',
  ...action,
});

export const buildMissionCard = (args: {
  mission: LearningMission | null;
  profile: LearningProfile;
  dueWordsCount: number;
  dailyWordsCount: number;
  learnedTodayCount: number;
  recommendedUnitTitle?: string | null;
  activeBookName?: string | null;
  weaknesses: WeaknessSnapshot[];
  learnerModel?: LearnerModel | null;
}): DailyMissionCard => {
  const completionPct = missionProgress(args.mission);
  const burnoutRisk = args.learnerModel?.burnoutRisk ?? 0;
  const hasReviewPressure = args.dueWordsCount >= 5 || (args.learnerModel?.dueCount ?? 0) >= 8;
  const hasDailyWordsLeft = args.learnedTodayCount < args.dailyWordsCount;
  const topWeakness = args.weaknesses[0] ?? null;
  const examFocused = isExamFocused(args.profile, args.recommendedUnitTitle);
  const recoveryMode = args.learnerModel?.mode === 'recovery' || burnoutRisk >= 0.75;
  const sprintMode = args.learnerModel?.mode === 'sprint';
  const stretchMode = args.learnerModel?.mode === 'stretch';
  const reviewTarget = args.learnerModel?.recommendedDailyReview ?? args.dueWordsCount;
  const vocabTarget = args.learnerModel?.recommendedDailyNew ?? args.dailyWordsCount;

  const primaryAction = recoveryMode
    ? buildAction({
        id: 'primary-recovery-review',
        surface: 'review',
        title: 'Reduce pressure with a lighter review block',
        titleZh: '先用一轮轻量复习把压力降下来',
        description: `${reviewTarget} due cards are stacking up. Clear the queue first, then add new words if energy remains.`,
        descriptionZh: `当前复习积压约 ${reviewTarget} 张，先把旧账压下去，再决定要不要加新词更稳。`,
        cta: 'Open review',
        ctaZh: '去做复习',
        href: '/dashboard/review',
        estimatedMinutes: Math.max(8, Math.min(18, reviewTarget)),
        priority: 'high',
        reason: 'recovery_mode',
      })
    : examFocused && (sprintMode || topWeakness?.emphasis === 'urgent')
      ? buildAction({
          id: 'primary-exam-boost',
          surface: 'exam',
          title: args.recommendedUnitTitle ? `Boost your score with ${args.recommendedUnitTitle}` : 'Use the writing coach for your next score boost',
          titleZh: args.recommendedUnitTitle ? `先用《${args.recommendedUnitTitle}》做一次提分训练` : '先用写作教练完成一次提分训练',
          description: topWeakness
            ? `Your next band gain is most likely to come from fixing ${topWeakness.title.toLowerCase()}.`
            : 'A structured IELTS-style writing drill is the fastest path to your next score gain.',
          descriptionZh: topWeakness
            ? `你下一步最可能提分的突破口，是先修正${topWeakness.titleZh}。`
            : '当前最值得做的是一次结构化 IELTS 写作提分练习。',
          cta: 'Open exam prep',
          ctaZh: '前往考试冲分',
          href: '/dashboard/exam',
          estimatedMinutes: 18,
          priority: 'high',
          reason: 'exam_boost',
        })
      : hasReviewPressure
    ? buildAction({
        id: 'primary-review',
        surface: 'review',
        title: 'Clear your due reviews',
        titleZh: '优先清空到期复习',
        description: `${reviewTarget} cards are waiting and will keep compounding if skipped.`,
        descriptionZh: `当前有约 ${reviewTarget} 个到期卡片，继续拖延会让负担继续上升。`,
        cta: 'Start review',
        ctaZh: '开始复习',
        href: '/dashboard/review',
        estimatedMinutes: Math.max(6, Math.min(18, reviewTarget)),
        priority: 'high',
        reason: 'due_words',
      })
    : hasDailyWordsLeft && !stretchMode
      ? buildAction({
          id: 'primary-today',
          surface: 'today',
          title: 'Finish today\'s new words',
          titleZh: '完成今日新词任务',
          description: `${Math.max(vocabTarget - args.learnedTodayCount, 0)} words are still pending in ${args.activeBookName || 'your active book'}.`,
          descriptionZh: `当前词书${args.activeBookName ? `《${args.activeBookName}》` : ''}里还有 ${Math.max(vocabTarget - args.learnedTodayCount, 0)} 个建议新词待推进。`,
          cta: 'Continue today',
          ctaZh: '继续今日任务',
          href: '/dashboard/today',
          estimatedMinutes: Math.max(8, Math.min(20, vocabTarget * 2)),
          priority: 'high',
          reason: 'today_words',
        })
      : topWeakness
        ? buildAction({
            id: 'primary-weakness-drill',
            surface: topWeakness.tag === 'coherence' || topWeakness.tag === 'grammar' || topWeakness.tag === 'logic' || topWeakness.tag === 'collocation' || topWeakness.tag === 'tense'
              ? examFocused
                ? 'exam'
                : 'chat'
              : topWeakness.tag === 'listening_accuracy'
                ? 'practice'
                : 'practice',
            title: `Turn ${topWeakness.title.toLowerCase()} into a focused drill`,
            titleZh: `把${topWeakness.titleZh}直接转成一次针对练习`,
            description: `Your recent mistakes are clustering around ${topWeakness.title.toLowerCase()}. Train it while the signal is still fresh.`,
            descriptionZh: `你最近的错误正在集中到${topWeakness.titleZh}，现在立刻针对练最有效。`,
            cta: examFocused && (topWeakness.tag === 'coherence' || topWeakness.tag === 'grammar' || topWeakness.tag === 'logic' || topWeakness.tag === 'collocation' || topWeakness.tag === 'tense')
              ? 'Open exam prep'
              : topWeakness.tag === 'listening_accuracy'
                ? 'Open practice'
                : 'Open drill',
            ctaZh: examFocused && (topWeakness.tag === 'coherence' || topWeakness.tag === 'grammar' || topWeakness.tag === 'logic' || topWeakness.tag === 'collocation' || topWeakness.tag === 'tense')
              ? '前往考试冲分'
              : topWeakness.tag === 'listening_accuracy'
                ? '打开练习'
                : '开始针对练习',
            href:
              examFocused && (topWeakness.tag === 'coherence' || topWeakness.tag === 'grammar' || topWeakness.tag === 'logic' || topWeakness.tag === 'collocation' || topWeakness.tag === 'tense')
                ? '/dashboard/exam'
                : topWeakness.tag === 'listening_accuracy'
                  ? '/dashboard/practice'
                  : '/dashboard/chat',
            estimatedMinutes: 12,
            priority: 'high',
            reason: 'weakness_drill',
          })
      : buildAction({
          id: 'primary-practice',
          surface: 'practice',
          title: 'Turn weak spots into a short drill',
          titleZh: '把薄弱点转成一次短练习',
          description: args.weaknesses[0]
            ? `Your recent errors cluster around ${args.weaknesses[0].title.toLowerCase()}.`
            : 'You have space to consolidate with a quick mixed practice run.',
          descriptionZh: args.weaknesses[0]
            ? `你最近的错误主要集中在${args.weaknesses[0].titleZh}。`
            : '当前适合做一次混合短练习，把今天学过的内容固化下来。',
          cta: 'Open practice',
          ctaZh: '打开练习',
          href: '/dashboard/practice',
          estimatedMinutes: 12,
          priority: 'high',
          reason: 'practice_gap',
        });

  const secondaryActions: NextBestAction[] = [
    buildAction({
      id: 'secondary-coach',
      surface: 'chat',
      title: 'Ask the coach for a guided session',
      titleZh: '让 AI 家教带你走一轮引导学习',
      description: 'Use AI tutor mode for explanation, collocations, or a short adaptive quiz.',
      descriptionZh: '用 AI 家教模式做解释、搭配练习或一轮短测。',
      cta: 'Open coach',
      ctaZh: '打开家教',
      href: '/dashboard/chat',
      estimatedMinutes: 10,
      priority: 'medium',
      reason: 'coach_support',
    }),
    buildAction({
      id: 'secondary-exam',
      surface: 'exam',
      title: args.recommendedUnitTitle ? `Practice ${args.recommendedUnitTitle}` : 'Open score-boost writing coach',
      titleZh: args.recommendedUnitTitle ? `练习微课：${args.recommendedUnitTitle}` : '打开考试冲分写作教练',
      description: 'Structured IELTS-style writing feedback is best for logic, cohesion, and lexical upgrades.',
      descriptionZh: '如果你要补逻辑、衔接和词汇升级，结构化写作反馈最有效。',
      cta: 'Go to exam prep',
      ctaZh: '前往考试冲分',
      href: '/dashboard/exam',
      estimatedMinutes: 18,
      priority: 'medium',
      reason: 'exam_boost',
    }),
    buildAction({
      id: 'secondary-vocab',
      surface: 'vocabulary',
      title: 'Tune your active word book',
      titleZh: '调整当前词书和词源',
      description: 'Switch books, import a deck, or search vocabulary tied to your weak areas.',
      descriptionZh: '切换词书、导入 deck，或搜索与你薄弱点相关的词汇。',
      cta: 'Manage vocabulary',
      ctaZh: '管理词书',
      href: '/dashboard/vocabulary',
      estimatedMinutes: 6,
      priority: 'low',
      reason: 'vocab_management',
    }),
  ];

  return {
    headline: primaryAction.title,
    headlineZh: primaryAction.titleZh,
    support: primaryAction.description,
    supportZh: primaryAction.descriptionZh,
    completionPct,
    estimatedMinutes: args.mission?.estimatedMinutes || args.profile.dailyMinutes,
    primaryAction,
    secondaryActions,
  };
};

export const buildAdaptiveDifficultyState = (args: {
  weaknesses: WeaknessSnapshot[];
  recentActivity: WeeklyActivityPoint[];
  dueWordsCount: number;
  learnerModel?: LearnerModel | null;
}): AdaptiveDifficultyState => {
  const activeDays = args.recentActivity.filter((point) => point.events > 0 || point.words > 0).length;
  const highWeakness = args.weaknesses[0]?.count || 0;
  const burnoutRisk = args.learnerModel?.burnoutRisk ?? 0;

  if (args.learnerModel?.mode === 'recovery' || burnoutRisk >= 0.75 || args.dueWordsCount >= 8 || highWeakness >= 5) {
    return {
      level: 'recover',
      label: 'Recover',
      labelZh: '回稳期',
      reason: 'Recent review pressure is high. Keep today short, clear the queue, and avoid overload.',
    };
  }

  if (args.learnerModel?.mode === 'stretch' || args.learnerModel?.mode === 'sprint' || (activeDays >= 5 && highWeakness <= 2)) {
    return {
      level: 'stretch',
      label: 'Stretch',
      labelZh: '拉伸期',
      reason: args.learnerModel?.mode === 'sprint'
        ? 'Momentum is strong. Push your weakest exam-facing skills while the streak is stable.'
        : 'Consistency is stable. You can handle a harder practice set or writing task.',
    };
  }

  return {
    level: 'steady',
    label: 'Steady',
    labelZh: '稳步期',
    reason: 'Build depth with a balanced mix of new words, review, and one targeted practice.',
  };
};

export const buildActivitySpark = (points: WeeklyActivityPoint[]): ActivitySparkPoint[] =>
  points.map((point) => ({
    date: point.date,
    label: point.day,
    words: point.words,
    xp: point.xp,
    active: point.words > 0 || point.events > 0,
  }));

export const buildLearningOverview = (args: {
  mission: LearningMission | null;
  profile: LearningProfile;
  dueWordsCount: number;
  dailyWordsCount: number;
  learnedTodayCount: number;
  recommendedUnitTitle?: string | null;
  activeBookName?: string | null;
  learnerModel?: LearnerModel | null;
  events: LearningEventRecord[];
  weeklyActivity: WeeklyActivityPoint[];
}): LearningOverview => {
  const weaknesses = deriveWeaknessesFromEvents(args.events);
  return {
    missionCard: buildMissionCard({
      mission: args.mission,
      profile: args.profile,
      dueWordsCount: args.dueWordsCount,
      dailyWordsCount: args.dailyWordsCount,
      learnedTodayCount: args.learnedTodayCount,
      recommendedUnitTitle: args.recommendedUnitTitle,
      activeBookName: args.activeBookName,
      weaknesses,
      learnerModel: args.learnerModel,
    }),
    weaknesses,
    adaptiveDifficulty: buildAdaptiveDifficultyState({
      weaknesses,
      recentActivity: args.weeklyActivity,
      dueWordsCount: args.dueWordsCount,
      learnerModel: args.learnerModel,
    }),
    activity: buildActivitySpark(args.weeklyActivity),
  };
};

// End-of-session recap derivation.
//
// After Review or Practice completes we want the learner to see:
//   1. What improved this session (specific + countable).
//   2. What still needs another touch (specific + countable).
//   3. One precise piece of encouragement (no empty praise, it has to
//      reference the actual session).
//   4. The single best next step, with a deep link.
//
// Pure helper so the surface stays mode-agnostic (Review and Practice
// both consume it) and unit-tested independently of React.

export type SessionKind = 'review' | 'practice';

export interface ReviewSessionStats {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export interface PracticeSessionStats {
  total: number;
  /** Legacy aggregate. Prefer firstTryCorrect + recovered for new callers. */
  correct?: number;
  /** Legacy aggregate. Prefer needsReview for new callers. */
  incorrect?: number;
  firstTryCorrect?: number;
  recovered?: number;
  needsReview?: number;
}

export interface CoachReviewSummary {
  dueCount: number;
  /** Skill labels ('grammar', 'vocab', ...) deduped, optional. */
  topSkills?: string[];
}

interface BaseRecapInput {
  language?: string;
  /** Optional weak-tag the AI coach has flagged for the learner. */
  topWeakness?: string;
  /** Active exam target — when present, the next-action prefers exam prep. */
  examType?: string | null;
  coachReviews?: CoachReviewSummary;
}

export type SessionRecapInput =
  | (BaseRecapInput & { kind: 'review'; stats: ReviewSessionStats })
  | (BaseRecapInput & { kind: 'practice'; stats: PracticeSessionStats });

export interface SessionRecapHighlight {
  label: { en: string; zh: string };
  count: number;
}

export interface SessionRecapAction {
  ctaEn: string;
  ctaZh: string;
  href: string;
  reason: { en: string; zh: string };
}

export interface SessionRecap {
  kind: SessionKind;
  improved: SessionRecapHighlight | null;
  needsReview: SessionRecapHighlight | null;
  encouragement: { en: string; zh: string };
  nextAction: SessionRecapAction;
}

const isZh = (lang?: string): boolean => Boolean(lang && lang.startsWith('zh'));
void isZh; // helper retained for future use

const reviewImprovedCount = (stats: ReviewSessionStats): number => stats.good + stats.easy;
const reviewStruggleCount = (stats: ReviewSessionStats): number => stats.again + stats.hard;
const reviewTotal = (stats: ReviewSessionStats): number =>
  stats.again + stats.hard + stats.good + stats.easy;

const buildReviewRecap = (
  stats: ReviewSessionStats,
  args: BaseRecapInput,
): SessionRecap => {
  const improvedCount = reviewImprovedCount(stats);
  const struggleCount = reviewStruggleCount(stats);
  const total = reviewTotal(stats);
  const accuracy = total > 0 ? improvedCount / total : 0;

  const improved: SessionRecapHighlight | null = improvedCount > 0
    ? {
        label: {
          en: `${improvedCount} card${improvedCount > 1 ? 's' : ''} moved to Good or Easy`,
          zh: `${improvedCount} 张卡评为 Good / Easy`,
        },
        count: improvedCount,
      }
    : null;

  const needsReview: SessionRecapHighlight | null = struggleCount > 0
    ? {
        label: {
          en: `${struggleCount} card${struggleCount > 1 ? 's' : ''} need another pass (Again / Hard)`,
          zh: `${struggleCount} 张卡仍需再练（Again / Hard）`,
        },
        count: struggleCount,
      }
    : null;

  // Encouragement is concrete — references the count, not "great job".
  const encouragement: SessionRecap['encouragement'] = total === 0
    ? {
        en: 'No cards reviewed this round. Your memory curve says nothing was due.',
        zh: '本轮没有需要复习的卡片，记忆曲线说今天不用再回头看。',
      }
    : accuracy >= 0.8
      ? {
          en: `${improvedCount}/${total} cards landed Good or Easy. That is a strong retention session.`,
          zh: `${improvedCount}/${total} 张评为 Good 或 Easy，这一轮记忆稳定度很好。`,
        }
      : accuracy >= 0.5
        ? {
            en: `Solid run: ${improvedCount}/${total} held up. The ${struggleCount} that wobbled will be re-queued sooner.`,
            zh: `这一轮不错：${improvedCount}/${total} 通过，${struggleCount} 张较吃力的会被更早安排再练。`,
          }
        : {
            en: `Hard set today (${improvedCount}/${total} confident). FSRS will tighten the interval on the rest, which is exactly what should happen.`,
            zh: `今天的卡偏难（${improvedCount}/${total} 稳）。剩下的会被 FSRS 缩短间隔，正是该有的处理。`,
          };

  // Next action: when scheduled reviews are due, send them there. Otherwise
  // route to Practice so the struggling cards get reinforced; with zero
  // touched cards, route back to Today.
  const coachDue = args.coachReviews?.dueCount ?? 0;
  if (coachDue > 0) {
    return {
      kind: 'review',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: `Review ${coachDue} scheduled item${coachDue > 1 ? 's' : ''}`,
        ctaZh: `处理 ${coachDue} 个复习项`,
        href: '/dashboard/review',
        reason: {
          en: `Your last chat scheduled ${coachDue} item${coachDue > 1 ? 's' : ''} for review. Clear them while the context is fresh.`,
          zh: `上次对话留下了 ${coachDue} 个复习项，趁上下文还在先做掉。`,
        },
      },
    };
  }

  if (total === 0) {
    return {
      kind: 'review',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: 'Back to Today',
        ctaZh: '返回今日',
        href: '/dashboard/today',
        reason: {
          en: 'No FSRS reviews are due. Continue with today\'s list.',
          zh: '当前没有到期复习，继续今天的内容即可。',
        },
      },
    };
  }

  if (struggleCount > 0) {
    return {
      kind: 'review',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: 'Reinforce in Practice',
        ctaZh: '去练习巩固',
        href: '/dashboard/practice',
        reason: {
          en: `Practice the ${struggleCount} struggling card${struggleCount > 1 ? 's' : ''} in context so they stick.`,
          zh: `把 ${struggleCount} 张吃力的卡放到语境里再练一次，更容易记住。`,
        },
      },
    };
  }

  if ((args.examType || '').toLowerCase().includes('ielts')) {
    return {
      kind: 'review',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: 'Run an IELTS writing round',
        ctaZh: '做一次雅思写作练习',
        href: '/dashboard/exam',
        reason: {
          en: 'Retention is high. Convert it into a writing sprint while you\'re warm.',
          zh: '记忆状态稳定，适合接一组写作练习。',
        },
      },
    };
  }

  return {
    kind: 'review',
    improved,
    needsReview,
    encouragement,
    nextAction: {
      ctaEn: 'Open Practice',
      ctaZh: '打开 Practice',
        href: '/dashboard/practice',
        reason: {
          en: 'Lock in the gains with a short mixed practice run.',
          zh: '用一组混合短练习收尾。',
        },
      },
  };
};

const buildPracticeRecap = (
  stats: PracticeSessionStats,
  args: BaseRecapInput,
): SessionRecap => {
  const firstTryCorrect = Math.max(0, stats.firstTryCorrect ?? stats.correct ?? 0);
  const recovered = Math.max(0, stats.recovered ?? 0);
  const needsReviewCount = Math.max(0, stats.needsReview ?? stats.incorrect ?? 0);
  const improvedCount = firstTryCorrect + recovered;
  const total = Math.max(0, stats.total);
  const firstTryAccuracy = total > 0 ? firstTryCorrect / total : 0;

  const improved: SessionRecapHighlight | null = improvedCount > 0
    ? {
        label: {
          en: recovered > 0
            ? `${firstTryCorrect} first-try correct · ${recovered} recovered`
            : `${firstTryCorrect} first-try correct`,
          zh: recovered > 0
            ? `首答正确 ${firstTryCorrect} 题 · 重试修正 ${recovered} 题`
            : `首答正确 ${firstTryCorrect} 题`,
        },
        count: improvedCount,
      }
    : null;

  const needsReview: SessionRecapHighlight | null = needsReviewCount > 0
    ? {
        label: {
          en: `${needsReviewCount} item${needsReviewCount > 1 ? 's' : ''} need another pass`,
          zh: `${needsReviewCount} 题需要再复习`,
        },
        count: needsReviewCount,
      }
    : null;

  const encouragement: SessionRecap['encouragement'] = total === 0
    ? {
        en: 'No questions answered. Start a short drill to create a baseline.',
        zh: '本次没有作答记录，先做个短练习建立基线。',
      }
    : firstTryAccuracy >= 0.8
      ? {
          en: `${firstTryCorrect}/${total} first-try correct. Retrieval is stable; move to harder prompts next.`,
          zh: `${firstTryCorrect}/${total} 首答正确，检索稳定，下一轮可以加难度。`,
        }
      : firstTryAccuracy >= 0.5
        ? {
            en: `First try: ${firstTryCorrect}/${total}. ${recovered} recovered after a retry; ${needsReviewCount} need review.`,
            zh: `首答 ${firstTryCorrect}/${total}。重试修正 ${recovered} 题，${needsReviewCount} 题需要复习。`,
          }
        : {
            en: `Tough drill (${firstTryCorrect}/${total} first-try correct). Keep the review queue tight and retry the weak items.`,
            zh: `这一轮偏难（${firstTryCorrect}/${total} 首答正确）。先把需要复习的题补掉。`,
          };

  const coachDue = args.coachReviews?.dueCount ?? 0;
  if (coachDue > 0) {
    return {
      kind: 'practice',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: `Open ${coachDue} scheduled review${coachDue > 1 ? 's' : ''}`,
        ctaZh: `处理 ${coachDue} 个复习项`,
        href: '/dashboard/review',
        reason: {
          en: 'Your last chat scheduled review work. Clear it while the context is fresh.',
          zh: '上次对话留下了复习项，趁上下文还在先做掉。',
        },
      },
    };
  }

  if (needsReviewCount > 0) {
    return {
      kind: 'practice',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: 'Review the mistake',
        ctaZh: '查看错题',
        href: '/dashboard/chat',
        reason: {
          en: `${needsReviewCount} item${needsReviewCount > 1 ? 's are' : ' is'} fresh. Review while the details are still clear.`,
          zh: `${needsReviewCount} 题刚暴露，现在处理最省力。`,
        },
      },
    };
  }

  if ((args.examType || '').toLowerCase().includes('ielts')) {
    return {
      kind: 'practice',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: 'Move into IELTS prep',
        ctaZh: '进入雅思准备',
        href: '/dashboard/exam',
        reason: {
          en: 'Retrieval is sharp. Push it into a structured exam-prep round.',
          zh: '检索状态好，转入结构化的考试训练最划算。',
        },
      },
    };
  }

  return {
    kind: 'practice',
    improved,
    needsReview,
    encouragement,
    nextAction: {
      ctaEn: 'Back to Today',
      ctaZh: '返回今日',
      href: '/dashboard/today',
      reason: {
        en: 'Session is clean. Continue with today\'s list.',
        zh: '本轮稳定，继续今天的内容即可。',
      },
    },
  };
};

export function buildSessionRecap(input: SessionRecapInput): SessionRecap {
  if (input.kind === 'review') {
    return buildReviewRecap(input.stats, input);
  }
  return buildPracticeRecap(input.stats, input);
}

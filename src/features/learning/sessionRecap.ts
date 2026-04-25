// sessionRecap.ts — end-of-session recap derivation.
//
// After Review or Practice completes we want the learner to see:
//   1. What improved this session (specific + countable).
//   2. What still needs another touch (specific + countable).
//   3. One precise piece of encouragement (no empty praise — has to
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
  correct: number;
  incorrect: number;
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
        en: 'No cards reviewed this round — your memory curve says nothing was due.',
        zh: '本轮没有需要复习的卡片，记忆曲线说今天不用再回头看。',
      }
    : accuracy >= 0.8
      ? {
          en: `${improvedCount}/${total} cards landed Good or Easy — that is a strong retention session.`,
          zh: `${improvedCount}/${total} 张评为 Good 或 Easy，这一轮记忆稳定度很好。`,
        }
      : accuracy >= 0.5
        ? {
            en: `Solid run: ${improvedCount}/${total} held up. The ${struggleCount} that wobbled will be re-queued sooner.`,
            zh: `节奏稳：${improvedCount}/${total} 通过，${struggleCount} 张较吃力的会被更早安排再练。`,
          }
        : {
            en: `Hard set today (${improvedCount}/${total} confident). FSRS will tighten the interval on the rest — that is exactly what should happen.`,
            zh: `今天的卡偏难（${improvedCount}/${total} 稳）。剩下的会被 FSRS 缩短间隔，正是该有的处理。`,
          };

  // Next action: when coach reviews are due, send them there. Otherwise
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
        ctaEn: `Tackle ${coachDue} coach review${coachDue > 1 ? 's' : ''}`,
        ctaZh: `处理 ${coachDue} 个教练复习`,
        href: '/dashboard/review',
        reason: {
          en: `The AI coach scheduled ${coachDue} item${coachDue > 1 ? 's' : ''} from your last chat — clear them while the context is fresh.`,
          zh: `教练上次对话给你安排了 ${coachDue} 个复习项，趁上下文还在先把它们做掉。`,
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
        ctaZh: '回到 Today',
        href: '/dashboard/today',
        reason: {
          en: 'No FSRS reviews are due — keep the momentum on today\'s mission.',
          zh: '当前没有到期复习，继续推进今日任务即可。',
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
        ctaZh: '到 Practice 巩固',
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
        ctaEn: 'Run an IELTS Task 2 sprint',
        ctaZh: '做一次雅思 Task 2 冲刺',
        href: '/dashboard/exam',
        reason: {
          en: 'Retention is high — convert it into a writing sprint while you\'re warm.',
          zh: '记忆稳定，趁状态做一次写作冲刺最划算。',
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
        zh: '用一组短练习把今天的提升固化下来。',
      },
    },
  };
};

const buildPracticeRecap = (
  stats: PracticeSessionStats,
  args: BaseRecapInput,
): SessionRecap => {
  const correct = Math.max(0, stats.correct);
  const incorrect = Math.max(0, stats.incorrect);
  const total = Math.max(0, stats.total);
  const accuracy = total > 0 ? correct / total : 0;

  const improved: SessionRecapHighlight | null = correct > 0
    ? {
        label: {
          en: `${correct} answer${correct > 1 ? 's' : ''} correct`,
          zh: `答对 ${correct} 题`,
        },
        count: correct,
      }
    : null;

  const needsReview: SessionRecapHighlight | null = incorrect > 0
    ? {
        label: {
          en: `${incorrect} mistake${incorrect > 1 ? 's' : ''} captured for review`,
          zh: `${incorrect} 道错题已加入复习`,
        },
        count: incorrect,
      }
    : null;

  const encouragement: SessionRecap['encouragement'] = total === 0
    ? {
        en: 'No questions answered — start a short drill to feed the coach context.',
        zh: '本次没有作答记录——开个短练习给教练一些可参考的信号。',
      }
    : accuracy >= 0.8
      ? {
          en: `${correct}/${total} correct — that is a tight retrieval session, push for harder content next.`,
          zh: `${correct}/${total} 正确，检索很扎实，下一轮可以挑战更难的内容。`,
        }
      : accuracy >= 0.5
        ? {
            en: `Steady run: ${correct}/${total}. The ${incorrect} mistakes are queued for the coach to revisit.`,
            zh: `节奏稳：${correct}/${total}。${incorrect} 道错题已经进入教练的复习队列。`,
          }
        : {
            en: `Tough drill (${correct}/${total}). The mistakes will surface sooner in review — exactly what should happen.`,
            zh: `这一轮偏难（${correct}/${total}）。这些错题会更早出现在复习里，正是该有的处理。`,
          };

  const coachDue = args.coachReviews?.dueCount ?? 0;
  if (coachDue > 0) {
    return {
      kind: 'practice',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: `Open ${coachDue} coach review${coachDue > 1 ? 's' : ''}`,
        ctaZh: `处理 ${coachDue} 个教练复习`,
        href: '/dashboard/review',
        reason: {
          en: 'The coach has scheduled work from your last chat — clear it while the context is fresh.',
          zh: '教练已经在上次对话里给你安排了复习，趁上下文还在先把它们做掉。',
        },
      },
    };
  }

  if (incorrect > 0) {
    return {
      kind: 'practice',
      improved,
      needsReview,
      encouragement,
      nextAction: {
        ctaEn: 'Talk it through with the coach',
        ctaZh: '让教练带你复盘错题',
        href: '/dashboard/chat',
        reason: {
          en: `${incorrect} mistake${incorrect > 1 ? 's are' : ' is'} fresh — let the coach run a Socratic recovery on them.`,
          zh: `${incorrect} 道错题刚记下，让教练用 Socratic 方式带你复盘最有效。`,
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
          en: 'Retrieval is sharp — push it into a structured exam-prep round.',
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
      ctaZh: '回到 Today',
      href: '/dashboard/today',
      reason: {
        en: 'Session is clean — keep the momentum on today\'s mission.',
        zh: '本轮稳定，继续推进今日任务即可。',
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

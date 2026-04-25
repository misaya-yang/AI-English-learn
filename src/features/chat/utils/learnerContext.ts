import type {
  BurnoutRisk,
  CoachRecentError,
  CoachingErrorType,
  LearnerContext,
} from '@/features/coach/coachingPolicy';
import type { LearnerModel } from '@/services/learnerModel';
import type { MistakeEntry } from '@/services/mistakeCollector';
import type { LearningMission, LearningProfile, LearningTrack } from '@/types/examContent';

interface BuildChatLearnerContextArgs {
  learningProfile: LearningProfile;
  activeBookName?: string | null;
  dueCount: number;
  dailyMission?: LearningMission | null;
}

const TRACK_LABELS: Record<LearningTrack, string> = {
  daily_communication: 'daily communication',
  workplace_english: 'workplace English',
  travel_survival: 'travel English',
  exam_boost: 'exam boost',
};

const taskToWeakTag = (taskType: LearningMission['tasks'][number]['type']): string => {
  switch (taskType) {
    case 'writing':
      return 'writing_feedback';
    case 'quiz':
      return 'retrieval_practice';
    case 'review':
      return 'spaced_review';
    case 'vocabulary':
    default:
      return 'core_vocabulary';
  }
};

export const deriveChatWeakTags = ({
  learningProfile,
  activeBookName,
  dueCount,
  dailyMission,
}: BuildChatLearnerContextArgs): string[] => {
  const tags = new Set<string>();

  learningProfile.tracks.forEach((track) => {
    if (track === 'exam_boost') {
      tags.add('ielts_exam_boost');
    } else {
      tags.add(TRACK_LABELS[track].replace(/\s+/g, '_'));
    }
  });

  if (dueCount >= 6) {
    tags.add('review_pressure');
  }

  if (activeBookName) {
    tags.add('book_active');
  }

  const incompleteTasks = dailyMission?.tasks.filter((task) => !task.done) || [];
  incompleteTasks.slice(0, 2).forEach((task) => {
    tags.add(taskToWeakTag(task.type));
  });

  if (learningProfile.target.toLowerCase().includes('ielts')) {
    tags.add('ielts_writing');
  }

  return Array.from(tags).slice(0, 6);
};

export const buildChatGoalContext = ({
  learningProfile,
  activeBookName,
  dueCount,
  dailyMission,
}: BuildChatLearnerContextArgs): string => {
  const trackSummary = learningProfile.tracks.length > 0
    ? learningProfile.tracks.map((track) => TRACK_LABELS[track]).join(', ')
    : 'general English';
  const nextTask = dailyMission?.tasks.find((task) => !task.done);
  const parts = [
    `Learner level: ${learningProfile.level}.`,
    `Primary goal: ${learningProfile.target || 'Improve practical English'}.`,
    `Active learning tracks: ${trackSummary}.`,
    `Daily study time target: ${learningProfile.dailyMinutes} minutes.`,
    `Preferred explanation language: ${learningProfile.languagePreference}.`,
  ];

  if (activeBookName) {
    parts.push(`Active vocabulary book: ${activeBookName}.`);
  }

  if (dueCount > 0) {
    parts.push(`Current review pressure: ${dueCount} due review items.`);
  }

  if (nextTask) {
    parts.push(`Best next action from today's mission: ${nextTask.title}.`);
  }

  return parts.join(' ');
};

// ── Learner profile snapshot for the COACHING_POLICY ────────────────────────

interface BuildChatLearnerProfileArgs {
  learningProfile: LearningProfile;
  weakTags?: string[];
  learnerModel?: LearnerModel | null;
  recentMistakes?: MistakeEntry[];
}

const COACHING_ERROR_TYPES: readonly CoachingErrorType[] = [
  'grammar',
  'vocab',
  'pragmatic',
  'logic',
  'pronunciation',
  'listening',
];

// Free-form mistake.category values (e.g. "Grammar", "articles", "Vocabulary",
// "Pronunciation Drill") get bucketed into the canonical error-type set the
// coaching policy understands. Unknown categories fall back to undefined so
// the recent-error entry can still surface the offending word without a
// misleading skill tag.
export function mapMistakeCategoryToErrorType(
  category: string,
): CoachingErrorType | undefined {
  if (typeof category !== 'string') return undefined;
  const normalized = category.trim().toLowerCase();
  if (!normalized) return undefined;

  if (COACHING_ERROR_TYPES.includes(normalized as CoachingErrorType)) {
    return normalized as CoachingErrorType;
  }

  if (/(grammar|tense|article|preposition|conditional|passive|modal|clause|agreement|conjunction)/.test(normalized)) {
    return 'grammar';
  }
  if (/(vocab|word|meaning|definition|collocation|synonym|antonym)/.test(normalized)) {
    return 'vocab';
  }
  if (/(pronunc|phonetic|accent|stress|intonation)/.test(normalized)) {
    return 'pronunciation';
  }
  if (/(listen|dictation|hearing|audio)/.test(normalized)) {
    return 'listening';
  }
  if (/(logic|reason|argument|cohesion|coherence|structure)/.test(normalized)) {
    return 'logic';
  }
  if (/(pragmatic|register|tone|formal|polite|culture|context)/.test(normalized)) {
    return 'pragmatic';
  }
  return undefined;
}

export function mapBurnoutBucket(score: number | undefined): BurnoutRisk | undefined {
  if (typeof score !== 'number' || !Number.isFinite(score)) return undefined;
  const clamped = Math.max(0, Math.min(1, score));
  if (clamped >= 0.67) return 'high';
  if (clamped >= 0.34) return 'medium';
  return 'low';
}

const dedupeStrings = (values: Iterable<string>, max: number): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
    if (out.length >= max) break;
  }
  return out;
};

export const buildChatLearnerProfile = ({
  learningProfile,
  weakTags,
  learnerModel,
  recentMistakes,
}: BuildChatLearnerProfileArgs): Partial<LearnerContext> => {
  const out: Partial<LearnerContext> = {};

  // ── learningProfile fields ──────────────────────────────────────────────
  if (learningProfile?.level) {
    out.level = learningProfile.level;
  }
  const target = (learningProfile?.target || '').trim();
  if (target) {
    out.target = target;
    const targetLower = target.toLowerCase();
    if (targetLower.includes('ielts')) out.examType = 'IELTS';
    else if (targetLower.includes('toefl')) out.examType = 'TOEFL';
    else if (targetLower.includes('cet-6') || targetLower.includes('cet 6')) out.examType = 'CET-6';
    else if (targetLower.includes('cet-4') || targetLower.includes('cet 4')) out.examType = 'CET-4';
    else if (targetLower.includes('gre')) out.examType = 'GRE';
    else if (targetLower.includes('gmat')) out.examType = 'GMAT';
  }
  if (typeof learningProfile?.dailyMinutes === 'number' && learningProfile.dailyMinutes > 0) {
    out.dailyMinutes = learningProfile.dailyMinutes;
  }

  // ── learnerModel fields ─────────────────────────────────────────────────
  if (learnerModel) {
    if (typeof learnerModel.dueCount === 'number') {
      out.dueCount = Math.max(0, Math.round(learnerModel.dueCount));
    }
    if (learnerModel.mode) {
      out.learnerMode = learnerModel.mode;
    }
    const burnout = mapBurnoutBucket(learnerModel.burnoutRisk);
    if (burnout) {
      out.burnoutRisk = burnout;
    }
    if (typeof learnerModel.recommendedDailyReview === 'number' && learnerModel.recommendedDailyReview > 0) {
      out.recommendedDailyReview = Math.round(learnerModel.recommendedDailyReview);
    }
    if (typeof learnerModel.predictedRetention30d === 'number' && Number.isFinite(learnerModel.predictedRetention30d)) {
      // learnerModel stores 0–100, the policy expects 0–1.
      const normalized = learnerModel.predictedRetention30d > 1
        ? learnerModel.predictedRetention30d / 100
        : learnerModel.predictedRetention30d;
      out.predictedRetention30d = Math.max(0, Math.min(1, normalized));
    }
    const stubborn = dedupeStrings(learnerModel.stubbornTopics || [], 6);
    if (stubborn.length > 0) {
      out.stubbornTopics = stubborn;
    }
  }

  // ── weaknessTags (canonical) ────────────────────────────────────────────
  // The chat caller already computes `weakTags` (legacy name) via
  // `deriveChatWeakTags`. We promote them onto the canonical
  // `weaknessTags` field so the COACHING_POLICY can cite them. The
  // request payload still carries `weakTags` separately for older Edge
  // Function revisions.
  const promoted = dedupeStrings(weakTags || [], 8);
  if (promoted.length > 0) {
    out.weaknessTags = promoted;
  }

  // ── recentErrors from the mistake collector ─────────────────────────────
  if (Array.isArray(recentMistakes) && recentMistakes.length > 0) {
    const errors: CoachRecentError[] = [];
    const sorted = [...recentMistakes]
      .filter((entry) => entry && !entry.eliminated && typeof entry.word === 'string' && entry.word.trim())
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    for (const entry of sorted) {
      const word = entry.word.trim();
      const skill = mapMistakeCategoryToErrorType(entry.category || '');
      const note =
        entry.userAnswer && entry.correctAnswer
          ? `wrote "${entry.userAnswer.trim()}" (expected "${entry.correctAnswer.trim()}")`
          : undefined;
      errors.push({ word, skill, errorType: skill, note });
      if (errors.length >= 6) break;
    }
    if (errors.length > 0) {
      out.recentErrors = errors;
    }
  }

  return out;
};

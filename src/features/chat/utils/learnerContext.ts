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

import type { UserProfile } from '@/lib/supabase-auth';
import type { LearningProfile, LearningTrack } from '@/types/examContent';
import { saveLearningProfile } from '@/services/learningMissions';

type AuthLearningProfileInput = Pick<
  UserProfile,
  'userId' | 'cefrLevel' | 'dailyGoal' | 'preferredTopics' | 'learningStyle'
>;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const bandTargetByLevel: Record<AuthLearningProfileInput['cefrLevel'], string> = {
  A1: 'IELTS 5.0',
  A2: 'IELTS 5.5',
  B1: 'IELTS 6.0',
  B2: 'IELTS 7.0',
  C1: 'IELTS 7.5',
  C2: 'IELTS 8.0',
};

const pushTrack = (tracks: LearningTrack[], track: LearningTrack): void => {
  if (!tracks.includes(track)) tracks.push(track);
};

export function buildLearningProfileUpdatesFromAuthProfile(
  profile: AuthLearningProfileInput,
): Partial<Omit<LearningProfile, 'userId' | 'updatedAt'>> {
  const topicSet = new Set(profile.preferredTopics.map((topic) => topic.toLowerCase()));
  const tracks: LearningTrack[] = [];

  if (topicSet.has('academic')) {
    pushTrack(tracks, 'exam_boost');
  }
  if (topicSet.has('business') || topicSet.has('technology')) {
    pushTrack(tracks, 'workplace_english');
  }
  if (topicSet.has('travel')) {
    pushTrack(tracks, 'travel_survival');
  }
  if (topicSet.has('daily life') || topicSet.has('food') || topicSet.has('entertainment')) {
    pushTrack(tracks, 'daily_communication');
  }
  if (tracks.length === 0) {
    pushTrack(tracks, 'daily_communication');
  }

  const examFocused = tracks.includes('exam_boost');

  return {
    level: profile.cefrLevel,
    target: examFocused ? bandTargetByLevel[profile.cefrLevel] : 'general_improvement',
    tracks,
    dailyMinutes: clamp(profile.dailyGoal * 2, 12, 45),
    learningStyle: profile.learningStyle,
    languagePreference: 'bilingual',
  };
}

export async function syncLearningProfileFromAuthProfile(
  userId: string,
  profile: AuthLearningProfileInput,
): Promise<LearningProfile> {
  return saveLearningProfile(userId, buildLearningProfileUpdatesFromAuthProfile(profile));
}

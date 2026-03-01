import { supabase } from '@/lib/supabase';
import type { LearningMission, LearningMissionTask, LearningProfile, LearningTrack } from '@/types/examContent';

const KEYS = {
  PROFILE: 'vocabdaily_user_learning_profiles',
  MISSIONS: 'vocabdaily_learning_missions',
};

const todayIso = (): string => new Date().toISOString().slice(0, 10);
const nowIso = (): string => new Date().toISOString();

const getItem = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getProfileMap = (): Record<string, LearningProfile> =>
  getItem<Record<string, LearningProfile>>(KEYS.PROFILE, {});

const setProfileMap = (map: Record<string, LearningProfile>): void =>
  setItem(KEYS.PROFILE, map);

const getMissionMap = (): Record<string, LearningMission[]> =>
  getItem<Record<string, LearningMission[]>>(KEYS.MISSIONS, {});

const setMissionMap = (map: Record<string, LearningMission[]>): void =>
  setItem(KEYS.MISSIONS, map);

const defaultTracks: LearningTrack[] = ['daily_communication', 'workplace_english'];

export const getLearningProfile = (userId: string): LearningProfile => {
  const map = getProfileMap();
  if (!map[userId]) {
    map[userId] = {
      userId,
      level: 'B1',
      target: 'general_improvement',
      tracks: defaultTracks,
      dailyMinutes: 20,
      languagePreference: 'bilingual',
      updatedAt: nowIso(),
    };
    setProfileMap(map);
  }

  return map[userId];
};

export const saveLearningProfile = async (
  userId: string,
  updates: Partial<Omit<LearningProfile, 'userId' | 'updatedAt'>>,
): Promise<LearningProfile> => {
  const map = getProfileMap();
  const current = getLearningProfile(userId);
  const next: LearningProfile = {
    ...current,
    ...updates,
    userId,
    updatedAt: nowIso(),
  };

  map[userId] = next;
  setProfileMap(map);

  try {
    await supabase.from('user_learning_profiles').upsert({
      user_id: userId,
      level: next.level,
      target: next.target,
      tracks: next.tracks,
      daily_minutes: next.dailyMinutes,
      language_preference: next.languagePreference,
      updated_at: next.updatedAt,
    });
  } catch {
    // Keep local profile fallback.
  }

  return next;
};

const buildMissionTasks = (goalWords: number, dueCount: number): LearningMissionTask[] => {
  const vocabTarget = Math.max(5, Math.min(30, goalWords));
  const reviewTarget = Math.max(3, Math.min(20, dueCount || Math.ceil(vocabTarget / 2)));

  return [
    {
      id: 'task_vocab_today',
      type: 'vocabulary',
      title: `Learn ${vocabTarget} new words`,
      titleZh: `学习 ${vocabTarget} 个新词`,
      done: false,
      meta: { target: vocabTarget },
    },
    {
      id: 'task_quiz_today',
      type: 'quiz',
      title: 'Complete 1 AI quiz in chat',
      titleZh: '在聊天中完成 1 次 AI 测验',
      done: false,
      meta: { target: 1 },
    },
    {
      id: 'task_review_today',
      type: 'review',
      title: `Review ${reviewTarget} due cards`,
      titleZh: `复习 ${reviewTarget} 个到期卡片`,
      done: false,
      meta: { target: reviewTarget },
    },
  ];
};

export const getOrCreateDailyMission = async (args: {
  userId: string;
  goalWords: number;
  dueCount: number;
}): Promise<LearningMission> => {
  const profile = getLearningProfile(args.userId);
  const map = getMissionMap();
  const list = map[args.userId] || [];
  const today = todayIso();

  const existing = list.find((mission) => mission.date === today);
  if (existing) {
    return existing;
  }

  const mission: LearningMission = {
    id: `mission_${today}_${args.userId.slice(0, 8)}`,
    userId: args.userId,
    date: today,
    status: 'pending',
    estimatedMinutes: profile.dailyMinutes,
    tasks: buildMissionTasks(args.goalWords, args.dueCount),
    updatedAt: nowIso(),
  };

  map[args.userId] = [mission, ...list].slice(0, 90);
  setMissionMap(map);

  try {
    await supabase.from('learning_missions').upsert({
      id: mission.id,
      user_id: mission.userId,
      mission_date: mission.date,
      status: mission.status,
      estimated_minutes: mission.estimatedMinutes,
      tasks: mission.tasks,
      meta: { tracks: profile.tracks, target: profile.target },
      updated_at: mission.updatedAt,
    });
  } catch {
    // Keep local mission fallback.
  }

  return mission;
};

export const completeMissionTask = async (args: {
  userId: string;
  missionId: string;
  taskId: string;
}): Promise<LearningMission | null> => {
  const map = getMissionMap();
  const list = map[args.userId] || [];
  const mission = list.find((item) => item.id === args.missionId);
  if (!mission) return null;

  const tasks = mission.tasks.map((task) =>
    task.id === args.taskId ? { ...task, done: true } : task,
  );

  const status = tasks.every((task) => task.done)
    ? 'completed'
    : tasks.some((task) => task.done)
      ? 'in_progress'
      : 'pending';

  const updated: LearningMission = {
    ...mission,
    tasks,
    status,
    updatedAt: nowIso(),
  };

  map[args.userId] = list.map((item) => (item.id === mission.id ? updated : item));
  setMissionMap(map);

  try {
    await supabase
      .from('learning_missions')
      .update({
        tasks: updated.tasks,
        status: updated.status,
        updated_at: updated.updatedAt,
      })
      .eq('id', updated.id)
      .eq('user_id', args.userId);
  } catch {
    // Keep local state.
  }

  return updated;
};

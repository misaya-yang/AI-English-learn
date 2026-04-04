import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LearningMission, LearningMissionTask, LearningProfile, LearningTrack } from '@/types/examContent';
import type { LearnerModel } from '@/services/learnerModel';

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
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const isExamTarget = (profile: LearningProfile): boolean =>
  profile.target.toLowerCase().includes('ielts') || profile.tracks.some((track) => track.includes('exam'));

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
  } catch (err) {
    logger.error('[learningMissions] saveLearningProfile sync failed:', err);
  }

  return next;
};

const buildMissionTasks = (args: {
  goalWords: number;
  dueCount: number;
  profile: LearningProfile;
  learnerModel?: LearnerModel | null;
}): LearningMissionTask[] => {
  const mode = args.learnerModel?.mode ?? 'steady';
  const examTarget = isExamTarget(args.profile);
  const recommendedNew = args.learnerModel?.recommendedDailyNew ?? args.goalWords;
  const recommendedReview = args.learnerModel?.recommendedDailyReview ?? args.dueCount;
  const weakTopic = args.learnerModel?.weakTopics[0] ?? null;
  const stubbornWordCount = args.learnerModel?.stubbornWordCount ?? 0;

  const vocabTarget =
    mode === 'recovery'
      ? clamp(Math.max(3, recommendedNew), 3, 6)
      : mode === 'maintenance'
        ? clamp(Math.max(4, recommendedNew), 4, 10)
        : mode === 'stretch'
          ? clamp(Math.max(args.goalWords, recommendedNew), 8, 24)
          : mode === 'sprint'
            ? clamp(Math.max(6, recommendedNew), 6, 18)
            : clamp(Math.max(5, recommendedNew), 5, 20);

  const reviewTarget =
    mode === 'recovery'
      ? clamp(Math.max(recommendedReview, args.dueCount, 8) + Math.min(4, stubbornWordCount), 8, 30)
      : mode === 'maintenance'
        ? clamp(Math.max(recommendedReview, args.dueCount, 6) + Math.min(3, stubbornWordCount), 6, 24)
        : clamp(Math.max(4, recommendedReview, args.dueCount || Math.ceil(vocabTarget / 2)) + Math.min(2, stubbornWordCount), 4, 24);

  const quizTask =
    mode === 'recovery'
      ? {
          title: 'Complete 1 short consolidation coach quiz',
          titleZh: '完成 1 次巩固型短测',
          meta: { target: 1, focus: 'consolidation', mode },
        }
      : stubbornWordCount > 0 && !examTarget
        ? {
            title: 'Complete 1 reinforcement drill for stubborn words',
            titleZh: '完成 1 次顽固词强化练习',
            meta: { target: 1, focus: 'reinforcement', mode, stubbornWordCount },
          }
      : examTarget || mode === 'sprint'
        ? {
            title: 'Complete 1 IELTS score-boost coach drill',
            titleZh: '完成 1 次 IELTS 提分教练练习',
            meta: { target: 1, focus: 'ielts_boost', mode },
          }
        : weakTopic
          ? {
              title: 'Complete 1 weak-spot coach quiz',
              titleZh: '完成 1 次薄弱点教练测验',
              meta: { target: 1, focus: weakTopic, mode },
            }
          : {
              title: 'Complete 1 AI quiz in chat',
              titleZh: '在聊天中完成 1 次 AI 测验',
              meta: { target: 1, focus: 'general', mode },
            };

  return [
    {
      id: 'task_vocab_today',
      type: 'vocabulary',
      title: `Learn ${vocabTarget} new words`,
      titleZh: `学习 ${vocabTarget} 个新词`,
      done: false,
      meta: { target: vocabTarget, mode, weakTopic },
    },
    {
      id: 'task_quiz_today',
      type: 'quiz',
      title: quizTask.title,
      titleZh: quizTask.titleZh,
      done: false,
      meta: quizTask.meta,
    },
    {
      id: 'task_review_today',
      type: 'review',
      title: `Review ${reviewTarget} due cards`,
      titleZh: `复习 ${reviewTarget} 个到期卡片`,
      done: false,
      meta: { target: reviewTarget, mode, stubbornWordCount },
    },
  ];
};

const estimateMissionMinutes = (profile: LearningProfile, learnerModel?: LearnerModel | null): number => {
  const base = profile.dailyMinutes;
  if (!learnerModel) return base;

  const factor =
    learnerModel.mode === 'recovery'
      ? 0.9
      : learnerModel.mode === 'maintenance'
        ? 1
        : learnerModel.mode === 'stretch'
          ? 1.15
          : learnerModel.mode === 'sprint'
            ? 1.2
            : 1.05;

  return clamp(Math.round(base * factor), 12, 45);
};

const persistMission = async (
  mission: LearningMission,
  profile: LearningProfile,
  learnerModel?: LearnerModel | null,
): Promise<void> => {
  await supabase.from('learning_missions').upsert({
    id: mission.id,
    user_id: mission.userId,
    mission_date: mission.date,
    status: mission.status,
    estimated_minutes: mission.estimatedMinutes,
    tasks: mission.tasks,
    meta: {
      tracks: profile.tracks,
      target: profile.target,
      learnerMode: learnerModel?.mode ?? 'steady',
      weakTopics: learnerModel?.weakTopics ?? [],
      stubbornWordCount: learnerModel?.stubbornWordCount ?? 0,
      stubbornTopics: learnerModel?.stubbornTopics ?? [],
      burnoutRisk: learnerModel ? Number(learnerModel.burnoutRisk.toFixed(2)) : 0,
    },
    updated_at: mission.updatedAt,
  });
};

export const getOrCreateDailyMission = async (args: {
  userId: string;
  goalWords: number;
  dueCount: number;
  learnerModel?: LearnerModel | null;
}): Promise<LearningMission> => {
  const profile = getLearningProfile(args.userId);
  const map = getMissionMap();
  const list = map[args.userId] || [];
  const today = todayIso();
  const nextTasks = buildMissionTasks({
    goalWords: args.goalWords,
    dueCount: args.dueCount,
    profile,
    learnerModel: args.learnerModel,
  });
  const nextEstimatedMinutes = estimateMissionMinutes(profile, args.learnerModel);

  const existing = list.find((mission) => mission.date === today);
  if (existing) {
    const canRefresh = existing.status === 'pending' && !existing.tasks.some((task) => task.done);
    const shouldRefresh =
      canRefresh &&
      (existing.estimatedMinutes !== nextEstimatedMinutes ||
        JSON.stringify(existing.tasks) !== JSON.stringify(nextTasks));

    if (!shouldRefresh) {
      return existing;
    }

    const refreshed: LearningMission = {
      ...existing,
      estimatedMinutes: nextEstimatedMinutes,
      tasks: nextTasks,
      updatedAt: nowIso(),
    };

    map[args.userId] = list.map((mission) => (mission.id === existing.id ? refreshed : mission));
    setMissionMap(map);

    try {
      await persistMission(refreshed, profile, args.learnerModel);
    } catch (err) {
      logger.error('[learningMissions] persistMission (refresh) failed:', err);
    }

    return refreshed;
  }

  const mission: LearningMission = {
    id: `mission_${today}_${args.userId.slice(0, 8)}`,
    userId: args.userId,
    date: today,
    status: 'pending',
    estimatedMinutes: nextEstimatedMinutes,
    tasks: nextTasks,
    updatedAt: nowIso(),
  };

  map[args.userId] = [mission, ...list].slice(0, 90);
  setMissionMap(map);

  try {
    await persistMission(mission, profile, args.learnerModel);
  } catch (err) {
    logger.error('[learningMissions] persistMission (create) failed:', err);
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
  } catch (err) {
    logger.error('[learningMissions] completeMissionTask sync failed:', err);
  }

  return updated;
};

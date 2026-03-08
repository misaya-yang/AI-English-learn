import { useQuery } from '@tanstack/react-query';
import type { LearningMission, LearningProfile } from '@/types/examContent';
import { getLearningEvents, getWeeklyActivity } from '@/services/learningEvents';
import { buildLearningOverview } from '@/services/learningEngine';

interface UseLearningOverviewArgs {
  userId: string;
  mission: LearningMission | null;
  profile: LearningProfile;
  dueWordsCount: number;
  dailyWordsCount: number;
  learnedTodayCount: number;
  recommendedUnitTitle?: string | null;
  activeBookName?: string | null;
}

export const useLearningOverviewQuery = (args: UseLearningOverviewArgs) =>
  useQuery({
    queryKey: [
      'learning-overview',
      args.userId,
      args.profile.level,
      args.profile.target,
      args.dueWordsCount,
      args.dailyWordsCount,
      args.learnedTodayCount,
      args.mission?.id,
      args.mission?.updatedAt,
      args.recommendedUnitTitle,
      args.activeBookName,
    ],
    enabled: Boolean(args.userId),
    queryFn: async () => {
      const [events, weeklyActivity] = await Promise.all([
        getLearningEvents(args.userId, 21),
        getWeeklyActivity(args.userId),
      ]);

      return buildLearningOverview({
        mission: args.mission,
        profile: args.profile,
        dueWordsCount: args.dueWordsCount,
        dailyWordsCount: args.dailyWordsCount,
        learnedTodayCount: args.learnedTodayCount,
        recommendedUnitTitle: args.recommendedUnitTitle,
        activeBookName: args.activeBookName,
        events,
        weeklyActivity,
      });
    },
    staleTime: 45_000,
  });

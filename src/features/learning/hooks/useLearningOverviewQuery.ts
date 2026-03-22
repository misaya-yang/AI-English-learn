import { useQuery } from '@tanstack/react-query';
import type { LearningMission, LearningProfile } from '@/types/examContent';
import type { LearnerModel } from '@/services/learnerModel';
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
  learnerModel?: LearnerModel | null;
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
      args.learnerModel?.mode,
      args.learnerModel?.recommendedDailyNew,
      args.learnerModel?.recommendedDailyReview,
      args.learnerModel?.burnoutRisk,
      args.learnerModel?.weakTopics.join(','),
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
        learnerModel: args.learnerModel,
        events,
        weeklyActivity,
      });
    },
    staleTime: 45_000,
  });

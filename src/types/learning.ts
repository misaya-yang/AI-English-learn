export type LearningActionSurface = 'today' | 'review' | 'practice' | 'chat' | 'exam' | 'vocabulary';

export interface NextBestAction {
  id: string;
  surface: LearningActionSurface;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  cta: string;
  ctaZh: string;
  href: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface WeaknessSnapshot {
  tag: string;
  title: string;
  titleZh: string;
  count: number;
  emphasis: 'urgent' | 'watch' | 'stable';
}

export interface AdaptiveDifficultyState {
  level: 'recover' | 'steady' | 'stretch';
  label: string;
  labelZh: string;
  reason: string;
}

export interface DailyMissionCard {
  headline: string;
  headlineZh: string;
  support: string;
  supportZh: string;
  completionPct: number;
  estimatedMinutes: number;
  primaryAction: NextBestAction;
  secondaryActions: NextBestAction[];
}

export interface ActivitySparkPoint {
  date: string;
  label: string;
  words: number;
  xp: number;
  active: boolean;
}

export interface LearningOverview {
  missionCard: DailyMissionCard;
  weaknesses: WeaknessSnapshot[];
  adaptiveDifficulty: AdaptiveDifficultyState;
  activity: ActivitySparkPoint[];
}

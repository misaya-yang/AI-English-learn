// S23 – Study Calendar & Reminders – shared types

export interface StudyDay {
  date: string; // ISO date string e.g. "2026-04-06"
  minutesStudied: number;
  wordsLearned: number;
  wordsReviewed: number;
  activitiesCompleted: string[];
}

export interface StudyPlan {
  userId: string;
  dailyGoalMinutes: number;
  preferredTime: string; // e.g. "08:00"
  daysOfWeek: number[]; // 0 = Sunday … 6 = Saturday
  reminderEnabled: boolean;
}

export interface MonthData {
  year: number;
  month: number; // 1-based
  days: StudyDay[];
}

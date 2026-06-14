import { beforeEach, describe, expect, it } from 'vitest';
import {
  createProfile,
  getActiveBookSummary,
  getSettings,
  getStudySessions,
  recordStudySession,
  saveSettings,
  updateProfile,
} from './localStorage';
import { wordsDatabase } from './words';

const USER = 'settings-user';

describe('localStorage user settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides FSRS learner-control defaults for legacy users', () => {
    expect(getSettings(USER)).toEqual(expect.objectContaining({
      dailyNewWordLimit: 10,
      maxReviewCount: 24,
      targetRetention: 0.9,
      examWeekBoost: false,
      lifecycleReminders: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    }));
  });

  it('sanitizes learner controls before saving', () => {
    const saved = saveSettings(USER, {
      dailyNewWordLimit: 500,
      maxReviewCount: -1,
      targetRetention: 2,
      examWeekBoost: true,
      lifecycleReminders: true,
      quietHoursStart: '25:99',
      quietHoursEnd: '06:30',
    });

    expect(saved.dailyNewWordLimit).toBe(50);
    expect(saved.maxReviewCount).toBe(5);
    expect(saved.targetRetention).toBe(0.97);
    expect(saved.examWeekBoost).toBe(true);
    expect(saved.lifecycleReminders).toBe(true);
    expect(saved.quietHoursStart).toBe('22:00');
    expect(saved.quietHoursEnd).toBe('06:30');
  });

  it('preserves unrelated preferences when learner controls are saved', () => {
    saveSettings(USER, {
      theme: 'dark',
      notifications: false,
      reminderTime: '07:30',
      soundEnabled: false,
      fontSize: 'large',
      lifecycleReminders: true,
      quietHoursStart: '21:30',
      quietHoursEnd: '06:00',
    });

    const saved = saveSettings(USER, {
      dailyNewWordLimit: 7,
      maxReviewCount: 12,
      targetRetention: 0.95,
      examWeekBoost: true,
    });

    expect(saved).toEqual(expect.objectContaining({
      theme: 'dark',
      notifications: false,
      reminderTime: '07:30',
      soundEnabled: false,
      fontSize: 'large',
      lifecycleReminders: true,
      quietHoursStart: '21:30',
      quietHoursEnd: '06:00',
      dailyNewWordLimit: 7,
      maxReviewCount: 12,
      targetRetention: 0.95,
      examWeekBoost: true,
    }));
  });

  it('does not override profile daily goal until a daily new-word setting is saved', () => {
    createProfile(USER);
    updateProfile(USER, { dailyGoal: 18 });

    expect(getActiveBookSummary(USER, wordsDatabase).dailyGoal).toBe(18);

    saveSettings(USER, { dailyNewWordLimit: 6 });

    expect(getActiveBookSummary(USER, wordsDatabase).dailyGoal).toBe(6);
  });

  it('treats malformed legacy study-session storage as empty', () => {
    localStorage.setItem('vocabdaily_sessions', JSON.stringify({ [USER]: [] }));

    expect(getStudySessions(USER)).toEqual([]);

    recordStudySession(USER, 3, 2, 10, 8);

    expect(getStudySessions(USER)).toEqual([
      expect.objectContaining({
        userId: USER,
        wordsStudied: 3,
        wordsLearned: 2,
        xpEarned: 10,
        duration: 8,
      }),
    ]);
  });
});

import { describe, expect, it, vi } from 'vitest';

import {
  buildLearningProfileUpdatesFromAuthProfile,
  syncLearningProfileFromAuthProfile,
} from './profileLearningSync';

const saveLearningProfileMock = vi.fn();

vi.mock('@/services/learningMissions', () => ({
  saveLearningProfile: (...args: unknown[]) => saveLearningProfileMock(...args),
}));

describe('profileLearningSync', () => {
  it('maps onboarding/profile fields into the mission learning profile', () => {
    const updates = buildLearningProfileUpdatesFromAuthProfile({
      userId: 'user-1',
      cefrLevel: 'B2',
      dailyGoal: 18,
      preferredTopics: ['Academic', 'Business'],
      learningStyle: 'auditory',
    });

    expect(updates.level).toBe('B2');
    expect(updates.target).toBe('IELTS 7.0');
    expect(updates.tracks).toEqual(['exam_boost', 'workplace_english']);
    expect(updates.dailyMinutes).toBe(36);
    expect(updates.learningStyle).toBe('auditory');
    expect(updates.languagePreference).toBe('bilingual');
  });

  it('clamps daily minutes and keeps non-exam learners on practical English tracks', () => {
    const updates = buildLearningProfileUpdatesFromAuthProfile({
      userId: 'user-2',
      cefrLevel: 'A2',
      dailyGoal: 50,
      preferredTopics: ['Travel', 'Food'],
      learningStyle: 'visual',
    });

    expect(updates.level).toBe('A2');
    expect(updates.target).toBe('general_improvement');
    expect(updates.tracks).toEqual(['travel_survival', 'daily_communication']);
    expect(updates.dailyMinutes).toBe(45);
  });

  it('persists the mapped updates through learningMissions', async () => {
    saveLearningProfileMock.mockResolvedValueOnce({});

    await syncLearningProfileFromAuthProfile('user-3', {
      userId: 'user-3',
      cefrLevel: 'C1',
      dailyGoal: 10,
      preferredTopics: ['Academic'],
      learningStyle: 'reading',
    });

    expect(saveLearningProfileMock).toHaveBeenCalledWith('user-3', {
      level: 'C1',
      target: 'IELTS 7.5',
      tracks: ['exam_boost'],
      dailyMinutes: 20,
      learningStyle: 'reading',
      languagePreference: 'bilingual',
    });
  });
});

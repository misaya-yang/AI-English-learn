import test from 'node:test';
import assert from 'node:assert/strict';

import { buildLearningOverview, deriveWeaknessesFromEvents } from '@/services/learningEngine';
import type { LearningMission, LearningProfile } from '@/types/examContent';
import type { LearnerModel } from '@/services/learnerModel';

const baseProfile: LearningProfile = {
  userId: 'user_1',
  level: 'B1',
  target: 'general_improvement',
  tracks: ['daily_communication'],
  dailyMinutes: 20,
  languagePreference: 'bilingual',
  updatedAt: '2026-03-22T00:00:00.000Z',
};

const baseMission: LearningMission = {
  id: 'mission_1',
  userId: 'user_1',
  date: '2026-03-22',
  status: 'pending',
  estimatedMinutes: 20,
  updatedAt: '2026-03-22T00:00:00.000Z',
  tasks: [
    { id: 'task_vocab_today', type: 'vocabulary', title: 'Learn 8 new words', titleZh: '学习 8 个新词', done: false },
    { id: 'task_quiz_today', type: 'quiz', title: 'Do 1 quiz', titleZh: '做 1 次测验', done: false },
    { id: 'task_review_today', type: 'review', title: 'Review 8 cards', titleZh: '复习 8 张卡片', done: false },
  ],
};

const recoveryModel: LearnerModel = {
  userId: 'user_1',
  computedAt: '2026-03-22T00:00:00.000Z',
  mode: 'recovery',
  avgRetrievability: 0.42,
  predictedRetention30d: 38,
  weakTopics: ['transport'],
  strongTopics: [],
  recommendedDailyNew: 3,
  recommendedDailyReview: 14,
  burnoutRisk: 0.82,
  dueCount: 14,
  avgStability: 2.3,
  stubbornWordCount: 4,
  stubbornTopics: ['transport'],
};

const sprintModel: LearnerModel = {
  userId: 'user_1',
  computedAt: '2026-03-22T00:00:00.000Z',
  mode: 'sprint',
  avgRetrievability: 0.87,
  predictedRetention30d: 81,
  weakTopics: ['academic'],
  strongTopics: ['travel'],
  recommendedDailyNew: 10,
  recommendedDailyReview: 6,
  burnoutRisk: 0.18,
  dueCount: 4,
  avgStability: 14.5,
  stubbornWordCount: 1,
  stubbornTopics: ['academic'],
};

test('learning overview prioritizes review when learner is in recovery mode', () => {
  const overview = buildLearningOverview({
    mission: baseMission,
    profile: baseProfile,
    dueWordsCount: 12,
    dailyWordsCount: 8,
    learnedTodayCount: 1,
    learnerModel: recoveryModel,
    events: [],
    weeklyActivity: [],
  });

  assert.equal(overview.missionCard.primaryAction.href, '/dashboard/review');
  assert.equal(overview.adaptiveDifficulty.level, 'recover');
});

test('learning overview routes IELTS sprint learners to exam prep', () => {
  const overview = buildLearningOverview({
    mission: baseMission,
    profile: {
      ...baseProfile,
      target: 'ielts_overall_7',
      tracks: ['workplace_english'],
    },
    dueWordsCount: 2,
    dailyWordsCount: 6,
    learnedTodayCount: 6,
    recommendedUnitTitle: 'Task 2 logic drill',
    learnerModel: sprintModel,
    events: [
      {
        id: 'evt_1',
        userId: 'user_1',
        eventName: 'practice.writing_submitted',
        payload: { issues: ['coherence', 'logic'] },
        createdAt: '2026-03-22T00:00:00.000Z',
        synced: true,
      },
    ],
    weeklyActivity: [],
  });

  assert.equal(overview.missionCard.primaryAction.href, '/dashboard/exam');
  assert.equal(overview.adaptiveDifficulty.level, 'stretch');
});

test('chat weak tags feed back into weakness detection for next-best-action planning', () => {
  const weaknesses = deriveWeaknessesFromEvents([
    {
      id: 'evt_chat_1',
      userId: 'user_1',
      eventName: 'chat.message_sent',
      payload: {
        weakTags: ['review_pressure', 'retrieval_practice', 'ielts_writing'],
      },
      createdAt: '2026-03-22T10:00:00.000Z',
      synced: true,
    },
  ]);

  assert.deepEqual(
    weaknesses.map((item) => item.tag),
    ['retention', 'vocabulary_recall', 'coherence'],
  );
});

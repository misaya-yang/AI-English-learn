import { describe, expect, it } from 'vitest';
import type { DailyMissionCard } from '@/types/learning';
import type { LearningProfile } from '@/types/examContent';
import type { LexicalEntry } from '@/features/lexicon/lexicalEntry';
import { buildDailyCoachPlan } from './dailyCoachPlan';

const profile: LearningProfile = {
  userId: 'user-1',
  level: 'B2',
  target: 'IELTS 7.0',
  tracks: ['exam_boost'],
  dailyMinutes: 20,
  learningStyle: 'auditory',
  languagePreference: 'zh',
  updatedAt: '2026-04-30T00:00:00.000Z',
};

function missionCard(overrides: Partial<DailyMissionCard['primaryAction']> = {}): DailyMissionCard {
  const primaryAction = {
    id: 'primary-review',
    surface: 'review' as const,
    title: 'Clear your due reviews',
    titleZh: '优先清空到期复习',
    description: '8 cards are waiting.',
    descriptionZh: '当前有 8 个到期卡片。',
    cta: 'Start review',
    ctaZh: '开始复习',
    href: '/dashboard/review',
    estimatedMinutes: 12,
    priority: 'high' as const,
    reason: 'due_words',
    ...overrides,
  };

  return {
    headline: primaryAction.title,
    headlineZh: primaryAction.titleZh,
    support: primaryAction.description,
    supportZh: primaryAction.descriptionZh,
    completionPct: 25,
    estimatedMinutes: primaryAction.estimatedMinutes,
    primaryAction,
    secondaryActions: [],
  };
}

const lexicalEntry: LexicalEntry = {
  id: 'word-1',
  headword: 'approach',
  phonetic: '/əˈprəʊtʃ/',
  cefrLevel: 'B2',
  topic: 'academic',
  ieltsRelevance: 'core',
  senses: [{
    id: 'word-1:sense:1',
    partOfSpeech: 'n.',
    definition: 'a way of dealing with something',
    definitionZh: '方法',
    examples: [],
    synonyms: [],
    antonyms: [],
    collocations: ['practical approach'],
  }],
  commonMistakes: [],
  trainingTemplates: [],
  source: 'word_data',
};

describe('buildDailyCoachPlan', () => {
  it('wraps due-review missions as review pressure plans', () => {
    const plan = buildDailyCoachPlan({
      userId: 'user-1',
      profile,
      missionCard: missionCard(),
      dueWordsCount: 8,
      dailyWordsCount: 10,
      learnedTodayCount: 2,
      weaknesses: [],
      activeBookName: 'IELTS Core',
    });

    expect(plan.reason).toBe('review_pressure');
    expect(plan.primaryTask.href).toBe('/dashboard/review');
    expect(plan.evidence.some((item) => item.id === 'due-reviews' && item.value === '8')).toBe(true);
    expect(plan.evidence).toContainEqual(expect.objectContaining({
      id: 'learning-style',
      value: 'Listening-first',
      valueZh: '听说优先',
    }));
    expect(plan.coachHref).toContain('dailyPlan=');
    expect(plan.coachPrompt).toContain('due review pressure');
    expect(plan.coachPrompt).toContain('Preferred learning style: auditory');
    expect(plan.brief.en).toContain('pronunciation or dictation');
  });

  it('keeps exam and weakness context visible in the coach handoff', () => {
    const plan = buildDailyCoachPlan({
      userId: 'user-1',
      profile,
      missionCard: missionCard({
        id: 'primary-exam',
        surface: 'exam',
        title: 'Boost your score with Task 2',
        titleZh: '先做 Task 2 提分训练',
        href: '/dashboard/exam',
        reason: 'exam_boost',
      }),
      dueWordsCount: 0,
      dailyWordsCount: 10,
      learnedTodayCount: 10,
      weaknesses: [{ tag: 'coherence', title: 'Coherence', titleZh: '连贯衔接', count: 5, emphasis: 'urgent' }],
      activeBookName: 'IELTS Core',
    });

    expect(plan.reason).toBe('exam_boost');
    expect(plan.evidence.map((item) => item.id)).toContain('weakness');
    expect(plan.coachPrompt).toContain('Coherence');
  });

  it('adds dictionary focus when a lexical entry is available', () => {
    const plan = buildDailyCoachPlan({
      userId: 'user-1',
      profile,
      missionCard: missionCard({
        reason: 'today_words',
        href: '/dashboard/today',
        description: '7 suggested words are still waiting in your list.',
        descriptionZh: '还有 7 个建议新词待推进。',
      }),
      dueWordsCount: 0,
      dailyWordsCount: 10,
      learnedTodayCount: 3,
      weaknesses: [],
      activeBookName: 'IELTS Core',
      lexicalFocus: lexicalEntry,
    });

    expect(plan.reason).toBe('daily_vocabulary');
    expect(plan.dictionaryFocus?.headword).toBe('approach');
    expect(plan.briefTitle.en).toBe(plan.primaryTask.title);
    expect(plan.evidence.map((item) => item.id)).toContain('dictionary-focus');
    expect(plan.evidence).toContainEqual(expect.objectContaining({ id: 'target', value: 'IELTS 7.0' }));
    expect(plan.brief.en).toContain('7 suggested words');
    expect(plan.coachPrompt).toContain('approach');
  });
});

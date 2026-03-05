import { supabase } from '@/lib/supabase';
import { getSubscriptionEntitlement } from '@/services/billingGateway';
import type {
  AiFeedback,
  AnalyzedErrorNode,
  ContentUnit,
  Entitlement,
  EntitlementUsage,
  ExamItem,
  ExamRubric,
  ExamTrack,
  FeedbackIssue,
  ItemAttempt,
  PlanTier,
  QuotaConsumeResult,
} from '@/types/examContent';

const KEYS = {
  TRACKS: 'vocabdaily_content_tracks',
  UNITS: 'vocabdaily_content_units',
  ITEMS: 'vocabdaily_content_items',
  RUBRICS: 'vocabdaily_exam_rubrics',
  ATTEMPTS: 'vocabdaily_item_attempts',
  FEEDBACK: 'vocabdaily_ai_feedback_records',
  ENTITLEMENTS: 'vocabdaily_user_entitlements',
  USAGE: 'vocabdaily_daily_quota_usage',
};

const nowIso = (): string => new Date().toISOString();
const todayIso = (): string => new Date().toISOString().split('T')[0];

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

const seedTracks: ExamTrack[] = [
  {
    id: 'track_ielts_writing_foundation',
    examType: 'IELTS',
    skill: 'writing',
    bandTarget: '6.0-6.5',
    title: 'IELTS Writing Foundation',
    source: 'Official public IELTS prep structure + AI generated practice',
    license: 'Original content with attribution metadata',
  },
  {
    id: 'track_ielts_writing_advanced',
    examType: 'IELTS',
    skill: 'writing',
    bandTarget: '7.0-7.5',
    title: 'IELTS Writing Advanced',
    source: 'Official public IELTS prep structure + AI generated practice',
    license: 'Original content with attribution metadata',
  },
];

const seedRubrics: ExamRubric[] = [
  {
    id: 'rubric_ielts_writing',
    examType: 'IELTS',
    skill: 'writing',
    name: 'IELTS Writing Band Descriptors (Structured)',
    criteria: [
      'Task Response / Task Achievement',
      'Coherence and Cohesion',
      'Lexical Resource',
      'Grammatical Range and Accuracy',
    ],
    source: 'IELTS public scoring descriptors',
    license: 'Used as structured reference summary',
  },
];

const seedUnits: ContentUnit[] = [
  {
    id: 'unit_ielts_task2_argument_b1',
    trackId: 'track_ielts_writing_foundation',
    title: 'Task 2 Argument Paragraph Basics',
    cefrLevel: 'B1',
    estimatedMinutes: 18,
    learningObjectives: [
      'Build one clear argument paragraph with claim-reason-example',
      'Use cohesive devices without overuse',
      'Avoid common lexical and grammar mistakes in IELTS Task 2',
    ],
    itemIds: ['item_task2_argument_city_001'],
    createdAt: '2026-03-01T00:00:00.000Z',
    source: 'Official public IELTS prep structure + AI generated practice',
    license: 'Original content with attribution metadata',
    attribution: 'Generated with AI, reviewed by project rules',
  },
  {
    id: 'unit_ielts_task1_trend_b1',
    trackId: 'track_ielts_writing_foundation',
    title: 'Task 1 Trends and Comparisons',
    cefrLevel: 'B1',
    estimatedMinutes: 16,
    learningObjectives: [
      'Describe trend direction accurately',
      'Use comparison language and data verbs',
      'Control tense consistency for charts',
    ],
    itemIds: ['item_task1_trend_chart_001'],
    createdAt: '2026-03-01T00:00:00.000Z',
    source: 'Official public IELTS prep structure + AI generated practice',
    license: 'Original content with attribution metadata',
    attribution: 'Generated with AI, reviewed by project rules',
  },
  {
    id: 'unit_ielts_task2_advanced_logic_b2',
    trackId: 'track_ielts_writing_advanced',
    title: 'Task 2 Advanced Logic and Counterarguments',
    cefrLevel: 'B2',
    estimatedMinutes: 20,
    learningObjectives: [
      'Write balanced argument with rebuttal',
      'Avoid logical fallacies in paragraph development',
      'Upgrade lexical precision for band 7+',
    ],
    itemIds: ['item_task2_counterargument_001'],
    createdAt: '2026-03-01T00:00:00.000Z',
    source: 'Official public IELTS prep structure + AI generated practice',
    license: 'Original content with attribution metadata',
    attribution: 'Generated with AI, reviewed by project rules',
  },
];

const seedItems: ExamItem[] = [
  {
    id: 'item_task2_argument_city_001',
    unitId: 'unit_ielts_task2_argument_b1',
    examType: 'IELTS',
    skill: 'writing',
    itemType: 'writing_task_2',
    prompt:
      'Some people think governments should invest more in public transport than in building new roads. To what extent do you agree or disagree?',
    referenceAnswer:
      'A strong response states a clear position, develops two focused body paragraphs with concrete examples, and uses balanced cohesion and precise grammar.',
    rubricId: 'rubric_ielts_writing',
    source: 'AI simulation based on official public prompt style',
    license: 'Original generated content',
    attribution: 'Simulation item. Not an official exam item.',
  },
  {
    id: 'item_task1_trend_chart_001',
    unitId: 'unit_ielts_task1_trend_b1',
    examType: 'IELTS',
    skill: 'writing',
    itemType: 'writing_task_1',
    prompt:
      'The chart shows changes in the percentage of people using three transport modes in a city from 2000 to 2020. Summarize the information by selecting and reporting the main features.',
    referenceAnswer:
      'A strong response includes an overview, key trend comparisons, and precise tense/data expressions without listing every single data point.',
    rubricId: 'rubric_ielts_writing',
    source: 'AI simulation based on official public prompt style',
    license: 'Original generated content',
    attribution: 'Simulation item. Not an official exam item.',
  },
  {
    id: 'item_task2_counterargument_001',
    unitId: 'unit_ielts_task2_advanced_logic_b2',
    examType: 'IELTS',
    skill: 'writing',
    itemType: 'writing_task_2',
    prompt:
      'In many countries, young people are encouraged to work or travel for a year before university. Do the advantages outweigh the disadvantages?',
    referenceAnswer:
      'A high-band response weighs both sides, integrates rebuttal, and maintains logical progression with sophisticated but accurate language.',
    rubricId: 'rubric_ielts_writing',
    source: 'AI simulation based on official public prompt style',
    license: 'Original generated content',
    attribution: 'Simulation item. Not an official exam item.',
  },
];

const ensureSeeded = (): void => {
  const tracks = getItem<ExamTrack[]>(KEYS.TRACKS, []);
  const units = getItem<ContentUnit[]>(KEYS.UNITS, []);
  const items = getItem<ExamItem[]>(KEYS.ITEMS, []);
  const rubrics = getItem<ExamRubric[]>(KEYS.RUBRICS, []);

  if (tracks.length === 0) setItem(KEYS.TRACKS, seedTracks);
  if (units.length === 0) setItem(KEYS.UNITS, seedUnits);
  if (items.length === 0) setItem(KEYS.ITEMS, seedItems);
  if (rubrics.length === 0) setItem(KEYS.RUBRICS, seedRubrics);
};

const getDefaultEntitlement = (userId: string): Entitlement => {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);

  return {
    userId,
    plan: 'free',
    quota: {
      aiAdvancedFeedbackPerDay: 2,
      simItemsPerDay: 2,
      microLessonsPerDay: 1,
    },
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
};

export const getExamTracks = (): ExamTrack[] => {
  ensureSeeded();
  return getItem<ExamTrack[]>(KEYS.TRACKS, seedTracks);
};

export const getContentUnits = (filters?: {
  examType?: 'IELTS' | 'TOEFL';
  skill?: 'writing' | 'speaking' | 'reading' | 'listening';
  bandTarget?: string;
}): ContentUnit[] => {
  ensureSeeded();
  const units = getItem<ContentUnit[]>(KEYS.UNITS, seedUnits);
  const tracks = getExamTracks();
  const trackById = new Map(tracks.map((track) => [track.id, track]));

  return units.filter((unit) => {
    const track = trackById.get(unit.trackId);
    if (!track) return false;

    if (filters?.examType && track.examType !== filters.examType) return false;
    if (filters?.skill && track.skill !== filters.skill) return false;
    if (filters?.bandTarget && track.bandTarget !== filters.bandTarget) return false;

    return true;
  });
};

export const getContentItemsByUnit = (unitId: string): ExamItem[] => {
  ensureSeeded();
  return getItem<ExamItem[]>(KEYS.ITEMS, seedItems).filter((item) => item.unitId === unitId);
};

export const saveGeneratedMicroLesson = (unit: ContentUnit, items: ExamItem[]): void => {
  ensureSeeded();
  const units = getItem<ContentUnit[]>(KEYS.UNITS, seedUnits);
  const allItems = getItem<ExamItem[]>(KEYS.ITEMS, seedItems);

  const nextUnits = [unit, ...units.filter((u) => u.id !== unit.id)];
  const itemMap = new Map<string, ExamItem>();

  [...items, ...allItems].forEach((item) => {
    itemMap.set(item.id, item);
  });

  setItem(KEYS.UNITS, nextUnits);
  setItem(KEYS.ITEMS, [...itemMap.values()]);
};

const getAttemptMap = (): Record<string, ItemAttempt[]> => getItem<Record<string, ItemAttempt[]>>(KEYS.ATTEMPTS, {});
const setAttemptMap = (map: Record<string, ItemAttempt[]>): void => setItem(KEYS.ATTEMPTS, map);

const getFeedbackMap = (): Record<string, AiFeedback[]> => getItem<Record<string, AiFeedback[]>>(KEYS.FEEDBACK, {});
const setFeedbackMap = (map: Record<string, AiFeedback[]>): void => setItem(KEYS.FEEDBACK, map);

export const saveItemAttempt = (attempt: ItemAttempt): void => {
  const map = getAttemptMap();
  const list = map[attempt.userId] || [];
  map[attempt.userId] = [attempt, ...list].slice(0, 200);
  setAttemptMap(map);
};

export const getItemAttempts = (userId: string, limit = 200): ItemAttempt[] => {
  const map = getAttemptMap();
  return (map[userId] || []).slice(0, limit);
};

export const saveAiFeedbackRecord = (userId: string, feedback: AiFeedback): void => {
  const map = getFeedbackMap();
  const list = map[userId] || [];
  map[userId] = [feedback, ...list].slice(0, 200);
  setFeedbackMap(map);
};

export const getLatestAiFeedback = (userId: string): AiFeedback | null => {
  const map = getFeedbackMap();
  return (map[userId] || [])[0] || null;
};

export const getAiFeedbackHistory = (userId: string, limit = 20): AiFeedback[] => {
  const map = getFeedbackMap();
  return (map[userId] || []).slice(0, limit);
};

export const getErrorGraph = (userId: string): AnalyzedErrorNode[] => {
  const feedback = getAiFeedbackHistory(userId, 100);
  const counter = new Map<FeedbackIssue['tag'], { count: number; latestAt: string }>();

  feedback.forEach((record) => {
    record.issues.forEach((issue) => {
      const item = counter.get(issue.tag);
      if (!item) {
        counter.set(issue.tag, { count: 1, latestAt: record.createdAt });
        return;
      }

      item.count += 1;
      if (record.createdAt > item.latestAt) {
        item.latestAt = record.createdAt;
      }
    });
  });

  return [...counter.entries()]
    .map(([tag, value]) => ({
      tag,
      count: value.count,
      latestAt: value.latestAt,
    }))
    .sort((a, b) => b.count - a.count);
};

const getEntitlementMap = (): Record<string, Entitlement> =>
  getItem<Record<string, Entitlement>>(KEYS.ENTITLEMENTS, {});

const setEntitlementMap = (map: Record<string, Entitlement>): void => setItem(KEYS.ENTITLEMENTS, map);

const getUsageMap = (): Record<string, EntitlementUsage> =>
  getItem<Record<string, EntitlementUsage>>(KEYS.USAGE, {});

const setUsageMap = (map: Record<string, EntitlementUsage>): void => setItem(KEYS.USAGE, map);

const getPlanQuota = (plan: PlanTier): Entitlement['quota'] => {
  if (plan === 'pro') {
    return {
      aiAdvancedFeedbackPerDay: 30,
      simItemsPerDay: 20,
      microLessonsPerDay: 20,
    };
  }

  return {
    aiAdvancedFeedbackPerDay: 2,
    simItemsPerDay: 2,
    microLessonsPerDay: 1,
  };
};

const toUsage = (userId: string): EntitlementUsage => ({
  userId,
  date: todayIso(),
  aiAdvancedFeedbackUsed: 0,
  simItemsUsed: 0,
  microLessonsUsed: 0,
});

const getUsageForToday = (userId: string): EntitlementUsage => {
  const usageMap = getUsageMap();
  const usage = usageMap[userId];

  if (!usage || usage.date !== todayIso()) {
    const reset = toUsage(userId);
    usageMap[userId] = reset;
    setUsageMap(usageMap);
    return reset;
  }

  return usage;
};

export const getEntitlement = async (userId: string): Promise<Entitlement> => {
  const map = getEntitlementMap();

  try {
    const remote = await getSubscriptionEntitlement();
    const entitlement: Entitlement = {
      userId,
      plan: remote.plan,
      quota: remote.quota,
      periodStart: remote.periodStart,
      periodEnd: remote.periodEnd,
    };

    map[userId] = entitlement;
    setEntitlementMap(map);
    return entitlement;
  } catch {
    // Fallback to direct table/local checks below.
  }

  // Try Supabase first when table exists.
  try {
    const { data, error } = await supabase
      .from('user_entitlements')
      .select('user_id, plan, quota, period_start, period_end')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      const entitlement: Entitlement = {
        userId: data.user_id,
        plan: data.plan as PlanTier,
        quota: (data.quota || getPlanQuota(data.plan as PlanTier)) as Entitlement['quota'],
        periodStart: data.period_start,
        periodEnd: data.period_end,
      };

      map[userId] = entitlement;
      setEntitlementMap(map);
      return entitlement;
    }
  } catch {
    // Keep local fallback.
  }

  if (!map[userId]) {
    map[userId] = getDefaultEntitlement(userId);
    setEntitlementMap(map);
  }

  return map[userId];
};

export const setEntitlementPlan = async (userId: string, plan: PlanTier): Promise<Entitlement> => {
  const map = getEntitlementMap();
  const current = map[userId] || getDefaultEntitlement(userId);

  const next: Entitlement = {
    ...current,
    plan,
    quota: getPlanQuota(plan),
    periodStart: nowIso(),
    periodEnd: (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date.toISOString();
    })(),
  };

  map[userId] = next;
  setEntitlementMap(map);

  try {
    await supabase.from('user_entitlements').upsert({
      user_id: userId,
      plan,
      quota: next.quota,
      period_start: next.periodStart,
      period_end: next.periodEnd,
      updated_at: nowIso(),
    });
  } catch {
    // Keep local fallback when table is unavailable.
  }

  return next;
};

export const consumeQuota = async (
  userId: string,
  type: keyof Entitlement['quota'],
  amount = 1,
): Promise<QuotaConsumeResult> => {
  const entitlement = await getEntitlement(userId);
  const usageMap = getUsageMap();
  const usage = getUsageForToday(userId);

  let used = 0;
  let key: keyof EntitlementUsage;

  if (type === 'aiAdvancedFeedbackPerDay') {
    key = 'aiAdvancedFeedbackUsed';
    used = usage.aiAdvancedFeedbackUsed;
  } else if (type === 'simItemsPerDay') {
    key = 'simItemsUsed';
    used = usage.simItemsUsed;
  } else {
    key = 'microLessonsUsed';
    used = usage.microLessonsUsed;
  }

  const limit = entitlement.quota[type];
  const nextUsed = used + amount;

  if (nextUsed > limit) {
    return {
      allowed: false,
      remaining: Math.max(0, limit - used),
      reason: 'quota_exceeded',
    };
  }

  const nextUsage: EntitlementUsage = {
    ...usage,
    [key]: nextUsed,
  };

  usageMap[userId] = nextUsage;
  setUsageMap(usageMap);

  return {
    allowed: true,
    remaining: Math.max(0, limit - nextUsed),
  };
};

export const getQuotaSnapshot = async (userId: string): Promise<{
  entitlement: Entitlement;
  usage: EntitlementUsage;
  remaining: Entitlement['quota'];
}> => {
  const entitlement = await getEntitlement(userId);
  const usage = getUsageForToday(userId);

  return {
    entitlement,
    usage,
    remaining: {
      aiAdvancedFeedbackPerDay: Math.max(0, entitlement.quota.aiAdvancedFeedbackPerDay - usage.aiAdvancedFeedbackUsed),
      simItemsPerDay: Math.max(0, entitlement.quota.simItemsPerDay - usage.simItemsUsed),
      microLessonsPerDay: Math.max(0, entitlement.quota.microLessonsPerDay - usage.microLessonsUsed),
    },
  };
};

export const getRecommendedUnit = (userId: string): ContentUnit | null => {
  const units = getContentUnits({ examType: 'IELTS', skill: 'writing' });
  if (units.length === 0) return null;

  const errorGraph = getErrorGraph(userId);
  if (errorGraph.length === 0) {
    return units[0];
  }

  const hottest = errorGraph[0].tag;
  if (hottest === 'grammar' || hottest === 'tense') {
    return units.find((unit) => unit.id.includes('task1')) || units[0];
  }

  if (hottest === 'logic' || hottest === 'task_response') {
    return units.find((unit) => unit.id.includes('task2')) || units[0];
  }

  return units[0];
};

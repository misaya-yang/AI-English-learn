import { wordsDatabase, type WordData } from './words';

export interface WordBook {
  id: string;
  name: string;
  source: string;
  license: string;
  levelRange: string[];
  topicTags: string[];
  wordIds: string[];
  createdAt: string;
  isBuiltIn: boolean;
  version: string;
}

export interface UserBookSelection {
  userId: string;
  activeBookId: string;
  dailyGoalOverride?: number;
}

export interface ImportRowError {
  row: number;
  reason: string;
  raw: string;
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  duplicateCount: number;
  errorRows: ImportRowError[];
  createdBookId?: string;
}

interface BuiltInBookTemplate {
  id: string;
  name: string;
  source: string;
  license: string;
  levelRange: string[];
  topicTags: string[];
  filter: (word: WordData) => boolean;
}

const BUILT_IN_TEMPLATES: BuiltInBookTemplate[] = [
  {
    id: 'builtin_a1_foundation',
    name: 'A1基础',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['A1'],
    topicTags: ['daily'],
    filter: (word) => word.level === 'A1',
  },
  {
    id: 'builtin_a2_high_frequency',
    name: 'A2高频',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['A2'],
    topicTags: ['daily', 'travel'],
    filter: (word) => word.level === 'A2',
  },
  {
    id: 'builtin_b1_core',
    name: 'B1核心',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['B1'],
    topicTags: ['daily', 'business', 'technology'],
    filter: (word) => word.level === 'B1',
  },
  {
    id: 'builtin_business_english',
    name: '商务英语',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['A2', 'B1', 'B2'],
    topicTags: ['business'],
    filter: (word) => word.topic === 'business',
  },
  {
    id: 'builtin_technology_english',
    name: '科技英语',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['B1', 'B2'],
    topicTags: ['technology', 'science'],
    filter: (word) => word.topic === 'technology' || word.topic === 'science',
  },
];

export const DEFAULT_ACTIVE_BOOK_ID = BUILT_IN_TEMPLATES[0].id;

export const BUILT_IN_BOOK_IDS = new Set(BUILT_IN_TEMPLATES.map((template) => template.id));

export const getBuiltInWordBooks = (allWords: WordData[] = wordsDatabase): WordBook[] => {
  const createdAt = '2026-01-01T00:00:00.000Z';

  return BUILT_IN_TEMPLATES.map((template) => {
    const wordIds = allWords.filter(template.filter).map((word) => word.id);

    return {
      id: template.id,
      name: template.name,
      source: template.source,
      license: template.license,
      levelRange: template.levelRange,
      topicTags: template.topicTags,
      wordIds,
      createdAt,
      isBuiltIn: true,
      version: '1.0.0',
    };
  });
};

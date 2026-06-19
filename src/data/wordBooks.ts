import { wordsDatabase, type WordData } from './words';
import { IELTS_ANKI_DECK_ID, getIeltsAnkiDeck } from './ieltsAnkiCards';

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

export interface AnkiDeckSummary {
  deckId: string;
  deckName: string;
  cardCount: number;
  noteCount: number;
  fieldNames?: string[];
  sampleRows?: Array<{
    word: string;
    definition: string;
    definitionZh?: string;
  }>;
  mappingConfidence?: 'high' | 'medium' | 'low';
  progressPreview?: {
    coarseMappedCount: number;
    reviewedCardCount: number;
  };
}

export type AnkiProgressMode = 'none' | 'coarse';

export type AnkiFieldMappingKey =
  | 'word'
  | 'definition'
  | 'definitionZh'
  | 'phonetic'
  | 'partOfSpeech'
  | 'examples'
  | 'topic'
  | 'tags';

export type AnkiFieldMapping = Partial<Record<AnkiFieldMappingKey, string>>;

export interface AnkiImportOptions {
  selectedDeckId: string;
  bookName?: string;
  source?: string;
  license?: string;
  version?: string;
  fileName?: string;
  progressMode?: AnkiProgressMode;
  fieldMapping?: AnkiFieldMapping;
}

export interface AnkiImportResult extends ImportResult {
  selectedDeck?: AnkiDeckSummary;
  skippedCards: number;
  mappedProgressCount: number;
  unmappedRows: ImportRowError[];
}

interface BuiltInBookTemplate {
  id: string;
  name: string;
  source: string;
  license: string;
  levelRange: string[];
  topicTags: string[];
  version?: string;
  filter: (word: WordData) => boolean;
}

export const BUILT_IN_WORD_BOOK_IDS = {
  A1_FOUNDATION: 'builtin_a1_foundation',
  A2_HIGH_FREQUENCY: 'builtin_a2_high_frequency',
  B1_CORE: 'builtin_b1_core',
  BUSINESS_ENGLISH: 'builtin_business_english',
  TECHNOLOGY_ENGLISH: 'builtin_technology_english',
  IELTS_ACADEMIC_CORE: 'builtin_ielts_academic_core',
  IELTS_ANKI_FOUNDATION: IELTS_ANKI_DECK_ID,
} as const;

const BUILT_IN_TEMPLATES: BuiltInBookTemplate[] = [
  {
    id: BUILT_IN_WORD_BOOK_IDS.A1_FOUNDATION,
    name: 'A1基础',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['A1'],
    topicTags: ['daily'],
    filter: (word) => word.level === 'A1',
  },
  {
    id: BUILT_IN_WORD_BOOK_IDS.A2_HIGH_FREQUENCY,
    name: 'A2高频',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['A2'],
    topicTags: ['daily', 'travel'],
    filter: (word) => word.level === 'A2',
  },
  {
    id: BUILT_IN_WORD_BOOK_IDS.B1_CORE,
    name: 'B1核心',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['B1'],
    topicTags: ['daily', 'business', 'technology'],
    filter: (word) => word.level === 'B1',
  },
  {
    id: BUILT_IN_WORD_BOOK_IDS.BUSINESS_ENGLISH,
    name: '商务英语',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['A2', 'B1', 'B2'],
    topicTags: ['business'],
    filter: (word) => word.topic === 'business',
  },
  {
    id: BUILT_IN_WORD_BOOK_IDS.TECHNOLOGY_ENGLISH,
    name: '科技英语',
    source: 'VocabDaily Open Word Set',
    license: 'Project dataset (open-source repository)',
    levelRange: ['B1', 'B2'],
    topicTags: ['technology', 'science'],
    filter: (word) => word.topic === 'technology' || word.topic === 'science',
  },
  {
    id: BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE,
    name: 'IELTS学术核心',
    source: 'hefengxian/ielts-vocabulary MIT IELTS source + VocabDaily IELTS cards + open academic word set',
    license: 'MIT source data, original educational content, and project dataset in this repository',
    levelRange: ['B1', 'B2', 'C1'],
    topicTags: ['academic', 'ielts', 'writing', 'speaking'],
    filter: (word) => {
      const topic = word.topic.toLowerCase();
      return ['B1', 'B2', 'C1'].includes(word.level) && (topic === 'academic' || topic === 'stem' || topic === 'ielts');
    },
  },
  {
    id: BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION,
    name: getIeltsAnkiDeck().name,
    source: getIeltsAnkiDeck().source,
    license: getIeltsAnkiDeck().license,
    levelRange: ['B2', 'C1'],
    topicTags: ['ielts', 'anki', 'writing', 'speaking'],
    version: getIeltsAnkiDeck().version,
    filter: (word) => word.id.startsWith('ielts_anki_'),
  },
];

export const DEFAULT_ACTIVE_BOOK_ID = BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE;

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
      version: template.version || '1.0.0',
    };
  });
};

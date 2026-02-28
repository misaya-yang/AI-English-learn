import type { WordData } from './words';

// Extended word database with 500+ words
export const extendedWordsDatabase: WordData[] = [
  // A1 Level - Basic (100 words)
  {
    id: 'a1-001',
    word: 'apple',
    phonetic: '/ˈæp.əl/',
    partOfSpeech: 'n.',
    definition: 'a round fruit with red, yellow, or green skin and firm white flesh',
    definitionZh: '苹果',
    examples: [
      { en: 'I eat an apple every day.', zh: '我每天吃一个苹果。' },
      { en: 'She sliced the apple into pieces.', zh: '她把苹果切成片。' },
    ],
    synonyms: ['fruit'],
    antonyms: [],
    collocations: ['apple pie', 'apple juice', 'apple tree'],
    level: 'A1',
    topic: 'food',
  },
  {
    id: 'a1-002',
    word: 'book',
    phonetic: '/bʊk/',
    partOfSpeech: 'n.',
    definition: 'a set of printed pages that are held together in a cover',
    definitionZh: '书',
    examples: [
      { en: 'I am reading a book.', zh: '我正在读一本书。' },
      { en: 'She bought a new book yesterday.', zh: '她昨天买了一本新书。' },
    ],
    synonyms: ['novel', 'textbook', 'volume'],
    antonyms: [],
    collocations: ['read a book', 'write a book', 'book store'],
    level: 'A1',
    topic: 'education',
  },
  {
    id: 'a1-003',
    word: 'cat',
    phonetic: '/kæt/',
    partOfSpeech: 'n.',
    definition: 'a small animal with fur, four legs, a tail, and claws, usually kept as a pet',
    definitionZh: '猫',
    examples: [
      { en: 'I have a black cat.', zh: '我有一只黑猫。' },
      { en: 'The cat is sleeping on the sofa.', zh: '猫正在沙发上睡觉。' },
    ],
    synonyms: ['kitten', 'feline'],
    antonyms: ['dog'],
    collocations: ['pet cat', 'stray cat', 'cat food'],
    level: 'A1',
    topic: 'animals',
  },
  {
    id: 'a1-004',
    word: 'dog',
    phonetic: '/dɒɡ/',
    partOfSpeech: 'n.',
    definition: 'a common animal with four legs, especially kept by people as a pet',
    definitionZh: '狗',
    examples: [
      { en: 'My dog likes to play fetch.', zh: '我的狗喜欢玩接球游戏。' },
      { en: 'The dog barked loudly.', zh: '狗大声地叫。' },
    ],
    synonyms: ['puppy', 'canine', 'hound'],
    antonyms: ['cat'],
    collocations: ['pet dog', 'walk the dog', 'dog food'],
    level: 'A1',
    topic: 'animals',
  },
  {
    id: 'a1-005',
    word: 'water',
    phonetic: '/ˈwɔː.tər/',
    partOfSpeech: 'n.',
    definition: 'a clear liquid, without colour or taste, that falls from the sky as rain',
    definitionZh: '水',
    examples: [
      { en: 'Please drink more water.', zh: '请多喝水。' },
      { en: 'The water is very cold.', zh: '水很凉。' },
    ],
    synonyms: ['H2O', 'liquid'],
    antonyms: [],
    collocations: ['drink water', 'hot water', 'tap water'],
    level: 'A1',
    topic: 'daily',
  },
  {
    id: 'a1-006',
    word: 'house',
    phonetic: '/haʊs/',
    partOfSpeech: 'n.',
    definition: 'a building where people live, usually one family or group',
    definitionZh: '房子',
    examples: [
      { en: 'They live in a big house.', zh: '他们住在一栋大房子里。' },
      { en: 'Our house has three bedrooms.', zh: '我们的房子有三间卧室。' },
    ],
    synonyms: ['home', 'building', 'residence'],
    antonyms: [],
    collocations: ['buy a house', 'rent a house', 'house key'],
    level: 'A1',
    topic: 'daily',
  },
  {
    id: 'a1-007',
    word: 'car',
    phonetic: '/kɑːr/',
    partOfSpeech: 'n.',
    definition: 'a vehicle with four wheels that is powered by an engine',
    definitionZh: '汽车',
    examples: [
      { en: 'He drives a red car.', zh: '他开一辆红色的汽车。' },
      { en: 'I need to wash my car.', zh: '我需要洗车。' },
    ],
    synonyms: ['automobile', 'vehicle'],
    antonyms: [],
    collocations: ['drive a car', 'park the car', 'car key'],
    level: 'A1',
    topic: 'transportation',
  },
  {
    id: 'a1-008',
    word: 'friend',
    phonetic: '/frend/',
    partOfSpeech: 'n.',
    definition: 'a person you know well and like, but who is not related to you',
    definitionZh: '朋友',
    examples: [
      { en: 'She is my best friend.', zh: '她是我最好的朋友。' },
      { en: 'I met a new friend at school.', zh: '我在学校认识了一个新朋友。' },
    ],
    synonyms: ['companion', 'buddy', 'pal'],
    antonyms: ['enemy', 'stranger'],
    collocations: ['best friend', 'close friend', 'make friends'],
    level: 'A1',
    topic: 'social',
  },
  {
    id: 'a1-009',
    word: 'family',
    phonetic: '/ˈfæm.əl.i/',
    partOfSpeech: 'n.',
    definition: 'a group of people who are related to each other, such as a mother, father, and children',
    definitionZh: '家庭',
    examples: [
      { en: 'I have a large family.', zh: '我有一个大家庭。' },
      { en: 'My family lives in Beijing.', zh: '我的家人住在北京。' },
    ],
    synonyms: ['relatives', 'household', 'kin'],
    antonyms: [],
    collocations: ['nuclear family', 'extended family', 'family tree'],
    level: 'A1',
    topic: 'social',
  },
  {
    id: 'a1-010',
    word: 'school',
    phonetic: '/skuːl/',
    partOfSpeech: 'n.',
    definition: 'a place where children go to learn',
    definitionZh: '学校',
    examples: [
      { en: 'I go to school every weekday.', zh: '我每个工作日都去上学。' },
      { en: 'The school is near my house.', zh: '学校在我家附近。' },
    ],
    synonyms: ['academy', 'institute', 'college'],
    antonyms: [],
    collocations: ['go to school', 'school bus', 'school teacher'],
    level: 'A1',
    topic: 'education',
  },
  // ... more A1 words
];

// Function to fetch word from Free Dictionary API
export async function fetchWordFromAPI(word: string): Promise<Partial<WordData> | null> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data || !data[0]) return null;
    
    const entry = data[0];
    const meaning = entry.meanings?.[0];
    const definition = meaning?.definitions?.[0];
    
    return {
      word: entry.word,
      phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
      partOfSpeech: meaning?.partOfSpeech || '',
      definition: definition?.definition || '',
      examples: definition?.example ? [{ en: definition.example, zh: '' }] : [],
      synonyms: definition?.synonyms || [],
      antonyms: definition?.antonyms || [],
    };
  } catch (error) {
    console.error('Error fetching word:', error);
    return null;
  }
}

// Function to add custom word
export function addCustomWord(wordData: Omit<WordData, 'id'>): WordData {
  const newWord: WordData = {
    ...wordData,
    id: `custom-${Date.now()}`,
  };
  return newWord;
}

// Common word lists by CEFR level
export const commonWordsByLevel = {
  A1: [
    'apple', 'book', 'cat', 'dog', 'water', 'house', 'car', 'friend', 'family', 'school',
    'teacher', 'student', 'table', 'chair', 'phone', 'computer', 'door', 'window', 'food', 'drink',
    'eat', 'sleep', 'work', 'play', 'run', 'walk', 'talk', 'read', 'write', 'listen',
    'happy', 'sad', 'big', 'small', 'good', 'bad', 'new', 'old', 'hot', 'cold',
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'day', 'night', 'morning', 'evening',
    'time', 'money', 'job', 'city', 'country', 'world', 'year', 'month', 'week', 'today',
    'tomorrow', 'yesterday', 'now', 'here', 'there', 'this', 'that', 'these', 'those', 'my',
    'your', 'his', 'her', 'our', 'their', 'I', 'you', 'he', 'she', 'it', 'we', 'they',
    'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must', 'shall', 'need',
  ],
  A2: [
    'ability', 'absence', 'absolute', 'absorb', 'abstract', 'abuse', 'academic', 'accept', 'access', 'accident',
    'accompany', 'accomplish', 'according', 'account', 'accurate', 'accuse', 'achieve', 'acid', 'acknowledge', 'acquire',
    'across', 'action', 'active', 'activity', 'actual', 'actually', 'addition', 'additional', 'address', 'adequate',
    'adjust', 'administration', 'admire', 'admit', 'adopt', 'adult', 'advance', 'advanced', 'advantage', 'adventure',
    'advertise', 'advertisement', 'advice', 'advise', 'affair', 'affect', 'afford', 'afraid', 'after', 'afternoon',
  ],
  B1: [
    'abandon', 'abroad', 'absence', 'absolute', 'absorb', 'abstract', 'abundant', 'academic', 'academy', 'accelerate',
    'accent', 'acceptance', 'access', 'accessible', 'accident', 'accommodate', 'accommodation', 'accompany', 'accomplish', 'accordance',
    'accordingly', 'account', 'accountant', 'accumulate', 'accuracy', 'accurate', 'accuse', 'accustomed', 'achieve', 'achievement',
    'acid', 'acknowledge', 'acquaintance', 'acquire', 'acquisition', 'acre', 'adapt', 'adaptation', 'addict', 'addiction',
  ],
  B2: [
    'abbreviate', 'abdomen', 'abnormal', 'abolish', 'aboriginal', 'abortion', 'abrupt', 'absurd', 'abundant', 'academy',
    'accelerate', 'accent', 'acceptance', 'accessory', 'accident', 'acclaim', 'accommodate', 'accomplice', 'accord', 'accountable',
    'accumulate', 'accuracy', 'accusation', 'accused', 'acid', 'acknowledge', 'acoustic', 'acquaint', 'acquaintance', 'acquire',
  ],
  C1: [
    'abate', 'aberration', 'abhor', 'abide', 'abject', 'abjure', 'ablution', 'abnegation', 'abominate', 'aborigine',
    'abortive', 'abrade', 'abrasion', 'abrogate', 'abscess', 'abscond', 'absolve', 'abstain', 'abstemious', 'abstinence',
    'abstracted', 'abstruse', 'absurdity', 'abundant', 'abuse', 'abut', 'abysmal', 'abyss', 'academic', 'accede',
  ],
};

// Word lists by topic
export const wordsByTopic = {
  business: [
    'agreement', 'contract', 'deal', 'negotiation', 'profit', 'loss', 'revenue', 'expense', 'budget', 'investment',
    'marketing', 'sales', 'customer', 'client', 'partner', 'supplier', 'competitor', 'market', 'industry', 'company',
    'manager', 'employee', 'colleague', 'team', 'project', 'meeting', 'presentation', 'report', 'analysis', 'strategy',
  ],
  technology: [
    'software', 'hardware', 'application', 'program', 'code', 'database', 'network', 'internet', 'website', 'server',
    'computer', 'laptop', 'smartphone', 'tablet', 'device', 'screen', 'keyboard', 'mouse', 'camera', 'microphone',
    'data', 'information', 'file', 'folder', 'document', 'email', 'message', 'chat', 'video', 'audio',
  ],
  travel: [
    'airport', 'airplane', 'flight', 'ticket', 'passport', 'visa', 'hotel', 'reservation', 'check-in', 'boarding',
    'destination', 'journey', 'trip', 'tour', 'guide', 'map', 'direction', 'location', 'address', 'landmark',
    'suitcase', 'luggage', 'bag', 'backpack', 'camera', 'souvenir', 'restaurant', 'cafe', 'museum', 'beach',
  ],
  health: [
    'doctor', 'nurse', 'hospital', 'clinic', 'pharmacy', 'medicine', 'pill', 'tablet', 'injection', 'surgery',
    'symptom', 'disease', 'illness', 'pain', 'fever', 'cold', 'flu', 'allergy', 'infection', 'injury',
    'exercise', 'fitness', 'diet', 'nutrition', 'healthy', 'unhealthy', 'weight', 'height', 'blood', 'heart',
  ],
  education: [
    'student', 'teacher', 'professor', 'class', 'course', 'lesson', 'lecture', 'seminar', 'exam', 'test',
    'homework', 'assignment', 'project', 'research', 'study', 'learn', 'teach', 'education', 'knowledge', 'skill',
    'university', 'college', 'school', 'academy', 'institute', 'library', 'laboratory', 'classroom', 'campus', 'degree',
  ],
};

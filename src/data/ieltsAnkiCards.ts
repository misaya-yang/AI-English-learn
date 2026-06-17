import type { WordData } from './words';

export type IeltsAnkiDifficulty = 'B2' | 'C1';
export type IeltsAnkiSkillFocus = 'writing' | 'speaking';

export interface IeltsAnkiCard {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  meaningZh: string;
  chineseHint: string;
  example: string;
  exampleZh: string;
  collocations: string[];
  phrasePatterns: string[];
  ieltsTag: string;
  difficulty: IeltsAnkiDifficulty;
  reviewTags: string[];
  skillFocus: IeltsAnkiSkillFocus[];
}

export interface IeltsAnkiDeck {
  id: string;
  name: string;
  source: string;
  license: string;
  version: string;
  cards: IeltsAnkiCard[];
}

export const IELTS_ANKI_DECK_ID = 'builtin_ielts_anki_foundation';

export const ieltsAnkiCards: IeltsAnkiCard[] = [
  {
    id: 'ielts_anki_alleviate',
    word: 'alleviate',
    phonetic: '/əˈliːvieɪt/',
    partOfSpeech: 'v.',
    meaning: 'to make a problem, pressure, or bad situation less severe',
    meaningZh: '缓解；减轻问题或压力',
    chineseHint: '写解决方案时用，比 make better 更正式。',
    example: 'Investment in public transport can alleviate traffic congestion in large cities.',
    exampleZh: '投资公共交通可以缓解大城市的交通拥堵。',
    collocations: ['alleviate pressure', 'alleviate poverty', 'alleviate congestion'],
    phrasePatterns: ['help alleviate the problem of ...', 'measures to alleviate ...'],
    ieltsTag: 'Task 2 solutions',
    difficulty: 'B2',
    reviewTags: ['solution', 'society', 'writing'],
    skillFocus: ['writing', 'speaking'],
  },
  {
    id: 'ielts_anki_detrimental',
    word: 'detrimental',
    phonetic: '/ˌdetrɪˈmentl/',
    partOfSpeech: 'adj.',
    meaning: 'harmful or likely to cause damage',
    meaningZh: '有害的；不利的',
    chineseHint: '用于说明负面影响，搭配 to。',
    example: 'Excessive screen time can be detrimental to children’s social development.',
    exampleZh: '过度屏幕时间可能不利于儿童的社交发展。',
    collocations: ['detrimental to health', 'detrimental effect', 'detrimental impact'],
    phrasePatterns: ['be detrimental to ...', 'have a detrimental effect on ...'],
    ieltsTag: 'Cause and effect',
    difficulty: 'C1',
    reviewTags: ['impact', 'health', 'children'],
    skillFocus: ['writing'],
  },
  {
    id: 'ielts_anki_feasible',
    word: 'feasible',
    phonetic: '/ˈfiːzəbl/',
    partOfSpeech: 'adj.',
    meaning: 'possible to do and practical enough to consider',
    meaningZh: '可行的；切实可做的',
    chineseHint: '讨论政策建议时，用来判断方案是否现实。',
    example: 'A gradual ban on single-use plastic may be more feasible than an immediate ban.',
    exampleZh: '逐步禁止一次性塑料可能比立即禁令更可行。',
    collocations: ['feasible option', 'feasible solution', 'economically feasible'],
    phrasePatterns: ['it is feasible to ...', 'a more feasible approach is ...'],
    ieltsTag: 'Policy evaluation',
    difficulty: 'B2',
    reviewTags: ['policy', 'solution', 'environment'],
    skillFocus: ['writing', 'speaking'],
  },
  {
    id: 'ielts_anki_constraint',
    word: 'constraint',
    phonetic: '/kənˈstreɪnt/',
    partOfSpeech: 'n.',
    meaning: 'a limit or restriction that affects what can be done',
    meaningZh: '限制；约束条件',
    chineseHint: '解释为什么好方案难落地时很有用。',
    example: 'Budget constraints often shape what schools can provide for students.',
    exampleZh: '预算限制常常影响学校能为学生提供什么。',
    collocations: ['budget constraint', 'time constraint', 'practical constraint'],
    phrasePatterns: ['within the constraints of ...', 'face severe constraints'],
    ieltsTag: 'Limitations',
    difficulty: 'B2',
    reviewTags: ['education', 'policy', 'problem'],
    skillFocus: ['writing', 'speaking'],
  },
  {
    id: 'ielts_anki_whereas',
    word: 'whereas',
    phonetic: '/ˌweərˈæz/',
    partOfSpeech: 'conj.',
    meaning: 'used to compare or contrast two facts',
    meaningZh: '然而；而（用于对比）',
    chineseHint: '写对比句时用，别和 however 混用位置。',
    example: 'Urban residents have better access to hospitals, whereas rural communities may rely on small clinics.',
    exampleZh: '城市居民更容易获得医院服务，而农村社区可能依赖小型诊所。',
    collocations: ['whereas rural areas', 'whereas younger people', 'whereas others argue'],
    phrasePatterns: ['A ..., whereas B ...', 'Some people argue ..., whereas others ...'],
    ieltsTag: 'Contrast',
    difficulty: 'B2',
    reviewTags: ['cohesion', 'contrast', 'writing'],
    skillFocus: ['writing'],
  },
  {
    id: 'ielts_anki_subsequently',
    word: 'subsequently',
    phonetic: '/ˈsʌbsɪkwəntli/',
    partOfSpeech: 'adv.',
    meaning: 'after something else has happened',
    meaningZh: '随后；后来',
    chineseHint: '用于描述顺序或结果，比 then 更正式。',
    example: 'Students who build strong reading habits subsequently perform better in writing tasks.',
    exampleZh: '养成良好阅读习惯的学生随后在写作任务中表现更好。',
    collocations: ['subsequently became', 'subsequently led to', 'subsequently improved'],
    phrasePatterns: ['..., and subsequently ...', 'This subsequently leads to ...'],
    ieltsTag: 'Sequencing',
    difficulty: 'B2',
    reviewTags: ['cohesion', 'process', 'writing'],
    skillFocus: ['writing', 'speaking'],
  },
  {
    id: 'ielts_anki_nuanced',
    word: 'nuanced',
    phonetic: '/ˈnjuːɑːnst/',
    partOfSpeech: 'adj.',
    meaning: 'showing small but important differences instead of being too simple',
    meaningZh: '有细微差别的；不一刀切的',
    chineseHint: '用于表达“更成熟的观点”，避免绝对化。',
    example: 'A nuanced view recognises both the benefits and the risks of tourism.',
    exampleZh: '一个更细致的观点会同时承认旅游业的好处和风险。',
    collocations: ['nuanced view', 'nuanced argument', 'more nuanced understanding'],
    phrasePatterns: ['a more nuanced view is that ...', 'offer a nuanced argument'],
    ieltsTag: 'Balanced argument',
    difficulty: 'C1',
    reviewTags: ['argument', 'balance', 'writing'],
    skillFocus: ['writing', 'speaking'],
  },
  {
    id: 'ielts_anki_tangible',
    word: 'tangible',
    phonetic: '/ˈtændʒəbl/',
    partOfSpeech: 'adj.',
    meaning: 'clear, real, and noticeable rather than just theoretical',
    meaningZh: '实际的；明确可见的',
    chineseHint: '用来强调某个政策或变化有真实效果。',
    example: 'Better public transport brings tangible benefits to commuters.',
    exampleZh: '更好的公共交通给通勤者带来实实在在的好处。',
    collocations: ['tangible benefit', 'tangible improvement', 'tangible evidence'],
    phrasePatterns: ['bring tangible benefits to ...', 'show tangible progress'],
    ieltsTag: 'Evidence and benefit',
    difficulty: 'B2',
    reviewTags: ['benefit', 'evidence', 'policy'],
    skillFocus: ['writing', 'speaking'],
  },
  {
    id: 'ielts_anki_proportion',
    word: 'proportion',
    phonetic: '/prəˈpɔːʃn/',
    partOfSpeech: 'n.',
    meaning: 'a part or share of a whole',
    meaningZh: '比例；份额',
    chineseHint: 'Task 1 图表和 Task 2 数据表达都常用。',
    example: 'A high proportion of household income is spent on rent in major cities.',
    exampleZh: '在大城市，家庭收入中很高的比例用于房租。',
    collocations: ['high proportion', 'large proportion', 'small proportion'],
    phrasePatterns: ['a high proportion of ...', 'the proportion of ... increased'],
    ieltsTag: 'Task 1 data',
    difficulty: 'B2',
    reviewTags: ['data', 'task1', 'housing'],
    skillFocus: ['writing', 'speaking'],
  },
  {
    id: 'ielts_anki_urbanization',
    word: 'urbanization',
    phonetic: '/ˌɜːbənaɪˈzeɪʃn/',
    partOfSpeech: 'n.',
    meaning: 'the process by which more people live and work in cities',
    meaningZh: '城市化',
    chineseHint: '城市、住房、交通、环境话题都能用。',
    example: 'Rapid urbanization can place pressure on housing and transport systems.',
    exampleZh: '快速城市化会给住房和交通系统带来压力。',
    collocations: ['rapid urbanization', 'urbanization process', 'urbanization rate'],
    phrasePatterns: ['as urbanization accelerates', 'the impact of urbanization on ...'],
    ieltsTag: 'Urban issues',
    difficulty: 'B2',
    reviewTags: ['city', 'housing', 'transport'],
    skillFocus: ['writing', 'speaking'],
  },
  {
    id: 'ielts_anki_cohesive',
    word: 'cohesive',
    phonetic: '/kəʊˈhiːsɪv/',
    partOfSpeech: 'adj.',
    meaning: 'connected in a clear and orderly way',
    meaningZh: '连贯的；衔接紧密的',
    chineseHint: '可用于评价文章结构，也可描述社会关系。',
    example: 'A cohesive essay uses clear topic sentences and logical transitions.',
    exampleZh: '一篇连贯的文章会使用清晰的主题句和有逻辑的过渡。',
    collocations: ['cohesive essay', 'cohesive society', 'cohesive structure'],
    phrasePatterns: ['create a cohesive argument', 'make the essay more cohesive'],
    ieltsTag: 'Writing quality',
    difficulty: 'C1',
    reviewTags: ['writing', 'cohesion', 'structure'],
    skillFocus: ['writing'],
  },
  {
    id: 'ielts_anki_trade_off',
    word: 'trade-off',
    phonetic: '/ˈtreɪd ɒf/',
    partOfSpeech: 'n.',
    meaning: 'a balance between two things, where gaining one means losing some of the other',
    meaningZh: '权衡；取舍',
    chineseHint: '讨论政策利弊时很自然，能让观点更成熟。',
    example: 'There is often a trade-off between economic growth and environmental protection.',
    exampleZh: '经济增长和环境保护之间常常存在取舍。',
    collocations: ['clear trade-off', 'policy trade-off', 'trade-off between A and B'],
    phrasePatterns: ['there is a trade-off between ... and ...', 'accept a trade-off'],
    ieltsTag: 'Balanced argument',
    difficulty: 'C1',
    reviewTags: ['argument', 'environment', 'economy'],
    skillFocus: ['writing', 'speaking'],
  },
];

export const ieltsAnkiDeck: IeltsAnkiDeck = {
  id: IELTS_ANKI_DECK_ID,
  name: 'IELTS Anki 写作/口语核心',
  source: 'VocabDaily original IELTS practice cards',
  license: 'Original educational content in this repository',
  version: '2026.06',
  cards: ieltsAnkiCards,
};

export const ieltsAnkiWordData: WordData[] = ieltsAnkiCards.map((card) => ({
  id: card.id,
  word: card.word,
  phonetic: card.phonetic,
  partOfSpeech: card.partOfSpeech,
  definition: card.meaning,
  definitionZh: card.meaningZh,
  examples: [{ en: card.example, zh: card.exampleZh }],
  synonyms: [],
  antonyms: [],
  collocations: [...card.collocations, ...card.phrasePatterns],
  level: card.difficulty,
  topic: 'ielts',
  memoryTip: card.chineseHint,
}));

export const getIeltsAnkiDeck = (): IeltsAnkiDeck => ieltsAnkiDeck;

export const getIeltsAnkiCardByWordId = (wordId: string): IeltsAnkiCard | undefined =>
  ieltsAnkiCards.find((card) => card.id === wordId);

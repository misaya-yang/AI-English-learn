/**
 * Grammar content for S21 - Grammar Practice feature.
 * 10 grammar points spanning CEFR A1–C2, each with exercises and examples.
 */

import type { CEFRLevel } from './readingContent';

export interface GrammarExercise {
  type: 'choice' | 'fill' | 'correction' | 'reorder' | 'translate';
  question: string;
  options?: string[];
  answer: string;
  explanationZh: string;
}

export interface GrammarPoint {
  id: string;
  title: string;
  titleZh: string;
  level: CEFRLevel;
  explanation: string;
  explanationZh: string;
  correctExamples: [string, string, string];
  incorrectExamples: [string, string, string];
  exercises: GrammarExercise[];
}

export const grammarPoints: GrammarPoint[] = [
  {
    id: 'gp-001',
    title: 'Present Simple: To Be',
    titleZh: '一般现在时：be动词',
    level: 'A1',
    explanation:
      'The verb "to be" has three forms in the present simple: am (I), is (he/she/it), are (you/we/they). It is used to describe states, identities, and characteristics.',
    explanationZh:
      '"be"动词在一般现在时有三种形式：am（I），is（he/she/it），are（you/we/they）。用于描述状态、身份和特征。',
    correctExamples: [
      'I am a student.',
      'She is very kind.',
      'They are from China.',
    ],
    incorrectExamples: [
      'I is happy. → I am happy.',
      'He are my brother. → He is my brother.',
      'We is tired. → We are tired.',
    ],
    exercises: [
      {
        type: 'choice',
        question: 'She ___ a doctor.',
        options: ['am', 'is', 'are', 'be'],
        answer: 'is',
        explanationZh: '第三人称单数（she）使用is。',
      },
      {
        type: 'choice',
        question: 'We ___ happy today.',
        options: ['am', 'is', 'are', 'be'],
        answer: 'are',
        explanationZh: '第一人称复数（we）使用are。',
      },
      {
        type: 'fill',
        question: 'I ___ a student. (be)',
        answer: 'am',
        explanationZh: '第一人称单数（I）使用am。',
      },
      {
        type: 'correction',
        question: 'They is my friends.',
        answer: 'They are my friends.',
        explanationZh: '第三人称复数（they）使用are，不用is。',
      },
      {
        type: 'choice',
        question: 'You ___ very tall.',
        options: ['am', 'is', 'are', 'be'],
        answer: 'are',
        explanationZh: '第二人称（you）使用are。',
      },
      {
        type: 'fill',
        question: 'He ___ from London. (be)',
        answer: 'is',
        explanationZh: '第三人称单数（he）使用is。',
      },
      {
        type: 'reorder',
        question: 'cold / is / today / it',
        answer: 'It is cold today.',
        explanationZh: '句子结构：主语 + be动词 + 描述语。',
      },
      {
        type: 'correction',
        question: 'I are at home.',
        answer: 'I am at home.',
        explanationZh: 'I后面只能用am。',
      },
      {
        type: 'translate',
        question: '他们是老师。',
        answer: 'They are teachers.',
        explanationZh: '主语they使用are，teacher加复数s。',
      },
      {
        type: 'choice',
        question: 'It ___ very cold outside.',
        options: ['am', 'is', 'are', 'be'],
        answer: 'is',
        explanationZh: '主语it使用is。',
      },
    ],
  },
  {
    id: 'gp-002',
    title: 'Present Continuous',
    titleZh: '现在进行时',
    level: 'A2',
    explanation:
      'The present continuous is formed with am/is/are + verb-ing. It describes actions happening now or around now, and planned future arrangements.',
    explanationZh:
      '现在进行时由am/is/are + 动词-ing构成。用于描述正在进行的动作或近期的安排。',
    correctExamples: [
      'I am studying English right now.',
      'She is cooking dinner at the moment.',
      'They are meeting tomorrow.',
    ],
    incorrectExamples: [
      'He studying at the library. → He is studying at the library.',
      'I am know the answer. → I know the answer. (stative verb)',
      'We are go to the cinema. → We are going to the cinema.',
    ],
    exercises: [
      {
        type: 'choice',
        question: 'She ___ a book at the moment.',
        options: ['reads', 'is reading', 'read', 'are reading'],
        answer: 'is reading',
        explanationZh: '"at the moment"表示现在正在进行，用现在进行时is reading。',
      },
      {
        type: 'fill',
        question: 'They ___ (play) football in the garden.',
        answer: 'are playing',
        explanationZh: 'they + are + 动词-ing。',
      },
      {
        type: 'correction',
        question: 'I am go to school.',
        answer: 'I am going to school.',
        explanationZh: 'be + 动词-ing，go要变成going。',
      },
      {
        type: 'choice',
        question: 'Listen! The birds ___ .',
        options: ['singing', 'are singing', 'is singing', 'sings'],
        answer: 'are singing',
        explanationZh: '"Listen!"暗示当下正在发生，birds（复数）用are singing。',
      },
      {
        type: 'fill',
        question: 'He ___ (watch) TV right now.',
        answer: 'is watching',
        explanationZh: 'he + is + 动词-ing。',
      },
      {
        type: 'reorder',
        question: 'coffee / is / she / drinking',
        answer: 'She is drinking coffee.',
        explanationZh: '主语 + is + 动词-ing + 宾语。',
      },
      {
        type: 'correction',
        question: 'We are have lunch.',
        answer: 'We are having lunch.',
        explanationZh: 'have用作动作动词时进行时形式为having。',
      },
      {
        type: 'translate',
        question: '我现在正在学中文。',
        answer: 'I am learning Chinese now.',
        explanationZh: '表示当前正在进行的动作，使用am + learning。',
      },
      {
        type: 'choice',
        question: 'What ___ you ___ right now?',
        options: ['are / doing', 'do / do', 'is / doing', 'are / do'],
        answer: 'are / doing',
        explanationZh: '疑问句结构：Are you doing...?',
      },
      {
        type: 'correction',
        question: 'I am knowing the answer.',
        answer: 'I know the answer.',
        explanationZh: 'know是状态动词，不用于进行时。',
      },
    ],
  },
  {
    id: 'gp-003',
    title: 'Past Simple',
    titleZh: '一般过去时',
    level: 'A2',
    explanation:
      'The past simple is used for completed actions at a specific time in the past. Regular verbs add -ed; irregular verbs have unique past forms. Negatives and questions use "did/didn\'t + base form".',
    explanationZh:
      '一般过去时用于表示过去特定时间完成的动作。规则动词加-ed；不规则动词有特殊过去式。否定和疑问句使用did/didn\'t + 动词原形。',
    correctExamples: [
      'She visited Paris last year.',
      'He didn\'t come to the party.',
      'Did you finish your homework?',
    ],
    incorrectExamples: [
      'I goed to the market. → I went to the market.',
      'She didn\'t went. → She didn\'t go.',
      'Did he came? → Did he come?',
    ],
    exercises: [
      {
        type: 'choice',
        question: 'We ___ a film last night.',
        options: ['watched', 'watch', 'watches', 'watching'],
        answer: 'watched',
        explanationZh: '"last night"表示过去，规则动词watch加-ed变watched。',
      },
      {
        type: 'fill',
        question: 'She ___ (go) to school yesterday.',
        answer: 'went',
        explanationZh: 'go是不规则动词，过去式是went。',
      },
      {
        type: 'correction',
        question: 'He didn\'t went to work.',
        answer: 'He didn\'t go to work.',
        explanationZh: 'didn\'t后面用动词原形go，不用went。',
      },
      {
        type: 'choice',
        question: '___  you sleep well last night?',
        options: ['Do', 'Did', 'Was', 'Were'],
        answer: 'Did',
        explanationZh: '一般过去时疑问句用Did。',
      },
      {
        type: 'fill',
        question: 'They ___ (not/eat) breakfast this morning.',
        answer: 'didn\'t eat',
        explanationZh: '否定结构：didn\'t + 动词原形eat。',
      },
      {
        type: 'reorder',
        question: 'yesterday / he / his / forgot / keys',
        answer: 'He forgot his keys yesterday.',
        explanationZh: 'forget的过去式是forgot。',
      },
      {
        type: 'correction',
        question: 'I buyed a new phone.',
        answer: 'I bought a new phone.',
        explanationZh: 'buy是不规则动词，过去式是bought，不是buyed。',
      },
      {
        type: 'translate',
        question: '她昨天没来上课。',
        answer: 'She didn\'t come to class yesterday.',
        explanationZh: '否定过去式：didn\'t + 动词原形come。',
      },
      {
        type: 'choice',
        question: 'I ___ very tired after the hike.',
        options: ['was', 'were', 'am', 'is'],
        answer: 'was',
        explanationZh: 'I的be动词过去时是was。',
      },
      {
        type: 'correction',
        question: 'Did she went home early?',
        answer: 'Did she go home early?',
        explanationZh: 'Did后面用动词原形go，不用went。',
      },
    ],
  },
  {
    id: 'gp-004',
    title: 'Present Perfect',
    titleZh: '现在完成时',
    level: 'B1',
    explanation:
      'The present perfect (have/has + past participle) connects past experience or actions to the present. It is used for life experiences (with ever/never), recent events with present relevance, and actions continuing to the present (with for/since).',
    explanationZh:
      '现在完成时（have/has + 过去分词）将过去的经历或动作与现在联系起来。用于表示人生经历（配合ever/never），与现在有关的近期事件，以及持续到现在的动作（配合for/since）。',
    correctExamples: [
      'I have visited Japan twice.',
      'She has just finished her homework.',
      'We have lived here for ten years.',
    ],
    incorrectExamples: [
      'I have saw that film. → I have seen that film.',
      'He has went to the bank. → He has gone to the bank.',
      'Did you ever eaten sushi? → Have you ever eaten sushi?',
    ],
    exercises: [
      {
        type: 'choice',
        question: 'She ___ her keys. She can\'t find them.',
        options: ['lost', 'has lost', 'is losing', 'loses'],
        answer: 'has lost',
        explanationZh: '过去发生的事情对现在有影响（找不到钥匙），用现在完成时。',
      },
      {
        type: 'fill',
        question: 'They ___ (live) here since 2015.',
        answer: 'have lived',
        explanationZh: 'since表示从某点起持续到现在，用现在完成时。',
      },
      {
        type: 'correction',
        question: 'Have you ever went to Australia?',
        answer: 'Have you ever been to Australia?',
        explanationZh: 'ever搭配现在完成时，go的过去分词是been（经历义）。',
      },
      {
        type: 'choice',
        question: 'I ___ never ___ Thai food.',
        options: ['have / tried', 'had / tried', 'have / try', 'did / try'],
        answer: 'have / tried',
        explanationZh: 'never用于现在完成时：have never + 过去分词。',
      },
      {
        type: 'fill',
        question: 'He ___ (just / finish) his report.',
        answer: 'has just finished',
        explanationZh: 'just表示刚刚完成，用现在完成时。',
      },
      {
        type: 'reorder',
        question: 'for / I / hours / have / three / waited',
        answer: 'I have waited for three hours.',
        explanationZh: 'for + 时间段，表示持续时长，用现在完成时。',
      },
      {
        type: 'correction',
        question: 'She has wrote three emails this morning.',
        answer: 'She has written three emails this morning.',
        explanationZh: 'write的过去分词是written，不是wrote。',
      },
      {
        type: 'translate',
        question: '你以前读过这本书吗？',
        answer: 'Have you read this book before?',
        explanationZh: '询问人生经历用现在完成时Have you + 过去分词。',
      },
      {
        type: 'choice',
        question: 'The train ___ already ___.',
        options: ['has / left', 'have / left', 'did / leave', 'was / leaving'],
        answer: 'has / left',
        explanationZh: 'already与现在完成时搭配，主语是单数the train用has。',
      },
      {
        type: 'correction',
        question: 'We have been in Paris last summer.',
        answer: 'We were in Paris last summer.',
        explanationZh: '"last summer"是具体过去时间点，应用一般过去时were，不用现在完成时。',
      },
    ],
  },
  {
    id: 'gp-005',
    title: 'Conditional Sentences: Type 1',
    titleZh: '条件句：第一类（真实条件句）',
    level: 'B1',
    explanation:
      'Type 1 conditionals express real or likely conditions in the present or future. Structure: If + present simple, will + base verb. The if-clause can also come second.',
    explanationZh:
      '第一类条件句表示现在或将来真实或可能的条件。结构：If + 一般现在时，will + 动词原形。if从句也可以放在后面。',
    correctExamples: [
      'If it rains, I will stay at home.',
      'She will be late if she doesn\'t hurry.',
      'If you study hard, you will pass the exam.',
    ],
    incorrectExamples: [
      'If it will rain, I stay home. → If it rains, I will stay home.',
      'If she will come, I will be happy. → If she comes, I will be happy.',
      'I call you if I will arrive. → I will call you if I arrive.',
    ],
    exercises: [
      {
        type: 'choice',
        question: 'If you ___ early, you will get a good seat.',
        options: ['arrive', 'will arrive', 'arrived', 'arriving'],
        answer: 'arrive',
        explanationZh: 'if从句用一般现在时，不用will。',
      },
      {
        type: 'fill',
        question: 'If it snows, the school ___ (close).',
        answer: 'will close',
        explanationZh: '主句用will + 动词原形。',
      },
      {
        type: 'correction',
        question: 'If she will study, she will pass.',
        answer: 'If she studies, she will pass.',
        explanationZh: 'if从句中不用will，用一般现在时studies。',
      },
      {
        type: 'choice',
        question: 'They will miss the bus if they ___ now.',
        options: ['don\'t leave', 'won\'t leave', 'didn\'t leave', 'not leave'],
        answer: 'don\'t leave',
        explanationZh: 'if从句用否定一般现在时don\'t leave。',
      },
      {
        type: 'fill',
        question: 'If I ___ (find) my keys, I will call you.',
        answer: 'find',
        explanationZh: 'if从句用一般现在时。',
      },
      {
        type: 'reorder',
        question: 'you / will / feel / if / better / rest / you',
        answer: 'You will feel better if you rest.',
        explanationZh: '第一类条件句：主句will + 动词原形，if从句一般现在时。',
      },
      {
        type: 'correction',
        question: 'If you will help me, I finish faster.',
        answer: 'If you help me, I will finish faster.',
        explanationZh: 'if从句用一般现在时help，主句用will finish。',
      },
      {
        type: 'translate',
        question: '如果你不快点，我们会错过电影。',
        answer: 'If you don\'t hurry, we will miss the film.',
        explanationZh: 'if从句否定一般现在时，主句will + 原形。',
      },
      {
        type: 'choice',
        question: 'If she ___ the job, she will be very happy.',
        options: ['gets', 'will get', 'got', 'getting'],
        answer: 'gets',
        explanationZh: 'if从句第三人称单数一般现在时，gets。',
      },
      {
        type: 'correction',
        question: 'I will call you if I will be free.',
        answer: 'I will call you if I am free.',
        explanationZh: 'if从句不用will，用一般现在时am。',
      },
    ],
  },
  {
    id: 'gp-006',
    title: 'Passive Voice',
    titleZh: '被动语态',
    level: 'B2',
    explanation:
      'The passive voice is formed with be + past participle. It is used when the focus is on the action or its recipient, not the doer. The agent (by + noun) is optional and often omitted. Tense is shown by the form of "be".',
    explanationZh:
      '被动语态由be + 过去分词构成。当焦点在动作或承受者而非执行者时使用。施事者（by + 名词）可选，常省略。时态通过be的形式体现。',
    correctExamples: [
      'This novel was written by Dickens.',
      'The package will be delivered tomorrow.',
      'The meeting has been cancelled.',
    ],
    incorrectExamples: [
      'The car was drove too fast. → The car was driven too fast.',
      'The email has been sended. → The email has been sent.',
      'The report is write every week. → The report is written every week.',
    ],
    exercises: [
      {
        type: 'choice',
        question: 'The letter ___ by the manager.',
        options: ['signed', 'was signed', 'has sign', 'is sign'],
        answer: 'was signed',
        explanationZh: '过去被动：was/were + 过去分词。',
      },
      {
        type: 'fill',
        question: 'English ___ (speak) all over the world.',
        answer: 'is spoken',
        explanationZh: '现在一般被动：is/are + 过去分词。',
      },
      {
        type: 'correction',
        question: 'The windows were broke during the storm.',
        answer: 'The windows were broken during the storm.',
        explanationZh: 'break的过去分词是broken，不是broke。',
      },
      {
        type: 'choice',
        question: 'A new hospital ___ next year.',
        options: ['is built', 'will be built', 'was built', 'has been built'],
        answer: 'will be built',
        explanationZh: '将来被动：will be + 过去分词。',
      },
      {
        type: 'fill',
        question: 'The project ___ (complete) by the end of this month.',
        answer: 'will be completed',
        explanationZh: '将来被动语态：will be + 过去分词。',
      },
      {
        type: 'reorder',
        question: 'was / the / stolen / wallet',
        answer: 'The wallet was stolen.',
        explanationZh: '简单过去被动：主语 + was + 过去分词。',
      },
      {
        type: 'correction',
        question: 'The cake was ate quickly.',
        answer: 'The cake was eaten quickly.',
        explanationZh: 'eat的过去分词是eaten，不是ate。',
      },
      {
        type: 'translate',
        question: '这座桥已经被修好了。',
        answer: 'The bridge has been repaired.',
        explanationZh: '现在完成被动：has/have been + 过去分词。',
      },
      {
        type: 'choice',
        question: 'The results ___ not yet been announced.',
        options: ['have', 'has', 'had', 'were'],
        answer: 'have',
        explanationZh: '现在完成被动：have/has been + 过去分词，主语results是复数用have。',
      },
      {
        type: 'correction',
        question: 'She was given a prize by the company last year.',
        answer: 'She was given a prize by the company last year.',
        explanationZh: '句子已经正确。被动语态：was given，施事者by the company可保留。',
      },
    ],
  },
  {
    id: 'gp-007',
    title: 'Reported Speech',
    titleZh: '间接引语',
    level: 'B2',
    explanation:
      'Reported speech conveys what someone said without quoting them directly. Tenses typically shift back (backshifting): present simple → past simple; past simple → past perfect; will → would. Time/place references also change.',
    explanationZh:
      '间接引语传达某人所说的话而不直接引用。时态通常向后移动（时态后移）：一般现在时→一般过去时；一般过去时→过去完成时；will→would。时间/地点参照也会改变。',
    correctExamples: [
      '"I am tired," she said. → She said that she was tired.',
      '"I will call you," he promised. → He promised that he would call me.',
      '"We have finished," they said. → They said that they had finished.',
    ],
    incorrectExamples: [
      '"I like pizza," he said. → He said that he likes pizza. ✗ → He said that he liked pizza.',
      '"I will come," she said. → She said she will come. ✗ → She said she would come.',
      '"We went home," they said. → They said they went home. ✗ → They said they had gone home.',
    ],
    exercises: [
      {
        type: 'fill',
        question: '"I am hungry," he said. → He said that he ___ hungry.',
        answer: 'was',
        explanationZh: '时态后移：am → was。',
      },
      {
        type: 'choice',
        question: '"She works here," he told me. → He told me that she ___ there.',
        options: ['works', 'worked', 'is working', 'has worked'],
        answer: 'worked',
        explanationZh: '时态后移：works → worked。',
      },
      {
        type: 'correction',
        question: '"I will help," she said. → She said she will help.',
        answer: 'She said she would help.',
        explanationZh: '时态后移：will → would。',
      },
      {
        type: 'fill',
        question: '"We have arrived," they said. → They said they ___ arrived.',
        answer: 'had',
        explanationZh: '时态后移：have arrived → had arrived（过去完成时）。',
      },
      {
        type: 'choice',
        question: '"I can swim," he said. → He said he ___ swim.',
        options: ['can', 'could', 'will', 'would'],
        answer: 'could',
        explanationZh: '情态动词时态后移：can → could。',
      },
      {
        type: 'reorder',
        question: 'that / she / he / tired / was / said',
        answer: 'He said that she was tired.',
        explanationZh: '间接引语结构：主语 + said + that + 从句（时态后移）。',
      },
      {
        type: 'correction',
        question: '"I am leaving now," she said. → She said she is leaving now.',
        answer: 'She said she was leaving then.',
        explanationZh: '时态后移is→was，now在间接引语中变为then。',
      },
      {
        type: 'translate',
        question: '他说他明天会来。（原话："I will come tomorrow."）',
        answer: 'He said he would come the next day.',
        explanationZh: 'will → would；tomorrow → the next day（时间副词变化）。',
      },
      {
        type: 'choice',
        question: '"I bought a car yesterday," she said. → She said she ___ a car the day before.',
        options: ['bought', 'has bought', 'had bought', 'was buying'],
        answer: 'had bought',
        explanationZh: '时态后移：past simple → past perfect（had bought）。',
      },
      {
        type: 'correction',
        question: '"I don\'t know," he said. → He said he doesn\'t know.',
        answer: 'He said he didn\'t know.',
        explanationZh: '时态后移：don\'t → didn\'t。',
      },
    ],
  },
  {
    id: 'gp-008',
    title: 'Subjunctive and Hypothetical Conditionals',
    titleZh: '虚拟语气与假设条件句',
    level: 'C1',
    explanation:
      'The subjunctive and Type 2/3 conditionals express unreal, hypothetical, or contrary-to-fact situations. Type 2: If + past simple, would + base verb (present unreal). Type 3: If + past perfect, would have + past participle (past unreal). "Were" is used for all persons in formal subjunctive.',
    explanationZh:
      '虚拟语气和第二/三类条件句表示非真实、假设或与事实相反的情况。第二类：If + 一般过去时，would + 动词原形（现在非真实）。第三类：If + 过去完成时，would have + 过去分词（过去非真实）。正式虚拟语气中所有人称都用were。',
    correctExamples: [
      'If I were rich, I would travel the world.',
      'If she had studied harder, she would have passed.',
      'I wish he were here.',
    ],
    incorrectExamples: [
      'If I was you, I would apologise. → If I were you, I would apologise.',
      'If they had known, they would avoid it. → If they had known, they would have avoided it.',
      'I wish I can fly. → I wish I could fly.',
    ],
    exercises: [
      {
        type: 'choice',
        question: 'If I ___ you, I would apologise immediately.',
        options: ['am', 'was', 'were', 'had been'],
        answer: 'were',
        explanationZh: '第二类条件句中"If I were you"是固定的虚拟语气形式。',
      },
      {
        type: 'fill',
        question: 'She would travel more if she ___ (have) more money.',
        answer: 'had',
        explanationZh: '第二类条件句if从句用一般过去时had。',
      },
      {
        type: 'correction',
        question: 'If they had arrived earlier, they would avoid the traffic.',
        answer: 'If they had arrived earlier, they would have avoided the traffic.',
        explanationZh: '第三类条件句主句用would have + 过去分词。',
      },
      {
        type: 'choice',
        question: 'I wish I ___ speak Japanese.',
        options: ['can', 'could', 'will', 'would'],
        answer: 'could',
        explanationZh: 'wish表示现在不可实现的愿望，后面用过去时（could）。',
      },
      {
        type: 'fill',
        question: 'If she ___ (tell) me, I would have helped.',
        answer: 'had told',
        explanationZh: '第三类条件句if从句用过去完成时had told。',
      },
      {
        type: 'reorder',
        question: 'I / the job / applied / would / have / got / if / I / for / it',
        answer: 'I would have got the job if I had applied for it.',
        explanationZh: '第三类条件句：would have + 过去分词；if + 过去完成时。',
      },
      {
        type: 'correction',
        question: 'If I would have known, I would have told you.',
        answer: 'If I had known, I would have told you.',
        explanationZh: '第三类条件句if从句用过去完成时had known，不用would have。',
      },
      {
        type: 'translate',
        question: '如果他当时在这里，他会帮我们的。',
        answer: 'If he had been here, he would have helped us.',
        explanationZh: '第三类条件句：if + 过去完成时，would have + 过去分词。',
      },
      {
        type: 'choice',
        question: 'She acts as if she ___ the boss.',
        options: ['is', 'was', 'were', 'has been'],
        answer: 'were',
        explanationZh: '"as if"后接虚拟语气，用were表示与事实不符的假设。',
      },
      {
        type: 'correction',
        question: 'I wish I studied harder last year.',
        answer: 'I wish I had studied harder last year.',
        explanationZh: '对过去的遗憾用wish + 过去完成时had studied。',
      },
    ],
  },
  {
    id: 'gp-009',
    title: 'Cleft Sentences',
    titleZh: '分裂句',
    level: 'C1',
    explanation:
      'Cleft sentences split information to emphasise one element. "It-cleft": It was [focus] that/who [rest]. "Wh-cleft": What [subject/verb] is/was [focus]. They allow nuanced focus and contrast in formal and written English.',
    explanationZh:
      '分裂句将信息拆分以强调某一要素。"It分裂句"：It was [强调部分] that/who [其余部分]。"Wh分裂句"：What [主语/动词] is/was [强调部分]。在正式书面英语中用于精细聚焦和对比。',
    correctExamples: [
      'It was Maria who won the prize, not Sarah.',
      'It is hard work that leads to success.',
      'What I need is a good rest.',
    ],
    incorrectExamples: [
      'It was the car broken down. → It was the car that broke down.',
      'What I want to travel. → What I want is to travel.',
      'It is Tom who have the key. → It is Tom who has the key.',
    ],
    exercises: [
      {
        type: 'choice',
        question: '___ was the manager who made the final decision.',
        options: ['That', 'What', 'It', 'This'],
        answer: 'It',
        explanationZh: 'It分裂句：It + was/is + 强调部分 + that/who + 其余部分。',
      },
      {
        type: 'fill',
        question: '___ I enjoy most about this job is the variety.',
        answer: 'What',
        explanationZh: 'Wh分裂句：What + 主句，is/was + 强调部分。',
      },
      {
        type: 'correction',
        question: 'It was London where she was born there.',
        answer: 'It was in London that she was born.',
        explanationZh: 'It分裂句中that从句不重复地点副词there。',
      },
      {
        type: 'choice',
        question: 'What we need ___ more time to prepare.',
        options: ['are', 'is', 'were', 'have'],
        answer: 'is',
        explanationZh: 'Wh分裂句中强调部分前用is（单数）。',
      },
      {
        type: 'fill',
        question: 'It was not until midnight ___ she realised her mistake.',
        answer: 'that',
        explanationZh: 'It was not until…that是强调时间的固定分裂句结构。',
      },
      {
        type: 'reorder',
        question: 'was / the / noise / it / woke / that / me / up',
        answer: 'It was the noise that woke me up.',
        explanationZh: 'It分裂句结构：It + was + 强调部分 + that + 其余部分。',
      },
      {
        type: 'correction',
        question: 'What she told me it surprised me.',
        answer: 'What she told me surprised me.',
        explanationZh: 'Wh分裂句中What从句已是主语，不需要再加代词it。',
      },
      {
        type: 'translate',
        question: '正是他的诚实让我尊重他。',
        answer: 'It is his honesty that I respect.',
        explanationZh: 'It分裂句强调his honesty：It is + 强调部分 + that + 其余部分。',
      },
      {
        type: 'choice',
        question: 'It was in 1969 ___ humans first landed on the moon.',
        options: ['when', 'where', 'that', 'which'],
        answer: 'that',
        explanationZh: 'It分裂句中通常用that（强调时间时也可用when，但that更通用）。',
      },
      {
        type: 'correction',
        question: 'What does bother me is his attitude.',
        answer: 'What bothers me is his attitude.',
        explanationZh: 'Wh分裂句中What引导名词从句，用陈述句语序bothers，不用does。',
      },
    ],
  },
  {
    id: 'gp-010',
    title: 'Inversion for Emphasis',
    titleZh: '倒装句（强调用法）',
    level: 'C2',
    explanation:
      'Inversion places the auxiliary or verb before the subject for rhetorical emphasis or formality. It is triggered by negative/restrictive adverbials (never, rarely, not only, only when, no sooner, scarcely, little) and by conditional inversion (Were/Had/Should instead of if-clauses).',
    explanationZh:
      '倒装句将助动词或动词置于主语之前，用于修辞强调或正式语体。由否定/限制性状语（never, rarely, not only, only when, no sooner, scarcely, little）或条件句倒装（用Were/Had/Should代替if从句）触发。',
    correctExamples: [
      'Never have I seen such dedication.',
      'Not only did she apologise, but she also offered to help.',
      'Had I known, I would have acted differently.',
    ],
    incorrectExamples: [
      'Never I have seen such courage. → Never have I seen such courage.',
      'Not only she apologised but helped too. → Not only did she apologise, but she also helped.',
      'Should you need help, you can to contact us. → Should you need help, you can contact us.',
    ],
    exercises: [
      {
        type: 'choice',
        question: 'Rarely ___ such talent in a young musician.',
        options: ['I have seen', 'have I seen', 'I had seen', 'had I seen'],
        answer: 'have I seen',
        explanationZh: 'Rarely触发倒装：助动词have + 主语I + 过去分词seen。',
      },
      {
        type: 'fill',
        question: 'Not only ___ the report late, but it was full of errors. (submit)',
        answer: 'was the report submitted',
        explanationZh: 'Not only触发倒装：was + 主语 + 过去分词。',
      },
      {
        type: 'correction',
        question: 'No sooner I had arrived than the meeting started.',
        answer: 'No sooner had I arrived than the meeting started.',
        explanationZh: 'No sooner触发倒装：had + 主语 + 过去分词，后面用than。',
      },
      {
        type: 'choice',
        question: '___ I known about the delay, I would have left earlier.',
        options: ['Have', 'Had', 'Did', 'Should'],
        answer: 'Had',
        explanationZh: '条件句倒装：Had + 主语 + 过去分词，等同于If I had known。',
      },
      {
        type: 'fill',
        question: 'Only when the results were published ___ (believe) the findings.',
        answer: 'did people believe',
        explanationZh: 'Only when触发倒装：did + 主语 + 动词原形。',
      },
      {
        type: 'reorder',
        question: 'offered / he / such / been / dedication / never / has',
        answer: 'Never has he been offered such dedication.',
        explanationZh: 'Never触发倒装：Never + has + 主语 + 过去分词。',
      },
      {
        type: 'correction',
        question: 'Scarcely she had begun when the fire alarm sounded.',
        answer: 'Scarcely had she begun when the fire alarm sounded.',
        explanationZh: 'Scarcely触发倒装：Scarcely + had + 主语 + 动词，后面用when。',
      },
      {
        type: 'translate',
        question: '如果你需要任何帮助，请联系我们。（用倒装条件句）',
        answer: 'Should you need any help, please contact us.',
        explanationZh: 'Should + 主语 + 动词原形，等同于If you should need...，语气更正式。',
      },
      {
        type: 'choice',
        question: 'Little ___ that his decision would change everything.',
        options: ['he realised', 'did he realise', 'he did realise', 'he has realised'],
        answer: 'did he realise',
        explanationZh: 'Little触发倒装：did + 主语 + 动词原形。',
      },
      {
        type: 'correction',
        question: 'Not only did she won the award, she also broke the record.',
        answer: 'Not only did she win the award, but she also broke the record.',
        explanationZh: 'Not only...but also是固定搭配；did后接动词原形win，不用won。',
      },
    ],
  },
];

// ─── Helper functions ────────────────────────────────────────────────────────

export function getGrammarById(id: string): GrammarPoint | undefined {
  return grammarPoints.find((g) => g.id === id);
}

export function getGrammarByLevel(level: CEFRLevel): GrammarPoint[] {
  return grammarPoints.filter((g) => g.level === level);
}

/**
 * Reading content for S19 - Reading Comprehension feature.
 * 10 sample articles spanning CEFR A1–C2 with comprehension questions and key vocabulary.
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ComprehensionQuestion {
  question: string;
  questionZh: string;
  options: string[];
  correctIndex: number;
}

export interface KeyVocabulary {
  word: string;
  definition: string;
  definitionZh: string;
}

export interface ReadingArticle {
  id: string;
  title: string;
  titleZh: string;
  level: CEFRLevel;
  category: string;
  content: string;
  comprehensionQuestions: ComprehensionQuestion[];
  keyVocabulary: KeyVocabulary[];
}

export const readingArticles: ReadingArticle[] = [
  {
    id: 'ra-001',
    title: 'My Family',
    titleZh: '我的家人',
    level: 'A1',
    category: 'Daily Life',
    content:
      'My name is Anna. I have a small family. My father is a doctor. My mother is a teacher. I have one brother. His name is Tom. Tom is ten years old. I am twelve years old. We live in a small house. Our house has three rooms. We have a dog. The dog is brown and white. His name is Max. We love Max very much. Every morning, my father drinks coffee. My mother drinks tea. Tom and I drink milk. After breakfast, we go to school. Our school is near our house. We walk to school every day. In the afternoon, we come home and do homework. Then we have dinner together. We are a happy family.',
    comprehensionQuestions: [
      {
        question: "What is Anna's father's job?",
        questionZh: "安娜的父亲是做什么的？",
        options: ['Teacher', 'Doctor', 'Driver', 'Cook'],
        correctIndex: 1,
      },
      {
        question: 'How old is Tom?',
        questionZh: '汤姆几岁？',
        options: ['Eight', 'Twelve', 'Ten', 'Nine'],
        correctIndex: 2,
      },
      {
        question: "What is the dog's name?",
        questionZh: '狗叫什么名字？',
        options: ['Max', 'Rex', 'Buddy', 'Bob'],
        correctIndex: 0,
      },
      {
        question: 'How do the children go to school?',
        questionZh: '孩子们怎么去学校？',
        options: ['By bus', 'By car', 'By bike', 'They walk'],
        correctIndex: 3,
      },
      {
        question: 'What does Anna drink in the morning?',
        questionZh: '安娜早上喝什么？',
        options: ['Coffee', 'Tea', 'Milk', 'Water'],
        correctIndex: 2,
      },
    ],
    keyVocabulary: [
      { word: 'family', definition: 'a group of people related to each other', definitionZh: '家庭' },
      { word: 'doctor', definition: 'a person who treats sick people', definitionZh: '医生' },
      { word: 'breakfast', definition: 'the first meal of the day', definitionZh: '早餐' },
    ],
  },
  {
    id: 'ra-002',
    title: 'A Trip to the Market',
    titleZh: '去市场购物',
    level: 'A2',
    category: 'Daily Life',
    content:
      'Every Saturday morning, Maria goes to the local market with her mother. The market opens at eight o\'clock and closes at two o\'clock in the afternoon. There are many stalls selling vegetables, fruit, meat, and bread. Maria\'s favourite stall sells fresh strawberries. Last Saturday, Maria and her mother bought tomatoes, onions, potatoes, and some apples. They also bought a bunch of flowers for their living room. The market is always very busy on weekends. People come from different parts of the town. Some people arrive by car, and others take the bus. The sellers are friendly and often give small discounts to regular customers. Maria\'s mother has been going to this market for fifteen years. She knows most of the sellers by name. After shopping, they always stop for a cup of tea at the small café near the entrance. Maria looks forward to these Saturday trips every week.',
    comprehensionQuestions: [
      {
        question: 'What time does the market open?',
        questionZh: '市场几点开门？',
        options: ['Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock', 'Ten o\'clock'],
        correctIndex: 1,
      },
      {
        question: 'What is Maria\'s favourite stall?',
        questionZh: '玛利亚最喜欢哪个摊位？',
        options: ['Vegetables', 'Flowers', 'Fresh strawberries', 'Bread'],
        correctIndex: 2,
      },
      {
        question: 'How long has Maria\'s mother been going to the market?',
        questionZh: '玛利亚的母亲去这个市场多少年了？',
        options: ['Five years', 'Ten years', 'Twenty years', 'Fifteen years'],
        correctIndex: 3,
      },
      {
        question: 'What do they do after shopping?',
        questionZh: '购物后她们做什么？',
        options: ['Go home immediately', 'Have tea at a café', 'Visit friends', 'Go to a restaurant'],
        correctIndex: 1,
      },
      {
        question: 'Why do sellers give discounts to some customers?',
        questionZh: '卖家为什么给某些顾客打折？',
        options: ['They are children', 'They are regular customers', 'They buy a lot', 'They are friends'],
        correctIndex: 1,
      },
    ],
    keyVocabulary: [
      { word: 'stall', definition: 'a small stand or booth at a market', definitionZh: '摊位' },
      { word: 'discount', definition: 'a reduction in price', definitionZh: '折扣' },
      { word: 'regular', definition: 'happening often or at fixed times', definitionZh: '固定的；常客' },
    ],
  },
  {
    id: 'ra-003',
    title: 'Learning a New Language',
    titleZh: '学习一门新语言',
    level: 'B1',
    category: 'Education',
    content:
      'Learning a new language is one of the most rewarding things a person can do. It opens doors to new cultures, new friendships, and new career opportunities. However, many people find it challenging, especially as adults. Research shows that children learn languages more easily than adults because their brains are still developing. Despite this, adults have several advantages. They have better study skills, a wider general knowledge, and greater motivation. The key to success in language learning is consistency. Studying for thirty minutes every day is far more effective than studying for five hours once a week. Using the language in real situations is also important. Watching films, listening to podcasts, and speaking with native speakers all help learners improve quickly. Making mistakes is a natural part of the process. Learners should not be afraid of errors—each mistake is an opportunity to improve. Setting realistic goals also helps. For example, aiming to hold a basic conversation in three months is more achievable than trying to become fluent in the same period. With patience and the right strategy, anyone can learn a new language at any age.',
    comprehensionQuestions: [
      {
        question: 'Why do children learn languages more easily than adults?',
        questionZh: '为什么儿童比成人更容易学语言？',
        options: ['They study more', 'Their brains are still developing', 'They have more time', 'They are not afraid'],
        correctIndex: 1,
      },
      {
        question: 'What study pattern is recommended?',
        questionZh: '推荐哪种学习方式？',
        options: ['5 hours once a week', '1 hour twice a week', '30 minutes every day', '2 hours on weekends'],
        correctIndex: 2,
      },
      {
        question: 'What should learners think about making mistakes?',
        questionZh: '学习者应该如何看待犯错？',
        options: ['Mistakes are very bad', 'Mistakes are normal and help improvement', 'Mistakes should be avoided', 'Mistakes show lack of talent'],
        correctIndex: 1,
      },
      {
        question: 'Which of the following is an advantage adults have over children?',
        questionZh: '以下哪项是成人相对儿童的优势？',
        options: ['Faster brain development', 'Better study skills', 'More free time', 'Stronger memory'],
        correctIndex: 1,
      },
      {
        question: 'What is given as an example of a realistic goal?',
        questionZh: '文中举了什么例子作为现实目标？',
        options: ['Becoming fluent in one month', 'Reading novels in 6 months', 'Holding a basic conversation in 3 months', 'Passing an exam in a week'],
        correctIndex: 2,
      },
    ],
    keyVocabulary: [
      { word: 'consistency', definition: 'doing something regularly without change', definitionZh: '坚持；一致性' },
      { word: 'motivation', definition: 'the reason or desire to do something', definitionZh: '动力；积极性' },
      { word: 'fluent', definition: 'able to speak a language easily and well', definitionZh: '流利的' },
    ],
  },
  {
    id: 'ra-004',
    title: 'The Rise of Remote Work',
    titleZh: '远程工作的兴起',
    level: 'B2',
    category: 'Business',
    content:
      'The concept of remote work is not new, but the COVID-19 pandemic accelerated its adoption on an unprecedented scale. Millions of office workers around the world were suddenly required to work from home, and companies had to adapt rapidly. What began as a temporary measure has, for many organisations, become a permanent fixture. Proponents of remote work argue that it offers significant benefits. Employees often report higher productivity when freed from the distractions of a busy office. They save time and money on commuting, and many enjoy a better work-life balance. For employers, remote work can reduce overhead costs such as office rent and utilities. However, the model is not without its critics. Managers sometimes worry about employee supervision and the loss of spontaneous collaboration that occurs naturally in shared workspaces. New employees may struggle to integrate into company culture when working remotely. Studies have produced mixed results regarding the long-term productivity of remote workers. Many companies have settled on a hybrid approach, allowing employees to split their time between home and the office. This model attempts to capture the benefits of both arrangements while mitigating the drawbacks. As remote work technology continues to improve—with advances in video conferencing, project management tools, and digital collaboration platforms—the future of work looks increasingly flexible.',
    comprehensionQuestions: [
      {
        question: 'What event massively accelerated the adoption of remote work?',
        questionZh: '哪个事件极大地加速了远程工作的普及？',
        options: ['The financial crisis', 'COVID-19 pandemic', 'Advances in technology', 'Government policy'],
        correctIndex: 1,
      },
      {
        question: 'What is one benefit of remote work for employers?',
        questionZh: '远程工作对雇主有什么好处？',
        options: ['Better employee relationships', 'Reduced overhead costs', 'Easier supervision', 'More collaboration'],
        correctIndex: 1,
      },
      {
        question: 'What concern do managers have about remote work?',
        questionZh: '管理者对远程工作有什么顾虑？',
        options: ['Too much productivity', 'Employee supervision and collaboration loss', 'High technology costs', 'Legal issues'],
        correctIndex: 1,
      },
      {
        question: 'What is the "hybrid approach" mentioned in the article?',
        questionZh: '文中提到的"混合模式"是什么？',
        options: ['Working only at home', 'Working only at office', 'Splitting time between home and office', 'Working in different cities'],
        correctIndex: 2,
      },
      {
        question: 'What does the article suggest about the future of work?',
        questionZh: '文章对工作的未来有什么看法？',
        options: ['Everyone will return to offices', 'Work will become more flexible', 'Remote work will be banned', 'Offices will disappear'],
        correctIndex: 1,
      },
    ],
    keyVocabulary: [
      { word: 'unprecedented', definition: 'never done or known before', definitionZh: '前所未有的' },
      { word: 'overhead costs', definition: 'regular costs of running a business (rent, utilities, etc.)', definitionZh: '管理费用；日常开销' },
      { word: 'hybrid', definition: 'a combination of two different things', definitionZh: '混合的；混合模式' },
    ],
  },
  {
    id: 'ra-005',
    title: 'Cognitive Biases in Decision Making',
    titleZh: '决策中的认知偏见',
    level: 'C1',
    category: 'Psychology',
    content:
      'Human beings are not the rational decision-makers that classical economics once assumed. Decades of research in behavioural economics and cognitive psychology have revealed that our judgements are systematically distorted by a range of cognitive biases—predictable errors in thinking that arise from the mental shortcuts, or heuristics, our brains use to process information efficiently. One of the most well-documented is confirmation bias: the tendency to seek out and favour information that confirms our pre-existing beliefs while discounting contradictory evidence. This operates largely below the level of conscious awareness, making it particularly insidious. Anchoring bias occurs when individuals rely too heavily on the first piece of information encountered. In salary negotiations, for instance, the initial figure proposed often serves as a psychological anchor that disproportionately influences the final outcome. The availability heuristic leads people to overestimate the likelihood of events that come easily to mind—typically vivid, recent, or emotionally charged occurrences. After a plane crash receives extensive media coverage, many people temporarily overestimate the danger of air travel, even though statistically it remains far safer than driving. Understanding these biases is the first step towards mitigating their influence. Structured decision-making frameworks, peer review, and deliberately seeking out disconfirming evidence are among the strategies that individuals and organisations employ to counteract cognitive distortions. Nevertheless, complete elimination of bias remains elusive; even those aware of these tendencies remain susceptible.',
    comprehensionQuestions: [
      {
        question: 'What are heuristics, as described in the article?',
        questionZh: '文中所描述的"启发式"是什么？',
        options: ['Scientific experiments', 'Mental shortcuts the brain uses', 'Formal decision frameworks', 'Economic models'],
        correctIndex: 1,
      },
      {
        question: 'What makes confirmation bias particularly insidious?',
        questionZh: '为什么确认偏误特别危险？',
        options: ['It is very common', 'It operates below conscious awareness', 'It affects only uneducated people', 'It is impossible to study'],
        correctIndex: 1,
      },
      {
        question: 'How does anchoring bias affect salary negotiations?',
        questionZh: '锚定偏差如何影响薪资谈判？',
        options: ['It makes people accept lower salaries always', 'The first number proposed influences the final outcome', 'Negotiators ignore numbers completely', 'It speeds up the negotiation'],
        correctIndex: 1,
      },
      {
        question: 'Why do people overestimate air travel danger after plane crash news?',
        questionZh: '为什么飞机失事新闻后人们高估了空中旅行的危险？',
        options: ['Because statistics are unreliable', 'Due to the availability heuristic', 'Because planes are actually dangerous', 'Due to government warnings'],
        correctIndex: 1,
      },
      {
        question: 'Can cognitive biases be completely eliminated?',
        questionZh: '认知偏见能被完全消除吗？',
        options: ['Yes, with enough training', 'Yes, with the right tools', 'No, even aware people remain susceptible', 'The article does not say'],
        correctIndex: 2,
      },
    ],
    keyVocabulary: [
      { word: 'heuristic', definition: 'a mental shortcut used to make quick decisions', definitionZh: '启发式；经验法则' },
      { word: 'confirmation bias', definition: 'tendency to favour information confirming existing beliefs', definitionZh: '确认偏误' },
      { word: 'insidious', definition: 'proceeding in a gradual, subtle way but with harmful effects', definitionZh: '潜伏的；隐险的' },
    ],
  },
  {
    id: 'ra-006',
    title: 'The Ethics of Artificial Intelligence',
    titleZh: '人工智能的伦理问题',
    level: 'C2',
    category: 'Technology',
    content:
      'As artificial intelligence systems permeate ever wider domains of human activity—from hiring algorithms and judicial risk assessment tools to medical diagnosis and autonomous weapons—the ethical questions they raise have moved from speculative philosophy into urgent policy debate. Central to these discussions is the problem of algorithmic fairness. Machine learning models trained on historical data inevitably inherit and may amplify the biases embedded in that data. A hiring algorithm trained on decades of predominantly male applicant pools may perpetuate gender discrimination not through any explicitly discriminatory rule, but through the statistical patterns it has absorbed. The opacity of complex neural networks—often described as "black boxes"—compounds this problem. When a credit-scoring algorithm denies a loan application, neither the applicant nor the regulator may be able to extract a comprehensible explanation for the decision. This lack of interpretability conflicts directly with principles of procedural justice that underpin legal systems across the globe. Philosophers and computer scientists have proposed various frameworks for AI ethics: consequentialist approaches that evaluate AI systems purely by their outcomes, deontological frameworks that mandate respect for individual rights regardless of aggregate benefits, and virtue ethics approaches that ask what kind of AI systems a society of good character would build. Each framework illuminates different facets of the problem while leaving others in shadow. The emergence of large language models has added new dimensions to the debate—questions of intellectual property, the nature of creativity, and the erosion of epistemic autonomy as individuals increasingly delegate reasoning to AI systems. Governance frameworks are struggling to keep pace with technological development, and the risk of regulatory capture by well-resourced technology incumbents adds further urgency to calls for robust, democratically accountable AI oversight.',
    comprehensionQuestions: [
      {
        question: 'Why might a hiring algorithm perpetuate gender discrimination?',
        questionZh: '招聘算法为什么可能延续性别歧视？',
        options: ['Developers program it to discriminate', 'It is trained on biased historical data', 'Companies instruct it to do so', 'It cannot process gender data'],
        correctIndex: 1,
      },
      {
        question: 'What does "black box" refer to in the context of AI?',
        questionZh: '在人工智能语境中，"黑盒子"是什么意思？',
        options: ['Illegal AI systems', 'AI used in aviation', 'AI systems whose internal decisions are not transparent', 'Encrypted AI data'],
        correctIndex: 2,
      },
      {
        question: 'What principle conflicts with the lack of AI interpretability?',
        questionZh: '哪个原则与人工智能缺乏可解释性相冲突？',
        options: ['Efficiency', 'Procedural justice', 'Market competition', 'National security'],
        correctIndex: 1,
      },
      {
        question: 'Which ethical framework evaluates AI purely by outcomes?',
        questionZh: '哪种伦理框架纯粹根据结果评估人工智能？',
        options: ['Deontological', 'Virtue ethics', 'Consequentialist', 'Libertarian'],
        correctIndex: 2,
      },
      {
        question: 'What concern does the article raise about large language models specifically?',
        questionZh: '文章对大型语言模型特别提出了什么担忧？',
        options: ['They are too expensive', 'They may erode epistemic autonomy', 'They replace human jobs entirely', 'They require too much energy'],
        correctIndex: 1,
      },
    ],
    keyVocabulary: [
      { word: 'algorithmic fairness', definition: 'the principle that AI decision-making should be free from unjust bias', definitionZh: '算法公平性' },
      { word: 'opacity', definition: 'the quality of being difficult to understand or see through', definitionZh: '不透明性' },
      { word: 'epistemic autonomy', definition: 'the capacity to form one\'s own knowledge and beliefs independently', definitionZh: '认知自主性' },
    ],
  },
  {
    id: 'ra-007',
    title: 'Animals at the Zoo',
    titleZh: '动物园里的动物',
    level: 'A1',
    category: 'Nature',
    content:
      'Today I am at the zoo with my class. There are many animals here. I can see lions and tigers. They are big and strong. The lions have yellow fur. The tigers have orange and black stripes. I also see monkeys. The monkeys are funny. They jump and play. Near the water, there are hippos. Hippos are very big and heavy. They like to swim. My favourite animal is the giraffe. Giraffes have very long necks. They eat leaves from tall trees. There is also a bird area. I can see parrots. Parrots are colourful. Some parrots can talk! At the end of the visit, we eat lunch near the playground. We have sandwiches and apple juice. It is a great day at the zoo.',
    comprehensionQuestions: [
      {
        question: 'Who does the narrator visit the zoo with?',
        questionZh: '叙述者和谁一起去动物园？',
        options: ['Family', 'Friends', 'Class', 'Neighbours'],
        correctIndex: 2,
      },
      {
        question: 'What colour are the tigers?',
        questionZh: '老虎是什么颜色的？',
        options: ['Yellow', 'Orange and black', 'Brown', 'Grey'],
        correctIndex: 1,
      },
      {
        question: "What is the narrator's favourite animal?",
        questionZh: '叙述者最喜欢的动物是什么？',
        options: ['Lion', 'Hippo', 'Monkey', 'Giraffe'],
        correctIndex: 3,
      },
      {
        question: 'What can some parrots do?',
        questionZh: '某些鹦鹉能做什么？',
        options: ['Swim', 'Talk', 'Run fast', 'Jump high'],
        correctIndex: 1,
      },
      {
        question: 'What did they eat for lunch?',
        questionZh: '他们午餐吃了什么？',
        options: ['Pizza and water', 'Sandwiches and apple juice', 'Burgers and cola', 'Rice and tea'],
        correctIndex: 1,
      },
    ],
    keyVocabulary: [
      { word: 'stripes', definition: 'long thin lines of colour', definitionZh: '条纹' },
      { word: 'colourful', definition: 'having many bright colours', definitionZh: '色彩丰富的' },
      { word: 'giraffe', definition: 'a very tall African animal with a long neck', definitionZh: '长颈鹿' },
    ],
  },
  {
    id: 'ra-008',
    title: 'Climate Change and the Ocean',
    titleZh: '气候变化与海洋',
    level: 'B1',
    category: 'Science',
    content:
      'The world\'s oceans are under increasing pressure from climate change. Rising global temperatures are causing the oceans to warm, which has serious consequences for marine ecosystems. Coral reefs, which support about 25% of all ocean species, are particularly vulnerable. When ocean water becomes too warm, corals expel the algae living inside them and turn white—a process known as coral bleaching. Without the algae, corals can die. Climate change also causes ocean acidification. As the atmosphere absorbs more carbon dioxide, so do the oceans. This makes the water more acidic, which harms shellfish, plankton, and other creatures that depend on calcium carbonate to build their shells. Sea levels are rising because glaciers and ice sheets are melting and because warm water expands. This threatens low-lying coastal communities around the world. Scientists predict that without significant reductions in greenhouse gas emissions, sea levels could rise by more than a metre by the end of this century. The good news is that the ocean is also part of the solution to climate change. It absorbs about 30% of the carbon dioxide released by human activity. Protecting ocean health through the reduction of pollution and the creation of marine protected areas can help the ocean continue to perform this vital function.',
    comprehensionQuestions: [
      {
        question: 'What percentage of ocean species do coral reefs support?',
        questionZh: '珊瑚礁支撑了多少比例的海洋物种？',
        options: ['10%', '25%', '50%', '75%'],
        correctIndex: 1,
      },
      {
        question: 'What causes coral bleaching?',
        questionZh: '是什么导致珊瑚白化？',
        options: ['Pollution', 'Overfishing', 'Water becoming too warm', 'Too much sunlight'],
        correctIndex: 2,
      },
      {
        question: 'What is ocean acidification?',
        questionZh: '什么是海洋酸化？',
        options: ['The ocean becoming saltier', 'The ocean becoming more acidic due to CO₂ absorption', 'The ocean warming up', 'The ocean losing oxygen'],
        correctIndex: 1,
      },
      {
        question: 'Why are sea levels rising?',
        questionZh: '为什么海平面上升？',
        options: ['More rain falling into the sea', 'Glaciers melting and warm water expanding', 'Rivers flowing faster', 'Ocean floor rising'],
        correctIndex: 1,
      },
      {
        question: 'What percentage of human CO₂ emissions does the ocean absorb?',
        questionZh: '海洋吸收人类CO₂排放的多少比例？',
        options: ['10%', '20%', '30%', '50%'],
        correctIndex: 2,
      },
    ],
    keyVocabulary: [
      { word: 'coral bleaching', definition: 'a process where corals turn white due to stress, often from warm water', definitionZh: '珊瑚白化' },
      { word: 'acidification', definition: 'the process of becoming more acidic', definitionZh: '酸化' },
      { word: 'ecosystem', definition: 'a community of living organisms and their environment', definitionZh: '生态系统' },
    ],
  },
  {
    id: 'ra-009',
    title: 'Globalisation and Cultural Identity',
    titleZh: '全球化与文化认同',
    level: 'C1',
    category: 'Society',
    content:
      'Globalisation has transformed the world into an interconnected network of economic, political, and cultural exchange. While its economic dimensions have received substantial scholarly attention, its effects on cultural identity are more contested and nuanced. Critics argue that globalisation fosters cultural homogenisation—the erosion of local traditions, languages, and customs under the relentless pressure of globally dominant cultures, particularly American popular culture. The proliferation of multinational fast-food chains, streaming platforms distributing Hollywood content, and English as the de facto international language of commerce and diplomacy are frequently cited as evidence of this trend. Proponents counter that globalisation creates conditions for cultural hybridity rather than homogenisation. As ideas, people, and artefacts circulate across borders, they do not simply displace local cultures but interact with them, producing novel and dynamic cultural forms. The global success of K-pop, Bollywood, and Afrobeats demonstrates that cultural flows are not unidirectional. Moreover, globalisation has in some cases reinvigorated local cultural identities, as communities seek to preserve and reassert distinctive traditions in response to external pressures. The debate is further complicated by questions of power and agency. Not all cultures participate in global exchange on equal terms; economically marginalised communities may have little capacity to resist or selectively engage with globalising forces. The challenge for policymakers and communities alike is to harness the connective and economic benefits of globalisation while maintaining the cultural diversity that enriches human experience.',
    comprehensionQuestions: [
      {
        question: 'What does "cultural homogenisation" mean in this context?',
        questionZh: '在这篇文章中，"文化同质化"是什么意思？',
        options: ['Cultural mixing creating something new', 'Local cultures being eroded by dominant global cultures', 'All cultures becoming more advanced', 'Cultural exchange benefiting everyone equally'],
        correctIndex: 1,
      },
      {
        question: 'What does the success of K-pop demonstrate?',
        questionZh: '韩流音乐的成功说明了什么？',
        options: ['American culture is losing influence', 'Cultural flows are not unidirectional', 'Globalisation promotes only Western culture', 'Music is more global than film'],
        correctIndex: 1,
      },
      {
        question: 'What is "cultural hybridity"?',
        questionZh: '什么是"文化混血"？',
        options: ['The death of local cultures', 'Novel cultural forms produced by interaction between cultures', 'A return to traditional customs', 'Cultural conflict between nations'],
        correctIndex: 1,
      },
      {
        question: 'How has globalisation sometimes affected local cultural identities?',
        questionZh: '全球化有时如何影响当地文化认同？',
        options: ['It has always destroyed them', 'It has made them more similar to Western culture', 'It has sometimes reinvigorated them', 'It has had no effect'],
        correctIndex: 2,
      },
      {
        question: 'Why are economically marginalised communities at a disadvantage in global cultural exchange?',
        questionZh: '为什么经济上处于边缘地位的社区在全球文化交流中处于不利地位？',
        options: ['They prefer isolation', 'They lack capacity to selectively engage with globalising forces', 'They have no cultural traditions', 'Their governments prevent exchange'],
        correctIndex: 1,
      },
    ],
    keyVocabulary: [
      { word: 'homogenisation', definition: 'the process of making things uniform or similar', definitionZh: '同质化' },
      { word: 'hybridity', definition: 'the state of being a mixture of different elements', definitionZh: '混合性；杂糅性' },
      { word: 'reinvigorated', definition: 'given new energy or strength', definitionZh: '重新激活的；注入新活力的' },
    ],
  },
  {
    id: 'ra-010',
    title: 'My Weekend Routine',
    titleZh: '我的周末日常',
    level: 'A2',
    category: 'Daily Life',
    content:
      'On weekends, I usually wake up later than on weekdays. I get up at about nine o\'clock. First, I have a shower and get dressed. Then I make breakfast. I like to eat eggs and toast on Saturdays. After breakfast, I sometimes go for a walk in the park near my flat. The park is very nice in the morning. There are ducks on the pond and people walking their dogs. In the afternoon, I often meet my friend Jess. We go to the cinema or a café. Last weekend, we watched a comedy film. It was very funny. We also had hot chocolate at our favourite café. In the evening, I usually cook dinner at home. I enjoy cooking. My favourite meal to cook is pasta. After dinner, I read a book or watch a series on television. I go to bed at about eleven o\'clock. Sundays are similar, but I also do my laundry and clean my flat. I enjoy weekends because I can relax and spend time with people I like.',
    comprehensionQuestions: [
      {
        question: 'What time does the narrator wake up on weekends?',
        questionZh: '叙述者在周末几点起床？',
        options: ['Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock', 'Ten o\'clock'],
        correctIndex: 2,
      },
      {
        question: 'What does the narrator eat for breakfast on Saturdays?',
        questionZh: '叙述者周六早餐吃什么？',
        options: ['Cereal', 'Eggs and toast', 'Pancakes', 'Fruit'],
        correctIndex: 1,
      },
      {
        question: 'What did they watch last weekend?',
        questionZh: '上周末他们看了什么？',
        options: ['An action film', 'A documentary', 'A comedy film', 'A horror film'],
        correctIndex: 2,
      },
      {
        question: 'What is the narrator\'s favourite meal to cook?',
        questionZh: '叙述者最喜欢做什么饭？',
        options: ['Rice', 'Soup', 'Pasta', 'Pizza'],
        correctIndex: 2,
      },
      {
        question: 'What does the narrator do on Sundays that they don\'t mention for Saturdays?',
        questionZh: '叙述者在周日做了什么周六没提到的事？',
        options: ['Go to the cinema', 'Cook dinner', 'Do laundry and clean the flat', 'Walk in the park'],
        correctIndex: 2,
      },
    ],
    keyVocabulary: [
      { word: 'routine', definition: 'a regular set of activities done in a fixed order', definitionZh: '日常惯例；例行活动' },
      { word: 'pond', definition: 'a small area of water', definitionZh: '池塘' },
      { word: 'laundry', definition: 'clothes that need to be washed or have been washed', definitionZh: '洗衣服；待洗衣物' },
    ],
  },
];

// ─── Helper functions ────────────────────────────────────────────────────────

export function getArticleById(id: string): ReadingArticle | undefined {
  return readingArticles.find((a) => a.id === id);
}

export function getArticlesByLevel(level: CEFRLevel): ReadingArticle[] {
  return readingArticles.filter((a) => a.level === level);
}

export function getArticlesByCategory(category: string): ReadingArticle[] {
  return readingArticles.filter((a) => a.category === category);
}

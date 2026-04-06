/**
 * Listening content for S20 - Listening Comprehension feature.
 * 10 sample tracks (5 dialogues, 5 monologues) spanning CEFR A1–C2.
 */

import type { CEFRLevel, ComprehensionQuestion } from './readingContent';

export interface ListeningTrack {
  id: string;
  title: string;
  titleZh: string;
  level: CEFRLevel;
  type: 'dialogue' | 'monologue';
  transcript: string;
  transcriptZh: string;
  /** Duration in seconds */
  duration: number;
  questions: ComprehensionQuestion[];
  category: string;
}

export const listeningTracks: ListeningTrack[] = [
  // ── Dialogues ──────────────────────────────────────────────────────────────
  {
    id: 'lt-001',
    title: 'At the Coffee Shop',
    titleZh: '在咖啡店',
    level: 'A1',
    type: 'dialogue',
    transcript:
      'Barista: Good morning! What can I get for you?\n' +
      'Customer: Hi! I\'d like a coffee, please.\n' +
      'Barista: Sure! Small, medium, or large?\n' +
      'Customer: Medium, please. And can I have a muffin too?\n' +
      'Barista: Of course. That\'s four pounds fifty, please.\n' +
      'Customer: Here you go. Thank you!\n' +
      'Barista: Thank you. Your name?\n' +
      'Customer: My name is Tom.\n' +
      'Barista: We\'ll call your name when it\'s ready. Have a nice day!\n' +
      'Customer: You too!',
    transcriptZh:
      '咖啡师：早上好！您需要什么？\n' +
      '顾客：你好！我想要一杯咖啡。\n' +
      '咖啡师：好的！小杯、中杯还是大杯？\n' +
      '顾客：中杯，谢谢。我还能要一个松饼吗？\n' +
      '咖啡师：当然。一共四镑五十便士。\n' +
      '顾客：给你。谢谢！\n' +
      '咖啡师：谢谢。请问您的姓名？\n' +
      '顾客：我叫汤姆。\n' +
      '咖啡师：好了之后我们会叫您的名字。祝您愉快！\n' +
      '顾客：您也是！',
    duration: 45,
    questions: [
      {
        question: 'What size coffee does the customer order?',
        questionZh: '顾客点了多大的咖啡？',
        options: ['Small', 'Medium', 'Large', 'Extra large'],
        correctIndex: 1,
      },
      {
        question: 'What food does the customer order?',
        questionZh: '顾客点了什么食物？',
        options: ['A sandwich', 'A cake', 'A muffin', 'A cookie'],
        correctIndex: 2,
      },
      {
        question: 'How much does it cost?',
        questionZh: '一共多少钱？',
        options: ['Three pounds', 'Four pounds', 'Four pounds fifty', 'Five pounds'],
        correctIndex: 2,
      },
      {
        question: "What is the customer's name?",
        questionZh: '顾客叫什么名字？',
        options: ['Tim', 'Tom', 'Dan', 'Sam'],
        correctIndex: 1,
      },
      {
        question: 'How will the customer know when the order is ready?',
        questionZh: '顾客怎么知道订单好了？',
        options: ['A text message', 'A number on a screen', 'The barista will call their name', 'They will collect it themselves'],
        correctIndex: 2,
      },
    ],
    category: 'Daily Life',
  },
  {
    id: 'lt-002',
    title: 'Booking a Hotel Room',
    titleZh: '预订酒店房间',
    level: 'A2',
    type: 'dialogue',
    transcript:
      'Receptionist: Good afternoon, Sunrise Hotel. How can I help you?\n' +
      'Guest: Hello. I\'d like to book a room for two nights, please.\n' +
      'Receptionist: Of course. What dates?\n' +
      'Guest: The fourteenth and fifteenth of March.\n' +
      'Receptionist: We have a standard double room available for those dates. It\'s seventy pounds per night.\n' +
      'Guest: Does the price include breakfast?\n' +
      'Receptionist: Yes, breakfast is included.\n' +
      'Guest: Great, I\'ll take it. My name is Sarah Clarke.\n' +
      'Receptionist: Thank you, Ms Clarke. Can I take a phone number?\n' +
      'Guest: Sure, it\'s 07700 900123.\n' +
      'Receptionist: Perfect. We look forward to seeing you in March.',
    transcriptZh:
      '前台：下午好，日出酒店，有什么可以帮您？\n' +
      '客人：你好。我想预订一个房间住两晚。\n' +
      '前台：好的。哪些日期？\n' +
      '客人：三月十四号和十五号。\n' +
      '前台：那些日期有一间标准双人房，每晚七十镑。\n' +
      '客人：价格包含早餐吗？\n' +
      '前台：是的，早餐包含在内。\n' +
      '客人：太好了，我就订这个。我叫莎拉·克拉克。\n' +
      '前台：谢谢您，克拉克女士。请留一个电话号码？\n' +
      '客人：好的，07700 900123。\n' +
      '前台：好的。期待三月份见到您。',
    duration: 55,
    questions: [
      {
        question: 'How many nights does the guest want to stay?',
        questionZh: '客人想住几晚？',
        options: ['One', 'Two', 'Three', 'Four'],
        correctIndex: 1,
      },
      {
        question: 'What type of room is available?',
        questionZh: '有什么类型的房间？',
        options: ['Single room', 'Standard double room', 'Suite', 'Twin room'],
        correctIndex: 1,
      },
      {
        question: 'How much is the room per night?',
        questionZh: '房间每晚多少钱？',
        options: ['Sixty pounds', 'Seventy pounds', 'Eighty pounds', 'Ninety pounds'],
        correctIndex: 1,
      },
      {
        question: 'Is breakfast included?',
        questionZh: '包含早餐吗？',
        options: ['No', 'Yes, for extra cost', 'Yes, it is included', 'It depends on the day'],
        correctIndex: 2,
      },
      {
        question: "What is the guest's surname?",
        questionZh: '客人的姓氏是什么？',
        options: ['Clark', 'Clarke', 'Clare', 'Cleark'],
        correctIndex: 1,
      },
    ],
    category: 'Travel',
  },
  {
    id: 'lt-003',
    title: 'Job Interview',
    titleZh: '求职面试',
    level: 'B1',
    type: 'dialogue',
    transcript:
      'Interviewer: Thank you for coming in today, James. Can you start by telling me a bit about yourself?\n' +
      'James: Of course. I have three years of experience in marketing, mostly focused on digital campaigns. I graduated with a degree in Business Studies in 2020.\n' +
      'Interviewer: That\'s great. Why are you interested in this particular role?\n' +
      'James: I\'ve been following your company for a while. I\'m particularly excited about your sustainability initiatives, and I believe my skills in social media marketing could help you reach a wider audience.\n' +
      'Interviewer: What would you say is your greatest strength?\n' +
      'James: I\'d say it\'s my ability to analyse data and turn insights into actionable strategies. At my current job, I increased our social media engagement by 40% in six months.\n' +
      'Interviewer: Impressive. And what about weaknesses?\n' +
      'James: I sometimes take on too much work, but I\'ve been learning to delegate more effectively.\n' +
      'Interviewer: Very good. Do you have any questions for us?\n' +
      'James: Yes—could you tell me more about the team I\'d be working with?',
    transcriptZh:
      '面试官：感谢您今天来，詹姆斯。您能先介绍一下自己吗？\n' +
      '詹姆斯：当然。我有三年的市场营销经验，主要专注于数字营销。我2020年获得商业研究学位。\n' +
      '面试官：很好。您为什么对这个职位感兴趣？\n' +
      '詹姆斯：我关注贵公司已经有一段时间了。我对您们的可持续发展举措特别感兴趣，我相信我在社交媒体营销方面的技能能帮助您们触达更多受众。\n' +
      '面试官：您认为您最大的优势是什么？\n' +
      '詹姆斯：我认为是我分析数据并将洞察转化为可执行策略的能力。在我现在的工作中，我在六个月内将社交媒体参与度提升了40%。\n' +
      '面试官：令人印象深刻。那您的不足是什么？\n' +
      '詹姆斯：有时我会揽太多工作，但我一直在学习更有效地授权委托。\n' +
      '面试官：很好。您有什么要问我们的吗？\n' +
      '詹姆斯：有——您能告诉我更多关于我将要合作的团队的情况吗？',
    duration: 90,
    questions: [
      {
        question: 'How many years of experience does James have?',
        questionZh: '詹姆斯有几年工作经验？',
        options: ['One', 'Two', 'Three', 'Four'],
        correctIndex: 2,
      },
      {
        question: 'What aspect of the company excites James most?',
        questionZh: '詹姆斯对公司的哪个方面最感兴趣？',
        options: ['Salary', 'Location', 'Sustainability initiatives', 'Company size'],
        correctIndex: 2,
      },
      {
        question: 'By how much did James increase social media engagement?',
        questionZh: '詹姆斯将社交媒体参与度提升了多少？',
        options: ['20%', '30%', '40%', '50%'],
        correctIndex: 2,
      },
      {
        question: "What does James say is his weakness?",
        questionZh: '詹姆斯说自己的不足是什么？',
        options: ['Poor time management', 'Taking on too much work', 'Lack of technical skills', 'Difficulty with teamwork'],
        correctIndex: 1,
      },
      {
        question: "What is James's final question to the interviewer?",
        questionZh: '詹姆斯最后问了面试官什么？',
        options: ['About salary', 'About holidays', 'About the team', 'About remote work'],
        correctIndex: 2,
      },
    ],
    category: 'Work',
  },
  {
    id: 'lt-004',
    title: 'Academic Debate: Social Media',
    titleZh: '学术辩论：社交媒体',
    level: 'B2',
    type: 'dialogue',
    transcript:
      'Professor: Today we\'re discussing the impact of social media on political discourse. Emma, would you like to begin?\n' +
      'Emma: Certainly. I would argue that social media has democratised political participation. Citizens who previously had no platform can now engage directly with politicians and share their views with a global audience.\n' +
      'Professor: And Malik, your response?\n' +
      'Malik: I take a more cautious view. While access has increased, the quality of discourse has arguably declined. Algorithms prioritise engagement over accuracy, which tends to amplify outrage and misinformation rather than reasoned debate.\n' +
      'Emma: That\'s a fair point, but surely the solution is better regulation rather than limiting access. We shouldn\'t throw out the democratic gains because the platforms are poorly designed.\n' +
      'Malik: I agree that regulation is part of the answer, but it is extremely difficult to implement without infringing on free speech. And the speed at which misinformation spreads means regulation is always playing catch-up.\n' +
      'Professor: Interesting. Both of you seem to agree on the diagnosis but differ on the remedy. Let\'s open it up to the class.',
    transcriptZh:
      '教授：今天我们讨论社交媒体对政治讨论的影响。艾玛，您先开始？\n' +
      '艾玛：当然。我认为社交媒体使政治参与民主化了。以前没有平台的公民现在可以直接与政客互动，并与全球受众分享观点。\n' +
      '教授：马利克，您的回应？\n' +
      '马利克：我持更谨慎的态度。虽然参与渠道增加了，但讨论质量可以说是下降了。算法优先考虑参与度而非准确性，这往往放大了愤怒和虚假信息，而不是理性辩论。\n' +
      '艾玛：这是个合理的观点，但解决方案应该是更好的监管而不是限制访问。我们不应该因为平台设计不当就放弃民主化的成果。\n' +
      '马利克：我同意监管是部分答案，但在不侵犯言论自由的前提下实施极为困难。而且虚假信息传播速度极快，意味着监管总是在追赶。\n' +
      '教授：有趣。你们两人似乎在诊断上达成共识，但在解决方案上意见不同。让我们向全班开放讨论。',
    duration: 110,
    questions: [
      {
        question: "What is Emma's main argument in favour of social media?",
        questionZh: '艾玛支持社交媒体的主要论点是什么？',
        options: ['It is entertaining', 'It has democratised political participation', 'It creates jobs', 'It improves education'],
        correctIndex: 1,
      },
      {
        question: 'According to Malik, what do algorithms prioritise?',
        questionZh: '根据马利克，算法优先考虑什么？',
        options: ['Accuracy', 'Education', 'Engagement over accuracy', 'Political balance'],
        correctIndex: 2,
      },
      {
        question: "What does Emma suggest as a solution?",
        questionZh: '艾玛建议什么解决方案？',
        options: ['Banning social media', 'Better regulation', 'Free market approach', 'Government control'],
        correctIndex: 1,
      },
      {
        question: "What is Malik's concern about regulation?",
        questionZh: '马利克对监管有什么顾虑？',
        options: ['It is too expensive', 'It is always playing catch-up with fast-spreading misinformation', 'It reduces internet speed', 'Companies will relocate'],
        correctIndex: 1,
      },
      {
        question: 'What does the professor conclude that Emma and Malik agree on?',
        questionZh: '教授总结两人在哪方面达成共识？',
        options: ['The solution', 'The diagnosis but not the remedy', 'Both the problem and solution', 'Nothing at all'],
        correctIndex: 1,
      },
    ],
    category: 'Education',
  },
  {
    id: 'lt-005',
    title: 'Medical Consultation',
    titleZh: '医疗问诊',
    level: 'C1',
    type: 'dialogue',
    transcript:
      'Doctor: Good morning. What brings you in today?\n' +
      'Patient: I\'ve been experiencing persistent headaches for about three weeks, mostly behind my eyes, and I\'ve noticed some visual disturbances—occasional blurring.\n' +
      'Doctor: I see. Are the headaches constant, or do they come and go?\n' +
      'Patient: They tend to peak in the afternoon and improve slightly in the morning. Painkillers provide only partial relief.\n' +
      'Doctor: Any recent changes to your screen time or sleep patterns?\n' +
      'Patient: Actually, yes. I\'ve been working longer hours recently—probably staring at screens for twelve hours a day.\n' +
      'Doctor: That could certainly be a contributing factor. I\'d like to rule out any underlying issues, so I\'m going to refer you for an eye examination and blood pressure monitoring. In the meantime, try to limit your screen exposure, use blue-light filter glasses, and ensure you take regular breaks every twenty minutes.\n' +
      'Patient: Should I be worried?\n' +
      'Doctor: The symptoms you describe are not uncommon with prolonged screen use, but it\'s important we investigate thoroughly to exclude anything more serious. Let\'s see the results before drawing conclusions.',
    transcriptZh:
      '医生：早上好。今天是什么情况？\n' +
      '患者：我已经持续头痛大约三周了，主要是眼睛后面，而且我注意到有些视觉干扰——偶尔模糊。\n' +
      '医生：我明白了。头痛是持续的还是时来时去？\n' +
      '患者：通常下午最严重，早上稍微好一些。止痛药只能部分缓解。\n' +
      '医生：最近您的屏幕时间或睡眠模式有变化吗？\n' +
      '患者：其实有。我最近工作时间更长了——可能每天盯着屏幕12小时。\n' +
      '医生：这很可能是一个诱因。我想排除任何潜在问题，所以我要转介您做眼科检查和血压监测。同时，请减少屏幕暴露，戴蓝光过滤眼镜，确保每20分钟定期休息。\n' +
      '患者：我需要担心吗？\n' +
      '医生：您描述的症状在长期使用屏幕的人中并不罕见，但我们需要彻底检查以排除更严重的情况。让我们先看结果再下结论。',
    duration: 100,
    questions: [
      {
        question: 'How long has the patient had headaches?',
        questionZh: '患者头痛持续了多久？',
        options: ['One week', 'Two weeks', 'Three weeks', 'One month'],
        correctIndex: 2,
      },
      {
        question: 'When do the headaches tend to be worst?',
        questionZh: '头痛通常什么时候最严重？',
        options: ['In the morning', 'At lunchtime', 'In the afternoon', 'At night'],
        correctIndex: 2,
      },
      {
        question: 'What lifestyle factor does the doctor identify?',
        questionZh: '医生发现了什么生活方式因素？',
        options: ['Poor diet', 'Lack of exercise', 'Prolonged screen use', 'Dehydration'],
        correctIndex: 2,
      },
      {
        question: 'What does the doctor refer the patient for?',
        questionZh: '医生将患者转介做什么检查？',
        options: ['Brain scan and blood test', 'Eye examination and blood pressure monitoring', 'X-ray and urine test', 'Sleep study and CT scan'],
        correctIndex: 1,
      },
      {
        question: 'How often does the doctor recommend taking breaks from the screen?',
        questionZh: '医生建议多久休息一次屏幕？',
        options: ['Every ten minutes', 'Every fifteen minutes', 'Every twenty minutes', 'Every thirty minutes'],
        correctIndex: 2,
      },
    ],
    category: 'Health',
  },

  // ── Monologues ─────────────────────────────────────────────────────────────
  {
    id: 'lt-006',
    title: 'My Favourite Season',
    titleZh: '我最喜欢的季节',
    level: 'A1',
    type: 'monologue',
    transcript:
      'Hello! My name is Lucy. I want to tell you about my favourite season. My favourite season is spring. In spring, the weather is warm and sunny. I can see flowers in the park. The flowers are red, yellow, and white. Birds sing in the morning. I like to go for walks in spring. I wear a light jacket because it is not too hot and not too cold. In spring, I also play in the garden with my cat. My cat loves to run outside. Spring is beautiful. I am happy in spring.',
    transcriptZh:
      '大家好！我叫露西。我想告诉你们我最喜欢的季节。我最喜欢的季节是春天。春天天气温暖晴朗。我能在公园里看到花朵。花有红色、黄色和白色。早上鸟儿在歌唱。我喜欢在春天散步。我穿一件薄外套，因为不太热也不太冷。春天我也和我的猫在花园里玩。我的猫喜欢在外面跑。春天很美。我在春天很开心。',
    duration: 40,
    questions: [
      {
        question: "What is Lucy's favourite season?",
        questionZh: '露西最喜欢的季节是什么？',
        options: ['Summer', 'Autumn', 'Winter', 'Spring'],
        correctIndex: 3,
      },
      {
        question: 'What colours are the flowers?',
        questionZh: '花是什么颜色的？',
        options: ['Red, blue, and pink', 'Red, yellow, and white', 'Purple, orange, and green', 'White and yellow only'],
        correctIndex: 1,
      },
      {
        question: 'What does Lucy wear when walking?',
        questionZh: '露西散步时穿什么？',
        options: ['A heavy coat', 'A light jacket', 'A T-shirt', 'A raincoat'],
        correctIndex: 1,
      },
      {
        question: 'Who does Lucy play with in the garden?',
        questionZh: '露西在花园里和谁玩？',
        options: ['Her dog', 'Her brother', 'Her cat', 'Her friend'],
        correctIndex: 2,
      },
      {
        question: 'When do birds sing?',
        questionZh: '鸟儿什么时候唱歌？',
        options: ['In the afternoon', 'At night', 'In the morning', 'In the evening'],
        correctIndex: 2,
      },
    ],
    category: 'Nature',
  },
  {
    id: 'lt-007',
    title: 'A Short History of Tea',
    titleZh: '茶的简史',
    level: 'B1',
    type: 'monologue',
    transcript:
      'Tea is one of the most widely consumed beverages in the world, second only to water. Its history stretches back nearly five thousand years to ancient China. According to legend, the Chinese emperor Shen Nung discovered tea in 2737 BCE when leaves from a wild tree blew into his pot of boiling water. He tasted the resulting drink and found it refreshing. For centuries, tea was used in China as a medicinal herb rather than a daily drink. It was not until the Tang Dynasty, around the seventh century CE, that tea drinking became a widespread social practice. Tea reached Europe via trade routes in the sixteenth century. The Dutch and Portuguese were among the first Europeans to trade in tea. In Britain, tea became enormously popular in the seventeenth and eighteenth centuries, eventually becoming the national drink it remains today. The British East India Company played a key role in expanding tea trade. The demand for tea even contributed to significant historical events, including the American Boston Tea Party of 1773, when colonists protested against British taxation by dumping tea into the harbour. Today, tea is grown in over fifty countries, with China and India being the largest producers. It comes in hundreds of varieties, from delicate green teas to robust black teas, and is enjoyed in countless cultural traditions around the world.',
    transcriptZh:
      '茶是世界上消费最广泛的饮料之一，仅次于水。其历史可追溯至近五千年前的中国。据传说，中国皇帝神农于公元前2737年发现了茶，当时一棵野树的叶子飘入他的沸水锅中。他品尝了这种饮料，觉得很提神。几个世纪以来，茶在中国被用作草药而非日常饮料。直到公元七世纪左右的唐朝，饮茶才成为一种广泛的社交活动。茶在十六世纪通过贸易路线传入欧洲。荷兰人和葡萄牙人是最早进行茶叶贸易的欧洲人之一。在英国，茶在十七和十八世纪变得非常流行，最终成为今天仍是英国的国民饮料。英国东印度公司在扩大茶叶贸易中发挥了关键作用。对茶的需求甚至促成了重要的历史事件，包括1773年美国波士顿茶党，殖民者通过将茶叶倒入港口来抗议英国征税。今天，茶叶在超过50个国家种植，中国和印度是最大的生产国。它有数百种品种，从精致的绿茶到浓郁的红茶，在世界各地无数文化传统中被享用。',
    duration: 120,
    questions: [
      {
        question: 'According to legend, who discovered tea?',
        questionZh: '据传说，谁发现了茶？',
        options: ['Emperor Qin Shi Huang', 'Emperor Shen Nung', 'Emperor Han Wu', 'Emperor Tang Taizong'],
        correctIndex: 1,
      },
      {
        question: 'In early Chinese history, how was tea mainly used?',
        questionZh: '在中国早期历史中，茶主要是如何使用的？',
        options: ['As a daily drink', 'As a religious offering', 'As a medicinal herb', 'As a food ingredient'],
        correctIndex: 2,
      },
      {
        question: 'When did tea reach Europe?',
        questionZh: '茶什么时候传入欧洲？',
        options: ['The fourteenth century', 'The fifteenth century', 'The sixteenth century', 'The seventeenth century'],
        correctIndex: 2,
      },
      {
        question: 'What was the Boston Tea Party a protest against?',
        questionZh: '波士顿茶党是在抗议什么？',
        options: ['High tea prices', 'British taxation', 'Poor quality tea', 'Restricted trade routes'],
        correctIndex: 1,
      },
      {
        question: 'Which two countries are the largest tea producers today?',
        questionZh: '今天哪两个国家是最大的茶叶生产国？',
        options: ['Japan and Kenya', 'Sri Lanka and Vietnam', 'China and India', 'Bangladesh and Indonesia'],
        correctIndex: 2,
      },
    ],
    category: 'Culture',
  },
  {
    id: 'lt-008',
    title: 'The Psychology of Procrastination',
    titleZh: '拖延症的心理学',
    level: 'B2',
    type: 'monologue',
    transcript:
      'Procrastination is far more than a simple time management problem. Research in psychology suggests it is fundamentally an emotional regulation issue. When we face a task that generates feelings of anxiety, boredom, self-doubt, or resentment, our brains instinctively seek relief by turning to more immediately enjoyable activities. In other words, procrastination is an attempt to manage mood in the short term, even at the cost of long-term goals. The neuroscience behind this involves the limbic system, which prioritises immediate reward and emotional comfort, overriding the prefrontal cortex, which is responsible for rational planning and long-term thinking. Interestingly, chronic procrastinators do not necessarily lack motivation—many report high levels of perfectionism. Perfectionism can paradoxically fuel procrastination: if a task seems impossible to do perfectly, starting it at all feels threatening. This leads to a damaging cycle where delay creates time pressure, time pressure increases anxiety, and increased anxiety makes starting even harder. Breaking the cycle requires targeting the emotional root rather than simply trying to force productivity. Techniques such as the "two-minute rule"—immediately doing anything that takes less than two minutes—self-compassion practices, and breaking tasks into the smallest possible components have all demonstrated effectiveness. Importantly, research shows that people who practise self-compassion after procrastinating are less likely to procrastinate on the same task in future, because guilt and self-criticism tend to reinforce the negative emotions that caused procrastination in the first place.',
    transcriptZh:
      '拖延远不止是一个简单的时间管理问题。心理学研究表明，它从根本上是一个情绪调节问题。当我们面对会产生焦虑、无聊、自我怀疑或厌恶感的任务时，我们的大脑本能地通过转向更有即时满足感的活动来寻求解脱。换句话说，拖延是短期管理情绪的一种尝试，即使代价是长期目标。其背后的神经科学涉及边缘系统，它优先考虑即时奖励和情感舒适，从而压制了负责理性规划和长远思考的前额叶皮层。有趣的是，慢性拖延症患者不一定缺乏动力——许多人报告完美主义程度很高。完美主义可能矛盾地助长了拖延：如果一项任务似乎不可能完美完成，开始做它本身就感到威胁。这导致了一个有害循环：延迟造成时间压力，时间压力增加焦虑，焦虑增加使开始更加困难。打破这个循环需要针对情感根源，而不仅仅是试图强迫自己有效率。"两分钟原则"——立即完成任何少于两分钟的事情——自我同情练习，以及将任务分解为尽可能小的部分，都证明了有效性。重要的是，研究表明在拖延之后进行自我同情练习的人在将来同一任务上拖延的可能性更小，因为愧疚和自我批评往往会强化最初导致拖延的负面情绪。',
    duration: 130,
    questions: [
      {
        question: 'According to psychologists, what is procrastination fundamentally?',
        questionZh: '根据心理学家，拖延从根本上是什么？',
        options: ['A time management problem', 'An emotional regulation issue', 'A personality flaw', 'A lack of motivation'],
        correctIndex: 1,
      },
      {
        question: 'What brain system prioritises immediate reward?',
        questionZh: '哪个大脑系统优先考虑即时奖励？',
        options: ['The prefrontal cortex', 'The cerebellum', 'The limbic system', 'The hippocampus'],
        correctIndex: 2,
      },
      {
        question: 'How can perfectionism contribute to procrastination?',
        questionZh: '完美主义如何助长拖延？',
        options: ['Perfectionists work too quickly', 'Tasks that seem impossible to do perfectly feel threatening to start', 'Perfectionists are easily distracted', 'Perfectionism reduces anxiety'],
        correctIndex: 1,
      },
      {
        question: 'What is the "two-minute rule"?',
        questionZh: '"两分钟原则"是什么？',
        options: ['Work for two minutes then rest', 'Immediately do anything that takes less than two minutes', 'Spend two minutes planning', 'Take two-minute breaks every hour'],
        correctIndex: 1,
      },
      {
        question: 'Why does self-compassion after procrastinating help?',
        questionZh: '为什么拖延后进行自我同情有帮助？',
        options: ['It rewards laziness', 'Guilt and self-criticism reinforce the negative emotions causing procrastination', 'It reduces perfectionism directly', 'It improves memory'],
        correctIndex: 1,
      },
    ],
    category: 'Psychology',
  },
  {
    id: 'lt-009',
    title: 'Advances in Renewable Energy',
    titleZh: '可再生能源的进步',
    level: 'C1',
    type: 'monologue',
    transcript:
      'The global energy transition is accelerating at a pace that would have seemed implausible even a decade ago. The cost of solar photovoltaic technology has fallen by approximately 90% since 2010, making solar electricity cheaper than coal in most parts of the world on a levelised cost basis. Wind power has undergone a comparable transformation, with offshore turbines now capable of generating power at scales that were previously the exclusive domain of large thermal power stations. This rapid cost reduction has been driven by a combination of manufacturing scale economies, technological improvements, and competitive market dynamics. The challenge that remains, however, is not generation but integration. Renewable energy sources are intermittent by nature—the sun does not always shine, and the wind does not always blow. Grid operators must balance supply and demand in real time, and the increasing penetration of renewables introduces variability that legacy grid infrastructure was not designed to accommodate. Battery storage technology is rapidly maturing to address this challenge. Lithium-ion battery costs have fallen by 97% over the past three decades, and next-generation technologies including solid-state batteries, flow batteries, and compressed air energy storage offer the prospect of grid-scale storage that could fundamentally alter the economics of an all-renewable system. Equally important is the development of smart grid technology—digital systems that can dynamically manage energy flows, integrate distributed generation from millions of rooftop solar panels, and shift demand to periods of abundant supply. The trajectory is clear; the pace of transition will be determined by policy ambition, investment levels, and our capacity to upgrade the physical infrastructure of the grid.',
    transcriptZh:
      '全球能源转型正在以十年前似乎不可能的速度加速。太阳能光伏技术的成本自2010年以来下降了约90%，使得太阳能发电在平准化成本基础上比全球大多数地区的煤炭更便宜。风能也经历了类似的转型，海上风力发电机现在能够以以前只有大型热电站才能实现的规模发电。这种快速成本下降是由制造规模经济、技术改进和竞争性市场动态共同驱动的。然而，剩下的挑战不在于发电，而在于整合。可再生能源本质上是间歇性的——太阳并不总是照耀，风也不总是吹。电网运营商必须实时平衡供需，而可再生能源渗透率的提高引入了传统电网基础设施无法应对的可变性。电池储能技术正在迅速成熟以应对这一挑战。锂离子电池成本在过去三十年下降了97%，包括固态电池、液流电池和压缩空气储能在内的下一代技术提供了电网规模储能的前景，可能从根本上改变全可再生能源系统的经济性。同样重要的是智能电网技术的发展——能够动态管理能源流、整合来自数百万屋顶太阳能板的分布式发电、并将需求转移到能源充裕时段的数字系统。轨迹是清晰的；转型速度将取决于政策雄心、投资水平以及我们升级电网实体基础设施的能力。',
    duration: 150,
    questions: [
      {
        question: 'By approximately how much have solar PV costs fallen since 2010?',
        questionZh: '自2010年以来，太阳能光伏成本大约下降了多少？',
        options: ['50%', '70%', '80%', '90%'],
        correctIndex: 3,
      },
      {
        question: 'What is described as the remaining challenge for renewables?',
        questionZh: '可再生能源剩余的挑战是什么？',
        options: ['Generation capacity', 'Grid integration of intermittent supply', 'Public acceptance', 'Raw material supply'],
        correctIndex: 1,
      },
      {
        question: 'By how much have lithium-ion battery costs fallen over three decades?',
        questionZh: '锂离子电池成本在三十年内下降了多少？',
        options: ['80%', '90%', '95%', '97%'],
        correctIndex: 3,
      },
      {
        question: 'What does smart grid technology enable?',
        questionZh: '智能电网技术能实现什么？',
        options: ['Generating more electricity', 'Dynamic management of energy flows and demand shifting', 'Reducing electricity prices directly', 'Replacing all fossil fuel plants'],
        correctIndex: 1,
      },
      {
        question: 'What will determine the pace of the energy transition?',
        questionZh: '什么将决定能源转型的速度？',
        options: ['Technology alone', 'Consumer preferences', 'Policy ambition, investment, and grid infrastructure upgrades', 'International agreements only'],
        correctIndex: 2,
      },
    ],
    category: 'Science',
  },
  {
    id: 'lt-010',
    title: 'Language, Thought, and Reality',
    titleZh: '语言、思维与现实',
    level: 'C2',
    type: 'monologue',
    transcript:
      'The Sapir-Whorf hypothesis, or linguistic relativity, proposes that the language we speak shapes the way we perceive and conceptualise reality. In its strong form—sometimes called linguistic determinism—this claim holds that our thoughts are entirely constrained by linguistic categories: we cannot think what we cannot say. This strong version has been largely discredited; deaf individuals who lack a conventional language still demonstrate sophisticated reasoning, and cross-linguistic research suggests cognition is far richer than language alone can capture. The weak form of the hypothesis, however, commands considerably more empirical support. Language influences certain cognitive processes without wholly determining them. A frequently cited example involves colour perception. Languages carve up the colour spectrum differently—Russian, for instance, has distinct terms for light blue and dark blue, treating them as categorically different colours rather than shades of a single hue. Experiments show that Russian speakers are marginally faster at discriminating between these two blues than English speakers, suggesting a modest but measurable linguistic influence on perceptual processing. More profound examples come from spatial cognition. The Guugu Yimithirr language of north Queensland uses absolute cardinal directions—north, south, east, west—rather than egocentric terms like "left" and "right". Speakers of this language maintain an extraordinary sense of geographical orientation at all times, suggesting that the habitual use of absolute directional language cultivates distinct cognitive capacities. These findings invite reflection on what we may gain or lose as linguistic diversity erodes—whether the loss of a language represents not merely a cultural bereavement but a diminishment of the cognitive diversity available to our species.',
    transcriptZh:
      '萨丕尔-沃尔夫假说，即语言相对论，提出我们所说的语言塑造了我们感知和概念化现实的方式。在其强形式——有时称为语言决定论——中，这一主张认为我们的思想完全受语言类别的约束：我们无法思考我们无法表达的事物。这个强版本已基本上被否定；缺乏传统语言的聋哑人仍然表现出复杂的推理能力，跨语言研究表明认知比语言能捕捉的要丰富得多。然而，假说的弱形式得到了更多的实证支持。语言影响某些认知过程而不完全决定它们。一个常被引用的例子涉及颜色感知。不同语言对颜色谱的划分方式不同——例如，俄语有浅蓝色和深蓝色的不同术语，将它们视为两种不同的颜色而非同一色调的不同深浅。实验表明，俄语母语者在区分这两种蓝色时比英语母语者略快，表明语言对感知处理有适度但可测量的影响。更深刻的例子来自空间认知。昆士兰州北部的古古依米提语使用绝对基本方向——北、南、东、西——而非以自我为中心的"左"和"右"等术语。使用这种语言的人始终保持着非凡的地理方位感，表明习惯性使用绝对方向语言培养了不同的认知能力。这些发现邀请我们反思，随着语言多样性的侵蚀，我们可能得到或失去什么——一种语言的消失是否不仅代表文化的丧失，更是人类物种可用认知多样性的减损。',
    duration: 180,
    questions: [
      {
        question: "What is the 'strong form' of the Sapir-Whorf hypothesis?",
        questionZh: '萨丕尔-沃尔夫假说的"强形式"是什么？',
        options: ['Language slightly influences some thoughts', 'Thoughts are entirely constrained by language', 'Language is unrelated to thought', 'Bilingual people think differently'],
        correctIndex: 1,
      },
      {
        question: 'Why has the strong form been largely discredited?',
        questionZh: '为什么强形式基本上被否定了？',
        options: ['It has no supporters', 'Deaf individuals without language still show sophisticated reasoning', 'It is too complex to test', 'Language is universal'],
        correctIndex: 1,
      },
      {
        question: 'What does the Russian colour experiment demonstrate?',
        questionZh: '俄语颜色实验说明了什么？',
        options: ['Russians have better eyesight', 'Language has no effect on colour perception', 'Language can modestly influence perceptual processing', 'Russian is a more complex language than English'],
        correctIndex: 2,
      },
      {
        question: 'How does the Guugu Yimithirr language describe direction?',
        questionZh: '古古依米提语如何描述方向？',
        options: ['Using left and right', 'Using up and down', 'Using absolute cardinal directions', 'Using relative body positions'],
        correctIndex: 2,
      },
      {
        question: 'What does the speaker imply about language extinction?',
        questionZh: '演讲者对语言消亡有什么暗示？',
        options: ['It is inevitable and unimportant', 'It may represent a loss of cognitive diversity for humanity', 'It mainly affects small communities', 'It can be reversed through education'],
        correctIndex: 1,
      },
    ],
    category: 'Culture',
  },
];

// ─── Helper functions ────────────────────────────────────────────────────────

export function getTrackById(id: string): ListeningTrack | undefined {
  return listeningTracks.find((t) => t.id === id);
}

export function getTracksByLevel(level: CEFRLevel): ListeningTrack[] {
  return listeningTracks.filter((t) => t.level === level);
}

export function getTracksByType(type: 'dialogue' | 'monologue'): ListeningTrack[] {
  return listeningTracks.filter((t) => t.type === type);
}

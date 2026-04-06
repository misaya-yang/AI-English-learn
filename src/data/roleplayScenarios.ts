/**
 * 30 structured roleplay scenarios for AI conversation practice.
 * Categories: Daily(8), Travel(6), Work(6), Academic(5), IELTS(5)
 */

export type ScenarioCategory = 'daily' | 'travel' | 'work' | 'academic' | 'ielts';
export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ScenarioObjective {
  id: string;
  description: string;
  descriptionZh: string;
}

export interface RoleplayScenario {
  id: string;
  title: string;
  titleZh: string;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  estimatedMinutes: number;
  systemPrompt: string;
  objectives: ScenarioObjective[];
  keyPhrases: string[];
  icon: string;
}

export interface ScenarioSession {
  scenarioId: string;
  startedAt: string;
  completedAt: string | null;
  completedObjectives: string[];
  messageCount: number;
  score: number | null;
  xpEarned: number;
}

export const SCENARIO_CATEGORIES: { id: ScenarioCategory; label: string; labelZh: string }[] = [
  { id: 'daily', label: 'Daily Life', labelZh: '日常生活' },
  { id: 'travel', label: 'Travel', labelZh: '旅行' },
  { id: 'work', label: 'Workplace', labelZh: '职场' },
  { id: 'academic', label: 'Academic', labelZh: '学术' },
  { id: 'ielts', label: 'IELTS Speaking', labelZh: 'IELTS 口语' },
];

export const DIFFICULTY_LABELS: Record<ScenarioDifficulty, { label: string; labelZh: string }> = {
  beginner: { label: 'Beginner', labelZh: '初级' },
  intermediate: { label: 'Intermediate', labelZh: '中级' },
  advanced: { label: 'Advanced', labelZh: '高级' },
};

export const roleplayScenarios: RoleplayScenario[] = [
  // ─── Daily Life (8) ─────────────────────────────────────────────────────────
  {
    id: 'daily-coffee-order',
    title: 'Ordering Coffee',
    titleZh: '咖啡店点单',
    category: 'daily',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    systemPrompt: 'You are a friendly barista at a busy coffee shop called "Bean & Brew". You greet customers warmly, suggest popular drinks when asked, and occasionally mention daily specials. You speak naturally with some informal expressions. If the customer seems unsure, gently guide them through the menu options. Always confirm the order before finishing.',
    objectives: [
      { id: 'greet', description: 'Greet the barista and initiate the order', descriptionZh: '打招呼并开始点单' },
      { id: 'order', description: 'Successfully order a coffee drink with customizations', descriptionZh: '成功点一杯自定义咖啡' },
      { id: 'pay', description: 'Complete the payment interaction', descriptionZh: '完成付款对话' },
    ],
    keyPhrases: ['Can I get a...', 'What do you recommend?', 'I\'d like it with...', 'For here or to go', 'That\'ll be all'],
    icon: '☕',
  },
  {
    id: 'daily-grocery',
    title: 'Grocery Shopping',
    titleZh: '超市购物',
    category: 'daily',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    systemPrompt: 'You are a helpful grocery store employee. You assist customers in finding products, explain where items are located in the store, suggest alternatives when something is out of stock, and help at the checkout. You\'re patient and speak clearly.',
    objectives: [
      { id: 'find', description: 'Ask where to find a specific product', descriptionZh: '询问某个商品在哪里' },
      { id: 'alternative', description: 'Ask about alternatives for an out-of-stock item', descriptionZh: '询问缺货商品的替代品' },
      { id: 'checkout', description: 'Complete the checkout conversation', descriptionZh: '完成结账对话' },
    ],
    keyPhrases: ['Where can I find...', 'Do you have any...', 'Is this on sale?', 'Paper or plastic?', 'Do you need a bag?'],
    icon: '🛒',
  },
  {
    id: 'daily-doctor',
    title: 'Doctor\'s Appointment',
    titleZh: '看医生',
    category: 'daily',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    systemPrompt: 'You are a general practitioner. You listen carefully to patient symptoms, ask follow-up questions to narrow down the issue, explain your assessment in simple terms, and recommend treatment. You are empathetic but professional. You avoid overly technical jargon unless the patient asks for details.',
    objectives: [
      { id: 'symptoms', description: 'Describe your symptoms clearly', descriptionZh: '清晰描述你的症状' },
      { id: 'questions', description: 'Answer the doctor\'s follow-up questions', descriptionZh: '回答医生的追问' },
      { id: 'understand', description: 'Confirm you understand the treatment plan', descriptionZh: '确认理解治疗方案' },
    ],
    keyPhrases: ['I\'ve been feeling...', 'It started about...', 'How often should I...', 'Are there any side effects?', 'Should I come back if...'],
    icon: '🏥',
  },
  {
    id: 'daily-neighbor',
    title: 'Meeting a New Neighbor',
    titleZh: '认识新邻居',
    category: 'daily',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    systemPrompt: 'You just moved into a new apartment building. You are friendly and outgoing, eager to meet neighbors. You share a bit about yourself — where you moved from, your job, hobbies — and ask about the neighborhood, good restaurants, and local tips. Keep the conversation warm and casual.',
    objectives: [
      { id: 'introduce', description: 'Introduce yourself and exchange names', descriptionZh: '自我介绍并互换姓名' },
      { id: 'smalltalk', description: 'Make small talk about the neighborhood', descriptionZh: '闲聊社区情况' },
      { id: 'contact', description: 'Exchange contact information or suggest meeting again', descriptionZh: '交换联系方式或提议下次见面' },
    ],
    keyPhrases: ['Nice to meet you', 'I just moved in', 'How long have you lived here?', 'Any good restaurants nearby?', 'Feel free to knock'],
    icon: '🏠',
  },
  {
    id: 'daily-phone-repair',
    title: 'Phone Repair Shop',
    titleZh: '手机维修店',
    category: 'daily',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    systemPrompt: 'You are a phone repair technician at a small shop. You diagnose phone problems, explain repair options and costs, give time estimates, and discuss warranty options. You\'re knowledgeable but use everyday language. Sometimes you suggest cheaper alternatives.',
    objectives: [
      { id: 'describe', description: 'Describe the phone problem clearly', descriptionZh: '清晰描述手机问题' },
      { id: 'negotiate', description: 'Discuss repair options and pricing', descriptionZh: '讨论维修方案和价格' },
      { id: 'decide', description: 'Make a decision and confirm the repair timeline', descriptionZh: '做出决定并确认维修时间' },
    ],
    keyPhrases: ['My screen is cracked', 'How much would it cost?', 'How long will it take?', 'Is it worth repairing?', 'Do you offer a warranty?'],
    icon: '📱',
  },
  {
    id: 'daily-restaurant',
    title: 'Restaurant Dining',
    titleZh: '餐厅用餐',
    category: 'daily',
    difficulty: 'beginner',
    estimatedMinutes: 6,
    systemPrompt: 'You are a waiter at an Italian restaurant called "Bella Notte". You are attentive, recommend dishes based on customer preferences, explain menu items when asked, handle dietary restrictions gracefully, and check in during the meal. You have a warm, professional manner.',
    objectives: [
      { id: 'seated', description: 'Get seated and review the menu', descriptionZh: '入座并浏览菜单' },
      { id: 'order-food', description: 'Order a complete meal (appetizer, main, drink)', descriptionZh: '点一套完整的餐（前菜、主菜、饮品）' },
      { id: 'bill', description: 'Ask for and settle the bill', descriptionZh: '要账单并结账' },
    ],
    keyPhrases: ['Table for two, please', 'What\'s the special today?', 'I\'m allergic to...', 'Could I have the check?', 'Everything was delicious'],
    icon: '🍝',
  },
  {
    id: 'daily-gym',
    title: 'Joining a Gym',
    titleZh: '办理健身卡',
    category: 'daily',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    systemPrompt: 'You are a fitness consultant at a modern gym. You show potential members around, explain membership plans (monthly/annual), describe facilities and classes, answer questions about personal training, and try to close the sale without being too pushy.',
    objectives: [
      { id: 'tour', description: 'Ask about gym facilities and take a tour', descriptionZh: '询问健身设施并参观' },
      { id: 'plans', description: 'Compare membership plans', descriptionZh: '比较会员方案' },
      { id: 'sign-up', description: 'Decide whether to sign up and negotiate terms', descriptionZh: '决定是否注册并协商条件' },
    ],
    keyPhrases: ['What membership options do you have?', 'Is there a trial period?', 'What classes are included?', 'Can I freeze my membership?', 'Do you have personal trainers?'],
    icon: '💪',
  },
  {
    id: 'daily-bank',
    title: 'Opening a Bank Account',
    titleZh: '开设银行账户',
    category: 'daily',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    systemPrompt: 'You are a bank teller helping a new customer open an account. You explain different account types (checking, savings, premium), required documents, fees, and features like online banking and debit cards. You are professional, clear, and patient with questions.',
    objectives: [
      { id: 'inquire', description: 'Ask about account types and choose one', descriptionZh: '询问账户类型并选择一个' },
      { id: 'documents', description: 'Discuss required documents and identification', descriptionZh: '讨论所需文件和身份证明' },
      { id: 'features', description: 'Learn about online banking and card features', descriptionZh: '了解网上银行和卡功能' },
    ],
    keyPhrases: ['I\'d like to open an account', 'What are the fees?', 'What documents do I need?', 'Is there a minimum balance?', 'How do I set up online banking?'],
    icon: '🏦',
  },

  // ─── Travel (6) ─────────────────────────────────────────────────────────────
  {
    id: 'travel-hotel-checkin',
    title: 'Hotel Check-in',
    titleZh: '酒店入住',
    category: 'travel',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    systemPrompt: 'You are a hotel front desk receptionist at a 4-star hotel. You handle check-ins professionally, explain room amenities, mention breakfast times and wifi passwords, and offer to help with luggage or upgrades. If there\'s an issue with the reservation, you handle it calmly and offer solutions.',
    objectives: [
      { id: 'checkin', description: 'Complete the check-in process', descriptionZh: '完成入住手续' },
      { id: 'amenities', description: 'Ask about hotel amenities and services', descriptionZh: '询问酒店设施和服务' },
      { id: 'special', description: 'Make a special request (upgrade, extra pillow, etc.)', descriptionZh: '提出特殊要求（升级、加枕头等）' },
    ],
    keyPhrases: ['I have a reservation under...', 'What time is breakfast?', 'What\'s the wifi password?', 'Is it possible to upgrade?', 'Could I get a late checkout?'],
    icon: '🏨',
  },
  {
    id: 'travel-directions',
    title: 'Asking for Directions',
    titleZh: '问路',
    category: 'travel',
    difficulty: 'beginner',
    estimatedMinutes: 4,
    systemPrompt: 'You are a friendly local in a European city. A tourist asks you for directions. You give clear, step-by-step walking directions using landmarks. If the destination is far, you suggest taking public transport and explain how. You may mention nearby attractions worth visiting.',
    objectives: [
      { id: 'ask', description: 'Ask for directions to a specific place', descriptionZh: '询问去某地的路线' },
      { id: 'clarify', description: 'Ask for clarification or repeat directions', descriptionZh: '请求重复或确认方向' },
      { id: 'transport', description: 'Ask about public transportation options', descriptionZh: '询问公共交通方式' },
    ],
    keyPhrases: ['Excuse me, how do I get to...', 'Is it within walking distance?', 'Turn left/right at...', 'Which bus/train should I take?', 'Thank you for your help'],
    icon: '🗺️',
  },
  {
    id: 'travel-airport',
    title: 'Airport Navigation',
    titleZh: '机场导航',
    category: 'travel',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    systemPrompt: 'You play multiple roles at the airport: check-in agent, security officer, and gate agent. Guide the traveler through check-in (baggage, seat selection), security screening, and boarding. Be professional and follow standard airport procedures. If there are delays or gate changes, communicate them clearly.',
    objectives: [
      { id: 'checkin-flight', description: 'Check in for the flight and handle luggage', descriptionZh: '办理登机手续并托运行李' },
      { id: 'security', description: 'Navigate the security check conversation', descriptionZh: '通过安检对话' },
      { id: 'boarding', description: 'Handle a gate change or boarding issue', descriptionZh: '处理登机口变更或登机问题' },
    ],
    keyPhrases: ['I\'d like to check in for...', 'Window or aisle seat?', 'Please place your items...', 'Has the gate changed?', 'Is the flight on time?'],
    icon: '✈️',
  },
  {
    id: 'travel-taxi',
    title: 'Taking a Taxi',
    titleZh: '乘坐出租车',
    category: 'travel',
    difficulty: 'beginner',
    estimatedMinutes: 4,
    systemPrompt: 'You are a taxi driver in New York City. You\'re talkative but friendly. You confirm the destination, suggest the best route (especially if there\'s traffic), make small talk about the city, and handle payment at the end. You know the city well and can recommend places.',
    objectives: [
      { id: 'destination', description: 'Tell the driver your destination', descriptionZh: '告诉司机目的地' },
      { id: 'route', description: 'Discuss the route or ask about traffic', descriptionZh: '讨论路线或询问交通状况' },
      { id: 'payment', description: 'Handle the fare and tip', descriptionZh: '处理车费和小费' },
    ],
    keyPhrases: ['Can you take me to...', 'How long will it take?', 'Is there a lot of traffic?', 'Can I pay by card?', 'Keep the change'],
    icon: '🚕',
  },
  {
    id: 'travel-museum',
    title: 'Visiting a Museum',
    titleZh: '参观博物馆',
    category: 'travel',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    systemPrompt: 'You are a knowledgeable museum guide at the Metropolitan Museum of Art. You welcome visitors, explain ticket options and guided tour schedules, describe highlights of the collection, and answer questions about specific exhibits. You\'re passionate about art and history.',
    objectives: [
      { id: 'tickets', description: 'Purchase tickets and ask about guided tours', descriptionZh: '购票并询问导览' },
      { id: 'exhibits', description: 'Ask about specific exhibits or collections', descriptionZh: '询问具体展览或馆藏' },
      { id: 'recommend', description: 'Get personalized recommendations for what to see', descriptionZh: '获取个性化参观推荐' },
    ],
    keyPhrases: ['How much is admission?', 'What exhibitions are on now?', 'Is there an audio guide?', 'Where is the... collection?', 'What would you recommend seeing?'],
    icon: '🏛️',
  },
  {
    id: 'travel-emergency',
    title: 'Travel Emergency',
    titleZh: '旅行紧急情况',
    category: 'travel',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    systemPrompt: 'You are a police officer at a tourist police station. A tourist has had their wallet stolen. You take their report, ask detailed questions about the incident, explain the next steps for filing a report, help them contact their embassy, and advise on canceling credit cards. You are calm and reassuring.',
    objectives: [
      { id: 'report', description: 'Report the incident and describe what happened', descriptionZh: '报告事件并描述经过' },
      { id: 'details', description: 'Provide personal details for the police report', descriptionZh: '提供警方报告所需的个人信息' },
      { id: 'next-steps', description: 'Understand and confirm next steps', descriptionZh: '理解并确认后续步骤' },
    ],
    keyPhrases: ['I\'d like to report a theft', 'It happened about... ago', 'I need to cancel my credit cards', 'Can you help me contact my embassy?', 'How do I get a copy of the report?'],
    icon: '🚨',
  },

  // ─── Workplace (6) ─────────────────────────────────────────────────────────
  {
    id: 'work-interview',
    title: 'Job Interview',
    titleZh: '求职面试',
    category: 'work',
    difficulty: 'advanced',
    estimatedMinutes: 10,
    systemPrompt: 'You are an HR interviewer at a tech company conducting a behavioral interview. You ask about the candidate\'s experience, use STAR method questions (Situation, Task, Action, Result), assess cultural fit, and give the candidate a chance to ask questions. You\'re professional but try to make the candidate comfortable.',
    objectives: [
      { id: 'intro', description: 'Introduce yourself and explain your background', descriptionZh: '自我介绍并说明背景' },
      { id: 'behavioral', description: 'Answer a behavioral question using the STAR method', descriptionZh: '用 STAR 方法回答行为面试题' },
      { id: 'questions', description: 'Ask thoughtful questions about the role', descriptionZh: '提出有深度的职位相关问题' },
    ],
    keyPhrases: ['Tell me about yourself', 'In my previous role...', 'The result was...', 'What does a typical day look like?', 'What are the growth opportunities?'],
    icon: '💼',
  },
  {
    id: 'work-meeting',
    title: 'Team Meeting',
    titleZh: '团队会议',
    category: 'work',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    systemPrompt: 'You are a project manager running a weekly team standup meeting. You ask each team member for updates, discuss blockers, prioritize tasks, and assign action items. You keep the meeting focused and on track. When someone raises a concern, you address it constructively.',
    objectives: [
      { id: 'update', description: 'Give a clear project status update', descriptionZh: '给出清晰的项目状态更新' },
      { id: 'blocker', description: 'Raise a blocker and discuss solutions', descriptionZh: '提出阻碍并讨论解决方案' },
      { id: 'action', description: 'Agree on next steps and action items', descriptionZh: '商定后续步骤和行动项' },
    ],
    keyPhrases: ['Let me give you an update on...', 'I\'m blocked by...', 'Can we prioritize...', 'I\'ll take the action item to...', 'Let\'s circle back on this'],
    icon: '📋',
  },
  {
    id: 'work-presentation',
    title: 'Giving a Presentation',
    titleZh: '做演示汇报',
    category: 'work',
    difficulty: 'advanced',
    estimatedMinutes: 10,
    systemPrompt: 'You are an audience member at a business presentation. The user is presenting a quarterly report. You ask clarifying questions, challenge assumptions politely, request more detail on interesting points, and provide constructive feedback. Simulate a realistic Q&A session after the presentation.',
    objectives: [
      { id: 'present', description: 'Deliver a brief presentation opening', descriptionZh: '做一个简短的演示开场' },
      { id: 'qa', description: 'Handle audience questions confidently', descriptionZh: '自信地回答观众提问' },
      { id: 'close', description: 'Summarize key points and close effectively', descriptionZh: '总结要点并有效收尾' },
    ],
    keyPhrases: ['Today I\'d like to present...', 'As you can see from the data...', 'That\'s a great question...', 'Let me elaborate on that', 'To summarize the key takeaways...'],
    icon: '📊',
  },
  {
    id: 'work-negotiation',
    title: 'Salary Negotiation',
    titleZh: '薪资谈判',
    category: 'work',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    systemPrompt: 'You are an HR manager discussing a job offer with a promising candidate. You present the initial offer, explain the benefits package, and are open to negotiation within reason. You respond professionally to counteroffers and can discuss signing bonuses, equity, remote work, and PTO as alternatives.',
    objectives: [
      { id: 'understand', description: 'Understand the full compensation package', descriptionZh: '了解完整的薪资福利方案' },
      { id: 'counter', description: 'Make a counteroffer with justification', descriptionZh: '提出有理有据的还价' },
      { id: 'agree', description: 'Reach an agreement or discuss next steps', descriptionZh: '达成协议或讨论后续步骤' },
    ],
    keyPhrases: ['Based on my research...', 'I was hoping for...', 'Would you be open to...', 'What about other benefits?', 'I\'m excited about this opportunity'],
    icon: '🤝',
  },
  {
    id: 'work-email-call',
    title: 'Professional Phone Call',
    titleZh: '商务电话',
    category: 'work',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    systemPrompt: 'You are a client calling about a project. You need to discuss project timeline changes, express concerns about deliverables, and negotiate a revised schedule. You are firm but fair. You appreciate transparency and dislike vague answers.',
    objectives: [
      { id: 'greet-call', description: 'Handle the professional phone greeting', descriptionZh: '处理专业的电话问候' },
      { id: 'discuss', description: 'Discuss the project concerns clearly', descriptionZh: '清晰讨论项目问题' },
      { id: 'conclude', description: 'Summarize agreements and end the call professionally', descriptionZh: '总结协议并专业地结束通话' },
    ],
    keyPhrases: ['Thank you for taking my call', 'I\'m calling regarding...', 'My concern is that...', 'Can we agree on...', 'I\'ll send a follow-up email'],
    icon: '📞',
  },
  {
    id: 'work-feedback',
    title: 'Giving Feedback to a Colleague',
    titleZh: '给同事提反馈',
    category: 'work',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    systemPrompt: 'You are a colleague who has been asked for feedback on your performance. You\'re receptive but occasionally ask for specific examples. You may get slightly defensive at first but ultimately appreciate constructive criticism. React naturally and ask how you can improve.',
    objectives: [
      { id: 'positive', description: 'Start with positive feedback', descriptionZh: '先给出正面反馈' },
      { id: 'constructive', description: 'Deliver constructive criticism diplomatically', descriptionZh: '委婉地提出建设性批评' },
      { id: 'plan', description: 'Agree on an improvement plan', descriptionZh: '商定改进计划' },
    ],
    keyPhrases: ['I really appreciate how you...', 'One area I\'ve noticed...', 'For example, when...', 'What do you think about trying...', 'I\'m happy to help with...'],
    icon: '💬',
  },

  // ─── Academic (5) ───────────────────────────────────────────────────────────
  {
    id: 'academic-office-hours',
    title: 'Professor\'s Office Hours',
    titleZh: '教授答疑时间',
    category: 'academic',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    systemPrompt: 'You are a university professor during office hours. A student comes to discuss their essay topic, ask about confusing lecture material, or request an extension. You are helpful but encourage students to think critically. You ask guiding questions rather than giving direct answers.',
    objectives: [
      { id: 'topic', description: 'Discuss your essay topic and get feedback', descriptionZh: '讨论论文选题并获取反馈' },
      { id: 'clarify', description: 'Ask for clarification on lecture material', descriptionZh: '请求对课程内容进行解释' },
      { id: 'plan-study', description: 'Create an action plan for the assignment', descriptionZh: '制定作业行动计划' },
    ],
    keyPhrases: ['I was wondering about...', 'Could you explain...', 'I\'m thinking of writing about...', 'What sources would you recommend?', 'Would it be possible to get an extension?'],
    icon: '🎓',
  },
  {
    id: 'academic-study-group',
    title: 'Study Group Discussion',
    titleZh: '学习小组讨论',
    category: 'academic',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    systemPrompt: 'You are a fellow student in a study group preparing for a final exam. You discuss key concepts, quiz each other, debate interpretations, and share study strategies. You\'re collaborative and occasionally disagree on answers, leading to productive discussion.',
    objectives: [
      { id: 'concept', description: 'Explain a key concept to the group', descriptionZh: '向小组解释一个关键概念' },
      { id: 'debate', description: 'Engage in a respectful academic debate', descriptionZh: '参与一次尊重的学术讨论' },
      { id: 'strategy', description: 'Share and discuss study strategies', descriptionZh: '分享并讨论学习策略' },
    ],
    keyPhrases: ['The way I understand it...', 'I actually disagree because...', 'Can you explain that differently?', 'Let\'s go over...', 'How are you preparing for...'],
    icon: '📚',
  },
  {
    id: 'academic-library',
    title: 'Library Research Help',
    titleZh: '图书馆研究帮助',
    category: 'academic',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    systemPrompt: 'You are a university librarian helping a student find research materials. You guide them through the catalog system, suggest databases for their field, explain citation formats, and help locate physical and digital resources. You\'re knowledgeable and patient.',
    objectives: [
      { id: 'search', description: 'Ask for help finding sources on your topic', descriptionZh: '请求帮助查找主题资料' },
      { id: 'database', description: 'Learn about relevant databases and search strategies', descriptionZh: '了解相关数据库和搜索策略' },
      { id: 'citation', description: 'Ask about citation format requirements', descriptionZh: '询问引用格式要求' },
    ],
    keyPhrases: ['I\'m researching...', 'Which database should I use?', 'How do I access...', 'What citation style should I use?', 'Can you help me find...'],
    icon: '📖',
  },
  {
    id: 'academic-conference',
    title: 'Academic Conference Networking',
    titleZh: '学术会议社交',
    category: 'academic',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    systemPrompt: 'You are a researcher at an academic conference in the same field. You\'re at a networking break between sessions. You discuss each other\'s research, find common interests, explore potential collaboration, and exchange ideas about methodology. You\'re intellectually curious and collegial.',
    objectives: [
      { id: 'introduce-research', description: 'Introduce your research topic and findings', descriptionZh: '介绍你的研究课题和发现' },
      { id: 'discuss-method', description: 'Discuss methodology and approaches', descriptionZh: '讨论研究方法和路径' },
      { id: 'collaborate', description: 'Explore potential collaboration opportunities', descriptionZh: '探索合作可能性' },
    ],
    keyPhrases: ['My research focuses on...', 'I found that...', 'What methodology did you use?', 'That aligns with my findings on...', 'Would you be interested in collaborating?'],
    icon: '🔬',
  },
  {
    id: 'academic-thesis-defense',
    title: 'Thesis Defense Practice',
    titleZh: '论文答辩练习',
    category: 'academic',
    difficulty: 'advanced',
    estimatedMinutes: 10,
    systemPrompt: 'You are a thesis committee member asking challenging but fair questions about the student\'s research. You probe the methodology, question assumptions, ask about limitations, and challenge the conclusions. You are rigorous but constructive, wanting to see the student succeed.',
    objectives: [
      { id: 'summarize', description: 'Summarize your thesis in 2-3 minutes', descriptionZh: '用 2-3 分钟概述你的论文' },
      { id: 'defend', description: 'Defend your methodology against criticism', descriptionZh: '面对质疑为你的方法论辩护' },
      { id: 'limitations', description: 'Discuss limitations and future work', descriptionZh: '讨论局限性和未来研究方向' },
    ],
    keyPhrases: ['The central argument of my thesis is...', 'I chose this methodology because...', 'One limitation of this approach is...', 'Future research could explore...', 'The data supports this conclusion because...'],
    icon: '🎯',
  },

  // ─── IELTS Speaking (5) ─────────────────────────────────────────────────────
  {
    id: 'ielts-part1-hometown',
    title: 'IELTS Part 1: Hometown & Home',
    titleZh: 'IELTS Part 1: 家乡与住所',
    category: 'ielts',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    systemPrompt: 'You are an IELTS speaking examiner conducting Part 1 of the test. You ask 4-5 questions about the candidate\'s hometown and living situation. Follow standard IELTS format: ask clearly, don\'t help with answers, time each response (about 20-30 seconds per answer), and move on naturally. Be neutral and professional.',
    objectives: [
      { id: 'hometown', description: 'Describe your hometown in detail', descriptionZh: '详细描述你的家乡' },
      { id: 'living', description: 'Talk about your current living situation', descriptionZh: '谈论你目前的居住情况' },
      { id: 'preference', description: 'Express preferences about city vs countryside', descriptionZh: '表达对城市vs乡村的偏好' },
    ],
    keyPhrases: ['I\'m originally from...', 'What I like most about it is...', 'It\'s known for...', 'I\'ve been living there for...', 'I prefer... because...'],
    icon: '🎤',
  },
  {
    id: 'ielts-part2-experience',
    title: 'IELTS Part 2: Memorable Experience',
    titleZh: 'IELTS Part 2: 难忘经历',
    category: 'ielts',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    systemPrompt: 'You are an IELTS speaking examiner conducting Part 2. Give the candidate a cue card: "Describe a memorable experience you had recently. You should say: what it was, when and where it happened, who was involved, and explain why it was memorable." Give them 1 minute to prepare (simulate by asking if they\'re ready), then let them speak for 1-2 minutes. Ask 1-2 follow-up questions after.',
    objectives: [
      { id: 'prepare', description: 'Organize thoughts during preparation time', descriptionZh: '在准备时间内组织思路' },
      { id: 'speak', description: 'Deliver a 1-2 minute monologue covering all cue card points', descriptionZh: '围绕提示卡所有要点做 1-2 分钟独白' },
      { id: 'followup', description: 'Answer follow-up questions naturally', descriptionZh: '自然地回答追问' },
    ],
    keyPhrases: ['I\'d like to talk about...', 'This happened when...', 'What made it special was...', 'Looking back on it...', 'It taught me that...'],
    icon: '🎤',
  },
  {
    id: 'ielts-part3-technology',
    title: 'IELTS Part 3: Technology & Society',
    titleZh: 'IELTS Part 3: 科技与社会',
    category: 'ielts',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    systemPrompt: 'You are an IELTS speaking examiner conducting Part 3. Ask abstract, analytical questions about technology\'s impact on society, education, and work. Push the candidate to elaborate, give examples, and consider multiple perspectives. Questions should be open-ended and thought-provoking.',
    objectives: [
      { id: 'opinion', description: 'Express and justify an opinion on technology\'s impact', descriptionZh: '表达并论证对科技影响的观点' },
      { id: 'compare', description: 'Compare past and present or different perspectives', descriptionZh: '比较过去和现在或不同观点' },
      { id: 'speculate', description: 'Speculate about future developments', descriptionZh: '推测未来发展' },
    ],
    keyPhrases: ['In my opinion...', 'On the one hand... on the other hand...', 'For instance...', 'I believe in the future...', 'It\'s a complex issue because...'],
    icon: '🎤',
  },
  {
    id: 'ielts-part3-education',
    title: 'IELTS Part 3: Education Systems',
    titleZh: 'IELTS Part 3: 教育体系',
    category: 'ielts',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    systemPrompt: 'You are an IELTS speaking examiner conducting Part 3 on education. Ask about differences between education systems, the role of teachers vs technology in learning, whether university is necessary for success, and how education should adapt to the modern world. Probe for depth and examples.',
    objectives: [
      { id: 'analyze', description: 'Analyze strengths and weaknesses of education systems', descriptionZh: '分析教育体系的优缺点' },
      { id: 'argument', description: 'Build a coherent argument with examples', descriptionZh: '用实例构建连贯论点' },
      { id: 'solution', description: 'Propose solutions to educational challenges', descriptionZh: '提出教育挑战的解决方案' },
    ],
    keyPhrases: ['The main difference is...', 'A key advantage of... is...', 'Research has shown that...', 'One possible solution would be...', 'From my experience...'],
    icon: '🎤',
  },
  {
    id: 'ielts-part1-work-study',
    title: 'IELTS Part 1: Work or Studies',
    titleZh: 'IELTS Part 1: 工作或学习',
    category: 'ielts',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    systemPrompt: 'You are an IELTS speaking examiner conducting Part 1. Ask 4-5 questions about the candidate\'s work or studies: what they do, why they chose it, what they enjoy about it, and future plans. Keep questions simple and direct. Be neutral and professional, moving naturally from one question to the next.',
    objectives: [
      { id: 'describe-work', description: 'Describe your work or studies clearly', descriptionZh: '清晰描述你的工作或学习' },
      { id: 'reason', description: 'Explain why you chose this field', descriptionZh: '解释为什么选择这个领域' },
      { id: 'future', description: 'Discuss your future plans', descriptionZh: '讨论你的未来计划' },
    ],
    keyPhrases: ['I currently work as...', 'I chose this field because...', 'What I enjoy most is...', 'In the future, I plan to...', 'The most challenging part is...'],
    icon: '🎤',
  },
];

export function getScenarioById(id: string): RoleplayScenario | undefined {
  return roleplayScenarios.find((s) => s.id === id);
}

export function getScenariosByCategory(category: ScenarioCategory): RoleplayScenario[] {
  return roleplayScenarios.filter((s) => s.category === category);
}

export function getScenariosByDifficulty(difficulty: ScenarioDifficulty): RoleplayScenario[] {
  return roleplayScenarios.filter((s) => s.difficulty === difficulty);
}

/**
 * Structured learning paths data model: Path → Stage → Unit → Lesson.
 * 5 preset paths with ~15-20 lessons each.
 */

export type PathDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LessonItem {
  id: string;
  title: string;
  titleZh: string;
  type: 'vocabulary' | 'grammar' | 'practice' | 'conversation' | 'review';
  estimatedMinutes: number;
}

export interface PathUnit {
  id: string;
  title: string;
  titleZh: string;
  lessons: LessonItem[];
}

export interface PathStage {
  id: string;
  title: string;
  titleZh: string;
  units: PathUnit[];
}

export interface LearningPath {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  difficulty: PathDifficulty;
  icon: string;
  stages: PathStage[];
  totalLessons: number;
}

function countLessons(stages: PathStage[]): number {
  return stages.reduce((sum, s) => sum + s.units.reduce((u, unit) => u + unit.lessons.length, 0), 0);
}

function buildPath(
  id: string,
  title: string,
  titleZh: string,
  description: string,
  descriptionZh: string,
  difficulty: PathDifficulty,
  icon: string,
  stages: PathStage[],
): LearningPath {
  return { id, title, titleZh, description, descriptionZh, difficulty, icon, stages, totalLessons: countLessons(stages) };
}

function lesson(id: string, title: string, titleZh: string, type: LessonItem['type'], minutes: number): LessonItem {
  return { id, title, titleZh, type, estimatedMinutes: minutes };
}

export const learningPaths: LearningPath[] = [
  buildPath('daily-english', 'Daily English', '日常英语', 'Master everyday conversations and interactions', '掌握日常对话和互动', 'beginner', '🏠', [
    {
      id: 'de-s1', title: 'Getting Started', titleZh: '入门', units: [
        { id: 'de-u1', title: 'Greetings & Introductions', titleZh: '问候与介绍', lessons: [
          lesson('de-l1', 'Basic Greetings', '基本问候', 'vocabulary', 10),
          lesson('de-l2', 'Introducing Yourself', '自我介绍', 'conversation', 15),
          lesson('de-l3', 'Present Tense Basics', '一般现在时', 'grammar', 10),
          lesson('de-l4', 'Greetings Practice', '问候练习', 'practice', 10),
        ]},
        { id: 'de-u2', title: 'Numbers & Time', titleZh: '数字与时间', lessons: [
          lesson('de-l5', 'Numbers 1-100', '数字 1-100', 'vocabulary', 10),
          lesson('de-l6', 'Telling Time', '表达时间', 'conversation', 12),
          lesson('de-l7', 'Time Expressions', '时间表达', 'grammar', 10),
          lesson('de-l8', 'Review: Getting Started', '复习：入门', 'review', 10),
        ]},
      ],
    },
    {
      id: 'de-s2', title: 'Daily Routines', titleZh: '日常生活', units: [
        { id: 'de-u3', title: 'Food & Dining', titleZh: '饮食', lessons: [
          lesson('de-l9', 'Food Vocabulary', '食物词汇', 'vocabulary', 10),
          lesson('de-l10', 'Ordering at a Restaurant', '餐厅点餐', 'conversation', 15),
          lesson('de-l11', 'Countable & Uncountable', '可数与不可数', 'grammar', 10),
          lesson('de-l12', 'Food Practice Quiz', '饮食练习', 'practice', 10),
        ]},
        { id: 'de-u4', title: 'Shopping', titleZh: '购物', lessons: [
          lesson('de-l13', 'Shopping Vocabulary', '购物词汇', 'vocabulary', 10),
          lesson('de-l14', 'At the Store', '在商店', 'conversation', 15),
          lesson('de-l15', 'Comparatives', '比较级', 'grammar', 10),
          lesson('de-l16', 'Review: Daily Routines', '复习：日常生活', 'review', 10),
        ]},
      ],
    },
  ]),

  buildPath('business-english', 'Business English', '商务英语', 'Professional communication for the workplace', '职场专业沟通能力', 'intermediate', '💼', [
    {
      id: 'be-s1', title: 'Office Basics', titleZh: '办公室基础', units: [
        { id: 'be-u1', title: 'Emails & Messages', titleZh: '邮件与消息', lessons: [
          lesson('be-l1', 'Email Vocabulary', '邮件词汇', 'vocabulary', 10),
          lesson('be-l2', 'Writing Professional Emails', '写专业邮件', 'practice', 15),
          lesson('be-l3', 'Formal vs Informal', '正式与非正式', 'grammar', 10),
          lesson('be-l4', 'Email Roleplay', '邮件角色扮演', 'conversation', 12),
        ]},
        { id: 'be-u2', title: 'Meetings', titleZh: '会议', lessons: [
          lesson('be-l5', 'Meeting Vocabulary', '会议词汇', 'vocabulary', 10),
          lesson('be-l6', 'Running a Meeting', '主持会议', 'conversation', 15),
          lesson('be-l7', 'Passive Voice in Business', '商务被动语态', 'grammar', 10),
          lesson('be-l8', 'Review: Office Basics', '复习：办公室基础', 'review', 10),
        ]},
      ],
    },
    {
      id: 'be-s2', title: 'Advanced Business', titleZh: '高级商务', units: [
        { id: 'be-u3', title: 'Presentations', titleZh: '演示', lessons: [
          lesson('be-l9', 'Presentation Phrases', '演示短语', 'vocabulary', 10),
          lesson('be-l10', 'Giving a Presentation', '做演示', 'conversation', 15),
          lesson('be-l11', 'Complex Sentences', '复合句', 'grammar', 12),
          lesson('be-l12', 'Presentation Practice', '演示练习', 'practice', 15),
        ]},
        { id: 'be-u4', title: 'Negotiations', titleZh: '谈判', lessons: [
          lesson('be-l13', 'Negotiation Vocabulary', '谈判词汇', 'vocabulary', 10),
          lesson('be-l14', 'Negotiation Roleplay', '谈判角色扮演', 'conversation', 15),
          lesson('be-l15', 'Conditional Sentences', '条件句', 'grammar', 10),
          lesson('be-l16', 'Review: Advanced Business', '复习：高级商务', 'review', 10),
        ]},
      ],
    },
  ]),

  buildPath('ielts-prep', 'IELTS Preparation', 'IELTS 备考', 'Comprehensive preparation for IELTS exam', '全面的 IELTS 考试准备', 'advanced', '🎯', [
    {
      id: 'ip-s1', title: 'Speaking Skills', titleZh: '口语技能', units: [
        { id: 'ip-u1', title: 'Part 1 Mastery', titleZh: 'Part 1 掌握', lessons: [
          lesson('ip-l1', 'Common Part 1 Topics', '常见 Part 1 话题', 'vocabulary', 10),
          lesson('ip-l2', 'Part 1 Practice', 'Part 1 练习', 'conversation', 15),
          lesson('ip-l3', 'Tense Review for Speaking', '口语时态复习', 'grammar', 10),
          lesson('ip-l4', 'Part 1 Mock Test', 'Part 1 模拟测试', 'practice', 15),
        ]},
        { id: 'ip-u2', title: 'Part 2 & 3', titleZh: 'Part 2 & 3', lessons: [
          lesson('ip-l5', 'Descriptive Vocabulary', '描述性词汇', 'vocabulary', 10),
          lesson('ip-l6', 'Cue Card Practice', '题卡练习', 'conversation', 15),
          lesson('ip-l7', 'Complex Structures', '复杂句式', 'grammar', 12),
          lesson('ip-l8', 'Review: Speaking', '复习：口语', 'review', 10),
        ]},
      ],
    },
    {
      id: 'ip-s2', title: 'Writing Skills', titleZh: '写作技能', units: [
        { id: 'ip-u3', title: 'Task 1', titleZh: 'Task 1', lessons: [
          lesson('ip-l9', 'Graph Description Vocabulary', '图表描述词汇', 'vocabulary', 10),
          lesson('ip-l10', 'Task 1 Writing Practice', 'Task 1 写作练习', 'practice', 20),
          lesson('ip-l11', 'Data Comparison Grammar', '数据对比语法', 'grammar', 10),
          lesson('ip-l12', 'Task 1 Review', 'Task 1 复习', 'review', 10),
        ]},
        { id: 'ip-u4', title: 'Task 2', titleZh: 'Task 2', lessons: [
          lesson('ip-l13', 'Essay Vocabulary', '作文词汇', 'vocabulary', 10),
          lesson('ip-l14', 'Essay Structure', '作文结构', 'practice', 20),
          lesson('ip-l15', 'Argumentative Grammar', '议论文语法', 'grammar', 12),
          lesson('ip-l16', 'Review: Writing', '复习：写作', 'review', 10),
        ]},
      ],
    },
  ]),

  buildPath('academic-english', 'Academic English', '学术英语', 'Essential skills for university-level English', '大学级别英语必备技能', 'advanced', '🎓', [
    {
      id: 'ae-s1', title: 'Reading & Research', titleZh: '阅读与研究', units: [
        { id: 'ae-u1', title: 'Academic Reading', titleZh: '学术阅读', lessons: [
          lesson('ae-l1', 'Academic Vocabulary', '学术词汇', 'vocabulary', 10),
          lesson('ae-l2', 'Reading Strategies', '阅读策略', 'practice', 15),
          lesson('ae-l3', 'Relative Clauses', '关系从句', 'grammar', 10),
          lesson('ae-l4', 'Discussion: Research Papers', '讨论：研究论文', 'conversation', 15),
        ]},
        { id: 'ae-u2', title: 'Note-taking & Summarizing', titleZh: '笔记与总结', lessons: [
          lesson('ae-l5', 'Summarizing Vocabulary', '总结词汇', 'vocabulary', 10),
          lesson('ae-l6', 'Summarizing Practice', '总结练习', 'practice', 15),
          lesson('ae-l7', 'Reported Speech', '间接引语', 'grammar', 10),
          lesson('ae-l8', 'Review: Reading & Research', '复习', 'review', 10),
        ]},
      ],
    },
    {
      id: 'ae-s2', title: 'Writing & Presenting', titleZh: '写作与演示', units: [
        { id: 'ae-u3', title: 'Academic Writing', titleZh: '学术写作', lessons: [
          lesson('ae-l9', 'Hedging & Cautious Language', '学术委婉语', 'vocabulary', 10),
          lesson('ae-l10', 'Essay Writing', '论文写作', 'practice', 20),
          lesson('ae-l11', 'Nominalization', '名词化', 'grammar', 12),
          lesson('ae-l12', 'Peer Review Discussion', '同行评审讨论', 'conversation', 12),
        ]},
      ],
    },
  ]),

  buildPath('travel-english', 'Travel English', '旅行英语', 'Essential phrases and skills for traveling abroad', '出国旅行必备短语和技能', 'beginner', '✈️', [
    {
      id: 'te-s1', title: 'Getting Around', titleZh: '出行', units: [
        { id: 'te-u1', title: 'Airport & Transportation', titleZh: '机场与交通', lessons: [
          lesson('te-l1', 'Airport Vocabulary', '机场词汇', 'vocabulary', 10),
          lesson('te-l2', 'At the Airport', '在机场', 'conversation', 15),
          lesson('te-l3', 'Modal Verbs', '情态动词', 'grammar', 10),
          lesson('te-l4', 'Transportation Practice', '交通练习', 'practice', 10),
        ]},
        { id: 'te-u2', title: 'Accommodation', titleZh: '住宿', lessons: [
          lesson('te-l5', 'Hotel Vocabulary', '酒店词汇', 'vocabulary', 10),
          lesson('te-l6', 'Hotel Check-in', '酒店入住', 'conversation', 15),
          lesson('te-l7', 'Polite Requests', '礼貌请求', 'grammar', 10),
          lesson('te-l8', 'Review: Getting Around', '复习：出行', 'review', 10),
        ]},
      ],
    },
    {
      id: 'te-s2', title: 'Exploring', titleZh: '探索', units: [
        { id: 'te-u3', title: 'Sightseeing & Food', titleZh: '观光与美食', lessons: [
          lesson('te-l9', 'Sightseeing Vocabulary', '观光词汇', 'vocabulary', 10),
          lesson('te-l10', 'Asking for Recommendations', '询问推荐', 'conversation', 12),
          lesson('te-l11', 'Past Tense for Storytelling', '过去时叙述', 'grammar', 10),
          lesson('te-l12', 'Travel Practice Quiz', '旅行练习', 'practice', 10),
        ]},
        { id: 'te-u4', title: 'Emergencies', titleZh: '紧急情况', lessons: [
          lesson('te-l13', 'Emergency Vocabulary', '紧急情况词汇', 'vocabulary', 10),
          lesson('te-l14', 'Getting Help', '寻求帮助', 'conversation', 12),
          lesson('te-l15', 'Imperative Mood', '祈使句', 'grammar', 8),
          lesson('te-l16', 'Review: Exploring', '复习：探索', 'review', 10),
        ]},
      ],
    },
  ]),
];

export function getPathById(id: string): LearningPath | undefined {
  return learningPaths.find((p) => p.id === id);
}

export function getLessonById(pathId: string, lessonId: string): LessonItem | undefined {
  const path = getPathById(pathId);
  if (!path) return undefined;
  for (const stage of path.stages) {
    for (const unit of stage.units) {
      const found = unit.lessons.find((l) => l.id === lessonId);
      if (found) return found;
    }
  }
  return undefined;
}

export interface LocalizedLine {
  en: string;
  zh: string;
}

export const FREE_JOB: LocalizedLine = {
  en: 'Use Free for the daily basics: today, review, practice, and progress.',
  zh: '免费版包含日常基础：今日、复习、练习和进度。',
};

export const PRO_JOB: LocalizedLine = {
  en: 'Use Pro when you need IELTS scoring, custom materials, and a weekly plan.',
  zh: '专业版适合需要 IELTS 评分、自定义材料和周计划的学习者。',
};

export const FREE_PLAN_FEATURES: LocalizedLine[] = [
  { en: 'Daily words and review', zh: '每日单词与复习' },
  { en: 'Due review queue and basic analytics', zh: '到期复习队列与基础分析' },
  { en: 'Limited writing and exam feedback quota', zh: '有限写作与考试反馈额度' },
  { en: 'Core lexicon, practice, and Word of the Day', zh: '核心词库、练习与每日单词' },
  { en: 'Weekly recap preview', zh: '周报预览' },
];

export const FREE_PLAN_LIMITATIONS: LocalizedLine[] = [
  { en: 'Unlimited English help', zh: '不限量英语答疑' },
  { en: 'IELTS writing and speaking scoring', zh: 'IELTS 写作与口语评分' },
  { en: 'Advanced analytics and mistake patterns', zh: '进阶分析与错题记录' },
  { en: 'Custom wordbook imports', zh: '自定义词书导入' },
  { en: 'Weekly plan automation', zh: '自动周计划' },
];

export const PRO_PLAN_FEATURES: LocalizedLine[] = [
  { en: 'Unlimited English help and mistake follow-ups', zh: '不限量英语答疑与错题跟进' },
  { en: 'IELTS Writing and Speaking scoring rubrics', zh: 'IELTS 写作与口语评分量表' },
  { en: 'Advanced analytics: pending reviews, skill trends, mistake patterns', zh: '进阶分析：待复习、技能趋势、错题记录' },
  { en: 'Custom wordbook imports plus Anki / CSV export', zh: '自定义词书导入 + Anki / CSV 导出' },
  { en: 'Weekly plan and recap', zh: '周计划与周报' },
  { en: 'All practice modes and higher material quota', zh: '全部练习模式与更高材料额度' },
];

export const PRO_WAITLIST_PROMISE: LocalizedLine = {
  en: 'Join the Pro interest list. This records product interest only and never starts checkout.',
  zh: '加入专业版通知名单。这里只记录产品意向，不会发起支付。',
};

export const PRO_GATE_REASONS: Record<string, LocalizedLine> = {
  aiWritingGrade: {
    en: 'Pro adds IELTS-style writing scores, rubric notes, and follow-up drills.',
    zh: '专业版提供 IELTS 写作评分、评分项说明和跟进练习。',
  },
  aiReadingGen: {
    en: 'Pro adds more reading material so advanced learners can practice with custom topics.',
    zh: '专业版提供更多阅读材料，让进阶学习者围绕自定义主题练习。',
  },
  aiChat: {
    en: 'Pro gives you more English help, mistake follow-ups, and weekly planning.',
    zh: '专业版提供更多英语答疑、错题跟进和周计划。',
  },
  aiExamFeedback: {
    en: 'Pro focuses exam prep on scored IELTS feedback and targeted practice.',
    zh: '专业版提供 IELTS 评分反馈和定向练习。',
  },
  aiListeningGen: {
    en: 'Pro adds more listening material for targeted weak-skill practice.',
    zh: '专业版提供更多听力材料，用于薄弱技能定向练习。',
  },
};

export function pickLocalized(line: LocalizedLine, language: string): string {
  return language.startsWith('zh') ? line.zh : line.en;
}

export function getProGateReason(feature: string, language: string): string {
  return pickLocalized(PRO_GATE_REASONS[feature] ?? PRO_JOB, language);
}

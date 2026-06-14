export interface LocalizedLine {
  en: string;
  zh: string;
}

export const FREE_JOB: LocalizedLine = {
  en: 'Use Free to build the daily loop: today task, review queue, core practice, and basic progress.',
  zh: '免费版用于跑通每日闭环：今日任务、复习队列、核心练习和基础进度。',
};

export const PRO_JOB: LocalizedLine = {
  en: 'Use Pro when you need exam-grade feedback, deeper diagnostics, custom materials, and a weekly plan.',
  zh: 'Pro 用于需要考试级反馈、深度诊断、自定义材料和周计划的学习者。',
};

export const FREE_PLAN_FEATURES: LocalizedLine[] = [
  { en: 'Daily mission with new words and review', zh: '每日任务：新词 + 复习' },
  { en: 'FSRS review queue and basic analytics', zh: 'FSRS 复习队列与基础分析' },
  { en: 'Limited AI coach and exam feedback quota', zh: '有限 AI 教练与考试反馈额度' },
  { en: 'Core lexicon, practice, and Word of the Day', zh: '核心词库、练习与每日单词' },
  { en: 'Evidence-based weekly recap preview', zh: '基于证据的周报预览' },
];

export const FREE_PLAN_LIMITATIONS: LocalizedLine[] = [
  { en: 'Unlimited AI coach', zh: '不限量 AI 教练' },
  { en: 'IELTS writing and speaking scoring', zh: 'IELTS 写作与口语评分' },
  { en: 'Advanced analytics and error graph', zh: '进阶分析与错因图谱' },
  { en: 'Custom wordbook imports', zh: '自定义词书导入' },
  { en: 'Weekly plan automation', zh: '自动周计划' },
];

export const PRO_PLAN_FEATURES: LocalizedLine[] = [
  { en: 'Unlimited AI coach with recovery handoffs', zh: '不限量 AI 教练与错题恢复接力' },
  { en: 'IELTS Writing and Speaking scoring rubrics', zh: 'IELTS 写作与口语评分量表' },
  { en: 'Advanced analytics: review debt, skill trends, error graph', zh: '进阶分析：复习债、技能趋势、错因图谱' },
  { en: 'Custom wordbook imports plus Anki / CSV export', zh: '自定义词书导入 + Anki / CSV 导出' },
  { en: 'Weekly plan and evidence recap for the next sprint', zh: '下一周期周计划与证据周报' },
  { en: 'All practice modes and priority generation', zh: '全部练习模式与优先生成' },
];

export const PRO_WAITLIST_PROMISE: LocalizedLine = {
  en: 'Join the Pro interest list. This records product interest only and never starts checkout.',
  zh: '加入 Pro 意向名单。这里只记录产品意向，不会发起支付。',
};

export const PRO_GATE_REASONS: Record<string, LocalizedLine> = {
  aiWritingGrade: {
    en: 'Pro is for scored output practice: deeper writing feedback, IELTS rubrics, and next-step drills.',
    zh: 'Pro 面向输出训练：更深写作反馈、IELTS 评分量表和下一步补强练习。',
  },
  aiReadingGen: {
    en: 'Pro adds more generated material so advanced learners can practice with custom topics.',
    zh: 'Pro 提供更多生成材料，让进阶学习者围绕自定义主题练习。',
  },
  aiChat: {
    en: 'Pro expands the AI coach for longer tutoring loops, recovery handoffs, and weekly planning.',
    zh: 'Pro 扩展 AI 教练额度，用于更长辅导闭环、错题恢复接力和周计划。',
  },
  aiExamFeedback: {
    en: 'Pro focuses exam prep on scored IELTS feedback, diagnostics, and targeted remediation.',
    zh: 'Pro 将考试练习升级为 IELTS 评分反馈、诊断和定向补强。',
  },
  aiListeningGen: {
    en: 'Pro unlocks more listening generation for targeted weak-skill practice.',
    zh: 'Pro 解锁更多听力生成，用于薄弱技能定向练习。',
  },
};

export function pickLocalized(line: LocalizedLine, language: string): string {
  return language.startsWith('zh') ? line.zh : line.en;
}

export function getProGateReason(feature: string, language: string): string {
  return pickLocalized(PRO_GATE_REASONS[feature] ?? PRO_JOB, language);
}

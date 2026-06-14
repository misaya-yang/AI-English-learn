import type { ContentUnit, ExamTrack } from '@/types/examContent';

const TRACK_TITLE_ZH: Record<string, string> = {
  track_ielts_writing_foundation: 'IELTS 写作基础',
  track_ielts_writing_advanced: 'IELTS 写作进阶',
};

const UNIT_TITLE_ZH: Record<string, string> = {
  unit_ielts_task2_argument_b1: '大作文论证段基础',
  unit_ielts_task1_trend_b1: '小作文趋势对比',
  unit_ielts_task2_advanced_logic_b2: '大作文进阶论证',
};

const OBJECTIVE_ZH: Record<string, string> = {
  'Build one clear argument paragraph with claim-reason-example': '写清楚一个论证段：观点、理由、例子',
  'Use cohesive devices without overuse': '使用衔接词，但不过度堆砌',
  'Avoid common lexical and grammar mistakes in IELTS Task 2': '避开大作文常见词汇和语法错误',
  'Describe trend direction accurately': '准确描述趋势方向',
  'Use comparison language and data verbs': '使用比较表达和数据动词',
  'Control tense consistency for charts': '图表描述中保持时态一致',
  'Write balanced argument with rebuttal': '写出带让步和反驳的平衡论证',
  'Avoid logical fallacies in paragraph development': '段落推进时避免逻辑跳跃',
  'Upgrade lexical precision for band 7+': '提升 7 分段需要的用词准确度',
};

export function getExamTrackTitle(track: ExamTrack | null | undefined): string {
  if (!track) return '';
  return TRACK_TITLE_ZH[track.id] || track.title
    .replace('IELTS Writing Foundation', 'IELTS 写作基础')
    .replace('IELTS Writing Advanced', 'IELTS 写作进阶');
}

export function getExamUnitTitle(unit: ContentUnit | null | undefined): string {
  if (!unit) return '';
  return UNIT_TITLE_ZH[unit.id] || unit.title
    .replace('Task 1 Trends and Comparisons', '小作文趋势对比')
    .replace('Task 2 Argument Paragraph Basics', '大作文论证段基础')
    .replace('Task 2 Advanced Logic and Counterarguments', '大作文进阶论证');
}

export function getExamObjectiveText(objective: string): string {
  return OBJECTIVE_ZH[objective] || objective
    .replace('Task 2', '大作文')
    .replace('Task 1', '小作文');
}

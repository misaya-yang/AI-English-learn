// routeRegistry.ts — single source of truth for dashboard route metadata.
//
// The dashboard sidebar, the mobile bottom nav, the search palette, and a
// future "page title" header all need the same five things per route:
// path, label (EN/ZH), icon, nav group, mobile priority, page title,
// search aliases. Before this module those were duplicated across
// `DashboardLayout.tsx` and `BottomNavBar.tsx` with subtly different
// labels and an inconsistent ordering. This registry ends the drift.
//
// Pure module — no React/router imports — so the data is unit-testable
// and importable by both `tsx` consumers and any future scripts.

import type { ComponentType, SVGProps } from 'react';
import {
  AudioLines,
  BookOpen,
  Brain,
  CalendarDays,
  GraduationCap,
  Headphones,
  Library,
  MapPin,
  Medal,
  MessageCircleMore,
  PenTool,
  Settings,
  Shield,
  Target,
  Trophy,
  WandSparkles,
} from 'lucide-react';

export type DashboardRouteId =
  | 'today'
  | 'review'
  | 'practice'
  | 'exam'
  | 'reading'
  | 'listening'
  | 'grammar'
  | 'pronunciation'
  | 'writing'
  | 'chat'
  | 'learning-path'
  | 'vocabulary'
  | 'analytics'
  | 'memory'
  | 'leaderboard'
  | 'settings'
  | 'profile';

export type DashboardRouteGroup = 'learning' | 'practice' | 'tools' | 'admin';

export interface DashboardRouteMeta {
  id: DashboardRouteId;
  /** Absolute path under the SPA — always begins with '/dashboard/'. */
  path: string;
  label: { en: string; zh: string };
  /** Single short summary surfaced in the sidebar tooltip. */
  description: { en: string; zh: string };
  icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string; size?: number | string }>;
  group: DashboardRouteGroup;
  /**
   * Lower number → higher priority on mobile. Top 4 (1..4) become the
   * bottom nav tabs; everything else lives behind the "More" sheet.
   */
  mobilePriority: number;
  /** Used by an HTML <title> patch when we add the route-aware title. */
  pageTitle: { en: string; zh: string };
  /** Free-form aliases the search palette can match on. Always lowercase. */
  searchAliases: string[];
}

const ROUTES: DashboardRouteMeta[] = [
  {
    id: 'today',
    path: '/dashboard/today',
    label: { en: 'Today', zh: '今日' },
    description: { en: 'Today\'s mission and the next-best step.', zh: '今日主任务与下一步动作。' },
    icon: CalendarDays,
    group: 'learning',
    mobilePriority: 1,
    pageTitle: { en: 'Today · VocabDaily', zh: '今日 · VocabDaily' },
    searchAliases: ['today', '今日', 'home', '首页', 'mission', 'plan'],
  },
  {
    id: 'review',
    path: '/dashboard/review',
    label: { en: 'Review', zh: '复习' },
    description: { en: 'FSRS-due cards and stable retention.', zh: '到期复习与稳态记忆。' },
    icon: Brain,
    group: 'learning',
    mobilePriority: 2,
    pageTitle: { en: 'Review · VocabDaily', zh: '复习 · VocabDaily' },
    searchAliases: ['review', '复习', 'fsrs', 'due', '到期', 'srs'],
  },
  {
    id: 'practice',
    path: '/dashboard/practice',
    label: { en: 'Practice', zh: '练习' },
    description: { en: 'Quiz / listening / writing micro drills.', zh: '测验、听力、写作短练习。' },
    icon: WandSparkles,
    group: 'practice',
    mobilePriority: 3,
    pageTitle: { en: 'Practice · VocabDaily', zh: '练习 · VocabDaily' },
    searchAliases: ['practice', '练习', 'drill', 'quiz', '测验'],
  },
  {
    id: 'chat',
    path: '/dashboard/chat',
    label: { en: 'Coach', zh: '教练' },
    description: { en: 'Explanations, Socratic guidance, micro quizzes.', zh: '解释、引导和短测都从这里进入。' },
    icon: MessageCircleMore,
    group: 'practice',
    mobilePriority: 4,
    pageTitle: { en: 'Coach · VocabDaily', zh: '教练 · VocabDaily' },
    searchAliases: ['chat', 'coach', '教练', '聊天', '对话', 'tutor'],
  },
  {
    id: 'reading',
    path: '/dashboard/reading',
    label: { en: 'Reading', zh: '阅读' },
    description: { en: 'IELTS reading comprehension drills.', zh: 'IELTS 阅读理解精读训练。' },
    icon: BookOpen,
    group: 'practice',
    mobilePriority: 5,
    pageTitle: { en: 'Reading · VocabDaily', zh: '阅读 · VocabDaily' },
    searchAliases: ['reading', '阅读', 'ielts reading'],
  },
  {
    id: 'listening',
    path: '/dashboard/listening',
    label: { en: 'Listening', zh: '听力' },
    description: { en: 'IELTS listening comprehension drills.', zh: 'IELTS 听力理解训练。' },
    icon: Headphones,
    group: 'practice',
    mobilePriority: 6,
    pageTitle: { en: 'Listening · VocabDaily', zh: '听力 · VocabDaily' },
    searchAliases: ['listening', '听力', 'ielts listening', 'dictation'],
  },
  {
    id: 'grammar',
    path: '/dashboard/grammar',
    label: { en: 'Grammar', zh: '语法' },
    description: { en: 'Grammar rules + targeted fill-in drills.', zh: '语法规则与填空练习。' },
    icon: GraduationCap,
    group: 'practice',
    mobilePriority: 7,
    pageTitle: { en: 'Grammar · VocabDaily', zh: '语法 · VocabDaily' },
    searchAliases: ['grammar', '语法'],
  },
  {
    id: 'pronunciation',
    path: '/dashboard/pronunciation',
    label: { en: 'Pronunciation', zh: '发音' },
    description: { en: 'Pronunciation scoring + speaking drills.', zh: '发音评估与口语练习。' },
    icon: AudioLines,
    group: 'practice',
    mobilePriority: 8,
    pageTitle: { en: 'Pronunciation · VocabDaily', zh: '发音 · VocabDaily' },
    searchAliases: ['pronunciation', '发音', 'speaking', '口语'],
  },
  {
    id: 'writing',
    path: '/dashboard/writing',
    label: { en: 'Writing', zh: '写作' },
    description: { en: 'Writing practice + AI grading.', zh: '写作训练与 AI 批改。' },
    icon: PenTool,
    group: 'practice',
    mobilePriority: 9,
    pageTitle: { en: 'Writing · VocabDaily', zh: '写作 · VocabDaily' },
    searchAliases: ['writing', '写作', 'essay', 'task 2'],
  },
  {
    id: 'exam',
    path: '/dashboard/exam',
    label: { en: 'Exam Prep', zh: '考试冲刺' },
    description: { en: 'IELTS sprint and high-value feedback.', zh: 'IELTS 冲分与高价值反馈。' },
    icon: Target,
    group: 'practice',
    mobilePriority: 10,
    pageTitle: { en: 'Exam Prep · VocabDaily', zh: '考试冲刺 · VocabDaily' },
    searchAliases: ['exam', 'ielts', 'toefl', '考试', 'sprint'],
  },
  {
    id: 'learning-path',
    path: '/dashboard/learning-path',
    label: { en: 'Learning Path', zh: '学习路径' },
    description: { en: 'Multi-week path progress.', zh: '多周路径进度。' },
    icon: MapPin,
    group: 'learning',
    mobilePriority: 11,
    pageTitle: { en: 'Learning Path · VocabDaily', zh: '学习路径 · VocabDaily' },
    searchAliases: ['path', 'learning path', '路径'],
  },
  {
    id: 'vocabulary',
    path: '/dashboard/vocabulary',
    label: { en: 'Vocabulary', zh: '词书' },
    description: { en: 'Word books and vocabulary assets.', zh: '词书与词汇资产。' },
    icon: Library,
    group: 'tools',
    mobilePriority: 12,
    pageTitle: { en: 'Vocabulary · VocabDaily', zh: '词书 · VocabDaily' },
    searchAliases: ['vocabulary', 'words', '词书', '词汇', 'deck'],
  },
  {
    id: 'analytics',
    path: '/dashboard/analytics',
    label: { en: 'Analytics', zh: '数据分析' },
    description: { en: 'Learning metrics and trends.', zh: '学习数据与趋势。' },
    icon: Trophy,
    group: 'tools',
    mobilePriority: 13,
    pageTitle: { en: 'Analytics · VocabDaily', zh: '数据分析 · VocabDaily' },
    searchAliases: ['analytics', 'stats', '数据', '统计'],
  },
  {
    id: 'memory',
    path: '/dashboard/memory',
    label: { en: 'Memory', zh: '记忆' },
    description: { en: 'Long-term memory store.', zh: '长期记忆管理。' },
    icon: Shield,
    group: 'tools',
    mobilePriority: 14,
    pageTitle: { en: 'Memory · VocabDaily', zh: '记忆中心 · VocabDaily' },
    searchAliases: ['memory', '记忆', 'agent memory', 'profile'],
  },
  {
    id: 'leaderboard',
    path: '/dashboard/leaderboard',
    label: { en: 'Leaderboard', zh: '排行榜' },
    description: { en: 'Weekly leaderboard and challenges.', zh: '周榜排名与社区挑战。' },
    icon: Medal,
    group: 'tools',
    mobilePriority: 15,
    pageTitle: { en: 'Leaderboard · VocabDaily', zh: '排行榜 · VocabDaily' },
    searchAliases: ['leaderboard', '排行', 'rank', '社区'],
  },
  {
    id: 'settings',
    path: '/dashboard/settings',
    label: { en: 'Settings', zh: '设置' },
    description: { en: 'System settings.', zh: '系统设置。' },
    icon: Settings,
    group: 'admin',
    mobilePriority: 16,
    pageTitle: { en: 'Settings · VocabDaily', zh: '设置 · VocabDaily' },
    searchAliases: ['settings', 'preferences', '设置'],
  },
  {
    id: 'profile',
    path: '/dashboard/profile',
    label: { en: 'Profile', zh: '个人资料' },
    description: { en: 'Your learner profile.', zh: '个人资料与目标。' },
    icon: Settings,
    group: 'admin',
    mobilePriority: 17,
    pageTitle: { en: 'Profile · VocabDaily', zh: '个人资料 · VocabDaily' },
    searchAliases: ['profile', '资料', 'account'],
  },
];

const ROUTES_BY_ID: Record<DashboardRouteId, DashboardRouteMeta> = ROUTES.reduce(
  (acc, route) => {
    acc[route.id] = route;
    return acc;
  },
  {} as Record<DashboardRouteId, DashboardRouteMeta>,
);

export function getAllDashboardRoutes(): DashboardRouteMeta[] {
  return ROUTES.slice();
}

export function getDashboardRoute(id: DashboardRouteId): DashboardRouteMeta {
  return ROUTES_BY_ID[id];
}

export function getDashboardRouteByPath(path: string): DashboardRouteMeta | undefined {
  if (!path) return undefined;
  // Match the longest prefix so /dashboard/today/whatever still resolves.
  return ROUTES.find((route) => path === route.path || path.startsWith(`${route.path}/`));
}

export function getMobileNavRoutes(limit = 4): DashboardRouteMeta[] {
  return ROUTES
    .slice()
    .sort((a, b) => a.mobilePriority - b.mobilePriority)
    .slice(0, limit);
}

export function getRoutesByGroup(group: DashboardRouteGroup): DashboardRouteMeta[] {
  return ROUTES
    .filter((route) => route.group === group)
    .sort((a, b) => a.mobilePriority - b.mobilePriority);
}

export function searchDashboardRoutes(query: string): DashboardRouteMeta[] {
  const trimmed = (query || '').trim().toLowerCase();
  if (!trimmed) return [];
  return ROUTES.filter((route) => {
    if (route.label.en.toLowerCase().includes(trimmed)) return true;
    if (route.label.zh.includes(trimmed)) return true;
    if (route.path.toLowerCase().includes(trimmed)) return true;
    return route.searchAliases.some((alias) => alias.toLowerCase().includes(trimmed));
  });
}

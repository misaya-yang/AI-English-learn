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
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CalendarDays,
  GraduationCap,
  Headphones,
  Library,
  MapPin,
  MessageCircleMore,
  PenTool,
  Settings,
  Shield,
  Target,
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
  | 'evidence'
  | 'analytics'
  | 'memory'
  | 'leaderboard'
  | 'organization'
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
  /** Hidden from nav when enterprise preview is disabled. Direct routes can still render a gated shell. */
  enterpriseOnly?: boolean;
}

export interface DashboardRouteVisibilityOptions {
  enterpriseEnabled?: boolean;
}

const isRouteVisible = (
  route: DashboardRouteMeta,
  options: DashboardRouteVisibilityOptions = {},
): boolean => {
  if (!route.enterpriseOnly) return true;
  return options.enterpriseEnabled ?? true;
};

const ROUTES: DashboardRouteMeta[] = [
  {
    id: 'today',
    path: '/dashboard/today',
    label: { en: 'Today', zh: '今日' },
    description: { en: 'Review, words, practice.', zh: '复习、新词、练习。' },
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
    description: { en: 'Cards due today.', zh: '今天到期的词卡。' },
    icon: Brain,
    group: 'learning',
    mobilePriority: 4,
    pageTitle: { en: 'Review · VocabDaily', zh: '复习 · VocabDaily' },
    searchAliases: ['review', '复习', 'fsrs', 'due', '到期', 'srs'],
  },
  {
    id: 'practice',
    path: '/dashboard/practice',
    label: { en: 'Practice', zh: '练习' },
    description: { en: 'Quiz, dictation, and writing practice.', zh: '测验、听写和写作练习。' },
    icon: Target,
    group: 'practice',
    mobilePriority: 5,
    pageTitle: { en: 'Practice · VocabDaily', zh: '练习 · VocabDaily' },
    searchAliases: ['practice', '练习', 'drill', 'quiz', '测验'],
  },
  {
    id: 'chat',
    path: '/dashboard/chat',
    label: { en: 'Help', zh: '答疑' },
    description: { en: 'Questions and sentence fixes.', zh: '问词、改句、看错题。' },
    icon: MessageCircleMore,
    group: 'practice',
    mobilePriority: 2,
    pageTitle: { en: 'Help · VocabDaily', zh: '答疑 · VocabDaily' },
    searchAliases: ['chat', 'help', 'coach', '答疑', '教练', '聊天', '对话', 'tutor'],
  },
  {
    id: 'reading',
    path: '/dashboard/reading',
    label: { en: 'Reading', zh: '阅读' },
    description: { en: 'IELTS reading practice.', zh: 'IELTS 阅读练习。' },
    icon: BookOpen,
    group: 'practice',
    mobilePriority: 6,
    pageTitle: { en: 'Reading · VocabDaily', zh: '阅读 · VocabDaily' },
    searchAliases: ['reading', '阅读', 'ielts reading'],
  },
  {
    id: 'listening',
    path: '/dashboard/listening',
    label: { en: 'Listening', zh: '听力' },
    description: { en: 'IELTS listening practice.', zh: 'IELTS 听力练习。' },
    icon: Headphones,
    group: 'practice',
    mobilePriority: 7,
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
    mobilePriority: 8,
    pageTitle: { en: 'Grammar · VocabDaily', zh: '语法 · VocabDaily' },
    searchAliases: ['grammar', '语法'],
  },
  {
    id: 'pronunciation',
    path: '/dashboard/pronunciation',
    label: { en: 'Pronunciation', zh: '发音' },
    description: { en: 'Sounds and short speaking.', zh: '发音和短口语。' },
    icon: AudioLines,
    group: 'practice',
    mobilePriority: 9,
    pageTitle: { en: 'Pronunciation · VocabDaily', zh: '发音 · VocabDaily' },
    searchAliases: ['pronunciation', '发音', 'speaking', '口语'],
  },
  {
    id: 'writing',
    path: '/dashboard/writing',
    label: { en: 'Writing', zh: '写作' },
    description: { en: 'Writing and revision.', zh: '写作和修改。' },
    icon: PenTool,
    group: 'practice',
    mobilePriority: 10,
    pageTitle: { en: 'Writing · VocabDaily', zh: '写作 · VocabDaily' },
    searchAliases: ['writing', '写作', 'essay', 'task 2'],
  },
  {
    id: 'exam',
    path: '/dashboard/exam',
    label: { en: 'Exam Prep', zh: '考试训练' },
    description: { en: 'IELTS timed practice.', zh: 'IELTS 计时练习。' },
    icon: Target,
    group: 'practice',
    mobilePriority: 3,
    pageTitle: { en: 'Exam Prep · VocabDaily', zh: '考试训练 · VocabDaily' },
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
    label: { en: 'Lexicon', zh: '词典' },
    description: { en: 'Dictionary, word books, and lexical search.', zh: '词典、词书与词汇检索。' },
    icon: Library,
    group: 'tools',
    mobilePriority: 12,
    pageTitle: { en: 'Lexicon · VocabDaily', zh: '词典 · VocabDaily' },
    searchAliases: ['lexicon', 'dictionary', 'vocabulary', 'words', '词典', '词书', '词汇', 'deck'],
  },
  {
    id: 'analytics',
    path: '/dashboard/analytics',
    label: { en: 'Progress', zh: '进度' },
    description: { en: 'Records and trends.', zh: '记录和趋势。' },
    icon: Target,
    group: 'tools',
    mobilePriority: 13,
    pageTitle: { en: 'Progress · VocabDaily', zh: '进度 · VocabDaily' },
    searchAliases: ['analytics', 'stats', '数据', '统计'],
  },
  {
    id: 'evidence',
    path: '/dashboard/evidence',
    label: { en: 'Evidence', zh: '证据' },
    description: { en: 'Attempts, weak signals, and recovery queue.', zh: '学习记录、薄弱信号和补救队列。' },
    icon: BarChart3,
    group: 'tools',
    mobilePriority: 18,
    pageTitle: { en: 'Evidence · VocabDaily', zh: '证据 · VocabDaily' },
    searchAliases: ['evidence', 'attempts', 'mistakes', 'remediation', '证据', '错题', '补救'],
    enterpriseOnly: true,
  },
  {
    id: 'memory',
    path: '/dashboard/memory',
    label: { en: 'Memory', zh: '记忆' },
    description: { en: 'Saved notes.', zh: '保存的线索。' },
    icon: Shield,
    group: 'tools',
    mobilePriority: 14,
    pageTitle: { en: 'Memory · VocabDaily', zh: '记忆 · VocabDaily' },
    searchAliases: ['memory', '记忆', 'agent memory', 'profile'],
  },
  {
    id: 'leaderboard',
    path: '/dashboard/leaderboard',
    label: { en: 'Leaderboard', zh: '排行' },
    description: { en: 'Weekly points.', zh: '本周积分。' },
    icon: CalendarDays,
    group: 'tools',
    mobilePriority: 15,
    pageTitle: { en: 'Leaderboard · VocabDaily', zh: '排行 · VocabDaily' },
    searchAliases: ['leaderboard', '排行', 'rank', '社区'],
  },
  {
    id: 'organization',
    path: '/dashboard/organization',
    label: { en: 'Organization', zh: '组织' },
    description: { en: 'Members, cohorts, assignments, and audit.', zh: '成员、班级、作业和审计。' },
    icon: Building2,
    group: 'admin',
    mobilePriority: 19,
    pageTitle: { en: 'Organization · VocabDaily', zh: '组织 · VocabDaily' },
    searchAliases: ['organization', 'org', 'cohort', 'assignments', 'audit', '组织', '班级', '作业', '审计'],
    enterpriseOnly: true,
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

export function getMobileNavRoutes(
  limit = 4,
  options: DashboardRouteVisibilityOptions = {},
): DashboardRouteMeta[] {
  return ROUTES
    .slice()
    .filter((route) => isRouteVisible(route, options))
    .sort((a, b) => a.mobilePriority - b.mobilePriority)
    .slice(0, limit);
}

export function getRoutesByGroup(
  group: DashboardRouteGroup,
  options: DashboardRouteVisibilityOptions = {},
): DashboardRouteMeta[] {
  return ROUTES
    .filter((route) => route.group === group)
    .filter((route) => isRouteVisible(route, options))
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

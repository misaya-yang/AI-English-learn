import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { getDashboardRouteByPath } from '@/features/learning/routeRegistry';

const publicTitles: Record<string, { en: string; zh: string }> = {
  '/': { en: 'IELTS Vocabulary Practice', zh: 'IELTS 词汇练习' },
  '/word-of-the-day': { en: 'Word of the Day', zh: '每日单词' },
  '/demo': { en: 'Sample Lesson', zh: '样课' },
  '/pricing': { en: 'Pricing', zh: '定价与会员' },
  '/terms': { en: 'Terms of Service', zh: '服务条款' },
  '/privacy': { en: 'Privacy Policy', zh: '隐私政策' },
  '/login': { en: 'Sign In', zh: '登录' },
  '/register': { en: 'Create Account', zh: '创建账号' },
  '/magic-link': { en: 'Email Link Sign-In', zh: '邮箱链接登录' },
  '/auth/callback': { en: 'Completing Sign-In', zh: '正在完成登录' },
  '/onboarding': { en: 'Learning Setup', zh: '学习设置' },
};

export function RouteDocumentMeta() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh') ?? false;

  useEffect(() => {
    const language = isZh ? 'zh-CN' : 'en';
    document.documentElement.lang = language;

    const dashboardRoute = getDashboardRouteByPath(location.pathname);
    const routeTitle = dashboardRoute
      ? (isZh ? dashboardRoute.pageTitle.zh : dashboardRoute.pageTitle.en)
      : publicTitles[location.pathname]
        ? (isZh ? publicTitles[location.pathname].zh : publicTitles[location.pathname].en)
        : (isZh ? '页面未找到 · VocabDaily' : 'Page Not Found · VocabDaily');

    document.title = routeTitle.includes('VocabDaily')
      ? routeTitle
      : `${routeTitle} · VocabDaily`;
  }, [isZh, location.pathname]);

  return null;
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthRedirect } from '@/lib/authRedirect';

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-screen items-center justify-center bg-background px-6"
      >
        <div className="max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-muted border-b-primary" />
          <p className="mt-5 text-sm font-semibold text-foreground">
            {isZh ? '正在确认登录状态' : 'Confirming your sign-in status'}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {isZh ? '确认后会继续打开刚才的学习任务。' : 'After confirmation, we will reopen the learning task you requested.'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const target = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={buildAuthRedirect(target)} replace />;
  }

  return <Outlet />;
}

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
        className="flex min-h-screen items-start justify-center bg-background px-6 pt-24"
      >
        <div className="flex w-full max-w-md items-center gap-3 rounded-md border border-border bg-card px-4 py-3 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-b-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isZh ? '正在确认登录状态' : 'Confirming your sign-in status'}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {isZh ? '确认后继续打开学习任务。' : 'Your learning task will reopen after confirmation.'}
            </p>
          </div>
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

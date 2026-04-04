import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<
  ErrorBoundaryProps & { t: (key: string) => string },
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps & { t: (key: string) => string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard/today';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { t } = this.props;

      return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{t('errorBoundary.title')}</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {t('errorBoundary.description')}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-w-lg overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleReload}>
              <RefreshCw className="size-4" />
              {t('errorBoundary.retry')}
            </Button>
            <Button onClick={this.handleGoHome}>
              <Home className="size-4" />
              {t('errorBoundary.goHome')}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <ErrorBoundaryInner t={t} fallback={fallback}>
      {children}
    </ErrorBoundaryInner>
  );
}

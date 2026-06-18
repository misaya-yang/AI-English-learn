import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardSkeleton, PageSkeleton } from './DashboardSkeleton';

let i18nLanguage = 'zh-CN';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: i18nLanguage } }),
}));

describe('DashboardSkeleton', () => {
  beforeEach(() => {
    i18nLanguage = 'zh-CN';
  });

  it('names the dashboard loading operation', () => {
    render(<DashboardSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('正在打开');
    expect(screen.getByText('读取词书和进度')).toBeInTheDocument();
  });

  it('names the public-page loading operation', () => {
    render(<PageSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('VocabDaily');
    expect(screen.getByText('正在打开页面')).toBeInTheDocument();
  });

  it('uses English loading copy when the app language is English', () => {
    i18nLanguage = 'en-US';

    render(<DashboardSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('Opening');
    expect(screen.getByText('Loading words and progress')).toBeInTheDocument();
    expect(screen.queryByText('正在打开')).not.toBeInTheDocument();
  });
});

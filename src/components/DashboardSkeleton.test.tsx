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

    expect(screen.getByRole('status')).toHaveTextContent('正在加载');
    expect(screen.getByText('保持当前页面，马上继续。')).toBeInTheDocument();
    expect(screen.getByText('今天的内容')).toBeInTheDocument();
  });

  it('names the public-page loading operation', () => {
    render(<PageSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('VocabDaily');
    expect(screen.getByText('正在打开页面')).toBeInTheDocument();
  });

  it('uses English loading copy when the app language is English', () => {
    i18nLanguage = 'en-US';

    render(<DashboardSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(screen.getByText('Keeping this page ready.')).toBeInTheDocument();
    expect(screen.queryByText('正在加载')).not.toBeInTheDocument();
  });
});

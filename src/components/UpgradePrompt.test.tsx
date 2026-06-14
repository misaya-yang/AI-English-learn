import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const i18nState = vi.hoisted(() => ({
  language: 'en',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: i18nState.language },
  }),
}));

vi.mock('@/features/marketing/pricingAvailability', () => ({
  getCheckoutStatus: () => ({ kind: 'coming_soon' }),
}));

import { UpgradePrompt } from './UpgradePrompt';

const renderPrompt = (feature: ComponentProps<typeof UpgradePrompt>['feature'] = 'aiChat') =>
  render(
    <MemoryRouter>
      <UpgradePrompt feature={feature} />
    </MemoryRouter>,
  );

describe('UpgradePrompt', () => {
  beforeEach(() => {
    i18nState.language = 'en';
  });

  it('explains the Pro waitlist instead of implying live checkout', () => {
    renderPrompt('aiChat');

    expect(screen.getByText("Today's free quota is used")).toBeInTheDocument();
    expect(screen.getByText(/English Help is limited to 10\/day on Free/i)).toBeInTheDocument();
    expect(screen.getByText(/weekly planning/i)).toBeInTheDocument();
    expect(screen.getByText(/IELTS Writing and Speaking scoring rubrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced analytics: pending reviews/i)).toBeInTheDocument();
    expect(screen.getByText(/Join the Pro interest list/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Join waitlist/i })).toHaveAttribute('href', '/pricing');
    expect(screen.queryByText(/^Upgrade to Pro$/i)).not.toBeInTheDocument();
  });

  it('uses Chinese copy for the same gate contract', () => {
    i18nState.language = 'zh-CN';

    renderPrompt('aiExamFeedback');

    expect(screen.getByText('今日额度已用完')).toBeInTheDocument();
    expect(screen.getByText(/考试反馈免费版每天限 2 次/)).toBeInTheDocument();
    expect(screen.getByText(/IELTS 评分反馈/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '加入等待名单' })).toHaveAttribute('href', '/pricing');
  });
});

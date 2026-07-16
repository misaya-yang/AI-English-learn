import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  isAuthenticated: true,
  isLoading: false,
  updateUserProfile: vi.fn(),
}));

const userDataState = vi.hoisted(() => ({
  setActiveBook: vi.fn(),
  updateLearningProfile: vi.fn(),
  refreshDailyMission: vi.fn(),
}));

const i18nState = vi.hoisted(() => ({
  language: 'en',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? '',
    i18n: { language: i18nState.language },
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => userDataState,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import OnboardingPage from './OnboardingPage';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <OnboardingPage />
    </MemoryRouter>,
  );

describe('OnboardingPage UI semantics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
    authState.isLoading = false;
    authState.updateUserProfile.mockResolvedValue(true);
    i18nState.language = 'en';
  });

  it('uses a compact first step with radio semantics and sticky text actions', async () => {
    const { container } = renderPage();

    const heading = screen.getByRole('heading', { name: 'Choose your level' });
    await waitFor(() => expect(heading).toHaveFocus());

    const levelGroup = screen.getByRole('radiogroup', {
      name: 'Choose an English level manually',
    });
    expect(within(levelGroup).getByRole('radio', { name: /^B1 Intermediate/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    fireEvent.click(within(levelGroup).getByRole('radio', { name: /^C1 Advanced/i }));
    expect(within(levelGroup).getByRole('radio', { name: /^C1 Advanced/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    const actions = screen.getByTestId('onboarding-sticky-actions');
    expect(actions).toHaveClass('fixed', 'sm:sticky');
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(actions.querySelector('.lucide-chevron-left')).toBeNull();
    expect(actions.querySelector('.lucide-chevron-right')).toBeNull();
    expect(container.querySelector('.lucide-graduation-cap')).toBeNull();
  });

  it('focuses the new step heading and exposes exclusive targets as a radiogroup', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    const heading = screen.getByRole('heading', { name: 'What are you learning for?' });
    await waitFor(() => expect(heading).toHaveFocus());

    const targetGroup = screen.getByRole('radiogroup', {
      name: 'What are you learning for?',
    });
    expect(within(targetGroup).getByRole('radio', { name: /General fluency/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    fireEvent.click(within(targetGroup).getByRole('radio', { name: /IELTS target/i }));
    expect(within(targetGroup).getByRole('radio', { name: /IELTS target/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radiogroup', { name: 'Target score' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Exam date' })).toBeInTheDocument();
  });

  it('keeps multi-select topics as pressed buttons', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    const heading = screen.getByRole('heading', { name: 'Choose practice topics' });
    const topicGroup = screen.getByRole('group', { name: 'Choose practice topics' });
    expect(heading).toBeInTheDocument();

    const business = within(topicGroup).getByRole('button', { name: 'Business' });
    expect(business).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(business);
    expect(business).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});

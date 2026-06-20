import { render, screen } from '@testing-library/react';
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

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <button type="button">Language</button>,
}));

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

import LegalPage from './LegalPage';

const renderLegalPage = (path: '/terms' | '/privacy') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LegalPage />
    </MemoryRouter>,
  );

describe('LegalPage', () => {
  beforeEach(() => {
    i18nState.language = 'en';
  });

  it('does not expose draft or placeholder legal copy on terms', () => {
    renderLegalPage('/terms');

    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.getAllByText('support@uuedu.online').length).toBeGreaterThan(0);
    expect(screen.queryByText(/placeholder|pending legal review|pre-launch draft|release blocker/i)).not.toBeInTheDocument();
  });

  it('does not expose draft or placeholder legal copy on privacy', () => {
    renderLegalPage('/privacy');

    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getAllByText('support@uuedu.online').length).toBeGreaterThan(0);
    expect(screen.queryByText(/placeholder|pending legal review|pre-launch draft|release blocker/i)).not.toBeInTheDocument();
  });
});

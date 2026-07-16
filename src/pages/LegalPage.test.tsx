import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

  it('uses a wide editorial layout with a metadata rail', () => {
    const { container } = renderLegalPage('/terms');

    expect(container.querySelector('main')).toHaveClass('max-w-6xl');
    expect(container.querySelector('article')).toBeInTheDocument();
    expect(container.querySelector('aside')).toBeInTheDocument();
    expect(screen.getByText('Effective date')).toBeInTheDocument();
  });

  it('links contact addresses with mailto and cross-links both legal documents', () => {
    renderLegalPage('/terms');

    const emailLinks = screen.getAllByRole('link', { name: 'support@uuedu.online' });
    expect(emailLinks.length).toBeGreaterThan(0);
    emailLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', 'mailto:support@uuedu.online');
    });
    expect(screen.getByRole('link', { name: 'Read the Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy',
    );
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('links privacy back to the terms', () => {
    renderLegalPage('/privacy');

    expect(screen.getByRole('link', { name: 'Read the Terms of Service' })).toHaveAttribute(
      'href',
      '/terms',
    );
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('uses route history before falling back to Home', () => {
    render(
      <MemoryRouter initialEntries={['/pricing', '/terms']} initialIndex={1}>
        <Routes>
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/pricing" element={<div>Pricing route</div>} />
          <Route path="/" element={<div>Home route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('Pricing route')).toBeInTheDocument();
    expect(screen.queryByText('Home route')).not.toBeInTheDocument();
  });

  it('falls back to Home when the legal route has no prior entry', () => {
    render(
      <MemoryRouter initialEntries={['/terms']}>
        <Routes>
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/" element={<div>Home route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('Home route')).toBeInTheDocument();
  });
});

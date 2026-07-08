import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBuiltInWordBookContentManifest } from '@/services/contentLicensing';

let i18nLanguage = 'zh-CN';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: i18nLanguage } }),
}));

import OrganizationPage from './OrganizationPage';

describe('OrganizationPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    i18nLanguage = 'zh-CN';
  });

  it('renders the enterprise workbench sections', () => {
    render(
      <MemoryRouter>
        <OrganizationPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '组织工作台' })).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Cohorts')).toBeInTheDocument();
    expect(screen.getAllByText('Assignments').length).toBeGreaterThan(0);
    expect(screen.getByText('Content Packs')).toBeInTheDocument();
    expect(screen.getAllByText('Audit').length).toBeGreaterThan(0);
  });

  it('shows fail-closed missing entitlement states', () => {
    render(
      <MemoryRouter>
        <OrganizationPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('missing_entitlement').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Assignments').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SSO').length).toBeGreaterThan(0);
  });

  it('summarizes real content pack provenance counts', () => {
    const manifest = getBuiltInWordBookContentManifest();
    const safeCount = manifest.filter((entry) => entry.commercialUseAllowed && entry.redistributionAllowed).length;

    render(
      <MemoryRouter>
        <OrganizationPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(`${safeCount} / ${manifest.length}`)).toBeInTheDocument();
  });

  it('renders a disabled preview message when the feature flag is off', () => {
    vi.stubEnv('VITE_ENTERPRISE_UI_ENABLED', 'false');

    render(
      <MemoryRouter>
        <OrganizationPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('企业工作台预览已关闭')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回今日' })).toHaveAttribute('href', '/dashboard/today');
  });

  it('renders English copy', () => {
    i18nLanguage = 'en-US';

    render(
      <MemoryRouter>
        <OrganizationPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Organization Workbench' })).toBeInTheDocument();
    expect(screen.queryByText('组织工作台')).not.toBeInTheDocument();
  });
});

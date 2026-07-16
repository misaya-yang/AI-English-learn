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

    expect(screen.getAllByText('需要组织授权').length).toBeGreaterThan(0);
    expect(screen.queryByText('missing_entitlement')).not.toBeInTheDocument();
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

    expect(screen.getByText('当前账号暂未开放组织工作台')).toBeInTheDocument();
    expect(screen.getByText(/联系组织管理员申请访问权限/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '继续个人学习' })).toHaveAttribute('href', '/dashboard/today');
    expect(screen.queryByText(/VITE_/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/staging/i)).not.toBeInTheDocument();
  });

  it('keeps implementation notes and raw entitlement reasons out of the product UI', () => {
    render(
      <MemoryRouter>
        <OrganizationPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('下一步实现')).not.toBeInTheDocument();
    expect(screen.queryByText(/P0 migration/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/missing_entitlement/i)).not.toBeInTheDocument();
    expect(screen.getByText('管理负责人、管理员、教师与学习者。')).toBeInTheDocument();
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

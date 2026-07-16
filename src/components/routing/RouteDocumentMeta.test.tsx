import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RouteDocumentMeta } from './RouteDocumentMeta';

const i18nState = vi.hoisted(() => ({ language: 'en' }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: i18nState.language },
  }),
}));

const renderMeta = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <RouteDocumentMeta />
    </MemoryRouter>,
  );

describe('RouteDocumentMeta', () => {
  beforeEach(() => {
    i18nState.language = 'en';
    document.documentElement.lang = 'en';
    document.title = 'VocabDaily';
  });

  it('sets a dashboard route title', async () => {
    renderMeta('/dashboard/practice');

    await waitFor(() => {
      expect(document.title).toMatch(/Practice.*VocabDaily/i);
      expect(document.documentElement.lang).toBe('en');
    });
  });

  it('sets Chinese lang and a localized public title', async () => {
    i18nState.language = 'zh-CN';
    renderMeta('/pricing');

    await waitFor(() => {
      expect(document.title).toBe('定价与会员 · VocabDaily');
      expect(document.documentElement.lang).toBe('zh-CN');
    });
  });

  it('provides a catch-all title for unknown routes', async () => {
    renderMeta('/not-a-real-page');

    await waitFor(() => {
      expect(document.title).toBe('Page Not Found · VocabDaily');
    });
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrandMark } from './BrandMark';

const i18nState = vi.hoisted(() => ({
  language: 'zh',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: i18nState.language },
  }),
}));

describe('BrandMark', () => {
  beforeEach(() => {
    i18nState.language = 'zh';
  });

  it('localizes the product tagline and home-link label', () => {
    render(
      <MemoryRouter>
        <BrandMark />
      </MemoryRouter>,
    );

    expect(screen.getByText('英语学习')).toBeInTheDocument();
    expect(screen.queryByText('每日练习')).not.toBeInTheDocument();
    expect(screen.getByLabelText('VocabDaily 返回首页')).toBeInTheDocument();
  });
});

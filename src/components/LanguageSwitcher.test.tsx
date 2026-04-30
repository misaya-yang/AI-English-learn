import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageSwitcher } from './LanguageSwitcher';

const i18nState = vi.hoisted(() => ({
  language: 'en',
  changeLanguage: vi.fn((code: string) => {
    i18nState.language = code;
    return Promise.resolve();
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      get language() {
        return i18nState.language;
      },
      changeLanguage: i18nState.changeLanguage,
    },
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    i18nState.language = 'en';
    i18nState.changeLanguage.mockClear();
  });

  it('uses localized accessible labels and persists the selected language', async () => {
    render(<LanguageSwitcher />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Switch language' }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole('menuitem', { name: /中文/ }));

    expect(i18nState.changeLanguage).toHaveBeenCalledWith('zh');
    expect(localStorage.getItem('language')).toBe('zh');
  });
});

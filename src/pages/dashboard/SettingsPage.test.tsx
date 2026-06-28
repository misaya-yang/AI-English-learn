import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const i18nState = vi.hoisted(() => ({
  language: 'zh-CN',
  changeLanguage: vi.fn(),
}));

const authState = vi.hoisted(() => ({
  logout: vi.fn(),
}));

const themeState = vi.hoisted(() => ({
  theme: 'system',
  setTheme: vi.fn(),
}));

const reminderState = vi.hoisted(() => ({
  permission: 'denied' as 'granted' | 'denied' | 'default' | 'unsupported',
  requestPermission: vi.fn(),
  saveReminderHour: vi.fn(),
}));

const storageResetState = vi.hoisted(() => ({
  clearAllData: vi.fn(),
  clearLocalDbData: vi.fn().mockResolvedValue(undefined),
}));

const userDataState = vi.hoisted(() => ({
  updateSettings: vi.fn(),
  settings: {
    theme: 'system',
    notifications: true,
    emailReminders: true,
    reminderTime: '20:00',
    lifecycleReminders: true,
    quietHoursStart: '23:00',
    quietHoursEnd: '07:00',
    soundEnabled: true,
    ttsEnabled: true,
    ttsVoice: 'en-US',
    autoPlayAudio: false,
    showPinyin: false,
    fontSize: 'medium',
    dailyNewWordLimit: 10,
    maxReviewCount: 24,
    targetRetention: 0.9,
    examWeekBoost: false,
  },
  dueWords: Array.from({ length: 9 }, (_, index) => ({ wordId: `w${index}` })),
  streak: { current: 3, longest: 5, lastStudyDate: null },
  xp: { total: 0, today: 0, level: 1 },
  dailyMission: {
    id: 'm1',
    status: 'in_progress',
    tasks: [{ id: 't1', type: 'review', title: 'Review', titleZh: '复习', done: false }],
  },
  learningProfile: {
    tracks: [],
    target: 'general_improvement',
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' }, logout: authState.logout }),
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => themeState,
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => userDataState,
}));

vi.mock('@/hooks/useStudyReminder', () => ({
  useStudyReminder: () => ({
    isSupported: true,
    permission: reminderState.permission,
    reminderHour: null,
    requestPermission: reminderState.requestPermission,
    saveReminderHour: reminderState.saveReminderHour,
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

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/data/localStorage', () => ({
  clearAllData: storageResetState.clearAllData,
}));

vi.mock('@/lib/localDb', () => ({
  clearLocalDbData: storageResetState.clearLocalDbData,
}));

import SettingsPage from './SettingsPage';
import { clearAllData } from '@/data/localStorage';
import { clearLocalDbData } from '@/lib/localDb';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard/settings?tab=notifications']}>
      <SettingsPage />
    </MemoryRouter>,
  );

describe('SettingsPage notifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-13T12:00:00+08:00'));
    vi.clearAllMocks();
    reminderState.permission = 'denied';
    userDataState.settings.lifecycleReminders = true;
    userDataState.settings.quietHoursStart = '23:00';
    userDataState.settings.quietHoursEnd = '07:00';
    userDataState.dueWords = Array.from({ length: 9 }, (_, index) => ({ wordId: `w${index}` }));
    userDataState.dailyMission.status = 'in_progress';
    userDataState.dailyMission.tasks = [{ id: 't1', type: 'review', title: 'Review', titleZh: '复习', done: false }];
    i18nState.language = 'zh-CN';
    i18nState.changeLanguage.mockClear();
    localStorage.clear();
    Element.prototype.hasPointerCapture ??= vi.fn(() => false);
    Element.prototype.setPointerCapture ??= vi.fn();
    Element.prototype.releasePointerCapture ??= vi.fn();
    Element.prototype.scrollIntoView ??= vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('degrades gracefully when browser notification permission is denied', () => {
    renderPage();

    expect(screen.getAllByText(/已拒绝/).length).toBeGreaterThan(0);
    expect(screen.queryByText('当前会发送这条提醒')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '申请权限' })).not.toBeInTheDocument();
  });

  it('previews a real review-debt lifecycle nudge and lets users edit quiet hours', () => {
    reminderState.permission = 'granted';

    renderPage();

    expect(screen.getByText('当前会发送这条提醒')).toBeInTheDocument();
    expect(screen.getByText(/待复习正在增加/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '打开对应练习' })).toHaveAttribute('href', '/dashboard/review');

    fireEvent.change(screen.getByLabelText('安静时间开始'), { target: { value: '21:00' } });
    expect(userDataState.updateSettings).toHaveBeenCalledWith({ quietHoursStart: '21:00' });
  });

  it('does not preview a nudge after today is complete', () => {
    reminderState.permission = 'granted';
    userDataState.dailyMission.status = 'completed';
    userDataState.dailyMission.tasks = [{ id: 't1', type: 'review', title: 'Review', titleZh: '复习', done: true }];

    renderPage();

    expect(screen.getByText('今日内容已完成，不会继续提醒')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '打开对应练习' })).not.toBeInTheDocument();
  });

  it('persists language changes using the global language storage key', async () => {
    vi.useRealTimers();

    render(
      <MemoryRouter initialEntries={['/dashboard/settings']}>
        <SettingsPage />
      </MemoryRouter>,
    );

    fireEvent.pointerDown(screen.getAllByRole('combobox')[2], {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    });
    fireEvent.click(await screen.findByRole('option', { name: 'English' }));

    expect(i18nState.changeLanguage).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('language')).toBe('en');
    expect(localStorage.getItem('vocabdaily_language')).toBeNull();
  });

  it('clears localStorage and IndexedDB only after destructive confirmation', async () => {
    vi.useRealTimers();

    render(
      <MemoryRouter initialEntries={['/dashboard/settings?tab=account']}>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(clearAllData).not.toHaveBeenCalled();
    expect(clearLocalDbData).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '清除所有数据' }));
    fireEvent.click(await screen.findByRole('button', { name: '确认删除' }));

    expect(clearAllData).toHaveBeenCalledTimes(1);
    expect(clearLocalDbData).toHaveBeenCalledTimes(1);
  });
});

import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStudyReminder } from '@/hooks/useStudyReminder';
import { useAuth } from '@/contexts/AuthContext';
import type { Theme } from '@/contexts/ThemeContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  Bell,
  Palette,
  Volume2,
  Globe,
  Clock,
  Save,
  AlertTriangle,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { clearAllData } from '@/data/localStorage';
import { clearLocalDbData } from '@/lib/localDb';
import type { FontSize, UserSettings } from '@/types/core';
import {
  buildLifecycleNotification,
  isInQuietHours,
} from '@/features/learning/lifecycleNotifications';

const localDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SETTINGS_TABS = ['general', 'notifications', 'learning', 'account'] as const;
type SettingsTab = (typeof SETTINGS_TABS)[number];

const resolveSettingsTab = (value: string | null): SettingsTab =>
  SETTINGS_TABS.includes(value as SettingsTab) ? value as SettingsTab : 'general';

const settingsFingerprint = (settings: UserSettings): string => JSON.stringify([
  settings.theme,
  settings.notifications,
  settings.emailReminders,
  settings.reminderTime,
  settings.lifecycleReminders,
  settings.quietHoursStart,
  settings.quietHoursEnd,
  settings.soundEnabled,
  settings.ttsEnabled,
  settings.ttsVoice,
  settings.autoPlayAudio,
  settings.showPinyin,
  settings.fontSize,
  settings.dailyNewWordLimit,
  settings.maxReviewCount,
  settings.targetRetention,
  settings.examWeekBoost,
]);

const isIntegerInRange = (value: number, min: number, max: number): boolean =>
  Number.isInteger(value) && value >= min && value <= max;

const clampInteger = (value: number, fallback: number, min: number, max: number): number => {
  const finiteValue = Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, Math.round(finiteValue)));
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, dueWords, streak, dailyMission, learningProfile, xp } = useUserData();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh') ?? false;
  const copy = {
    subtitle: isZh ? '调整偏好、提醒节奏和账号安全。' : 'Tune preferences, reminders, and account safety.',
    save: isZh ? '保存设置' : 'Save changes',
    saved: isZh ? '设置已保存' : 'Settings saved successfully',
    loggedOut: isZh ? '已退出登录' : 'Logged out successfully',
    cleared: isZh ? '所有本地学习数据已清除' : 'All data cleared',
    appearanceDesc: isZh ? '设置主题、字号和界面语言。' : 'Set theme, font size, and interface language.',
    theme: isZh ? '主题' : 'Theme',
    fontSize: isZh ? '字体大小' : 'Font size',
    language: isZh ? '界面语言' : 'Language',
    themeOptions: {
      light: isZh ? '浅色' : 'Light',
      dark: isZh ? '深色' : 'Dark',
      system: isZh ? '跟随系统' : 'System',
    },
    fontOptions: {
      small: isZh ? '小' : 'Small',
      medium: isZh ? '中' : 'Medium',
      large: isZh ? '大' : 'Large',
    },
    remindersTitle: isZh ? '学习提醒' : 'Study reminders',
    remindersDescription: isZh ? '每天在固定时间收到浏览器推送提醒，保持学习连续性' : 'Receive browser reminders at a fixed time to keep study consistent.',
    notificationsUnsupported: isZh ? '当前浏览器不支持桌面通知' : 'This browser does not support desktop notifications.',
    permissionLabel: isZh ? '浏览器通知权限' : 'Browser notification permission',
    permissionGranted: isZh ? '已授权' : 'Permission granted',
    permissionDenied: isZh ? '已拒绝，请在浏览器设置中重新允许' : 'Denied. Re-enable it in browser settings.',
    permissionPending: isZh ? '尚未授权，点击右侧按钮申请' : 'Not granted yet. Request permission to enable reminders.',
    requestPermission: isZh ? '申请权限' : 'Request permission',
    permissionGrantedToast: isZh ? '通知权限已授权！' : 'Notification permission granted.',
    permissionDeniedToast: isZh ? '通知权限被拒绝' : 'Notification permission denied.',
    dailyReminder: isZh ? '每日学习提醒' : 'Daily study reminder',
    reminderEnabled: (hour: number) => isZh ? `已开启 · 每天 ${hour}:00` : `On · every day at ${hour}:00`,
    reminderOff: isZh ? '未开启' : 'Off',
    reminderOnToast: isZh ? '提醒已开启，每天 20:00 提醒' : 'Reminder enabled for 20:00 every day.',
    reminderOffToast: isZh ? '已关闭每日提醒' : 'Daily reminder disabled.',
    reminderTime: isZh ? '提醒时间' : 'Reminder time',
    reminderTimeDesc: isZh ? '每天在此时间推送一条提醒' : 'Send one reminder at this time each day.',
    reminderTimeUpdated: (hour: string) => isZh ? `提醒时间已更新为 ${hour}:00` : `Reminder time updated to ${hour}:00`,
    lifecycleLabel: isZh ? '学习提醒' : 'Learning nudges',
    lifecycleDesc: isZh ? '根据待复习、连续学习风险、考试周和周报整理提醒内容。' : 'Build reminder content from due reviews, streak risk, exam weeks, and weekly recaps.',
    lifecycleEnabledToast: isZh ? '学习提醒已开启' : 'Learning nudges enabled.',
    lifecycleDisabledToast: isZh ? '学习提醒已关闭' : 'Learning nudges disabled.',
    lifecycleOff: isZh ? '学习提醒已关闭' : 'Learning nudges are off',
    lifecycleComplete: isZh ? '今日内容已完成，不会继续提醒' : 'Today is complete, so no more nudges will be sent.',
    lifecycleQuiet: isZh ? '现在处于安静时间，不会推送' : 'Quiet hours are active, so no push will be sent.',
    lifecycleWillSend: isZh ? '当前会发送这条提醒' : 'This reminder would be sent now.',
    lifecycleNoSignal: isZh ? '暂时没有需要打扰你的学习信号' : 'No learning signal needs a reminder right now.',
    lifecycleOpen: isZh ? '打开对应练习' : 'Open related practice',
    lifecycleFallback: isZh ? '提醒只会在开启通知、避开安静时间、且今日内容未完成时出现。' : 'Reminders only appear when notifications are on, quiet hours are clear, and today is unfinished.',
    quietStart: isZh ? '安静时间开始' : 'Quiet hours start',
    quietEnd: isZh ? '安静时间结束' : 'Quiet hours end',
    audioDesc: isZh ? '配置单词发音与播放偏好。' : 'Configure pronunciation and playback preferences.',
    ttsVoice: isZh ? 'TTS 语音' : 'TTS voice',
    learningTitle: isZh ? 'FSRS 学习强度' : 'FSRS learning intensity',
    learningDesc: isZh ? '控制每天新词、复习上限和考前强度，Today 与 Review 会按这里的设置调整。' : 'Control daily new words, review limits, and exam-week intensity. Today and Review use these settings.',
    dailyNewLimit: isZh ? '每日新词上限' : 'Daily new-word limit',
    dailyNewLimitDesc: isZh ? '影响 Today 的新词目标和每日词包大小。' : 'Affects Today goals and the daily word pack size.',
    maxReviewCount: isZh ? '每日复习上限' : 'Daily review limit',
    maxReviewCountDesc: isZh ? 'Review 页面和 Today 复习不会超过这个上限。' : 'Review and Today stay within this limit.',
    invalidDailyNewLimit: isZh ? '请输入 1 到 50 之间的整数。' : 'Enter a whole number from 1 to 50.',
    invalidMaxReviewCount: isZh ? '请输入 5 到 100 之间的整数。' : 'Enter a whole number from 5 to 100.',
    targetRetention: isZh ? '目标记忆保持率' : 'Target retention',
    retentionOptions: {
      light: isZh ? '85% · 轻量' : '85% · Light',
      standard: isZh ? '90% · 标准' : '90% · Standard',
      strong: isZh ? '95% · 稳记' : '95% · Strong',
    },
    targetRetentionDesc: isZh ? '更高保持率会减少新词、增加复习权重。' : 'Higher retention reduces new words and increases review weight.',
    examWeekBoost: isZh ? '考前强化周' : 'Exam-week boost',
    examWeekDesc: isZh ? '优先安排考试输出和更多复习。' : 'Prioritize exam output and extra review.',
    audioTitle: isZh ? '音频与发音' : 'Audio and pronunciation',
    ttsEnabled: isZh ? '文字转语音' : 'Text to speech',
    ttsEnabledDesc: isZh ? '启用单词和句子的朗读。' : 'Enable spoken playback for words and sentences.',
    autoPlayAudio: isZh ? '自动播放音频' : 'Auto-play audio',
    autoPlayAudioDesc: isZh ? '自动播放音档' : 'Automatically play audio clips where supported.',
    accountDesc: isZh ? '管理登录信息和个人资料入口。' : 'Manage sign-in details and profile entry.',
    accountInfo: isZh ? '账号信息' : 'Account information',
    displayName: isZh ? '显示名称' : 'Display name',
    profileHint: isZh ? '如需修改名称，请前往' : 'To change your name, visit',
    profileLink: isZh ? '个人资料设置' : 'Profile settings',
    dangerTitle: isZh ? '危险操作' : 'Danger zone',
    dangerDesc: isZh ? '这些操作会影响账号或本地学习数据。' : 'These actions affect your account or local learning data.',
    clearConfirmTitle: isZh ? '清除所有学习数据？' : 'Clear all learning data?',
    clearConfirmBody: isZh
      ? '这会永久删除本机浏览器里的词汇进度、复习记录、离线 IndexedDB 记录和本地设置。此操作无法撤销。'
      : 'This permanently deletes local browser word progress, review history, offline IndexedDB records, and settings. This action cannot be undone.',
    clearData: isZh ? '清除所有数据' : 'Clear all data',
    clearDataDesc: isZh ? '删除本机浏览器中的学习进度、离线记录和本地设置' : 'Delete learning progress, offline records, and local settings from this browser',
    clearDataButton: isZh ? '清除所有数据' : 'Clear all data',
    cancel: isZh ? '取消' : 'Cancel',
    confirmDelete: isZh ? '确认删除' : 'Yes, delete everything',
    localDataCleared: isZh ? '本机学习数据已清除' : 'Local learning data cleared',
    signOutHint: isZh ? '退出当前账号' : 'Sign out of your account',
    signOutLabel: isZh ? '退出登录' : 'Log out',
    signOut: isZh ? '退出登录' : 'Log out',
    tabs: {
      general: isZh ? '通用' : 'General',
      notifications: isZh ? '通知' : 'Notifications',
      learning: isZh ? '学习' : 'Learning',
      account: isZh ? '账号' : 'Account',
    },
  };
  const externalSettings = useMemo<UserSettings>(() => ({ ...settings, theme }), [settings, theme]);
  const [localSettings, setLocalSettings] = useState<UserSettings>(externalSettings);
  const [savedSettings, setSavedSettings] = useState<UserSettings>(externalSettings);
  const externalSettingsFingerprint = settingsFingerprint(externalSettings);
  const lastExternalSettingsFingerprintRef = useRef(externalSettingsFingerprint);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveSettingsTab(searchParams.get('tab'));
  const localSettingsFingerprint = settingsFingerprint(localSettings);
  const savedSettingsFingerprint = settingsFingerprint(savedSettings);
  const isDirty = localSettingsFingerprint !== savedSettingsFingerprint;
  const isDailyNewLimitValid = isIntegerInRange(localSettings.dailyNewWordLimit, 1, 50);
  const isMaxReviewCountValid = isIntegerInRange(localSettings.maxReviewCount, 5, 100);
  const areSettingsValid = isDailyNewLimitValid && isMaxReviewCountValid;
  const saveDisabled = !isDirty || !areSettingsValid;
  const now = new Date();
  const today = localDateKey(now);
  const todayCompleted =
    dailyMission?.status === 'completed' ||
    (!!dailyMission?.tasks.length && dailyMission.tasks.every((task) => task.done));
  const hasActivityToday = streak?.lastStudyDate === today || xp.today > 0 || todayCompleted;
  const lifecyclePreview = buildLifecycleNotification({
    notificationsEnabled: localSettings?.notifications ?? settings.notifications,
    lifecycleEnabled: localSettings?.lifecycleReminders ?? settings.lifecycleReminders,
    quietHoursStart: localSettings?.quietHoursStart ?? settings.quietHoursStart,
    quietHoursEnd: localSettings?.quietHoursEnd ?? settings.quietHoursEnd,
    now,
    todayCompleted,
    dueWordsCount: dueWords.length,
    currentStreak: streak?.current || 0,
    hasActivityToday,
    examWeekBoost: localSettings?.examWeekBoost ?? settings.examWeekBoost,
    examTargetActive:
      learningProfile.tracks.includes('exam_boost') ||
      /ielts|toefl|exam/i.test(learningProfile.target),
    weeklyRecapReady: now.getDay() === 1,
    weeklyRecapViewed: false,
  });
  const {
    isSupported: notifSupported,
    permission: notifPermission,
    reminderHour,
    requestPermission,
    saveReminderHour,
  } = useStudyReminder(null, { schedule: false });

  const updateDraftSettings = (patch: Partial<UserSettings>) => {
    setLocalSettings((current) => ({ ...current, ...patch }));
  };
  const lifecycleQuietNow = isInQuietHours(now, localSettings.quietHoursStart, localSettings.quietHoursEnd);
  const canSendNotifications = notifSupported && notifPermission === 'granted';
  const actionableLifecyclePreview = canSendNotifications ? lifecyclePreview : null;
  const lifecycleStatus = (() => {
    if (!notifSupported) return copy.notificationsUnsupported;
    if (notifPermission === 'denied') return copy.permissionDenied;
    if (notifPermission !== 'granted') return copy.permissionPending;
    if (!localSettings.notifications || !localSettings.lifecycleReminders) return copy.lifecycleOff;
    if (todayCompleted) return copy.lifecycleComplete;
    if (lifecycleQuietNow) return copy.lifecycleQuiet;
    if (actionableLifecyclePreview) return copy.lifecycleWillSend;
    return copy.lifecycleNoSignal;
  })();

  // Apply font size to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    if (savedSettings.fontSize === 'small') root.classList.add('text-sm');
    else if (savedSettings.fontSize === 'large') root.classList.add('text-lg');
    else root.classList.add('text-base');
  }, [savedSettings.fontSize]);

  // Load settings from context
  useEffect(() => {
    if (lastExternalSettingsFingerprintRef.current === externalSettingsFingerprint) return;
    lastExternalSettingsFingerprintRef.current = externalSettingsFingerprint;

    const sync = window.setTimeout(() => {
      setLocalSettings(externalSettings);
      setSavedSettings(externalSettings);
    }, 0);

    return () => window.clearTimeout(sync);
  }, [externalSettings, externalSettingsFingerprint]);

  const handleSave = () => {
    if (saveDisabled) return;
    const nextSettings = { ...localSettings };
    lastExternalSettingsFingerprintRef.current = settingsFingerprint(nextSettings);
    setSavedSettings(nextSettings);
    if (nextSettings.theme !== savedSettings.theme) {
      setTheme(nextSettings.theme as Theme);
    }
    updateSettings(nextSettings);
    toast.success(copy.saved);
  };

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', resolveSettingsTab(value));
    setSearchParams(next, { replace: true });
  };

  const updateNumericSetting = (
    key: 'dailyNewWordLimit' | 'maxReviewCount',
    rawValue: string,
  ) => {
    const nextValue = rawValue.trim() === '' ? Number.NaN : Number(rawValue);
    setLocalSettings((current) => ({ ...current, [key]: nextValue }));
  };

  const clampNumericSetting = (
    key: 'dailyNewWordLimit' | 'maxReviewCount',
    min: number,
    max: number,
  ) => {
    setLocalSettings((current) => ({
      ...current,
      [key]: clampInteger(current[key], savedSettings[key], min, max),
    }));
  };

  const handleLogout = () => {
    logout();
    toast.success(copy.loggedOut);
  };

  const handleClearData = async () => {
    clearAllData();
    await clearLocalDbData();
    toast.success(copy.localDataCleared);
    window.location.reload();
  };

  return (
    <div className="settings-unframed-route max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isZh ? '设置' : 'Settings'}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="liquid-glass-control grid w-max min-w-full grid-cols-4 rounded-lg p-1">
            <TabsTrigger value="general">{copy.tabs.general}</TabsTrigger>
            <TabsTrigger value="notifications">{copy.tabs.notifications}</TabsTrigger>
            <TabsTrigger value="learning">{copy.tabs.learning}</TabsTrigger>
            <TabsTrigger value="account">{copy.tabs.account}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-8">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {isZh ? '外观' : 'Appearance'}
              </CardTitle>
              <CardDescription>{copy.appearanceDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label htmlFor="appearance-theme">{copy.theme}</Label>
                  <p className="text-sm text-muted-foreground">{isZh ? '选择界面明暗风格' : 'Choose the app appearance'}</p>
                </div>
                <Select
                  value={localSettings.theme}
                  onValueChange={(value) => updateDraftSettings({ theme: value as Theme })}
                >
                  <SelectTrigger id="appearance-theme" className="liquid-glass-control w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{copy.themeOptions.light}</SelectItem>
                    <SelectItem value="dark">{copy.themeOptions.dark}</SelectItem>
                    <SelectItem value="system">{copy.themeOptions.system}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label htmlFor="appearance-font-size">{copy.fontSize}</Label>
                  <p className="text-sm text-muted-foreground">{isZh ? '调整阅读和练习文本大小' : 'Adjust reading and practice text size'}</p>
                </div>
                <Select
                  value={localSettings.fontSize}
                  onValueChange={(v) => {
                    setLocalSettings((s) => ({ ...s, fontSize: v as FontSize }));
                  }}
                >
                  <SelectTrigger id="appearance-font-size" className="liquid-glass-control w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{copy.fontOptions.small}</SelectItem>
                    <SelectItem value="medium">{copy.fontOptions.medium}</SelectItem>
                    <SelectItem value="large">{copy.fontOptions.large}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label htmlFor="appearance-language">{copy.language}</Label>
                  <p className="text-sm text-muted-foreground">{isZh ? '切换应用显示语言' : 'Switch the app display language'}</p>
                </div>
                <Select
                  value={i18n.language?.startsWith('zh') ? 'zh' : 'en'}
                  onValueChange={(lang) => {
                    i18n.changeLanguage(lang);
                    localStorage.setItem('language', lang);
                    toast.success(lang === 'zh' ? '已切换为中文' : 'Switched to English');
                  }}
                >
                  <SelectTrigger id="appearance-language" className="liquid-glass-control w-full sm:w-[180px]">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full" disabled={saveDisabled} data-testid="settings-save-general">
                <Save className="h-4 w-4 mr-2" />
                {copy.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {copy.remindersTitle}
              </CardTitle>
              <CardDescription>
                {copy.remindersDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!notifSupported ? (
                <p className="text-sm text-muted-foreground">{copy.notificationsUnsupported}</p>
              ) : (
                <>
                  {/* Permission row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label>{copy.permissionLabel}</Label>
                      <p className="text-sm text-muted-foreground">
                        {notifPermission === 'granted'
                          ? copy.permissionGranted
                          : notifPermission === 'denied'
                            ? copy.permissionDenied
                            : copy.permissionPending}
                      </p>
                    </div>
                    {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={async () => {
                          const result = await requestPermission();
                          if (result === 'granted') {
                            toast.success(copy.permissionGrantedToast);
                          } else {
                            toast.error(copy.permissionDeniedToast);
                          }
                        }}
                      >
                        {copy.requestPermission}
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Reminder toggle + time */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label htmlFor="daily-reminder-switch">{copy.dailyReminder}</Label>
                      <p id="daily-reminder-description" className="text-sm text-muted-foreground">
                        {reminderHour !== null
                          ? copy.reminderEnabled(reminderHour)
                          : copy.reminderOff}
                      </p>
                    </div>
                    <Switch
                      id="daily-reminder-switch"
                      aria-describedby="daily-reminder-description"
                      disabled={notifPermission !== 'granted'}
                      checked={reminderHour !== null}
                      onCheckedChange={(v) => {
                        if (v) {
                          saveReminderHour(20); // default to 8 PM
                          toast.success(copy.reminderOnToast);
                        } else {
                          saveReminderHour(null);
                          toast.info(copy.reminderOffToast);
                        }
                      }}
                    />
                  </div>

                  {reminderHour !== null && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Label>{copy.reminderTime}</Label>
                        <p className="text-sm text-muted-foreground">{copy.reminderTimeDesc}</p>
                      </div>
                      <Select
                        value={String(reminderHour)}
                        onValueChange={(v) => {
                          saveReminderHour(Number(v));
                          toast.success(copy.reminderTimeUpdated(v));
                        }}
                      >
                        <SelectTrigger className="liquid-glass-control w-full sm:w-[150px]">
                          <Clock className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => (
                            <SelectItem key={h} value={String(h)}>
                              {h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4 rounded-xl bg-[hsl(var(--paper-muted)/0.20)] px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Label htmlFor="lifecycle-reminders-switch">{copy.lifecycleLabel}</Label>
                        <p id="lifecycle-reminders-description" className="text-sm text-muted-foreground">
                          {copy.lifecycleDesc}
                        </p>
                      </div>
                      <Switch
                        id="lifecycle-reminders-switch"
                        aria-describedby="lifecycle-reminders-description"
                        checked={localSettings.lifecycleReminders}
                        onCheckedChange={(checked) => {
                          updateDraftSettings({ lifecycleReminders: checked });
                        }}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="quiet-hours-start">{copy.quietStart}</Label>
                        <Input
                          id="quiet-hours-start"
                          type="time"
                          value={localSettings.quietHoursStart}
                          onChange={(event) => updateDraftSettings({ quietHoursStart: event.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quiet-hours-end">{copy.quietEnd}</Label>
                        <Input
                          id="quiet-hours-end"
                          type="time"
                          value={localSettings.quietHoursEnd}
                          onChange={(event) => updateDraftSettings({ quietHoursEnd: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-warning/10 px-3 py-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{lifecycleStatus}</p>
                          {actionableLifecyclePreview ? (
                            <>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {isZh
                                  ? `${actionableLifecyclePreview.titleZh}：${actionableLifecyclePreview.bodyZh}`
                                  : `${actionableLifecyclePreview.title}: ${actionableLifecyclePreview.body}`}
                              </p>
                              <Button asChild variant="glass" size="sm" className="mt-3 h-8 rounded-lg">
                                <Link to={actionableLifecyclePreview.href}>{copy.lifecycleOpen}</Link>
                              </Button>
                            </>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {copy.lifecycleFallback}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <Button onClick={handleSave} className="w-full" disabled={saveDisabled} data-testid="settings-save-notifications">
                <Save className="h-4 w-4 mr-2" />
                {copy.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                {copy.learningTitle}
              </CardTitle>
              <CardDescription>
                {copy.learningDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="daily-new-limit">{copy.dailyNewLimit}</Label>
                  <Input
                    id="daily-new-limit"
                    type="number"
                    min={1}
                    max={50}
                    step={1}
                    value={Number.isFinite(localSettings.dailyNewWordLimit) ? localSettings.dailyNewWordLimit : ''}
                    aria-invalid={!isDailyNewLimitValid}
                    aria-describedby={isDailyNewLimitValid
                      ? 'daily-new-limit-description'
                      : 'daily-new-limit-description daily-new-limit-error'}
                    onChange={(event) => updateNumericSetting('dailyNewWordLimit', event.target.value)}
                    onBlur={() => clampNumericSetting('dailyNewWordLimit', 1, 50)}
                  />
                  <p id="daily-new-limit-description" className="text-xs text-muted-foreground">{copy.dailyNewLimitDesc}</p>
                  {!isDailyNewLimitValid ? (
                    <p id="daily-new-limit-error" role="alert" className="text-xs text-destructive">
                      {copy.invalidDailyNewLimit}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max-review-count">{copy.maxReviewCount}</Label>
                  <Input
                    id="max-review-count"
                    type="number"
                    min={5}
                    max={100}
                    step={1}
                    value={Number.isFinite(localSettings.maxReviewCount) ? localSettings.maxReviewCount : ''}
                    aria-invalid={!isMaxReviewCountValid}
                    aria-describedby={isMaxReviewCountValid
                      ? 'max-review-count-description'
                      : 'max-review-count-description max-review-count-error'}
                    onChange={(event) => updateNumericSetting('maxReviewCount', event.target.value)}
                    onBlur={() => clampNumericSetting('maxReviewCount', 5, 100)}
                  />
                  <p id="max-review-count-description" className="text-xs text-muted-foreground">{copy.maxReviewCountDesc}</p>
                  {!isMaxReviewCountValid ? (
                    <p id="max-review-count-error" role="alert" className="text-xs text-destructive">
                      {copy.invalidMaxReviewCount}
                    </p>
                  ) : null}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="target-retention">{copy.targetRetention}</Label>
                  <Select
                    value={String(localSettings.targetRetention)}
                    onValueChange={(value) => {
                      setLocalSettings((s) => ({ ...s, targetRetention: Number(value) }));
                    }}
                  >
                    <SelectTrigger id="target-retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.85">{copy.retentionOptions.light}</SelectItem>
                      <SelectItem value="0.9">{copy.retentionOptions.standard}</SelectItem>
                      <SelectItem value="0.95">{copy.retentionOptions.strong}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{copy.targetRetentionDesc}</p>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--paper-muted)/0.18)] px-3 py-3">
                  <div>
                    <Label htmlFor="exam-week-boost-switch">{copy.examWeekBoost}</Label>
                    <p id="exam-week-boost-description" className="mt-1 text-sm text-muted-foreground">{copy.examWeekDesc}</p>
                  </div>
                  <Switch
                    id="exam-week-boost-switch"
                    aria-describedby="exam-week-boost-description"
                    checked={localSettings.examWeekBoost}
                    onCheckedChange={(v) => setLocalSettings((s) => ({ ...s, examWeekBoost: v }))}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full" disabled={saveDisabled} data-testid="settings-save-learning">
                <Save className="h-4 w-4 mr-2" />
                {copy.save}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                {copy.audioTitle}
              </CardTitle>
              <CardDescription>{copy.audioDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label htmlFor="tts-enabled-switch">{copy.ttsEnabled}</Label>
                  <p id="tts-enabled-description" className="text-sm text-muted-foreground">{copy.ttsEnabledDesc}</p>
                </div>
                <Switch
                  id="tts-enabled-switch"
                  aria-describedby="tts-enabled-description"
                  checked={localSettings.ttsEnabled}
                  onCheckedChange={(v) => setLocalSettings((s) => ({ ...s, ttsEnabled: v }))}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label htmlFor="auto-play-audio-switch">{copy.autoPlayAudio}</Label>
                  <p id="auto-play-audio-description" className="text-sm text-muted-foreground">{copy.autoPlayAudioDesc}</p>
                </div>
                <Switch
                  id="auto-play-audio-switch"
                  aria-describedby="auto-play-audio-description"
                  checked={localSettings.autoPlayAudio}
                  onCheckedChange={(v) => setLocalSettings((s) => ({ ...s, autoPlayAudio: v }))}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label htmlFor="tts-voice">{copy.ttsVoice}</Label>
                  <p className="text-sm text-muted-foreground">{isZh ? '选择朗读口音' : 'Choose pronunciation accent'}</p>
                </div>
                <Select
                  value={localSettings.ttsVoice}
                  onValueChange={(v) => setLocalSettings((s) => ({ ...s, ttsVoice: v }))}
                >
                  <SelectTrigger id="tts-voice" className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">{isZh ? '美式英语' : 'US English'}</SelectItem>
                    <SelectItem value="en-GB">{isZh ? '英式英语' : 'British English'}</SelectItem>
                    <SelectItem value="en-AU">{isZh ? '澳洲英语' : 'Australian English'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full" disabled={saveDisabled} data-testid="settings-save-audio">
                <Save className="h-4 w-4 mr-2" />
                {copy.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-8">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {copy.accountInfo}
              </CardTitle>
              <CardDescription>{copy.accountDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>{isZh ? '邮箱' : 'Email'}</Label>
                <Input value={user?.email || ''} disabled />
              </div>

              <div className="grid gap-2">
                <Label>{copy.displayName}</Label>
                <Input value={user?.displayName || ''} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  {copy.profileHint}{' '}
                  <Link to="/dashboard/profile" className="underline underline-offset-2 hover:text-foreground">
                    {copy.profileLink}
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {copy.dangerTitle}
              </CardTitle>
              <CardDescription>{copy.dangerDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label className="text-destructive">{copy.clearData}</Label>
                  <p className="text-sm text-muted-foreground">{copy.clearDataDesc}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">{copy.clearDataButton}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{copy.clearConfirmTitle}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {copy.clearConfirmBody}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          void handleClearData();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {copy.confirmDelete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label className="text-destructive">{copy.signOutLabel}</Label>
                  <p className="text-sm text-muted-foreground">{copy.signOutHint}</p>
                </div>
                <Button variant="glass" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {copy.signOut}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    permissionGranted: isZh ? '已授权' : 'Permission granted',
    permissionDenied: isZh ? '已拒绝，请在浏览器设置中重新允许' : 'Denied. Re-enable it in browser settings.',
    permissionPending: isZh ? '尚未授权，点击右侧按钮申请' : 'Not granted yet. Request permission to enable reminders.',
    audioDesc: isZh ? '配置单词发音与播放偏好。' : 'Configure pronunciation and playback preferences.',
    ttsVoice: isZh ? 'TTS 语音' : 'TTS voice',
    accountDesc: isZh ? '管理登录信息和个人资料入口。' : 'Manage sign-in details and profile entry.',
    displayName: isZh ? '显示名称' : 'Display name',
    profileHint: isZh ? '如需修改名称，请前往' : 'To change your name, visit',
    profileLink: isZh ? '个人资料设置' : 'Profile settings',
    dangerDesc: isZh ? '这些操作会影响账号或本地学习数据。' : 'These actions affect your account or local learning data.',
    clearConfirmTitle: isZh ? '清除所有学习数据？' : 'Clear all learning data?',
    clearConfirmBody: isZh
      ? '这会永久删除词汇进度、复习记录和本地设置。此操作无法撤销。'
      : 'This will permanently delete all word progress, review history, and settings. This action cannot be undone.',
    cancel: isZh ? '取消' : 'Cancel',
    confirmDelete: isZh ? '确认删除' : 'Yes, delete everything',
    signOutHint: isZh ? '退出当前账号' : 'Sign out of your account',
    signOut: isZh ? '退出登录' : 'Log out',
  };
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get('tab') || 'general';
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

  const updateLifecycleSettings = (patch: Partial<UserSettings>) => {
    setLocalSettings((current) => ({ ...current, ...patch }));
    updateSettings(patch);
  };
  const lifecycleQuietNow = isInQuietHours(now, localSettings.quietHoursStart, localSettings.quietHoursEnd);
  const lifecycleStatus = !localSettings.notifications || !localSettings.lifecycleReminders
    ? '学习提醒已关闭'
    : todayCompleted
      ? '今日内容已完成，不会继续提醒'
      : lifecycleQuietNow
        ? '现在处于安静时间，不会推送'
        : lifecyclePreview
          ? '当前会发送这条提醒'
          : '暂时没有需要打扰你的学习信号';

  // Apply font size to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    if (localSettings.fontSize === 'small') root.classList.add('text-sm');
    else if (localSettings.fontSize === 'large') root.classList.add('text-lg');
    else root.classList.add('text-base');
  }, [localSettings.fontSize]);

  // Load settings from context
  useEffect(() => {
    if (settings) {
      const sync = window.setTimeout(() => {
        setLocalSettings((prev) => ({
          ...prev,
          ...settings,
        }));
      }, 0);

      return () => window.clearTimeout(sync);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success(copy.saved);
  };

  const handleLogout = () => {
    logout();
    toast.success(copy.loggedOut);
  };

  const handleClearData = () => {
    clearAllData();
    toast.success(copy.cleared);
    window.location.reload();
  };

  return (
    <div className="settings-unframed-route max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isZh ? '设置' : 'Settings'}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="liquid-glass-control grid w-full grid-cols-4 rounded-lg p-1">
          <TabsTrigger value="general">通用</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="learning">学习</TabsTrigger>
          <TabsTrigger value="account">账号</TabsTrigger>
        </TabsList>

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
              <div className="flex items-center justify-between">
                <div>
                  <Label>{copy.theme}</Label>
                  <p className="text-sm text-muted-foreground">{isZh ? '选择界面明暗风格' : 'Choose the app appearance'}</p>
                </div>
                <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                  <SelectTrigger className="liquid-glass-control w-[180px]">
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

              <div className="flex items-center justify-between">
                <div>
                  <Label>{copy.fontSize}</Label>
                  <p className="text-sm text-muted-foreground">{isZh ? '调整阅读和练习文本大小' : 'Adjust reading and practice text size'}</p>
                </div>
                <Select
                  value={localSettings.fontSize}
                  onValueChange={(v) => {
                    setLocalSettings((s) => ({ ...s, fontSize: v as FontSize }));
                  }}
                >
                  <SelectTrigger className="liquid-glass-control w-[180px]">
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

              <div className="flex items-center justify-between">
                <div>
                  <Label>{copy.language}</Label>
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
                  <SelectTrigger className="liquid-glass-control w-[180px]">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">
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
                每天在固定时间收到浏览器推送提醒，保持学习连续性
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!notifSupported ? (
                <p className="text-sm text-muted-foreground">当前浏览器不支持桌面通知</p>
              ) : (
                <>
                  {/* Permission row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>浏览器通知权限</Label>
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
                            toast.success('通知权限已授权！');
                          } else {
                            toast.error('通知权限被拒绝');
                          }
                        }}
                      >
                        申请权限
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Reminder toggle + time */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>每日学习提醒</Label>
                      <p className="text-sm text-muted-foreground">
                        {reminderHour !== null
                          ? `已开启 · 每天 ${reminderHour}:00`
                          : '未开启'}
                      </p>
                    </div>
                    <Switch
                      disabled={notifPermission !== 'granted'}
                      checked={reminderHour !== null}
                      onCheckedChange={(v) => {
                        if (v) {
                          saveReminderHour(20); // default to 8 PM
                          toast.success('提醒已开启，每天 20:00 提醒');
                        } else {
                          saveReminderHour(null);
                          toast.info('已关闭每日提醒');
                        }
                      }}
                    />
                  </div>

                  {reminderHour !== null && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>提醒时间</Label>
                        <p className="text-sm text-muted-foreground">每天在此时间推送一条提醒</p>
                      </div>
                      <Select
                        value={String(reminderHour)}
                        onValueChange={(v) => {
                          saveReminderHour(Number(v));
                          toast.success(`提醒时间已更新为 ${v}:00`);
                        }}
                      >
                        <SelectTrigger className="liquid-glass-control w-[150px]">
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
                        <Label>学习提醒</Label>
                        <p className="text-sm text-muted-foreground">
                          根据待复习、连续学习风险、考试周和周报整理提醒内容。
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.lifecycleReminders}
                        onCheckedChange={(checked) => {
                          updateLifecycleSettings({ lifecycleReminders: checked });
                          toast.success(checked ? '学习提醒已开启' : '学习提醒已关闭');
                        }}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="quiet-hours-start">安静时间开始</Label>
                        <Input
                          id="quiet-hours-start"
                          type="time"
                          value={localSettings.quietHoursStart}
                          onChange={(event) => updateLifecycleSettings({ quietHoursStart: event.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quiet-hours-end">安静时间结束</Label>
                        <Input
                          id="quiet-hours-end"
                          type="time"
                          value={localSettings.quietHoursEnd}
                          onChange={(event) => updateLifecycleSettings({ quietHoursEnd: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-warning/10 px-3 py-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{lifecycleStatus}</p>
                          {lifecyclePreview ? (
                            <>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {lifecyclePreview.titleZh}：{lifecyclePreview.bodyZh}
                              </p>
                              <Button asChild variant="glass" size="sm" className="mt-3 h-8 rounded-lg">
                                <Link to={lifecyclePreview.href}>打开对应练习</Link>
                              </Button>
                            </>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground">
                              提醒只会在开启通知、避开安静时间、且今日内容未完成时出现。
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                FSRS 学习强度
              </CardTitle>
              <CardDescription>
                控制每天新词、复习上限和考前强度，Today 与 Review 会按这里的设置调整。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="daily-new-limit">每日新词上限</Label>
                  <Input
                    id="daily-new-limit"
                    type="number"
                    min={1}
                    max={50}
                    value={localSettings.dailyNewWordLimit}
                    onChange={(event) => {
                      setLocalSettings((s) => ({ ...s, dailyNewWordLimit: Number(event.target.value) }));
                    }}
                  />
                  <p className="text-xs text-muted-foreground">影响 Today 的新词目标和每日词包大小。</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max-review-count">每日复习上限</Label>
                  <Input
                    id="max-review-count"
                    type="number"
                    min={5}
                    max={100}
                    value={localSettings.maxReviewCount}
                    onChange={(event) => {
                      setLocalSettings((s) => ({ ...s, maxReviewCount: Number(event.target.value) }));
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Review 页面和 Today 复习不会超过这个上限。</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>目标记忆保持率</Label>
                  <Select
                    value={String(localSettings.targetRetention)}
                    onValueChange={(value) => {
                      setLocalSettings((s) => ({ ...s, targetRetention: Number(value) }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.85">85% · 轻量</SelectItem>
                      <SelectItem value="0.9">90% · 标准</SelectItem>
                      <SelectItem value="0.95">95% · 稳记</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">更高保持率会减少新词、增加复习权重。</p>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--paper-muted)/0.18)] px-3 py-3">
                  <div>
                    <Label>考前强化周</Label>
                    <p className="mt-1 text-sm text-muted-foreground">优先安排考试输出和更多复习。</p>
                  </div>
                  <Switch
                    checked={localSettings.examWeekBoost}
                    onCheckedChange={(v) => setLocalSettings((s) => ({ ...s, examWeekBoost: v }))}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {copy.save}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                音频与发音
              </CardTitle>
              <CardDescription>{copy.audioDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>文字转语音</Label>
                  <p className="text-sm text-muted-foreground">文字转语音</p>
                </div>
                <Switch
                  checked={localSettings.ttsEnabled}
                  onCheckedChange={(v) => setLocalSettings((s) => ({ ...s, ttsEnabled: v }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动播放音频</Label>
                  <p className="text-sm text-muted-foreground">自动播放音档</p>
                </div>
                <Switch
                  checked={localSettings.autoPlayAudio}
                  onCheckedChange={(v) => setLocalSettings((s) => ({ ...s, autoPlayAudio: v }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>{copy.ttsVoice}</Label>
                  <p className="text-sm text-muted-foreground">{isZh ? '选择朗读口音' : 'Choose pronunciation accent'}</p>
                </div>
                <Select
                  value={localSettings.ttsVoice}
                  onValueChange={(v) => setLocalSettings((s) => ({ ...s, ttsVoice: v }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">{isZh ? '美式英语' : 'US English'}</SelectItem>
                    <SelectItem value="en-GB">{isZh ? '英式英语' : 'British English'}</SelectItem>
                    <SelectItem value="en-AU">{isZh ? '澳洲英语' : 'Australian English'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">
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
                账号信息
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
                危险操作
              </CardTitle>
              <CardDescription>{copy.dangerDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-destructive">清除所有数据</Label>
                  <p className="text-sm text-muted-foreground">{isZh ? '删除所有学习进度和本地设置' : 'Delete all learning progress and settings'}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Clear All Data</Button>
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
                      <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {copy.confirmDelete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-destructive">退出登录</Label>
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

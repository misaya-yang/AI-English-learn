import { useState, useEffect } from 'react';
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
  User,
  Bell,
  Palette,
  Volume2,
  Globe,
  Clock,
  Save,
  AlertTriangle,
  Trash2,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { clearAllData } from '@/data/localStorage';
import type { FontSize, UserSettings } from '@/types/core';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useUserData();
  const {
    isSupported: notifSupported,
    permission: notifPermission,
    reminderHour,
    requestPermission,
    saveReminderHour,
  } = useStudyReminder();
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

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
    toast.success('Settings saved successfully!');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      clearAllData();
      toast.success('All data cleared');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">设定 • Customize your learning experience</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">主题</p>
                </div>
                <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Font Size</Label>
                  <p className="text-sm text-muted-foreground">字体大小</p>
                </div>
                <Select
                  value={localSettings.fontSize}
                  onValueChange={(v) => {
                    setLocalSettings((s) => ({ ...s, fontSize: v as FontSize }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Language</Label>
                  <p className="text-sm text-muted-foreground">介面语言</p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-[180px]">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh-TW">繁体中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                学习提醒 · Study Reminders
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
                          ? '✅ 已授权'
                          : notifPermission === 'denied'
                            ? '❌ 已拒绝（请在浏览器设置中重新允许）'
                            : '尚未授权，点击右侧按钮申请'}
                      </p>
                    </div>
                    {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                      <Button
                        variant="outline"
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
                        <SelectTrigger className="w-[150px]">
                          <Clock className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7:00 AM</SelectItem>
                          <SelectItem value="8">8:00 AM</SelectItem>
                          <SelectItem value="12">12:00 PM</SelectItem>
                          <SelectItem value="18">6:00 PM</SelectItem>
                          <SelectItem value="20">8:00 PM</SelectItem>
                          <SelectItem value="21">9:00 PM</SelectItem>
                          <SelectItem value="22">10:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Audio & Pronunciation
              </CardTitle>
              <CardDescription>Configure audio playback settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Text-to-Speech</Label>
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
                  <Label>Auto-play Audio</Label>
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
                  <Label>TTS Voice</Label>
                  <p className="text-sm text-muted-foreground">语音选择</p>
                </div>
                <Select
                  value={localSettings.ttsVoice}
                  onValueChange={(v) => setLocalSettings((s) => ({ ...s, ttsVoice: v }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">US English</SelectItem>
                    <SelectItem value="en-GB">British English</SelectItem>
                    <SelectItem value="en-AU">Australian English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>

              <div className="grid gap-2">
                <Label>Display Name</Label>
                <Input value={user?.displayName || ''} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Be careful with these actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-600">Clear All Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Delete all your learning progress and settings
                  </p>
                </div>
                <Button variant="destructive" onClick={handleClearData}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-600">Log Out</Label>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account
                  </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

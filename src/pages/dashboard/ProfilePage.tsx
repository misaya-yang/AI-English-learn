import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useQuota } from '@/hooks/useQuota';
import type { QuotaFeature } from '@/hooks/useQuota';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  GraduationCap,
  Target,
  BookOpen,
  Zap,
  Edit2,
  Save,
  Camera,
  Flame,
  Star,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const AVATAR_STORAGE_KEY = 'vocabdaily-avatar-url-';

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';

const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const topics = ['daily', 'business', 'technology', 'travel', 'academic', 'science', 'health', 'arts'];

const learningStyles: { id: LearningStyle; label: string; labelZh: string }[] = [
  { id: 'visual', label: 'Visual', labelZh: '视觉型' },
  { id: 'auditory', label: 'Auditory', labelZh: '听觉型' },
  { id: 'kinesthetic', label: 'Kinesthetic', labelZh: '动觉型' },
  { id: 'reading', label: 'Reading/Writing', labelZh: '读写型' },
];

/** XP thresholds for each rank title — used to derive the displayed level name */
const LEVEL_THRESHOLDS: [string, number][] = [
  ['Language Master', 15000],
  ['Word Wizard',      7000],
  ['Expert',           3500],
  ['Journeyman',       1500],
  ['Apprentice',        500],
  ['Novice',              0],
];

export default function ProfilePage() {
  const { user, profile, updateUserProfile, updateDisplayName } = useAuth();
  const { xp, streak, stats, streakFreezes, achievements, allAchievementDefs, dailyMultiplier, purchaseStreakFreeze } = useUserData();
  const { plan, allStatuses } = useQuota();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    () => localStorage.getItem(`${AVATAR_STORAGE_KEY}${user?.id}`) || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    cefrLevel: (profile?.cefrLevel as CEFRLevel) || 'B1',
    dailyGoal: profile?.dailyGoal || 10,
    preferredTopics: profile?.preferredTopics || ['daily'],
    learningStyle: (profile?.learningStyle as LearningStyle) || 'visual',
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `avatars/${user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      // Cache locally so it persists across refreshes
      localStorage.setItem(`${AVATAR_STORAGE_KEY}${user.id}`, publicUrl);
      setAvatarUrl(publicUrl);
      toast.success('头像已更新！');
    } catch {
      toast.error('头像上传失败，请重试');
    } finally {
      setIsUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profilePromise = updateUserProfile({
        cefrLevel: formData.cefrLevel,
        dailyGoal: formData.dailyGoal,
        preferredTopics: formData.preferredTopics,
        learningStyle: formData.learningStyle,
      });
      const namePromise =
        formData.displayName !== user?.displayName
          ? updateDisplayName(formData.displayName)
          : Promise.resolve(true);

      const [profileOk, nameOk] = await Promise.all([profilePromise, namePromise]);
      if (profileOk && nameOk) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter((t) => t !== topic)
        : [...prev.preferredTopics, topic],
    }));
  };

  // Calculate level progress
  const currentLevel = Math.floor(xp.total / 100) + 1;
  const currentThreshold = (currentLevel - 1) * 100;
  const nextThreshold = currentLevel * 100;
  const xpInCurrentLevel = xp.total - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  const levelName = (LEVEL_THRESHOLDS.find(([, threshold]) => xp.total >= threshold) ?? ['Novice'])[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">个人资料</h1>
          <p className="text-muted-foreground">个人资料 • Manage your account</p>
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isSaving}
          className={isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />}
                <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-600">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="grid gap-2 max-w-sm">
                  <Label>Display Name</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Your display name"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{user?.displayName || 'Learner'}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    <Badge variant="secondary">{profile?.cefrLevel || 'B1'}</Badge>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      Level {currentLevel}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{xp.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">XP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{streak.current}</p>
                <p className="text-sm text-muted-foreground">Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.masteredWords}</p>
                <p className="text-sm text-muted-foreground">Mastered</p>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {levelName} → Level {currentLevel + 1}
              </span>
              <span className="text-sm text-muted-foreground">
                {xpInCurrentLevel} / {xpNeededForNext} XP
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              学习等级
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Select
                value={formData.cefrLevel}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, cefrLevel: v as CEFRLevel }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cefrLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-emerald-600">{profile?.cefrLevel || 'B1'}</span>
                </div>
                <div>
                  <p className="font-medium">CEFR Level</p>
                  <p className="text-sm text-muted-foreground">
                    {(profile?.cefrLevel || 'B1') === 'A1' && 'Beginner'}
                    {(profile?.cefrLevel || 'B1') === 'A2' && 'Elementary'}
                    {(profile?.cefrLevel || 'B1') === 'B1' && 'Intermediate'}
                    {(profile?.cefrLevel || 'B1') === 'B2' && 'Upper Intermediate'}
                    {(profile?.cefrLevel || 'B1') === 'C1' && 'Advanced'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              每日目标
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <Slider
                  value={[formData.dailyGoal]}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, dailyGoal: v[0] }))
                  }
                  min={5}
                  max={50}
                  step={5}
                />
                <p className="text-center font-medium">{formData.dailyGoal} words/day</p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-600">{profile?.dailyGoal || 10}</span>
                </div>
                <div>
                  <p className="font-medium">每日词量</p>
                  <p className="text-sm text-muted-foreground">每日学习目标</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              感兴趣的话题
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-colors capitalize',
                      formData.preferredTopics.includes(topic)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile?.preferredTopics || ['daily']).map((topic) => (
                  <Badge key={topic} variant="secondary" className="capitalize">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              学习风格
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Select
                value={formData.learningStyle}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, learningStyle: v as LearningStyle }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {learningStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.label} ({style.labelZh})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium capitalize">{profile?.learningStyle || 'visual'}</p>
                  <p className="text-sm text-muted-foreground">
                    {learningStyles.find((s) => s.id === (profile?.learningStyle || 'visual'))?.labelZh}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            学习统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{streak.current}</p>
              <p className="text-sm text-muted-foreground">当前连续</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{streak.longest}</p>
              <p className="text-sm text-muted-foreground">最长连续</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <BookOpen className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalWords}</p>
              <p className="text-sm text-muted-foreground">累计词汇</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.masteredWords}</p>
              <p className="text-sm text-muted-foreground">已掌握</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Protection & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              打卡保护
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">可用冻结次数</p>
                <p className="text-3xl font-bold">{streakFreezes}</p>
              </div>
              {dailyMultiplier > 1 && (
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-500/10">
                  {dailyMultiplier}x XP
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              打卡冻结可在你忘记学习的一天自动保护连续天数。
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const result = purchaseStreakFreeze();
                if (result.success) {
                  toast.success(`已购买打卡冻结（消耗 ${result.cost} XP）`);
                } else {
                  toast.error(`XP 不足（需要 ${result.cost} XP）`);
                }
              }}
            >
              <Zap className="h-4 w-4 mr-1" />
              购买冻结（50 XP）
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              成就徽章（{achievements.length}/{allAchievementDefs.length}）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {allAchievementDefs.map((def) => {
                const unlocked = achievements.find((a) => a.id === def.id);
                return (
                  <div
                    key={def.id}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-opacity',
                      unlocked ? 'opacity-100' : 'opacity-30 grayscale',
                    )}
                    title={unlocked ? `${def.nameZh} - ${def.descriptionZh}` : def.descriptionZh}
                  >
                    <span className="text-2xl">{def.icon}</span>
                    <span className="text-[10px] leading-tight text-muted-foreground">{def.nameZh}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily AI Quota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              今日 AI 额度
            </div>
            <span className={cn(
              'text-sm rounded-full px-3 py-1 font-semibold',
              plan === 'pro'
                ? 'bg-amber-500/15 text-amber-500'
                : 'bg-muted text-muted-foreground',
            )}>
              {plan === 'pro' ? 'Pro' : 'Free'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allStatuses.map((status) => {
              const featureLabels: Record<QuotaFeature, string> = {
                aiWritingGrade:   'AI 写作批改',
                aiReadingGen:     'AI 阅读生成',
                aiChat:           'AI 教练对话',
                aiExamFeedback:   '考试反馈',
                aiListeningGen:   'AI 听力生成',
              };
              const pct = status.limit > 0 ? Math.min(100, Math.round((status.used / status.limit) * 100)) : 0;
              return (
                <div key={status.feature}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-foreground">{featureLabels[status.feature]}</p>
                    <p className={cn(
                      'text-xs font-semibold',
                      status.isExhausted ? 'text-red-500' : 'text-muted-foreground',
                    )}>
                      {status.used}/{status.limit}
                    </p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        status.isExhausted ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {plan === 'free' && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
              <p className="text-sm text-amber-600 dark:text-amber-400">升级 Pro 解锁无限 AI 功能</p>
              <Link to="/pricing">
                <Button size="sm" className="rounded-full bg-amber-500 text-black hover:bg-amber-400 h-7 text-xs px-3 font-semibold">
                  查看方案
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel button when editing */}
      {isEditing && (
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

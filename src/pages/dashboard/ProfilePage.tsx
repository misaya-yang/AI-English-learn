import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useQuota } from '@/hooks/useQuota';
import type { QuotaFeature } from '@/hooks/useQuota';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { computeLevel, getLevelName } from '@/services/gamification';
import { PRO_JOB, pickLocalized } from '@/features/marketing/proPackaging';

const AVATAR_STORAGE_KEY = 'vocabdaily-avatar-url-';

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';

const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const topics = ['daily', 'business', 'technology', 'travel', 'academic', 'science', 'health', 'arts'];

const CEFR_LEVEL_LABELS: Record<CEFRLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Proficiency',
};

const CEFR_LEVEL_LABELS_ZH: Record<CEFRLevel, string> = {
  A1: '入门',
  A2: '基础',
  B1: '中级',
  B2: '中高级',
  C1: '高级',
  C2: '精通',
};

const learningStyles: { id: LearningStyle; label: string; labelZh: string }[] = [
  { id: 'visual', label: 'Visual', labelZh: '视觉型' },
  { id: 'auditory', label: 'Auditory', labelZh: '听觉型' },
  { id: 'kinesthetic', label: 'Kinesthetic', labelZh: '动觉型' },
  { id: 'reading', label: 'Reading/Writing', labelZh: '读写型' },
];

const TOPIC_LABELS: Record<string, { en: string; zh: string }> = {
  daily: { en: 'Daily', zh: '日常' },
  daily_life: { en: 'Daily Life', zh: '日常生活' },
  business: { en: 'Business', zh: '商务' },
  work: { en: 'Work', zh: '工作' },
  technology: { en: 'Technology', zh: '科技' },
  travel: { en: 'Travel', zh: '旅行' },
  academic: { en: 'Academic', zh: '学术' },
  science: { en: 'Science', zh: '科学' },
  health: { en: 'Health', zh: '健康' },
  arts: { en: 'Arts', zh: '艺术' },
};

export default function ProfilePage() {
  const { user, profile, updateUserProfile, updateDisplayName } = useAuth();
  const { xp, streak, stats, streakFreezes, achievements, allAchievementDefs, dailyMultiplier, purchaseStreakFreeze } = useUserData();
  const { plan, allStatuses } = useQuota();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh') ?? false;
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
      toast.success(isZh ? '头像已更新' : 'Avatar updated');
    } catch {
      toast.error(isZh ? '头像上传失败，请重试' : 'Avatar upload failed. Please try again.');
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
        toast.success(isZh ? '个人资料已更新' : 'Profile updated successfully');
      } else {
        toast.error(isZh ? '个人资料更新失败' : 'Failed to update profile');
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

  // Calculate level progress with the canonical gamification helpers.
  const currentLevel = computeLevel(xp.total);
  const currentThreshold = (currentLevel - 1) * 100;
  const nextThreshold = currentLevel * 100;
  const xpInCurrentLevel = xp.total - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));
  const levelName = getLevelName(xp.total);
  const cefrLevel = (profile?.cefrLevel as CEFRLevel | undefined) || 'B1';
  const cefrLevelLabel = isZh
    ? (CEFR_LEVEL_LABELS_ZH[cefrLevel] ?? CEFR_LEVEL_LABELS_ZH.B1)
    : (CEFR_LEVEL_LABELS[cefrLevel] ?? CEFR_LEVEL_LABELS.B1);
  const currentLearningStyle = learningStyles.find((s) => s.id === (profile?.learningStyle || 'visual')) || learningStyles[0];
  const topicLabel = (topic: string) => {
    const normalized = topic.toLowerCase().replace(/\s+/g, '_');
    const labels = TOPIC_LABELS[topic] || TOPIC_LABELS[normalized] || { en: topic, zh: topic };
    return isZh ? labels.zh : labels.en;
  };
  const displayName =
    isZh && user?.email === 'demo@example.com' && user?.displayName === 'Demo Learner'
      ? '演示学习者'
      : (user?.displayName || (isZh ? '学习者' : 'Learner'));
  const avatarInitial = displayName[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const levelProgressLabel = isZh ? '等级进度' : levelName;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isZh ? '个人资料' : 'Profile'}</h1>
          <p className="text-muted-foreground">
            {isZh ? '管理学习画像、目标和账号身份。' : 'Manage your learner identity, goals, and account profile.'}
          </p>
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isSaving}
          className={isEditing ? 'bg-primary hover:bg-primary/90' : ''}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isZh ? '保存中...' : 'Saving...'}
            </>
          ) : isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isZh ? '保存更改' : 'Save changes'}
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              {isZh ? '编辑资料' : 'Edit profile'}
            </>
          )}
        </Button>
      </div>

      <Card className="mb-6 rounded-md border-border">
        <CardContent className="p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="relative">
              <Avatar className="h-20 w-20 rounded-md border border-border">
	                {avatarUrl && <AvatarImage src={avatarUrl} alt={isZh ? '头像' : 'Avatar'} className="rounded-md object-cover" />}
                <AvatarFallback className="rounded-md bg-muted text-xl text-foreground">
                  {avatarInitial}
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
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-md border border-border"
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
	                  <Label>{isZh ? '显示名称' : 'Display name'}</Label>
	                  <Input
	                    value={formData.displayName}
	                    onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
	                    placeholder={isZh ? '输入你的显示名称' : 'Your display name'}
	                  />
	                </div>
	              ) : (
	                <>
	                  <h2 className="text-2xl font-bold">{displayName}</h2>
	                  <p className="text-muted-foreground">{user?.email}</p>
	                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
	                    <Badge variant="secondary">{cefrLevel}</Badge>
	                    <Badge variant="secondary" className="bg-primary/10 text-primary">
	                      {isZh ? `等级 ${currentLevel}` : `Level ${currentLevel}`}
	                    </Badge>
	                  </div>
	                  <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
	                    {isZh
                        ? `学习画像：${cefrLevel} ${cefrLevelLabel} · 每日 ${profile?.dailyGoal || 10} 个词 · ${currentLearningStyle.labelZh}`
                        : `Learner profile: ${cefrLevel} ${cefrLevelLabel} · ${profile?.dailyGoal || 10} words/day · ${currentLearningStyle.label}`}
	                  </p>
	                </>
	              )}
            </div>

            <div className="grid w-full grid-cols-3 gap-2 md:w-auto md:min-w-[280px]">
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-lg font-semibold tabular-nums">{xp.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
	              <div className="rounded-md border border-border bg-background px-3 py-2">
	                <p className="text-lg font-semibold tabular-nums">{streak.current}</p>
	                <p className="text-xs text-muted-foreground">{isZh ? '连续' : 'Streak'}</p>
	              </div>
	              <div className="rounded-md border border-border bg-background px-3 py-2">
	                <p className="text-lg font-semibold tabular-nums">{stats.masteredWords}</p>
	                <p className="text-xs text-muted-foreground">{isZh ? '已掌握' : 'Mastered'}</p>
	              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
	              <span className="text-sm font-medium">
	                {levelProgressLabel} → {isZh ? `等级 ${currentLevel + 1}` : `Level ${currentLevel + 1}`}
	              </span>
              <span className="text-sm text-muted-foreground">
                {xpInCurrentLevel} / {xpNeededForNext} XP
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
	              {isZh ? '学习等级' : 'Learning level'}
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
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <span className="font-bold text-primary">{cefrLevel}</span>
                </div>
                <div>
	                  <p className="font-medium">{isZh ? '当前 CEFR 等级' : 'CEFR level'}</p>
                  <p className="text-sm text-muted-foreground">{cefrLevelLabel}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
	              {isZh ? '每日目标' : 'Daily goal'}
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
	                <p className="text-center font-medium">
                    {formData.dailyGoal} {isZh ? '词 / 天' : 'words/day'}
                  </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
                  <span className="font-semibold text-foreground">{profile?.dailyGoal || 10}</span>
                </div>
                <div>
                  <p className="font-medium">{isZh ? '每日词量' : 'Daily words'}</p>
                  <p className="text-sm text-muted-foreground">{isZh ? '当前设置' : 'Current setting'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
	              {isZh ? '感兴趣的话题' : 'Preferred topics'}
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
	                      'rounded-md px-3 py-1 text-sm transition-colors',
                      formData.preferredTopics.includes(topic)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
	                    {topicLabel(topic)}
	                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile?.preferredTopics || ['daily']).map((topic) => (
	                  <Badge key={topic} variant="secondary">
	                    {topicLabel(topic)}
	                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
	              {isZh ? '学习风格' : 'Learning style'}
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
	                      {isZh ? style.labelZh : style.label}
	                    </SelectItem>
	                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
                  <Zap className="h-5 w-5 text-foreground" />
                </div>
                <div>
	                  <p className="font-medium">{isZh ? currentLearningStyle.labelZh : currentLearningStyle.label}</p>
	                  <p className="text-sm text-muted-foreground">
	                    {isZh ? '用于调整练习材料和呈现方式' : 'Used to tune practice materials and presentation'}
	                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-md border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
	            {isZh ? '学习统计' : 'Learning stats'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-md border border-border bg-background p-3">
              <Flame className="mb-3 h-5 w-5 text-muted-foreground" />
              <p className="text-xl font-semibold tabular-nums">{streak.current}</p>
	              <p className="text-sm text-muted-foreground">{isZh ? '当前连续' : 'Current streak'}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <Star className="mb-3 h-5 w-5 text-muted-foreground" />
              <p className="text-xl font-semibold tabular-nums">{streak.longest}</p>
	              <p className="text-sm text-muted-foreground">{isZh ? '最长连续' : 'Longest streak'}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <BookOpen className="mb-3 h-5 w-5 text-muted-foreground" />
              <p className="text-xl font-semibold tabular-nums">{stats.totalWords}</p>
	              <p className="text-sm text-muted-foreground">{isZh ? '累计词汇' : 'Total words'}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <Target className="mb-3 h-5 w-5 text-muted-foreground" />
              <p className="text-xl font-semibold tabular-nums">{stats.masteredWords}</p>
	              <p className="text-sm text-muted-foreground">{isZh ? '已掌握' : 'Mastered'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="rounded-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
	              {isZh ? '打卡保护' : 'Streak protection'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
	                <p className="text-sm text-muted-foreground">{isZh ? '可用冻结次数' : 'Available freezes'}</p>
                <p className="text-3xl font-bold">{streakFreezes}</p>
              </div>
              {dailyMultiplier > 1 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {dailyMultiplier}x XP
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
	              {isZh
                  ? '打卡冻结可在你忘记学习的一天自动保护连续天数。'
                  : 'A streak freeze can protect your streak for one missed study day.'}
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
	              {isZh ? '购买冻结（50 XP）' : 'Buy freeze (50 XP)'}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
	              {isZh ? '成就徽章' : 'Achievement badges'}（{achievements.length}/{allAchievementDefs.length}）
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
                      'flex flex-col items-center gap-1 rounded-md border border-transparent p-2 text-center transition-opacity',
                      unlocked ? 'opacity-100' : 'opacity-30 grayscale',
                    )}
                    title={unlocked ? `${def.nameZh} - ${def.descriptionZh}` : def.descriptionZh}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-md border border-border bg-muted text-base">{def.icon}</span>
                    <span className="text-[10px] leading-tight text-muted-foreground">{def.nameZh}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-md border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
	              {isZh ? '今日服务额度' : 'Today service quota'}
            </div>
            <span className={cn(
              'rounded-md px-3 py-1 text-sm font-semibold',
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
                aiWritingGrade:   '写作反馈',
                aiReadingGen:     '阅读材料',
                aiChat:           '答疑对话',
                aiExamFeedback:   '考试反馈',
                aiListeningGen:   '听力材料',
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
                        status.isExhausted ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-primary',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {plan === 'free' && (
	            <div className="mt-4 flex flex-col gap-3 rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
	              <p className="text-sm leading-relaxed text-amber-600 dark:text-amber-400">{pickLocalized(PRO_JOB, isZh ? 'zh' : 'en')}</p>
	              <Button asChild size="sm" className="h-8 flex-shrink-0 rounded-md bg-amber-500 px-3 text-xs font-semibold text-black hover:bg-amber-400">
	                <Link to="/pricing">
	                  {isZh ? '查看 Pro 入口' : 'View Pro access'}
	                </Link>
	              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            {isZh ? '取消' : 'Cancel'}
          </Button>
        </div>
      )}
    </div>
  );
}

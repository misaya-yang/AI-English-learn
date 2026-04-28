import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Target,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildAuthRedirect, resolveAuthRedirect } from '@/lib/authRedirect';
import { PlacementTest } from '@/components/PlacementTest';
import { AuthShell } from '@/features/marketing/AuthShell';
import type { CEFRLevel, Topic, LearningStyle } from '@/types';
import { toast } from 'sonner';

const cefrLevels: { level: CEFRLevel; label: string; description: string; descriptionZh: string }[] = [
  { level: 'A1', label: 'Beginner', description: 'Basic phrases and expressions', descriptionZh: '基础词汇和表达' },
  { level: 'A2', label: 'Elementary', description: 'Frequently used expressions', descriptionZh: '常用表达' },
  { level: 'B1', label: 'Intermediate', description: 'Everyday situations', descriptionZh: '日常生活情境' },
  { level: 'B2', label: 'Upper Intermediate', description: 'Complex texts and discussions', descriptionZh: '复杂文本和讨论' },
  { level: 'C1', label: 'Advanced', description: 'Fluent and spontaneous', descriptionZh: '流利自然的表达' },
  { level: 'C2', label: 'Proficiency', description: 'Near-native fluency', descriptionZh: '接近母语流利度' },
];

const topics: { id: Topic; label: string; labelZh: string; icon: string }[] = [
  { id: 'Business', label: 'Business', labelZh: '商业', icon: '💼' },
  { id: 'Academic', label: 'Academic', labelZh: '学术', icon: '🎓' },
  { id: 'Travel', label: 'Travel', labelZh: '旅游', icon: '✈️' },
  { id: 'Food', label: 'Food', labelZh: '美食', icon: '🍜' },
  { id: 'Technology', label: 'Technology', labelZh: '科技', icon: '💻' },
  { id: 'Daily Life', label: 'Daily Life', labelZh: '日常生活', icon: '🏠' },
  { id: 'Entertainment', label: 'Entertainment', labelZh: '娱乐', icon: '🎬' },
  { id: 'Science', label: 'Science', labelZh: '科学', icon: '🔬' },
  { id: 'Health', label: 'Health', labelZh: '健康', icon: '💪' },
  { id: 'Sports', label: 'Sports', labelZh: '运动', icon: '⚽' },
];

const learningStyles: { id: LearningStyle; label: string; labelZh: string; description: string }[] = [
  { id: 'visual', label: 'Visual', labelZh: '视觉型', description: 'Learn best with images, charts, and visual aids' },
  { id: 'auditory', label: 'Auditory', labelZh: '听觉型', description: 'Learn best by listening and speaking' },
  { id: 'kinesthetic', label: 'Kinesthetic', labelZh: '动觉型', description: 'Learn best by doing and practicing' },
  { id: 'reading', label: 'Reading/Writing', labelZh: '读写型', description: 'Learn best by reading and taking notes' },
];

const stepCopy: Record<number, { en: string; zh: string }> = {
  1: { en: 'Tell us your level', zh: '告诉我们你的英语水平' },
  2: { en: 'Set a daily goal', zh: '设定每日目标' },
  3: { en: 'Pick what you care about', zh: '选择你感兴趣的主题' },
  4: { en: 'How do you learn best?', zh: '你最喜欢的学习方式' },
};

export default function OnboardingPage() {
  const { updateUserProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const redirectTarget = resolveAuthRedirect(location.search, '/dashboard/today');

  const [preferences, setPreferences] = useState({
    cefrLevel: 'B1' as CEFRLevel,
    dailyGoal: 10,
    preferredTopics: ['Daily Life', 'Business'] as Topic[],
    learningStyle: 'visual' as LearningStyle,
  });

  if (!isAuthenticated) {
    return <Navigate to={buildAuthRedirect('/onboarding')} replace />;
  }

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  const currentCopy = stepCopy[step];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const success = await updateUserProfile({
        cefrLevel: preferences.cefrLevel,
        dailyGoal: preferences.dailyGoal,
        preferredTopics: preferences.preferredTopics,
        learningStyle: preferences.learningStyle,
      });

      if (success) {
        toast.success('Profile setup complete!');
        navigate(redirectTarget, { replace: true });
      } else {
        toast.error('Failed to save profile. Please try again.');
      }
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTopic = (topic: Topic) => {
    setPreferences((prev) => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter((t) => t !== topic)
        : [...prev.preferredTopics, topic],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        if (showPlacementTest) {
          return (
            <PlacementTest
              onComplete={(level) => {
                setPreferences((prev) => ({ ...prev, cefrLevel: level }));
                setShowPlacementTest(false);
                setStep(2);
              }}
              onSkip={() => setShowPlacementTest(false)}
            />
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {isZh ? '你的英语水平是？' : "What's your English level?"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground" lang="zh-CN">
                选择你目前的英语水平
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-auto w-full border-2 border-dashed border-border bg-card py-4 text-foreground hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/[0.05]"
              onClick={() => setShowPlacementTest(true)}
            >
              <div className="text-center">
                <p className="font-medium">{isZh ? '做 10 道题自动测定等级' : 'Take a 10-question placement test'}</p>
                <p className="mt-1 text-xs text-muted-foreground" lang="zh-CN">
                  10 道题自动判断你的等级
                </p>
              </div>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">
                  or pick manually · <span lang="zh-CN">手动选择</span>
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {cefrLevels.map((level) => (
                <button
                  key={level.level}
                  type="button"
                  onClick={() => setPreferences((prev) => ({ ...prev, cefrLevel: level.level }))}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all',
                    preferences.cefrLevel === level.level
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10'
                      : 'border-border hover:border-emerald-300 dark:hover:border-emerald-500/30',
                  )}
                  aria-pressed={preferences.cefrLevel === level.level}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold',
                      preferences.cefrLevel === level.level
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {level.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                    <p className="text-xs text-muted-foreground" lang="zh-CN">
                      {level.descriptionZh}
                    </p>
                  </div>
                  {preferences.cefrLevel === level.level && (
                    <Check className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Set your daily goal
              </h2>
              <p className="mt-1 text-sm text-muted-foreground" lang="zh-CN">
                设定每日学习目标
              </p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <span className="text-5xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {preferences.dailyGoal}
                </span>
                <p className="mt-2 text-sm text-muted-foreground">
                  words per day · <span lang="zh-CN">单词 / 天</span>
                </p>
              </div>

              <Slider
                value={[preferences.dailyGoal]}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, dailyGoal: value[0] }))
                }
                min={5}
                max={50}
                step={5}
                className="w-full"
                aria-label="Daily word goal"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>15</span>
                <span>25</span>
                <span>35</span>
                <span>50</span>
              </div>

              <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]">
                <p className="text-sm text-foreground">
                  <strong className="text-emerald-700 dark:text-emerald-300">Recommended:</strong>{' '}
                  10–15 words per day for optimal retention.
                </p>
                <p className="mt-1 text-xs text-muted-foreground" lang="zh-CN">
                  建议：每天 10–15 个新词以获得最佳记忆效果。
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                What topics interest you?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground" lang="zh-CN">
                选择你感兴趣的主题
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className={cn(
                    'rounded-lg border-2 p-4 text-left transition-all',
                    preferences.preferredTopics.includes(topic.id)
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10'
                      : 'border-border hover:border-emerald-300 dark:hover:border-emerald-500/30',
                  )}
                  aria-pressed={preferences.preferredTopics.includes(topic.id)}
                >
                  <div className="text-2xl" aria-hidden="true">{topic.icon}</div>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {topic.label}
                  </p>
                  <p className="text-xs text-muted-foreground" lang="zh-CN">
                    {topic.labelZh}
                  </p>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Pick at least 2 · <span lang="zh-CN">至少选择 2 个</span>
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpen className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                How do you learn best?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground" lang="zh-CN">
                你最喜欢的学习方式？
              </p>
            </div>

            <div className="space-y-3">
              {learningStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setPreferences((prev) => ({ ...prev, learningStyle: style.id }))}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all',
                    preferences.learningStyle === style.id
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10'
                      : 'border-border hover:border-emerald-300 dark:hover:border-emerald-500/30',
                  )}
                  aria-pressed={preferences.learningStyle === style.id}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      preferences.learningStyle === style.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {preferences.learningStyle === style.id && <Check className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {style.label}{' '}
                      <span className="font-normal text-muted-foreground" lang="zh-CN">
                        ({style.labelZh})
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthShell
      title={currentCopy.en}
      titleZh={currentCopy.zh}
      size="wide"
    >
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {isZh ? `第 ${step} / ${totalSteps} 步` : `Step ${step} of ${totalSteps}`}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {renderStep()}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isLoading}
            className="rounded-lg border-border bg-card text-foreground hover:bg-muted"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {isZh ? '上一步' : 'Back'}
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={
              isLoading ||
              (step === 3 && preferences.preferredTopics.length < 2)
            }
            className="rounded-md bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isZh ? '保存中...' : 'Saving...'}
              </>
            ) : step === totalSteps ? (
              <>
                {isZh ? '开始学习' : 'Get started'}
                <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                {isZh ? '下一步' : 'Next'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

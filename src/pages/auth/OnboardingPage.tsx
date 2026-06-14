import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Clock,
  GraduationCap,
  Target,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildAuthRedirect, resolveAuthRedirect } from '@/lib/authRedirect';
import { PlacementTest } from '@/components/PlacementTest';
import { AuthShell } from '@/features/marketing/AuthShell';
import type { CEFRLevel, Topic, LearningStyle } from '@/types';
import {
  buildOnboardingPlacement,
  type OnboardingDeadline,
  type OnboardingExamTarget,
  type OnboardingPlacementInput,
} from '@/services/onboardingPlacement';
import { toast } from 'sonner';

const cefrLevels: { level: CEFRLevel; label: string; labelZh: string; description: string; descriptionZh: string }[] = [
  { level: 'A1', label: 'Beginner', labelZh: '入门', description: 'Basic phrases and expressions', descriptionZh: '基础词汇和表达' },
  { level: 'A2', label: 'Elementary', labelZh: '基础', description: 'Frequently used expressions', descriptionZh: '常用表达' },
  { level: 'B1', label: 'Intermediate', labelZh: '中级', description: 'Everyday situations', descriptionZh: '日常生活情境' },
  { level: 'B2', label: 'Upper Intermediate', labelZh: '中高级', description: 'Complex texts and discussions', descriptionZh: '复杂文本和讨论' },
  { level: 'C1', label: 'Advanced', labelZh: '高级', description: 'Fluent and spontaneous', descriptionZh: '流利自然的表达' },
  { level: 'C2', label: 'Proficiency', labelZh: '精通', description: 'Near-native fluency', descriptionZh: '接近母语流利度' },
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

const learningStyles: { id: LearningStyle; label: string; labelZh: string; description: string; descriptionZh: string }[] = [
  { id: 'visual', label: 'Visual', labelZh: '视觉型', description: 'Learn best with images, charts, and visual aids', descriptionZh: '通过图片、图表和视觉线索学习更高效' },
  { id: 'auditory', label: 'Auditory', labelZh: '听觉型', description: 'Learn best by listening and speaking', descriptionZh: '通过听力输入和开口表达学习更高效' },
  { id: 'kinesthetic', label: 'Kinesthetic', labelZh: '动觉型', description: 'Learn best by doing and practicing', descriptionZh: '通过动手练习和反复实践学习更高效' },
  { id: 'reading', label: 'Reading/Writing', labelZh: '读写型', description: 'Learn best by reading and taking notes', descriptionZh: '通过阅读和整理笔记学习更高效' },
];

const examTargets: { id: OnboardingExamTarget; label: string; labelZh: string; description: string; descriptionZh: string }[] = [
  { id: 'general', label: 'General fluency', labelZh: '综合提升', description: 'Build a steady vocabulary and practice habit', descriptionZh: '建立稳定的词汇和练习习惯' },
  { id: 'ielts', label: 'IELTS target', labelZh: 'IELTS 备考', description: 'Prioritize academic vocabulary and output practice', descriptionZh: '优先学术词汇和输出练习' },
  { id: 'toefl', label: 'TOEFL target', labelZh: 'TOEFL 备考', description: 'Focus on academic reading, listening, and structure', descriptionZh: '聚焦学术阅读、听力和结构表达' },
];

const ieltsBands = ['IELTS 6.0', 'IELTS 6.5', 'IELTS 7.0', 'IELTS 7.5', 'IELTS 8.0'];
const toeflTargets = ['TOEFL 75+', 'TOEFL 90+', 'TOEFL 100+', 'TOEFL 105+', 'TOEFL 110+'];
const dailyMinuteOptions = [15, 25, 35, 45];

const deadlines: { id: OnboardingDeadline; label: string; labelZh: string }[] = [
  { id: 'lt_1_month', label: '< 1 month', labelZh: '1 个月内' },
  { id: '1_3_months', label: '1-3 months', labelZh: '1-3 个月' },
  { id: '3_6_months', label: '3-6 months', labelZh: '3-6 个月' },
  { id: '6_plus_months', label: '6+ months', labelZh: '6 个月以上' },
  { id: 'none', label: 'No date yet', labelZh: '暂未确定' },
];

const stepCopy: Record<number, { en: string; zh: string }> = {
  1: { en: 'Tell us your level', zh: '告诉我们你的英语水平' },
  2: { en: 'Choose your learning target', zh: '选择你的学习目标' },
  3: { en: 'Set daily practice', zh: '设置每日练习' },
  4: { en: 'Pick what you care about', zh: '选择你感兴趣的主题' },
  5: { en: 'Confirm your starter plan', zh: '确认你的起始方案' },
};

export default function OnboardingPage() {
  const { updateUserProfile, isAuthenticated } = useAuth();
  const { setActiveBook, updateLearningProfile, refreshDailyMission } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const redirectTarget = resolveAuthRedirect(location.search, '/dashboard/today');

  const [preferences, setPreferences] = useState<OnboardingPlacementInput>({
    cefrLevel: 'B1' as CEFRLevel,
    examTarget: 'general',
    targetBand: undefined,
    deadline: 'none',
    dailyGoal: 10,
    dailyMinutes: 25,
    preferredTopics: ['Daily Life', 'Business'] as Topic[],
    learningStyle: 'visual' as LearningStyle,
  });
  const placement = useMemo(() => buildOnboardingPlacement(preferences), [preferences]);

  if (!isAuthenticated) {
    return <Navigate to={buildAuthRedirect('/onboarding')} replace />;
  }

  const totalSteps = 5;
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
        setActiveBook(placement.starterBookId);
        updateLearningProfile(placement.learningProfile);
        refreshDailyMission();
        toast.success(
          isZh
            ? `已为你选择《${placement.starterBookName}》。`
            : `${placement.starterBookName} is ready for you.`,
        );
        navigate(redirectTarget, { replace: true });
      } else {
        toast.error(isZh ? '保存档案失败，请重试。' : 'Failed to save profile. Please try again.');
      }
    } catch {
      toast.error(isZh ? '保存档案失败，请重试。' : 'Failed to save profile. Please try again.');
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

  const updateExamTarget = (examTarget: OnboardingExamTarget) => {
    setPreferences((prev) => {
      const targetBand =
        examTarget === 'ielts'
          ? prev.targetBand?.startsWith('IELTS')
            ? prev.targetBand
            : 'IELTS 7.0'
          : examTarget === 'toefl'
            ? prev.targetBand?.startsWith('TOEFL')
              ? prev.targetBand
              : 'TOEFL 90+'
            : undefined;
      const preferredTopics: Topic[] =
        examTarget === 'general' || prev.preferredTopics.includes('Academic')
          ? prev.preferredTopics
          : ['Academic', ...prev.preferredTopics];

      return {
        ...prev,
        examTarget,
        targetBand,
        deadline: examTarget === 'general' ? 'none' : prev.deadline === 'none' ? '3_6_months' : prev.deadline,
        preferredTopics,
      };
    });
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
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh ? '选择你目前的英语水平' : 'Choose your current English level'}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-auto w-full border-2 border-dashed border-border bg-card py-4 text-foreground hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/[0.05]"
              onClick={() => setShowPlacementTest(true)}
            >
              <div className="text-center">
                <p className="font-medium">{isZh ? '做 10 道题判断英语水平' : 'Take a 10-question placement test'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isZh ? '几分钟内得到一个水平参考' : 'Get an automatic level estimate in a few minutes'}
                </p>
              </div>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">
                  {isZh ? '手动选择' : 'or pick manually'}
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
                    'flex items-center gap-4 rounded-md border-2 p-4 text-left transition-all',
                    preferences.cefrLevel === level.level
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10'
                      : 'border-border hover:border-emerald-300 dark:hover:border-emerald-500/30',
                  )}
                  aria-pressed={preferences.cefrLevel === level.level}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-md text-base font-bold',
                      preferences.cefrLevel === level.level
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {level.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{isZh ? level.labelZh : level.label}</p>
                    <p className="text-sm text-muted-foreground">{isZh ? level.descriptionZh : level.description}</p>
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
                {isZh ? '你这次学习的主要目标是？' : 'What are you learning for?'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh ? '目标会影响起始词书、任务和练习路径' : 'Your target shapes the starter book, mission, and path'}
              </p>
            </div>

            <div className="grid gap-3">
              {examTargets.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => updateExamTarget(target.id)}
                  className={cn(
                    'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all',
                    preferences.examTarget === target.id
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10'
                      : 'border-border hover:border-emerald-300 dark:hover:border-emerald-500/30',
                  )}
                  aria-pressed={preferences.examTarget === target.id}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      preferences.examTarget === target.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {preferences.examTarget === target.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{isZh ? target.labelZh : target.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isZh ? target.descriptionZh : target.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {preferences.examTarget !== 'general' ? (
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isZh ? '目标分数' : 'Target score'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(preferences.examTarget === 'ielts' ? ieltsBands : toeflTargets).map((band) => (
                      <Button
                        key={band}
                        type="button"
                        variant={preferences.targetBand === band ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreferences((prev) => ({ ...prev, targetBand: band }))}
                        className="rounded-md"
                      >
                        {band}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isZh ? '考试时间' : 'Exam date'}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    {deadlines.map((deadline) => (
                      <button
                        key={deadline.id}
                        type="button"
                        onClick={() => setPreferences((prev) => ({ ...prev, deadline: deadline.id }))}
                        className={cn(
                          'rounded-md border px-3 py-2 text-sm transition-colors',
                          preferences.deadline === deadline.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-foreground hover:bg-muted',
                        )}
                        aria-pressed={preferences.deadline === deadline.id}
                      >
                        {isZh ? deadline.labelZh : deadline.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                {isZh
                  ? '如果之后切换到 IELTS/TOEFL，系统会自动改用学术词书和考试练习。'
                  : 'If you switch to IELTS or TOEFL later, the app will move you to academic vocabulary and exam practice.'}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {isZh ? '设置每日练习' : 'Set daily practice'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh ? '选择每天能稳定完成的词量和时间' : 'Choose a pace you can consistently finish'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <span className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {preferences.dailyGoal}
                </span>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isZh ? '单词 / 天' : 'words per day'}
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
                aria-label={isZh ? '每日单词目标' : 'Daily word goal'}
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>15</span>
                <span>25</span>
                <span>35</span>
                <span>50</span>
              </div>

              <div className="rounded-md border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]">
                <p className="text-sm text-foreground">
                  <strong className="text-emerald-700 dark:text-emerald-300">
                    {isZh ? '建议：' : 'Suggested:'}
                  </strong>{' '}
                  {isZh ? '每天 10-15 个新词以获得最佳记忆效果。' : '10-15 words per day for optimal retention.'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">
                  {isZh ? '每天可投入时间' : 'Daily study time'}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {dailyMinuteOptions.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setPreferences((prev) => ({ ...prev, dailyMinutes: minutes }))}
                      className={cn(
                        'rounded-md border px-3 py-3 text-sm font-medium transition-colors',
                        preferences.dailyMinutes === minutes
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:bg-muted',
                      )}
                      aria-pressed={preferences.dailyMinutes === minutes}
                    >
                      {minutes} {isZh ? '分钟' : 'min'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {isZh ? '你对哪些主题感兴趣？' : 'What topics interest you?'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh ? '选择你感兴趣的主题' : 'Pick the content areas you want in daily practice'}
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
                    {isZh ? topic.labelZh : topic.label}
                  </p>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {isZh ? '至少选择 2 个' : 'Pick at least 2'}
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpen className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {isZh ? '你最喜欢怎样学习？' : 'How do you learn best?'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh ? '选择最适合你的练习方式' : 'Choose the practice format that fits you best'}
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
                      'flex h-10 w-10 items-center justify-center rounded-md',
                      preferences.learningStyle === style.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {preferences.learningStyle === style.id && <Check className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {isZh ? style.labelZh : style.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{isZh ? style.descriptionZh : style.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4" aria-live="polite">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {isZh ? '你的起始方案' : 'Your starter plan'}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{isZh ? '词书' : 'Book'}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{placement.starterBookName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isZh ? '路径' : 'Path'}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{placement.learningPathName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isZh ? '首个任务' : 'First mission'}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {isZh ? placement.firstMission.titleZh : placement.firstMission.title}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {placement.reasons.map((reason) => (
                      <li key={reason.en} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                        <span>{isZh ? reason.zh : reason.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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
              (step === 4 && preferences.preferredTopics.length < 2)
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

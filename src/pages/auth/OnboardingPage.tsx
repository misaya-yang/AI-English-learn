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
  Briefcase,
  Plane,
  Utensils,
  Cpu,
  Home as HomeIcon,
  Film,
  FlaskConical,
  HeartPulse,
  Dumbbell,
  type LucideIcon,
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

const topics: { id: Topic; label: string; labelZh: string; icon: LucideIcon }[] = [
  { id: 'Business', label: 'Business', labelZh: '商业', icon: Briefcase },
  { id: 'Academic', label: 'Academic', labelZh: '学术', icon: GraduationCap },
  { id: 'Travel', label: 'Travel', labelZh: '旅行', icon: Plane },
  { id: 'Food', label: 'Food', labelZh: '饮食', icon: Utensils },
  { id: 'Technology', label: 'Technology', labelZh: '科技', icon: Cpu },
  { id: 'Daily Life', label: 'Daily Life', labelZh: '日常', icon: HomeIcon },
  { id: 'Entertainment', label: 'Entertainment', labelZh: '影视', icon: Film },
  { id: 'Science', label: 'Science', labelZh: '科学', icon: FlaskConical },
  { id: 'Health', label: 'Health', labelZh: '健康', icon: HeartPulse },
  { id: 'Sports', label: 'Sports', labelZh: '运动', icon: Dumbbell },
];

const learningStyles: { id: LearningStyle; label: string; labelZh: string; description: string; descriptionZh: string }[] = [
  { id: 'visual', label: 'Visual', labelZh: '图像', description: 'Images and structure', descriptionZh: '图片和结构' },
  { id: 'auditory', label: 'Listening', labelZh: '听说', description: 'Listening and speaking', descriptionZh: '听和说' },
  { id: 'kinesthetic', label: 'Practice', labelZh: '练习', description: 'Practice tasks', descriptionZh: '多做练习' },
  { id: 'reading', label: 'Reading/Writing', labelZh: '读写', description: 'Reading and notes', descriptionZh: '阅读和笔记' },
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
  1: { en: 'English level', zh: '英语水平' },
  2: { en: 'Learning target', zh: '学习目标' },
  3: { en: 'Daily practice', zh: '每日练习' },
  4: { en: 'Topics', zh: '练习主题' },
  5: { en: 'Practice format', zh: '练习方式' },
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
                {isZh ? '选择英语水平' : 'Choose your level'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh ? '不确定的话，可以先做快速测试。' : 'Not sure? Take the quick test first.'}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-auto w-full border-2 border-dashed border-border bg-card py-4 text-foreground hover:border-primary/40 hover:bg-primary/5"
              onClick={() => setShowPlacementTest(true)}
            >
              <div className="text-center">
                <p className="font-medium">{isZh ? '做 10 道题判断英语水平' : 'Take a 10-question placement test'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isZh ? '几分钟得到一个参考' : 'Get a level estimate in a few minutes'}
                </p>
              </div>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">
                  {isZh ? '手动选择' : 'Manual choice'}
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
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40',
                  )}
                  aria-pressed={preferences.cefrLevel === level.level}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-md text-base font-bold',
                      preferences.cefrLevel === level.level
                        ? 'bg-primary text-primary-foreground'
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
                    <Check className="h-5 w-5 text-primary" aria-hidden="true" />
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
                {isZh ? '用于选择词书和练习顺序' : 'Used for your book and practice order'}
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
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40',
                  )}
                  aria-pressed={preferences.examTarget === target.id}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      preferences.examTarget === target.id
                        ? 'bg-primary text-primary-foreground'
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
                  ? '之后可以改成 IELTS/TOEFL。'
                  : 'You can switch to IELTS or TOEFL later.'}
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
                <span className="text-3xl font-semibold text-primary">
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

              <div className="rounded-md border border-primary/25 bg-primary/10 p-4">
                <p className="text-sm text-foreground">
                  <strong className="text-primary">
                    {isZh ? '参考：' : 'Reference:'}
                  </strong>{' '}
                  {isZh ? '每天 10-15 个新词更容易完成。' : '10-15 new words per day is easier to finish.'}
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
                {isZh ? '选择练习主题' : 'Choose practice topics'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh ? '至少选 2 个。' : 'Pick at least 2.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {topics.map((topic) => {
                const TopicIcon = topic.icon;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className={cn(
                      'rounded-lg border-2 p-4 text-left transition-all',
                      preferences.preferredTopics.includes(topic.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40',
                    )}
                    aria-pressed={preferences.preferredTopics.includes(topic.id)}
                  >
                    <TopicIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {isZh ? topic.labelZh : topic.label}
                    </p>
                  </button>
                );
              })}
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
                {isZh ? '选择练习方式' : 'Choose a practice format'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh ? '之后也可以调整。' : 'You can change this later.'}
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
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40',
                  )}
                  aria-pressed={preferences.learningStyle === style.id}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-md',
                      preferences.learningStyle === style.id
                        ? 'bg-primary text-primary-foreground'
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
                    {isZh ? '起始设置' : 'Starting setup'}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{isZh ? '词书' : 'Book'}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{placement.starterBookName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isZh ? '重点' : 'Focus'}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{placement.learningPathName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isZh ? '先练这个' : 'Start here'}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {isZh ? placement.firstMission.titleZh : placement.firstMission.title}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {placement.reasons.map((reason) => (
                      <li key={reason.en} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
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
            <span className="font-medium text-primary">
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
                {isZh ? '开始今天' : 'Start today'}
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

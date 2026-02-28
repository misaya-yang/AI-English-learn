import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

export default function OnboardingPage() {
  const { updateUserProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    cefrLevel: 'B1' as CEFRLevel,
    dailyGoal: 10,
    preferredTopics: ['Daily Life', 'Business'] as Topic[],
    learningStyle: 'visual' as LearningStyle,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

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
        navigate('/dashboard');
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
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">What's your English level?</h2>
              <p className="text-muted-foreground">选择您的英语程度</p>
            </div>

            <div className="grid gap-3">
              {cefrLevels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => setPreferences((prev) => ({ ...prev, cefrLevel: level.level }))}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left',
                    preferences.cefrLevel === level.level
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-border hover:border-emerald-200'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center font-bold',
                      preferences.cefrLevel === level.level
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted'
                    )}
                  >
                    {level.level}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                    <p className="text-xs text-muted-foreground">{level.descriptionZh}</p>
                  </div>
                  {preferences.cefrLevel === level.level && (
                    <Check className="h-5 w-5 text-emerald-500" />
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
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Set your daily goal</h2>
              <p className="text-muted-foreground">设定每日学习目标</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <span className="text-5xl font-bold text-emerald-600">
                  {preferences.dailyGoal}
                </span>
                <p className="text-muted-foreground mt-2">words per day / 单词/天</p>
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
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>15</span>
                <span>25</span>
                <span>35</span>
                <span>50</span>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Recommended:</strong> 10-15 words per day for optimal retention
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  建议：每天 10-15 个单词以达到最佳记忆效果
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">What topics interest you?</h2>
              <p className="text-muted-foreground">选择您感兴趣的主题</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    preferences.preferredTopics.includes(topic.id)
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-border hover:border-emerald-200'
                  )}
                >
                  <div className="text-2xl mb-2">{topic.icon}</div>
                  <p className="font-medium text-sm">{topic.label}</p>
                  <p className="text-xs text-muted-foreground">{topic.labelZh}</p>
                </button>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Select at least 2 topics / 请选择至少 2 个主题
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">How do you learn best?</h2>
              <p className="text-muted-foreground">您最适合哪种学习方式？</p>
            </div>

            <div className="space-y-3">
              {learningStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setPreferences((prev) => ({ ...prev, learningStyle: style.id }))}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left',
                    preferences.learningStyle === style.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-border hover:border-emerald-200'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      preferences.learningStyle === style.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted'
                    )}
                  >
                    {preferences.learningStyle === style.id && <Check className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {style.label}{' '}
                      <span className="text-muted-foreground font-normal">({style.labelZh})</span>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent>{renderStep()}</CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={
                isLoading ||
                (step === 3 && preferences.preferredTopics.length < 2)
              }
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : step === totalSteps ? (
                <>
                  Get Started
                  <Check className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

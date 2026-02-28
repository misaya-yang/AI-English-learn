import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';

const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

const topics = ['daily', 'business', 'technology', 'travel', 'academic', 'science', 'health', 'arts'];

const learningStyles: { id: LearningStyle; label: string; labelZh: string }[] = [
  { id: 'visual', label: 'Visual', labelZh: '视觉型' },
  { id: 'auditory', label: 'Auditory', labelZh: '听觉型' },
  { id: 'kinesthetic', label: 'Kinesthetic', labelZh: '动觉型' },
  { id: 'reading', label: 'Reading/Writing', labelZh: '读写型' },
];

const levelThresholds: Record<string, number> = {
  'Novice': 0,
  'Apprentice': 500,
  'Journeyman': 1500,
  'Expert': 3500,
  'Word Wizard': 7000,
  'Language Master': 15000,
};

export default function ProfilePage() {
  const { user, profile, updateUserProfile } = useAuth();
  const { xp, streak, stats } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    cefrLevel: (profile?.cefrLevel as CEFRLevel) || 'B1',
    dailyGoal: profile?.dailyGoal || 10,
    preferredTopics: profile?.preferredTopics || ['daily'],
    learningStyle: (profile?.learningStyle as LearningStyle) || 'visual',
  });

  const handleSave = async () => {
    const success = await updateUserProfile({
      cefrLevel: formData.cefrLevel,
      dailyGoal: formData.dailyGoal,
      preferredTopics: formData.preferredTopics,
      learningStyle: formData.learningStyle,
    });
    if (success) {
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile');
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

  const levelName = currentLevel < 5 ? 'Novice' : currentLevel < 10 ? 'Apprentice' : currentLevel < 20 ? 'Journeyman' : 'Expert';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">个人资料 • Manage your account</p>
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          {isEditing ? (
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
                <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-600">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="grid gap-2 max-w-sm">
                  <Label>Display Name</Label>
                  <Input
                    value={user?.displayName || ''}
                    disabled
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
              Learning Level
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
              Daily Goal
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
                  <p className="font-medium">Words per Day</p>
                  <p className="text-sm text-muted-foreground">Daily learning target</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Preferred Topics
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
              Learning Style
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
            Learning Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{streak.current}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{streak.longest}</p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <BookOpen className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalWords}</p>
              <p className="text-sm text-muted-foreground">Total Words</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.masteredWords}</p>
              <p className="text-sm text-muted-foreground">Mastered</p>
            </div>
          </div>
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

import { useState, useEffect } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Volume2,
  Check,
  RotateCcw,
  Brain,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Star,
  TrendingUp,
  BookOpen,
  MessageCircleMore,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { WordData } from '@/data/words';
import { toast } from 'sonner';
import { getRecommendedUnit } from '@/data/examContent';
import { recordLearningEvent } from '@/services/learningEvents';
import { speakEnglishText } from '@/services/tts';
import { useLearningOverviewQuery } from '@/features/learning/hooks/useLearningOverviewQuery';

interface WordCardProps {
  word: WordData;
  isFlipped: boolean;
  onFlip: () => void;
  onMarkStatus: (status: 'learned' | 'hard') => void;
  isLearned: boolean;
  isHard: boolean;
}

function WordCard({ word, isFlipped, onFlip, onMarkStatus, isLearned, isHard }: WordCardProps) {
  const [activeTab, setActiveTab] = useState('definition');

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      <motion.div
        className="relative w-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <Card
          className={cn(
            'w-full cursor-pointer min-h-[400px] backface-hidden',
            'bg-gradient-to-br from-card to-muted/30',
            'border-2 border-transparent hover:border-emerald-500/30',
            'transition-all duration-300 shadow-lg',
            isFlipped && 'invisible'
          )}
          onClick={onFlip}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            {/* Status badges */}
            <div className="flex gap-2 mb-4">
              {isLearned && (
                <Badge className="bg-emerald-500 text-white">
                  <Check className="h-3 w-3 mr-1" />
                  已学会
                </Badge>
              )}
              {isHard && (
                <Badge className="bg-amber-500 text-white">
                  <Brain className="h-3 w-3 mr-1" />
                  需复习
                </Badge>
              )}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">
                {word.level}
              </Badge>
            </motion.div>
            
            <motion.h2 
              className="text-5xl font-bold text-center mb-3 text-emerald-600"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {word.word}
            </motion.h2>
            
            <motion.p 
              className="text-lg text-muted-foreground mb-6 font-mono"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {word.partOfSpeech} • {word.phonetic}
            </motion.p>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-14 w-14 border-2 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(word.word);
                }}
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </motion.div>
            
            <motion.p 
              className="text-sm text-muted-foreground mt-8 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              点击翻转卡片查看详情
            </motion.p>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className={cn(
            'w-full absolute inset-0 min-h-[400px] backface-hidden shadow-lg',
            !isFlipped && 'invisible'
          )}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 rounded-none">
                <TabsTrigger value="definition">释义</TabsTrigger>
                <TabsTrigger value="examples">例句</TabsTrigger>
                <TabsTrigger value="related">关联</TabsTrigger>
                <TabsTrigger value="more">更多</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[280px]">
                <div className="p-4">
                  <TabsContent value="definition" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 text-emerald-600">定义</h3>
                        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{word.definition}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {word.definitionZh}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="examples" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-2 text-emerald-600">例句</h3>
                      {word.examples.map((ex, i) => (
                        <div key={i} className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm mb-1">{ex.en}</p>
                          <p className="text-sm text-muted-foreground">{ex.zh}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 hover:bg-emerald-100 hover:text-emerald-600"
                            onClick={() => playAudio(ex.en)}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            播放
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="related" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 text-emerald-600">同义词</h3>
                        <div className="flex flex-wrap gap-2">
                          {word.synonyms.map((syn) => (
                            <Badge key={syn} variant="secondary" className="cursor-pointer hover:bg-emerald-100">
                              {syn}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-2 text-emerald-600">反义词</h3>
                        <div className="flex flex-wrap gap-2">
                          {word.antonyms.map((ant) => (
                            <Badge key={ant} variant="outline" className="cursor-pointer hover:bg-red-50">
                              {ant}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-2 text-emerald-600">搭配词</h3>
                        <div className="flex flex-wrap gap-2">
                          {word.collocations.map((col) => (
                            <Badge key={col} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer">
                              {col}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="more" className="mt-0">
                    <div className="space-y-4">
                      {word.etymology && (
                        <div>
                          <h3 className="font-semibold mb-2 text-emerald-600">词源</h3>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{word.etymology}</p>
                        </div>
                      )}
                      
                      {word.memoryTip && (
                        <div>
                          <h3 className="font-semibold mb-2 text-emerald-600">记忆技巧</h3>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{word.memoryTip}</p>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold mb-2 text-emerald-600">主题</h3>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {word.topic}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>

            {/* Action buttons on back of card */}
            <div className="p-4 pt-0 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={onFlip}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                返回
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-amber-300 hover:bg-amber-50 hover:text-amber-600"
                onClick={() => onMarkStatus('hard')}
                disabled={isHard}
              >
                <Brain className="h-4 w-4 mr-2" />
                {isHard ? '已标记' : '较难'}
              </Button>
              <Button
                variant="default"
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onMarkStatus('learned')}
                disabled={isLearned}
              >
                <Check className="h-4 w-4 mr-2" />
                {isLearned ? '已学会' : '学会'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function TodayPage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const {
    dailyWords,
    activeBook,
    activeBookSummary,
    dueWords,
    learningProfile,
    markWordAsLearned,
    refreshDailyWords,
    dailyMission,
    completeMissionTask,
    refreshDailyMission,
  } = useUserData();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [hardWords, setHardWords] = useState<Set<string>>(new Set());
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(new Set());

  const words = dailyWords.length > 0 ? dailyWords : [];
  const currentWord = words[currentWordIndex];
  const progress = words.length > 0 ? (learnedWords.size / words.length) * 100 : 0;
  const recommendedUnit = getRecommendedUnit(userId);

  useEffect(() => {
    refreshDailyWords();
    refreshDailyMission();
  }, [refreshDailyWords, refreshDailyMission]);

  const learningOverviewQuery = useLearningOverviewQuery({
    userId,
    mission: dailyMission,
    profile: learningProfile,
    dueWordsCount: dueWords.length,
    dailyWordsCount: words.length,
    learnedTodayCount: learnedWords.size,
    recommendedUnitTitle: recommendedUnit?.title || null,
    activeBookName: activeBook?.name || null,
  });

  const missionCard = learningOverviewQuery.data?.missionCard;
  const weaknesses = learningOverviewQuery.data?.weaknesses || [];
  const adaptiveDifficulty = learningOverviewQuery.data?.adaptiveDifficulty;
  const activityPoints = learningOverviewQuery.data?.activity || [];

  const handleFlip = (wordId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const handleMarkStatus = (status: 'learned' | 'hard') => {
    if (!currentWord) return;

    if (status === 'learned') {
      if (learnedWords.has(currentWord.id)) {
        toast.info('这个单词已经标记为已学会');
        return;
      }

      setLearnedWords((prev) => new Set(prev).add(currentWord.id));
      markWordAsLearned(currentWord.id);
      void recordLearningEvent({
        userId,
        eventName: 'today.word_marked',
        payload: {
          wordId: currentWord.id,
          word: currentWord.word,
          status: 'learned',
        },
      });

      if (learnedWords.size + 1 >= words.length) {
        completeMissionTask('task_vocab_today');
      }

      toast.success(`已学会 "${currentWord.word}"! +5 XP`, {
        icon: <Star className="h-4 w-4 text-yellow-500" />,
      });
    } else {
      if (hardWords.has(currentWord.id)) {
        toast.info('这个单词已经标记为较难');
        return;
      }

      setHardWords((prev) => new Set(prev).add(currentWord.id));
      void recordLearningEvent({
        userId,
        eventName: 'today.word_marked',
        payload: {
          wordId: currentWord.id,
          word: currentWord.word,
          status: 'hard',
        },
      });
      toast.info(`已标记 "${currentWord.word}" 为较难，将加入复习列表`, {
        icon: <Brain className="h-4 w-4 text-amber-500" />,
      });
    }

    window.setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setFlippedCards(new Set());
      }
    }, 700);
  };

  const handleBookmark = () => {
    if (!currentWord) return;

    setBookmarkedWords((prev) => {
      const next = new Set(prev);
      if (next.has(currentWord.id)) {
        next.delete(currentWord.id);
        toast.info(`已取消收藏 "${currentWord.word}"`);
      } else {
        next.add(currentWord.id);
        toast.success(`已收藏 "${currentWord.word}"`);
      }
      return next;
    });
  };

  const handleShare = async () => {
    if (!currentWord) return;

    const shareText = `我正在学习单词 "${currentWord.word}" - ${currentWord.definitionZh}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `VocabDaily - ${currentWord.word}`,
          text: shareText,
        });
      } catch {
        // user cancelled
      }
      return;
    }

    await navigator.clipboard.writeText(shareText);
    toast.success('已复制到剪贴板');
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((prev) => prev - 1);
      setFlippedCards(new Set());
    }
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setFlippedCards(new Set());
    }
  };

  const missionDone = dailyMission?.tasks.filter((task) => task.done).length || 0;
  const missionTotal = dailyMission?.tasks.length || 0;
  const missionProgress = missionTotal > 0 ? Math.round((missionDone / missionTotal) * 100) : 0;

  if (words.length === 0) {
    return (
      <motion.div
        className="mx-auto flex min-h-[68vh] max-w-4xl flex-col items-center justify-center px-4 text-center"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-emerald-500/12 text-emerald-600 shadow-sm">
          <Sparkles className="h-11 w-11" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">先确定今天的学习入口</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {activeBook
            ? `当前词书是《${activeBook.name}》。先生成今天的新词，再根据到期复习和弱项安排下一步。`
            : '你还没有激活词书。先选词书或导入 deck，再开始今天的任务链路。'}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {activeBook ? (
            <Button size="lg" className="rounded-2xl bg-emerald-600 px-6 hover:bg-emerald-700" onClick={refreshDailyWords}>
              <Sparkles className="mr-2 h-5 w-5" />
              生成今日任务
            </Button>
          ) : (
            <Button size="lg" className="rounded-2xl bg-emerald-600 px-6 hover:bg-emerald-700" asChild>
              <Link to="/dashboard/vocabulary">
                <BookOpen className="mr-2 h-5 w-5" />
                去选择词书
              </Link>
            </Button>
          )}
          <Button size="lg" variant="outline" className="rounded-2xl px-6" asChild>
            <Link to="/dashboard/chat">
              <MessageCircleMore className="mr-2 h-5 w-5" />
              让 AI 帮我规划
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden rounded-[30px] border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-500/8">
          <CardContent className="p-6 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                  今日主任务 · {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
                </Badge>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                    {missionCard?.headlineZh || '先做最该做的一步'}
                  </h1>
                  <p className="mt-3 max-w-3xl text-base text-muted-foreground lg:text-lg">
                    {missionCard?.supportZh || '今天先清掉复习压力，再用一轮针对性练习把薄弱点补上。'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border bg-background/70 px-4 py-3">
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Mission</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-600">{missionProgress}%</p>
                </div>
                <div className="h-14 w-px bg-border" />
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Time</p>
                  <p className="mt-1 text-lg font-semibold">{missionCard?.estimatedMinutes || learningProfile.dailyMinutes} min</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border bg-background/75 p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>今日任务完成度</span>
                <span>{missionDone}/{missionTotal || 3}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all" style={{ width: `${missionProgress}%` }} />
              </div>
              {dailyMission ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {dailyMission.tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => !task.done && completeMissionTask(task.id)}
                      className={cn(
                        'rounded-2xl border px-4 py-3 text-left transition-colors',
                        task.done
                          ? 'border-emerald-500/30 bg-emerald-500/8'
                          : 'border-border bg-card hover:border-emerald-300/50 hover:bg-muted/60',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={cn('text-sm font-medium', task.done && 'text-emerald-700 dark:text-emerald-300')}>
                            {task.titleZh}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{task.title}</p>
                        </div>
                        {task.done ? <Check className="h-4 w-4 text-emerald-600" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-2xl bg-emerald-600 px-5 hover:bg-emerald-700" asChild>
                <Link to={missionCard?.primaryAction.href || '/dashboard/today'}>
                  {missionCard?.primaryAction.ctaZh || '继续今日任务'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {(missionCard?.secondaryActions || []).slice(0, 2).map((action) => (
                <Button key={action.id} variant="outline" className="rounded-2xl px-5" asChild>
                  <Link to={action.href}>{action.ctaZh}</Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[28px] border-border/70">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold">当前学习底盘</p>
                  <p className="text-sm text-muted-foreground">词书、复习压力和推荐补强会在这里收口。</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border bg-muted/35 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active book</p>
                  <p className="mt-2 text-lg font-semibold">{activeBook?.name || '未选择词书'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">今日词量 {words.length} / {activeBookSummary.dailyGoal}</p>
                </div>
                <div className="rounded-2xl border bg-muted/35 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Review pressure</p>
                  <p className="mt-2 text-lg font-semibold">{dueWords.length} 个到期复习</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeBookSummary.isNearlyCompleted ? '当前词书接近完成，建议准备下一本。' : '先处理到期复习，再推进新词，记忆效率更高。'}
                  </p>
                </div>
              </div>
              {adaptiveDifficulty ? (
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/6 p-4">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm font-semibold">当前节奏：{adaptiveDifficulty.labelZh}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{adaptiveDifficulty.reason}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/70">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">近期弱项</p>
                  <p className="text-sm text-muted-foreground">从 review、practice 和写作反馈里聚合出来。</p>
                </div>
                {learningOverviewQuery.isLoading ? <Badge variant="outline">同步中</Badge> : null}
              </div>
              <div className="space-y-2">
                {weaknesses.length > 0 ? weaknesses.map((weakness) => (
                  <div key={weakness.tag} className="rounded-2xl border px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{weakness.titleZh}</p>
                        <p className="text-xs text-muted-foreground">{weakness.title}</p>
                      </div>
                      <Badge variant={weakness.emphasis === 'urgent' ? 'destructive' : 'secondary'}>
                        {weakness.count} 次
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                    先完成一次练习或写作反馈，系统才会生成更可信的弱项图谱。
                  </div>
                )}
              </div>
              {recommendedUnit ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-4">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <Target className="h-4 w-4" />
                    <p className="text-sm font-semibold">推荐补强微课：{recommendedUnit.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">预计 {recommendedUnit.estimatedMinutes} 分钟，适合接在今天主任务之后。</p>
                  <Button variant="outline" size="sm" className="mt-3 rounded-xl" asChild>
                    <Link to="/dashboard/exam">去补强</Link>
                  </Button>
                </div>
              ) : null}
              {activityPoints.length > 0 ? (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    最近 7 天活跃度
                  </div>
                  <div className="flex items-end gap-2">
                    {activityPoints.map((point) => {
                      const barHeight = Math.max(16, Math.min(72, point.words * 6 + point.xp * 0.35));
                      return (
                        <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                          <div
                            className={cn(
                              'w-full rounded-full transition-colors',
                              point.active ? 'bg-gradient-to-t from-emerald-500 to-cyan-500' : 'bg-muted',
                            )}
                            style={{ height: `${barHeight}px` }}
                          />
                          <span className="text-[11px] text-muted-foreground">{point.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-[30px] border bg-card px-4 py-5 shadow-sm lg:px-6 lg:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Vocabulary workspace</p>
            <h2 className="mt-2 text-2xl font-semibold">先完成今天这组单词，再切到补强动作</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              新词学习仍然保留在同一页，但它现在从属于主任务，不再是整个产品唯一的入口。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="rounded-full px-3 py-1">已学会 {learnedWords.size}</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">较难 {hardWords.size}</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">收藏 {bookmarkedWords.size}</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">{Math.round(progress)}% 完成</Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[280px_1fr]">
          <Card className="rounded-[26px] border-border/70 bg-muted/35">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Current word</p>
                <h3 className="mt-2 text-2xl font-semibold text-emerald-600">{currentWord?.word}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{currentWord?.definitionZh}</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>今天进度</span>
                  <span>{currentWordIndex + 1} / {words.length}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }} />
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-600" />预计还需 {Math.max(3, (words.length - learnedWords.size) * 2)} 分钟</div>
                <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-amber-500" />较难词会自动成为后续补强依据</div>
              </div>
            </CardContent>
          </Card>

          <div>
            <AnimatePresence mode="wait">
              {currentWord ? (
                <motion.div
                  key={currentWord.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.25 }}
                >
                  <WordCard
                    word={currentWord}
                    isFlipped={flippedCards.has(currentWord.id)}
                    onFlip={() => handleFlip(currentWord.id)}
                    onMarkStatus={handleMarkStatus}
                    isLearned={learnedWords.has(currentWord.id)}
                    isHard={hardWords.has(currentWord.id)}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="mx-auto mt-6 flex max-w-md items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentWordIndex === 0}
                className="h-12 w-12 rounded-full border-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex gap-1.5 px-4">
                {words.map((word, index) => (
                  <button
                    key={word.id}
                    type="button"
                    onClick={() => {
                      setCurrentWordIndex(index);
                      setFlippedCards(new Set());
                    }}
                    className={cn(
                      'h-2.5 rounded-full transition-all duration-300',
                      index === currentWordIndex
                        ? 'w-8 bg-gradient-to-r from-emerald-500 to-cyan-500'
                        : learnedWords.has(word.id)
                          ? 'w-2.5 bg-emerald-400'
                          : hardWords.has(word.id)
                            ? 'w-2.5 bg-amber-400'
                            : 'w-2.5 bg-muted hover:bg-muted-foreground/30',
                    )}
                    title={word.word}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentWordIndex === words.length - 1}
                className="h-12 w-12 rounded-full border-2"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="mx-auto mt-6 flex max-w-md justify-center gap-3">
              <Button
                variant="outline"
                className={cn(
                  'flex-1 rounded-2xl border-2',
                  hardWords.has(currentWord?.id || '')
                    ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                    : 'hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600',
                )}
                onClick={() => handleMarkStatus('hard')}
                disabled={!currentWord || hardWords.has(currentWord.id)}
              >
                <Brain className="mr-2 h-4 w-4" />
                {hardWords.has(currentWord?.id || '') ? '已标记' : '较难'}
              </Button>
              <Button
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleMarkStatus('learned')}
                disabled={!currentWord || learnedWords.has(currentWord.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                {learnedWords.has(currentWord?.id || '') ? '已学会' : '学会'}
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl" onClick={handleBookmark} disabled={!currentWord}>
                <Bookmark className={cn('h-4 w-4', bookmarkedWords.has(currentWord?.id || '') && 'fill-current')} />
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl" onClick={handleShare} disabled={!currentWord}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {learnedWords.size === words.length && words.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[30px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-cyan-500/8 p-6 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold">今天的新词任务已完成</h3>
          <p className="mt-3 text-muted-foreground">
            你已经学完今天的 {words.length} 个单词。现在最有价值的下一步，是去补一下弱项或者清空复习压力。
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="outline" className="rounded-2xl" asChild>
              <Link to="/dashboard/review">去做复习</Link>
            </Button>
            <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link to="/dashboard/practice">做一次短练习</Link>
            </Button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

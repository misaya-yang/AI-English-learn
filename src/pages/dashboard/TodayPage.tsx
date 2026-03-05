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
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Star,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { WordData } from '@/data/words';
import { toast } from 'sonner';
import { getRecommendedUnit } from '@/data/examContent';
import { recordLearningEvent } from '@/services/learningEvents';
import { speakEnglishText } from '@/services/tts';

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

  // Use dailyWords from context
  const words = dailyWords.length > 0 ? dailyWords : [];
  const currentWord = words[currentWordIndex];
  const progress = words.length > 0 ? (learnedWords.size / words.length) * 100 : 0;
  const recommendedUnit = getRecommendedUnit(userId);

  useEffect(() => {
    // Refresh daily words when component mounts
    refreshDailyWords();
    refreshDailyMission();
  }, [refreshDailyWords, refreshDailyMission]);

  const handleFlip = (wordId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const handleMarkStatus = (status: 'learned' | 'hard') => {
    if (!currentWord) return;
    
    if (status === 'learned') {
      // Check if already learned
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
    } else if (status === 'hard') {
      // Check if already marked as hard
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
    
    // Auto advance to next word after a short delay
    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setFlippedCards(new Set());
      }
    }, 800);
  };

  const handleBookmark = () => {
    if (!currentWord) return;
    
    setBookmarkedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentWord.id)) {
        newSet.delete(currentWord.id);
        toast.info(`已取消收藏 "${currentWord.word}"`);
      } else {
        newSet.add(currentWord.id);
        toast.success(`已收藏 "${currentWord.word}"`);
      }
      return newSet;
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
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('已复制到剪贴板');
    }
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

  // Show generate button if no words
  if (words.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-12 w-12 text-emerald-600" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-2 text-emerald-600">准备好开始学习了吗？</h2>
        <p className="text-muted-foreground mb-2 text-lg">
          {activeBook
            ? `当前词书：${activeBook.name}`
            : '请先选择词书，再开始每日学习'}
        </p>
        <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
          每天只需 10-15 分钟，轻松积累词汇量
        </p>
        {activeBook ? (
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-card px-8 py-6 text-lg transition-all hover:scale-105"
            onClick={refreshDailyWords}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            生成今日单词
          </Button>
        ) : (
          <Link to="/dashboard/vocabulary">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-card px-8 py-6 text-lg transition-all hover:scale-105"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              去选择词书
            </Button>
          </Link>
        )}
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-600">
              今日单词
            </h1>
            <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">
                当前词书：{activeBook?.name || '未选择'}
              </Badge>
              <Badge variant="outline">
                今日词量：{words.length} / {activeBookSummary.dailyGoal}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{learnedWords.size} / {words.length}</p>
              <p className="text-xs text-muted-foreground">已学习</p>
            </div>
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                  className="text-emerald-500 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {activeBookSummary.isNearlyCompleted && (
          <p className="text-sm text-amber-600 mt-3">
            当前词书已接近学完，建议切换词书或导入新词书。
          </p>
        )}
        {recommendedUnit && (
          <Card className="mt-4 border-emerald-200 dark:border-emerald-800">
            <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">AI 推荐补强微课：{recommendedUnit.title}</p>
                <p className="text-xs text-muted-foreground">
                  预计 {recommendedUnit.estimatedMinutes} 分钟，针对近期高频错因
                </p>
              </div>
              <Link to="/dashboard/exam">
                <Button size="sm" variant="outline">
                  去练习
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        {dailyMission && (
          <Card className="mt-4 border-blue-200 dark:border-blue-800">
            <CardContent className="py-3 px-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">今日任务 · {dailyMission.estimatedMinutes} 分钟</p>
                <Badge variant="outline">{dailyMission.status}</Badge>
              </div>
              <div className="space-y-1">
                {dailyMission.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-xs">
                    <span className={cn(task.done && 'line-through text-muted-foreground')}>
                      {task.titleZh}
                    </span>
                    {!task.done && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => completeMissionTask(task.id)}
                      >
                        完成
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Word Card */}
      <AnimatePresence mode="wait">
        {currentWord && (
          <motion.div 
            className="mb-6"
            key={currentWord.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
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
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div 
        className="flex items-center justify-between max-w-md mx-auto mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentWordIndex === 0}
          className="h-12 w-12 rounded-full border-2 hover:bg-emerald-50 hover:border-emerald-500 transition-all disabled:opacity-30"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div className="flex gap-1.5 px-4">
          {words.map((word, index) => (
            <motion.button
              key={word.id}
              onClick={() => {
                setCurrentWordIndex(index);
                setFlippedCards(new Set());
              }}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                index === currentWordIndex
                  ? 'w-8 bg-gradient-to-r from-emerald-500 to-teal-500'
                  : learnedWords.has(word.id)
                  ? 'w-2.5 bg-emerald-400'
                  : hardWords.has(word.id)
                  ? 'w-2.5 bg-amber-400'
                  : 'w-2.5 bg-muted hover:bg-muted-foreground/30'
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title={word.word}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentWordIndex === words.length - 1}
          className="h-12 w-12 rounded-full border-2 hover:bg-emerald-50 hover:border-emerald-500 transition-all disabled:opacity-30"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="flex justify-center gap-3 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="outline"
          className={cn(
            "flex-1 h-12 rounded-xl border-2 transition-all",
            hardWords.has(currentWord?.id || '')
              ? "bg-amber-50 border-amber-400 text-amber-600"
              : "hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600"
          )}
          onClick={() => handleMarkStatus('hard')}
          disabled={!currentWord || hardWords.has(currentWord.id)}
        >
          <Brain className="h-5 w-5 mr-2" />
          {hardWords.has(currentWord?.id || '') ? '已标记' : '较难'}
        </Button>
        <Button
          variant="default"
          className={cn(
            "flex-1 h-12 rounded-xl shadow-lg transition-all",
            learnedWords.has(currentWord?.id || '')
              ? "bg-emerald-600"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
          )}
          onClick={() => handleMarkStatus('learned')}
          disabled={!currentWord || learnedWords.has(currentWord.id)}
        >
          <Check className="h-5 w-5 mr-2" />
          {learnedWords.has(currentWord?.id || '') ? '已学会' : '学会'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-12 w-12 rounded-xl border-2 transition-all",
            bookmarkedWords.has(currentWord?.id || '')
              ? "bg-blue-50 border-blue-400 text-blue-600"
              : "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600"
          )}
          onClick={handleBookmark}
          disabled={!currentWord}
        >
          <Bookmark className={cn(
            "h-5 w-5",
            bookmarkedWords.has(currentWord?.id || '') && "fill-current"
          )} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-xl border-2 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-600 transition-all"
          onClick={handleShare}
          disabled={!currentWord}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Stats summary */}
      <motion.div 
        className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
          <p className="text-2xl font-bold text-emerald-600">{learnedWords.size}</p>
          <p className="text-xs text-muted-foreground">已学会</p>
        </div>
        <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
          <p className="text-2xl font-bold text-amber-600">{hardWords.size}</p>
          <p className="text-xs text-muted-foreground">需复习</p>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-2xl font-bold text-blue-600">{bookmarkedWords.size}</p>
          <p className="text-xs text-muted-foreground">已收藏</p>
        </div>
      </motion.div>

      {/* Completion message */}
      {learnedWords.size === words.length && words.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mt-8 text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800"
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-card"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2 text-emerald-600">太棒了! 🎉</h3>
          <p className="text-muted-foreground mb-6">
            您今天已学习所有 {words.length} 个单词！
            <br />
            <span className="text-sm">继续保持，积少成多！</span>
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentWordIndex(0);
                setFlippedCards(new Set());
              }}
              className="rounded-xl border-2 hover:bg-emerald-100 hover:border-emerald-400 transition-all"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              再次复习
            </Button>
            <Button
              variant="default"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setLearnedWords(new Set());
                setHardWords(new Set());
                setCurrentWordIndex(0);
                toast.success('进度已重置');
              }}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              重新学习
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RotateCcw,
  Volume2,
  Check,
  X,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { WordData } from '@/data/words';

interface ReviewItem {
  wordId: string;
  word: WordData;
  reviewCount: number;
  easeFactor: number;
  nextReview: string | null;
}

interface ReviewCardProps {
  item: ReviewItem;
  isRevealed: boolean;
  onReveal: () => void;
}

function ReviewCard({ item, isRevealed, onReveal }: ReviewCardProps) {
  const { word } = item;

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-gradient-to-br from-card to-muted/30 border-2 border-transparent hover:border-emerald-500/20 transition-all">
      <CardContent className="p-6">
        {!isRevealed ? (
          <motion.div 
            className="text-center py-12 cursor-pointer"
            onClick={onReveal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              {word.level} • 第 {item.reviewCount + 1} 次复习
            </Badge>
            <h2 className="text-5xl font-bold mb-4 text-emerald-600">
              {word.word}
            </h2>
            <p className="text-lg text-muted-foreground mb-4 font-mono">
              {word.partOfSpeech} • {word.phonetic}
            </p>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-14 w-14 mb-6 border-2 hover:bg-emerald-50 hover:border-emerald-500 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                playAudio(word.word);
              }}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              点击任意位置显示答案
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">{word.word}</h2>
              <Button variant="ghost" size="icon" onClick={() => playAudio(word.word)}>
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Definition / 定义</h3>
              <p className="text-sm">{word.definition}</p>
              <p className="text-sm text-muted-foreground">{word.definitionZh}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Example / 例句</h3>
              <p className="text-sm">{word.examples[0]?.en}</p>
              <p className="text-sm text-muted-foreground">
                {word.examples[0]?.zh}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {word.synonyms.slice(0, 5).map((syn) => (
                <Badge key={syn} variant="secondary">
                  {syn}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReviewPage() {
  const { dailyWords, reviewWord, dueWords } = useUserData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

  // Build review items from dueWords and dailyWords
  useEffect(() => {
    const items: ReviewItem[] = [];
    
    // Add due words from progress
    dueWords.forEach((dueWord) => {
      const word = dailyWords.find(w => w.id === dueWord.wordId);
      if (word) {
        items.push({
          wordId: dueWord.wordId,
          word,
          reviewCount: dueWord.reviewCount,
          easeFactor: dueWord.easeFactor,
          nextReview: dueWord.nextReview,
        });
      }
    });
    
    // If no due words, use some daily words for practice
    if (items.length === 0 && dailyWords.length > 0) {
      dailyWords.slice(0, 5).forEach((word) => {
        items.push({
          wordId: word.id,
          word,
          reviewCount: 0,
          easeFactor: 2.5,
          nextReview: null,
        });
      });
    }
    
    setReviewItems(items);
  }, [dueWords, dailyWords]);

  const currentItem = reviewItems[currentIndex];
  const progress = reviewItems.length > 0 ? ((currentIndex) / reviewItems.length) * 100 : 0;

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentItem) return;

    // Update stats
    setSessionStats((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    // Call reviewWord from context
    reviewWord(currentItem.wordId, rating);

    // Calculate next interval for display
    const intervals = {
      again: '< 1 min',
      hard: '2 days',
      good: '5 days',
      easy: '10 days',
    };

    toast.success(`+${rating === 'again' ? 3 : rating === 'hard' ? 5 : rating === 'good' ? 7 : 10} XP • Next: ${intervals[rating]}`);

    // Move to next word
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setIsComplete(false);
  };

  if (reviewItems.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div 
          className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-6 shadow-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Check className="h-12 w-12 text-emerald-600" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-2 text-emerald-600">太棒了！🎉</h2>
        <p className="text-muted-foreground mb-2 text-lg">您已完成所有复习</p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          您没有待复习的单词。明天再见！
        </p>
      </motion.div>
    );
  }

  if (isComplete) {
    const totalReviewed = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
    const accuracy = totalReviewed > 0 
      ? Math.round(((sessionStats.good + sessionStats.easy) / totalReviewed) * 100) 
      : 0;

    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 rounded-2xl border border-emerald-200"
        >
          <motion.div 
            className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-card"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          >
            <Check className="h-12 w-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2 text-emerald-600">复习完成！🎉</h2>
          <p className="text-muted-foreground mb-6">继续保持，积少成多！</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-card p-4 rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{totalReviewed}</p>
              <p className="text-sm text-muted-foreground">复习单词</p>
            </div>
            <div className="bg-white dark:bg-card p-4 rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">正确率</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm px-4">
              <span className="text-red-500 font-medium">需加强: {sessionStats.again}</span>
              <span className="text-orange-500 font-medium">较难: {sessionStats.hard}</span>
              <span className="text-emerald-500 font-medium">良好: {sessionStats.good}</span>
              <span className="text-blue-500">Easy: {sessionStats.easy}</span>
            </div>
          </div>

          <Button onClick={handleRestart} variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Review Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-600">复习模式</h1>
            <p className="text-muted-foreground text-sm">基于间隔重复算法优化记忆</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentIndex + 1} / {reviewItems.length}</p>
              <p className="text-xs text-muted-foreground">剩余</p>
            </div>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="flex justify-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-1">
          <X className="h-3 w-3 mr-1" />
          需加强 {sessionStats.again}
        </Badge>
        <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50 dark:bg-orange-900/20 px-3 py-1">
          <Zap className="h-3 w-3 mr-1" />
          较难 {sessionStats.hard}
        </Badge>
        <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1">
          <Check className="h-3 w-3 mr-1" />
          良好 {sessionStats.good}
        </Badge>
        <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20 px-3 py-1">
          <TrendingUp className="h-3 w-3 mr-1" />
          简单 {sessionStats.easy}
        </Badge>
      </motion.div>

      {/* Review Card */}
      <div className="mb-6">
        {currentItem && (
          <ReviewCard
            item={currentItem}
            isRevealed={isRevealed}
            onReveal={handleReveal}
          />
        )}
      </div>

      {/* Rating Buttons */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-3 max-w-lg mx-auto"
        >
          <Button
            variant="outline"
            className="flex flex-col items-center py-4 rounded-xl border-2 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all hover:scale-105"
            onClick={() => handleRate('again')}
          >
            <span className="text-lg font-bold text-red-600">忘记</span>
            <span className="text-xs text-muted-foreground">&lt; 1分钟</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center py-4 rounded-xl border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400 transition-all hover:scale-105"
            onClick={() => handleRate('hard')}
          >
            <span className="text-lg font-bold text-orange-600">较难</span>
            <span className="text-xs text-muted-foreground">2天后</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center py-4 rounded-xl border-2 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 transition-all hover:scale-105"
            onClick={() => handleRate('good')}
          >
            <span className="text-lg font-bold text-emerald-600">良好</span>
            <span className="text-xs text-muted-foreground">5d</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center py-4 rounded-xl border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all hover:scale-105"
            onClick={() => handleRate('easy')}
          >
            <span className="text-lg font-bold text-blue-600">简单</span>
            <span className="text-xs text-muted-foreground">10天后</span>
          </Button>
        </motion.div>
      )}

      {/* Instructions */}
      {!isRevealed && (
        <motion.p 
          className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          在显示答案前，先试着回想意思
        </motion.p>
      )}
    </div>
  );
}

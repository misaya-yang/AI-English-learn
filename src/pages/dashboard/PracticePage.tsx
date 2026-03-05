import { useState, useEffect } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  HelpCircle,
  Check,
  X,
  Lightbulb,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  PenTool,
  Headphones,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { WordData } from '@/data/words';
import type { AiFeedback } from '@/types/examContent';
import { getContentItemsByUnit, getContentUnits, getQuotaSnapshot, saveAiFeedbackRecord, saveItemAttempt } from '@/data/examContent';
import { consumeExamFeatureQuota, createAttempt, gradeIeltsWriting } from '@/services/aiExamCoach';
import { recordLearningEvent } from '@/services/learningEvents';
import { speakEnglishText } from '@/services/tts';

// Quiz question types
interface QuizQuestion {
  id: string;
  word: WordData;
  question: string;
  questionZh: string;
  options: string[];
  correctAnswer: string;
  type: 'multiple_choice' | 'fill_blank';
}

// Generate quiz questions from words
const generateQuizQuestions = (words: WordData[], mode: 'quiz' | 'fill_blank'): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  
  words.forEach((word, index) => {
    const otherWords = words.filter(w => w.id !== word.id);
    
    if (mode === 'quiz') {
      // Multiple choice question - definition
      const distractors = otherWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.definition);
      
      questions.push({
        id: `mc-${index}`,
        word,
        question: `What does "${word.word}" mean?`,
        questionZh: `"${word.word}" 是什么意思？`,
        options: [word.definition, ...distractors].sort(() => 0.5 - Math.random()),
        correctAnswer: word.definition,
        type: 'multiple_choice',
      });
    } else if (mode === 'fill_blank') {
      // Fill in the blank question (if we have example sentences)
      if (word.examples.length > 0) {
        const example = word.examples[0];
        const blankedSentence = example.en.replace(
          new RegExp(`\\b${word.word}\\b`, 'gi'),
          '______'
        );
        
        if (blankedSentence !== example.en) {
          const distractorWords = otherWords
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.word);
          
          questions.push({
            id: `fb-${index}`,
            word,
            question: `Complete: "${blankedSentence}"`,
            questionZh: `填空: "${example.zh}"`,
            options: [word.word, ...distractorWords].sort(() => 0.5 - Math.random()),
            correctAnswer: word.word,
            type: 'fill_blank',
          });
        }
      }
    }
  });
  
  return questions.slice(0, 10); // Limit to 10 questions
};

const practiceModes = [
  {
    id: 'quiz',
    name: 'Multiple Choice',
    nameZh: '选择题',
    description: 'Test your knowledge with multiple choice questions',
    icon: HelpCircle,
    color: 'bg-blue-500',
  },
  {
    id: 'fill_blank',
    name: 'Fill in the Blank',
    nameZh: '填空题',
    description: 'Complete sentences with the correct word',
    icon: PenTool,
    color: 'bg-purple-500',
  },
  {
    id: 'listening',
    name: 'Listening Quiz',
    nameZh: '听力测验',
    description: 'Listen and identify the correct word',
    icon: Headphones,
    color: 'bg-pink-500',
  },
  {
    id: 'writing',
    name: 'Writing Practice',
    nameZh: '写作练习',
    description: 'Write sentences and get AI feedback',
    icon: Zap,
    color: 'bg-emerald-500',
  },
];

export default function PracticePage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const { dailyWords, addStudySession, completeMissionTask } = useUserData();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState<AiFeedback | null>(null);
  const [writingPrompt, setWritingPrompt] = useState('');
  const [writingTaskType, setWritingTaskType] = useState<'task1' | 'task2'>('task2');
  const [writingItemId, setWritingItemId] = useState('practice_ielts_manual');
  const [feedbackQuotaRemaining, setFeedbackQuotaRemaining] = useState<number | null>(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [isWritingSubmitting, setIsWritingSubmitting] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Generate quiz questions when mode is selected
  useEffect(() => {
    let cancelled = false;

    if (selectedMode === 'quiz' || selectedMode === 'fill_blank') {
      const questions = generateQuizQuestions(dailyWords, selectedMode);
      setQuizQuestions(questions);
    }

    if (selectedMode === 'writing') {
      const writingUnits = getContentUnits({ examType: 'IELTS', skill: 'writing' });
      const firstUnit = writingUnits[0];
      const firstItem = firstUnit ? getContentItemsByUnit(firstUnit.id)[0] : null;
      if (firstItem) {
        setWritingPrompt(firstItem.prompt);
        setWritingTaskType(firstItem.itemType === 'writing_task_1' ? 'task1' : 'task2');
        setWritingItemId(firstItem.id);
      } else {
        setWritingPrompt(
          'Some people think governments should invest more in public transport than in building new roads. To what extent do you agree or disagree?',
        );
        setWritingTaskType('task2');
        setWritingItemId('practice_ielts_manual');
      }

      setIsQuotaLoading(true);
      setFeedbackQuotaRemaining(null);

      void getQuotaSnapshot(userId)
        .then((snapshot) => {
          if (cancelled) return;
          setFeedbackQuotaRemaining(snapshot.remaining.aiAdvancedFeedbackPerDay);
        })
        .catch(() => {
          if (cancelled) return;
          setFeedbackQuotaRemaining(0);
          toast.error('Failed to load quota, please retry.');
        })
        .finally(() => {
          if (cancelled) return;
          setIsQuotaLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [selectedMode, dailyWords, userId]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = quizQuestions.length > 0 ? ((currentQuestionIndex) / quizQuestions.length) * 100 : 0;

  const handleAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowResult(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success('Correct! +10 XP');
    } else {
      toast.error('Incorrect. Try again!');
    }

    void recordLearningEvent({
      userId,
      eventName: 'practice.quiz_submitted',
      payload: {
        mode: selectedMode || 'quiz',
        isCorrect,
        questionId: currentQuestion.id,
        word: currentQuestion.word.word,
      },
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      // Record study session
      addStudySession(quizQuestions.length, score, score * 10, 15);
      completeMissionTask('task_quiz_today');
    }
  };

  const handleWritingSubmit = async () => {
    if (isWritingSubmitting) return;

    if (isQuotaLoading || feedbackQuotaRemaining === null) {
      toast.info('Loading quota status, please wait a moment.');
      return;
    }

    if (feedbackQuotaRemaining <= 0) {
      toast.error('Today AI writing feedback quota is exhausted. Upgrade to Pro or try tomorrow.');
      return;
    }

    if (!writingInput.trim()) {
      toast.error('Please write a sentence first');
      return;
    }

    if (!writingPrompt.trim()) {
      toast.error('Please provide an IELTS prompt first');
      return;
    }

    setIsWritingSubmitting(true);
    try {
      const quotaResult = await consumeExamFeatureQuota(userId, 'aiAdvancedFeedbackPerDay');
      if (!quotaResult.allowed) {
        setFeedbackQuotaRemaining(quotaResult.remaining);
        toast.error('Today AI writing feedback quota is exhausted. Upgrade to Pro or try tomorrow.');
        return;
      }

      const attempt = createAttempt({
        userId,
        itemId: writingItemId,
        answer: writingInput.trim(),
        skill: 'writing',
      });
      saveItemAttempt(attempt);

      const feedback = await gradeIeltsWriting({
        userId,
        attemptId: attempt.id,
        prompt: writingPrompt,
        answer: writingInput.trim(),
        taskType: writingTaskType,
      });

      saveAiFeedbackRecord(userId, feedback);
      setWritingFeedback(feedback);
      setFeedbackQuotaRemaining(quotaResult.remaining);

      const earnedXp = feedback.scores.overallBand >= 6 ? 20 : 12;
      addStudySession(1, feedback.scores.overallBand >= 6 ? 1 : 0, earnedXp, 8);
      completeMissionTask('task_review_today');

      void recordLearningEvent({
        userId,
        eventName: 'practice.writing_submitted',
        payload: {
          itemId: writingItemId,
          taskType: writingTaskType,
          overallBand: feedback.scores.overallBand,
          issues: feedback.issues.map((issue) => issue.tag),
        },
      });
      toast.success(`AI feedback ready. Overall band ${feedback.scores.overallBand}`);
    } finally {
      setIsWritingSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
    setWritingInput('');
    setWritingFeedback(null);
    setQuizQuestions([]);
  };

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  if (!selectedMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Practice</h1>
          <p className="text-muted-foreground">练习 • Choose a practice mode</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {practiceModes.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode(mode.id)}
              className="text-left"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${mode.color} rounded-lg flex items-center justify-center mb-4`}>
                    <mode.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{mode.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{mode.nameZh}</p>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (selectedMode === 'writing') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">IELTS Writing Coach</h1>
            <p className="text-muted-foreground">写作练习（结构化评分反馈）</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              AI feedback left: {isQuotaLoading || feedbackQuotaRemaining === null ? '...' : feedbackQuotaRemaining}
            </Badge>
            <Button variant="outline" onClick={() => setSelectedMode(null)}>
              Back to Modes
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-3 mb-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Task Type</Label>
                  <Select value={writingTaskType} onValueChange={(value: 'task1' | 'task2') => setWritingTaskType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task1">Task 1</SelectItem>
                      <SelectItem value="task2">Task 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Prompt</Label>
                <Textarea
                  value={writingPrompt}
                  onChange={(e) => setWritingPrompt(e.target.value)}
                  className="min-h-[110px]"
                />
              </div>
            </div>

            <Textarea
              value={writingInput}
              onChange={(e) => setWritingInput(e.target.value)}
              placeholder="Write your IELTS response here..."
              className="min-h-[160px] mb-4"
            />

            {!writingFeedback ? (
              <Button
                onClick={handleWritingSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={
                  isWritingSubmitting ||
                  isQuotaLoading ||
                  feedbackQuotaRemaining === null ||
                  feedbackQuotaRemaining <= 0
                }
              >
                <Zap className="h-4 w-4 mr-2" />
                {isQuotaLoading
                  ? 'Loading quota...'
                  : isWritingSubmitting
                    ? 'Generating feedback...'
                    : feedbackQuotaRemaining !== null && feedbackQuotaRemaining <= 0
                      ? 'Quota exhausted today'
                      : 'Get IELTS AI Feedback'}
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted p-4 rounded-lg"
              >
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  AI Feedback
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  <div className="rounded border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Task</p>
                    <p className="font-semibold">{writingFeedback.scores.taskResponse.toFixed(1)}</p>
                  </div>
                  <div className="rounded border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Coherence</p>
                    <p className="font-semibold">{writingFeedback.scores.coherenceCohesion.toFixed(1)}</p>
                  </div>
                  <div className="rounded border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Lexical</p>
                    <p className="font-semibold">{writingFeedback.scores.lexicalResource.toFixed(1)}</p>
                  </div>
                  <div className="rounded border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Grammar</p>
                    <p className="font-semibold">{writingFeedback.scores.grammaticalRangeAccuracy.toFixed(1)}</p>
                  </div>
                  <div className="rounded border p-2 text-center border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/10">
                    <p className="text-xs text-muted-foreground">Overall</p>
                    <p className="font-semibold">{writingFeedback.scores.overallBand.toFixed(1)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {writingFeedback.issues.map((issue, index) => (
                    <div key={`${issue.tag}-${index}`} className="rounded border p-2">
                      <p className="text-sm font-medium">{issue.message}</p>
                      <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={handleRestart} variant="outline" className="mt-4 w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Another
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedMode === 'listening') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Listening Quiz</h1>
            <p className="text-muted-foreground">听力测验</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedMode(null)}>
            Back to Modes
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Headphones className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Listening Practice</h3>
              <p className="text-muted-foreground mb-6">
                Click the play button to hear a word, then type what you hear.
              </p>
              
              {dailyWords.length > 0 && (
                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => playAudio(dailyWords[0].word)}
                  >
                    <Headphones className="h-5 w-5 mr-2" />
                    Play Word
                  </Button>
                  
                  <div className="max-w-sm mx-auto">
                    <input
                      type="text"
                      placeholder="Type what you hear..."
                      className="w-full p-3 border rounded-lg text-center"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success('Great effort! The word was: ' + dailyWords[0].word);
                    }}
                  >
                    Check Answer
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const accuracy = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Practice Complete! 🎉</h2>
          <p className="text-muted-foreground mb-6">练习完成！</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-card p-4 rounded-lg">
              <p className="text-3xl font-bold text-emerald-600">{score}/{quizQuestions.length}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="bg-white dark:bg-card p-4 rounded-lg">
              <p className="text-3xl font-bold text-emerald-600">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRestart} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => setSelectedMode(null)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Other Modes
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">No words available</h3>
        <p className="text-muted-foreground mb-4">Please learn some words first</p>
        <Button variant="outline" onClick={() => setSelectedMode(null)}>
          Back to Modes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {practiceModes.find((m) => m.id === selectedMode)?.name}
          </h1>
          <p className="text-muted-foreground">
            {practiceModes.find((m) => m.id === selectedMode)?.nameZh}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSelectedMode(null)}>
          Back
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              {currentQuestion?.word.word}
            </Badge>
            <h3 className="text-xl font-medium mb-2">{currentQuestion?.question}</h3>
            <p className="text-muted-foreground">{currentQuestion?.questionZh}</p>
          </div>

          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={setSelectedAnswer}
            disabled={showResult}
            className="space-y-3"
          >
            {currentQuestion?.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-lg border-2 transition-all',
                  showResult && option === currentQuestion.correctAnswer
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : selectedAnswer === option
                    ? 'border-emerald-500'
                    : 'border-border hover:border-emerald-200'
                )}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
                {showResult && option === currentQuestion.correctAnswer && (
                  <Check className="h-5 w-5 text-emerald-500" />
                )}
                {showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </RadioGroup>

          <div className="mt-6">
            {!showResult ? (
              <Button
                onClick={handleAnswer}
                disabled={!selectedAnswer}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full">
                Next Question
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

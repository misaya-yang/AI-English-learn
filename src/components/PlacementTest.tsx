import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CEFRLevel } from '@/types';

interface PlacementQuestion {
  id: number;
  level: CEFRLevel;
  sentence: string;
  options: string[];
  correct: number; // index
}

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // A1 questions
  {
    id: 1, level: 'A1',
    sentence: 'She ___ a student.',
    options: ['is', 'are', 'am', 'be'],
    correct: 0,
  },
  {
    id: 2, level: 'A1',
    sentence: 'I ___ coffee every morning.',
    options: ['drinks', 'drink', 'drinking', 'drank'],
    correct: 1,
  },
  // A2 questions
  {
    id: 3, level: 'A2',
    sentence: 'He has ___ to Paris twice.',
    options: ['go', 'went', 'been', 'going'],
    correct: 2,
  },
  {
    id: 4, level: 'A2',
    sentence: 'If it rains, I ___ stay home.',
    options: ['will', 'would', 'do', 'am'],
    correct: 0,
  },
  // B1 questions
  {
    id: 5, level: 'B1',
    sentence: 'She suggested ___ the meeting to Friday.',
    options: ['to move', 'moving', 'move', 'moved'],
    correct: 1,
  },
  {
    id: 6, level: 'B1',
    sentence: 'By the time we arrived, the movie ___.',
    options: ['started', 'has started', 'had started', 'starts'],
    correct: 2,
  },
  // B2 questions
  {
    id: 7, level: 'B2',
    sentence: 'Not only ___ the exam, but she also got the highest score.',
    options: ['she passed', 'did she pass', 'she did pass', 'passed she'],
    correct: 1,
  },
  {
    id: 8, level: 'B2',
    sentence: 'The project is expected to ___ by the end of the quarter.',
    options: ['be completing', 'have been completed', 'be completed', 'complete'],
    correct: 2,
  },
  // C1 questions
  {
    id: 9, level: 'C1',
    sentence: 'Hardly had she entered the room ___ the phone rang.',
    options: ['when', 'than', 'that', 'then'],
    correct: 0,
  },
  {
    id: 10, level: 'C1',
    sentence: '___ the circumstances, I think we handled it well.',
    options: ['Given', 'Giving', 'Being given', 'Having given'],
    correct: 0,
  },
];

function calculateLevel(answers: boolean[]): CEFRLevel {
  // Count correct by level bracket
  const a1 = answers.slice(0, 2).filter(Boolean).length;
  const a2 = answers.slice(2, 4).filter(Boolean).length;
  const b1 = answers.slice(4, 6).filter(Boolean).length;
  const b2 = answers.slice(6, 8).filter(Boolean).length;
  const c1 = answers.slice(8, 10).filter(Boolean).length;

  // Highest level where user gets at least 1/2 correct
  if (c1 >= 1) return 'C1';
  if (b2 >= 1) return 'B2';
  if (b1 >= 1) return 'B1';
  if (a2 >= 1) return 'A2';
  if (a1 >= 1) return 'A1';
  return 'A1';
}

interface PlacementTestProps {
  onComplete: (level: CEFRLevel) => void;
  onSkip: () => void;
}

export function PlacementTest({ onComplete, onSkip }: PlacementTestProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const question = PLACEMENT_QUESTIONS[current];
  const progress = ((current + (revealed ? 1 : 0)) / PLACEMENT_QUESTIONS.length) * 100;

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
  };

  const handleConfirm = () => {
    if (selected === null) return;

    if (!revealed) {
      setRevealed(true);
      return;
    }

    const isCorrect = selected === question.correct;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (current < PLACEMENT_QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const level = calculateLevel(answers);
    const correctCount = answers.filter(Boolean).length;

    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-md border border-border bg-muted">
          <span className="text-2xl font-bold text-primary">{level}</span>
        </div>
        <div>
          <h2 className="mb-2 text-xl font-semibold">{isZh ? '测试完成' : 'Done'}</h2>
          <p className="text-muted-foreground">
            {isZh
              ? `答对 ${correctCount}/${PLACEMENT_QUESTIONS.length} 题`
              : `${correctCount}/${PLACEMENT_QUESTIONS.length} correct`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isZh ? '当前水平' : 'Level'}: <strong>{level}</strong>
          </p>
        </div>
        <Button
          onClick={() => onComplete(level)}
          className="w-full"
        >
          {isZh ? '使用这个水平' : 'Use this level'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold">
          {isZh ? '快速水平测试' : 'Quick level check'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {current + 1} / {PLACEMENT_QUESTIONS.length}
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <Badge variant="secondary" className="text-xs">
        {question.level}
      </Badge>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-lg font-medium">{question.sentence}</p>
      </div>

      <div className="grid gap-2">
        {question.options.map((option, i) => {
          let variant: 'default' | 'correct' | 'wrong' | 'idle' = 'idle';
          if (revealed) {
            if (i === question.correct) variant = 'correct';
            else if (i === selected) variant = 'wrong';
          } else if (i === selected) {
            variant = 'default';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left text-sm',
                variant === 'idle' && 'border-border hover:border-primary/40',
                variant === 'default' && 'border-primary bg-primary/10',
                variant === 'correct' && 'border-[hsl(var(--success)/0.52)] bg-[hsl(var(--success)/0.12)]',
                variant === 'wrong' && 'border-[hsl(var(--danger)/0.52)] bg-[hsl(var(--danger)/0.10)]',
              )}
            >
              <span className="flex-1">{option}</span>
              {revealed && i === question.correct && <Check className="h-4 w-4 text-[hsl(var(--success))]" />}
              {revealed && i === selected && i !== question.correct && <X className="h-4 w-4 text-[hsl(var(--danger))]" />}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onSkip} className="flex-1">
          {isZh ? '跳过' : 'Skip'}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selected === null}
          className="flex-1"
        >
          {revealed ? (isZh ? '下一题' : 'Next') : (isZh ? '确认' : 'Check')}
        </Button>
      </div>
    </div>
  );
}

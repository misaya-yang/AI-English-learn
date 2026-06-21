/**
 * ListeningPage — IELTS Academic Listening module
 * ──────────────────────────────────────────────────────────────────
 * Three phases: select → listening → review
 * Seed data: 3 passages with transcripts + questions
 * Audio: browser SpeechSynthesis (TTS) for prototype; swap for Supabase Storage URLs in prod
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Headphones,
  Clock,
  Volume2,
  VolumeX,
  BookOpen,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { recordLearningEvent } from '@/services/learningEvents';
import { incrementReviewCount } from '@/services/gamification';
import { toast } from 'sonner';
import { LearningCompletionState } from '@/features/learning/components/LearningWorkspace';

// ─── Types ───────────────────────────────────────────────────────────────────

type QuestionType = 'mcq' | 'fill_blank' | 'short_answer' | 'matching';
type CEFRLevel = 'B1' | 'B2' | 'C1';

interface ListeningQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];          // MCQ
  matchLeft?: string[];        // Matching — left side items
  matchRight?: string[];       // Matching — right side options
  answer: string | string[];   // correct answer(s)
  explanation: string;
}

interface ListeningPassage {
  id: string;
  title: string;
  subtitle: string;
  level: CEFRLevel;
  topic: string;
  durationLabel: string;      // e.g. "~90 seconds"
  transcript: string;         // full text for TTS
  questions: ListeningQuestion[];
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_PASSAGES: ListeningPassage[] = [
  {
    id: 'listening-001',
    title: 'Urban Green Spaces',
    subtitle: 'A lecture excerpt on the psychological benefits of parks in cities',
    level: 'B2',
    topic: 'Environment & Society',
    durationLabel: '~90 sec',
    transcript: `Welcome to today's lecture on urban planning. We'll be focusing specifically on green spaces in modern cities and why they matter beyond aesthetics.

Research consistently shows that exposure to green spaces reduces cortisol, the primary stress hormone, by up to 20 percent in urban residents. This effect is not merely psychological. Studies using brain imaging confirm that walking through a park, even for just 20 minutes, lowers activity in the prefrontal cortex region associated with repetitive negative thinking.

But the benefits extend beyond individual wellbeing. Neighbourhoods with more parks show measurably lower crime rates, roughly 15 percent on average according to a 2022 meta-analysis. Researchers attribute this partly to increased social cohesion. When people gather in shared green spaces, they develop informal community bonds.

From an economic standpoint, properties within 300 metres of a park command a premium of approximately 8 to 12 percent in most major cities. Municipalities that invest in green infrastructure therefore see returns through higher property tax revenues.

There is, however, an equity concern. High-quality parks are disproportionately located in wealthier districts. This phenomenon, sometimes called "green gentrification," can paradoxically displace the lower-income residents who would benefit most from improved green access.

To summarise: green spaces offer documented psychological, social, economic, and environmental benefits, but their distribution remains deeply unequal.`,
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'According to the lecture, walking through a park for 20 minutes affects which part of the brain?',
        options: [
          'A. The hippocampus',
          'B. The prefrontal cortex',
          'C. The amygdala',
          'D. The cerebellum',
        ],
        answer: 'B',
        explanation: 'The speaker states that walking through a park lowers activity in "the prefrontal cortex region associated with repetitive negative thinking."',
      },
      {
        id: 2,
        type: 'fill_blank',
        question: 'Neighbourhoods with more parks show roughly ___ % lower crime rates on average.',
        answer: '15',
        explanation: 'The lecturer cites "roughly 15 percent on average according to a 2022 meta-analysis."',
      },
      {
        id: 3,
        type: 'mcq',
        question: 'What economic benefit do parks provide to municipalities?',
        options: [
          'A. Reduced policing costs',
          'B. Tourism revenue',
          'C. Higher property tax revenues',
          'D. Reduced healthcare spending',
        ],
        answer: 'C',
        explanation: 'The lecturer explains that higher property values near parks translate into "higher property tax revenues" for municipalities.',
      },
      {
        id: 4,
        type: 'short_answer',
        question: 'What term does the speaker use to describe the displacement of low-income residents by park improvements?',
        answer: 'green gentrification',
        explanation: 'The speaker introduces the phrase "green gentrification" to describe this phenomenon.',
      },
      {
        id: 5,
        type: 'mcq',
        question: 'By how much can green space exposure reduce cortisol levels?',
        options: [
          'A. Up to 10 percent',
          'B. Up to 15 percent',
          'C. Up to 20 percent',
          'D. Up to 25 percent',
        ],
        answer: 'C',
        explanation: 'The lecturer states that green space exposure "reduces cortisol by up to 20 percent in urban residents."',
      },
    ],
  },
  {
    id: 'listening-002',
    title: 'The Science of Sleep',
    subtitle: 'An interview excerpt with a sleep researcher',
    level: 'B1',
    topic: 'Health & Science',
    durationLabel: '~80 sec',
    transcript: `Interviewer: Can you explain why sleep is so important for memory?

Researcher: Absolutely. When we sleep, the brain goes through a process called memory consolidation. During deep sleep, also known as slow-wave sleep, the brain replays the day's experiences and transfers important information from short-term to long-term memory. Think of it like saving files from your temporary storage to your hard drive.

Interviewer: And what happens if we don't get enough sleep?

Researcher: The effects are quite serious. First, cognitive performance drops significantly. Reaction times slow, concentration falters, and decision-making becomes impaired. After just one night of poor sleep, test scores can decline by as much as 30 percent in some studies.

Interviewer: What about dreams? Do they serve a purpose?

Researcher: Yes, particularly REM sleep, rapid eye movement sleep, which is when most vivid dreaming occurs. During REM, the brain processes emotional memories and appears to practise creative problem-solving. Some researchers believe REM sleep is when the brain makes novel connections between disparate pieces of information, essentially the biological basis of insight and creativity.

Interviewer: How many hours of sleep do adults actually need?

Researcher: Most adults require between 7 and 9 hours per night. Consistently sleeping fewer than 6 hours is associated with elevated risks of cardiovascular disease, metabolic disorders, and compromised immune function.`,
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the process called when the brain transfers information from short-term to long-term memory during sleep?',
        options: [
          'A. Neural pruning',
          'B. Memory consolidation',
          'C. Synaptic reinforcement',
          'D. Cognitive mapping',
        ],
        answer: 'B',
        explanation: 'The researcher explicitly names this process "memory consolidation."',
      },
      {
        id: 2,
        type: 'fill_blank',
        question: 'After one night of poor sleep, test scores can decline by as much as ___ percent.',
        answer: '30',
        explanation: 'The researcher states "test scores can decline by as much as 30 percent in some studies."',
      },
      {
        id: 3,
        type: 'mcq',
        question: 'During which type of sleep does most vivid dreaming occur?',
        options: [
          'A. Slow-wave sleep',
          'B. Light sleep',
          'C. REM sleep',
          'D. Deep sleep',
        ],
        answer: 'C',
        explanation: 'The researcher explains that REM (rapid eye movement) sleep is "when most vivid dreaming occurs."',
      },
      {
        id: 4,
        type: 'short_answer',
        question: 'According to the researcher, consistently sleeping fewer than how many hours is associated with health risks? (write the number)',
        answer: '6',
        explanation: 'The researcher states "Consistently sleeping fewer than 6 hours is associated with elevated risks."',
      },
    ],
  },
  {
    id: 'listening-003',
    title: 'Artificial Intelligence in Healthcare',
    subtitle: 'A seminar presentation on diagnostic AI systems',
    level: 'C1',
    topic: 'Technology & Medicine',
    durationLabel: '~2 min',
    transcript: `Good afternoon. Today I want to address a question that's generating considerable debate in medical circles: should we trust artificial intelligence to diagnose disease?

The case for AI diagnostics is compelling. In radiology, deep learning models have achieved diagnostic accuracy for certain conditions, particularly early-stage diabetic retinopathy and some forms of lung cancer, that matches or exceeds specialist physicians. A landmark 2019 study published in Nature demonstrated that an AI system could detect breast cancer from mammograms with greater sensitivity and fewer false positives than radiologists.

However, the deployment of these systems is not without risk. A critical concern is algorithmic bias. Many AI training datasets are heavily skewed toward data from Western, predominantly white populations. When these systems are applied to more diverse patient groups, accuracy can drop substantially. One study found a 10 percentage point accuracy gap when a dermatology AI was tested on darker skin tones compared to lighter ones.

There is also the problem of explainability. Most high-performing AI diagnostic tools are what we call "black boxes": they provide an output, such as a diagnosis probability, without explaining their reasoning. This creates serious issues for clinical integration. Physicians are understandably reluctant to act on a recommendation they cannot interrogate or verify.

The regulatory landscape is evolving rapidly. In the United States, the FDA has approved over 500 AI-enabled medical devices as of 2023. But post-market surveillance, monitoring how these systems perform after deployment, remains inadequate.

My position is this: AI should serve as a second opinion, not a replacement for clinical judgment. The technology is powerful but immature. Used thoughtfully, it could dramatically improve early detection and reduce diagnostic error. Used carelessly, it could entrench existing health inequities and erode the physician-patient relationship.`,
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What condition was highlighted in the 2019 Nature study involving AI and mammograms?',
        options: [
          'A. Lung cancer',
          'B. Diabetic retinopathy',
          'C. Breast cancer',
          'D. Skin cancer',
        ],
        answer: 'C',
        explanation: 'The speaker describes "a landmark 2019 study published in Nature" that demonstrated AI could detect breast cancer from mammograms.',
      },
      {
        id: 2,
        type: 'mcq',
        question: 'What is the speaker\'s main concern about "black box" AI systems?',
        options: [
          'A. They are too expensive to deploy',
          'B. Their reasoning cannot be interrogated or verified',
          'C. They require too much data',
          'D. They have low accuracy rates',
        ],
        answer: 'B',
        explanation: 'The speaker explains that black box systems provide output "without explaining their reasoning," which means physicians "cannot interrogate or verify" recommendations.',
      },
      {
        id: 3,
        type: 'fill_blank',
        question: 'A study found a ___ percentage point accuracy gap for a dermatology AI when tested on darker skin tones.',
        answer: '10',
        explanation: 'The speaker cites "a 10 percentage point accuracy gap when a dermatology AI was tested on darker skin tones compared to lighter ones."',
      },
      {
        id: 4,
        type: 'short_answer',
        question: 'According to the speaker, how many AI-enabled medical devices had the FDA approved as of 2023? (write the number)',
        answer: '500',
        explanation: 'The speaker states "the FDA has approved over 500 AI-enabled medical devices as of 2023."',
      },
      {
        id: 5,
        type: 'mcq',
        question: 'What is the speaker\'s overall conclusion about the role of AI in healthcare?',
        options: [
          'A. AI should replace physicians in diagnosis',
          'B. AI should be banned until bias issues are resolved',
          'C. AI should serve as a second opinion alongside clinical judgment',
          'D. AI is not yet ready for any clinical applications',
        ],
        answer: 'C',
        explanation: 'The speaker concludes: "AI should serve as a second opinion, not a replacement for clinical judgment."',
      },
    ],
  },
];

// ─── TTS Player Hook ──────────────────────────────────────────────────────────

function useTTSPlayer(transcript: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const ESTIMATED_DURATION_MS = transcript.length * 55; // ~55ms per char at normal pace

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const startProgressTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / ESTIMATED_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100 && progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }, 200);
  }, [ESTIMATED_DURATION_MS]);

  const play = useCallback(() => {
    if (!isSupported) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startProgressTimer();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = 'en-GB';

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      // Prefer a British English voice if available
      const britishVoice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
      if (britishVoice) utterance.voice = britishVoice;
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(0);
      startProgressTimer();
    };

    // Chrome loads voices asynchronously — getVoices() may return [] on first call
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        doSpeak(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    }
  }, [isSupported, isPaused, transcript, startProgressTimer]);

  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  }, [isSupported, isPlaying]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  }, [isSupported]);

  return { isPlaying, isPaused, isSupported, progress, play, pause, stop };
}

// ─── Level Badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: CEFRLevel }) {
  const cls = {
    B1: 'bg-[hsl(var(--accent-practice)/0.1)] text-[hsl(var(--accent-practice))] border-[hsl(var(--accent-practice)/0.2)]',
    B2: 'bg-info/10 text-info border-info/20',
    C1: 'bg-primary/10 text-primary border-primary/20',
  }[level];
  return (
    <span className={cn('rounded-md border px-2.5 py-0.5 text-[11px] font-semibold', cls)}>
      {level}
    </span>
  );
}

// ─── Question renderer ────────────────────────────────────────────────────────

interface QuestionCardProps {
  q: ListeningQuestion;
  index: number;
  userAnswer: string;
  onChange: (val: string) => void;
  submitted: boolean;
}

function QuestionCard({ q, index, userAnswer, onChange, submitted }: QuestionCardProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const correctAnswer = Array.isArray(q.answer) ? q.answer[0] : q.answer;
  const isCorrect = submitted
    ? userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
    : false;

  return (
    <div className={cn(
      'border-t px-1 py-4 transition-all duration-300',
      !submitted
        ? 'border-border/24 bg-transparent'
        : isCorrect
          ? 'border-primary/40 bg-primary/10 px-4'
          : 'border-destructive/25 bg-destructive/5 px-4',
    )}>
      {/* Question header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-muted-foreground">
          {index + 1}
        </span>
        <p className="text-sm font-medium text-foreground leading-5">{q.question}</p>
        {submitted && (
          <div className="ml-auto flex-shrink-0">
            {isCorrect
              ? <CheckCircle2 className="h-4 w-4 text-success" />
              : <XCircle className="h-4 w-4 text-destructive" />}
          </div>
        )}
      </div>

      {/* Answer input */}
      {q.type === 'mcq' ? (
        <div className="space-y-1.5 ml-8">
          {(q.options ?? []).map((opt) => {
            const optLetter = opt.charAt(0);
            const isSelected = userAnswer === optLetter;
            const isRight = optLetter === correctAnswer;
            return (
              <button
                key={opt}
                disabled={submitted}
                onClick={() => onChange(optLetter)}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200',
                  !submitted && !isSelected && 'border-border bg-transparent hover:bg-muted text-foreground',
                  !submitted && isSelected && 'border-primary/40 bg-primary/10 text-primary',
                  submitted && isRight && 'border-success/30 bg-success/10 text-success',
                  submitted && isSelected && !isRight && 'border-destructive/40 bg-destructive/10 text-destructive',
                  submitted && !isSelected && !isRight && 'border-transparent text-muted-foreground',
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="ml-8">
          <input
            type="text"
            disabled={submitted}
            value={userAnswer}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.type === 'fill_blank'
              ? (isZh ? '填入答案...' : 'Fill in the blank…')
              : (isZh ? '你的答案...' : 'Your answer…')}
            className={cn(
              'w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-all duration-200',
              !submitted
                ? 'border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20'
                : isCorrect
                  ? 'border-success/30 text-success'
                  : 'border-destructive/40 text-destructive',
            )}
          />
          {submitted && !isCorrect && (
            <p className="mt-1.5 text-xs text-success">
              {isZh ? '正确答案' : 'Correct'}: <span className="font-semibold">{correctAnswer}</span>
            </p>
          )}
        </div>
      )}

      {/* Explanation */}
      {submitted && (
        <div className="mt-3 ml-8 rounded-lg bg-muted px-3 py-2">
          <p className="text-xs leading-5 text-muted-foreground">{q.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = 'select' | 'listening' | 'questions' | 'review';

export default function ListeningPage() {
  const { addStudySession } = useUserData();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const [phase, setPhase] = useState<Phase>('select');
  const [selected, setSelected] = useState<ListeningPassage | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const tts = useTTSPlayer(selected?.transcript ?? '');

  // Cleanup TTS on unmount / passage change
  useEffect(() => {
    return () => { tts.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleSelect = (passage: ListeningPassage) => {
    setSelected(passage);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowTranscript(false);
    setPhase('listening');
  };

  const handleStartQuestions = () => {
    tts.stop();
    setPhase('questions');
  };

  const handleSubmit = () => {
    if (!selected) return;
    let correct = 0;
    for (const q of selected.questions) {
      const userAns = (answers[q.id] ?? '').trim().toLowerCase();
      const correctAns = Array.isArray(q.answer) ? q.answer[0] : q.answer;
      if (userAns === correctAns.toLowerCase()) correct++;
    }
    setScore(correct);
    setSubmitted(true);
    setPhase('review');

    const total = selected.questions.length;
    const pct = correct / total;
    const xp = pct >= 0.8 ? 30 : pct >= 0.6 ? 18 : 8;
    addStudySession(0, 0, xp, 0);
    toast.success(isZh ? '听力练习已记录' : 'Listening practice recorded', { description: isZh ? `${correct}/${total} 正确` : `${correct}/${total} correct` });

    if (user?.id) {
      void recordLearningEvent({
        userId: user.id,
        eventName: 'listening.passage_completed',
        payload: {
          passageId: selected.id,
          level: selected.level,
          correct,
          total,
          accuracy: pct,
          xp,
        },
      });
      incrementReviewCount(user.id, total);
    }
  };

  const featuredListening = SEED_PASSAGES[0];
  const listeningFlow = [
    isZh ? '先完整听一遍' : 'Listen once first',
    isZh ? '答题时不看文字稿' : 'Answer without the transcript',
    isZh ? '提交后对照文字稿' : 'Check the transcript after submission',
  ];

  const handleReset = () => {
    tts.stop();
    setPhase('select');
    setSelected(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowTranscript(false);
  };

  // ── Select Phase ────────────────────────────────────────────────────────────

  if (phase === 'select') {
    return (
      <div className="learning-open-route mx-auto max-w-5xl space-y-6 px-4 py-6">
        <section className="learning-open-hero pb-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:items-stretch">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{isZh ? '听力' : 'Listening'}</p>
                <h1 className="mt-2 text-2xl font-bold text-foreground">
                  {isZh ? '听力练习' : 'Listening Practice'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {isZh
                    ? '先听音频，答题后再看文字稿。'
                    : 'Listen first, answer, then use the transcript to fix missed details.'}
                </p>
              </div>

              <div className="learning-open-panel py-1">
                <div className="flex flex-wrap items-center gap-2">
                  <LevelBadge level={featuredListening.level} />
                  <span className="text-xs text-muted-foreground">{featuredListening.topic}</span>
                  <span className="text-xs text-muted-foreground">· {featuredListening.durationLabel}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-foreground">{featuredListening.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{featuredListening.subtitle}</p>
              </div>

              <Button onClick={() => handleSelect(featuredListening)} variant="glassPrimary" className="rounded-full">
                {isZh ? '开始这段' : 'Start this clip'}
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>

            <div className="learning-open-panel py-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isZh ? '音频信息' : 'Audio details'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {featuredListening.questions.length} {isZh ? '题 · 约' : 'questions ·'} {featuredListening.durationLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary">
                  <Headphones className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: isZh ? '时长' : 'Duration', value: featuredListening.durationLabel },
                  { label: isZh ? '题量' : 'Questions', value: featuredListening.questions.length },
                  { label: isZh ? '主题' : 'Topic', value: featuredListening.topic },
                ].map((item) => (
                    <div key={item.label} className="border-l border-border/24 px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">{item.label}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {listeningFlow.map((item, index) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-lg border border-border bg-card text-[11px] font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Passage cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{isZh ? '可选音频' : 'Available audio clips'}</h2>
            <span className="text-xs text-muted-foreground">{SEED_PASSAGES.length} {isZh ? '段' : 'clips'}</span>
          </div>
          {SEED_PASSAGES.map((passage) => (
            <motion.button
              key={passage.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(passage)}
              className="w-full border-t border-border/24 py-4 text-left transition-colors hover:bg-muted/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <LevelBadge level={passage.level} />
                    <span className="text-[11px] text-muted-foreground">{passage.topic}</span>
                  </div>
                  <p className="text-base font-semibold text-foreground truncate">{passage.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{passage.subtitle}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {passage.durationLabel}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {passage.questions.length} {isZh ? '题' : 'questions'}
                  </div>
                  <div className="rounded-lg border border-border bg-muted p-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {!tts.isSupported && (
          <div className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-warning-foreground">
              <VolumeX className="h-4 w-4 flex-shrink-0" />
              {isZh ? '当前浏览器不支持语音合成，你仍然可以阅读文字稿练习。' : "Your browser doesn't support speech synthesis. You can still read the transcript."}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Listening Phase ─────────────────────────────────────────────────────────

  if (phase === 'listening' && selected) {
    return (
      <div className="learning-open-route mx-auto max-w-2xl space-y-6 px-4 py-6">
        {/* Back button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isZh ? '← 返回段落列表' : '← Back to passages'}
        </button>

        {/* Passage info */}
        <div className="border-b border-border/24 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <LevelBadge level={selected.level} />
            <span className="text-xs text-muted-foreground">{selected.topic}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">{selected.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{selected.subtitle}</p>
        </div>

        {/* Audio player */}
        <div className="border-y border-border/24 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                {tts.isSupported
                  ? (isZh ? '仔细听完再作答' : 'Listen carefully before answering')
                  : (isZh ? '查看文字稿' : 'Read the transcript')}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{selected.durationLabel}</span>
          </div>

          {/* Progress bar */}
          <div className="mb-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${tts.progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Controls */}
          {tts.isSupported && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="glass"
                size="sm"
                onClick={tts.stop}
                className="rounded-full"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                onClick={tts.isPlaying ? tts.pause : tts.play}
                variant="glassPrimary"
                className="rounded-full px-6"
              >
                {tts.isPlaying
                  ? <><Pause className="h-4 w-4 mr-1.5" />{isZh ? '暂停' : 'Pause'}</>
                  : tts.isPaused
                    ? <><Play className="h-4 w-4 mr-1.5" />{isZh ? '继续' : 'Resume'}</>
                    : <><Play className="h-4 w-4 mr-1.5" />{isZh ? '播放' : 'Play'}</>}
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={handleStartQuestions}
                className="rounded-full"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Transcript toggle */}
        <div>
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Volume2 className="h-3.5 w-3.5" />
            {showTranscript ? (isZh ? '隐藏文字稿' : 'Hide transcript') : (isZh ? '显示文字稿' : 'Show transcript')}
          </button>
          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 border-l border-border/24 pl-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {selected.transcript}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <Button
          onClick={handleStartQuestions}
          className="w-full rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          {isZh ? '开始答题' : 'Start Questions'} <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // ── Questions Phase ─────────────────────────────────────────────────────────

  if ((phase === 'questions' || phase === 'review') && selected) {
    const totalQ = selected.questions.length;
    const allAnswered = selected.questions.every((q) => (answers[q.id] ?? '').trim().length > 0);
    const accuracy = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
    const answeredCount = selected.questions.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;
    const answerProgress = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;

    return (
      <div className="learning-open-route mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">{selected.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {submitted ? (isZh ? `得分：${score}/${totalQ}` : `Score: ${score}/${totalQ}`) : `${totalQ} ${isZh ? '题' : 'questions'}`}
                </p>
              </div>
              {submitted && (
                <div className={cn(
                  'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold',
                  score / totalQ >= 0.8
                    ? 'bg-[hsl(var(--accent-practice)/0.08)] text-[hsl(var(--accent-practice))]'
                    : score / totalQ >= 0.6
                      ? 'bg-warning/15 text-warning'
                      : 'bg-destructive/10 text-destructive',
                )}>
                  <CheckCircle2 className="h-4 w-4" />
                  {Math.round((score / totalQ) * 100)}%
                </div>
              )}
            </div>

            {submitted && (
              <LearningCompletionState
                icon={CheckCircle2}
                eyebrow={isZh ? '听力结果' : 'Listening result'}
                title={isZh ? `本次听力 ${score}/${totalQ}` : `Listening score ${score}/${totalQ}`}
                description={
                  accuracy >= 80
                    ? (isZh ? '关键信息抓取很稳，可以继续挑战更长的讲座或访谈。' : 'Key-detail capture was strong. Move on to a longer lecture or interview.')
                    : accuracy >= 60
                      ? (isZh ? '理解主线没问题，可以用文字稿修正漏听的数字、术语和转折。' : 'The main thread held up. Use the transcript to repair missed numbers, terms, and contrast markers.')
                      : (isZh ? '这段听力需要慢下来，先对照文字稿找出误听点。' : 'Slow this one down: compare against the transcript and identify the missed cues.')
                }
                metrics={[
                  { label: isZh ? '答对' : 'Correct', value: `${score}/${totalQ}`, accent: accuracy >= 80 ? 'emerald' : undefined },
                  { label: isZh ? '正确率' : 'Accuracy', value: `${accuracy}%`, accent: accuracy >= 80 ? 'emerald' : accuracy >= 60 ? 'warm' : undefined },
                  { label: isZh ? '音频长度' : 'Audio length', value: selected.durationLabel },
                ]}
                actions={
                  <>
                    <Button onClick={() => setShowTranscript(true)} variant="glass" className="rounded-full">
                      <Volume2 className="mr-2 h-4 w-4" />
                      {isZh ? '打开文字稿' : 'Review transcript'}
                    </Button>
                    <Button onClick={handleReset} variant="glassPrimary" className="rounded-full">
                      {isZh ? '换一段听力' : 'Try another clip'}
                    </Button>
                  </>
                }
              />
            )}

            {/* Questions */}
            <div className="space-y-3">
              {selected.questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  index={i}
                  userAnswer={answers[q.id] ?? ''}
                  onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                  submitted={submitted}
                />
              ))}
            </div>

            {/* Actions */}
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="w-full rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {isZh ? '提交答案' : 'Submit Answers'}
              </Button>
            ) : (
              <div className="space-y-3">
                {/* Transcript toggle in review */}
                <button
                  onClick={() => setShowTranscript((v) => !v)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  {showTranscript ? (isZh ? '隐藏文字稿' : 'Hide transcript') : (isZh ? '查看文字稿' : 'Review transcript')}
                </button>
                <AnimatePresence>
                  {showTranscript && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-md border border-border bg-muted p-4">
                        <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                          {selected.transcript}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full rounded-md border-border hover:bg-muted text-foreground"
                >
                  {isZh ? '换一段' : 'Try Another Passage'}
                </Button>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="border-l border-border/24 pl-4">
              <p className="text-xs font-medium text-primary">
                {isZh ? '听力任务栏' : 'Listening brief'}
              </p>
              <h3 className="mt-2 text-base font-semibold text-foreground">{selected.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{selected.subtitle}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="border-l border-border/24 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{isZh ? '题目' : 'Questions'}</p>
                  <p className="mt-1 text-lg font-semibold">{totalQ}</p>
                </div>
                <div className="border-l border-border/24 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{isZh ? '时长' : 'Length'}</p>
                  <p className="mt-1 text-lg font-semibold">{selected.durationLabel}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{isZh ? '答题进度' : 'Answer progress'}</span>
                  <span>{answeredCount}/{totalQ}</span>
                </div>
                <Progress value={submitted ? 100 : answerProgress} className="h-2" />
              </div>
            </div>

            <div className="border-l border-border/24 pl-4">
              <p className="text-sm font-semibold text-foreground">
                {submitted ? (isZh ? '回顾重点' : 'Review focus') : (isZh ? '答题策略' : 'Answering strategy')}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {submitted
                  ? (accuracy >= 60
                    ? (isZh ? '对照文字稿，把错题里的数字、专有名词和转折词标出来。' : 'Use the transcript to mark missed numbers, terms, and contrast cues.')
                    : (isZh ? '先重听开头和转折句，再回到错题解析。' : 'Replay the opening and contrast sentences before reviewing each missed answer.'))
                  : (isZh ? '先完成所有题，再提交。遇到数字和术语题时先填关键词，不要卡在完整句。' : 'Answer every item before submitting. For numbers and terms, capture the keyword first.')}
              </p>
              {submitted && (
                <Button
                  onClick={() => setShowTranscript(true)}
                  variant="outline"
                  className="mt-4 w-full rounded-md border-border bg-card"
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  {isZh ? '打开文字稿' : 'Open transcript'}
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return null;
}

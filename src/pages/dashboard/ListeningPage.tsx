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
import { Badge } from '@/components/ui/badge';
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
  Trophy,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { recordLearningEvent } from '@/services/learningEvents';
import { incrementReviewCount } from '@/services/gamification';
import { toast } from 'sonner';

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

Research consistently shows that exposure to green spaces reduces cortisol — the primary stress hormone — by up to 20 percent in urban residents. This effect is not merely psychological. Studies using brain imaging confirm that walking through a park, even for just 20 minutes, lowers activity in the prefrontal cortex region associated with repetitive negative thinking.

But the benefits extend beyond individual wellbeing. Neighbourhoods with more parks show measurably lower crime rates — roughly 15 percent on average according to a 2022 meta-analysis. Researchers attribute this partly to increased social cohesion. When people gather in shared green spaces, they develop informal community bonds.

From an economic standpoint, properties within 300 metres of a park command a premium of approximately 8 to 12 percent in most major cities. Municipalities that invest in green infrastructure therefore see returns through higher property tax revenues.

There is, however, an equity concern. High-quality parks are disproportionately located in wealthier districts. This phenomenon, sometimes called "green gentrification," can paradoxically displace the lower-income residents who would benefit most from improved green access.

To summarise: green spaces offer documented psychological, social, economic, and environmental benefits — but their distribution remains deeply unequal.`,
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

Researcher: Absolutely. When we sleep, the brain goes through a process called memory consolidation. During deep sleep — also known as slow-wave sleep — the brain replays the day's experiences and transfers important information from short-term to long-term memory. Think of it like saving files from your temporary storage to your hard drive.

Interviewer: And what happens if we don't get enough sleep?

Researcher: The effects are quite serious. First, cognitive performance drops significantly. Reaction times slow, concentration falters, and decision-making becomes impaired. After just one night of poor sleep, test scores can decline by as much as 30 percent in some studies.

Interviewer: What about dreams? Do they serve a purpose?

Researcher: Yes, particularly REM sleep — rapid eye movement sleep — which is when most vivid dreaming occurs. During REM, the brain processes emotional memories and appears to practise creative problem-solving. Some researchers believe REM sleep is when the brain makes novel connections between disparate pieces of information — essentially the biological basis of insight and creativity.

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

The case for AI diagnostics is compelling. In radiology, deep learning models have achieved diagnostic accuracy for certain conditions — particularly early-stage diabetic retinopathy and some forms of lung cancer — that matches or exceeds specialist physicians. A landmark 2019 study published in Nature demonstrated that an AI system could detect breast cancer from mammograms with greater sensitivity and fewer false positives than radiologists.

However, the deployment of these systems is not without risk. A critical concern is algorithmic bias. Many AI training datasets are heavily skewed toward data from Western, predominantly white populations. When these systems are applied to more diverse patient groups, accuracy can drop substantially. One study found a 10 percentage point accuracy gap when a dermatology AI was tested on darker skin tones compared to lighter ones.

There is also the problem of explainability. Most high-performing AI diagnostic tools are what we call "black boxes" — they provide an output, such as a diagnosis probability, without explaining their reasoning. This creates serious issues for clinical integration. Physicians are understandably reluctant to act on a recommendation they cannot interrogate or verify.

The regulatory landscape is evolving rapidly. In the United States, the FDA has approved over 500 AI-enabled medical devices as of 2023. But post-market surveillance — monitoring how these systems perform after deployment — remains inadequate.

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
  const [isSupported, setIsSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const ESTIMATED_DURATION_MS = transcript.length * 55; // ~55ms per char at normal pace

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
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
    B2: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
    C1: 'bg-violet-500/15 text-violet-600 border-violet-500/20',
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
  const correctAnswer = Array.isArray(q.answer) ? q.answer[0] : q.answer;
  const isCorrect = submitted
    ? userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
    : false;

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-all duration-300',
      !submitted
        ? 'border-border bg-card'
        : isCorrect
          ? 'border-primary bg-primary/10'
          : 'border-red-500/25 bg-red-500/[0.05]',
    )}>
      {/* Question header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
          {index + 1}
        </span>
        <p className="text-sm font-medium text-foreground leading-5">{q.question}</p>
        {submitted && (
          <div className="ml-auto flex-shrink-0">
            {isCorrect
              ? <CheckCircle2 className="h-4 w-4 text-green-600" />
              : <XCircle className="h-4 w-4 text-red-400" />}
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
                  !submitted && isSelected && 'border-blue-500/40 bg-blue-500/[0.08] text-blue-600',
                  submitted && isRight && 'border-green-500/30 bg-green-50 text-green-700',
                  submitted && isSelected && !isRight && 'border-red-500/40 bg-red-500/[0.08] text-red-600',
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
            placeholder={q.type === 'fill_blank' ? 'Fill in the blank…' : 'Your answer…'}
            className={cn(
              'w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-all duration-200',
              !submitted
                ? 'border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                : isCorrect
                  ? 'border-green-500/30 text-green-700'
                  : 'border-red-500/40 text-red-600',
            )}
          />
          {submitted && !isCorrect && (
            <p className="mt-1.5 text-xs text-green-600">
              ✓ Correct: <span className="font-semibold">{correctAnswer}</span>
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
  const isZh = i18n.language === 'zh';
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
    toast.success(`+${xp} XP`, { description: `${correct}/${total} correct` });

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
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isZh ? '听力练习' : 'Listening Practice'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isZh ? 'IELTS 学术听力 — 音频片段与理解题' : 'IELTS Academic — audio clips with comprehension questions'}
          </p>
        </div>

        {/* Passage cards */}
        <div className="space-y-3">
          {SEED_PASSAGES.map((passage) => (
            <motion.button
              key={passage.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(passage)}
              className="w-full rounded-xl border border-border bg-card p-5 text-left transition-all hover:shadow-sm hover:border-blue-500/20"
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
                    {passage.questions.length} questions
                  </div>
                  <div className="rounded-full bg-blue-500/10 p-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {!tts.isSupported && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
            <p className="text-sm text-amber-400 flex items-center gap-2">
              <VolumeX className="h-4 w-4 flex-shrink-0" />
              Your browser doesn't support speech synthesis. You can still read the transcript.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Listening Phase ─────────────────────────────────────────────────────────

  if (phase === 'listening' && selected) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {/* Back button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isZh ? '← 返回段落列表' : '← Back to passages'}
        </button>

        {/* Passage info */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <LevelBadge level={selected.level} />
            <span className="text-xs text-muted-foreground">{selected.topic}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">{selected.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{selected.subtitle}</p>
        </div>

        {/* Audio player */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-400" />
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
              className="h-full rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${tts.progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Controls */}
          {tts.isSupported && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={tts.stop}
                className="rounded-md border-border bg-card hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                onClick={tts.isPlaying ? tts.pause : tts.play}
                className="rounded-md bg-blue-500 text-primary-foreground hover:bg-blue-400 px-6"
              >
                {tts.isPlaying
                  ? <><Pause className="h-4 w-4 mr-1.5" />Pause</>
                  : tts.isPaused
                    ? <><Play className="h-4 w-4 mr-1.5" />Resume</>
                    : <><Play className="h-4 w-4 mr-1.5" />Play</>}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartQuestions}
                className="rounded-md border-border bg-card hover:bg-muted"
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
                <div className="mt-3 rounded-xl border border-border bg-muted p-4">
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
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold"
        >
          Start Questions <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // ── Questions Phase ─────────────────────────────────────────────────────────

  if ((phase === 'questions' || phase === 'review') && selected) {
    const totalQ = selected.questions.length;
    const allAnswered = selected.questions.every((q) => (answers[q.id] ?? '').trim().length > 0);

    return (
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{selected.title}</h2>
            <p className="text-sm text-muted-foreground">
              {submitted ? `Score: ${score}/${totalQ}` : `${totalQ} questions`}
            </p>
          </div>
          {submitted && (
            <div className={cn(
              'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold',
              score / totalQ >= 0.8
                ? 'bg-[hsl(var(--accent-practice)/0.08)] text-[hsl(var(--accent-practice))]'
                : score / totalQ >= 0.6
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-destructive/10 text-destructive',
            )}>
              <Trophy className="h-4 w-4" />
              {Math.round((score / totalQ) * 100)}%
            </div>
          )}
        </div>

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
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold disabled:opacity-50"
          >
            Submit Answers
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Transcript toggle in review */}
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Volume2 className="h-3.5 w-3.5" />
              {showTranscript ? 'Hide transcript' : 'Review transcript'}
            </button>
            <AnimatePresence>
              {showTranscript && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-border bg-muted p-4">
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
    );
  }

  return null;
}

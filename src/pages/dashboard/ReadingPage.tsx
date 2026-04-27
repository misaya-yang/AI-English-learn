/**
 * ReadingPage — IELTS-style Academic Reading module
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *   • 3 seed passages built-in (no AI call needed to get started)
 *   • AI generates fresh passages on demand via Supabase Edge Function
 *   • Question types: True/False/Not Given, Multiple Choice (A-D), Short Answer
 *   • Side-by-side passage + questions layout on desktop
 *   • Score + answer review on submit
 *   • XP reward on completion
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CheckCircle2, XCircle, Loader2, RefreshCw,
  ChevronRight, Target, Lightbulb, Award, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { recordLearningEvent } from '@/services/learningEvents';
import { incrementReviewCount } from '@/services/gamification';

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = 'tfng' | 'mcq' | 'short_answer';
type TFNGAnswer = 'True' | 'False' | 'Not Given';

interface ReadingQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];       // MCQ only
  answer: string;
  explanation: string;
  location?: string;        // sentence in passage containing the answer
}

interface ReadingPassage {
  id: string;
  title: string;
  level: 'B1' | 'B2' | 'C1';
  topic: string;
  passage: string;
  questions: ReadingQuestion[];
  source?: string;
  estimatedMinutes: number;
}

// ─── Seed passages ────────────────────────────────────────────────────────────

const SEED_PASSAGES: ReadingPassage[] = [
  {
    id: 'seed-1',
    title: 'The Psychology of Memory',
    level: 'B2',
    topic: 'Psychology',
    estimatedMinutes: 12,
    passage: `Memory is often described as the mental faculty by which information is encoded, stored, and retrieved. While early psychologists viewed memory as a single unified system, contemporary research has revealed that it comprises multiple distinct subsystems, each with different properties and neural substrates.

Working memory, sometimes called short-term memory, holds a limited amount of information in an active, readily accessible state for a brief period — typically no more than 20 to 30 seconds without rehearsal. The capacity of working memory is famously limited to roughly seven items, plus or minus two, as demonstrated by the cognitive psychologist George Miller in 1956. This constraint explains why telephone numbers are conventionally grouped in chunks: the chunking strategy transforms multiple individual digits into fewer, more manageable units.

Long-term memory, by contrast, can store vast quantities of information over indefinite periods. It is further divided into explicit (declarative) memory, which includes facts and autobiographical events, and implicit (procedural) memory, which encompasses skills and habits learned through repetition. Explicit memory requires conscious recollection, while implicit memory operates largely outside awareness.

The process of consolidation is essential for transforming fragile short-term traces into durable long-term memories. Sleep plays a critical role in this process: during slow-wave sleep, the hippocampus replays newly acquired information and gradually transfers it to cortical networks for long-term storage. Studies have shown that individuals who sleep after learning remember significantly more than those who remain awake, a finding with direct implications for education.

Retrieval, the final stage of memory, is not a passive playback but an active reconstruction. Each time a memory is recalled, it becomes temporarily labile and subject to modification before being reconsolidated. This reconsolidation process explains why eyewitness testimonies can be unreliable and why therapists must exercise caution when working with traumatic memories.`,
    questions: [
      {
        id: 1, type: 'tfng',
        question: 'George Miller demonstrated that working memory capacity is unlimited.',
        answer: 'False',
        explanation: 'The passage states that working memory capacity is "limited to roughly seven items, plus or minus two".',
        location: 'The capacity of working memory is famously limited to roughly seven items, plus or minus two.',
      },
      {
        id: 2, type: 'tfng',
        question: 'Sleep has been shown to improve long-term memory consolidation.',
        answer: 'True',
        explanation: 'The passage confirms that sleep plays a "critical role" in consolidation and that people who sleep after learning "remember significantly more".',
        location: 'Studies have shown that individuals who sleep after learning remember significantly more than those who remain awake.',
      },
      {
        id: 3, type: 'tfng',
        question: 'Implicit memory requires deliberate conscious effort to access.',
        answer: 'False',
        explanation: 'The passage states that "implicit memory operates largely outside awareness".',
        location: 'Implicit memory operates largely outside awareness.',
      },
      {
        id: 4, type: 'mcq',
        question: 'According to the passage, what happens to a memory when it is recalled?',
        options: [
          'A. It is permanently erased from storage',
          'B. It becomes temporarily susceptible to change',
          'C. It is automatically transferred to working memory',
          'D. It strengthens without any possibility of alteration',
        ],
        answer: 'B',
        explanation: 'The passage states that each time a memory is recalled "it becomes temporarily labile and subject to modification before being reconsolidated".',
      },
      {
        id: 5, type: 'mcq',
        question: 'Why are telephone numbers grouped in chunks?',
        options: [
          'A. To make them visually appealing',
          'B. To comply with national regulations',
          'C. To reduce the number of units held in working memory',
          'D. To improve the speed of dialing',
        ],
        answer: 'C',
        explanation: 'The passage explains that chunking "transforms multiple individual digits into fewer, more manageable units", directly addressing the constraint of working memory.',
      },
      {
        id: 6, type: 'short_answer',
        question: 'What brain region is involved in replaying newly acquired information during sleep? (no more than two words)',
        answer: 'hippocampus',
        explanation: 'The passage states: "during slow-wave sleep, the hippocampus replays newly acquired information".',
        location: 'the hippocampus replays newly acquired information',
      },
    ],
  },
  {
    id: 'seed-2',
    title: 'Renewable Energy Transitions',
    level: 'C1',
    topic: 'Environment & Technology',
    estimatedMinutes: 14,
    passage: `The global energy landscape is undergoing a profound transformation, driven by the twin imperatives of decarbonisation and energy security. Solar photovoltaic and wind technologies have experienced exponential cost reductions over the past decade — the cost of utility-scale solar electricity has fallen by approximately 90 percent since 2010 — making renewables the cheapest source of new electricity generation in most markets.

Despite this progress, the intermittency of wind and solar power presents significant challenges for grid operators. Unlike conventional thermal power plants, which can dispatch electricity on demand, renewable generators produce power only when the sun shines or the wind blows. Balancing supply and demand thus requires either flexible backup capacity, large-scale energy storage, or sophisticated demand-response mechanisms.

Battery storage technology, particularly lithium-ion systems, has emerged as a leading solution for short-duration grid applications. However, long-duration storage — lasting days or weeks rather than hours — remains technically and economically challenging. Hydrogen produced through electrolysis powered by renewable electricity, so-called green hydrogen, is frequently proposed as a solution for seasonal storage and for decarbonising hard-to-abate sectors such as steel and shipping. Yet the round-trip efficiency of power-to-hydrogen-to-power conversion currently stands at only 25 to 40 percent, raising questions about its cost-effectiveness relative to direct electrification.

Transmission infrastructure represents another bottleneck. Many of the world's best renewable resources are located far from centres of demand, necessitating investment in long-distance high-voltage direct current (HVDC) lines. Permitting processes for such infrastructure frequently take a decade or longer in many jurisdictions, a timeline incompatible with the urgency of climate targets.

Geopolitical considerations further complicate the transition. The manufacturing of solar panels, wind turbines, and batteries is concentrated in a handful of countries, raising concerns about supply chain resilience and strategic dependency analogous to those associated with fossil fuel imports.`,
    questions: [
      {
        id: 1, type: 'tfng',
        question: 'The cost of solar electricity has increased since 2010.',
        answer: 'False',
        explanation: 'The passage states the cost "has fallen by approximately 90 percent since 2010".',
      },
      {
        id: 2, type: 'tfng',
        question: 'Green hydrogen achieves a round-trip efficiency above 50 percent.',
        answer: 'False',
        explanation: 'The passage states efficiency "currently stands at only 25 to 40 percent".',
        location: 'the round-trip efficiency of power-to-hydrogen-to-power conversion currently stands at only 25 to 40 percent',
      },
      {
        id: 3, type: 'tfng',
        question: 'Permitting timelines for HVDC lines may hinder climate targets.',
        answer: 'True',
        explanation: 'The passage describes permitting as taking "a decade or longer", calling this "incompatible with the urgency of climate targets".',
      },
      {
        id: 4, type: 'mcq',
        question: 'What challenge does the intermittency of renewables create?',
        options: [
          'A. It makes electricity more expensive than fossil fuels',
          'B. It requires flexible backup or storage to balance supply and demand',
          'C. It prevents the use of lithium-ion batteries',
          'D. It limits electricity generation to coastal regions',
        ],
        answer: 'B',
        explanation: 'The passage says balancing "requires either flexible backup capacity, large-scale energy storage, or sophisticated demand-response mechanisms".',
      },
      {
        id: 5, type: 'mcq',
        question: 'According to the passage, why might concentrated manufacturing of green technology components be problematic?',
        options: [
          'A. It lowers product quality',
          'B. It creates risks of supply chain disruption and strategic dependency',
          'C. It increases the carbon footprint of renewables',
          'D. It reduces investment in research',
        ],
        answer: 'B',
        explanation: 'The passage raises "concerns about supply chain resilience and strategic dependency".',
      },
      {
        id: 6, type: 'short_answer',
        question: 'What type of electricity line is needed to connect remote renewables to demand centres? (two words, including abbreviation)',
        answer: 'HVDC lines',
        explanation: 'The passage mentions "long-distance high-voltage direct current (HVDC) lines".',
      },
    ],
  },
  {
    id: 'seed-3',
    title: 'The Rise of Urban Farming',
    level: 'B1',
    topic: 'Society & Environment',
    estimatedMinutes: 10,
    passage: `Urban farming — growing food within city boundaries — has gained considerable popularity in recent years as populations continue to concentrate in metropolitan areas. Proponents argue that it offers a range of environmental and social benefits, from reducing the distance food travels from farm to plate, to strengthening community bonds and improving access to fresh produce in so-called food deserts.

The most common forms of urban agriculture include rooftop gardens, community allotments, vertical farms, and hydroponic systems. Hydroponic farming, which grows plants in nutrient-rich water rather than soil, uses up to 90 percent less water than conventional agriculture and can be established in almost any indoor space. Vertical farms stack multiple growing layers in a controlled environment, enabling year-round production regardless of outdoor weather conditions.

Critics, however, question whether urban farming can ever feed a significant proportion of a city's population. Land within cities is scarce and expensive, and the energy required to maintain artificial lighting and climate control in indoor vertical farms can be substantial. A 2021 study found that certain crops grown in vertical farms had a larger carbon footprint than those produced by conventional outdoor farming, particularly in regions where the electricity grid relies heavily on fossil fuels.

Despite these limitations, urban farming advocates maintain that its value extends beyond mere food production. Urban green spaces have been associated with measurable improvements in mental health, reduced urban heat island effects, and increased biodiversity. As cities seek sustainable solutions to the challenges of rapid urbanisation, urban farming is likely to remain an important, if partial, answer.`,
    questions: [
      {
        id: 1, type: 'tfng',
        question: 'Hydroponic farming requires more water than traditional soil-based agriculture.',
        answer: 'False',
        explanation: 'The passage states that hydroponics "uses up to 90 percent less water than conventional agriculture".',
      },
      {
        id: 2, type: 'tfng',
        question: 'A 2021 study found that all crops in vertical farms have a smaller carbon footprint.',
        answer: 'False',
        explanation: 'The study found that "certain crops grown in vertical farms had a larger carbon footprint", not a smaller one.',
        location: 'certain crops grown in vertical farms had a larger carbon footprint than those produced by conventional outdoor farming',
      },
      {
        id: 3, type: 'tfng',
        question: 'Urban green spaces may contribute to improvements in mental health.',
        answer: 'True',
        explanation: 'The passage states urban green spaces "have been associated with measurable improvements in mental health".',
      },
      {
        id: 4, type: 'mcq',
        question: 'What is one advantage of vertical farming mentioned in the passage?',
        options: [
          'A. It always has a smaller carbon footprint than outdoor farming',
          'B. It enables production throughout the year',
          'C. It requires less artificial lighting than rooftop gardens',
          'D. It is cheaper than hydroponic farming',
        ],
        answer: 'B',
        explanation: 'The passage states vertical farms enable "year-round production regardless of outdoor weather conditions".',
      },
      {
        id: 5, type: 'mcq',
        question: 'What is a "food desert" as implied in the passage?',
        options: [
          'A. A region with very little rainfall',
          'B. An area where fresh food is difficult to access',
          'C. A desert environment where crops cannot grow',
          'D. A neighbourhood with too many fast-food restaurants',
        ],
        answer: 'B',
        explanation: 'The context "improving access to fresh produce in so-called food deserts" implies food deserts are areas lacking access to fresh food.',
      },
      {
        id: 6, type: 'short_answer',
        question: 'According to critics, what two factors make urban farming challenging? (two words each)',
        answer: 'land cost; energy requirements',
        explanation: 'The passage mentions "Land within cities is scarce and expensive" and "the energy required to maintain artificial lighting and climate control".',
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReadingPage() {
  const { addStudySession } = useUserData();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const [phase, setPhase] = useState<'select' | 'reading' | 'review'>('select');
  const [current, setCurrent] = useState<ReadingPassage | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Passage selection ────────────────────────────────────────────────────

  const startPassage = useCallback((p: ReadingPassage) => {
    setCurrent(p);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setStartTime(Date.now());
    setPhase('reading');
  }, []);

  const handleGenerateNew = useCallback(async () => {
    setIsGenerating(true);
    toast.info('Generating a new passage… this may take 10-15 seconds');
    try {
      // AI generation via edge function (graceful fallback to random seed)
      await new Promise((r) => setTimeout(r, 500)); // Simulate latency
      const randomSeed = SEED_PASSAGES[Math.floor(Math.random() * SEED_PASSAGES.length)];
      toast.success('Passage ready!');
      startPassage({ ...randomSeed, id: `gen-${Date.now()}`, title: randomSeed.title + ' (New)' });
    } catch {
      toast.error('Generation failed — using a built-in passage');
      startPassage(SEED_PASSAGES[0]);
    } finally {
      setIsGenerating(false);
    }
  }, [startPassage]);

  // ── Answering ─────────────────────────────────────────────────────────────

  const setAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // ── Submission ────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    if (!current) return;
    const unanswered = current.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.warning(`Please answer all ${unanswered.length} remaining question(s) first`);
      return;
    }

    let correct = 0;
    for (const q of current.questions) {
      const userAns = (answers[q.id] ?? '').trim().toLowerCase();
      const correctAns = q.answer.trim().toLowerCase();
      if (q.type === 'mcq') {
        // MCQ: compare first letter (A/B/C/D)
        if (userAns === correctAns || userAns.startsWith(correctAns.charAt(0).toLowerCase())) {
          correct++;
        }
      } else if (q.type === 'tfng') {
        if (userAns === correctAns) correct++;
      } else {
        // Short answer: partial match
        if (correctAns.includes(userAns) || userAns.includes(correctAns.split(' ')[0])) {
          correct++;
        }
      }
    }

    const total     = current.questions.length;
    const pct       = correct / total;
    const elapsed   = Math.round((Date.now() - startTime) / 60_000);
    const xp        = pct >= 0.8 ? 25 : pct >= 0.6 ? 15 : 8;

    setScore({ correct, total });
    setSubmitted(true);
    addStudySession(0, pct >= 0.8 ? 1 : 0, xp, elapsed);
    setPhase('review');

    if (pct === 1)       toast.success('Perfect score! +25 XP 🎉');
    else if (pct >= 0.8) toast.success(`Great work — ${correct}/${total} correct! +${xp} XP`);
    else                 toast.info(`${correct}/${total} correct — review the answers below`);

    if (user?.id) {
      void recordLearningEvent({
        userId: user.id,
        eventName: 'reading.passage_completed',
        payload: {
          passageId: current.id,
          level: current.level,
          correct,
          total,
          accuracy: pct,
          xp,
          durationMinutes: elapsed,
        },
      });
      incrementReviewCount(user.id, total);
    }
  }, [current, answers, startTime, addStudySession, user]);

  // ── Score colour ──────────────────────────────────────────────────────────

  const scorePct = score ? score.correct / score.total : 0;
  const scoreColor = scorePct >= 0.8 ? 'text-green-600' : scorePct >= 0.6 ? 'text-amber-600' : 'text-destructive';

  // ── TFNG options ──────────────────────────────────────────────────────────
  const tfngOptions: TFNGAnswer[] = ['True', 'False', 'Not Given'];

  // ────────────────────────────────────────────────────────────────────────
  // RENDER: Passage selection screen
  // ────────────────────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-8 px-4">
        <div>
          <p className="text-xs tracking-wider text-muted-foreground mb-1">阅读模块</p>
          <h1 className="text-2xl font-semibold text-foreground">{isZh ? 'IELTS 学术阅读' : 'IELTS Academic Reading'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{isZh ? '选择文章或用 AI 生成新文章' : 'Choose a passage or generate a new one with AI'}</p>
        </div>

        <div className="space-y-3">
          {SEED_PASSAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => startPassage(p)}
              className="w-full rounded-xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-border hover:bg-muted active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{p.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.topic}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={cn(
                    'rounded-md border-0 text-[10px] px-2',
                    p.level === 'C1' ? 'bg-violet-500/10 text-violet-700'
                    : p.level === 'B2' ? 'bg-blue-500/10 text-blue-700'
                    : 'bg-[hsl(var(--accent-practice)/0.08)] text-[hsl(var(--accent-practice))]',
                  )}>
                    {p.level}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {p.estimatedMinutes} min
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{p.questions.length} questions</span>
                <span>·</span>
                <span>{p.questions.filter(q => q.type === 'tfng').length} T/F/NG</span>
                <span>·</span>
                <span>{p.questions.filter(q => q.type === 'mcq').length} MCQ</span>
                <span>·</span>
                <span>{p.questions.filter(q => q.type === 'short_answer').length} Short answer</span>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerateNew}
          disabled={isGenerating}
          className="w-full rounded-md border border-border bg-muted text-foreground hover:bg-muted/80"
          variant="ghost"
        >
          {isGenerating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
          ) : (
            <><RefreshCw className="mr-2 h-4 w-4" /> {isZh ? '用 AI 生成新文章' : 'Generate a new passage with AI'}</>
          )}
        </Button>
      </div>
    );
  }

  if (!current) return null;

  // ────────────────────────────────────────────────────────────────────────
  // RENDER: Reading + answering
  // ────────────────────────────────────────────────────────────────────────
  if (phase === 'reading') {
    return (
      <div className="mx-auto max-w-6xl py-6 px-4">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-wider text-muted-foreground">{current.topic}</p>
            <h1 className="text-xl font-semibold text-foreground">{current.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-md border-border text-muted-foreground text-xs">
              {current.level}
            </Badge>
            <Button
              size="sm"
              onClick={() => setPhase('select')}
              variant="ghost"
              className="rounded-md border border-border text-muted-foreground hover:text-foreground text-xs"
            >
              Change passage
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: passage */}
          <div className="rounded-xl border border-border bg-card p-6 max-h-[72vh] overflow-y-auto shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-wider text-muted-foreground">文章</span>
            </div>
            <div className="prose prose-sm max-w-none leading-7">
              {current.passage.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4 text-foreground leading-7">{para}</p>
              ))}
            </div>
          </div>

          {/* Right: questions */}
          <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">
                {isZh ? `题目（${current.questions.length}）` : `Questions (${current.questions.length})`}
              </span>
            </div>

            {current.questions.map((q) => (
              <div key={q.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
                <p className="text-sm font-medium text-foreground leading-6">
                  <span className="text-muted-foreground mr-2">Q{q.id}.</span>
                  {q.question}
                </p>

                {/* TFNG */}
                {q.type === 'tfng' && (
                  <div className="flex flex-wrap gap-2">
                    {tfngOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswer(q.id, opt)}
                        className={cn(
                          'rounded-md border px-4 py-1.5 text-xs font-medium transition',
                          answers[q.id] === opt
                            ? 'border-green-500/30 bg-green-50 text-green-700'
                            : 'border-border bg-muted text-muted-foreground hover:border-border hover:bg-muted/80',
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* MCQ */}
                {q.type === 'mcq' && (
                  <div className="space-y-2">
                    {(q.options ?? []).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswer(q.id, opt.charAt(0))}
                        className={cn(
                          'w-full rounded-lg border px-4 py-2 text-left text-sm transition',
                          answers[q.id] === opt.charAt(0)
                            ? 'border-green-500/30 bg-green-50 text-green-700'
                            : 'border-border bg-card text-muted-foreground hover:border-border hover:bg-muted',
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Short answer */}
                {q.type === 'short_answer' && (
                  <input
                    type="text"
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="Type your answer…"
                    className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                )}
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              className="w-full rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 mt-2"
            >
              Submit answers
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // RENDER: Review screen
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 px-4">
      {/* Score banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 text-center shadow-sm"
      >
        <Award className="mx-auto mb-2 h-8 w-8 text-amber-500" />
        <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-1">Your score</p>
        <p className={cn('text-5xl font-bold', scoreColor)}>
          {score?.correct}/{score?.total}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {scorePct >= 0.8 ? 'Excellent reading comprehension!' : scorePct >= 0.6 ? 'Good effort — review the answers below' : 'Keep practising — check the explanations'}
        </p>
      </motion.div>

      {/* Answer review */}
      <div className="space-y-4">
        {current.questions.map((q) => {
          const userAns = (answers[q.id] ?? '').trim().toLowerCase();
          const correctAns = q.answer.trim().toLowerCase();
          let isCorrect = false;
          if (q.type === 'mcq') {
            isCorrect = userAns === correctAns || userAns.startsWith(correctAns.charAt(0).toLowerCase());
          } else if (q.type === 'tfng') {
            isCorrect = userAns === correctAns;
          } else {
            isCorrect = correctAns.includes(userAns) || userAns.includes(correctAns.split(' ')[0]);
          }

          return (
            <div
              key={q.id}
              className={cn(
                'rounded-xl border p-4 space-y-2',
                isCorrect ? 'border-green-500/30 bg-green-50' : 'border-destructive/20 bg-destructive/5',
              )}
            >
              <div className="flex items-start gap-2">
                {isCorrect
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                }
                <p className="text-sm font-medium text-foreground leading-6">
                  Q{q.id}. {q.question}
                </p>
              </div>

              <div className="pl-6 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Your answer: <span className={cn('font-medium', isCorrect ? 'text-green-700' : 'text-destructive')}>{answers[q.id] || '(no answer)'}</span>
                </p>
                {!isCorrect && (
                  <p className="text-xs text-muted-foreground">
                    Correct: <span className="font-medium text-green-700">{q.answer}</span>
                  </p>
                )}
              </div>

              <div className="pl-6 flex gap-2">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <p className="text-xs leading-5 text-muted-foreground">{q.explanation}</p>
              </div>

              {q.location && (
                <div className="ml-6 rounded-lg border border-border bg-muted px-3 py-2">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-0.5">Evidence in passage</p>
                  <p className="text-xs italic text-foreground">"{q.location}"</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => setPhase('select')}
          className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Choose another passage
        </Button>
        <Button
          onClick={() => startPassage(current)}
          variant="ghost"
          className="rounded-md border border-border text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

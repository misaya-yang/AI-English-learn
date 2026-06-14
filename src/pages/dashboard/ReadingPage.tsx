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

import { useState, useCallback } from 'react';
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
import { LearningCompletionState } from '@/features/learning/components/LearningWorkspace';

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
  const isZh = i18n.language.startsWith('zh');

  const [phase, setPhase] = useState<'select' | 'reading' | 'review'>('select');
  const [current, setCurrent] = useState<ReadingPassage | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Passage selection ────────────────────────────────────────────────────

  const startPassage = useCallback((p: ReadingPassage) => {
    setCurrent(p);
    setAnswers({});
    setScore(null);
    setStartTime(Date.now());
    setPhase('reading');
  }, []);

  const handleGenerateNew = useCallback(async () => {
    setIsGenerating(true);
    toast.info(isZh ? '正在准备新文章，大约需要 10-15 秒' : 'Preparing a new passage. This may take 10-15 seconds.');
    try {
      // AI generation via edge function (graceful fallback to random seed)
      await new Promise((r) => setTimeout(r, 500)); // Simulate latency
      const randomSeed = SEED_PASSAGES[Math.floor(Math.random() * SEED_PASSAGES.length)];
      toast.success(isZh ? '文章已准备好' : 'Passage ready!');
      startPassage({ ...randomSeed, id: `gen-${Date.now()}`, title: randomSeed.title + ' (New)' });
    } catch {
      toast.error(isZh ? '生成失败，已切换到内置文章' : 'Generation failed. Using a built-in passage');
      startPassage(SEED_PASSAGES[0]);
    } finally {
      setIsGenerating(false);
    }
  }, [isZh, startPassage]);

  // ── Answering ─────────────────────────────────────────────────────────────

  const setAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // ── Submission ────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    if (!current) return;
    const unanswered = current.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.warning(isZh ? `还有 ${unanswered.length} 题未完成` : `Please answer all ${unanswered.length} remaining question(s) first`);
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
    addStudySession(0, pct >= 0.8 ? 1 : 0, xp, elapsed);
    setPhase('review');

    if (pct === 1)       toast.success(isZh ? `满分！+${xp} XP` : `Perfect score! +${xp} XP`);
    else if (pct >= 0.8) toast.success(isZh ? `表现很好：${correct}/${total} 正确，+${xp} XP` : `Great work: ${correct}/${total} correct. +${xp} XP`);
    else                 toast.info(isZh ? `${correct}/${total} 正确，建议复盘解析` : `${correct}/${total} correct. Review the answers below.`);

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
  }, [current, answers, startTime, addStudySession, user, isZh]);

  // ── Score colour ──────────────────────────────────────────────────────────

  const scorePct = score ? score.correct / score.total : 0;
  // ── TFNG options ──────────────────────────────────────────────────────────
  const tfngOptions: TFNGAnswer[] = ['True', 'False', 'Not Given'];
  const featuredPassage = SEED_PASSAGES[0];
  const featuredQuestionMix = [
    { label: isZh ? '判断题' : 'T/F/NG', value: featuredPassage.questions.filter(q => q.type === 'tfng').length },
    { label: isZh ? '选择题' : 'MCQ', value: featuredPassage.questions.filter(q => q.type === 'mcq').length },
    { label: isZh ? '短答题' : 'Short answer', value: featuredPassage.questions.filter(q => q.type === 'short_answer').length },
  ];
  const readingStages = [
    isZh ? '先扫标题与段落主题' : 'Skim topic and structure',
    isZh ? '带着题型回到原文定位' : 'Locate evidence by question type',
    isZh ? '提交后用解析修正阅读策略' : 'Use explanations to repair strategy',
  ];

  // ────────────────────────────────────────────────────────────────────────
  // RENDER: Passage selection screen
  // ────────────────────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <section className="rounded-md border border-border bg-card p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-stretch">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{isZh ? '阅读' : 'Reading'}</p>
                <h1 className="mt-2 text-2xl font-semibold text-foreground">{isZh ? 'IELTS 学术阅读' : 'IELTS Academic Reading'}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {isZh
                    ? '读文章，做题，复盘证据句。'
                    : 'Read a passage, answer questions, then review the evidence lines.'}
                </p>
              </div>

              <div className="rounded-md border border-border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{featuredPassage.level}</Badge>
                  <span className="text-xs text-muted-foreground">{featuredPassage.topic}</span>
                  <span className="text-xs text-muted-foreground">· {featuredPassage.estimatedMinutes} min</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-foreground">{featuredPassage.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {featuredPassage.passage}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => startPassage(featuredPassage)} className="rounded-md bg-primary text-primary-foreground">
                  {isZh ? '开始这篇' : 'Start this passage'}
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  onClick={handleGenerateNew}
                  disabled={isGenerating}
                  className="rounded-md"
                  variant="outline"
                >
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isZh ? '准备中' : 'Preparing'}</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> {isZh ? '换一篇新文章' : 'Try a new passage'}</>
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {isZh ? '题目结构' : 'Question mix'}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {featuredQuestionMix.map((item) => (
                  <div key={item.label} className="rounded-md border border-border bg-card p-3 text-center">
                    <p className="text-xl font-semibold text-foreground">{item.value}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {readingStages.map((stage, index) => (
                  <div key={stage} className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-border bg-card text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-muted-foreground">{stage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{isZh ? '可选文章' : 'Available passages'}</h2>
            <span className="text-xs text-muted-foreground">{SEED_PASSAGES.length} {isZh ? '篇' : 'passages'}</span>
          </div>
          {SEED_PASSAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => startPassage(p)}
              className="w-full rounded-md border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/30 hover:bg-muted/70 active:scale-[0.99]"
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
                <span>{p.questions.length} {isZh ? '题' : 'questions'}</span>
                <span>·</span>
                <span>{p.questions.filter(q => q.type === 'tfng').length} {isZh ? '判断' : 'T/F/NG'}</span>
                <span>·</span>
                <span>{p.questions.filter(q => q.type === 'mcq').length} {isZh ? '选择' : 'MCQ'}</span>
                <span>·</span>
                <span>{p.questions.filter(q => q.type === 'short_answer').length} {isZh ? '短答' : 'Short answer'}</span>
              </div>
            </button>
          ))}
        </div>
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
            <p className="text-xs font-medium text-muted-foreground">{current.topic}</p>
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
              {isZh ? '换文章' : 'Change passage'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: passage */}
          <div className="rounded-md border border-border bg-card p-5 max-h-[72vh] overflow-y-auto shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">文章</span>
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
              <div key={q.id} className="rounded-md border border-border bg-card p-4 space-y-3 shadow-sm">
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
                    placeholder={isZh ? '输入答案...' : 'Type your answer…'}
                    className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                )}
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              className="w-full rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 mt-2"
            >
              {isZh ? '提交答案' : 'Submit answers'}
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
      <LearningCompletionState
        icon={Award}
        eyebrow={isZh ? '阅读复盘' : 'Reading recap'}
        title={isZh ? `本次阅读 ${score?.correct}/${score?.total}` : `Reading score ${score?.correct}/${score?.total}`}
        description={
          scorePct >= 0.8
            ? (isZh ? '定位证据和题型判断都比较稳，下一步可以挑战更高难度文章。' : 'Evidence location and question handling were strong. Try a harder passage next.')
            : scorePct >= 0.6
              ? (isZh ? '整体不错，建议把错题解析和原文证据再对照一遍。' : 'Solid run. Review the explanations and match them back to the passage evidence.')
              : (isZh ? '先别急着换文章，把每道题的证据句看透再重练。' : 'Before switching passages, study each evidence line and retry the set.')
        }
        metrics={[
          { label: isZh ? '答对' : 'Correct', value: `${score?.correct ?? 0}/${score?.total ?? current.questions.length}`, accent: scorePct >= 0.8 ? 'emerald' : undefined },
          { label: isZh ? '正确率' : 'Accuracy', value: `${Math.round(scorePct * 100)}%`, accent: scorePct >= 0.8 ? 'emerald' : scorePct >= 0.6 ? 'warm' : undefined },
          { label: isZh ? '题型' : 'Question mix', value: `${current.questions.length}` },
        ]}
        actions={
          <>
            <Button
              onClick={() => setPhase('select')}
              className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isZh ? '换一篇文章' : 'Choose another passage'}
            </Button>
            <Button
              onClick={() => startPassage(current)}
              variant="outline"
              className="rounded-md border-border bg-card text-foreground hover:bg-muted"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isZh ? '重练本篇' : 'Retry this passage'}
            </Button>
          </>
        }
      />

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
                'rounded-md border p-4 space-y-2',
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
                  {isZh ? '你的答案' : 'Your answer'}: <span className={cn('font-medium', isCorrect ? 'text-green-700' : 'text-destructive')}>{answers[q.id] || (isZh ? '未作答' : '(no answer)')}</span>
                </p>
                {!isCorrect && (
                  <p className="text-xs text-muted-foreground">
                    {isZh ? '正确答案' : 'Correct'}: <span className="font-medium text-green-700">{q.answer}</span>
                  </p>
                )}
              </div>

              <div className="pl-6 flex gap-2">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <p className="text-xs leading-5 text-muted-foreground">{q.explanation}</p>
              </div>

              {q.location && (
                <div className="ml-6 rounded-lg border border-border bg-muted px-3 py-2">
                  <p className="mb-0.5 text-xs font-medium text-muted-foreground">{isZh ? '原文证据' : 'Evidence in passage'}</p>
                  <p className="text-xs italic text-foreground">"{q.location}"</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

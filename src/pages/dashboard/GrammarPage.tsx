/**
 * GrammarPage — IELTS Grammar Rules + Fill-in-the-Blank Practice
 * ──────────────────────────────────────────────────────────────────
 * Three phases: browse rules → practice → review
 * Covers: articles, tenses, prepositions, conditionals, passives, modals
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
  Trophy,
  RotateCcw,
  Play,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { recordLearningEvent } from '@/services/learningEvents';
import { incrementReviewCount } from '@/services/gamification';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type GrammarCategory =
  | 'articles'
  | 'tenses'
  | 'prepositions'
  | 'conditionals'
  | 'passive'
  | 'modals';

interface GrammarExample {
  en: string;
  zh: string;
}

interface PracticeItem {
  id: number;
  sentence: string;      // use ___ for the blank
  answer: string;        // expected fill
  hint?: string;         // optional grammatical hint
  explanation: string;   // why this answer
  explanationZh: string;
}

interface GrammarRule {
  id: string;
  category: GrammarCategory;
  title: string;
  titleZh: string;
  level: 'B1' | 'B2' | 'C1';
  explanation: string;
  explanationZh: string;
  commonErrors: string[];
  examples: GrammarExample[];
  practice: PracticeItem[];
}

// ─── Seed Grammar Rules ───────────────────────────────────────────────────────

const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'grammar-articles-001',
    category: 'articles',
    title: 'Definite vs Indefinite Articles',
    titleZh: '定冠词与不定冠词',
    level: 'B1',
    explanation:
      'Use "a/an" (indefinite) when introducing something for the first time or when it is one of many. Use "the" (definite) when both speaker and listener know which specific thing is meant, or when it is unique.',
    explanationZh:
      '首次提到某物或泛指同类事物时用 a/an（不定冠词）。当说话双方都清楚指的是哪个具体事物，或该事物是唯一的时，用 the（定冠词）。',
    commonErrors: [
      'Using "a" with uncountable nouns (❌ "a water" → ✓ "water" or "some water")',
      'Omitting "the" before superlatives (❌ "best option" → ✓ "the best option")',
      'Using "the" before proper nouns without a reason (❌ "the London" → ✓ "London")',
    ],
    examples: [
      { en: 'I saw a dog in the park. The dog was barking loudly.', zh: '我在公园看见一只狗。那只狗在大声叫。' },
      { en: 'The sun rises in the east.', zh: '太阳从东方升起。' },
    ],
    practice: [
      {
        id: 1,
        sentence: 'She bought ___ new laptop yesterday.',
        answer: 'a',
        hint: 'First mention, one of many',
        explanation: '"A" is used because this is the first mention of the laptop and it is one of many possible laptops.',
        explanationZh: '首次提到这台笔记本电脑，用 a。',
      },
      {
        id: 2,
        sentence: '___ Amazon is the largest river in South America.',
        answer: 'The',
        hint: 'Unique geographical feature',
        explanation: '"The" is used with rivers and unique geographical features.',
        explanationZh: '河流名称前通常加 the，且亚马逊河是独一无二的。',
      },
      {
        id: 3,
        sentence: 'Can you pass me ___ salt, please?',
        answer: 'the',
        hint: 'Both parties know which salt is meant',
        explanation: '"The" is used because there is only one salt on the table and both speakers know which one.',
        explanationZh: '餐桌上只有一个盐瓶，双方都清楚指的是哪个，用 the。',
      },
      {
        id: 4,
        sentence: 'He wants to become ___ engineer.',
        answer: 'an',
        hint: 'Profession, first mention, vowel sound',
        explanation: '"An" is used before words that begin with a vowel sound (engineer starts with /e/).',
        explanationZh: 'engineer 以元音音素 /e/ 开头，所以用 an。',
      },
    ],
  },
  {
    id: 'grammar-tenses-001',
    category: 'tenses',
    title: 'Present Perfect vs Simple Past',
    titleZh: '现在完成时 vs 一般过去时',
    level: 'B2',
    explanation:
      'Use the Present Perfect (have/has + past participle) for actions with a connection to the present — recent events, life experiences, or actions with unspecified time. Use Simple Past for completed actions at a specific past time.',
    explanationZh:
      '现在完成时（have/has + 过去分词）用于与现在有联系的动作——近期事件、人生经历或时间未指明的动作。一般过去时用于在特定过去时间点完成的动作。',
    commonErrors: [
      'Using Simple Past with "yet", "already", "just" (❌ "Did you eat yet?" → ✓ "Have you eaten yet?")',
      'Using Present Perfect with a specific past time (❌ "I have seen her yesterday" → ✓ "I saw her yesterday")',
    ],
    examples: [
      { en: 'I have visited Paris three times. (life experience)', zh: '我去过巴黎三次。（人生经历）' },
      { en: 'I visited Paris in 2019. (specific past time)', zh: '我2019年去了巴黎。（特定过去时间）' },
    ],
    practice: [
      {
        id: 1,
        sentence: 'I ___ (never / visit) Japan, but I hope to go someday.',
        answer: 'have never visited',
        hint: 'Life experience without specific time',
        explanation: '"Have never visited" uses Present Perfect for a life experience (no specific time given).',
        explanationZh: '没有具体时间的人生经历用现在完成时。',
      },
      {
        id: 2,
        sentence: 'She ___ (finish) her report at 6 PM yesterday.',
        answer: 'finished',
        hint: 'Specific past time',
        explanation: '"Finished" (Simple Past) is used because "at 6 PM yesterday" is a specific past time.',
        explanationZh: '"at 6 PM yesterday" 是特定过去时间，用一般过去时。',
      },
      {
        id: 3,
        sentence: '___ you ___ (hear) the news yet?',
        answer: 'Have … heard',
        hint: '"Yet" signals Present Perfect',
        explanation: '"Yet" is a signal word for the Present Perfect — it implies the action may have happened up to now.',
        explanationZh: 'yet 是现在完成时的信号词。',
      },
      {
        id: 4,
        sentence: 'The company ___ (launch) its new product last Tuesday.',
        answer: 'launched',
        hint: 'Last Tuesday = specific past time',
        explanation: '"Last Tuesday" specifies a past time, so Simple Past is required.',
        explanationZh: '"last Tuesday" 指定了过去时间，用一般过去时。',
      },
    ],
  },
  {
    id: 'grammar-prepositions-001',
    category: 'prepositions',
    title: 'Prepositions of Time: in / on / at',
    titleZh: '时间介词：in / on / at',
    level: 'B1',
    explanation:
      '"At" is used for precise times and fixed expressions. "On" is used for days and dates. "In" is used for longer periods — months, years, seasons, centuries.',
    explanationZh:
      '"at" 用于精确时刻和固定表达；"on" 用于具体日期和星期；"in" 用于较长时间段——月份、年份、季节、世纪。',
    commonErrors: [
      'Using "in" for specific days (❌ "in Monday" → ✓ "on Monday")',
      'Using "on" for years (❌ "on 2020" → ✓ "in 2020")',
      'Missing preposition with "morning/afternoon/evening" (❌ "in the morning" ✓ for general, but ❌ "on Monday morning" → ✓ "on Monday morning" – no "in")',
    ],
    examples: [
      { en: 'The meeting is at 3 PM on Friday in March.', zh: '会议在三月的周五下午三点举行。' },
      { en: 'She was born in the 1990s.', zh: '她出生于20世纪90年代。' },
    ],
    practice: [
      {
        id: 1,
        sentence: 'The conference starts ___ 9 o\'clock sharp.',
        answer: 'at',
        hint: 'Precise time',
        explanation: '"At" is used with precise times.',
        explanationZh: '精确时刻用 at。',
      },
      {
        id: 2,
        sentence: 'We always have a big dinner ___ Christmas Day.',
        answer: 'on',
        hint: 'Specific calendar day',
        explanation: '"On" is used with specific days and dates.',
        explanationZh: '特定日期用 on。',
      },
      {
        id: 3,
        sentence: 'This building was constructed ___ the 19th century.',
        answer: 'in',
        hint: 'Century / long period',
        explanation: '"In" is used with centuries, decades, and long periods.',
        explanationZh: '世纪、年代等较长时间段用 in。',
      },
      {
        id: 4,
        sentence: 'I\'ll see you ___ the afternoon.',
        answer: 'in',
        hint: 'General part of the day',
        explanation: '"In" is used with general parts of the day (in the morning, in the afternoon, in the evening).',
        explanationZh: '一天中的大段时间用 in（in the morning/afternoon/evening）。',
      },
    ],
  },
  {
    id: 'grammar-conditionals-001',
    category: 'conditionals',
    title: 'Second Conditional',
    titleZh: '第二条件句',
    level: 'B2',
    explanation:
      'The Second Conditional is used for hypothetical or unlikely present/future situations. Structure: If + Past Simple, would + base verb. It implies the situation is imaginary or contrary to current reality.',
    explanationZh:
      '第二条件句用于假设或不太可能发生的现在/将来情况。结构：If + 一般过去时，would + 动词原形。暗示情况是想象的，与现实相反。',
    commonErrors: [
      'Using "would" in the if-clause (❌ "If I would have money..." → ✓ "If I had money...")',
      'Confusing with First Conditional (real possibility) vs Second (unreal/hypothetical)',
    ],
    examples: [
      { en: 'If I had more time, I would learn a new language.', zh: '如果我有更多时间，我会学一门新语言。' },
      { en: 'If she were taller, she would try out for the basketball team.', zh: '如果她再高一点，她会去参加篮球队试训。' },
    ],
    practice: [
      {
        id: 1,
        sentence: 'If I ___ (be) the CEO, I ___ (change) the company culture.',
        answer: 'were … would change',
        hint: 'Hypothetical situation',
        explanation: 'Second Conditional: "were" (past subjunctive) in the if-clause, "would + base verb" in the main clause.',
        explanationZh: '第二条件句：if 从句用 were，主句用 would + 动词原形。',
      },
      {
        id: 2,
        sentence: 'What ___ you ___ (do) if you ___ (win) the lottery?',
        answer: 'would … do … won',
        hint: 'Unlikely/hypothetical future',
        explanation: 'Second Conditional: main clause uses "would + do", if-clause uses Simple Past "won".',
        explanationZh: '彩票中奖是假设情况，用第二条件句。',
      },
      {
        id: 3,
        sentence: 'She ___ (travel) the world if she ___ (not have) so many responsibilities.',
        answer: 'would travel … didn\'t have',
        hint: 'Contrary to present reality',
        explanation: 'Second Conditional describes current reality as an obstacle: she has responsibilities (fact), so she cannot travel.',
        explanationZh: '与现实相反：她实际上有很多责任，所以无法旅行。用第二条件句。',
      },
    ],
  },
  {
    id: 'grammar-passive-001',
    category: 'passive',
    title: 'Passive Voice — Present and Past',
    titleZh: '被动语态——现在时与过去时',
    level: 'B2',
    explanation:
      'The passive voice is used when the action is more important than who performs it, or when the agent is unknown/unimportant. Present passive: am/is/are + past participle. Past passive: was/were + past participle.',
    explanationZh:
      '当动作比执行者更重要，或执行者未知/不重要时，用被动语态。现在时被动：am/is/are + 过去分词。过去时被动：was/were + 过去分词。',
    commonErrors: [
      'Using active instead of passive in formal/academic writing when agent is unknown',
      'Wrong auxiliary tense (❌ "The report is wrote" → ✓ "The report is written")',
    ],
    examples: [
      { en: 'The new bridge was built in 2018.', zh: '这座新桥建于2018年。' },
      { en: 'English is spoken in over 50 countries.', zh: '英语在50多个国家使用。' },
    ],
    practice: [
      {
        id: 1,
        sentence: 'The annual report ___ (publish) every January.',
        answer: 'is published',
        hint: 'Regular action, agent unimportant',
        explanation: 'Present passive: "is published" (is + past participle) because the agent is not the focus.',
        explanationZh: '现在时被动：is + published（过去分词）。',
      },
      {
        id: 2,
        sentence: 'Three new employees ___ (hire) last month.',
        answer: 'were hired',
        hint: 'Past action, agent unknown',
        explanation: 'Past passive: "were hired" (were + past participle) for a past event with no specified agent.',
        explanationZh: '过去时被动：were + hired（过去分词）。',
      },
      {
        id: 3,
        sentence: 'The email ___ (not send) yet — please check.',
        answer: 'has not been sent',
        hint: 'Present perfect passive',
        explanation: 'Present Perfect passive: "has not been sent" (has + been + past participle).',
        explanationZh: '现在完成时被动：has + been + sent（过去分词）。',
      },
    ],
  },
  {
    id: 'grammar-modals-001',
    category: 'modals',
    title: 'Modal Verbs for Deduction',
    titleZh: '情态动词表推断',
    level: 'C1',
    explanation:
      'Use "must" for strong logical deduction (almost certain). Use "might/could" for possibility (less certain). Use "can\'t" for near-certain negative deduction. These are followed by "be" (present/state) or "have been" (past).',
    explanationZh:
      '"must" 用于有力的逻辑推断（几乎确定）；"might/could" 用于可能性（较不确定）；"can\'t" 用于近乎确定的否定推断。后接 be（现在/状态）或 have been（过去）。',
    commonErrors: [
      'Using "must" for obligation and forgetting it also expresses deduction',
      'Using "mustn\'t" for negative deduction (❌ "She mustn\'t be home" → ✓ "She can\'t be home")',
    ],
    examples: [
      { en: 'He\'s been awake for 24 hours — he must be exhausted.', zh: '他已经24小时没睡了——他一定精疲力竭了。' },
      { en: 'She might be stuck in traffic.', zh: '她可能堵车了。' },
    ],
    practice: [
      {
        id: 1,
        sentence: 'Nobody answered the door. They ___ be out.',
        answer: 'must',
        hint: 'Strong logical deduction',
        explanation: '"Must" expresses strong logical deduction — the evidence (no one answered) leads to a confident conclusion.',
        explanationZh: '"must" 表示有力的逻辑推断——没人开门，所以几乎可以确定他们不在家。',
      },
      {
        id: 2,
        sentence: 'I\'m not sure, but she ___ have taken the earlier train.',
        answer: 'might',
        hint: 'Uncertain possibility',
        explanation: '"Might have taken" expresses a possible past action without certainty.',
        explanationZh: '"might" 表示不确定的可能性。',
      },
      {
        id: 3,
        sentence: 'That ___ be right — the data clearly shows the opposite.',
        answer: 'can\'t',
        hint: 'Near-certain negative deduction',
        explanation: '"Can\'t" is used for near-certain negative deductions — the evidence contradicts the claim.',
        explanationZh: '"can\'t" 用于近乎确定的否定推断——证据与说法矛盾。',
      },
      {
        id: 4,
        sentence: 'The lights are on and I hear music — someone ___ be home.',
        answer: 'must',
        hint: 'Strong positive deduction from evidence',
        explanation: 'Physical evidence (lights + music) supports a confident conclusion: "must be home".',
        explanationZh: '有具体证据（灯亮、有音乐），用 must 表示有把握的推断。',
      },
    ],
  },
];

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<GrammarCategory, { label: string; labelZh: string; color: string }> = {
  articles:     { label: 'Articles',     labelZh: '冠词',     color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  tenses:       { label: 'Tenses',       labelZh: '时态',     color: 'bg-[hsl(var(--accent-practice)/0.08)] text-[hsl(var(--accent-practice))] border-[hsl(var(--accent-practice)/0.2)]' },
  prepositions: { label: 'Prepositions', labelZh: '介词',     color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  conditionals: { label: 'Conditionals', labelZh: '条件句',   color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  passive:      { label: 'Passive Voice',labelZh: '被动语态', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  modals:       { label: 'Modal Verbs',  labelZh: '情态动词', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
};

const LEVEL_COLORS: Record<string, string> = {
  B1: 'bg-[hsl(var(--accent-practice)/0.08)] text-[hsl(var(--accent-practice))] border-[hsl(var(--accent-practice)/0.2)]',
  B2: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C1: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

// ─── Rule Card ────────────────────────────────────────────────────────────────

interface RuleCardProps {
  rule: GrammarRule;
  onPractice: (rule: GrammarRule) => void;
}

function RuleCard({ rule, onPractice }: RuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const catMeta = CATEGORY_META[rule.category];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 text-left flex items-center gap-3 hover:bg-muted transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-semibold', catMeta.color)}>
              {catMeta.labelZh}
            </span>
            <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-semibold', LEVEL_COLORS[rule.level])}>
              {rule.level}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">{rule.title}</p>
          <p className="text-xs text-muted-foreground">{rule.titleZh}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200', expanded && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-4 space-y-4">
              {/* Explanation */}
              <div className="rounded-xl bg-muted p-4 space-y-2">
                <p className="text-sm leading-6 text-foreground">{rule.explanation}</p>
                <p className="text-sm leading-6 text-muted-foreground">{rule.explanationZh}</p>
              </div>

              {/* Examples */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Examples</p>
                <div className="space-y-2">
                  {rule.examples.map((ex, i) => (
                    <div key={i} className="rounded-xl border border-border px-4 py-2.5">
                      <p className="text-sm text-foreground">{ex.en}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ex.zh}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Errors */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Common Errors</p>
                <ul className="space-y-1.5">
                  {rule.commonErrors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-0.5 flex-shrink-0 text-amber-400">⚠</span>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice CTA */}
              <Button
                onClick={() => onPractice(rule)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold"
              >
                <Play className="mr-2 h-3.5 w-3.5" />
                Practice ({rule.practice.length} questions)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Practice Item ────────────────────────────────────────────────────────────

interface PracticeCardProps {
  item: PracticeItem;
  index: number;
  userAnswer: string;
  onChange: (val: string) => void;
  submitted: boolean;
}

function PracticeCard({ item, index, userAnswer, onChange, submitted }: PracticeCardProps) {
  const isCorrect = submitted
    ? userAnswer.trim().toLowerCase() === item.answer.toLowerCase()
    : false;

  // Split sentence around ___
  const parts = item.sentence.split('___');

  return (
    <div className={cn(
      'rounded-xl border p-4 space-y-3 transition-all duration-300',
      !submitted
        ? 'border-border bg-card'
        : isCorrect
          ? 'border-primary/40 bg-primary/5'
          : 'border-destructive/30 bg-destructive/5',
    )}>
      {/* Question number + result indicator */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
          {index + 1}
        </span>
        <div className="flex-1">
          {/* Sentence with blank */}
          <p className="text-sm leading-7 text-foreground">
            {parts[0]}
            <span className={cn(
              'inline-block min-w-[80px] rounded-lg border-b-2 px-2 mx-1 text-center',
              !submitted ? 'border-blue-500/50 bg-blue-500/[0.06]' :
              isCorrect ? 'border-green-500/30 bg-green-50 text-green-700' :
              'border-destructive/30 bg-destructive/5 text-destructive',
            )}>
              {userAnswer || (submitted ? '—' : '___')}
            </span>
            {parts[1]}
          </p>
        </div>
        {submitted && (
          isCorrect
            ? <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            : <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
        )}
      </div>

      {/* Hint */}
      {item.hint && !submitted && (
        <div className="ml-8 flex items-center gap-1.5">
          <Lightbulb className="h-3 w-3 text-amber-400" />
          <p className="text-xs text-amber-500">{item.hint}</p>
        </div>
      )}

      {/* Input */}
      {!submitted && (
        <div className="ml-8">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Fill in the blank…"
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>
      )}

      {/* Explanation after submit */}
      {submitted && (
        <div className="ml-8 space-y-1.5">
          {!isCorrect && (
            <p className="text-xs font-semibold text-green-700">
              ✓ Correct: <span className="font-bold">{item.answer}</span>
            </p>
          )}
          <div className="rounded-xl bg-muted px-3 py-2 space-y-1">
            <p className="text-xs leading-5 text-foreground">{item.explanation}</p>
            <p className="text-xs leading-5 text-muted-foreground">{item.explanationZh}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = 'browse' | 'practice' | 'review';

export default function GrammarPage() {
  const { addStudySession } = useUserData();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('browse');
  const [activeRule, setActiveRule] = useState<GrammarRule | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [filterCategory, setFilterCategory] = useState<GrammarCategory | 'all'>('all');

  const filteredRules = useMemo(() =>
    filterCategory === 'all'
      ? GRAMMAR_RULES
      : GRAMMAR_RULES.filter((r) => r.category === filterCategory),
    [filterCategory],
  );

  const handlePractice = (rule: GrammarRule) => {
    setActiveRule(rule);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setPhase('practice');
  };

  const handleSubmit = () => {
    if (!activeRule) return;
    let correct = 0;
    for (const item of activeRule.practice) {
      const ua = (answers[item.id] ?? '').trim().toLowerCase();
      if (ua === item.answer.toLowerCase()) correct++;
    }
    setScore(correct);
    setSubmitted(true);
    setPhase('review');

    const pct = correct / activeRule.practice.length;
    const xp = pct >= 0.8 ? 20 : pct >= 0.5 ? 10 : 5;
    addStudySession(0, 0, xp, 0);
    toast.success(`+${xp} XP`, { description: `${correct}/${activeRule.practice.length} correct` });

    // Record learning event and gamification
    if (user?.id) {
      void recordLearningEvent({
        userId: user.id,
        eventName: 'grammar.practice_completed',
        payload: {
          ruleId: activeRule.id,
          category: activeRule.category,
          level: activeRule.level,
          correct,
          total: activeRule.practice.length,
          accuracy: pct,
          xp,
        },
      });
      incrementReviewCount(user.id, activeRule.practice.length);
    }
  };

  const handleBack = () => {
    setPhase('browse');
    setActiveRule(null);
    setAnswers({});
    setSubmitted(false);
  };

  // ── Browse phase ────────────────────────────────────────────────────────────

  if (phase === 'browse') {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Grammar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rules, examples, and fill-in-the-blank practice
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
              filterCategory === 'all'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            All
          </button>
          {Object.entries(CATEGORY_META).map(([cat, meta]) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat as GrammarCategory)}
              className={cn(
                'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                filterCategory === cat
                  ? meta.color
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {meta.labelZh}
            </button>
          ))}
        </div>

        {/* Rule list */}
        <div className="space-y-2">
          {filteredRules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} onPractice={handlePractice} />
          ))}
        </div>
      </div>
    );
  }

  // ── Practice / Review phase ─────────────────────────────────────────────────

  if ((phase === 'practice' || phase === 'review') && activeRule) {
    const totalQ = activeRule.practice.length;
    const allAnswered = activeRule.practice.every((item) => (answers[item.id] ?? '').trim().length > 0);
    const catMeta = CATEGORY_META[activeRule.category];

    return (
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        {/* Back */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to rules
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('rounded-md border px-2.5 py-0.5 text-[11px] font-semibold', catMeta.color)}>
                {catMeta.labelZh}
              </span>
              <span className={cn('rounded-md border px-2.5 py-0.5 text-[11px] font-semibold', LEVEL_COLORS[activeRule.level])}>
                {activeRule.level}
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{activeRule.title}</h2>
            <p className="text-sm text-muted-foreground">{activeRule.titleZh}</p>
          </div>
          {submitted && (
            <div className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold flex-shrink-0',
              score / totalQ >= 0.8 ? 'bg-green-100 text-green-700' :
              score / totalQ >= 0.5 ? 'bg-amber-500/15 text-amber-500' :
              'bg-destructive/10 text-destructive',
            )}>
              <Trophy className="h-4 w-4" />
              {score}/{totalQ}
            </div>
          )}
        </div>

        {/* Rule quick-reference */}
        {!submitted && (
          <div className="rounded-xl border border-border bg-muted px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Rule summary</p>
            </div>
            <p className="text-xs leading-5 text-foreground">{activeRule.explanation}</p>
          </div>
        )}

        {/* Practice items */}
        <div className="space-y-3">
          {activeRule.practice.map((item, i) => (
            <PracticeCard
              key={item.id}
              item={item}
              index={i}
              userAnswer={answers[item.id] ?? ''}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [item.id]: val }))}
              submitted={submitted}
            />
          ))}
        </div>

        {/* Submit / Reset */}
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold disabled:opacity-50"
          >
            Check Answers
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => { setAnswers({}); setSubmitted(false); setPhase('practice'); }}
              variant="outline"
              className="w-full rounded-md border-border hover:bg-muted"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full rounded-md border-border hover:bg-muted"
            >
              <Layers className="mr-2 h-4 w-4" /> More Rules
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

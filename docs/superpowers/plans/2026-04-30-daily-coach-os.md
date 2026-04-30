# Daily Coach OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the first Daily Coach OS slice: a deterministic daily plan object, a lightweight lexicon adapter, Today integration, Coach handoff, and focused tests.

**Architecture:** Add pure TypeScript modules first, then wire them into Today and Coach. The daily plan wraps existing `DailyMissionCard` decisions so we do not duplicate the recommendation engine, while `LexicalEntry` adapts current `WordData` into the first dictionary-kernel read model.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Router, existing shadcn-style UI components.

---

## File Structure

- Create `src/features/lexicon/lexicalEntry.ts`: converts current `WordData` into a richer dictionary-kernel read model.
- Create `src/features/lexicon/lexicalEntry.test.ts`: pins adapter behavior and missing-field fallbacks.
- Create `src/features/learning/dailyCoachPlan.ts`: builds `DailyCoachPlan` from `DailyMissionCard`, learner evidence, and optional lexical focus.
- Create `src/features/learning/dailyCoachPlan.test.ts`: pins review pressure, exam/weakness, and lexical-focus plan behavior.
- Modify `src/pages/dashboard/TodayPage.tsx`: render Daily Coach OS brief, evidence chips, and lexicon focus from `DailyCoachPlan`.
- Modify `src/pages/dashboard/ChatPage.tsx`: receive a daily plan handoff through query params and show a small "Daily plan loaded" card that can fill the composer.
- Modify `src/features/learning/routeRegistry.ts`: rename visible Vocabulary language toward Lexicon while keeping `/dashboard/vocabulary`.
- Modify `src/pages/dashboard/VocabularyBankPage.tsx`: shift page copy from "word book list" toward "Lexicon".
- Modify `.gitignore`: ignore `.superpowers/` visual companion cache.

---

### Task 1: LexicalEntry Adapter

**Files:**
- Create: `src/features/lexicon/lexicalEntry.test.ts`
- Create: `src/features/lexicon/lexicalEntry.ts`

- [x] **Step 1: Write the failing adapter tests**

Create `src/features/lexicon/lexicalEntry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { WordData } from '@/data/words';
import { buildLexicalSummary, toLexicalEntry } from './lexicalEntry';

const baseWord: WordData = {
  id: 'w-test',
  word: 'approach',
  phonetic: '/əˈprəʊtʃ/',
  partOfSpeech: 'n./v.',
  definition: 'a way of dealing with something',
  definitionZh: '方法；处理方式',
  examples: [{ en: 'We need a new approach to learning.', zh: '我们需要一种新的学习方法。' }],
  synonyms: ['method', 'strategy'],
  antonyms: ['avoidance'],
  collocations: ['practical approach', 'new approach'],
  level: 'B2',
  topic: 'academic',
  etymology: 'From Old French aprochier.',
  memoryTip: 'A path you approach with.',
};

describe('lexicalEntry adapter', () => {
  it('turns WordData into a single-sense dictionary entry', () => {
    const entry = toLexicalEntry(baseWord);

    expect(entry.id).toBe('w-test');
    expect(entry.headword).toBe('approach');
    expect(entry.cefrLevel).toBe('B2');
    expect(entry.ieltsRelevance).toBe('core');
    expect(entry.senses[0]).toMatchObject({
      partOfSpeech: 'n./v.',
      definition: 'a way of dealing with something',
      definitionZh: '方法；处理方式',
    });
    expect(entry.senses[0].collocations).toEqual(['practical approach', 'new approach']);
    expect(entry.trainingTemplates.map((item) => item.type)).toEqual(['recall', 'collocation', 'usage']);
  });

  it('keeps missing optional fields safe for imported words', () => {
    const entry = toLexicalEntry({
      ...baseWord,
      examples: [],
      synonyms: [],
      antonyms: [],
      collocations: [],
      topic: '',
      memoryTip: undefined,
      etymology: undefined,
    });

    expect(entry.topic).toBe('general');
    expect(entry.senses[0].examples).toEqual([]);
    expect(entry.trainingTemplates.map((item) => item.type)).toEqual(['recall', 'usage']);
  });

  it('builds localized lexicon summaries', () => {
    const entry = toLexicalEntry(baseWord);

    expect(buildLexicalSummary(entry, 'zh')).toContain('B2');
    expect(buildLexicalSummary(entry, 'zh')).toContain('方法');
    expect(buildLexicalSummary(entry, 'en')).toContain('a way of dealing');
  });
});
```

- [x] **Step 2: Run the adapter test and verify RED**

Run: `npm test -- src/features/lexicon/lexicalEntry.test.ts`

Expected: FAIL because `src/features/lexicon/lexicalEntry.ts` does not exist.

- [x] **Step 3: Implement the adapter**

Create `src/features/lexicon/lexicalEntry.ts` with:

```ts
import type { WordData } from '@/data/words';

export type IeltsRelevance = 'core' | 'useful' | 'general';

export interface LexicalExample {
  en: string;
  zh: string;
}

export interface LexicalSense {
  id: string;
  partOfSpeech: string;
  definition: string;
  definitionZh: string;
  examples: LexicalExample[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
}

export interface LexicalTrainingTemplate {
  type: 'recall' | 'collocation' | 'usage';
  label: { en: string; zh: string };
  prompt: string;
  promptZh: string;
}

export interface LexicalEntry {
  id: string;
  headword: string;
  phonetic: string;
  cefrLevel: WordData['level'];
  topic: string;
  ieltsRelevance: IeltsRelevance;
  senses: LexicalSense[];
  memoryTip?: string;
  etymology?: string;
  commonMistakes: string[];
  trainingTemplates: LexicalTrainingTemplate[];
  source: 'word_data';
}

const IELTS_CORE_TOPICS = new Set(['academic', 'education', 'science', 'business']);

function inferIeltsRelevance(word: WordData): IeltsRelevance {
  if (IELTS_CORE_TOPICS.has((word.topic || '').toLowerCase())) return 'core';
  if (word.level === 'B2' || word.level === 'C1') return 'useful';
  return 'general';
}

function buildTrainingTemplates(word: WordData): LexicalTrainingTemplate[] {
  const templates: LexicalTrainingTemplate[] = [
    {
      type: 'recall',
      label: { en: 'Meaning recall', zh: '词义回想' },
      prompt: `Explain "${word.word}" in one clear English sentence.`,
      promptZh: `用一句清楚的英文解释 "${word.word}"。`,
    },
  ];

  if ((word.collocations || []).length > 0) {
    templates.push({
      type: 'collocation',
      label: { en: 'Collocation drill', zh: '搭配训练' },
      prompt: `Use one collocation with "${word.word}" in an IELTS-style sentence.`,
      promptZh: `用 "${word.word}" 的一个搭配写一句 IELTS 风格句子。`,
    });
  }

  templates.push({
    type: 'usage',
    label: { en: 'Usage check', zh: '用法检查' },
    prompt: `Write a short sentence using "${word.word}" naturally.`,
    promptZh: `自然地使用 "${word.word}" 写一个短句。`,
  });

  return templates;
}

export function toLexicalEntry(word: WordData): LexicalEntry {
  return {
    id: word.id,
    headword: word.word,
    phonetic: word.phonetic || '',
    cefrLevel: word.level,
    topic: word.topic?.trim() || 'general',
    ieltsRelevance: inferIeltsRelevance(word),
    senses: [
      {
        id: `${word.id}:sense:1`,
        partOfSpeech: word.partOfSpeech || '',
        definition: word.definition || '',
        definitionZh: word.definitionZh || '',
        examples: word.examples || [],
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        collocations: word.collocations || [],
      },
    ],
    memoryTip: word.memoryTip,
    etymology: word.etymology,
    commonMistakes: [],
    trainingTemplates: buildTrainingTemplates(word),
    source: 'word_data',
  };
}

export function buildLexicalSummary(entry: LexicalEntry, language: string): string {
  const sense = entry.senses[0];
  const definition = language.startsWith('zh')
    ? sense.definitionZh || sense.definition
    : sense.definition || sense.definitionZh;
  return `${entry.headword} · ${entry.cefrLevel} · ${definition}`;
}
```

- [x] **Step 4: Run the adapter test and verify GREEN**

Run: `npm test -- src/features/lexicon/lexicalEntry.test.ts`

Expected: PASS.

---

### Task 2: DailyCoachPlan Builder

**Files:**
- Create: `src/features/learning/dailyCoachPlan.test.ts`
- Create: `src/features/learning/dailyCoachPlan.ts`

- [x] **Step 1: Write failing plan-builder tests**

Create `src/features/learning/dailyCoachPlan.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { DailyMissionCard } from '@/types/learning';
import type { LearningProfile } from '@/types/examContent';
import type { LexicalEntry } from '@/features/lexicon/lexicalEntry';
import { buildDailyCoachPlan } from './dailyCoachPlan';

const profile: LearningProfile = {
  userId: 'user-1',
  level: 'B2',
  target: 'IELTS 7.0',
  tracks: ['exam_boost'],
  dailyMinutes: 20,
  languagePreference: 'zh',
  updatedAt: '2026-04-30T00:00:00.000Z',
};

function missionCard(overrides: Partial<DailyMissionCard['primaryAction']> = {}): DailyMissionCard {
  const primaryAction = {
    id: 'primary-review',
    surface: 'review' as const,
    title: 'Clear your due reviews',
    titleZh: '优先清空到期复习',
    description: '8 cards are waiting.',
    descriptionZh: '当前有 8 个到期卡片。',
    cta: 'Start review',
    ctaZh: '开始复习',
    href: '/dashboard/review',
    estimatedMinutes: 12,
    priority: 'high' as const,
    reason: 'due_words',
    ...overrides,
  };

  return {
    headline: primaryAction.title,
    headlineZh: primaryAction.titleZh,
    support: primaryAction.description,
    supportZh: primaryAction.descriptionZh,
    completionPct: 25,
    estimatedMinutes: primaryAction.estimatedMinutes,
    primaryAction,
    secondaryActions: [],
  };
}

const lexicalEntry: LexicalEntry = {
  id: 'word-1',
  headword: 'approach',
  phonetic: '/əˈprəʊtʃ/',
  cefrLevel: 'B2',
  topic: 'academic',
  ieltsRelevance: 'core',
  senses: [{
    id: 'word-1:sense:1',
    partOfSpeech: 'n.',
    definition: 'a way of dealing with something',
    definitionZh: '方法',
    examples: [],
    synonyms: [],
    antonyms: [],
    collocations: ['practical approach'],
  }],
  commonMistakes: [],
  trainingTemplates: [],
  source: 'word_data',
};

describe('buildDailyCoachPlan', () => {
  it('wraps due-review missions as review pressure plans', () => {
    const plan = buildDailyCoachPlan({
      userId: 'user-1',
      profile,
      missionCard: missionCard(),
      dueWordsCount: 8,
      dailyWordsCount: 10,
      learnedTodayCount: 2,
      weaknesses: [],
      activeBookName: 'IELTS Core',
    });

    expect(plan.reason).toBe('review_pressure');
    expect(plan.primaryTask.href).toBe('/dashboard/review');
    expect(plan.evidence.some((item) => item.id === 'due-reviews' && item.value === '8')).toBe(true);
    expect(plan.coachHref).toContain('dailyPlan=');
    expect(plan.coachPrompt).toContain('due review pressure');
  });

  it('keeps exam and weakness context visible in the coach handoff', () => {
    const plan = buildDailyCoachPlan({
      userId: 'user-1',
      profile,
      missionCard: missionCard({
        id: 'primary-exam',
        surface: 'exam',
        title: 'Boost your score with Task 2',
        titleZh: '先做 Task 2 提分训练',
        href: '/dashboard/exam',
        reason: 'exam_boost',
      }),
      dueWordsCount: 0,
      dailyWordsCount: 10,
      learnedTodayCount: 10,
      weaknesses: [{ tag: 'coherence', title: 'Coherence', titleZh: '连贯衔接', count: 5, emphasis: 'urgent' }],
      activeBookName: 'IELTS Core',
    });

    expect(plan.reason).toBe('exam_boost');
    expect(plan.evidence.map((item) => item.id)).toContain('weakness');
    expect(plan.coachPrompt).toContain('Coherence');
  });

  it('adds dictionary focus when a lexical entry is available', () => {
    const plan = buildDailyCoachPlan({
      userId: 'user-1',
      profile,
      missionCard: missionCard({ reason: 'today_words', href: '/dashboard/today' }),
      dueWordsCount: 0,
      dailyWordsCount: 10,
      learnedTodayCount: 3,
      weaknesses: [],
      activeBookName: 'IELTS Core',
      lexicalFocus: lexicalEntry,
    });

    expect(plan.reason).toBe('daily_vocabulary');
    expect(plan.dictionaryFocus?.headword).toBe('approach');
    expect(plan.evidence.map((item) => item.id)).toContain('dictionary-focus');
    expect(plan.coachPrompt).toContain('approach');
  });
});
```

- [x] **Step 2: Run the plan-builder test and verify RED**

Run: `npm test -- src/features/learning/dailyCoachPlan.test.ts`

Expected: FAIL because `src/features/learning/dailyCoachPlan.ts` does not exist.

- [x] **Step 3: Implement the plan builder**

Create `src/features/learning/dailyCoachPlan.ts` with pure functions and exported types:

```ts
import type { DailyMissionCard, NextBestAction, WeaknessSnapshot } from '@/types/learning';
import type { LearningProfile } from '@/types/examContent';
import type { LexicalEntry } from '@/features/lexicon/lexicalEntry';

export type DailyCoachPlanReason =
  | 'review_pressure'
  | 'exam_boost'
  | 'weakness_drill'
  | 'daily_vocabulary'
  | 'coach_checkin';

export interface DailyCoachEvidenceItem {
  id: string;
  label: { en: string; zh: string };
  value: string;
  tone: 'neutral' | 'coach' | 'practice' | 'warning';
}

export interface DailyCoachPlan {
  id: string;
  reason: DailyCoachPlanReason;
  briefTitle: { en: string; zh: string };
  brief: { en: string; zh: string };
  primaryTask: NextBestAction;
  secondaryTasks: NextBestAction[];
  evidence: DailyCoachEvidenceItem[];
  dictionaryFocus?: Pick<LexicalEntry, 'id' | 'headword' | 'cefrLevel' | 'topic' | 'ieltsRelevance'>;
  coachPrompt: string;
  coachHref: string;
  completion: { en: string; zh: string };
}

export interface BuildDailyCoachPlanArgs {
  userId: string;
  profile: LearningProfile;
  missionCard: DailyMissionCard;
  dueWordsCount: number;
  dailyWordsCount: number;
  learnedTodayCount: number;
  weaknesses: WeaknessSnapshot[];
  activeBookName?: string | null;
  lexicalFocus?: LexicalEntry | null;
}
```

The implementation must:

- map `recovery_mode` and `due_words` to `review_pressure`
- map `exam_boost` to `exam_boost`
- map `weakness_drill` and `practice_gap` to `weakness_drill`
- map `today_words` to `daily_vocabulary`
- include evidence items for target, due reviews, daily progress, weakness, and dictionary focus
- generate a `/dashboard/chat?dailyPlan=...` handoff URL with `reason`, `focus`, and `prompt`

- [x] **Step 4: Run the plan-builder test and verify GREEN**

Run: `npm test -- src/features/learning/dailyCoachPlan.test.ts`

Expected: PASS.

---

### Task 3: Today Page Integration

**Files:**
- Modify: `src/pages/dashboard/TodayPage.tsx`

- [x] **Step 1: Add imports and derived plan**

Import:

```ts
import { buildDailyCoachPlan } from '@/features/learning/dailyCoachPlan';
import { toLexicalEntry } from '@/features/lexicon/lexicalEntry';
```

Derive `lexicalFocus` from `currentWord`, then derive `dailyCoachPlan` from `missionCard`, profile, due counts, weakness list, and lexical focus.

- [x] **Step 2: Replace ad-hoc `coachNextStep` content**

Use `dailyCoachPlan.briefTitle`, `dailyCoachPlan.brief`, and `dailyCoachPlan.coachHref` for the Coach OS brief. Keep the old fallback only for loading/empty states.

- [x] **Step 3: Add evidence chips to the Coach OS section**

Render `dailyCoachPlan.evidence.slice(0, 4)` as compact chips below the brief. Each chip shows localized label and value.

- [x] **Step 4: Add dictionary focus to the rail**

When `dailyCoachPlan.dictionaryFocus` exists, render a small "Lexicon focus" rail card showing headword, CEFR, topic, IELTS relevance, and a link to `/dashboard/vocabulary?q=<headword>`.

- [x] **Step 5: Run focused build/test check**

Run: `npm test -- src/features/learning/dailyCoachPlan.test.ts src/features/lexicon/lexicalEntry.test.ts`

Expected: PASS.

---

### Task 4: Coach Handoff UI

**Files:**
- Modify: `src/pages/dashboard/ChatPage.tsx`

- [x] **Step 1: Read query params**

Use `useSearchParams` from `react-router-dom` to read `dailyPlan`, `reason`, `focus`, and `prompt`.

- [x] **Step 2: Show "Daily plan loaded" card**

When `dailyPlan` and `prompt` exist, render a compact card below the existing Coach Brief. The card should show localized title, reason/focus, and a button that fills the composer with the decoded prompt.

- [x] **Step 3: Keep the handoff user-controlled**

Do not auto-send the prompt. The button only calls `setInput(decodedPrompt)`.

- [x] **Step 4: Run type/lint check**

Run: `npm run build`

Expected: PASS.

---

### Task 5: Lexicon Language and Cache Hygiene

**Files:**
- Modify: `src/features/learning/routeRegistry.ts`
- Modify: `src/pages/dashboard/VocabularyBankPage.tsx`
- Modify: `.gitignore`

- [x] **Step 1: Rename visible route metadata**

Keep route id and path unchanged, but change visible language:

```ts
label: { en: 'Lexicon', zh: '词典' },
description: { en: 'Dictionary, word books, and lexical search.', zh: '词典、词书与词汇检索。' },
pageTitle: { en: 'Lexicon · VocabDaily', zh: '词典 · VocabDaily' },
searchAliases: ['lexicon', 'dictionary', 'vocabulary', 'words', '词典', '词书', '词汇', 'deck'],
```

- [x] **Step 2: Update Vocabulary page copy**

Change the main heading to `Lexicon · 词典`, subtitle to `Dictionary kernel, word books, and review-ready lexical assets.`, and book management heading to `词典与词书管理`.

- [x] **Step 3: Ignore visual companion cache**

Add `.superpowers/` to `.gitignore`.

- [x] **Step 4: Run registry and route tests**

Run: `npm test -- src/features/learning/routeRegistry.test.ts`

Expected: PASS.

---

### Task 6: Final Verification

**Files:**
- All touched files.

- [x] **Step 1: Run full tests**

Run: `npm test`

Expected: all tests pass.

- [x] **Step 2: Run lint**

Run: `npm run lint -- --format stylish`

Expected: exit 0.

- [x] **Step 3: Run i18n check**

Run: `npm run check:i18n`

Expected: `i18n key parity check passed.`

- [x] **Step 4: Run build**

Run: `npm run build`

Expected: build exits 0. The existing Vite chunk-size warning is acceptable.

- [x] **Step 5: Browser smoke**

Start or reuse the local dev server, then check:

- `/dashboard/today` desktop and 375px mobile.
- Coach OS brief appears and has one main CTA.
- Evidence chips do not overflow.
- Lexicon focus card links to vocabulary search.
- `/dashboard/chat?dailyPlan=...` shows the daily plan handoff card.

- [x] **Step 6: Commit**

Stage only project files and commit:

```bash
git add .gitignore src docs/superpowers/plans/2026-04-30-daily-coach-os.md
git commit -m "feat: add daily coach os foundation"
```

Do not stage `.claude/`.

---

## Self-Review

- Spec coverage: the plan implements DailyCoachPlan, LexicalEntry, Today integration, Coach handoff, Lexicon language, and verification.
- Placeholder scan: no `TBD`, `TODO`, or open-ended "handle later" instructions remain.
- Type consistency: `DailyCoachPlan`, `LexicalEntry`, `DailyMissionCard`, and `NextBestAction` names are consistent across tasks.
- Scope check: this is the first slice only; it does not rebuild every practice page or ship a full dictionary corpus.

# VocabDaily AI — 系统设计文档 v2.0
## 从「玩具级」到「生产级」完整升级方案

> **当前状态**：102 词、简化 SM-2、AI 功能多为 stub、读写听说 3 项缺失完整实现
> **目标状态**：5000+ 词、完整 FSRS 算法、Claude 驱动四技能、实时同步、可付费扩展

---

## 一、系统现状诊断（As-Is）

### 1.1 架构简图（现状）

```
Browser (React + localStorage)
        │
        ├──[写操作]──► localStorage (instant)
        │                 │
        │                 └──[fire-and-forget]──► Supabase PostgreSQL
        │
        └──[读操作]──► localStorage (primary)
                          └──[miss]──► Supabase (fallback, never reconciled)

Edge Functions (Supabase)
  ├── ai-grade-writing      (调用 LLM，有 heuristic 后备)
  ├── ai-chat               (AI 对话，有 fallback)
  ├── ai-generate-micro-lesson
  └── memory-*              (agent 记忆系统，调用路径不完整)
```

### 1.2 核心问题清单

| 类别 | 问题 | 严重程度 |
|------|------|----------|
| 数据 | 词库仅 102 词，无法支撑真实学习 | 🔴 P0 |
| 算法 | SM-2 缺少 quality 参数、无 lapse 恢复、无真正间隔优化 | 🔴 P0 |
| 同步 | 双写无冲突解决，多设备数据会分裂 | 🔴 P0 |
| 类型 | UserProgress 等类型在 3+ 文件重复定义 | 🟡 P1 |
| 技能 | Reading/Listening/Speaking 仅有 DB schema，无实现 | 🟡 P1 |
| AI | heuristic grading 评分维度过简，无法精准提升 | 🟡 P1 |
| 内容 | examContent 的 seed 数据几乎为空 | 🟡 P1 |
| 性能 | localStorage 无 TTL 清理，长期累积会超 5MB 限制 | 🟡 P1 |
| 安全 | RLS 全部是 "Allow all"，无按用户隔离 | 🟠 P2 |
| 商业 | billing 仅为 stub，quota 无法收费 | 🟠 P2 |

---

## 二、目标架构（To-Be）

### 2.1 整体分层

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React 19 + TypeScript)                      │
│  Pages: Today / Review / Practice / Chat / Analytics / Profile   │
│  State: TanStack Query + Zustand (replace raw useState)          │
└────────────────────────┬────────────────────────────────────────┘
                         │ hooks / context
┌────────────────────────▼────────────────────────────────────────┐
│  DOMAIN LAYER                                                     │
│  ├── SRS Engine (FSRS-5 algorithm)                               │
│  ├── Learning Planner (mission / difficulty / path)              │
│  ├── Content Router (word / grammar / reading / listening)       │
│  └── AI Orchestrator (Claude grading / coaching / generation)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│  SYNC LAYER (Offline-First with CRDT-lite)                        │
│  ├── LocalDB (IndexedDB via idb-keyval, replaces localStorage)   │
│  ├── SyncQueue (pending writes, retry with backoff)              │
│  ├── Conflict Resolver (last-write-wins with vector clock)       │
│  └── Supabase Realtime (subscriptions for multi-device)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│  BACKEND (Supabase)                                               │
│  ├── PostgreSQL (primary data store)                             │
│  ├── Edge Functions (AI calls, heavy computation)                │
│  ├── Storage (avatars, audio files, user uploads)                │
│  ├── Auth (email/OAuth, JWT)                                     │
│  └── Realtime (WebSocket subscriptions)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│  EXTERNAL SERVICES                                                │
│  ├── Claude API (via Supabase Edge Functions — server-side key)  │
│  ├── ElevenLabs / Azure TTS (high-quality pronunciation)         │
│  └── Stripe (payments, eventually)                               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流设计（新）

```
用户操作
  │
  ▼
[Optimistic UI update] ← TanStack Query mutate
  │
  ├──[1ms]──► IndexedDB write (always succeeds)
  │
  └──[async]──► SyncQueue.enqueue(operation)
                    │
                    ├──[online]──► Supabase upsert
                    │                  │
                    │                  ├── [success] → mark synced, broadcast via Realtime
                    │                  └── [conflict] → ConflictResolver.resolve()
                    │
                    └──[offline]──► persisted in queue
                                       │
                                       └──[reconnect]──► flush queue with idempotency keys
```

---

## 三、数据模型重设计（Database Schema v2）

### 3.1 单一类型定义（取代分散的 interface）

```typescript
// src/types/core.ts — 唯一的真相来源

export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Skill = 'reading' | 'writing' | 'listening' | 'speaking' | 'vocabulary';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
export type WordStatus = 'new' | 'learning' | 'review' | 'mastered' | 'suspended';
export type SyncStatus = 'local' | 'synced' | 'conflict';
export type PlanTier = 'free' | 'pro' | 'team';

// FSRS-5 card state (replaces simplified SM-2)
export interface FSRSState {
  stability: number;        // S: days until 90% retention
  difficulty: number;       // D: 1-10 scale
  retrievability: number;   // R: current recall probability (0-1)
  lapses: number;           // how many times forgotten
  state: 'new' | 'learning' | 'review' | 'relearning';
  dueAt: string;            // ISO timestamp
  lastReviewAt: string | null;
}

// Word (extended — replaces WordData)
export interface Word {
  id: string;
  word: string;
  phonetic: string;
  phonetic_us?: string;
  part_of_speech: string;
  definition: string;
  definition_zh: string;
  level: CEFR;
  topic: string;
  frequency_rank?: number;          // COCA / BNC rank
  examples: Array<{ en: string; zh: string; source?: string }>;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  etymology?: string;
  memory_tip?: string;
  audio_url?: string;               // Supabase Storage
  image_url?: string;
  is_custom?: boolean;
  source_book_id?: string;
}

// User word progress (replaces UserProgress)
export interface WordProgress {
  user_id: string;
  word_id: string;
  status: WordStatus;
  srs: FSRSState;
  correct_count: number;
  incorrect_count: number;
  first_seen_at: string;
  mastered_at: string | null;
  sync_status: SyncStatus;
  updated_at: string;
}
```

### 3.2 Supabase 表结构升级

#### **words 表扩展**
```sql
ALTER TABLE words ADD COLUMN IF NOT EXISTS
  frequency_rank     INTEGER,          -- COCA 2000 / BNC rank
  audio_url          TEXT,             -- Supabase Storage path
  difficulty_score   DECIMAL(3,2),     -- computed from frequency + level
  tags               TEXT[],           -- thematic tags beyond topic
  variant_forms      JSONB,            -- { past: "ran", participle: "run" }
  collocations_rich  JSONB;            -- { "make progress": { freq: 0.8, register: "formal" } }

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_words_fts
  ON words USING gin(to_tsvector('english', word || ' ' || definition));
```

#### **user_word_progress 表升级（FSRS-5）**
```sql
-- 替换当前的 SM-2 字段
ALTER TABLE user_word_progress
  -- FSRS-5 state (replaces ease_factor + interval)
  ADD COLUMN IF NOT EXISTS stability      DECIMAL(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS difficulty     DECIMAL(4,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retrievability DECIMAL(5,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lapses         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS srs_state      TEXT DEFAULT 'new'
    CHECK (srs_state IN ('new','learning','review','relearning')),
  -- Keep backward-compat columns (migrate on read)
  ADD COLUMN IF NOT EXISTS legacy_ease_factor DECIMAL(4,3),
  ADD COLUMN IF NOT EXISTS legacy_interval    INTEGER;
```

#### **新增：review_logs 表（每次复习的完整记录）**
```sql
CREATE TABLE IF NOT EXISTS review_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id         TEXT NOT NULL,
  rated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rating          TEXT NOT NULL CHECK (rating IN ('again','hard','good','easy')),
  duration_ms     INTEGER,              -- time spent on card
  pre_stability   DECIMAL(8,4),         -- FSRS state before review
  post_stability  DECIMAL(8,4),         -- FSRS state after review
  pre_difficulty  DECIMAL(4,3),
  post_difficulty DECIMAL(4,3),
  scheduled_days  INTEGER,              -- how many days until next review
  session_id      UUID                  -- which study session
);

CREATE INDEX idx_review_logs_user_word ON review_logs(user_id, word_id, rated_at DESC);
CREATE INDEX idx_review_logs_session   ON review_logs(session_id);
```

#### **新增：reading_passages 表**
```sql
CREATE TABLE IF NOT EXISTS reading_passages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  title_zh        TEXT,
  content         TEXT NOT NULL,          -- full passage (800-1000 words)
  content_zh      TEXT,                   -- Chinese translation
  level           TEXT NOT NULL,          -- CEFR level
  topic           TEXT,
  word_count      INTEGER,
  source          TEXT,                   -- attribution
  questions       JSONB NOT NULL,         -- array of MCQ + short answer
  target_words    TEXT[],                 -- word IDs that appear in passage
  audio_url       TEXT,                   -- TTS-generated audio
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### **新增：listening_items 表**
```sql
CREATE TABLE IF NOT EXISTS listening_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  transcript      TEXT NOT NULL,
  level           TEXT NOT NULL,
  duration_seconds INTEGER,
  audio_url       TEXT NOT NULL,          -- Supabase Storage
  questions       JSONB NOT NULL,
  target_words    TEXT[],
  accent          TEXT DEFAULT 'en-US',   -- en-US | en-GB | en-AU
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### **新增：grammar_rules 表**
```sql
CREATE TABLE IF NOT EXISTS grammar_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name       TEXT NOT NULL,
  rule_name_zh    TEXT,
  category        TEXT,                   -- tense | article | preposition | etc.
  level           TEXT,
  explanation     TEXT NOT NULL,
  explanation_zh  TEXT,
  examples        JSONB NOT NULL,
  common_errors   JSONB,                  -- what learners get wrong
  practice_items  JSONB                   -- fill-in-the-blank exercises
);
```

#### **RLS 策略（修复当前 "Allow all" 漏洞）**
```sql
-- 撤销宽松策略，添加用户隔离
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_word_progress_own_data" ON user_word_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "review_logs_own_data" ON review_logs
  FOR ALL USING (auth.uid() = user_id);

-- words 表：所有已认证用户可读，管理员可写
CREATE POLICY "words_read_authenticated" ON words
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 四、算法升级：SM-2 → FSRS-5

### 4.1 为什么要换算法

| 特性 | 当前 SM-2 | FSRS-5 |
|------|-----------|--------|
| 参数数量 | 2（ease, interval）| 2+（stability, difficulty）|
| 记忆保留预测 | 无 | 有（retrievability = e^(-t/S)）|
| 首次学习曲线 | 固定阶梯 | 自适应 |
| 遗忘修复 | 简单重置 | 区分 lapse 类型 |
| 准确率（研究数据）| 基准 | +15-25% 效率提升 |

### 4.2 FSRS-5 实现

```typescript
// src/services/fsrs.ts

const FSRS_PARAMS = {
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
  DECAY: -0.5,
  FACTOR: 0.9 ** (1 / -0.5) - 1,   // ≈ 19/81
  REQUESTED_RETENTION: 0.9,          // 目标记忆率 90%
};

export type Rating = 'again' | 'hard' | 'good' | 'easy';
const RATING_VALUE: Record<Rating, 1 | 2 | 3 | 4> = {
  again: 1, hard: 2, good: 3, easy: 4,
};

export function initCard(): FSRSState {
  return {
    stability: 0,
    difficulty: 0,
    retrievability: 0,
    lapses: 0,
    state: 'new',
    dueAt: new Date().toISOString(),
    lastReviewAt: null,
  };
}

// 当前记忆保留率 R(t) = (1 + FACTOR * t / S)^DECAY
export function retrievability(stability: number, elapsedDays: number): number {
  if (stability === 0) return 0;
  return Math.pow(1 + FSRS_PARAMS.FACTOR * elapsedDays / stability, FSRS_PARAMS.DECAY);
}

// 新卡片首次学习 — 按评分给初始稳定度
function initStability(rating: Rating): number {
  const idx = RATING_VALUE[rating] - 1;
  return FSRS_PARAMS.w[idx];
}

// 初始难度 D0(G) = w[4] - exp(w[5] * (G - 1)) + 1
function initDifficulty(rating: Rating): number {
  const g = RATING_VALUE[rating];
  return FSRS_PARAMS.w[4] - Math.exp(FSRS_PARAMS.w[5] * (g - 1)) + 1;
}

// 难度更新 D' = D + w[6] * (3 - g) (bounded 1-10)
function nextDifficulty(d: number, rating: Rating): number {
  const g = RATING_VALUE[rating];
  return Math.min(10, Math.max(1, d + FSRS_PARAMS.w[6] * (3 - g)));
}

// 稳定度增长（成功复习）
function nextStabilityRecall(s: number, d: number, r: number, rating: Rating): number {
  const g = RATING_VALUE[rating];
  const hardPenalty = rating === 'hard' ? FSRS_PARAMS.w[15] : 1;
  const easyBonus   = rating === 'easy' ? FSRS_PARAMS.w[16] : 1;
  return s * (
    Math.exp(FSRS_PARAMS.w[8])
    * (11 - d)
    * Math.pow(s, -FSRS_PARAMS.w[9])
    * (Math.exp((1 - r) * FSRS_PARAMS.w[10]) - 1)
    * hardPenalty
    * easyBonus
    + 1
  );
}

// 稳定度（遗忘后重新学习）
function nextStabilityForget(d: number, s: number, r: number): number {
  return FSRS_PARAMS.w[11]
    * Math.pow(d, -FSRS_PARAMS.w[12])
    * (Math.pow(s + 1, FSRS_PARAMS.w[13]) - 1)
    * Math.exp((1 - r) * FSRS_PARAMS.w[14]);
}

// 下次复习间隔（天）
function scheduleDays(stability: number): number {
  return Math.round(
    stability / FSRS_PARAMS.FACTOR
    * (Math.pow(FSRS_PARAMS.REQUESTED_RETENTION, 1 / FSRS_PARAMS.DECAY) - 1),
  );
}

export function scheduleReview(card: FSRSState, rating: Rating, now = new Date()): FSRSState {
  const elapsed = card.lastReviewAt
    ? (now.getTime() - new Date(card.lastReviewAt).getTime()) / 86_400_000
    : 0;

  let { stability, difficulty, lapses, state } = card;
  const r = card.lastReviewAt ? retrievability(stability, elapsed) : 0;

  if (state === 'new') {
    stability  = initStability(rating);
    difficulty = initDifficulty(rating);
    state = rating === 'again' ? 'learning' : 'review';
  } else if (rating === 'again') {
    // Lapse path
    stability  = nextStabilityForget(difficulty, stability, r);
    difficulty = nextDifficulty(difficulty, rating);
    lapses    += 1;
    state      = 'relearning';
  } else {
    // Successful recall
    stability  = nextStabilityRecall(stability, difficulty, r, rating);
    difficulty = nextDifficulty(difficulty, rating);
    state      = 'review';
  }

  const days = state === 'learning' || state === 'relearning'
    ? (rating === 'again' ? 0 : 1)      // re-show same/next day
    : scheduleDays(stability);

  const dueAt = new Date(now.getTime() + days * 86_400_000).toISOString();

  return {
    stability,
    difficulty,
    retrievability: retrievability(stability, 0),
    lapses,
    state,
    dueAt,
    lastReviewAt: now.toISOString(),
  };
}
```

### 4.3 迁移策略

```typescript
// src/services/fsrsMigration.ts

/**
 * 将旧 SM-2 progress 数据转换为 FSRS-5 state
 * 规则：
 *   ease_factor → difficulty: (2.5 - ease_factor) / (2.5 - 1.3) * 10  ≈ 1-10
 *   interval    → stability: interval * 0.8  (近似值)
 *   review_count 保留
 */
export function migrateSM2ToFSRS(progress: OldUserProgress): WordProgress {
  const difficulty = Math.min(10, Math.max(1,
    (2.5 - progress.easeFactor) / (2.5 - 1.3) * 10,
  ));
  const stability = (progress.nextReview && progress.lastReviewed)
    ? Math.max(1,
        (new Date(progress.nextReview).getTime() - new Date(progress.lastReviewed).getTime())
        / 86_400_000 * 0.8,
      )
    : 1;

  return {
    user_id: progress.userId,
    word_id: progress.wordId,
    status: progress.status,
    srs: {
      stability,
      difficulty,
      retrievability: retrievability(stability, 0),
      lapses: 0,
      state: progress.status === 'mastered' ? 'review' : progress.status === 'new' ? 'new' : 'review',
      dueAt: progress.nextReview || new Date().toISOString(),
      lastReviewAt: progress.lastReviewed,
    },
    correct_count: 0,
    incorrect_count: 0,
    first_seen_at: progress.lastReviewed || new Date().toISOString(),
    mastered_at: null,
    sync_status: 'local',
    updated_at: new Date().toISOString(),
  };
}
```

---

## 五、离线优先同步层（Sync Layer）

### 5.1 IndexedDB 替换 localStorage

```typescript
// src/lib/localDb.ts
import { openDB, type IDBPDatabase } from 'idb';

export const DB_VERSION = 1;

export type StoreName =
  | 'word_progress'    // FSRSState per word
  | 'review_logs'      // every rating event
  | 'sync_queue'       // pending writes to Supabase
  | 'words_cache'      // offline word data
  | 'settings'         // user preferences
  | 'events';          // learning events

export async function openLocalDb(): Promise<IDBPDatabase> {
  return openDB('vocabdaily', DB_VERSION, {
    upgrade(db) {
      // word_progress
      const prog = db.createObjectStore('word_progress', { keyPath: ['user_id', 'word_id'] });
      prog.createIndex('dueAt',  ['user_id', 'srs.dueAt']);
      prog.createIndex('status', ['user_id', 'status']);

      // review_logs
      const logs = db.createObjectStore('review_logs', { keyPath: 'id', autoIncrement: true });
      logs.createIndex('word_id', ['user_id', 'word_id']);
      logs.createIndex('rated_at', ['user_id', 'rated_at']);

      // sync_queue
      const queue = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      queue.createIndex('status', 'status');   // pending | inflight | failed

      db.createObjectStore('words_cache',  { keyPath: 'id' });
      db.createObjectStore('settings',     { keyPath: 'key' });
      db.createObjectStore('events',       { keyPath: 'id', autoIncrement: true });
    },
  });
}
```

### 5.2 同步队列（SyncQueue）

```typescript
// src/services/syncQueue.ts

export interface SyncOperation {
  id?: number;
  table: string;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown>;
  idempotencyKey: string;   // content hash — prevents double-writes
  attempts: number;
  status: 'pending' | 'inflight' | 'failed';
  createdAt: string;
  lastAttemptAt?: string;
  error?: string;
}

export class SyncQueue {
  private db: IDBPDatabase;
  private isFlushingRef = false;

  async enqueue(op: Omit<SyncOperation, 'id' | 'attempts' | 'status' | 'createdAt'>): Promise<void> {
    // Deduplicate by idempotency key
    const existing = await this.db.getFromIndex('sync_queue', 'idempotencyKey', op.idempotencyKey);
    if (existing?.status === 'pending') return; // Already queued

    await this.db.put('sync_queue', {
      ...op,
      attempts: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    void this.flush(); // Try immediately
  }

  async flush(): Promise<void> {
    if (this.isFlushingRef || !navigator.onLine) return;
    this.isFlushingRef = true;

    try {
      const pending = await this.db.getAllFromIndex('sync_queue', 'status', 'pending');

      for (const op of pending) {
        await this.db.put('sync_queue', { ...op, status: 'inflight' });
        try {
          if (op.operation === 'upsert') {
            const { error } = await supabase.from(op.table).upsert(op.payload);
            if (error) throw error;
          } else {
            const { error } = await supabase.from(op.table).delete().match(op.payload);
            if (error) throw error;
          }
          // Success — remove from queue
          await this.db.delete('sync_queue', op.id!);
        } catch (err) {
          const attempts = op.attempts + 1;
          const backoffMs = Math.min(30_000, 1000 * 2 ** attempts);
          await this.db.put('sync_queue', {
            ...op,
            status: attempts >= 5 ? 'failed' : 'pending',
            attempts,
            lastAttemptAt: new Date().toISOString(),
            error: String(err),
          });
          await new Promise(r => setTimeout(r, backoffMs));
        }
      }
    } finally {
      this.isFlushingRef = false;
    }
  }
}

// Register flush on reconnect
window.addEventListener('online', () => syncQueue.flush());
```

---

## 六、AI 管道设计（四技能完整方案）

### 6.1 边缘函数架构

```
Browser
  │
  ├── invoke('ai-grade-writing', { essay, prompt, taskType })
  ├── invoke('ai-coach-chat',   { history, context, mode })
  ├── invoke('ai-generate-reading', { level, topic, targetWords })
  ├── invoke('ai-grade-reading', { passage_id, answers })
  ├── invoke('ai-generate-listening', { level, topic })
  └── invoke('ai-speaking-feedback', { audioBlob, prompt })
                │
                ▼
     Supabase Edge Function (Deno)
         │
         ├── validate JWT (auth.uid())
         ├── check quota (rate_limit table)
         └── Claude API (Anthropic SDK, server-side key)
                 │
                 └── structured JSON response
```

### 6.2 写作评分升级（Writing Grader v2）

```typescript
// supabase/functions/ai-grade-writing/index.ts (Edge Function)

const GRADING_PROMPT = `
You are an expert IELTS examiner. Grade the following ${taskType} response.

PASSAGE PROMPT:
"""
${prompt}
"""

CANDIDATE RESPONSE (${wordCount} words):
"""
${essay}
"""

Return ONLY a JSON object matching this exact schema:
{
  "scores": {
    "taskResponse": <float 0-9, 0.5 increments>,
    "coherenceCohesion": <float 0-9>,
    "lexicalResource": <float 0-9>,
    "grammaticalRangeAccuracy": <float 0-9>,
    "overallBand": <float 0-9>  // weighted: TR 25%, CC 25%, LR 25%, GRA 25%
  },
  "issues": [
    {
      "tag": "lexical|grammar|coherence|task_response|word_count",
      "severity": "high|medium|low",
      "sentence": "<exact problematic sentence from essay>",
      "message": "<specific problem in English>",
      "messageZh": "<same in Chinese>",
      "suggestion": "<concrete fix in English>",
      "suggestionZh": "<same in Chinese>",
      "correction": "<corrected version of the sentence>"
    }
  ],
  "strengths": ["<what candidate did well>"],
  "summary": "<2-3 sentence overall assessment>",
  "summaryZh": "<same in Chinese>",
  "improvedSentence": "<take the worst sentence and show ideal version>"
}

SCORING CRITERIA:
- Task 2 Band 7+: Addresses all parts, coherent argument, varied vocabulary, complex grammar
- Penalize: repetitive vocabulary, grammatical errors, poor paragraph structure
- Count issues carefully — flag the 3 most impactful problems only
`;

const response = await anthropic.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 1500,
  messages: [{ role: 'user', content: GRADING_PROMPT }],
});
```

**关键改进**：
- 提取具体问题句子（`sentence` 字段），前端可高亮显示
- 提供修正版本（`correction`），用户可对比学习
- 强调「只找 3 个最重要问题」，避免反馈过载
- 增加 `strengths` 正面反馈，提升学习动力

### 6.3 阅读理解模块

```typescript
// supabase/functions/ai-generate-reading/index.ts

const READING_GENERATION_PROMPT = `
Generate an IELTS Academic Reading passage for level ${level}.

Requirements:
- Length: 700-900 words
- Topic: ${topic}
- Include these vocabulary words naturally: ${targetWords.join(', ')}
- Register: academic/formal
- Include 10 questions mixing:
  * 3 × True/False/Not Given
  * 3 × Multiple Choice (A-D)
  * 2 × Short Answer (no more than 3 words)
  * 2 × Sentence Completion

Return JSON:
{
  "title": "...",
  "passage": "...",
  "questions": [
    {
      "id": 1,
      "type": "tfng|mcq|short_answer|completion",
      "question": "...",
      "options": ["A...", "B...", "C...", "D..."],  // MCQ only
      "answer": "True|False|Not Given|A|B|C|D|<text>",
      "explanation": "...",
      "location": "<sentence from passage that contains the answer>"
    }
  ],
  "vocabulary_in_context": [
    { "word": "...", "sentence": "...", "meaning_in_context": "..." }
  ]
}
`;
```

### 6.4 口语评测（Speaking Feedback）

```typescript
// supabase/functions/ai-speaking-feedback/index.ts
// Input: audio blob → transcribed by Whisper → evaluated by Claude

const pipeline = async (audioBlob: Blob, prompt: string) => {
  // Step 1: Transcribe
  const transcript = await whisper.transcriptions.create({
    file: audioBlob,
    model: 'whisper-1',
    language: 'en',
  });

  // Step 2: Evaluate transcript
  const evaluation = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    messages: [{
      role: 'user',
      content: `
        IELTS Speaking Task 2 Evaluation

        Question: ${prompt}
        Transcript: ${transcript.text}

        Evaluate on:
        - Fluency & Coherence (0-9)
        - Lexical Resource (0-9)
        - Grammatical Range & Accuracy (0-9)
        - Pronunciation (0-9, estimated from text markers)

        Return JSON with scores, issues[], strengths[], sample_improved_response.
      `,
    }],
  });

  return { transcript: transcript.text, evaluation: parseJSON(evaluation) };
};
```

---

## 七、词库扩展方案（102 → 5000+）

### 7.1 数据来源策略

```
Priority 1 (立即可实现):
  ├── COCA 2000 高频词（Academic Word List）— 公开数据集
  ├── IELTS 必备词汇表（Cambridge Essential Vocabulary）— 570+ 词
  └── TOEFL Core Word List — 1200 词

Priority 2 (AI 辅助生成):
  └── Claude batch generation:
        - 输入: word + CEFR level
        - 输出: phonetic, definition_en, definition_zh, examples×3,
                synonyms, collocations, etymology, memory_tip
        - 验证: 人工抽查 10% 样本
        - 成本: ~$0.02/词 × 4900 词 ≈ $98 一次性成本

Priority 3 (用户生成):
  └── 允许用户提交自定义词汇
      → 审核后加入公共词库（激励积分）
```

### 7.2 词库数据管道

```typescript
// scripts/expand-word-database.ts (Node.js 离线脚本)

async function generateWordEntry(word: string, level: CEFR): Promise<Word> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',   // 成本最低
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `
        Generate a complete dictionary entry for the English word "${word}" (CEFR ${level}).

        Return ONLY JSON (no markdown):
        {
          "word": "${word}",
          "phonetic": "/IPA transcription/",
          "part_of_speech": "n.|v.|adj.|adv.|prep.",
          "definition": "clear English definition (1 sentence)",
          "definition_zh": "中文释义（1句）",
          "level": "${level}",
          "topic": "one of: daily|business|academic|science|technology|travel|health|arts",
          "examples": [
            { "en": "sentence using ${word}", "zh": "中文翻译" },
            { "en": "another sentence", "zh": "中文翻译" }
          ],
          "synonyms": ["word1", "word2", "word3"],
          "collocations": ["${word} with", "common ${word}"],
          "etymology": "brief origin note",
          "memory_tip": "mnemonic or vivid association in Chinese"
        }
      `,
    }],
  });
  return JSON.parse(extractText(response));
}

// 批量生成，带速率限制
async function expandDatabase(wordList: string[], batchSize = 20) {
  for (const batch of chunks(wordList, batchSize)) {
    const entries = await Promise.all(batch.map(([word, level]) => generateWordEntry(word, level)));
    await supabase.from('words').upsert(entries);
    await sleep(1000); // 1s 间隔
  }
}
```

---

## 八、个性化学习引擎（Personalization Engine）

### 8.1 学习者模型

```typescript
// src/services/learnerModel.ts

export interface LearnerModel {
  userId: string;

  // 认知特征
  averageRecallTime: number;        // 平均需要几天才能记住
  forgettingCurveSlope: number;     // 遗忘速度（快/慢型学习者）
  optimalSessionLength: number;     // 最佳学习时长（分钟）

  // 能力分析
  strengthTopics: string[];         // 擅长主题
  weakTopics: string[];             // 薄弱主题
  strengthSkills: Skill[];          // 擅长技能
  weakSkills: Skill[];

  // 行为模式
  preferredStudyHours: number[];    // [9, 10, 20] → 早9点和晚8点活跃
  avgWordsPerSession: number;
  consistencyScore: number;         // 0-1，连续学习质量

  // 预测指标
  predictedRetentionAt30days: number;   // 30天后预期记忆率
  burnoutRisk: number;                  // 0-1，疲劳风险

  updatedAt: string;
}

// 每次学习后更新学习者模型
export async function updateLearnerModel(
  userId: string,
  sessionEvents: LearningEvent[],
): Promise<LearnerModel> {
  const reviews = sessionEvents.filter(e => e.eventName === 'review.word_rated');

  // 更新记忆曲线参数
  const correctReviews = reviews.filter(e => e.payload.rating !== 'again');
  const avgStability = mean(correctReviews.map(e => e.payload.postStability));

  // 更新最佳学习时间
  const hourCounts = reviews.reduce((acc, e) => {
    const h = new Date(e.createdAt).getHours();
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // ... 存储到 agent_memory_items 或 user_learning_profiles
}
```

### 8.2 自适应学习路径

```typescript
// 取代当前 3 级固定 difficulty state
export type LearningMode =
  | 'recovery'    // 积压 > 20 张，只清旧卡
  | 'maintenance' // 积压 > 5，优先复习
  | 'steady'      // 正常学习节奏
  | 'stretch'     // 连续 7 天，加速扩展
  | 'sprint'      // 考前冲刺模式

export function computeLearningMode(model: LearnerModel, due: number): LearningMode {
  if (due > 20 || model.burnoutRisk > 0.8) return 'recovery';
  if (due > 5)  return 'maintenance';
  if (model.consistencyScore > 0.85 && model.avgWordsPerSession > 15) return 'stretch';
  return 'steady';
}

export function dailyWordTarget(mode: LearningMode, userGoal: number): number {
  const multipliers = {
    recovery:    0,    // no new words
    maintenance: 0.5,  // half goal
    steady:      1.0,  // target goal
    stretch:     1.3,  // 30% bonus
    sprint:      1.5,  // 50% bonus
  };
  return Math.round(userGoal * multipliers[mode]);
}
```

---

## 九、前端状态管理重构

### 9.1 从 useState + Context → TanStack Query + Zustand

```typescript
// 当前问题：UserDataContext 管理太多状态，导致：
// - 任何更新重渲染所有消费者
// - 无 server/client 状态分离
// - 无自动重验证

// 新方案：服务端状态用 TanStack Query，客户端 UI 状态用 Zustand

// src/queries/wordProgressQueries.ts
export const wordProgressKeys = {
  all:    (userId: string) => ['progress', userId] as const,
  due:    (userId: string) => ['progress', userId, 'due'] as const,
  byWord: (userId: string, wordId: string) => ['progress', userId, wordId] as const,
};

export function useDueWords() {
  const { user } = useAuth();
  return useQuery({
    queryKey: wordProgressKeys.due(user!.id),
    queryFn: () => localDb.getDueWords(user!.id),
    staleTime: 60_000,           // consider fresh for 1 minute
    gcTime: 5 * 60_000,          // keep in cache 5 minutes
  });
}

export function useReviewWord() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ wordId, rating }: { wordId: string; rating: Rating }) => {
      // 1. Compute new FSRS state
      const current = await localDb.getWordProgress(user!.id, wordId);
      const newState = scheduleReview(current.srs, rating);

      // 2. Write to IndexedDB immediately (optimistic)
      await localDb.setWordProgress(user!.id, wordId, { srs: newState });

      // 3. Log the review
      await localDb.addReviewLog({ userId: user!.id, wordId, rating, ...newState });

      // 4. Enqueue Supabase sync
      await syncQueue.enqueue({
        table: 'user_word_progress',
        operation: 'upsert',
        payload: { user_id: user!.id, word_id: wordId, ...flattenFSRS(newState) },
        idempotencyKey: `review-${user!.id}-${wordId}-${Date.now()}`,
      });

      return newState;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wordProgressKeys.all(user!.id) });
    },
  });
}
```

---

## 十、实施路线图（Prioritized Roadmap）

### Phase 1 — 核心可靠性（2-3 周）

| 任务 | 工作量 | 影响 |
|------|--------|------|
| 词库扩展 102 → 1000 词（使用 AI 批量生成脚本） | M | 🔴 核心 |
| FSRS-5 替换 SM-2（含迁移脚本） | M | 🔴 算法 |
| IndexedDB 替换 localStorage（idb 库） | L | 🟡 稳定性 |
| SyncQueue 实现（含冲突解决） | M | 🟡 多设备 |
| 修复 RLS 策略（用户数据隔离） | S | 🟠 安全 |
| 单一类型文件 src/types/core.ts | S | 🟡 DX |

### Phase 2 — 技能完整化（3-4 周）

| 任务 | 工作量 | 影响 |
|------|--------|------|
| 阅读理解模块（AI 生成 + 手工 10 篇种子） | L | 🔴 功能 |
| 升级写作评分（含句子高亮、具体修正） | M | 🔴 功能 |
| 听力模块（5-10 条种子音频 + 题目） | L | 🔴 功能 |
| TanStack Query 替换核心 Context | M | 🟡 性能 |
| review_logs 表 + 保留率可视化 | M | 🟡 分析 |

### Phase 3 — 个性化与增长（4-6 周）

| 任务 | 工作量 | 影响 |
|------|--------|------|
| LearnerModel 计算管道 | L | 🟡 个性化 |
| 自适应学习路径（5 种模式） | M | 🟡 个性化 |
| 词库扩展至 5000 词 | L | 🔴 内容 |
| 口语评测 MVP（Whisper + Claude） | L | 🟡 功能 |
| Stripe 付费集成 + Quota 执行 | M | 🟠 商业 |
| 多设备 Realtime 同步 | M | 🟠 体验 |

### Phase 4 — 规模化（6 周+）

| 任务 | 工作量 | 影响 |
|------|--------|------|
| 语法模块（规则库 + 填空练习） | XL | 🟡 完整性 |
| 社区功能（排行榜、分享进度） | L | 🟠 增长 |
| 移动端 PWA 优化 | M | 🟠 触达 |
| A/B 测试基础设施 | M | 🟠 增长 |
| 教师/组织账号管理 | XL | 🟠 商业 |

---

## 十一、关键指标（KPIs）

```
学习效果指标：
  D7 词汇保留率         ≥ 85%   (FSRS-5 目标保留率 90%)
  D30 词汇保留率        ≥ 75%
  每卡平均学习时间      ≤ 30 秒
  "again" 评分率        ≤ 15%   (说明词汇难度合适)

用户参与指标：
  每周活跃天数          ≥ 5 天
  平均每日学习时长      ≥ 15 分钟
  连续学习 7 天率       ≥ 40%

系统可靠性指标：
  SRS 数据一致性        100%  (本地 ↔ Supabase 无分裂)
  AI 评分成功率         ≥ 95% (含 fallback)
  Edge Function P95     ≤ 3s
```

---

## 十二、技术决策总结（Decision Log）

| 决策 | 选择 | 理由 | 被否决的方案 |
|------|------|------|-------------|
| SRS 算法 | FSRS-5 | 研究显示 +15-25% 效率，有 TS 参考实现 | Anki SuperMemo 4 (复杂度过高) |
| 客户端存储 | IndexedDB (idb) | 无 5MB 限制，支持复杂查询，结构化 | localStorage (保留作降级) |
| 状态管理 | TanStack Query + Zustand | 服务端/客户端状态分离，内置缓存失效 | Redux, MobX |
| AI 模型 | Claude opus-4 (写作), haiku-4 (批量) | 质量/成本最优，server-side key | GPT-4 (成本高), 本地模型 (质量差) |
| 同步策略 | 操作队列 + last-write-wins | 足够简单，学习数据冲突概率低 | CRDT (过度设计) |
| 词库扩展 | AI 生成 + 人工验证 | 速度快，成本低，可控质量 | 手工录入 (太慢) |

---

*文档版本：v2.0 | 生成日期：2026-03-21 | 基于代码库完整分析*

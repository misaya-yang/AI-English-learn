# VocabDaily V2 — Ralph 自主开发循环提示词

> **版本**: v2.0
> **适配**: VocabDaily V2 PRD (S11-S25)
> **前置条件**: V1 所有 10 个 Stories (S01-S10) 已完成

---

## 启动方式

```bash
# ============================================================
# 方式一：原生 while 循环（最简单）
# ============================================================
while :; do cat RALPH_PROMPT_V2.md | claude --dangerously-skip-permissions ; done

# ============================================================
# 方式二：Ralph 插件（推荐，有迭代上限和退出检测）
# ============================================================
# 安装插件
/plugin install ralph-skills@ralph-marketplace

# 启动循环（最多 30 次迭代，检测到 V2_ALL_COMPLETE 时停止）
/ralph-loop:ralph-loop "$(cat RALPH_PROMPT_V2.md)" \
  --completion-promise "V2_ALL_COMPLETE" \
  --max-iterations 30

# ============================================================
# 方式三：分阶段执行（按 Phase 拆分，更安全可控）
# ============================================================
# Phase 1: AI 口语引擎
/ralph-loop:ralph-loop "$(cat RALPH_PROMPT_V2.md) \n\n---PHASE_FILTER: S11,S12" \
  --completion-promise "PHASE1_COMPLETE" \
  --max-iterations 8

# Phase 2: 体验深化
/ralph-loop:ralph-loop "$(cat RALPH_PROMPT_V2.md) \n\n---PHASE_FILTER: S13,S14,S15" \
  --completion-promise "PHASE2_COMPLETE" \
  --max-iterations 10

# Phase 3: 内容 & AI 增强
/ralph-loop:ralph-loop "$(cat RALPH_PROMPT_V2.md) \n\n---PHASE_FILTER: S16,S17,S18" \
  --completion-promise "PHASE3_COMPLETE" \
  --max-iterations 10

# Phase 4: 质量 & 扩展
/ralph-loop:ralph-loop "$(cat RALPH_PROMPT_V2.md) \n\n---PHASE_FILTER: S19,S20,S21,S22,S23,S24,S25" \
  --completion-promise "PHASE4_COMPLETE" \
  --max-iterations 20

# ============================================================
# 随时取消
# ============================================================
/cancel-ralph
```

---

## 项目概述

你正在开发 **VocabDaily V2** —— 一个 AI 原生智能英语学习 Web 应用的重大升级版本。

**V1 已完成**: 设计系统 / Landing Page / AI Chat / Today 仪表盘 / 复习体验 / 练习游戏化 / 分析洞察 / 性能优化 / 无障碍i18n / 测试覆盖

**V2 目标**: 发音评估 / Roleplay 场景 / 移动端优化 / 社交联赛 / 智能 Onboarding / AI 写作 / 学习路径 / 智能推荐 / 内容扩展 / 错题本 / 学习日历 / 付费系统 / E2E+CI/CD

**技术栈**: React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 3 + Radix UI + Supabase (Auth + PostgreSQL + Edge Functions + Realtime) + Claude API + FSRS-5

**项目根目录**: 当前工作目录
**源码目录**: `src/`
**后端函数**: `supabase/functions/`
**测试框架**: Vitest + Playwright
**PRD 文档**: `PRD_V2.md`（详细需求）
**任务状态**: `prd_v2.json`（JSON 格式，机器可读）
**进度日志**: `progress_v2.txt`

---

## 你的角色

你是一个高级全栈工程师 + AI 产品专家。你的使命是按照 `prd_v2.json` 中定义的 User Stories，逐个实现 VocabDaily V2 的所有功能。

你擅长：
- React + TypeScript 现代前端开发
- Supabase 后端开发（PostgreSQL + Edge Functions + RLS）
- AI 集成（LLM API、语音识别、TTS）
- 测试驱动开发（Vitest + Playwright）
- 用户体验设计和移动端适配

---

## 每次迭代的工作流程

### Step 1: 读取状态
```bash
cat prd_v2.json                # 查看所有 Story 状态
cat progress_v2.txt 2>/dev/null # 查看历史经验（可能不存在）
```

如果 `---PHASE_FILTER` 存在，只处理指定的 Story ID。

### Step 2: 选择任务
选择 `priority` 最小且 `passes: false` 的 Story。如果被 PHASE_FILTER 过滤，则跳过不在列表中的 Story。

### Step 3: 阅读需求
1. 从 `prd_v2.json` 读取该 Story 的完整描述和验收标准
2. 如需更多细节，阅读 `PRD_V2.md` 对应章节
3. 阅读相关现有源码，理解当前实现

### Step 4: 实现

#### 4.1 代码规范
- **TypeScript 严格模式**，不使用 `any`
- **Tailwind utility classes**，使用项目已有的设计令牌
- **Radix UI** 基础组件，保持一致性
- **Framer Motion** 动画，使用 `src/lib/motion.ts` 中的 preset
- **i18next** 国际化，新增键同时添加到 en.json 和 zh.json
- **React Query** 管理服务端状态
- **新文件放对目录**：
  - 页面 → `src/pages/dashboard/`
  - 功能模块 → `src/features/{feature}/`
  - 服务 → `src/services/`
  - Hooks → `src/hooks/`
  - 类型 → `src/types/`
  - 数据 → `src/data/`
  - UI 组件 → `src/components/ui/` 或 `src/components/`

#### 4.2 路由注册
新页面必须在 `src/App.tsx` 中注册路由：
```typescript
const NewPage = lazyWithRetry(() => import('./pages/dashboard/NewPage'));
// 在 <Route path="dashboard"> 下添加
<Route path="new-feature" element={<Suspense><NewPage /></Suspense>} />
```

#### 4.3 导航集成
新页面需要在 `DashboardLayout.tsx` 侧边栏添加导航入口。

#### 4.4 数据库迁移
需要新表时，在 `supabase/migrations/` 创建新的迁移文件：
```
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```
- 所有表必须开启 RLS
- 添加基本的 SELECT/INSERT/UPDATE 策略

#### 4.5 Edge Functions
新增 Edge Function 放在 `supabase/functions/{function-name}/index.ts`

### Step 5: 质量检查

**必须按顺序执行所有检查**:

```bash
# 1. TypeScript 类型检查
npx tsc --noEmit
# 如果失败 → 修复类型错误后重试

# 2. ESLint 检查
npx eslint src/ --ext .ts,.tsx --max-warnings 0
# 如果失败 → 修复 lint 错误后重试
# 注意: 如果 --max-warnings 0 太严格，可以用默认模式

# 3. 单元测试
npm test -- --run
# 如果失败 → 修复测试后重试

# 4. 构建检查
npm run build
# 如果失败 → 修复构建错误后重试
```

**所有 4 项检查必须通过才能继续！**
如果某项持续失败（尝试 3 次后），记录问题到 progress_v2.txt 并跳过该 Story。

### Step 6: 为该 Story 编写测试

每个 Story 至少包含:
- **核心逻辑的单元测试** (3-5 个测试用例)
- 测试文件放在 `tests/` 或对应模块目录下
- 使用 Vitest + Testing Library

```bash
# 运行新增的测试
npm test -- --run --reporter=verbose
```

### Step 7: 提交
```bash
git add -A
git commit -m "feat(STORY_ID): STORY_TITLE - 简短描述"
```

### Step 8: 更新状态

更新 `prd_v2.json` 中对应 Story:
```json
{
  "id": "S11-pronunciation-assessment",
  "passes": true,
  "completedAt": "2026-04-06T10:30:00Z"
}
```

### Step 9: 记录经验

追加写入 `progress_v2.txt`:
```
## [STORY_ID] - [ISO时间戳]
- 完成: [一句话描述实现内容]
- 关键决策: [技术选型/架构决策]
- 注意事项: [遇到的问题/解决方案/踩坑记录]
- 文件变更: [关键文件列表]
- 测试: [新增测试数量和覆盖模块]
---
```

### Step 10: 检查完成

检查是否所有 Story 都已完成:

```bash
# 检查是否有未完成的 Story
cat prd_v2.json | grep '"passes": false'
```

如果所有 Story 的 `passes` 都为 `true`:
- 输出当前 Phase 的完成标志（如果有 PHASE_FILTER）
- 如果没有 PHASE_FILTER 且全部完成，输出: `V2_ALL_COMPLETE`

---

## 重要规则

### 必须遵守
1. **每次迭代只做一个 Story** — 保持变更可控
2. **先读再写** — 修改任何文件前，先完整阅读它
3. **向后兼容** — V1 功能不能被破坏
4. **质量检查全部通过** — TypeCheck + Lint + Test + Build
5. **代码风格一致** — 遵循现有命名、目录、导入习惯
6. **每个 Story 自包含** — 不依赖后续 Story 的实现
7. **测试覆盖** — 每个 Story 至少 3 个单元测试
8. **i18n 完整** — 新增的用户可见文本必须使用 t() 函数

### 禁止操作
1. **不修改 `.env`** — 不改动环境变量
2. **不删除现有测试** — 只增不减
3. **不使用 `any` 类型** — 严格 TypeScript
4. **不写内联 style** — 使用 Tailwind
5. **不引入新的 CSS 框架** — 只用 Tailwind + Radix
6. **不修改 Supabase 配置** — 只操作 migrations 和 functions
7. **不修改 V1 Stories 的核心逻辑** — 只扩展，不重写

### 遇到阻塞时
- 外部 API 不可用 → Mock 该功能，在 progress_v2.txt 记录
- 构建持续失败 → 回滚本次改动，跳过 Story
- 依赖未安装 → 执行 `npm install <package>` 安装

---

## 项目关键文件导航

| 路径 | 用途 |
|------|------|
| `src/App.tsx` | 根组件 + 路由定义 |
| `src/layouts/DashboardLayout.tsx` | Dashboard 布局 + 侧边栏 |
| `src/pages/dashboard/` | 所有 Dashboard 页面 |
| `src/features/` | 功能模块（chat/exam/learning/practice） |
| `src/components/ui/` | 62 个 Radix UI 基础组件 |
| `src/services/` | 核心业务逻辑 |
| `src/services/fsrs.ts` | FSRS-5 间隔重复算法 |
| `src/services/learnerModel.ts` | 学习者模型（个性化引擎） |
| `src/services/gamification.ts` | 游戏化（XP/Streak/Achievement） |
| `src/services/aiGateway.ts` | Edge Function 调用网关 |
| `src/services/tts.ts` | TTS 语音合成 |
| `src/contexts/` | AuthContext / UserDataContext / ThemeContext |
| `src/hooks/` | 自定义 Hooks |
| `src/data/localStorage.ts` | 本地存储管理 (1100+ LOC) |
| `src/data/words.ts` | 内置词库 (~5000 词) |
| `src/types/` | TypeScript 类型定义 |
| `src/i18n/` | 国际化翻译文件 (en/zh) |
| `src/lib/supabase.ts` | Supabase 客户端 |
| `src/lib/motion.ts` | Framer Motion 动画预设 |
| `supabase/migrations/` | 数据库迁移文件 |
| `supabase/functions/` | Supabase Edge Functions |
| `tailwind.config.js` | Tailwind 设计令牌配置 |
| `vite.config.ts` | Vite 构建配置 |
| `tests/` | Vitest 测试文件 |

---

## 技术决策指南

| 决策领域 | 选择 | 说明 |
|---------|------|------|
| 动画 | Framer Motion | 复杂动画；简单过渡用 CSS transition |
| 图表 | Recharts | 已有依赖 |
| 图标 | Lucide React | 已有依赖 |
| 表单 | React Hook Form + Zod | 已有依赖 |
| 服务端状态 | TanStack Query | 已有依赖 |
| 客户端状态 | Context + useState | 不引入 Redux/Zustand |
| 样式 | Tailwind utility | 不写内联 style |
| 路由 | React Router v7 | /dashboard/* |
| i18n | i18next t() | en.json + zh.json |
| 测试 | Vitest + Testing Library | 单元 + 组件测试 |
| E2E | Playwright | 端到端测试 |
| 语音识别 | Web Speech API | SpeechRecognition |
| TTS | Web Speech + ElevenLabs | 已有 tts.ts |
| AI 评分 | Claude via Edge Function | 已有 aiGateway.ts |
| 实时通信 | Supabase Realtime | 联赛排名等 |
| 推送通知 | Web Push API | 学习提醒 |

---

## 数据内容生成指南

### 场景数据 (S12)
- 每个场景包含: id, title, title_zh, difficulty, category, system_prompt, objectives(3), key_phrases(5-8), estimated_minutes
- system_prompt 要详细定义 AI 的角色、性格、说话风格
- objectives 要具体可完成（如"成功点一杯咖啡"而非"练习点餐"）

### 阅读素材 (S19)
- 按 CEFR 等级分级 (A1-C2)
- 每篇 200-500 词
- 包含 5 道理解题（选择题）
- 标注关键生词（带释义）

### 听力素材 (S20)
- 提供完整文本脚本（TTS 生成音频）
- 对话和独白各占一半
- 按难度分级

### 语法数据 (S21)
- 每个语法点包含: 规则说明(中英) + 3个正确例句 + 3个错误例句 + 10道练习题
- 练习题类型混合（选择/填空/改错/重组/翻译）

### 学习路径数据 (S17)
- 每条路径 15-30 个 Lessons
- 每个 Lesson: 5-10 个词汇 + 1 个语法点 + 3-5 道练习 + 1 个场景对话
- 难度递增

---

*此提示词版本: v2.0 | 适配项目: VocabDaily V2 | 生成日期: 2026-04-06*

# VocabDaily AI — 设计系统审查 & 全面优化计划 v3.0

> **审查日期**：2026-04-04
> **项目状态**：React 19 + TypeScript + Tailwind CSS + Supabase + Claude API
> **审查范围**：设计系统审计 + 竞品深度研究 + 可实施优化计划

---

## 第一部分：设计系统审查报告

### 1.1 审查概要

| 维度 | 当前评分 | 说明 |
|------|---------|------|
| Token 体系 | **8/10** | HSL CSS Variables 覆盖完整，light/dark 双主题，但缺少语义化扩展 |
| 组件库 | **7/10** | 62 个 UI 组件，CVA 变体管理规范，`data-slot` 标识完整 |
| 间距一致性 | **5/10** | 未严格遵循 4px 网格，出现 p-5、p-7 等非标准值 |
| 色彩规范 | **7/10** | 主题 token 完整，但存在硬编码 rgba/hex，缺少语义色（success/warning/info） |
| 动效体系 | **7/10** | 定义了 3 级时长 token + easing，但 Framer Motion 用法不统一 |
| 响应式 | **6/10** | 移动端适配不够深入，缺少专门的移动端交互模式 |
| 可访问性 | **6/10** | 基础 focus 样式存在，ARIA 覆盖不完整 |
| 文档化 | **3/10** | 几乎无组件文档和设计规范文档 |

**综合评分：62/100**

---

### 1.2 色彩 Token 现状

**已定义（index.css）：**

```
品牌色 (Primary):   161° 84% 35% (翡翠绿) → dark: 161° 84% 45%
强调色 (Accent):    187° 86% 37% (青蓝)   → dark: 187° 78% 48%
危险色 (Destructive): 0° 84% 60%          → dark: 0° 72% 42%
背景/前景/卡片/弹层/边框/输入/聚焦环 等 14 个语义 token
Sidebar 专用 8 个 token
```

**缺失 Token：**

| 需要补充 | 用途 | 建议值 (HSL) |
|---------|------|-------------|
| `--success` | 正确答案、学习完成 | 161 84% 35% (复用 primary) |
| `--warning` | 即将到期复习、难词提醒 | 38 92% 50% |
| `--info` | 提示信息、AI 解释 | 217 91% 60% |
| `--surface-elevated` | 悬浮卡片、弹层背景 | 独立于 card 的提升层 |
| `--gradient-start/end` | 品牌渐变统一 | 翡翠→青蓝 |

**硬编码问题：**

- `Home.tsx` 中 `#80808012` 用于网格背景 → 应抽取为 `--grid-color`
- 多处内联 `rgba(16,185,129,...)` → 应使用 `bg-emerald-xxx/opacity` 或 token
- `index.css` 中 glow 工具类直接使用 rgba → 建议抽取为 shadow token

---

### 1.3 间距体系问题

**当前问题**：混用 p-4、p-5、p-6、p-7，无严格规则

| 出现场景 | 当前值 | 问题 |
|---------|-------|------|
| Dashboard 页面内边距 | `p-5 sm:p-6 lg:p-7` | 5→6→7 步进不规则 |
| 卡片内部 | `p-4` ~ `p-6` | 同级卡片间距不一致 |
| Section 间距 | `gap-2` ~ `gap-6` | 无语义化间距规则 |
| LandingPage | `px-4 py-16 lg:px-6 lg:py-20` | 与 Dashboard 间距体系脱节 |

**建议标准化方案**：

```
Spacing Scale (严格 4px 倍数):
--space-1:   0.25rem (4px)   → 图标与文字间距
--space-2:   0.5rem  (8px)   → 紧凑元素间距
--space-3:   0.75rem (12px)  → 小组件内边距
--space-4:   1rem    (16px)  → 标准内边距
--space-6:   1.5rem  (24px)  → 卡片内边距
--space-8:   2rem    (32px)  → Section 间距
--space-12:  3rem    (48px)  → 大区块间距
--space-16:  4rem    (64px)  → 页面级间距
```

---

### 1.4 组件库审计

**62 个 UI 组件总览：**

| 类别 | 组件数 | 关键组件 | 完整度 |
|------|--------|---------|-------|
| 基础交互 | 8 | Button(6变体), Badge(4变体), Toggle, Switch | ✅ 良好 |
| 表单输入 | 12 | Input, Textarea, Checkbox, Radio, Select, OTP, Slider | ✅ 良好 |
| 数据展示 | 6 | Table, Card(7子组件), Chart, Progress, Avatar, Badge | ✅ 良好 |
| 弹层覆盖 | 8 | Dialog, AlertDialog, Drawer, Sheet, Popover, Tooltip | ✅ 良好 |
| 导航 | 5 | Sidebar, Tabs, Breadcrumb, NavigationMenu, Pagination | ⚠️ 缺 BottomNav |
| 布局 | 6 | ScrollArea, Separator, Accordion, Collapsible, Resizable | ✅ 良好 |
| 反馈 | 3 | Sonner(Toast), Skeleton, Spinner | ⚠️ 缺 EmptyState |
| 特效 | 3 | Spotlight, 3D-Card, Carousel | ✅ 独特 |

**缺失的关键组件（教育场景必需）：**

| 组件 | 用途 | 优先级 |
|------|------|--------|
| `BottomNavBar` | 移动端底部导航 | 🔴 P0 |
| `StreakCounter` | 连续学习天数展示 | 🔴 P0 |
| `XPProgressBar` | 经验值进度条 | 🔴 P0 |
| `FlashCard` | 标准化翻转卡片（当前内联在 TodayPage） | 🟡 P1 |
| `AudioPlayer` | 统一音频播放控件 | 🟡 P1 |
| `DifficultyIndicator` | 难度等级可视化（1-5星/圆点） | 🟡 P1 |
| `AchievementBadge` | 成就徽章展示 | 🟡 P1 |
| `ConfettiEffect` | 正确答案/达成里程碑庆祝动效 | 🟠 P2 |
| `LearningPathMap` | 学习路径可视化 | 🟠 P2 |

---

### 1.5 动效体系

**已定义 Token：**
```css
--duration-fast: 120ms    (微交互)
--duration-base: 180ms    (标准过渡)
--duration-slow: 280ms    (复杂动画)
--ease-standard: cubic-bezier(0.2, 0, 0, 1)
--ease-decelerate: cubic-bezier(0, 0, 0, 1)
```

**CSS Keyframes（index.css）：** bounce, shimmer, float, pulse-glow, spin-slow

**问题：**
1. Framer Motion 动画参数在各页面内联定义，未抽象为 motion preset
2. 缺少 `--ease-accelerate` 和 `--ease-spring` 曲线
3. 无统一的页面转场动画（路由切换无过渡）
4. 卡片翻转动画（TodayPage rotateY）未抽取为可复用组件

---

## 第二部分：竞品深度研究

### 2.1 竞品矩阵对比

| 能力维度 | Duolingo Max | Speak | ELSA Speak | Lingvist | Memrise | **VocabDaily AI** |
|---------|-------------|-------|-----------|---------|---------|------------------|
| AI 对话 | GPT-4o Roleplay + Video Call | GPT 自由对话 + Roleplay | 发音纠正对话 | ❌ | AI Buddies(4类) | Claude Chat ✅ |
| 词汇学习 | 嵌入课程中 | 对话中习得 | 发音驱动 | **核心**：自适应 SRS | SRS + 视频 | FSRS + 词书 ✅ |
| 语法教学 | 游戏化练习 | 对话纠错 | ❌ | ❌ | Grammar Buddy | 独立语法模块 ✅ |
| 阅读理解 | ❌ | ❌ | ❌ | 上下文例句 | ❌ | 阅读模块 ✅ |
| 听力训练 | 基础听写 | 对话听力 | 精听 | ❌ | ❌ | 听力模块 ✅ |
| 考试备战 | ❌ | ❌ | ❌ | ❌ | ❌ | **IELTS Prep ✅** |
| 发音评估 | 基础 | ✅ 实时 | **核心**：音素级 | ❌ | ❌ | ❌ 缺失 |
| Gamification | 🏆 极致 | ⚠️ 基础 | ⚠️ 基础 | ⚠️ 基础 | ✅ 中等 | ⚠️ 基础 |
| 暗色模式 | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ 完整 |
| 移动端优化 | 🏆 原生 | 🏆 原生 | 🏆 原生 | ✅ 响应式 | 🏆 原生 | ⚠️ 待优化 |

### 2.2 VocabDaily AI 的差异化优势

经过分析，VocabDaily AI 拥有独特的竞争定位：

1. **四技能全覆盖 + 考试备战**：市面上唯一将词汇/语法/阅读/听力/IELTS 备战集成在一个平台的 AI 学习工具
2. **FSRS 算法**：比传统 SM-2 更先进的间隔重复算法
3. **Claude AI 深度整合**：不是简单的 chatbot，而是贯穿学习全流程的 AI 教练
4. **本地优先架构**：IndexedDB + Supabase 同步，离线可用
5. **中英双语界面**：i18n 支持，服务中文母语学习者

### 2.3 需要弥补的关键差距

| 差距 | 竞品参照 | 影响 |
|------|---------|------|
| 游戏化体系薄弱 | Duolingo（连续天数、经验值、排行榜联赛、成就系统） | 用户留存率可能低 30-50% |
| 无发音评估 | ELSA Speak（音素级反馈）、Speak（实时口语评分） | 缺失口语技能训练的闭环 |
| 移动端体验不足 | Duolingo/Speak/ELSA（原生 App 级体验） | 丧失随时随地学习的场景 |
| 无情感化设计 | Babbel Speak（焦虑缓解设计）、Duolingo（喜悦感设计） | 学习动力不足 |
| 缺少场景化学习 | Speak/Duolingo（200+ Roleplay 场景） | AI 对话缺乏目标感和结构 |

---

## 第三部分：全面优化计划

### 3.1 优化优先级总览

```
Phase 1 (核心体验升级 — 2 周)
├── 1.1 设计系统规范化
├── 1.2 移动端响应式重构
├── 1.3 游戏化基础设施
└── 1.4 FlashCard 组件抽取

Phase 2 (AI 能力增强 — 3 周)
├── 2.1 场景化 Roleplay 对话系统
├── 2.2 AI 学习洞察看板
├── 2.3 发音评估 MVP
└── 2.4 AI 解释透明化

Phase 3 (情感化 & 留存 — 2 周)
├── 3.1 情感化微交互设计
├── 3.2 完整 Streak & 成就系统
├── 3.3 Onboarding 体验重设计
└── 3.4 推送 & 学习提醒

Phase 4 (增长 & 商业化 — 2 周)
├── 4.1 Landing Page 转化率优化
├── 4.2 社交学习功能
├── 4.3 付费墙 & 订阅流程
└── 4.4 性能优化 & PWA
```

---

### Phase 1：核心体验升级

#### 1.1 设计系统规范化

**1.1.1 补充语义色 Token**

在 `src/index.css` 的 `:root` 和 `.dark` 中新增：

```css
/* ===== 新增语义色 ===== */
--success: 161 84% 35%;           /* 复用 primary，正确/完成 */
--success-foreground: 0 0% 100%;
--warning: 38 92% 50%;            /* 橙黄色，即将到期/注意 */
--warning-foreground: 38 40% 12%;
--info: 217 91% 60%;              /* 蓝色，AI 提示/信息 */
--info-foreground: 0 0% 100%;

/* dark 模式对应 */
.dark {
  --success: 161 84% 45%;
  --success-foreground: 222 24% 8%;
  --warning: 38 92% 55%;
  --warning-foreground: 38 40% 12%;
  --info: 217 91% 65%;
  --info-foreground: 222 24% 8%;
}
```

在 `tailwind.config.js` 的 `colors` 中新增映射。

**1.1.2 统一间距规则**

全局搜索替换以下非标准间距：

```
p-5   → p-4 或 p-6（视上下文）
p-7   → p-8
gap-3 → gap-2 或 gap-4（视密度）
gap-5 → gap-4 或 gap-6
```

确立规则：
- 紧凑区域（输入组、badge 组）：gap-2 (8px)
- 标准区域（卡片列表、表单项）：gap-4 (16px)
- 宽松区域（Section 分隔）：gap-6 (24px) 或 gap-8 (32px)
- 页面级内边距：p-4 sm:p-6 lg:p-8（3 级递进）

**1.1.3 抽取硬编码色值**

```
Home.tsx #80808012 → CSS Variable --grid-line-color
所有内联 rgba(16,185,129,...) → bg-primary/[opacity] 或 bg-emerald-500/[opacity]
index.css glow 类中的 rgba → 使用 hsl(var(--primary) / x) 格式
```

**1.1.4 新增 Motion Preset 系统**

创建 `src/lib/motion.ts`：

```typescript
export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: [0.2, 0, 0, 1] }
  },
  fadeInUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: [0.2, 0, 0, 1] }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.18, ease: [0, 0, 0, 1] }
  },
  cardFlip: {
    transition: { duration: 0.5, ease: [0.2, 0, 0, 1] }
  },
  stagger: (i: number) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.06, duration: 0.28, ease: [0.2, 0, 0, 1] }
  }),
  pageTransition: {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
    transition: { duration: 0.2, ease: [0.2, 0, 0, 1] }
  }
} as const;
```

---

#### 1.2 移动端响应式重构

**1.2.1 新增 BottomNavBar 组件**

移动端（< 768px）使用底部导航替代侧边栏。核心导航项：

```
[Today] [Review] [Chat] [Practice] [More...]
  📅      🔄      💬      ✏️        ≡
```

实现要点：
- 在 `DashboardLayout.tsx` 中，移动端隐藏 Sidebar，显示 BottomNavBar
- 使用 `use-mobile.ts` hook 检测断点
- "More" 弹出 Sheet 展示完整导航
- 当前路由高亮 + 微弹动画
- Safe area padding（iPhone 底部安全区）

**1.2.2 页面内容移动端适配**

| 页面 | 优化项 |
|------|-------|
| TodayPage | 单词卡全屏、左右滑动切换、底部操作栏 |
| ReviewPage | 卡片占满视口、单手操作的"认识/不认识"按钮 |
| ChatPage | 全屏对话、输入栏固定底部、快捷回复浮层 |
| AnalyticsPage | 图表改为纵向滚动、卡片式数据展示 |
| VocabularyBankPage | 列表视图替代网格、搜索栏吸顶 |

**1.2.3 触摸手势支持**

```typescript
// 卡片翻转：点击翻转
// 复习队列：左滑"不认识"、右滑"认识"
// 导航：边缘右滑返回
```

---

#### 1.3 游戏化基础设施

**1.3.1 Streak 系统**

数据模型（新增到 IndexedDB + Supabase）：

```typescript
interface StreakData {
  current_streak: number;       // 当前连续天数
  longest_streak: number;       // 历史最长
  last_study_date: string;      // YYYY-MM-DD
  streak_freeze_count: number;  // 剩余冻结次数（Pro 功能）
  total_study_days: number;     // 累计学习天数
}
```

UI 组件：`StreakCounter`
- 位于 Dashboard 头部，始终可见
- 火焰图标 + 数字 + 微光动效
- 点击展开详情（日历热力图 + 统计）
- 达到里程碑（7天/30天/100天/365天）触发庆祝动画

**1.3.2 XP（经验值）系统**

```typescript
// XP 奖励规则
const XP_RULES = {
  word_review_correct: 10,
  word_review_incorrect: 2,  // 鼓励尝试
  daily_mission_complete: 50,
  chat_session_5min: 30,
  reading_complete: 40,
  listening_complete: 40,
  grammar_exercise: 25,
  streak_bonus_7day: 100,
  streak_bonus_30day: 500,
  first_review_of_day: 20,   // 每日首次学习额外奖励
};
```

UI 组件：`XPProgressBar`
- 日目标进度条（例：150 XP / 天）
- 获得 XP 时数字飞入动画
- 达到日目标时触发 confetti

**1.3.3 成就系统框架**

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;           // lucide icon name
  category: 'streak' | 'vocabulary' | 'practice' | 'social' | 'milestone';
  condition: (stats: UserStats) => boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  xp_reward: number;
}
```

初始成就列表（15-20 个）：
- 🔥 First Flame：连续学习 3 天
- 📚 Bookworm：学习 100 个单词
- 💎 Diamond Streak：连续学习 30 天
- 🎯 Perfect Review：一次复习全部正确
- 🗣️ Chatterbox：与 AI 对话 10 次
- 📖 Speed Reader：完成 5 篇阅读理解
- 👂 Sharp Ears：完成 5 次听力练习
- 🏆 IELTS Ready：完成一套完整模考

---

#### 1.4 FlashCard 组件抽取

将 `TodayPage.tsx` 中内联的 Word Workbench 3D 翻转卡片逻辑抽取为通用 `FlashCard` 组件：

```typescript
interface FlashCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
  onSwipeLeft?: () => void;   // 不认识
  onSwipeRight?: () => void;  // 认识
  className?: string;
}
```

复用场景：TodayPage、ReviewPage、PracticePage、MemoryCenterPage

---

### Phase 2：AI 能力增强

#### 2.1 场景化 Roleplay 对话系统

**学习竞品**：Duolingo Roleplay（78% 用户感觉更有准备）、Speak Roleplay Mode（任务驱动）、Babbel Speak（200+ 场景）

**设计方案：**

在 ChatPage 新增 "Roleplay" 模式标签页，提供结构化场景练习：

```typescript
interface RoleplayScenario {
  id: string;
  title: string;            // "Ordering at a Café"
  title_zh: string;         // "在咖啡馆点单"
  difficulty: 1 | 2 | 3;    // 入门 / 进阶 / 挑战
  category: 'daily' | 'travel' | 'business' | 'academic' | 'ielts';
  system_prompt: string;     // Claude 扮演角色的 prompt
  objectives: string[];      // 学生需要完成的 3 个任务
  key_phrases: string[];     // 推荐使用的短语
  estimated_minutes: number;
}
```

场景分类（首批 30 个）：

| 分类 | 场景示例 | 数量 |
|------|---------|------|
| 日常生活 | 咖啡馆、超市、问路、看医生、打电话 | 8 |
| 旅行 | 订酒店、机场、出租车、餐厅、景点 | 6 |
| 职场 | 面试、会议、邮件讨论、项目汇报 | 6 |
| 学术 | 课堂讨论、论文答辩、导师沟通 | 5 |
| IELTS | Part 1 个人话题、Part 2 独白、Part 3 讨论 | 5 |

UI 设计：
- 场景卡片网格，按分类/难度筛选
- 进入场景后，顶部显示"你需要完成的任务"清单
- 任务完成后 AI 给出评分和改进建议
- 关键短语高亮提示

---

#### 2.2 AI 学习洞察看板

在 AnalyticsPage 增加 AI 驱动的学习洞察：

```typescript
interface AIInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  data_basis: string;        // 基于什么数据得出
  action_url?: string;       // 跳转到练习/复习
  confidence: number;        // 0-1
}
```

洞察示例：
- "你在 'Academic' 类词汇的记忆保持率比 'Daily' 类低 23%，建议增加语境练习"
- "过去 7 天你的最佳学习时间是 21:00-22:00，这个时段记忆效率高 15%"
- "你已经掌握了 IELTS 6.0 水平的 78% 核心词汇，还需要攻克 45 个高频词"
- "你的语法弱点集中在定语从句和虚拟语气，推荐以下练习..."

生成方式：每日/每周由 Claude API 根据学习数据生成，缓存到 Supabase。

---

#### 2.3 发音评估 MVP

**方案选择**：使用 Web Speech API (SpeechRecognition) 作为 MVP，后续升级到 Azure Speech SDK 或 Whisper API。

```typescript
interface PronunciationResult {
  transcript: string;        // 识别文本
  target: string;            // 目标文本
  accuracy_score: number;    // 0-100
  word_scores: Array<{
    word: string;
    score: number;
    phonemes?: string[];     // 后续扩展
  }>;
  feedback: string;          // AI 生成的改进建议
}
```

集成位置：
- ReviewPage：翻到单词正面时，可选"朗读练习"
- PracticePage：新增"发音练习"模式
- ChatPage：语音输入 + 发音评分

UI：
- 麦克风按钮 + 波形动画
- 评分结果以 CircularProgress 展示
- 错误发音标红 + AI 纠正建议

---

#### 2.4 AI 解释透明化

学习竞品：Duolingo "Explain My Answer"、2026 趋势 "Explainable AI"

在所有 AI 交互中增加透明度：

- **复习时**：AI 解释为什么今天安排复习这个词（"根据 FSRS 算法，你在 3 天前学习这个词时记忆强度为 0.7，今天预计降至遗忘阈值"）
- **推荐时**：说明推荐理由（"基于你最近的阅读表现，这篇文章的词汇覆盖率为 85%，适合你当前水平"）
- **评分时**：展示评分维度和分数明细（"语法 8/10、词汇丰富度 6/10、连贯性 7/10"）

UI：可折叠的"为什么？"按钮，展开显示 AI 推理过程

---

### Phase 3：情感化 & 留存

#### 3.1 情感化微交互设计

**3.1.1 正确答案庆祝**

```
简单正确 → 绿色 checkmark 弹入 + 轻微 haptic
连续正确 3 个 → "Great streak!" toast + 星星粒子效果
全部正确 → confetti 爆发 + 成就感消息
困难词答对 → "Impressive!" 特殊动画
```

**3.1.2 错误答案鼓励**

```
错误 → 温和的橙色提示（非红色警告），显示正确答案
连续错误 → "No worries, let's review this together" + 跳转到详细解释
难词 → "This one is tricky! 72% of learners also found it challenging"
```

**3.1.3 里程碑庆祝**

```
学习 50/100/500/1000 词  → 全屏庆祝动画 + 分享卡片生成
连续 7/30/100/365 天     → 特殊徽章 + 社交分享
IELTS 模考提分           → 分数对比动画 + 鼓励消息
```

**3.1.4 空状态情感设计**

```
没有待复习单词 → "All caught up! 🎉" + 建议探索新内容
首次使用       → 温暖的欢迎插画 + 渐进式功能介绍
学习目标完成   → "Mission complete! Come back tomorrow for more"
```

---

#### 3.2 完整 Streak & 成就系统 UI

**Dashboard Header 重设计：**

```
┌──────────────────────────────────────────────┐
│ 🔥 Day 23        ⭐ 1,250 XP       🏆 12/30 │
│ ──────────────── 150/200 XP today ──────────  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░ 75%                    │
└──────────────────────────────────────────────┘
```

**Profile Page 成就展示：**

- 成就墙网格展示（已获得高亮、未获得灰色 + 解锁条件）
- 成就获得时的 unlock 动画
- 稀有度标识（Bronze/Silver/Gold/Diamond 边框颜色）

---

#### 3.3 Onboarding 体验重设计

当前 OnboardingPage 需要升级为渐进式引导流程：

```
Step 1: 选择学习目标
  → "你想提升哪方面？"
  → [考试备战] [日常交流] [职场英语] [学术英语]

Step 2: 评估当前水平
  → 5 道快速测评题（PlacementTest 组件已有）
  → 实时显示水平评估结果

Step 3: 设定每日目标
  → "每天想学多久？"
  → [5分钟·轻松] [15分钟·标准] [30分钟·挑战] [自定义]

Step 4: 个性化推荐
  → 基于 Step 1-3 生成个性化学习计划
  → "这是为你定制的第一周学习计划"

Step 5: 首次学习体验
  → 直接进入 TodayPage 开始第一个任务
  → Tooltip 指引关键功能
```

---

#### 3.4 推送 & 学习提醒

使用 Web Notification API + Service Worker：

```typescript
interface StudyReminder {
  type: 'streak_risk' | 'review_due' | 'daily_goal' | 'achievement';
  title: string;
  body: string;
  scheduled_time: string;    // HH:mm
  enabled: boolean;
}
```

提醒策略：
- 每日固定时间提醒（用户在设置中自选）
- Streak 即将中断提醒（21:00 如果当天未学习）
- 有到期待复习单词时推送
- 成就即将达成时鼓励（"再学 3 个词就解锁新成就"）

---

### Phase 4：增长 & 商业化

#### 4.1 Landing Page 转化率优化

**4.1.1 Hero Section 重设计**

- 添加产品截图/动态演示（当前仅文字）
- 社会证明：用户数、评分、testimonials
- 明确的 CTA 分层："免费开始" (Primary) + "观看演示" (Secondary)
- 添加"3 分钟体验"免注册 Demo 入口

**4.1.2 增加信任元素**

```
- 用户故事/Testimonials 轮播
- "7 天内 IELTS 词汇量提升 15%" 等数据点
- 媒体/教育机构 logo 墙
- "AI 驱动"技术说明（与 Claude 合作）
- 安全/隐私保障说明
```

**4.1.3 免费 Demo 体验**

提供无需注册的 3 分钟快速体验：
- 展示 5 个单词的学习流程
- 体验 AI 对话 1 轮
- 最后引导注册："保存你的学习进度"

---

#### 4.2 社交学习功能

**4.2.1 Leaderboard 增强**

当前 LeaderboardPage 需要：
- 周赛/月赛时间限制
- 联赛晋升/降级机制（参照 Duolingo Leagues）
- 好友系统 + 好友排行
- 学习组/班级排行

**4.2.2 分享功能**

- 每日学习总结生成精美分享卡片（包含 streak、XP、学习数据）
- 成就解锁分享
- 支持分享到微信/朋友圈（中文用户核心场景）
- 分享带邀请码，新用户注册双方获得 Pro 体验天数

---

#### 4.3 付费墙 & 订阅流程

当前 `billingGateway.ts` 为 stub，需要完整实现：

```
Free 套餐:
├── 每日 20 个单词复习
├── 基础 AI 对话（5 轮/天）
├── 1 本默认词书
└── 基础学习统计

Pro 套餐 (¥28/月 或 ¥198/年):
├── 无限单词复习
├── 无限 AI 对话（所有模式）
├── 无限词书导入
├── IELTS 备战全功能
├── AI 学习洞察
├── 发音评估
├── Streak 冻结（3次/月）
├── 高级学习统计
└── 优先 AI 响应速度
```

付费墙触发点：
- 超出免费额度时温和提示（非阻断式）
- 在 UpgradePrompt 组件中展示升级价值
- 支持微信支付 + Apple Pay（中国用户）

---

#### 4.4 性能优化 & PWA

**4.4.1 PWA 改造**

```
- Service Worker 注册（离线缓存核心资源）
- Web App Manifest（可安装到手机桌面）
- Background Sync（离线学习数据后台同步）
- Push Notification（学习提醒）
```

**4.4.2 性能优化清单**

| 优化项 | 当前状态 | 目标 |
|--------|---------|------|
| Code Splitting | ✅ 已有 lazy loading | 保持 |
| Bundle Size | 需审计 | < 300KB 首屏 |
| Image 优化 | 未做 | WebP + lazy load |
| Font 优化 | local() 引用 | 添加 font-display: optional |
| API 缓存 | TanStack Query | 调优 staleTime |
| IndexedDB 清理 | ❌ 无 TTL | 添加过期清理 |
| Prefetch | ❌ 无 | 预加载相邻页面 |

---

## 第四部分：实施路线图

### 里程碑时间线

```
Week 1-2: Phase 1 (核心体验)
  ├── Day 1-2:  设计系统规范化（Token + 间距 + Motion）
  ├── Day 3-5:  BottomNavBar + 移动端适配
  ├── Day 6-8:  FlashCard 组件 + 游戏化数据模型
  └── Day 9-10: Streak/XP UI 集成

Week 3-5: Phase 2 (AI 增强)
  ├── Day 11-14: Roleplay 场景系统（30 个场景 + UI）
  ├── Day 15-17: AI 洞察看板
  ├── Day 18-20: 发音评估 MVP
  └── Day 21-23: AI 解释透明化

Week 6-7: Phase 3 (情感化)
  ├── Day 24-26: 微交互 + 庆祝动效
  ├── Day 27-28: 成就系统 UI
  ├── Day 29-30: Onboarding 重设计
  └── Day 31-32: 推送提醒

Week 8-9: Phase 4 (增长)
  ├── Day 33-35: Landing Page 优化
  ├── Day 36-38: 社交功能 + Leaderboard
  ├── Day 39-41: 付费流程
  └── Day 42-44: PWA + 性能
```

### 每个 Phase 的验收指标

| Phase | 关键指标 | 目标值 |
|-------|---------|-------|
| Phase 1 | 移动端 Lighthouse Performance | > 90 |
| Phase 1 | 设计系统硬编码色值数 | 0 |
| Phase 2 | Roleplay 场景数 | ≥ 30 |
| Phase 2 | AI 洞察准确率（人工评估） | > 80% |
| Phase 3 | 日活跃用户次日留存率 | > 60% |
| Phase 3 | Onboarding 完成率 | > 85% |
| Phase 4 | Landing Page 注册转化率 | > 8% |
| Phase 4 | Lighthouse PWA Score | ✅ 通过 |

---

## 第五部分：给 Claude 的实施指引

当你将此计划交给 Claude 实施时，建议按以下方式拆分任务：

**任务 1**：设计系统规范化
> "请根据优化计划 1.1，在 index.css 中添加语义色 Token，在 tailwind.config.js 中添加对应映射，然后全局搜索并替换非标准间距值（p-5→p-4/p-6, p-7→p-8），最后创建 src/lib/motion.ts 动效预设文件。"

**任务 2**：BottomNavBar 组件
> "请创建 src/components/BottomNavBar.tsx 移动端底部导航组件，包含 Today/Review/Chat/Practice/More 五个入口，在 DashboardLayout.tsx 中集成，移动端显示底栏隐藏侧栏。"

**任务 3**：游戏化基础设施
> "请创建 src/services/gamification.ts（如已有则扩展），实现 StreakData 和 XP 数据模型及计算逻辑，创建 StreakCounter 和 XPProgressBar 组件，集成到 Dashboard 头部。"

**任务 4**：FlashCard 通用组件
> "请将 TodayPage.tsx 中的 Word Workbench 3D 翻转卡片逻辑抽取为 src/components/FlashCard.tsx 通用组件，支持 front/back 自定义渲染、翻转控制、左右滑动手势。"

**任务 5**：Roleplay 对话系统
> "请在 src/features/chat/ 下创建 Roleplay 模块，包含 30 个场景数据（scenarios.ts）、场景选择 UI、场景内对话 UI（任务进度追踪），集成到 ChatPage 作为新的 mode tab。"

（后续任务类推，每个任务对应计划中的一个小节）

---

## 附录：线上实际体验发现（2026-04-04 补充）

以下问题来自对 uuedu.online 线上环境的实际浏览体验：

### A. Landing Page 问题清单

| # | 问题 | 严重度 | 详情 |
|---|------|--------|------|
| A1 | **首屏加载显示纯文字 "Loading..."** | 🔴 P0 | 首次访问出现约 3-5 秒的 "Loading..." 白屏（暗色背景 + 浅灰文字），无骨架屏、无品牌 logo、无加载动画。首印象极差，用户可能直接离开。**建议**：添加品牌化 Skeleton（logo + 翡翠色进度条 + 翻转动画预览）。 |
| A2 | **导航锚点跳转失效** | 🟡 P1 | 点击顶部 "OUTCOMES" / "WORKFLOW" / "MEMBERSHIP" 锚点链接后，页面 URL 变为 `#outcomes` 但并未滚动到对应区域，用户仍停留在 Hero。**建议**：检查 `scroll-behavior: smooth` 与 Framer Motion 或 React Router 的冲突，确保 `id` 属性正确挂载。 |
| A3 | **Section 间距过大，存在大片空白** | 🟡 P1 | Outcomes 卡片区域和 Workflow 区域之间有约 1.5 个视口高度的纯黑空白。用户在滚动时会以为页面到底了。**建议**：将 section 间距从 `py-32+` 缩减到 `py-16 lg:py-20`，或在空白区域添加内容（如产品截图、数据亮点、用户评价）。 |
| A4 | **Hero 区域无产品截图/演示** | 🟡 P1 | Hero 仅有大标题 + 副标题 + 两个按钮，缺少产品界面预览。用户无法直观理解产品长什么样。**建议**：在 CTA 下方添加 Dashboard 截图或 30 秒产品动效 GIF。 |
| A5 | **"Watch Demo" 按钮无功能** | 🟡 P1 | 点击 "Watch Demo" 无反应或无目标页面。**建议**：录制 1-2 分钟产品演示视频，或改为 "Try for Free" 引导到注册流程。 |
| A6 | **Outcomes 卡片布局不均衡** | 🟠 P2 | 5 张功能卡（Today Mission, Spaced Review, Targeted Practice, AI Coach, Exam Prep, Real Analytics）布局为 3+2+1 不对称排列，底部两张卡片和上方 3 张对齐不够自然。**建议**：考虑使用 3+3 六宫格（增加 1 个特性卡）或 2+2+2 交错布局。 |
| A7 | **Landing Page 缺少社会证明** | 🟠 P2 | 无用户数量、评分、testimonials 或媒体推荐。新用户缺乏信任依据。**建议**：添加用户故事、学习成果数据、或 "Powered by Claude AI" 技术信任标识。 |

### B. 登录页面问题

| # | 问题 | 严重度 | 详情 |
|---|------|--------|------|
| B1 | **"使用演示账号"报 "Failed to fetch"** | 🔴 P0 | 演示账号功能失败（可能是 Supabase Edge Function 问题），新用户无法快速体验产品。**建议**：确保演示账号功能稳定可用，或改为前端预览模式（不需要后端认证的静态 Demo）。 |
| B2 | **登录失败错误提示不友好** | 🟡 P1 | 错误信息直接显示 "Failed to fetch"（技术术语），普通用户无法理解。**建议**：将错误信息映射为用户友好提示，如 "网络连接失败，请检查网络后重试" 或 "服务暂时不可用"。 |
| B3 | **密码框无显示/隐藏切换** | 🟠 P2 | 虽然有密码框，但右侧的 toggle 按钮视觉上不够明显（接近白色背景）。**建议**：增加对比度或使用明确的眼睛图标。 |
| B4 | **无第三方登录** | 🟠 P2 | 仅支持邮箱密码登录，缺少 Google/GitHub/微信 OAuth。**建议**：至少添加 Google OAuth（Supabase 原生支持）。 |

### C. Pricing 页面问题

| # | 问题 | 严重度 | 详情 |
|---|------|--------|------|
| C1 | **"Current Entitlement" 信息暴露过多技术细节** | 🟡 P1 | 显示 "Status: inactive · Provider: manual" 和 "AI feedback left today: 0 · Sim items left: 0 · Micro lessons left: 0"，这些是开发调试信息，不应展示给终端用户。**建议**：简化为 "当前套餐：Free" + 简洁的配额进度条。 |
| C2 | **"Web checkout enabled" 标签无上下文** | 🟡 P1 | 用户不知道这意味着什么。**建议**：移除此标签或改为 "支持在线支付"。 |
| C3 | **Free vs Pro 对比不够鲜明** | 🟠 P2 | 两个方案卡在视觉上差异不够大。**建议**：Pro 卡片使用翡翠色渐变边框+微光效果（已有 glow-emerald 系统），Free 卡片降低视觉权重。 |

### D. Word of the Day 页面

| # | 问题 | 严重度 | 详情 |
|---|------|--------|------|
| D1 | **定义区域下方有大片空白** | 🟡 P1 | Definition tab 内容只有一行定义和中文翻译，下方约 200px 空白。**建议**：默认展示更丰富的内容（例句、搭配词、AI 记忆技巧），或自适应高度。 |
| D2 | **缺少互动元素** | 🟡 P1 | 页面是纯展示型，用户无法互动（如"我学过这个词"/"加入词书"按钮）。**建议**：添加 "Add to my word bank" CTA，即使未登录也引导注册。 |
| D3 | **往期单词横向排列可能溢出** | 🟠 P2 | 5 张往期单词卡横向排列，窄屏幕下可能溢出。**建议**：使用 Carousel 或 ScrollArea 组件。 |

### E. 全局移动端问题

| # | 问题 | 严重度 | 详情 |
|---|------|--------|------|
| E1 | **Landing Page 导航栏未适配移动端** | 🔴 P0 | 在 390px 宽度下，导航栏仍水平展示所有项目（OUTCOMES, WORKFLOW, MEMBERSHIP, Word of the Day, Continue），未折叠为汉堡菜单。**建议**：< 768px 时收起为 hamburger menu + 抽屉面板。 |
| E2 | **Hero 标题在窄屏下消失** | 🔴 P0 | 390px 宽度下 Hero 区域的大标题完全不可见（可能是字体缩放或容器溢出问题）。**建议**：设置 `text-3xl sm:text-5xl lg:text-7xl` 渐进式字号。 |
| E3 | **无 viewport meta 适配?** | 🟡 P1 | 需要确认 `index.html` 中是否有正确的 `<meta name="viewport" content="width=device-width, initial-scale=1">` 设置。 |

### F. 性能与技术问题

| # | 问题 | 严重度 | 详情 |
|---|------|--------|------|
| F1 | **首屏加载时间过长** | 🔴 P0 | 从导航到页面完全渲染约 5-8 秒，期间仅显示 "Loading..."。**建议**：审查 bundle 拆分策略，确保 Landing Page 作为独立 chunk 优先加载；添加 SSR/预渲染。 |
| F2 | **错误处理 — "Failed to fetch" 未降级** | 🟡 P1 | Supabase 连接失败时，登录/演示账号直接抛出原始错误。**建议**：在 `aiGateway.ts` 和 `AuthContext.tsx` 中添加统一错误处理 + 用户友好提示 + 重试机制。 |

---

> **文档版本**：v3.1
> **最后更新**：2026-04-04
> **审查方法**：代码静态分析 + 竞品网络调研 + 2026 UX 趋势研究 + 线上实际体验审查

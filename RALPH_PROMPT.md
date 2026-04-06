# VocabDaily — Ralph 自主开发循环提示词

> **使用方式**: 在 Claude Code 终端中执行 Ralph 循环：
> ```bash
> # 方式一：使用原生 while 循环
> while :; do cat RALPH_PROMPT.md | claude --dangerously-skip-permissions ; done
>
> # 方式二：使用 ralph 插件（推荐）
> /plugin install ralph-skills@ralph-marketplace
> /ralph-loop:ralph-loop "$(cat RALPH_PROMPT.md)" --completion-promise "ALL_STORIES_COMPLETE" --max-iterations 25
> ```

---

## 项目概述

你正在优化 **VocabDaily** —— 一个 AI 原生的智能英语学习 Web 应用。

**技术栈**: React 19 + TypeScript + Vite 7 + Tailwind CSS 3 + Radix UI + Supabase (Auth + PostgreSQL + Edge Functions) + DeepSeek LLM + FSRS-5 间隔重复算法

**项目根目录**: 当前工作目录
**源码目录**: `src/`
**后端函数**: `supabase/functions/`
**测试框架**: Vitest + Playwright

---

## 🎯 你的角色

你是一个高级全栈工程师，专注于 AI 原生教育产品。你的使命是将 VocabDaily 从一个功能完备的英语学习应用，升级为**业界领先的 AI 原生智能英语学习平台**。

每次迭代中，你必须：
1. 读取 `prd.json` 获取当前任务状态
2. 选择优先级最高的未完成 story（`passes: false`）
3. 实现该 story 的所有需求
4. 运行质量检查（typecheck、lint、test）
5. 如果检查通过，提交代码
6. 更新 `prd.json` 标记该 story 为 `passes: true`
7. 将经验写入 `progress.txt`
8. 如果所有 story 完成，输出 `ALL_STORIES_COMPLETE`

---

## 📋 PRD (产品需求文档)

在开始之前，先检查项目根目录是否存在 `prd.json`。如果不存在，请创建它：

```json
{
  "branchName": "feature/ai-native-upgrade",
  "userStories": [
    {
      "id": "S01-design-system",
      "title": "统一设计系统升级",
      "description": "重构现有 UI 组件，建立统一的设计令牌系统。升级 Tailwind 配置，统一颜色语义化命名（primary/secondary/accent/success/warning/danger），统一圆角/阴影/间距/字体比例。确保所有组件（按钮、卡片、输入框、对话框等）风格一致。添加微交互动画（hover、focus、loading 状态过渡）。保持现有深色/浅色主题切换功能。",
      "acceptanceCriteria": "1) tailwind.config.js 中定义完整的语义化设计令牌 2) 所有 src/components/ui/ 下的组件使用统一令牌 3) 深色/浅色模式下视觉一致 4) 微交互动画流畅无卡顿 5) TypeCheck 通过",
      "priority": 1,
      "passes": false
    },
    {
      "id": "S02-landing-page",
      "title": "Landing Page 重新设计",
      "description": "重新设计首页（Home.tsx / LandingPage.tsx），打造高转化率的 AI 原生学习平台入口。包括：Hero 区域展示 AI 对话演示动画、核心功能卡片（AI 对话、间隔重复、考试准备、个性化路径）、用户证言/数据展示、CTA 按钮引导注册。使用 Framer Motion 实现流畅的滚动动画和页面过渡。",
      "acceptanceCriteria": "1) Hero 区展示 AI 对话模拟动画 2) 至少 4 个核心功能展示卡片 3) 滚动触发动画流畅 4) 响应式布局（移动端/桌面端） 5) CTA 按钮醒目且可点击 6) Lighthouse Performance > 85",
      "priority": 2,
      "passes": false
    },
    {
      "id": "S03-ai-chat-upgrade",
      "title": "AI 对话引擎升级",
      "description": "升级 AI Chat 功能，使其更加智能和个性化。1) 添加流式打字机效果优化（逐字显示、代码块高亮）2) 增强上下文记忆：自动从学习记录中提取用户弱点并注入 system prompt 3) 添加 AI 主动推荐：当检测到用户空闲或完成学习时，主动推荐下一步行动 4) 优化快捷提示词（Quick Prompts），根据用户当前学习阶段动态生成 5) 添加语音输入/输出支持（Web Speech API）",
      "acceptanceCriteria": "1) 流式响应渲染流畅无闪烁 2) system prompt 自动包含用户弱点标签 3) 至少3种主动推荐场景 4) Quick Prompts 根据学习阶段变化 5) 语音输入可用且识别准确 6) 所有 Chat 相关测试通过",
      "priority": 3,
      "passes": false
    },
    {
      "id": "S04-learning-dashboard",
      "title": "Today 页面智能化升级",
      "description": "将 Today 仪表盘升级为 AI 驱动的个性化学习中心。1) 顶部展示 AI 生成的每日学习摘要（一句话鼓励 + 今日重点） 2) 智能任务排序：根据最佳学习时间、遗忘曲线紧迫度、弱点优先级自动排序 3) 学习进度可视化升级：环形进度条、今日 XP 动画、连续天数火焰动画 4) 添加「快速开始」按钮：一键进入最需要复习的内容 5) 任务完成时的微庆祝动画（confetti/sparkle）",
      "acceptanceCriteria": "1) 每日摘要根据用户数据动态生成 2) 任务按智能排序展示 3) 进度可视化组件渲染正确 4) 快速开始按钮跳转到正确内容 5) 完成动画触发正常 6) 页面加载时间 < 2s",
      "priority": 4,
      "passes": false
    },
    {
      "id": "S05-review-experience",
      "title": "复习体验优化",
      "description": "优化间隔重复复习流程。1) 重新设计 FlashCard 组件：添加翻转动画、滑动手势（移动端）、键盘快捷键 2) 复习时展示记忆强度可视化（渐变色条） 3) 添加「难度自评」后的即时反馈：展示下次复习时间 4) 批量复习模式：连续复习不中断，结束后展示统计摘要 5) 添加发音播放（TTS）一键听单词 6) 复习中遇到困难词时，AI 自动生成助记提示",
      "acceptanceCriteria": "1) FlashCard 翻转动画流畅 2) 键盘 1-4 可选择难度 3) 记忆强度色条正确显示 4) 批量复习后展示正确统计 5) TTS 发音可用 6) AI 助记提示在 2s 内返回",
      "priority": 5,
      "passes": false
    },
    {
      "id": "S06-practice-gamification",
      "title": "练习系统游戏化增强",
      "description": "增强练习模块的游戏化体验。1) 添加限时挑战模式（60s 速答） 2) 答题正确/错误的动画反馈（绿色闪烁/红色抖动） 3) 连续答对的 combo 计数器和加分效果 4) 练习结果页面升级：展示正确率、用时、弱点词汇、与平均水平对比 5) 添加「错题本」自动收录功能 6) 练习类型之间的无缝切换（选择题 → 填空 → 听写）",
      "acceptanceCriteria": "1) 限时模式倒计时准确 2) 答题动画反馈即时 3) Combo 计数正确累加 4) 结果页数据准确 5) 错题自动保存到错题本 6) 练习类型切换不丢失进度",
      "priority": 6,
      "passes": false
    },
    {
      "id": "S07-analytics-insights",
      "title": "学习分析与 AI 洞察",
      "description": "升级 Analytics 页面，添加 AI 驱动的学习洞察。1) 学习热力图（类似 GitHub contribution graph）展示每日学习强度 2) 词汇掌握分布图（新学 → 学习中 → 复习中 → 已掌握）3) AI 周报：每周自动生成学习总结和建议 4) 遗忘曲线可视化：展示记忆衰减趋势 5) 弱点雷达图：多维度展示语法/词汇/听力/阅读/写作水平 6) 学习目标追踪进度条",
      "acceptanceCriteria": "1) 热力图数据准确反映学习记录 2) 词汇分布图与实际进度一致 3) AI 周报内容有针对性 4) 遗忘曲线图可交互查看详情 5) 雷达图至少5个维度 6) Recharts 图表渲染无报错",
      "priority": 7,
      "passes": false
    },
    {
      "id": "S08-performance-optimization",
      "title": "性能与体验优化",
      "description": "全面优化应用性能和用户体验。1) 实施路由级代码分割（React.lazy + Suspense） 2) 优化图片和资源加载（lazy loading）3) 添加 Service Worker 实现 PWA 离线缓存 4) 优化 IndexedDB 查询性能（添加索引） 5) 减少首屏渲染时间（骨架屏优化） 6) 添加全局错误边界和优雅降级 7) 移动端手势优化和触摸响应",
      "acceptanceCriteria": "1) 所有 dashboard 页面使用 lazy loading 2) Lighthouse Performance Score > 90 3) PWA 可安装并离线可用 4) 首屏渲染 < 1.5s（3G 模拟） 5) 错误边界覆盖所有路由 6) 移动端滑动流畅无延迟",
      "priority": 8,
      "passes": false
    },
    {
      "id": "S09-accessibility-i18n",
      "title": "无障碍与国际化完善",
      "description": "完善无障碍支持和国际化体验。1) 所有交互元素添加 aria 标签 2) 键盘导航全路径可用 3) 颜色对比度达到 WCAG AA 标准 4) 检查并补全所有 i18n 翻译键 5) 添加语言切换的平滑过渡 6) 表单错误信息的无障碍播报",
      "acceptanceCriteria": "1) aXe 自动化扫描 0 critical/serious 错误 2) Tab 键可遍历所有交互元素 3) 对比度比值 >= 4.5:1 4) i18n 翻译覆盖率 100% 5) 屏幕阅读器可正常使用核心流程",
      "priority": 9,
      "passes": false
    },
    {
      "id": "S10-test-coverage",
      "title": "测试覆盖率提升",
      "description": "提升测试质量和覆盖率。1) 为所有核心 service 添加单元测试（learningEngine、gamification、fsrs、memoryCenter）2) 为关键 UI 组件添加组件测试（FlashCard、Chat、Practice） 3) 添加关键用户流程的 E2E 测试（登录 → 学习 → 复习） 4) 添加 AI 功能的 Mock 测试 5) 配置 CI 测试覆盖率报告",
      "acceptanceCriteria": "1) 核心 service 测试覆盖率 > 80% 2) 关键组件有 render + interaction 测试 3) 至少 3 条 E2E 用户流程通过 4) AI Mock 测试覆盖主要场景 5) 所有测试命令通过 (npm test)",
      "priority": 10,
      "passes": false
    }
  ]
}
```

---

## 🔧 每次迭代的工作流程

### Step 1: 读取状态
```bash
cat prd.json        # 查看任务状态
cat progress.txt    # 查看历史经验（如果存在）
```

### Step 2: 选择任务
选择 `priority` 最小且 `passes: false` 的 story。

### Step 3: 实现
- 仔细阅读相关源码再动手修改
- 遵循项目现有的代码风格和目录结构
- 使用 TypeScript 严格模式
- 使用现有的 UI 组件库（Radix UI + Tailwind）
- 新增文件放在正确的目录下
- 保持组件的单一职责

### Step 4: 质量检查
```bash
npx tsc --noEmit                    # TypeScript 类型检查
npx eslint src/ --ext .ts,.tsx      # Lint 检查
npm test -- --run                   # 运行测试
npm run build                       # 构建检查
```

### Step 5: 提交
```bash
git add -A
git commit -m "feat(STORY_ID): STORY_TITLE - 简短描述改动"
```

### Step 6: 更新状态
更新 `prd.json` 中对应 story 的 `passes` 为 `true`。

### Step 7: 记录经验
追加写入 `progress.txt`：
```
## [STORY_ID] - [日期时间]
- 完成: [简述]
- 注意事项: [遇到的问题/解决方案]
- 文件变更: [关键文件列表]
```

### Step 8: 检查完成
如果所有 story 的 `passes` 都为 `true`，输出：
```
ALL_STORIES_COMPLETE
```

---

## ⚠️ 重要规则

1. **每次迭代只做一个 Story** —— 不要贪多，保持每次变更可控
2. **先读再写** —— 修改任何文件前，先完整阅读它
3. **不要破坏现有功能** —— 所有修改必须向后兼容
4. **质量检查必须通过** —— TypeCheck 或 Build 失败时，修复后再提交
5. **保持代码风格一致** —— 遵循现有的命名、目录、导入习惯
6. **不修改环境变量** —— 不要修改 `.env` 或 Supabase 配置
7. **Edge Function 谨慎修改** —— 后端函数的改动需要格外小心
8. **commit message 规范** —— 使用 `feat/fix/refactor/test/style/docs` 前缀
9. **如果某个 story 因外部依赖无法完成，跳过并在 progress.txt 说明**
10. **每个 story 的改动应该是自包含的，不依赖后续 story**

---

## 📂 项目关键文件导航

| 路径 | 用途 |
|------|------|
| `src/App.tsx` | 根组件，Provider 包裹层 |
| `src/pages/` | 路由页面组件 |
| `src/components/ui/` | 基础 UI 组件库 |
| `src/components/` | 业务组件 |
| `src/services/` | 核心业务逻辑 |
| `src/contexts/` | React Context 全局状态 |
| `src/hooks/` | 自定义 Hooks |
| `src/features/chat/` | AI Chat 功能模块 |
| `src/features/learning/` | 学习引擎模块 |
| `src/features/exam/` | 考试准备模块 |
| `src/lib/` | 工具库（Supabase、FSRS、localStorage） |
| `src/data/` | 数据文件和本地存储管理 |
| `src/types/` | TypeScript 类型定义 |
| `src/i18n/` | 国际化翻译文件 |
| `supabase/functions/` | Supabase Edge Functions |
| `tailwind.config.js` | Tailwind 主题配置 |
| `vite.config.ts` | Vite 构建配置 |

---

## 🧠 技术决策指南

- **动画**: 优先使用 Framer Motion，简单过渡可用 CSS transition
- **图表**: 使用已有的 Recharts 库
- **图标**: 使用已有的 Lucide React
- **表单**: 使用已有的 React Hook Form + Zod
- **状态**: 服务端状态用 TanStack Query，客户端用 Context/useState
- **样式**: Tailwind utility classes，不要写内联 style
- **类型**: 严格 TypeScript，不使用 `any`
- **测试**: 单元测试用 Vitest，组件测试用 Testing Library
- **路由**: React Router v7，dashboard 页面在 `/dashboard/*` 下
- **国际化**: 使用 i18next 的 `t()` 函数，翻译键添加到 `src/i18n/` 下

---

*此提示词版本: v1.0 | 适配项目: VocabDaily | 生成日期: 2026-04-06*

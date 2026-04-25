# VocabDaily Harness Engine / Ralph 开发手册

> 目标：让 Claude Code 在低人工干预、可验证、可恢复的循环里，把 VocabDaily 从“功能型学习工具”迭代成成熟的企业级 AI 英语学习产品。

## 1. 什么是 harness-engine

这里说的 `harness-engine` 不是单指某个 npm 包，而是一套包在大模型外面的工程控制层。模型负责生成和推理，harness 负责让它长期、稳定、可验证地工作。

近期 AI coding 圈子里反复出现同一个结论：单次模型能力不是全部，真正拉开差距的是外层 harness，包括任务队列、上下文压缩、工具调用、浏览器验证、测试门禁、部署回滚、记忆和审计日志。

可参考的公开资料：
- Anthropic Engineering: [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- Mule AI: [Ralph autonomous AI agent loop](https://muleai.io/blog/2026-03-07-ralph-autonomous-ai-agent-loop/)
- arXiv: [Dive into Claude Code: The Design Space of Today's and Future AI Agent Systems](https://arxiv.org/abs/2604.14228)
- arXiv: [AutoHarness: improving LLM agents by automatically synthesizing a code harness](https://arxiv.org/abs/2603.03329)
- Harness Developer Hub: [Harness Agents](https://developer.harness.io/docs/platform/harness-ai/harness-agents/)

## 2. 本项目的 harness 形态

VocabDaily 的 harness-engine 由 7 个层组成：

1. **PRD Ledger**：把产品目标拆成可验收 story，状态写在 `prd_v2.json` 或新的 `harness_progress.json`。
2. **Ralph Loop**：Claude Code 每轮只拿一个最高优先级任务，执行“读 -> 改 -> 验 -> 记录 -> 下一轮”。
3. **Context Capsule**：每轮先读少量固定入口文件，避免把 token 花在全仓库漫游。
4. **Verifier Stack**：每轮至少跑相关测试、`npm run build`、浏览器 smoke；涉及后端时补 Supabase/Vercel 检查。
5. **Product Evaluator**：每轮必须判断是否提升五个核心目标：UI、学习深度、AI 督学、学习督促、系统健康。
6. **Deployment Gate**：只有构建和 smoke 通过才允许提交推送；推送后检查 Vercel 部署。
7. **Progress Memory**：每轮把发现、决策、风险和下一步写回进度文件，给下一轮继承。

## 3. 五个长期目标

### G1. UI 升级

问题：设计语言不统一，部分页面仍像旧式模板；dashboard 有两套 shell；移动端核心学习入口不够突出。

第一阶段动作：
- 建立单一 dashboard route metadata registry，驱动侧栏、移动底栏、页面标题和搜索入口。
- 把 `LearningWorkspace` 提升为通用 product shell primitives。
- 先迁移 `Reading / Listening / Grammar / LearningPath / Leaderboard` 到统一学习 cockpit。
- 统一 auth/conversion 页面：`Home / Login / Register / Pricing / Onboarding`。

验收：
- 主要学习页视觉语言一致。
- 移动端 375px 下无文字溢出和入口丢失。
- Playwright 截图检查 dashboard 核心页。

### G2. 学习系统从玩具变成闭环

问题：Today/Practice/Review/LearningPath 之间存在数据断点；很多动作只更新 UI 或 event，没有真正改变学习模型。

第一阶段动作：
- Today 的 learned/hard/bookmark 状态从 `UserProgress` 派生，不只存在组件 state。
- `Hard` 必须进入 review/reinforcement 队列。
- Review 严格展示 due SRS；额外练习单独作为 reinforcement。
- Practice 答题结果写入 per-word progress、mistake collector、FSRS 或轻量 correctness metadata。
- LearningPath 完成状态由学习证据驱动，手动完成只作为 override。

验收：
- 刷新页面后 Today 状态不丢。
- 错题能进入后续复习/练习。
- Review 不再混入随机 today words。

### G3. AI 督学变得像老师

问题：当前 AI 更像“带提示词的聊天机器人”，缺少循循善诱、诊断、挑战和鼓励。

第一阶段动作：
- 在 `ai-chat` 和 client request payload 中加入统一 `COACHING_POLICY`。
- 结构化传入 `learningContext`：level、target、dailyMinutes、dueCount、learnerMode、burnoutRisk、weaknessTags、stubbornTopics、predictedRetention30d。
- 修复 `weakTags` 与 `weaknessTags` 的不一致，保证记忆系统能写入弱点。
- 简短问候也要带一个个性化下一步，而不是固定寒暄。
- quiz 答错后给 Socratic follow-up，而不只是显示对错。

验收：
- Chat 回复默认包含一个微挑战或下一步动作。
- AI 能引用用户当前 due/review/weakness 信号。
- Memory 写入包含 `learningContext.weaknessTags`。

### G4. 督促学习能力

问题：任务像列表，不像教练；缺少每日计划、提醒、复盘、低动力模式和长期追踪。

第一阶段动作：
- Today hero 显示 coach mission：今日最小可完成动作、预计分钟、为什么做它。
- 根据 learner model 生成 `recovery / maintenance / steady / stretch / sprint` 日计划。
- 未完成任务用 evidence events 追踪进度，不只 binary done。
- Chat welcome 推荐改成 mission cards，例如 “3-minute rescue drill”、“IELTS band +0.5 sprint”。
- 增加低压力 recovery 模式，避免 due backlog 时继续加新词。

验收：
- 用户打开 dashboard 时能清楚知道“现在做什么”和“为什么”。
- due backlog 高时不再鼓励加新词。
- 推荐任务和 learner model 一致。

### G5. 系统健康、Supabase、Vercel

问题：付费和环境配置存在 fail-open 风险；Supabase Functions 不是 Vercel 自动部署的一部分。

第一阶段动作：
- billing webhook 缺少 `STRIPE_WEBHOOK_SECRET` 时 fail closed。
- checkout 缺少真实 provider config 时不生成 mock success。
- 新增 migration 撤销 `subscriptions` 的 client insert/update policy。
- 前端生产环境缺少 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 时 fail fast。
- 写一份 release checklist：Vercel env、Supabase secrets、migrations、functions、prod smoke。

验收：
- 用户不能通过 client RLS 自升级 pro。
- mock checkout 不会在 production 成功。
- README/ops 文档明确 Supabase 需要单独部署。

## 4. Ralph 循环协议

每一轮 Claude Code 必须按这个顺序：

1. 读 `CLAUDE_CODE_RALPH_PROMPT.md`、`HARNESS_ENGINE_RALPH_GUIDE.md`、进度文件。
2. 选一个最高优先级任务，最多触碰一个功能域。
3. 用 `rg` 找相关代码，读最小必要文件。
4. 写测试或 smoke 复现，至少明确当前失败/缺口。
5. 用小 patch 实现。
6. 跑相关测试、`npm run build`。
7. 对 UI/交互改动启动本地服务，用 Playwright 检查。
8. 若通过，提交；若需要发布，推送并查 Vercel 部署。
9. 更新进度文件，记录下一轮入口。

## 5. Token 节省规则

你的 Claude Code 是 Max 20 额度，循环要省 token：

- 每轮只做一个 story，不要一次重构全站。
- 优先用 `rg -n` 定位，不要整文件大段粘贴。
- 读文件用小范围 `sed -n 'x,yp'`。
- 大页面先抽组件，不要让单文件继续膨胀。
- 不要反复解释同一背景，把状态写进进度文件。
- 出错时记录根因和下一步，不要在同一轮无限尝试。

## 6. 推荐运行方式

### 原生循环

```bash
while :; do
  claude --dangerously-skip-permissions < CLAUDE_CODE_RALPH_PROMPT.md
done
```

### 带停止词的 Ralph 插件

```bash
/ralph-loop:ralph-loop "$(cat CLAUDE_CODE_RALPH_PROMPT.md)" \
  --completion-promise "VOCABDAILY_ENTERPRISE_READY" \
  --max-iterations 80
```

### 分阶段低 token 跑法

```bash
# UI 先行
/ralph-loop:ralph-loop "$(cat CLAUDE_CODE_RALPH_PROMPT.md) PHASE=UI" --max-iterations 12

# 学习闭环
/ralph-loop:ralph-loop "$(cat CLAUDE_CODE_RALPH_PROMPT.md) PHASE=LEARNING" --max-iterations 18

# AI 督学
/ralph-loop:ralph-loop "$(cat CLAUDE_CODE_RALPH_PROMPT.md) PHASE=COACH" --max-iterations 18

# 安全和部署
/ralph-loop:ralph-loop "$(cat CLAUDE_CODE_RALPH_PROMPT.md) PHASE=OPS" --max-iterations 10
```


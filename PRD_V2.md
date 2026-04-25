# VocabDaily AI — PRD v2.0: 下一代 AI 原生英语学习平台

> **版本**: 2.0
> **日期**: 2026-04-06
> **基准**: V1 所有 10 个 User Stories 已完成 (S01-S10)
> **目标**: 将 VocabDaily 从"功能完备的学习工具"升级为"行业领先的 AI 原生英语学习平台"

---

## 一、战略背景与目标

### 1.1 当前状态

VocabDaily V1 已实现：
- 完整的 FSRS-5 间隔重复系统
- AI Chat 对话引擎（Claude/DeepSeek）
- 四技能覆盖（词汇/语法/阅读/听力）+ IELTS 备战
- 游戏化基础（XP/Streak/Achievements）
- 离线优先架构（IndexedDB + Supabase 同步）
- 双语界面（中/英）
- 130+ 单元测试，PWA 支持

### 1.2 市场差距分析

| 差距维度 | 竞品标杆 | 影响评估 |
|---------|---------|---------|
| 无口语/发音评估 | ELSA Speak (音素级), Speak (实时评分) | 缺失口语技能闭环，用户无法练习最需要的技能 |
| 场景化对话薄弱 | Duolingo Roleplay (78%用户更有信心), Speak (200+场景) | AI 对话缺乏目标感和结构，用户不知道"练什么" |
| 游戏化深度不足 | Duolingo (联赛/排行榜/生命值/宝石) | 用户留存率可能低 30-50% |
| 移动端体验粗糙 | Duolingo/ELSA/Speak (原生 App 级体验) | 丧失"随时随地学习"的核心场景 |
| 内容库稀薄 | Memrise (视频例句), Lingvist (自适应内容) | 考试题库和阅读素材不够丰富 |
| 社交学习缺失 | Duolingo (好友/排行榜联赛), HelloTalk (语伴) | 缺少社交激励和同伴学习 |
| Onboarding 粗糙 | Duolingo (5分钟上手), Speak (水平测试) | 新用户流失率高 |

### 1.3 V2 目标

**北极星指标**: 日活跃用户 7 日留存率 > 60%（行业平均 40%）

**核心策略**:
1. **AI 原生口语训练** — 弥补最大的功能缺口
2. **场景化结构学习** — 给 AI 对话一个"骨架"
3. **深度游戏化 + 社交** — 驱动留存的核心引擎
4. **移动优先体验** — 占领碎片时间学习场景
5. **内容生态扩展** — 丰富学习素材，支持 UGC

---

## 二、用户画像

### 2.1 主要用户角色

**角色 A：考试备战者 (占比 40%)**
- 大学生/职场人，准备 IELTS/TOEFL/CET
- 目标明确，需要结构化学习路径
- 愿意为备考付费，对效果敏感
- 核心需求：模考 + AI 批改 + 口语练习 + 词汇攻坚

**角色 B：职场英语提升者 (占比 30%)**
- 工作中需要使用英语（邮件/会议/演示）
- 碎片化学习时间（地铁/午休）
- 需要职场场景化练习
- 核心需求：商务场景对话 + 写作润色 + 词汇扩展

**角色 C：兴趣驱动学习者 (占比 20%)**
- 出于兴趣或旅行需要学英语
- 学习动力需要外部激励维持
- 对游戏化和趣味性敏感
- 核心需求：有趣的对话 + 游戏化激励 + 轻松的学习节奏

**角色 D：英语教师/内容创作者 (占比 10%)**
- 使用平台辅助教学或创建内容
- 需要数据分析和学生管理
- 核心需求：学情分析 + 内容定制 + 班级管理

---

## 三、PRD User Stories（V2 — 15 个 Stories）

### Phase 1: AI 口语引擎 (P0, Week 1-2)

#### S11: 发音评估 MVP
```
ID: S11-pronunciation-assessment
Title: AI 发音评估系统
Priority: 1
Estimated: 3 days

Description:
实现基于 Web Speech API + AI 评分的发音评估系统。
1) 创建 PronunciationLab 页面（/dashboard/pronunciation）
2) 单词级发音练习：展示单词 → 用户朗读 → 语音识别 → AI 评分
3) 句子级发音练习：展示句子 → 用户朗读 → 对比标准发音
4) 评分维度：准确度(0-100)、流利度(0-100)、语调(0-100)
5) AI 反馈：具体指出哪些音素发音不准，给出矫正建议
6) 练习记录保存，弱音统计
7) 与 FSRS 系统集成：发音困难的词自动增加复习频率

Implementation Notes:
- 使用 Web Speech API (SpeechRecognition) 做语音识别
- 使用 Supabase Edge Function 调用 Claude 做智能评分
- 前端创建 src/features/pronunciation/ 模块
- 新增 src/services/pronunciationScorer.ts
- 新增 src/hooks/usePronunciationSession.ts
- TTS 对比使用已有的 tts.ts 服务

Acceptance Criteria:
1) 单词朗读后 2s 内返回评分
2) 评分包含准确度/流利度/语调三个维度
3) AI 反馈具体到音素级别
4) 练习记录持久化到 IndexedDB + Supabase
5) 弱音词自动加入复习队列
6) TypeCheck + Build 通过
7) 至少 5 个单元测试覆盖评分逻辑
```

#### S12: 场景化 Roleplay 对话
```
ID: S12-roleplay-scenarios
Title: 场景化 Roleplay 对话系统
Priority: 2
Estimated: 3 days

Description:
在 ChatPage 新增 Roleplay 模式，提供结构化场景练习。
1) 创建场景数据模型和首批 30 个场景
   - 日常生活 8 个（咖啡馆/超市/问路/看医生/打电话/租房/银行/邮局）
   - 旅行 6 个（订酒店/机场/出租车/餐厅/景点/紧急情况）
   - 职场 6 个（面试/会议/邮件讨论/项目汇报/电话会议/客户拜访）
   - 学术 5 个（课堂讨论/论文答辩/导师沟通/学术演讲/实验讨论）
   - IELTS 5 个（Part1 个人话题/Part2 独白/Part3 讨论/写作讨论/阅读讨论）
2) Roleplay 场景选择界面（卡片网格，按分类/难度筛选）
3) 进入场景后：
   - 顶部显示场景目标和需完成的 3 个任务
   - AI 扮演对应角色（服务员/面试官/教授等）
   - 关键短语提示（可折叠）
   - 支持语音输入和文字输入
4) 场景完成后 AI 给出评分和改进建议
5) 场景完成记录和 XP 奖励

Implementation Notes:
- 新增 src/data/roleplayScenarios.ts（场景数据）
- 新增 src/features/chat/components/RoleplayMode.tsx
- 新增 src/features/chat/components/ScenarioSelector.tsx
- 新增 src/features/chat/components/ScenarioObjectives.tsx
- 修改 ChatPage.tsx 添加 Roleplay 标签页
- 每个场景的 system_prompt 需精心设计

Acceptance Criteria:
1) 30 个场景数据完整（title/description/system_prompt/objectives/key_phrases）
2) 场景选择 UI 支持分类和难度筛选
3) 进入场景后 AI 正确扮演角色
4) 任务完成检测正常工作
5) 完成后评分和建议有针对性
6) 语音输入可用
7) XP 奖励正确发放
```

### Phase 2: 体验深化 (P0, Week 2-3)

#### S13: 移动端底部导航 + 响应式重构
```
ID: S13-mobile-experience
Title: 移动端体验全面升级
Priority: 3
Estimated: 2 days

Description:
将移动端体验从"能用"升级到"好用"。
1) 创建 BottomNavBar 组件
   - 移动端 (< 768px) 隐藏 Sidebar，显示底部导航
   - 5 个核心入口：Today / Review / Chat / Practice / More
   - 当前路由高亮 + 微弹动画
   - iPhone Safe Area 适配
   - "More" 弹出 Sheet 展示完整导航
2) 关键页面移动端适配优化
   - TodayPage：单词卡全屏模式，底部操作栏
   - ReviewPage：全屏卡片，单手操作按钮
   - ChatPage：全屏对话，输入栏固定底部
   - PracticePage：选项按钮增大，适合拇指操作
3) 触摸手势支持
   - FlashCard：左滑"不认识"、右滑"认识"
   - 列表页：下拉刷新

Implementation Notes:
- 新增 src/components/BottomNavBar.tsx
- 修改 src/layouts/DashboardLayout.tsx
- 使用 Framer Motion 的 drag/swipe API
- 测试在 Chrome DevTools 移动模拟器中

Acceptance Criteria:
1) 移动端 (<768px) 显示底部导航，隐藏侧边栏
2) 5 个导航项正确跳转和高亮
3) iPhone Safe Area 底部不被遮挡
4) FlashCard 支持左右滑动手势
5) ChatPage 输入栏始终可见
6) 所有页面移动端无水平溢出
```

#### S14: 深度游戏化 — 排行榜联赛 + 社交系统
```
ID: S14-social-gamification
Title: 排行榜联赛与社交学习系统
Priority: 4
Estimated: 3 days

Description:
参考 Duolingo 联赛系统，构建社交激励体系。
1) 周赛联赛系统
   - 将用户分入 30 人联赛组（Bronze/Silver/Gold/Diamond/Champion）
   - 每周日结算，前 10 名晋级，后 5 名降级
   - 联赛页面展示实时排名、XP 变化动画
   - 赛季结束奖励（徽章/头衔）
2) 好友系统
   - 添加好友（通过邀请链接/搜索）
   - 好友列表展示学习状态
   - 好友 Streak 互动（鼓励消息）
3) 升级 LeaderboardPage
   - 周赛联赛 Tab
   - 好友排行 Tab
   - 全服排行 Tab
   - 个人赛季历史
4) 推送通知
   - "你的好友 X 今天学了 50 个单词"
   - "联赛结算倒计时 2 小时"
   - "你即将被降级，快来学习！"

Implementation Notes:
- 新增 Supabase 表：leagues, league_members, friendships
- 新增 Supabase Edge Function: league-assign, league-settle
- 新增 src/features/social/ 模块
- 修改 LeaderboardPage.tsx
- 使用 Supabase Realtime 做排名实时更新

Acceptance Criteria:
1) 联赛分组逻辑正确（30人/组，5级联赛）
2) 排名按周 XP 正确计算
3) 晋级/降级动画展示
4) 好友添加和列表正常
5) Supabase Realtime 排名更新 < 5s
6) 通知触发条件正确
```

#### S15: 智能 Onboarding 重设计
```
ID: S15-smart-onboarding
Title: 智能 Onboarding 体验
Priority: 5
Estimated: 2 days

Description:
重新设计新用户引导流程，5 分钟内让用户体验到核心价值。
1) 水平测试
   - 10 道自适应题目（根据答题情况动态调整难度）
   - 涵盖词汇/语法/阅读/听力
   - 测试结束确定 CEFR 等级 (A1-C2)
2) 学习目标设置
   - 选择学习目的（考试/职场/兴趣/旅行）
   - 设置每日学习时长（5/10/15/20 分钟）
   - 选择关注技能（词汇/口语/阅读/写作/听力）
3) 个性化学习路径生成
   - 根据水平 + 目标，AI 生成个性化学习计划
   - 展示"你的学习路径"预览
   - 推荐首个学习任务
4) 首次学习体验引导
   - 引导完成第一次复习（3 个词）
   - 引导与 AI 进行第一次对话
   - 庆祝首次完成（confetti + XP 奖励）
5) Onboarding 数据持久化

Implementation Notes:
- 重写 src/pages/auth/OnboardingPage.tsx
- 新增 src/features/onboarding/ 模块
- 新增 src/components/PlacementTest.tsx 自适应测试逻辑
- 新增 src/data/placementQuestions.ts（分级题库）

Acceptance Criteria:
1) 水平测试 10 题内准确定位 CEFR 等级
2) 学习目标选择 UI 流畅
3) AI 学习计划生成 < 3s
4) 首次学习引导步骤完整
5) Onboarding 数据正确保存到 profile
6) 跳过 Onboarding 后仍可在 Settings 重做
```

### Phase 3: 内容 & AI 增强 (P1, Week 3-4)

#### S16: AI 写作助手
```
ID: S16-ai-writing-assistant
Title: AI 写作训练与批改系统
Priority: 6
Estimated: 2 days

Description:
构建完整的英语写作训练闭环。
1) 写作练习页面（/dashboard/writing）
   - 自由写作模式：给定话题，自由发挥
   - IELTS Task 1/2 模拟
   - 商务邮件写作练习
   - 日记/短文写作
2) AI 实时写作辅助
   - 写作过程中的即时拼写/语法提示（下划线标注）
   - 写完后 AI 全面批改
   - 批改维度：语法(Grammar)、词汇(Vocabulary)、连贯性(Coherence)、任务完成度(Task Achievement)
   - IELTS 写作给出 Band Score 预估
3) 修改建议
   - AI 逐句给出修改建议
   - 一键采纳修改
   - 修改前后对比展示
4) 写作统计
   - 词汇丰富度（TTR/MTLD）
   - 句法复杂度
   - 常见错误类型分布
   - 历史写作进步曲线

Implementation Notes:
- 新增 src/pages/dashboard/WritingPage.tsx
- 新增 src/features/writing/ 模块
- 复用已有的 ai-grade-writing Edge Function
- 新增 src/services/writingAnalytics.ts

Acceptance Criteria:
1) 写作编辑器流畅（基于 textarea 或轻量富文本）
2) AI 批改 < 5s 返回结果
3) 批改报告包含 4 个维度评分
4) 修改建议可一键采纳
5) 写作历史正确保存
6) IELTS 写作预估分数合理
```

#### S17: 学习路径 & 课程体系
```
ID: S17-learning-paths
Title: 结构化学习路径系统
Priority: 7
Estimated: 3 days

Description:
为不同目标的用户提供结构化学习路径。
1) 学习路径数据模型
   - Path → Stage → Unit → Lesson
   - 每个 Lesson 包含：词汇(5-10) + 语法点(1) + 练习(3-5) + 场景对话(1)
2) 预设学习路径
   - IELTS 6.0 攻略（30 天）
   - IELTS 7.0 冲刺（45 天）
   - 商务英语入门（20 天）
   - 日常对话流利度（30 天）
   - 学术英语写作（25 天）
3) 路径可视化
   - 地图/路线图样式展示进度
   - 每个节点可点击进入 Lesson
   - 已完成节点显示评分
   - 当前节点高亮 + 脉冲动画
4) AI 自适应路径调整
   - 根据学习表现动态调整后续 Lesson 难度
   - 薄弱环节自动插入补充 Lesson
5) 路径进度面板
   - 在 TodayPage 展示当前路径进度
   - 预计完成日期
   - 今日路径任务

Implementation Notes:
- 新增 src/features/paths/ 模块
- 新增 src/pages/dashboard/LearningPathPage.tsx
- 新增 src/data/learningPaths.ts（路径数据）
- 新增 Supabase 表：learning_paths, path_progress
- 路径可视化使用 SVG + Framer Motion

Acceptance Criteria:
1) 5 条预设路径数据完整
2) 路径可视化渲染正确
3) 进度追踪准确
4) Lesson 页面包含词汇+语法+练习+对话
5) AI 调整逻辑正确触发
6) TodayPage 集成路径进度
```

#### S18: 智能内容推荐引擎
```
ID: S18-content-recommendation
Title: AI 驱动的个性化内容推荐
Priority: 8
Estimated: 2 days

Description:
基于 Learner Model 构建智能推荐系统。
1) 推荐引擎核心
   - 综合评估：FSRS 记忆状态 + 学习历史 + 弱点标签 + 目标 + 时间偏好
   - 推荐类型：今日词汇 / 推荐阅读 / 推荐练习 / Roleplay 场景 / 写作话题
   - 推荐理由（transparency）："推荐这篇文章因为你需要加强 Academic 词汇"
2) 今日推荐卡片
   - TodayPage 顶部展示 3 张推荐卡片
   - 每张卡片：标题 + 推荐理由 + 预计时长 + 一键开始
   - 可刷新获取新推荐
3) 发现页（Discovery）
   - 按技能分区推荐（阅读/听力/口语/写作）
   - "为你精选"板块
   - 热门内容排行
4) 推荐反馈循环
   - 用户可标记"不感兴趣"
   - 完成推荐内容后收集评价
   - 反馈数据优化后续推荐

Implementation Notes:
- 新增 src/services/recommendationEngine.ts
- 修改 TodayPage 集成推荐卡片
- 新增 src/pages/dashboard/DiscoveryPage.tsx
- 利用已有的 learnerModel.ts 数据

Acceptance Criteria:
1) 推荐引擎基于真实学习数据计算
2) 推荐理由清晰可理解
3) TodayPage 推荐卡片渲染正确
4) 发现页按分区展示
5) "不感兴趣"反馈正常工作
6) 推荐在 1s 内计算完成
```

### Phase 4: 质量 & 扩展 (P1, Week 4-5)

#### S19: 阅读理解内容扩展
```
ID: S19-reading-content-expansion
Title: 阅读理解内容库扩展
Priority: 9
Estimated: 2 days

Description:
丰富阅读理解模块的内容和功能。
1) 分级阅读素材库
   - 6 个 CEFR 等级各 20 篇文章（共 120 篇）
   - 题材覆盖：科技/文化/商业/日常/学术/时事
   - 每篇包含：文章 + 生词标注 + 理解题(5) + 翻译对照
2) AI 生成阅读素材
   - 用户可选择话题和难度，AI 实时生成阅读材料
   - 自动生成理解题和词汇题
3) 阅读辅助功能
   - 点击生词查释义（弹出卡片）
   - 一键添加生词到词汇本
   - 句子级翻译（长按句子）
   - 阅读速度追踪（WPM）
4) 阅读统计
   - 已读文章数/总词数
   - 平均阅读速度趋势
   - 理解正确率

Implementation Notes:
- 扩展 src/data/readingContent.ts
- 修改 ReadingPage.tsx 添加新功能
- 新增 AI 内容生成 Edge Function
- 新增 src/services/readingAnalytics.ts

Acceptance Criteria:
1) 120 篇分级文章数据完整
2) 点击生词弹出释义正常
3) 一键加词功能正常
4) AI 生成文章质量合格（语法正确、难度匹配）
5) 阅读速度追踪准确
6) 理解题评分正确
```

#### S20: 听力训练内容扩展
```
ID: S20-listening-content-expansion
Title: 听力训练模块升级
Priority: 10
Estimated: 2 days

Description:
升级听力训练模块的功能和内容。
1) 听力练习模式升级
   - 精听模式：逐句听写，AI 评分
   - 泛听模式：听完全文后答题
   - 听力填空：关键词填空
   - 跟读模式：听一句跟读一句（结合发音评估）
2) TTS 增强
   - 支持调节语速（0.5x/0.75x/1.0x/1.25x/1.5x）
   - 支持多种口音（美音/英音/澳音）
   - 支持重复播放单句
3) 听力素材扩展
   - 对话类素材 50 篇
   - 独白/演讲类 30 篇
   - 新闻/播客类 20 篇
   - 按 CEFR 等级分类
4) 听力统计
   - 听力时长统计
   - 听写准确率趋势
   - 弱音标识

Implementation Notes:
- 修改 ListeningPage.tsx
- 扩展 src/services/tts.ts 支持语速和口音
- 新增 src/data/listeningContent.ts
- 新增 src/features/listening/ 模块

Acceptance Criteria:
1) 4 种听力模式可正常使用
2) 语速调节和口音切换正常
3) 听写评分准确
4) 跟读模式结合发音评估
5) 素材数据完整（100 篇）
6) 统计数据正确
```

#### S21: 语法专项训练升级
```
ID: S21-grammar-upgrade
Title: 语法训练模块升级
Priority: 11
Estimated: 2 days

Description:
将语法从"知识展示"升级为"交互式训练"。
1) 语法知识库结构化
   - 30 个核心语法点（时态/从句/虚拟语气/冠词/介词等）
   - 每个语法点：规则说明 + 例句 + 常见错误 + 练习
   - 按难度分级（初级/中级/高级）
2) 交互式语法练习
   - 改错题：找出并修正句中语法错误
   - 选择题：选择正确的语法形式
   - 填空题：填入正确的语法结构
   - 句子重组：将打乱的词组排成正确句子
   - 翻译题：中译英（检验语法应用能力）
3) AI 语法教练
   - 用户可以问 AI 任何语法问题
   - AI 根据用户的语法弱点推荐练习
   - 练习中遇到困难，AI 即时解释
4) 语法进度追踪
   - 每个语法点的掌握程度（未学/学习中/已掌握）
   - 弱项语法雷达图
   - 语法练习正确率趋势

Implementation Notes:
- 重构 GrammarPage.tsx
- 新增 src/features/grammar/ 模块
- 新增 src/data/grammarContent.ts（语法数据）
- 新增 src/services/grammarEngine.ts

Acceptance Criteria:
1) 30 个语法点数据完整
2) 5 种练习类型可正常交互
3) AI 语法解释清晰准确
4) 进度追踪数据正确
5) 弱项推荐逻辑正确
```

#### S22: 错题本 & 智能复习
```
ID: S22-mistake-book-upgrade
Title: 智能错题本系统
Priority: 12
Estimated: 1.5 days

Description:
将分散在各模块的错题统一管理，智能复习。
1) 统一错题收集
   - 练习错题（词汇/语法/阅读/听力/写作）
   - 发音错误（弱音词）
   - Roleplay 中的语法/词汇错误
   - 手动标记的困难项
2) 错题本页面（/dashboard/mistakes）
   - 按类型分类（词汇/语法/发音/写作）
   - 按时间排序（最近/最早）
   - 按频率排序（错误次数最多的排前面）
   - 搜索和筛选
3) 智能错题复习
   - AI 根据错误类型生成针对性复习计划
   - 错题变体练习（同一知识点不同题目）
   - 错题消除：连续答对 3 次可"消除"
4) 错题分析
   - 常见错误模式分析
   - AI 洞察："你的定冠词使用错误集中在..."
   - 错误趋势图（是否在改善）

Implementation Notes:
- 新增 src/pages/dashboard/MistakeBookPage.tsx
- 新增 src/services/mistakeCollector.ts
- 修改各练习模块，统一错题上报格式
- 新增 src/types/mistakes.ts

Acceptance Criteria:
1) 各模块错题自动收集
2) 错题本页面展示正确
3) 分类/排序/搜索功能正常
4) 变体练习生成质量合格
5) 错题消除逻辑正确
6) 错误趋势图数据准确
```

#### S23: 学习日历 & 提醒系统
```
ID: S23-study-calendar
Title: 学习日历与智能提醒
Priority: 13
Estimated: 1.5 days

Description:
帮助用户规划和坚持学习计划。
1) 学习日历视图
   - 月视图：每天展示学习完成情况（颜色深浅表示学习强度）
   - 周视图：展示每天的学习任务和完成情况
   - 点击日期查看当天详细学习记录
2) 学习计划设置
   - 每日学习时间段偏好（早/中/晚）
   - 每周学习天数（可休息日）
   - 每日目标（单词数/XP/时长）
3) 智能提醒
   - 基于用户偏好时间发送学习提醒（Web Push / Email）
   - Streak 即将中断提醒
   - 复习到期提醒（"你有 15 个词即将过期"）
   - 联赛结算提醒
4) 整合到 TodayPage
   - 迷你日历组件展示本周学习
   - 今日剩余任务概览

Implementation Notes:
- 新增 src/features/calendar/ 模块
- 新增 src/pages/dashboard/CalendarPage.tsx
- 使用 Web Push API / Notification API
- 修改 TodayPage 添加迷你日历
- 新增 src/services/reminderService.ts

Acceptance Criteria:
1) 日历视图正确展示学习记录
2) 学习计划设置保存正常
3) Web Push 通知可发送
4) 提醒时间与用户偏好匹配
5) 迷你日历组件渲染正确
```

#### S24: 付费订阅 & 计费系统完善
```
ID: S24-billing-completion
Title: 订阅与计费系统完善
Priority: 14
Estimated: 2 days

Description:
完善付费功能，实现商业化闭环。
1) 订阅计划完善
   - Free: 每日 10 词 + 3 次 AI 对话 + 基础练习
   - Pro ($9.99/月): 无限词汇 + 无限 AI + 全部练习模式 + 发音评估 + Streak Freeze
   - Team ($19.99/人/月): Pro + 班级管理 + 学情分析 + 定制内容
2) 付费墙实现
   - 免费用户触达限制时，展示升级提示（UpgradePrompt 组件优化）
   - 升级页面展示功能对比表
   - 付费功能入口添加 Pro 标识
3) Stripe 集成完善
   - 订阅创建/取消/变更
   - Webhook 处理（invoice.paid / subscription.deleted 等）
   - 订阅状态实时同步
4) 支付宝集成（中国用户）
   - Alipay 支付流程
   - 订单管理
5) 订阅管理页面
   - 当前计划展示
   - 升级/降级
   - 账单历史
   - 取消订阅

Implementation Notes:
- 完善已有的 billingGateway.ts
- 完善 Supabase billing-* Edge Functions
- 修改 PricingPage.tsx
- 新增 src/pages/dashboard/SubscriptionPage.tsx
- UpgradePrompt 组件优化

Acceptance Criteria:
1) 3 个订阅计划正确展示
2) 付费墙在正确时机触发
3) Stripe Checkout 流程完整
4) Webhook 正确处理
5) 订阅状态实时更新
6) 取消订阅流程正常
```

#### S25: E2E 测试 & CI/CD 完善
```
ID: S25-e2e-cicd
Title: 端到端测试与持续集成
Priority: 15
Estimated: 2 days

Description:
建立可靠的质量保障体系。
1) E2E 测试扩展（Playwright）
   - 新用户注册 → Onboarding → 首次学习 完整流程
   - 每日学习流程：Today → Review → Practice → Chat
   - Roleplay 场景对话流程
   - 发音练习流程
   - 写作提交和批改流程
   - 移动端关键流程（底部导航 + 手势）
2) 集成测试补充
   - FSRS 调度完整流程测试
   - 离线 → 在线同步测试
   - AI 对话 Mock 测试
   - 推荐引擎测试
3) CI/CD Pipeline（GitHub Actions）
   - PR 触发：lint + typecheck + unit tests
   - Merge 触发：full test suite + build + deploy preview
   - Main 触发：production deploy
   - 测试覆盖率报告（Codecov）
4) 性能回归测试
   - Lighthouse CI 集成
   - Bundle size 监控
   - 首屏渲染时间基准

Implementation Notes:
- 扩展 tests/ 目录
- 新增 .github/workflows/ci.yml
- 新增 playwright.config.ts
- 新增 lighthouse CI 配置

Acceptance Criteria:
1) 6+ E2E 测试场景通过
2) 核心 service 覆盖率 > 85%
3) CI Pipeline 可正常运行
4) PR 自动运行测试
5) Lighthouse Score > 85 (CI 检查)
6) npm test && npm run build 通过
```

---

## 四、技术架构升级

### 4.1 新增模块

```
src/features/
├── pronunciation/       # S11: 发音评估
│   ├── components/
│   ├── hooks/
│   └── services/
├── chat/                # S12: 扩展 Roleplay
│   ├── components/RoleplayMode.tsx
│   └── data/scenarios.ts
├── social/              # S14: 社交系统
│   ├── components/
│   ├── hooks/
│   └── services/
├── onboarding/          # S15: 智能 Onboarding
│   ├── components/
│   └── hooks/
├── writing/             # S16: 写作助手
│   ├── components/
│   └── services/
├── paths/               # S17: 学习路径
│   ├── components/
│   └── data/
├── grammar/             # S21: 语法训练
│   ├── components/
│   └── data/
├── calendar/            # S23: 学习日历
│   └── components/
└── mistakes/            # S22: 错题本
    ├── components/
    └── services/
```

### 4.2 新增数据库表

```sql
-- S11: 发音评估
CREATE TABLE pronunciation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  word TEXT NOT NULL,
  accuracy_score INTEGER,
  fluency_score INTEGER,
  intonation_score INTEGER,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- S14: 联赛系统
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL, -- bronze/silver/gold/diamond/champion
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id),
  user_id UUID REFERENCES auth.users(id),
  weekly_xp INTEGER DEFAULT 0,
  rank INTEGER,
  UNIQUE(league_id, user_id)
);

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES auth.users(id),
  user_b UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending/accepted/blocked
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_a, user_b)
);

-- S17: 学习路径
CREATE TABLE learning_paths (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT, -- beginner/intermediate/advanced
  estimated_days INTEGER,
  stages JSONB NOT NULL -- [{id, title, units: [{id, title, lessons: [...]}]}]
);

CREATE TABLE path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  path_id TEXT REFERENCES learning_paths(id),
  current_stage INTEGER DEFAULT 0,
  current_unit INTEGER DEFAULT 0,
  current_lesson INTEGER DEFAULT 0,
  completed_lessons JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, path_id)
);

-- S22: 统一错题
CREATE TABLE mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- vocabulary/grammar/pronunciation/writing/reading/listening
  content JSONB NOT NULL, -- 错题内容（题目+错误答案+正确答案）
  source TEXT, -- 来源模块
  consecutive_correct INTEGER DEFAULT 0,
  eliminated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 新增 Edge Functions

```
supabase/functions/
├── ai-pronunciation-score/   # S11: 发音评分
├── ai-generate-roleplay/     # S12: 场景 prompt 生成
├── league-assign/             # S14: 联赛分组
├── league-settle/             # S14: 联赛结算
├── ai-placement-test/         # S15: 水平测试评估
├── ai-writing-assist/         # S16: 实时写作辅助
├── ai-generate-path-lesson/   # S17: 课程内容生成
├── ai-recommend-content/      # S18: 内容推荐
└── push-notification/         # S23: 推送通知
```

---

## 五、非功能需求

### 5.1 性能指标
- Lighthouse Performance: > 85
- 首屏渲染 (FCP): < 1.5s
- 可交互时间 (TTI): < 3s
- AI 响应延迟: < 3s (评分/批改)
- 离线可用: 核心学习流程

### 5.2 可访问性
- WCAG 2.1 AA 标准
- 键盘完全可操作
- 屏幕阅读器支持
- 色彩对比度 >= 4.5:1

### 5.3 安全性
- 所有表开启 RLS
- API 请求速率限制
- 用户数据加密存储
- GDPR 合规（数据导出/删除）

### 5.4 兼容性
- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- iOS Safari 15+
- Android Chrome 90+
- PWA 安装支持

---

## 六、里程碑与排期

| 周 | Stories | 交付物 |
|---|---------|--------|
| Week 1 | S11 (发音) + S12 (Roleplay) | AI 口语训练 MVP |
| Week 2 | S13 (移动端) + S14 (社交) | 移动优先 + 社交激励 |
| Week 3 | S15 (Onboarding) + S16 (写作) + S17 (路径) | 完整学习体验 |
| Week 4 | S18 (推荐) + S19 (阅读) + S20 (听力) | 内容生态 |
| Week 5 | S21 (语法) + S22 (错题) + S23 (日历) + S24 (付费) + S25 (测试) | 质量 & 商业化 |

---

*PRD v2.0 | VocabDaily AI | 2026-04-06*

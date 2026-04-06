# AI Research Engineer 面试准备指南

> 适用岗位：OpenAI / Anthropic / DeepMind 等顶级 AI Lab 的 Research Engineer 角色
> 基于 2025-2026 年最新 JD 及面试经验整理

---

## 一、岗位核心要求汇总

### 1.1 OpenAI Research Engineer

- 扎实的软件工程能力，能设计、实现大规模分布式 ML 系统
- 精通 PyTorch，熟悉 Transformer 架构与训练流程
- 能快速将研究想法转化为可运行的原型
- 熟悉 LLM 后训练方法（SFT、RLHF、蒸馏、DPO 等）
- 具备在模糊环境中端到端解决问题的能力
- 岗位方向包括：Codex、Applied AI、Post-Training、Frontier Evals 等

### 1.2 Anthropic Research Engineer

- 工程与研究并重（"Engineers do research, researchers do engineering"）
- Python 工程能力扎实，能写出干净、文档完善的代码
- 熟悉语言模型训练、评估和推理的全流程
- 在信息不完整的情况下做出高质量技术决策
- 具备构建和维护生产级内部工具/研究基础设施的经验
- 细分方向：Interpretability、Agents、Discovery、Societal Impacts 等

### 1.3 通用技术栈要求

| 类别 | 技术 |
|------|------|
| 编程语言 | Python（必须）、C++/CUDA（加分） |
| 深度学习框架 | PyTorch（必须）、JAX（加分） |
| 基础设施 | Kubernetes、分布式训练、GPU 集群管理 |
| 模型架构 | Transformer、MoE、SSM（Mamba） |
| 训练技术 | 混合精度、梯度累积、数据并行/模型并行/流水线并行 |
| 后训练 | SFT、RLHF、DPO、KTO、Constitutional AI |
| 评估 | 基准测试设计、Red Teaming、自动评估 |

---

## 二、面试流程概览

### OpenAI（4-6 轮，1-2 天）

1. **Recruiter Screen**：背景了解 + 动机
2. **Technical Screen**：45-60 分钟编码（实际工程问题，非纯 LeetCode）
3. **System Design**：ML 系统设计（可能有两轮）
4. **ML Theory / Research Deep Dive**：深度学习基础 + 研究讨论
5. **Culture Fit / Team Match**

### Anthropic（3-4 周完成）

1. **Recruiter Screen**
2. **CodeSignal 编码评估**（问题领域会提前告知）
3. **ML & Systems 面试**：模型架构、训练动态、Scaling 行为
4. **Research Presentation**：展示过去研究项目（Problem → Approach → Result → Implication）
5. **AI Safety & Values Alignment**：对齐与安全的深度讨论
6. **Culture Fit**

---

## 三、面试题纲（按知识域划分）

### 模块 A：Transformer 与基础架构（8 题）
### 模块 B：LLM 训练与优化（8 题）
### 模块 C：后训练与对齐（RLHF / DPO）（8 题）
### 模块 D：推理优化与部署（6 题）
### 模块 E：系统设计与工程（6 题）
### 模块 F：前沿研究与论文讨论（6 题）
### 模块 G：AI Safety 与伦理（4 题）
### 模块 H：Coding 与算法（4 题）

---

## 四、50 道模拟面试题

### 模块 A：Transformer 与基础架构

**Q1.** 请详细解释 Scaled Dot-Product Attention 的计算过程。为什么要除以 √d_k？如果不做 Scaling 会发生什么？

**Q2.** Multi-Head Attention 相比 Single-Head Attention 的优势是什么？Head 数量如何选择？请从信息论的角度分析。

**Q3.** 请比较 Pre-Norm（GPT-2 风格）和 Post-Norm（原始 Transformer）的差异。为什么现代 LLM 普遍采用 Pre-Norm？对训练稳定性有什么影响？

**Q4.** Self-Attention 的计算复杂度是 O(n²d)。请列举至少 3 种降低注意力复杂度的方法（如 Flash Attention、Sparse Attention、Linear Attention），并分析各自的 trade-off。

**Q5.** RoPE（Rotary Position Embedding）的核心思想是什么？与绝对位置编码和 ALiBi 相比有什么优势？如何实现长度外推？

**Q6.** 请解释 KV Cache 的原理。在自回归生成中，KV Cache 如何节省计算？有哪些压缩 KV Cache 的技术（如 GQA、MQA、Sliding Window）？

**Q7.** Layer Normalization 和 Batch Normalization 的区别是什么？为什么 Transformer 使用 LayerNorm 而非 BatchNorm？RMSNorm 又有什么改进？

**Q8.** Mixture of Experts（MoE）架构的核心原理是什么？请讨论 Router 设计、负载均衡策略，以及 MoE 在训练和推理中的挑战。

---

### 模块 B：LLM 训练与优化

**Q9.** 请描述大语言模型预训练的完整流程：数据收集与清洗 → Tokenization → 训练配置 → 分布式训练。每个阶段有哪些关键决策？

**Q10.** BPE、WordPiece 和 SentencePiece 这三种 Tokenizer 有什么区别？Tokenizer 的词表大小如何影响模型性能和效率？

**Q11.** 请解释 Data Parallelism、Model Parallelism（Tensor Parallel）、Pipeline Parallelism 和 ZeRO 的区别。训练一个 70B 参数的模型，你会如何选择并行策略？

**Q12.** 混合精度训练（FP16/BF16）的原理是什么？为什么 BF16 在大模型训练中更受欢迎？Loss Scaling 的作用是什么？

**Q13.** 学习率调度（Learning Rate Schedule）对 LLM 训练有什么影响？请比较 Cosine Decay、WSD（Warmup-Stable-Decay）和 Cyclic LR 的特点。

**Q14.** Gradient Checkpointing（梯度检查点）的原理是什么？它如何在显存和计算之间做 trade-off？适用于什么场景？

**Q15.** Scaling Laws（Chinchilla Scaling Law）的核心发现是什么？模型参数量、数据量和计算量之间的最优比例关系是怎样的？这对实际训练决策有什么指导意义？

**Q16.** 训练过程中遇到 Loss Spike 怎么办？请列举可能的原因和对应的排查/解决方案。

---

### 模块 C：后训练与对齐（RLHF / DPO）

**Q17.** 请描述 RLHF 的完整流水线：SFT → Reward Model 训练 → PPO 优化。每个阶段的关键技术点是什么？

**Q18.** Reward Model 的训练数据是如何构造的？Bradley-Terry 模型是什么？Reward Hacking（奖励黑客）问题如何产生，如何缓解？

**Q19.** PPO 在 RLHF 中的具体应用是什么？请解释 Clipping 机制、KL 散度惩罚的作用，以及 PPO 的训练不稳定性问题。

**Q20.** DPO（Direct Preference Optimization）的核心思想是什么？相比 RLHF（PPO），DPO 有哪些优势和局限？请推导 DPO 的损失函数。

**Q21.** 请比较 DPO、KTO（Kahneman-Tversky Optimization）、IPO、ORPO 等后训练方法。它们各自适用于什么场景？

**Q22.** Constitutional AI 的原理是什么？如何通过 AI 自身来实现对齐？这与 RLHF 有什么本质区别？

**Q23.** 什么是 RLAIF（Reinforcement Learning from AI Feedback）？与 RLHF 相比有什么优势和风险？

**Q24.** 如何评估一个对齐后的模型的质量？请讨论 Helpfulness、Harmlessness、Honesty（HHH）的量化方法和评估基准。

---

### 模块 D：推理优化与部署

**Q25.** 请比较 Greedy Decoding、Top-k、Top-p（Nucleus Sampling）和 Temperature Scaling 的区别。在不同应用场景下如何选择？

**Q26.** 模型量化（Quantization）有哪些方法？请比较 PTQ（Post-Training Quantization）和 QAT（Quantization-Aware Training），以及 GPTQ、AWQ、SmoothQuant 等技术。

**Q27.** Speculative Decoding（投机解码）的原理是什么？如何用小模型加速大模型的推理？

**Q28.** 请解释 Continuous Batching（连续批处理）在 LLM 推理服务中的作用。与 Static Batching 相比有什么优势？vLLM 的 PagedAttention 解决了什么问题？

**Q29.** LoRA 和 QLoRA 的原理是什么？为什么低秩分解能有效进行参数高效微调？Rank 的选择对性能有什么影响？

**Q30.** 如何设计一个高吞吐、低延迟的 LLM 推理服务？请讨论负载均衡、请求调度、显存管理等关键问题。

---

### 模块 E：系统设计与工程

**Q31.** 请设计一个 RAG（Retrieval-Augmented Generation）系统。从文档处理、Embedding、向量检索到生成的完整链路如何设计？如何评估检索质量？

**Q32.** 请设计一个 LLM 评估平台。需要支持多模型对比、多维度评估（Safety、Helpfulness、Truthfulness）、人工标注和自动评估。

**Q33.** 请设计一个分布式训练平台，支持从数十到数千张 GPU 的弹性扩展。需要考虑容错、检查点、资源调度等问题。

**Q34.** 如何设计 LLM 的 Agent 系统？请讨论 Tool Use、Planning、Memory 和 Multi-Agent 协作的架构设计。

**Q35.** 请设计一个 RLHF 数据标注平台。需要支持 Pairwise Comparison、多标注者一致性检查、标注质量控制。

**Q36.** 如何构建 LLM 的安全防护系统（Guardrails）？包括输入过滤、输出检测、Jailbreak 防御等。

---

### 模块 F：前沿研究与论文讨论

**Q37.** 请介绍 Chain-of-Thought（CoT）Prompting 的原理。为什么 CoT 能提升推理能力？有哪些变体（如 Tree-of-Thought、Graph-of-Thought）？

**Q38.** 请讨论 In-Context Learning（ICL）的机制。为什么 LLM 能通过 few-shot 示例学习新任务？有哪些理论解释？

**Q39.** 请介绍最新的 Scaling 相关研究。除了 Chinchilla，还有哪些关于 Test-Time Compute Scaling、Inference Scaling 的工作？

**Q40.** Mechanistic Interpretability（机制可解释性）的目标是什么？请介绍 Superposition、Sparse Autoencoders、Circuit Analysis 等方法。

**Q41.** 请讨论多模态大模型（如 GPT-4V、Claude 3.5 Vision）的架构设计。视觉 Encoder 如何与语言模型融合？

**Q42.** 请介绍 State Space Models（如 Mamba）与 Transformer 的对比。SSM 在哪些场景可能替代 Transformer？长序列建模的最新进展是什么？

---

### 模块 G：AI Safety 与伦理

**Q43.** 什么是 AI Alignment Problem？请从技术角度讨论当前主要的对齐方法和挑战。

**Q44.** LLM 的 Hallucination（幻觉）问题产生的原因是什么？有哪些技术手段可以缓解？如何量化 Hallucination 的程度？

**Q45.** 请讨论 LLM 的 Red Teaming 方法论。如何系统性地发现模型的安全漏洞？Automated Red Teaming 有哪些进展？

**Q46.** 请阐述你对 AI Safety 的理解。如果你在 Anthropic/OpenAI 工作，你会如何平衡模型能力与安全性？

---

### 模块 H：Coding 与算法实战

**Q47.** 请实现一个简化版的 Multi-Head Self-Attention 模块（包括 QKV 投影、Scaled Dot-Product、Mask 处理和输出投影）。

**Q48.** 请实现一个 BPE Tokenizer 的训练过程。给定一个语料库，如何通过贪心合并构建词表？

**Q49.** 请实现一个高效的 Top-k / Top-p Sampling 算法。考虑数值稳定性和 Temperature 参数。

**Q50.** 请设计并实现一个简化版的 LoRA 模块。如何将低秩矩阵注入到 Transformer 的 Attention 层中？

---

## 五、面试准备建议

### 5.1 论文阅读清单（必读）

| 论文 | 核心内容 |
|------|---------|
| Attention Is All You Need | Transformer 原始论文 |
| GPT-3 / InstructGPT | Few-shot Learning + RLHF 开创性工作 |
| Chinchilla (Training Compute-Optimal LLMs) | Scaling Laws |
| Constitutional AI (Anthropic) | RLAIF 方法 |
| DPO (Direct Preference Optimization) | 无需 RM 的偏好优化 |
| Flash Attention / Flash Attention 2 | 高效注意力计算 |
| LoRA | 参数高效微调 |
| Mamba / S4 | State Space Models |
| Chain-of-Thought Prompting | 推理能力提升 |
| Scaling Monosemanticity (Anthropic) | Mechanistic Interpretability |

### 5.2 实践建议

1. **手写 Transformer**：从零实现一个 GPT-style 模型，包括训练和生成
2. **微调实践**：用 LoRA/QLoRA 在开源模型上做 SFT 和 DPO
3. **阅读开源代码**：研究 vLLM、DeepSpeed、Megatron-LM 等项目
4. **Mock Interview**：找同行或在线平台做模拟面试，练习口头表达
5. **Research Presentation**：准备 15-20 分钟的研究展示（Problem → Approach → Result → What's Next）

### 5.3 Anthropic 特别准备

- 深入理解 Constitutional AI 和 RLAIF
- 阅读 Anthropic 的 Interpretability 研究（Superposition、Sparse Autoencoders）
- 准备讨论 AI Safety 相关话题，展示对长期风险的思考
- 价值观对齐：思考如何平衡 Helpful 和 Harmless

### 5.4 OpenAI 特别准备

- 了解 GPT 系列演进和最新产品（ChatGPT、Codex、DALL-E 等）
- 关注 OpenAI 的 Research Blog 最新发布
- 准备实际工程问题的编码能力（非纯 LeetCode，偏实际场景）
- System Design 可能有两轮，重点练习 ML 系统设计

---

## 六、参考资源

- [OpenAI Research Engineer JD](https://openai.com/careers/research-engineer-san-francisco/)
- [Anthropic Careers](https://www.anthropic.com/careers)
- [OpenAI Interview Guide](https://openai.com/interview-guide/)
- [Anthropic Interview Process & Questions](https://interviewing.io/anthropic-interview-questions)
- [DataCamp LLM Interview Questions](https://www.datacamp.com/blog/llm-interview-questions)
- [AI Research Engineer Interview Guide (OpenAI, Anthropic, DeepMind)](https://www.sundeepteki.org/advice/the-ultimate-ai-research-engineer-interview-guide-cracking-openai-anthropic-google-deepmind-top-ai-labs)
- [LLM Interview Questions GitHub](https://github.com/Devinterview-io/llms-interview-questions)

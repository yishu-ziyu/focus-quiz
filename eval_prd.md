# Focus Quiz 产品分析与重构规划 (PRD)

| 属性         | 内容                            |
| ------------ | ------------------------------- |
| **项目名称** | Focus Quiz (深度压力测试插件)   |
| **当前状态** | **发布前优化版 / 待真人体验验证** |
| **文档目标** | 诊断现状，规划下一阶段演进方向  |

---

## 1. 现状解剖 (Current State Analysis)

经过对 `background.js` 和 `sidepanel.js` 的源码分析，Focus Quiz 目前的架构非常轻量且硬核：

- **交互链路**：用户在网页划词 -> 右键点击 "Focus Quiz: 审问选中文本" -> 数据存入 local storage -> 侧边栏监听到变化并提取文本。
- **引擎核心 (The Brain)**：采用 BYOK 模式，由用户在 Options Page 中选择 Provider 并保存自己的 API Key；当前支持 Provider 预设注册表、自定义 OpenAI-Compatible、自定义 Anthropic-Compatible 和 Ollama。
- **Prompt 工程 (The Magic)**：设定了极其严苛的系统提示词（Role: **The Inquisitor 学术导师**），明确要求大模型不准做总结复述，而是直接**粉碎认知**。
- **输出范式**：强制大模型返回严格的 JSON，包含三种高级题型：
  1.  `trap` [概念陷阱题]
  2.  `counterfactual` [反事实推演]
  3.  `transfer` [场景迁移]

---

## 2. 问题定义诊断 (Problem Definition Diagnosis)

> 参考 Skill: `problem-definition` ("Digitizing analog isn't enough", "Struggling moments cause demand")

### 目前的“伪装”问题

目前的问答生成插件（包括各种 AI 总结插件）大多只是把“考卷”数字化了，或者只是换个方式把原文读一遍（提取表面事实）。用户用着用着就会陷入应对考试的疲劳，或者发现做对了也没什么启发。

### 真正的“挣扎时刻” (The Real Struggling Moment)

用户在学习复杂理论（如经济学、投资逻辑、哲学模型）时，**最大的痛苦不是“记不住事实”，而是“不知道自己其实没弄懂”。**
他们觉得自己看懂了字面意思，但一遇到实际案例（场景迁移）或者前提条件发生微调（反事实），脑子就转不过弯来。这是一种**知识的脆弱性**。

---

## 3. 重新定位 (Repositioning)

> 参考 Skill: `positioning-messaging` ("Positioning dictates everything")

- **不再是**：“又一个 AI 测验生成工具”。
- **定位为**：**“The Inquisitor” (知识炼金炉 / 认知压力校验器)**。
- **核心差异 (Differentiated Value)**：
  其他工具问：“刚才这段话提到了哪三个因素？”（基于记忆）；
  Focus Quiz 问：“如果文中提到的前提 A 变成了非 A，原有的结论为什么会崩塌？”（基于逻辑重构）。

---

## 4. 产品演进规划 (Roadmap & Action Items)

### P0 缺陷修复 (Critical Fixes)

1.  **安全风险控制**：早期原型中的硬编码密钥风险已移除，当前采用 BYOK 模式。
    - _后续_：公开分享时需要继续强调：API Key 存在浏览器本地；选中文本会发送给用户选择的模型服务商。
2.  **Provider 更新机制**：已从固定 8 家 Provider 改成统一注册表；模型过期时可以手动输入模型 ID，不必等待代码更新。
    - _后续_：如果使用频率提高，可以接入 models.dev 的模型目录作为定期刷新来源。

### P1 核心体验提升 (UX Enhancements)

1.  **上下文衔接沉淀**：错题本已落地，但还需要真人体验验证它是否真的会驱动复盘，而不是只成为一个功能摆设。
2.  **等待焦虑缓解**：当前使用审问语录轮播降低等待空白感；后续可以继续测试是否要加入“正在分析概念边界 / 因果链 / 迁移场景”等更具体状态。
3.  **个性化认知阻力**：已开始记录完整答题事件，并根据概念边界、因果推演、迁移应用三个维度计算本地认知画像。
    - _后续_：需要通过真人体验验证画像和本轮诊断是否准确，避免把少量题目的信号包装成过度确定的能力评估。

### P2 产品形态拓展 (Evolution)

1.  **流式吐题 (Streaming Mode)**：
    不等待整个 JSON 生成完毕，大模型生成第一道题的瞬间即可解析渲染在屏幕上，用户边做题大模型边生成后续题目。
2.  **“不服辩论”模式 (Challenge Mode)**：
    用户在被判定为“选错”时，如果对 `explanation` 不服气，可以点击“我不服 (Debate)”，此时 Side Panel 切入对话形态，用户直接与 The Inquisitor 进行一轮逻辑辩论。

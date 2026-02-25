# Focus Quiz 产品分析与重构规划 (PRD)

| 属性         | 内容                            |
| ------------ | ------------------------------- |
| **项目名称** | Focus Quiz (深度压力测试插件)   |
| **当前状态** | **概念验证原型 (PoC) / 待优化** |
| **文档目标** | 诊断现状，规划下一阶段演进方向  |

---

## 1. 现状解剖 (Current State Analysis)

经过对 `background.js` 和 `sidepanel.js` 的源码分析，Focus Quiz 目前的架构非常轻量且硬核：

- **交互链路**：用户在网页划词 -> 右键点击 "Generate Quiz" -> 数据存入 local storage -> 侧边栏监听到变化并提取文本。
- **引擎核心 (The Brain)**：直接在前端发起了对 Google 官方接口 `gemini-3-flash-preview:generateContent` 的请求（目前硬编码了一个 API Key）。
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

1.  **安全风险控制**：当前 `API_KEY` 明文硬编码在前端 Javascript 中。一旦发布，将面临严重的秘钥泄露和盗刷风险。
    - _方案_：必须改为让用户在插件选项 (Options Page) 中填入自己的 API Key（BYOK 模式），或者架设一个极简的后端转发代理。

### P1 核心体验提升 (UX Enhancements)

1.  **上下文衔接流失**：目前用户只能每次选中一段去生成，这些题目做完就丢了，无法沉淀。
    - _方案_：建立“历史错题本”机制储备。将题目的 JSON 及用户的错误选项保存在 `chrome.storage.local` 中，供日后集中回顾“思维断裂点”。
2.  **等待焦虑缓解**：目前调用 Gemini 生成 JSON 需要几秒钟，期间只有干巴巴的 loading。
    - _方案_：在等待期间，提取选中文本的几个高频关键实体词进行滚动展示，让用户潜意识预热话题。

### P2 产品形态拓展 (Evolution)

1.  **流式吐题 (Streaming Mode)**：
    不等待整个 JSON 生成完毕，大模型生成第一道题的瞬间即可解析渲染在屏幕上，用户边做题大模型边生成后续题目。
2.  **“不服辩论”模式 (Challenge Mode)**：
    用户在被判定为“选错”时，如果对 `explanation` 不服气，可以点击“我不服 (Debate)”，此时 Side Panel 切入对话形态，用户直接与 The Inquisitor 进行一轮逻辑辩论。

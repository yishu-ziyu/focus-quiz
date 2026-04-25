# Focus Quiz 发布前体检清单

目标：下周三晚分享前，让项目达到“别人能安装、能理解、能试用、仓库可信”的状态。

## 已发现并处理

- [x] `manifest.json` 缺少云端模型 API 域名权限，可能导致 OpenAI / Gemini / Claude / 国内兼容接口无法从扩展页正常请求。
- [x] 图标文件虽然叫 `.png`，实际是 JPEG 且尺寸全是 1024x1024，已转换为真实 `16/48/128` PNG。
- [x] `src/` 目录是未被当前 manifest 引用的旧版实现，已移除，避免公开仓库结构混乱。
- [x] 侧边栏部分错误提示和模型解释使用 `innerHTML`，已改为 DOM 安全渲染。
- [x] 答题后按钮没有真正禁用，可能重复触发，已补上禁用状态。
- [x] OpenAI-Compatible Provider 若不支持 `response_format`，现在会自动降级重试。
- [x] README 存在错字和动机缺口，已补充认知负荷、检索练习、反事实和迁移应用的产品动机。
- [x] Provider 从固定 8 家扩展为预设注册表，新增 OpenRouter、302.AI、SiliconFlow、Moonshot/Kimi、火山方舟、Groq、Together、Fireworks、MiniMax Token Plan / Coding Plan 和自定义兼容接口。
- [x] MiniMax 从旧 `MiniMax-M1-80k` 更新到 `MiniMax-M2.7` / `MiniMax-M2.7-highspeed` 等 M2 系列模型，并改走 Anthropic-Compatible 接入。

## 待真人体验验证

- [ ] 第一次安装后，设置页是否足够清楚。
- [ ] 未配置 API Key 时，侧边栏错误提示是否能让用户顺利去设置。
- [ ] 选中文本过短、过长、或者结构混乱时，题目质量是否稳定。
- [ ] 三类题目是否真的有“审问感”，还是仍然像普通阅读理解。
- [ ] 错题本的记录、回看、分享文本是否有继续使用的动力。
- [ ] 本地 Ollama 的 403 / 模型不存在 / 超时提示是否足够可操作。
- [ ] 自定义 OpenAI-Compatible / Anthropic-Compatible 服务的 Base URL 填写说明是否足够清楚。
- [ ] 宽 HTTPS host permission 是否需要在分享时主动解释。

## 分享前建议演示流程

1. 打开一篇文章，选中一段 200-600 字的核心段落。
2. 右键选择 **Focus Quiz: 审问选中文本**。
3. 展示三类题：概念陷阱、反事实推演、场景迁移。
4. 故意选错一道题，展示“思维断裂点”和错题本。
5. 打开设置页，说明 BYOK、多 Provider、本地 Ollama。

## 体验反馈记录格式

你上楼体验后，可以直接按这个格式告诉我：

- 场景：我在哪里点了什么。
- 预期：我以为它应该怎样。
- 实际：它让我不爽的地方是什么。
- 严重度：阻塞 / 明显不爽 / 小修小补。

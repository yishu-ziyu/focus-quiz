// Provider registry snapshot for Focus Quiz.
// Seeded from models.dev and official provider docs; keep this file small enough
// for extension review, and always allow a custom model id as an escape hatch.

const FOCUS_QUIZ_PROVIDER_PRESETS = {
  gemini: {
    name: 'Google Gemini',
    region: 'global',
    apiType: 'gemini',
    doc: 'https://ai.google.dev/gemini-api/docs',
    apiKeyPlaceholder: 'AIzaSy...',
    defaultModel: 'gemini-2.5-flash-preview',
    models: [
      'gemini-2.5-flash-preview',
      'gemini-2.5-pro-preview',
      'gemini-2.5-flash-lite-preview-09-2025',
      'gemini-3-flash-preview',
      'gemini-3.1-pro-preview'
    ]
  },
  openai: {
    name: 'OpenAI',
    region: 'global',
    apiType: 'openai-compatible',
    baseURL: 'https://api.openai.com/v1',
    doc: 'https://platform.openai.com/docs/models',
    apiKeyPlaceholder: 'sk-...',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'gpt-5-mini', 'gpt-5.1']
  },
  anthropic: {
    name: 'Anthropic Claude',
    region: 'global',
    apiType: 'anthropic-compatible',
    baseURL: 'https://api.anthropic.com/v1',
    doc: 'https://docs.anthropic.com/en/docs/about-claude/models',
    apiKeyPlaceholder: 'sk-ant-...',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      'claude-sonnet-4-20250514',
      'claude-haiku-4-20250514',
      'claude-haiku-4-5',
      'claude-opus-4-5-20251101'
    ]
  },
  openrouter: {
    name: 'OpenRouter',
    region: 'gateway',
    apiType: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    doc: 'https://openrouter.ai/models',
    apiKeyPlaceholder: 'sk-or-...',
    defaultModel: 'openrouter/auto',
    models: [
      'openrouter/auto',
      'anthropic/claude-sonnet-4.5',
      'openai/gpt-5-mini',
      'google/gemini-2.5-pro',
      'deepseek/deepseek-r1',
      'minimax/minimax-m2.7'
    ]
  },
  '302ai': {
    name: '302.AI',
    region: 'gateway',
    apiType: 'openai-compatible',
    baseURL: 'https://api.302.ai/v1',
    doc: 'https://doc.302.ai',
    apiKeyPlaceholder: '302AI API Key',
    defaultModel: 'MiniMax-M2',
    models: ['MiniMax-M2', 'MiniMax-M2.7', 'grok-4.1', 'kimi-k2.5', 'claude-haiku-4-5', 'qwen3-235b-a22b']
  },
  siliconflow: {
    name: 'SiliconFlow',
    region: 'gateway',
    apiType: 'openai-compatible',
    baseURL: 'https://api.siliconflow.com/v1',
    doc: 'https://cloud.siliconflow.com/models',
    apiKeyPlaceholder: 'sk-...',
    defaultModel: 'Qwen/Qwen3-235B-A22B',
    models: [
      'Qwen/Qwen3-235B-A22B',
      'Qwen/Qwen3-30B-A3B-Thinking-2507',
      'Qwen/QwQ-32B',
      'Qwen/Qwen2.5-Coder-32B-Instruct',
      'deepseek-ai/DeepSeek-R1'
    ]
  },
  deepseek: {
    name: 'DeepSeek',
    region: 'cn',
    apiType: 'openai-compatible',
    baseURL: 'https://api.deepseek.com',
    doc: 'https://api-docs.deepseek.com',
    apiKeyPlaceholder: 'sk-...',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-v4-flash', 'deepseek-v4-pro']
  },
  qwen: {
    name: '阿里百炼 / 通义千问',
    region: 'cn',
    apiType: 'openai-compatible',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    doc: 'https://bailian.console.aliyun.com/',
    apiKeyPlaceholder: 'sk-...',
    defaultModel: 'qwen-plus',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen3-plus', 'qwen3-max', 'qwen3-coder-plus']
  },
  moonshot: {
    name: 'Moonshot / Kimi',
    region: 'cn',
    apiType: 'openai-compatible',
    baseURL: 'https://api.moonshot.ai/v1',
    doc: 'https://platform.moonshot.ai/docs/api/chat',
    apiKeyPlaceholder: 'sk-...',
    defaultModel: 'kimi-k2.5',
    models: ['kimi-k2.5', 'kimi-k2-thinking-turbo', 'kimi-k2.6', 'kimi-k2-turbo-preview', 'moonshot-v1-8k']
  },
  zhipu: {
    name: '智谱 GLM',
    region: 'cn',
    apiType: 'openai-compatible',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    doc: 'https://open.bigmodel.cn/dev/api',
    apiKeyPlaceholder: 'API Key...',
    defaultModel: 'glm-4-flash',
    models: ['glm-4-flash', 'glm-4-plus', 'glm-4-long', 'glm-4.5', 'glm-5']
  },
  volcengine: {
    name: '火山方舟 / 豆包',
    region: 'cn',
    apiType: 'openai-compatible',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    doc: 'https://www.volcengine.com/product/ark',
    apiKeyPlaceholder: 'API Key...',
    defaultModel: 'doubao-seed-1-6',
    models: ['doubao-seed-1-6', 'doubao-seed-1-6-thinking', 'doubao-1-5-pro-32k']
  },
  minimax: {
    name: 'MiniMax Token Plan (Global)',
    region: 'global',
    apiType: 'anthropic-compatible',
    baseURL: 'https://api.minimax.io/anthropic/v1',
    doc: 'https://platform.minimax.io/docs/guides/quickstart',
    apiKeyPlaceholder: 'MINIMAX_API_KEY',
    defaultModel: 'MiniMax-M2.7',
    models: ['MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.5-highspeed', 'MiniMax-M2.1', 'MiniMax-M2']
  },
  'minimax-cn': {
    name: 'MiniMax Token Plan (CN)',
    region: 'cn',
    apiType: 'anthropic-compatible',
    baseURL: 'https://api.minimaxi.com/anthropic/v1',
    doc: 'https://platform.minimaxi.com/docs/guides/quickstart',
    apiKeyPlaceholder: 'MINIMAX_API_KEY',
    defaultModel: 'MiniMax-M2.7',
    models: ['MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.5-highspeed', 'MiniMax-M2.1', 'MiniMax-M2']
  },
  'minimax-coding-plan': {
    name: 'MiniMax Coding Plan (Global)',
    region: 'coding',
    apiType: 'anthropic-compatible',
    baseURL: 'https://api.minimax.io/anthropic/v1',
    doc: 'https://platform.minimax.io/docs/coding-plan/intro',
    apiKeyPlaceholder: 'MINIMAX_API_KEY',
    defaultModel: 'MiniMax-M2.7',
    models: ['MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.5-highspeed', 'MiniMax-M2.1', 'MiniMax-M2']
  },
  'minimax-cn-coding-plan': {
    name: 'MiniMax Coding Plan (CN)',
    region: 'coding',
    apiType: 'anthropic-compatible',
    baseURL: 'https://api.minimaxi.com/anthropic/v1',
    doc: 'https://platform.minimaxi.com/docs/coding-plan/intro',
    apiKeyPlaceholder: 'MINIMAX_API_KEY',
    defaultModel: 'MiniMax-M2.7',
    models: ['MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.5-highspeed', 'MiniMax-M2.1', 'MiniMax-M2']
  },
  groq: {
    name: 'Groq',
    region: 'gateway',
    apiType: 'openai-compatible',
    baseURL: 'https://api.groq.com/openai/v1',
    doc: 'https://console.groq.com/docs/models',
    apiKeyPlaceholder: 'gsk_...',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b', 'gemma2-9b-it', 'mistral-saba-24b']
  },
  mistral: {
    name: 'Mistral',
    region: 'global',
    apiType: 'openai-compatible',
    baseURL: 'https://api.mistral.ai/v1',
    doc: 'https://docs.mistral.ai',
    apiKeyPlaceholder: 'API Key...',
    defaultModel: 'mistral-large-latest',
    models: ['mistral-large-latest', 'mistral-small-latest', 'mistral-nemo', 'codestral-latest']
  },
  togetherai: {
    name: 'Together AI',
    region: 'gateway',
    apiType: 'openai-compatible',
    baseURL: 'https://api.together.xyz/v1',
    doc: 'https://docs.together.ai/docs/serverless-models',
    apiKeyPlaceholder: 'API Key...',
    defaultModel: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
    models: ['Qwen/Qwen3-235B-A22B-Instruct-2507', 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8', 'meta-llama/Llama-3.3-70B-Instruct-Turbo']
  },
  fireworks: {
    name: 'Fireworks AI',
    region: 'gateway',
    apiType: 'openai-compatible',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    doc: 'https://docs.fireworks.ai',
    apiKeyPlaceholder: 'fw_...',
    defaultModel: 'accounts/fireworks/models/deepseek-r1',
    models: ['accounts/fireworks/models/deepseek-r1', 'accounts/fireworks/models/qwen3-235b-a22b', 'accounts/fireworks/models/llama-v3p3-70b-instruct']
  },
  ollama: {
    name: 'Ollama 本地',
    region: 'local',
    apiType: 'ollama',
    doc: 'https://ollama.com',
    defaultModel: 'qwen3:8b',
    models: ['qwen3:8b', 'llama3.1', 'mistral', 'gemma3:4b']
  },
  'custom-openai': {
    name: '自定义 OpenAI-Compatible',
    region: 'custom',
    apiType: 'openai-compatible',
    baseURL: '',
    doc: 'https://platform.openai.com/docs/api-reference/chat',
    apiKeyPlaceholder: 'API Key...',
    defaultModel: '',
    models: []
  },
  'custom-anthropic': {
    name: '自定义 Anthropic-Compatible',
    region: 'custom',
    apiType: 'anthropic-compatible',
    baseURL: '',
    doc: 'https://docs.anthropic.com/en/api/messages',
    apiKeyPlaceholder: 'API Key...',
    defaultModel: '',
    models: []
  }
};

const FOCUS_QUIZ_REGION_LABELS = {
  global: '海外 / 原生厂商',
  cn: '国内直连',
  gateway: '聚合网关 / 高速推理',
  coding: 'Token Plan / Coding Plan',
  local: '本地',
  custom: '自定义'
};

globalThis.FOCUS_QUIZ_PROVIDER_PRESETS = FOCUS_QUIZ_PROVIDER_PRESETS;
globalThis.FOCUS_QUIZ_REGION_LABELS = FOCUS_QUIZ_REGION_LABELS;

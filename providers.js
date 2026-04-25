/**
 * providers.js - 统一的大模型 Provider 抽象层
 * 支持: Gemini, OpenAI, Anthropic, Ollama (本地)
 * 支持: DeepSeek, 智谱AI, MiniMax, 通义千问 (国内, 均兼容 OpenAI 格式)
 */

// ========================
// Provider 配置模板
// ========================
const PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-2.5-flash-preview', 'gemini-2.5-pro-preview'],
    defaultModel: 'gemini-2.5-flash-preview',
    needsApiKey: true,
    region: 'global'
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1-nano'],
    defaultModel: 'gpt-4o-mini',
    needsApiKey: true,
    region: 'global'
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    models: ['claude-sonnet-4-20250514', 'claude-haiku-4-20250514'],
    defaultModel: 'claude-sonnet-4-20250514',
    needsApiKey: true,
    region: 'global'
  },
  deepseek: {
    name: 'DeepSeek (深度求索)',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    needsApiKey: true,
    baseURL: 'https://api.deepseek.com',
    region: 'cn'
  },
  zhipu: {
    name: '智谱AI (GLM)',
    models: ['glm-4-flash', 'glm-4-plus', 'glm-4-long'],
    defaultModel: 'glm-4-flash',
    needsApiKey: true,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    region: 'cn'
  },
  minimax: {
    name: 'MiniMax (稀宇)',
    models: ['MiniMax-M1-80k'],
    defaultModel: 'MiniMax-M1-80k',
    needsApiKey: true,
    baseURL: 'https://api.minimaxi.com/v1',
    region: 'cn'
  },
  qwen: {
    name: '通义千问 (Qwen)',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    defaultModel: 'qwen-plus',
    needsApiKey: true,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    region: 'cn'
  },
  ollama: {
    name: 'Ollama (本地)',
    models: [],
    defaultModel: 'qwen3:8b',
    needsApiKey: false,
    region: 'local'
  }
};

const OLLAMA_DEFAULT_ENDPOINT = 'http://localhost:11434';
const OLLAMA_TIMEOUT_MS = 120000;

function normalizeOllamaEndpoint(rawEndpoint) {
  const input = (rawEndpoint || OLLAMA_DEFAULT_ENDPOINT).trim();
  let url;

  try {
    url = new URL(input);
  } catch (_err) {
    throw new Error(`Ollama 地址格式错误: ${input}。请使用 http://localhost:11434`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Ollama 地址必须是 http/https: ${input}`);
  }

  // 0.0.0.0 是监听地址，客户端访问应使用 localhost
  if (url.hostname === '0.0.0.0' || url.hostname === '::' || url.hostname === '[::]') {
    url.hostname = 'localhost';
  }

  const badPathSuffixes = [
    '/api/chat',
    '/api/generate',
    '/v1/chat/completions',
    '/chat/completions',
    '/api',
    '/v1'
  ];

  const normalizedPath = url.pathname.toLowerCase().replace(/\/+$/, '');
  const matchedSuffix = badPathSuffixes.find((suffix) => normalizedPath.endsWith(suffix));

  if (matchedSuffix) {
    const trimmedPath = url.pathname.slice(0, url.pathname.length - matchedSuffix.length) || '/';
    url.pathname = trimmedPath;
  }

  url.search = '';
  url.hash = '';

  return `${url.origin}${url.pathname === '/' ? '' : url.pathname}`.replace(/\/+$/, '');
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readErrorMessage(response) {
  const fallback = `HTTP ${response.status}`;
  try {
    const data = await response.clone().json();
    if (typeof data?.error === 'string') return data.error;
    if (typeof data?.error?.message === 'string') return data.error.message;
    if (typeof data?.message === 'string') return data.message;
    return JSON.stringify(data);
  } catch (_jsonError) {
    try {
      const text = (await response.text()).trim();
      return text || fallback;
    } catch (_textError) {
      return fallback;
    }
  }
}

async function fetchOllamaModels(endpoint) {
  try {
    const response = await fetchWithTimeout(`${endpoint}/api/tags`, { method: 'GET' }, 10000);
    if (!response.ok) return [];
    const data = await response.json().catch(() => ({}));
    const models = Array.isArray(data?.models) ? data.models : [];
    return models.map((m) => m?.name).filter(Boolean);
  } catch (_err) {
    return [];
  }
}

function toJsonString(content, providerName) {
  if (content === null || content === undefined) {
    throw new Error(`${providerName} 返回为空，请重试。`);
  }

  if (typeof content === 'object') {
    return JSON.stringify(content);
  }

  const text = String(content).trim();
  if (!text) {
    throw new Error(`${providerName} 返回为空字符串，请重试。`);
  }

  const candidates = [text];

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    candidates.push(fenced[1].trim());
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(text.slice(firstBrace, lastBrace + 1).trim());
  }

  for (const candidate of candidates) {
    try {
      return JSON.stringify(JSON.parse(candidate));
    } catch (_err) {
      // try next candidate
    }
  }

  throw new Error(
    `${providerName} 返回的内容不是有效 JSON。建议更换模型或缩短输入文本。片段: ${text.slice(0, 180)}`
  );
}

// ========================
// 统一入口
// ========================
async function callLLM(prompt) {
  const storage = await chrome.storage.local.get(['activeProvider', 'providerConfigs']);
  const provider = storage.activeProvider || 'gemini';
  const configs = storage.providerConfigs || {};
  const config = configs[provider] || {};

  let content;

  switch (provider) {
    case 'gemini':
      content = await callGemini(prompt, config);
      break;
    case 'openai':
      content = await callOpenAICompat(prompt, config, 'https://api.openai.com/v1', PROVIDERS.openai.defaultModel);
      break;
    case 'anthropic':
      content = await callAnthropic(prompt, config);
      break;

    // 国内厂商：全部走 OpenAI 兼容格式
    case 'deepseek':
      content = await callOpenAICompat(prompt, config, PROVIDERS.deepseek.baseURL, PROVIDERS.deepseek.defaultModel);
      break;
    case 'zhipu':
      content = await callOpenAICompat(prompt, config, PROVIDERS.zhipu.baseURL, PROVIDERS.zhipu.defaultModel);
      break;
    case 'minimax':
      content = await callOpenAICompat(prompt, config, PROVIDERS.minimax.baseURL, PROVIDERS.minimax.defaultModel);
      break;
    case 'qwen':
      content = await callOpenAICompat(prompt, config, PROVIDERS.qwen.baseURL, PROVIDERS.qwen.defaultModel);
      break;

    case 'ollama':
      content = await callOllama(prompt, config);
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  const providerName = PROVIDERS[provider]?.name || provider;
  return toJsonString(content, providerName);
}

// ========================
// Gemini (独有格式)
// ========================
async function callGemini(prompt, config) {
  const apiKey = config.apiKey;
  if (!apiKey) throw new Error('Gemini API Key 未配置。请点击 ⚙️ 前往设置。');
  const model = config.model || PROVIDERS.gemini.defaultModel;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini Error: ${err.error?.message || 'Request failed'}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error(`Gemini 返回异常: ${JSON.stringify(data).slice(0, 220)}`);
  }
  return content;
}

// ========================
// OpenAI 兼容格式 (OpenAI / DeepSeek / 智谱 / MiniMax / 通义千问 共用)
// ========================
async function callOpenAICompat(prompt, config, baseURL, fallbackModel) {
  const apiKey = config.apiKey;
  if (!apiKey) throw new Error('API Key 未配置。请点击 ⚙️ 前往设置。');
  const model = config.model || fallbackModel;

  const requestBody = {
      model: model,
      messages: [{ role: 'user', content: prompt + '\n\n请严格返回 JSON 格式，不要有任何其他内容。' }],
      response_format: { type: 'json_object' }
    };

  async function request(body) {
    return fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
  }

  let response = await request(requestBody);

  if (!response.ok) {
    const errMessage = await readErrorMessage(response);
    if (/response_format|json_object|unsupported|不支持/i.test(errMessage)) {
      const fallbackResponse = await request({
        model: requestBody.model,
        messages: requestBody.messages
      });
      if (fallbackResponse.ok) {
        response = fallbackResponse;
      } else {
        throw new Error(`API Error: ${await readErrorMessage(fallbackResponse)}`);
      }
    } else {
      throw new Error(`API Error: ${errMessage}`);
    }
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`API 返回异常: ${JSON.stringify(data).slice(0, 220)}`);
  }
  return content;
}

// ========================
// Anthropic (独有格式)
// ========================
async function callAnthropic(prompt, config) {
  const apiKey = config.apiKey;
  if (!apiKey) throw new Error('Anthropic API Key 未配置。请点击 ⚙️ 前往设置。');
  const model = config.model || PROVIDERS.anthropic.defaultModel;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt + '\n\n请严格返回 JSON 格式，不要有任何其他内容。' }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Anthropic Error: ${err.error?.message || 'Request failed'}`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text;
  if (!content) {
    throw new Error(`Anthropic 返回异常: ${JSON.stringify(data).slice(0, 220)}`);
  }
  return content;
}

// ========================
// Ollama (本地)
// ========================
async function callOllama(prompt, config) {
  const endpoint = normalizeOllamaEndpoint(config.endpoint || OLLAMA_DEFAULT_ENDPOINT);
  let activeEndpoint = endpoint;
  let model = (config.model || PROVIDERS.ollama.defaultModel || '').trim();

  if (!model) {
    const available = await fetchOllamaModels(activeEndpoint);
    if (available.length > 0) {
      model = available[0];
    } else {
      throw new Error('Ollama 模型未配置，且未检测到本地模型。请先执行 ollama pull 模型名。');
    }
  }

  async function requestChat(targetModel, baseEndpoint = activeEndpoint) {
    return fetchWithTimeout(
      `${baseEndpoint}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: prompt + '\n\n请严格返回 JSON 格式，不要有任何其他内容。' }],
          format: 'json',
          stream: false
        })
      },
      OLLAMA_TIMEOUT_MS
    );
  }

  async function requestGenerate(targetModel, baseEndpoint = activeEndpoint) {
    return fetchWithTimeout(
      `${baseEndpoint}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          prompt: prompt + '\n\n请严格返回 JSON 格式，不要有任何其他内容。',
          format: 'json',
          stream: false
        })
      },
      OLLAMA_TIMEOUT_MS
    );
  }

  async function requestOpenAICompat(targetModel, baseEndpoint = activeEndpoint) {
    return fetchWithTimeout(
      `${baseEndpoint}/v1/chat/completions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: prompt + '\n\n请严格返回 JSON 格式，不要有任何其他内容。' }],
          response_format: { type: 'json_object' }
        })
      },
      OLLAMA_TIMEOUT_MS
    );
  }

  let response;
  try {
    response = await requestChat(model);
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Ollama 请求超时（120s）。请确认模型已拉取并完成首次加载。');
    }
    throw new Error(`Ollama 连接失败: ${err.message || err}。请确认已执行 ollama serve。`);
  }

  if (response.status === 403) {
    let parsedEndpoint = null;
    try {
      parsedEndpoint = new URL(activeEndpoint);
    } catch (_err) {
      parsedEndpoint = null;
    }

    const canTryLocalFallback =
      parsedEndpoint &&
      ['localhost', '127.0.0.1'].includes(parsedEndpoint.hostname) &&
      (parsedEndpoint.port === '' || parsedEndpoint.port === '11434');

    if (canTryLocalFallback) {
      const fallbackEndpoint = `${parsedEndpoint.protocol}//localhost:11435`;
      try {
        const fallbackResponse = await requestChat(model, fallbackEndpoint);
        activeEndpoint = fallbackEndpoint;
        response = fallbackResponse;
      } catch (_err) {
        // keep original 403 flow
      }
    }
  }

  if (response.status === 404) {
    const detail404 = await readErrorMessage(response);
    if (/model/i.test(detail404)) {
      const available = await fetchOllamaModels(activeEndpoint);
      if (available.length > 0) {
        model = available[0];
        response = await requestChat(model);
      }
    }
  }

  if (!response.ok && (response.status === 400 || response.status === 404 || response.status === 405)) {
    const fallback = await requestGenerate(model);
    if (fallback.ok) {
      const fallbackData = await fallback.json().catch(() => ({}));
      const fallbackContent = fallbackData?.response;
      if (fallbackContent) return fallbackContent;
    }

    const openAICompatFallback = await requestOpenAICompat(model);
    if (openAICompatFallback.ok) {
      const openAICompatData = await openAICompatFallback.json().catch(() => ({}));
      const openAICompatContent = openAICompatData?.choices?.[0]?.message?.content;
      if (openAICompatContent) return openAICompatContent;
    }
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        'Ollama 返回 403：本地服务拒绝了 chrome-extension 来源。请设置 OLLAMA_ORIGINS（允许 chrome-extension://*）后重启 ollama serve，或改用文章里的 TranslateGemma2API 本地中转。'
      );
    }

    const detail = await readErrorMessage(response);
    if (response.status === 404 && /model/i.test(detail)) {
      const available = await fetchOllamaModels(activeEndpoint);
      const suggestion = available.length > 0 ? `。当前可用模型: ${available.join(', ')}` : '';
      throw new Error(`Ollama 模型不存在: ${model}。请先执行 ollama pull ${model}${suggestion}`);
    }
    throw new Error(`Ollama Error (HTTP ${response.status}): ${detail}`);
  }

  const data = await response.json();
  const content = data?.message?.content;

  if (!content) {
    throw new Error(`Ollama 返回异常: ${JSON.stringify(data).slice(0, 220)}`);
  }

  return content;
}

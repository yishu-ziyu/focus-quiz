// Options Page Logic - 多 Provider 配置管理 (含国内厂商)

const providerSelect = document.getElementById('providerSelect');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');

// 所有支持的 Provider ID
const ALL_PROVIDERS = ['gemini', 'openai', 'anthropic', 'deepseek', 'zhipu', 'minimax', 'qwen', 'ollama'];

// 需要 API Key 的 Provider
const KEY_PROVIDERS = ['gemini', 'openai', 'anthropic', 'deepseek', 'zhipu', 'minimax', 'qwen'];
const OLLAMA_DEFAULT_ENDPOINT = 'http://localhost:11434';

function normalizeOllamaEndpointInput(raw) {
  const input = (raw || OLLAMA_DEFAULT_ENDPOINT).trim();
  let url;

  try {
    url = new URL(input);
  } catch (_err) {
    throw new Error('Ollama 地址格式错误，请使用 http://localhost:11434');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Ollama 地址必须以 http:// 或 https:// 开头');
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

// ========================
// UI: 切换 Provider 表单显示
// ========================
function showProviderConfig(provider) {
  document.querySelectorAll('.provider-config').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(`config-${provider}`);
  if (target) target.classList.remove('hidden');
}

providerSelect.addEventListener('change', () => {
  showProviderConfig(providerSelect.value);
});

// ========================
// 加载已保存的配置
// ========================
async function loadConfig() {
  const result = await chrome.storage.local.get(['activeProvider', 'providerConfigs']);
  const active = result.activeProvider || 'gemini';
  const configs = result.providerConfigs || {};

  providerSelect.value = active;
  showProviderConfig(active);

  // 为每个有 API Key 的 provider 恢复值
  KEY_PROVIDERS.forEach(p => {
    const keyEl = document.getElementById(`${p}-apiKey`);
    const modelEl = document.getElementById(`${p}-model`);
    if (configs[p]) {
      if (keyEl) keyEl.value = configs[p].apiKey || '';
      if (modelEl) modelEl.value = configs[p].model || '';
    }
  });

  // Ollama 特殊处理
  if (configs.ollama) {
    document.getElementById('ollama-endpoint').value = configs.ollama.endpoint || OLLAMA_DEFAULT_ENDPOINT;
    document.getElementById('ollama-model').value = configs.ollama.model || '';
  }
}

// ========================
// 保存配置
// ========================
saveBtn.addEventListener('click', async () => {
  const activeProvider = providerSelect.value;

  // 收集所有 provider 的配置（保留之前配置过的）
  const result = await chrome.storage.local.get(['providerConfigs']);
  const configs = result.providerConfigs || {};

  // 收集每个有 Key 的 provider
  KEY_PROVIDERS.forEach(p => {
    const keyEl = document.getElementById(`${p}-apiKey`);
    const modelEl = document.getElementById(`${p}-model`);
    configs[p] = {
      apiKey: keyEl ? keyEl.value.trim() : '',
      model: modelEl ? modelEl.value : ''
    };
  });

  // Ollama
  let normalizedOllamaEndpoint = OLLAMA_DEFAULT_ENDPOINT;
  try {
    normalizedOllamaEndpoint = normalizeOllamaEndpointInput(
      document.getElementById('ollama-endpoint').value.trim() || OLLAMA_DEFAULT_ENDPOINT
    );
  } catch (err) {
    statusDiv.className = 'status-err';
    statusDiv.textContent = err.message;
    setTimeout(() => statusDiv.textContent = '', 3000);
    return;
  }

  configs.ollama = {
    endpoint: normalizedOllamaEndpoint,
    model: document.getElementById('ollama-model').value.trim()
  };

  // 验证当前选中的 provider
  if (KEY_PROVIDERS.includes(activeProvider) && !configs[activeProvider].apiKey) {
    statusDiv.className = 'status-err';
    statusDiv.textContent = `请填写当前 Provider 的 API Key。`;
    setTimeout(() => statusDiv.textContent = '', 3000);
    return;
  }
  if (activeProvider === 'ollama' && !configs.ollama.model) {
    statusDiv.className = 'status-err';
    statusDiv.textContent = '请填写 Ollama 的模型名称（如 qwen3:8b）。';
    setTimeout(() => statusDiv.textContent = '', 3000);
    return;
  }

  if (activeProvider === 'ollama') {
    document.getElementById('ollama-endpoint').value = normalizedOllamaEndpoint;
  }

  // 兼容旧版
  const saveData = { activeProvider, providerConfigs: configs };
  if (configs.gemini && configs.gemini.apiKey) {
    saveData.geminiApiKey = configs.gemini.apiKey;
  }

  await chrome.storage.local.set(saveData);

  // 获取 provider 显示名
  const providerNames = {
    gemini: 'Gemini', openai: 'OpenAI', anthropic: 'Claude',
    deepseek: 'DeepSeek', zhipu: '智谱AI', minimax: 'MiniMax', qwen: '通义千问', ollama: 'Ollama'
  };

  statusDiv.className = 'status-ok';
  statusDiv.textContent = `✓ 已保存！当前使用: ${providerNames[activeProvider] || activeProvider}`;
  setTimeout(() => statusDiv.textContent = '', 3000);
});

// 启动时加载
loadConfig();

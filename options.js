// Options Page Logic - provider presets + custom OpenAI-compatible endpoint

const PRESETS = globalThis.FOCUS_QUIZ_PROVIDER_PRESETS || {};
const REGION_LABELS = globalThis.FOCUS_QUIZ_REGION_LABELS || {};
const OLLAMA_DEFAULT_ENDPOINT = 'http://localhost:11434';

const providerSelect = document.getElementById('providerSelect');
const providerRegion = document.getElementById('providerRegion');
const providerProtocol = document.getElementById('providerProtocol');
const providerDoc = document.getElementById('providerDoc');
const baseUrlGroup = document.getElementById('baseUrlGroup');
const baseUrlInput = document.getElementById('baseUrlInput');
const apiKeyGroup = document.getElementById('apiKeyGroup');
const apiKeyInput = document.getElementById('apiKeyInput');
const modelSelectGroup = document.getElementById('modelSelectGroup');
const modelSelect = document.getElementById('modelSelect');
const customModelGroup = document.getElementById('customModelGroup');
const customModelInput = document.getElementById('customModelInput');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');

let providerConfigs = {};

function normalizeEndpoint(raw, fallback, label) {
  const input = (raw || fallback || '').trim();
  if (!input) throw new Error(`${label} 不能为空。`);

  let url;
  try {
    url = new URL(input);
  } catch (_err) {
    throw new Error(`${label} 格式错误，请使用 https://api.example.com/v1`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${label} 必须以 http:// 或 https:// 开头`);
  }

  if (url.hostname === '0.0.0.0' || url.hostname === '::' || url.hostname === '[::]') {
    url.hostname = 'localhost';
  }

  const badPathSuffixes = [
    '/api/chat',
    '/api/generate',
    '/v1/chat/completions',
    '/chat/completions',
    '/messages',
    '/api',
    '/v1'
  ];
  const normalizedPath = url.pathname.toLowerCase().replace(/\/+$/, '');
  const matchedSuffix = badPathSuffixes.find((suffix) => normalizedPath.endsWith(suffix));

  if (matchedSuffix && label.includes('Ollama')) {
    const trimmedPath = url.pathname.slice(0, url.pathname.length - matchedSuffix.length) || '/';
    url.pathname = trimmedPath;
  } else if (matchedSuffix && !label.includes('Ollama')) {
    const suffixesToTrim = ['/chat/completions', '/messages'];
    const suffix = suffixesToTrim.find((s) => normalizedPath.endsWith(s));
    if (suffix) {
      url.pathname = url.pathname.slice(0, url.pathname.length - suffix.length) || '/';
    }
  }

  url.search = '';
  url.hash = '';
  return `${url.origin}${url.pathname === '/' ? '' : url.pathname}`.replace(/\/+$/, '');
}

function groupProviderIds() {
  const groups = {};
  Object.entries(PRESETS).forEach(([id, preset]) => {
    const region = preset.region || 'custom';
    if (!groups[region]) groups[region] = [];
    groups[region].push(id);
  });
  return groups;
}

function renderProviderOptions() {
  providerSelect.replaceChildren();
  const groups = groupProviderIds();
  const regionOrder = ['global', 'cn', 'gateway', 'coding', 'local', 'custom'];

  regionOrder.forEach((region) => {
    const ids = groups[region] || [];
    if (ids.length === 0) return;
    const optgroup = document.createElement('optgroup');
    optgroup.label = REGION_LABELS[region] || region;
    ids.forEach((id) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = PRESETS[id].name;
      optgroup.appendChild(option);
    });
    providerSelect.appendChild(optgroup);
  });
}

function renderModelOptions(preset, savedModel) {
  const models = Array.isArray(preset.models) ? preset.models : [];
  modelSelect.replaceChildren();

  models.forEach((model) => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });

  const customOption = document.createElement('option');
  customOption.value = '__custom__';
  customOption.textContent = '手动输入模型 ID';
  modelSelect.appendChild(customOption);

  const preferredModel = savedModel || preset.defaultModel || models[0] || '';
  const hasPresetModel = models.includes(preferredModel);
  modelSelect.value = hasPresetModel ? preferredModel : '__custom__';
  customModelInput.value = hasPresetModel ? '' : preferredModel;
  customModelGroup.classList.toggle('hidden', modelSelect.value !== '__custom__');
  modelSelectGroup.classList.toggle('hidden', preset.apiType === 'ollama' && models.length === 0);
}

function renderProviderConfig(providerId) {
  const preset = PRESETS[providerId];
  if (!preset) return;
  const config = providerConfigs[providerId] || {};

  providerRegion.textContent = REGION_LABELS[preset.region] || preset.region || 'Provider';
  providerRegion.className = `badge ${preset.region || 'custom'}`;
  providerProtocol.textContent = preset.apiType;
  providerDoc.href = preset.doc || '#';
  providerDoc.classList.toggle('hidden', !preset.doc);

  const isOllama = preset.apiType === 'ollama';
  const needsBaseURL = providerId.startsWith('custom-') || isOllama;
  const needsApiKey = !isOllama;

  baseUrlGroup.classList.toggle('hidden', !needsBaseURL);
  apiKeyGroup.classList.toggle('hidden', !needsApiKey);

  if (isOllama) {
    baseUrlInput.placeholder = OLLAMA_DEFAULT_ENDPOINT;
    baseUrlInput.value = config.endpoint || OLLAMA_DEFAULT_ENDPOINT;
  } else {
    baseUrlInput.placeholder = preset.baseURL || 'https://api.example.com/v1';
    baseUrlInput.value = config.baseURL || preset.baseURL || '';
  }

  apiKeyInput.placeholder = preset.apiKeyPlaceholder || 'API Key...';
  apiKeyInput.value = config.apiKey || '';
  renderModelOptions(preset, config.model);
}

function selectedModel() {
  return modelSelect.value === '__custom__' ? customModelInput.value.trim() : modelSelect.value;
}

function showStatus(text, ok) {
  statusDiv.className = ok ? 'status-ok' : 'status-err';
  statusDiv.textContent = text;
  setTimeout(() => {
    statusDiv.textContent = '';
  }, 3500);
}

providerSelect.addEventListener('change', () => {
  renderProviderConfig(providerSelect.value);
});

modelSelect.addEventListener('change', () => {
  customModelGroup.classList.toggle('hidden', modelSelect.value !== '__custom__');
});

saveBtn.addEventListener('click', async () => {
  const activeProvider = providerSelect.value;
  const preset = PRESETS[activeProvider];
  if (!preset) {
    showStatus('未知 Provider。', false);
    return;
  }

  const config = {};

  try {
    if (preset.apiType === 'ollama') {
      config.endpoint = normalizeEndpoint(baseUrlInput.value, OLLAMA_DEFAULT_ENDPOINT, 'Ollama 地址');
    } else {
      config.apiKey = apiKeyInput.value.trim();
      if (!config.apiKey) throw new Error('请填写当前 Provider 的 API Key。');
      if (activeProvider.startsWith('custom-')) {
        config.baseURL = normalizeEndpoint(baseUrlInput.value, '', 'Base URL');
      }
    }

    config.model = selectedModel();
    if (!config.model) throw new Error('请填写模型 ID。');
  } catch (err) {
    showStatus(err.message || String(err), false);
    return;
  }

  providerConfigs[activeProvider] = config;

  const saveData = {
    activeProvider,
    providerConfigs
  };

  if (activeProvider === 'gemini' && config.apiKey) {
    saveData.geminiApiKey = config.apiKey;
  }

  await chrome.storage.local.set(saveData);
  showStatus(`已保存。当前使用: ${preset.name} / ${config.model}`, true);
});

async function loadConfig() {
  renderProviderOptions();
  const result = await chrome.storage.local.get(['activeProvider', 'providerConfigs']);
  providerConfigs = result.providerConfigs || {};
  const active = PRESETS[result.activeProvider] ? result.activeProvider : 'gemini';
  providerSelect.value = active;
  renderProviderConfig(active);
}

loadConfig();

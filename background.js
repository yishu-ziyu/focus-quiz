// 安装时创建右键菜单 + 初始化数据结构
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generate-quiz",
    title: "Focus Quiz: 审问选中文本",
    contexts: ["selection"]
  });

  // 初始化 Streak 和错题本数据结构（仅首次安装时）
  chrome.storage.local.get(['streakCount'], (result) => {
    if (result.streakCount === undefined) {
      chrome.storage.local.set({
        lastQuizDate: null,
        streakCount: 0,
        mistakeLog: []
      });
    }
  });

  console.info("[Focus Quiz] Extension installed & data initialized");
});

// 点击扩展图标时打开 Side Panel
chrome.action.onClicked.addListener((tab) => {
  handleFullPageQuiz(tab);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'focusQuiz.startFullPage') return false;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];
    if (!tab) {
      sendResponse({ ok: false, error: '没有找到当前活动网页。请切回要审问的文章页后再试。' });
      return;
    }
    handleFullPageQuiz(tab)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
  });
  return true;
});

async function handleFullPageQuiz(tab) {
  if (!tab?.id || !tab?.windowId) return;

  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });

    if (!/^https?:\/\//i.test(tab.url || '')) {
      await chrome.storage.local.set({
        extractionError: '当前页面不支持全文模式。请在普通网页中使用，或选中文字后右键审问。',
        timestamp: Date.now()
      });
      return;
    }

    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractReadablePageText
    });
    const result = injection?.result || {};

    if (!result.text || result.text.length < 120) {
      await chrome.storage.local.set({
        extractionError: '没有抓取到足够的正文内容。可以改用选区模式，手动选中文章核心段落。',
        timestamp: Date.now()
      });
      return;
    }

    await chrome.storage.local.set({
      selectedText: result.text,
      sourceMode: 'fullpage',
      sourceUrl: tab.url || result.url || '',
      sourceTitle: result.title || tab.title || '',
      timestamp: Date.now()
    });
  } catch (err) {
    console.error('[Focus Quiz] Full page extraction failed:', err);
    await chrome.storage.local.set({
      extractionError: `全文模式抓取失败：${err.message || err}`,
      timestamp: Date.now()
    });
  }
}

function extractReadablePageText() {
  const MAX_CHARS = 12000;
  const MIN_TEXT = 120;
  const selectorsToRemove = [
    'script', 'style', 'noscript', 'svg', 'canvas', 'iframe',
    'nav', 'footer', 'header', 'aside', 'form',
    'button', 'input', 'textarea', 'select',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '.nav', '.navbar', '.sidebar', '.footer', '.header', '.menu', '.comments', '.comment'
  ];

  function textOf(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll(selectorsToRemove.join(',')).forEach((node) => node.remove());
    return (clone.innerText || clone.textContent || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  const candidates = [
    ...document.querySelectorAll('article, main, [role="main"], .article, .post, .content, .entry-content')
  ];
  candidates.push(document.body);

  const best = candidates
    .map((element) => ({ element, text: textOf(element) }))
    .filter((item) => item.text.length >= MIN_TEXT)
    .sort((a, b) => b.text.length - a.text.length)[0];

  const text = (best?.text || '').slice(0, MAX_CHARS);
  return {
    text,
    title: document.title || '',
    url: location.href,
    truncated: (best?.text || '').length > MAX_CHARS
  };
}

// 点击右键菜单 - 这是用户手势，可以打开 Side Panel
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generate-quiz") {
    // 保存选中的文本
    chrome.storage.local.set({
      selectedText: info.selectionText,
      sourceMode: 'selection',
      sourceUrl: tab?.url || '',
      sourceTitle: tab?.title || '',
      timestamp: Date.now()
    });

    // 在右键菜单点击时可以打开 Side Panel（这是用户手势）
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

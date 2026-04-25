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
  chrome.sidePanel.open({ windowId: tab.windowId });
});

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

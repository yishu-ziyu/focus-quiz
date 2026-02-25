// Focus Quiz - Service Worker

// Setup context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generate-quiz",
    title: "Generate Quiz from Selection",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generate-quiz") {
    // Open the side panel
    // Note: In Chrome 116+, we can open the side panel programmatically on user gesture
    chrome.sidePanel.open({ windowId: tab.windowId })
      .catch((error) => console.error("Error opening side panel:", error));

    // Send the selected text to the side panel
    // We use a small timeout to ensure the panel has time to initialize if it wasn't open
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: "GENERATE_QUIZ",
        text: info.selectionText
      }).catch(() => {
        // If sending fails, it might be because the side panel is not yet ready listening.
        // In a more robust app, we might store this in local storage or a variable 
        // that the side panel checks upon opening.
        chrome.storage.local.set({ pendingQuizText: info.selectionText });
      });
    }, 500);
  }
});

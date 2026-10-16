// Lock the browser whenever it starts up
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ isLocked: true });
});

// Extra Security: Kill the tab if someone tries to go to chrome://history while locked
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.local.get(['isLocked'], (data) => {
    if (data.isLocked && tab.url.includes("history")) {
      chrome.tabs.remove(tabId);
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "verify_password") {
    if (message.password === "123456") {
      // WIPE ALL HISTORY
      chrome.history.deleteAll(() => {
        chrome.storage.local.set({ isLocked: false }, () => {
          sendResponse({ status: "unlocked_and_wiped" });
        });
      });
    } else if (message.password === "999999") { 
      // Safe Unlock (No wipe)
      chrome.storage.local.set({ isLocked: false }, () => {
        sendResponse({ status: "unlocked_safe" });
      });
    } else {
      sendResponse({ status: "wrong" });
    }
    return true; 
  }
});
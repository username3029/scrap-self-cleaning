// Scrap - Download to Scrap
const SCRAP = "Scrap";
let autoRoute = false;

// Load saved state on startup
chrome.storage.local.get(["autoRoute"], (data) => {
  autoRoute = !!data.autoRoute;
});

// Create right-click menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scrap-download",
    title: "Download to Scrap",
    contexts: ["link", "image", "video", "audio", "page", "selection"]
  });
  chrome.storage.local.set({ autoRoute: false });
});

// Listen for state changes from popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.autoRoute) {
    autoRoute = changes.autoRoute.newValue;
  }
});

// Right-click handler
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "scrap-download") {
    const url = info.linkUrl || info.srcUrl;
    if (!url) return;
    chrome.downloads.download({
      url: url,
      filename: SCRAP + "/" + url.split("/").pop(),
      conflictAction: "uniquify"
    });
  }
});

// Auto-route: intercept ALL downloads and send to Scrap if enabled
// Note: suggest() must be called synchronously, no async callbacks
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  if (autoRoute) {
    let name = downloadItem.filename || downloadItem.url.split("/").pop() || "download";
    suggest({ filename: SCRAP + "/" + name, conflictAction: "uniquify" });
  } else {
    suggest();
  }
});
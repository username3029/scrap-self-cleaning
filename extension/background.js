// Scrap - Download to Scrap
const SCRAP = "Scrap";

// Create right-click menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scrap-download",
    title: "Download to Scrap",
    contexts: ["link", "image", "video", "audio", "page", "selection"]
  });
  // Set default: auto-route is OFF
  chrome.storage.local.set({ autoRoute: false });
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
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  chrome.storage.local.get(["autoRoute"], (data) => {
    if (data.autoRoute) {
      // Extract filename from URL or use downloadItem's suggested filename
      let filename = downloadItem.filename || downloadItem.url.split("/").pop() || "download";
      suggest({ filename: SCRAP + "/" + filename, conflictAction: "uniquify" });
    } else {
      // Let it download normally
      suggest();
    }
  });
});
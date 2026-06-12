// Scrap - Download to Scrap
const FOLDER = "Scrap";
let routeToScrap = false;

// Load saved state on startup
chrome.storage.local.get("routeToScrap", (r) => {
  routeToScrap = !!r.routeToScrap;
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scrap-dl",
    title: "Download to Scrap",
    contexts: ["link", "image", "video", "audio", "page", "selection"]
  });
});

// Keep routeToScrap updated when popup changes it
chrome.storage.onChanged.addListener((c) => {
  if (c.routeToScrap) routeToScrap = c.routeToScrap.newValue;
});

// Right-click
chrome.contextMenus.onClicked.addListener((info) => {
  const url = info.linkUrl || info.srcUrl;
  if (!url) return;
  const name = url.split("/").pop() || "download";
  chrome.downloads.download({ url, filename: FOLDER + "/" + name, conflictAction: "uniquify" });
});

// Auto-route: send ALL downloads to Scrap when toggle is ON
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (routeToScrap) {
    suggest({ filename: FOLDER + "/" + item.filename, conflictAction: "uniquify" });
  } else {
    suggest();
  }
});
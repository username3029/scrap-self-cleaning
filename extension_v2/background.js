// Scrap - Download to Scrap
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scrap-download",
    title: "Download to Scrap",
    contexts: ["link", "image", "video", "audio", "page", "selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "scrap-download") {
    const url = info.linkUrl || info.srcUrl;
    if (!url) return;
    chrome.downloads.download({
      url: url,
      filename: "Scrap/" + url.split("/").pop(),
      conflictAction: "uniquify"
    });
  }
});
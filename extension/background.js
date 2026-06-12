/**
 * Scrap Extension Background Service Worker
 *
 * Adds a right-click context menu option: "Download to Scrap"
 * When clicked, it routes the download to the user's Scrap folder.
 */

const SCRAP_FOLDER = "Scrap";

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "download-to-scrap",
    title: "Download to Scrap",
    contexts: ["link", "video", "audio"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "download-to-scrap") {
    const url = info.linkUrl || info.srcUrl;
    if (!url) {
      console.warn("Scrap: No URL found in context.");
      return;
    }

    // Extract filename from URL or use a timestamp fallback
    const urlObj = new URL(url);
    const originalName = urlObj.pathname.split("/").pop() || "download";
    const filename = `${SCRAP_FOLDER}/${originalName}`;

    chrome.downloads.download({
      url: url,
      filename: filename,
      conflictAction: "uniquify",
      saveAs: false,
    });
  }
});
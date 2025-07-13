chrome.runtime.onInstalled.addListener(() => {
  console.log("Barcode Chrome Extension installed.");
});

// When the extension icon is clicked, open popup.html in a separate window
chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup/popup.html"),
    type: "popup",
    width: 400,
    height: 600
  });
});

// Optional: listen for debug messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOG') {
    console.log("From content script:", message.data);
  }
});

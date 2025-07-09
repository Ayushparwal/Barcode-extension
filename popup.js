// -----------------------------
// ✅ popup.js (extension UI logic)
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {
  const cropBtn = document.getElementById("crop-btn");
  const resultDiv = document.getElementById("result");
  const statusDiv = document.getElementById("status");

  if (!cropBtn || !resultDiv || !statusDiv) {
    console.error("❌ Missing DOM elements in popup.html");
    return;
  }

  // Trigger cropping and scanning
  cropBtn.addEventListener("click", () => {
    statusDiv.textContent = "🔄 Detecting...";
    resultDiv.textContent = "";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "start-crop" }, (response) => {
          if (chrome.runtime.lastError) {
            statusDiv.textContent = "❌ Cannot inject script. Try on a normal webpage.";
          } else if (response && response.started) {
            statusDiv.textContent = "🖱️ Select area to scan...";
          }
        });
      }
    });
  });

  // Load last result
  chrome.runtime.sendMessage({ action: "get-last-barcode" }, (response) => {
    if (!response || Object.keys(response).length === 0) {
      statusDiv.textContent = "ℹ️ No previous result.";
      resultDiv.textContent = "";
      return;
    }

    if (response.action === "barcode-result") {
      statusDiv.textContent = "";
      resultDiv.textContent = response.barcodes.length
        ? "✅ Barcode: " + response.barcodes[0]
        : "❌ No barcode found.";
    } else if (response.action === "barcode-error") {
      statusDiv.textContent = "";
      resultDiv.textContent = "❌ Error: " + response.error;
    }
  });

  // Listen for live updates
  chrome.runtime.onMessage.addListener((message) => {
    if (!message) return;

    if (message.action === "barcode-result") {
      statusDiv.textContent = "";
      resultDiv.textContent = message.barcodes.length
        ? "✅ Barcode: " + message.barcodes[0]
        : "❌ No barcode found.";
    } else if (message.action === "barcode-error") {
      statusDiv.textContent = "";
      resultDiv.textContent = "❌ Error: " + message.error;
    }
  });
});
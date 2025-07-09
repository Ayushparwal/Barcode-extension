let lastBarcodeResult = null;
let lastBarcodeError = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "barcode-result": {
      lastBarcodeResult = message.barcodes;
      lastBarcodeError = null;

      chrome.runtime.sendMessage(
        { action: "barcode-result", barcodes: message.barcodes },
        () => {
          if (chrome.runtime.lastError) {
            console.warn("No active receiver for barcode-result");
          }
        }
      );
      break;
    }

    case "barcode-error": {
      lastBarcodeError = message.error;
      lastBarcodeResult = null;

      chrome.runtime.sendMessage(
        { action: "barcode-error", error: message.error },
        () => {
          if (chrome.runtime.lastError) {
            console.warn("No active receiver for barcode-error");
          }
        }
      );
      break;
    }

    case "get-last-barcode": {
      if (lastBarcodeResult) {
        sendResponse({ action: "barcode-result", barcodes: lastBarcodeResult });
      } else if (lastBarcodeError) {
        sendResponse({ action: "barcode-error", error: lastBarcodeError });
      } else {
        sendResponse({});
      }
      break;
    }

    case "capture-crop": {
      chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
        sendResponse(dataUrl);
      });
      return true; // Async response
    }
  }
});

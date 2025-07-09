// -----------------------------
// ✅ content.js (content script)
// -----------------------------

// --- Cropper UI ---
window.startCrop = function (callback) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.left = 0;
  overlay.style.top = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = 999999;
  overlay.style.cursor = "crosshair";
  overlay.style.background = "rgba(0,0,0,0.1)";
  document.body.appendChild(overlay);

  let startX, startY, endX, endY;
  const selection = document.createElement("div");
  selection.style.position = "absolute";
  selection.style.border = "2px dashed #2196F3";
  selection.style.background = "rgba(33,150,243,0.2)";
  overlay.appendChild(selection);

  function mouseDown(e) {
    startX = e.clientX;
    startY = e.clientY;
    overlay.addEventListener("mousemove", mouseMove);
    overlay.addEventListener("mouseup", mouseUp);
  }

  function mouseMove(e) {
    endX = e.clientX;
    endY = e.clientY;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);
    selection.style.left = `${x}px`;
    selection.style.top = `${y}px`;
    selection.style.width = `${w}px`;
    selection.style.height = `${h}px`;
  }

  function mouseUp() {
    overlay.removeEventListener("mousemove", mouseMove);
    overlay.removeEventListener("mouseup", mouseUp);
    document.body.removeChild(overlay);
    callback({
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      w: Math.abs(startX - endX),
      h: Math.abs(startY - endY),
    });
  }

  overlay.addEventListener("mousedown", mouseDown);
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "start-crop") {
    if (window.__barcodeCropperActive) return;
    window.__barcodeCropperActive = true;

    window.startCrop((crop) => {
      chrome.runtime.sendMessage({ action: "capture-crop", crop }, (dataUrl) => {
        if (!dataUrl) {
          chrome.runtime.sendMessage({ action: "barcode-error", error: "Failed to capture screenshot." });
          window.__barcodeCropperActive = false;
          return;
        }

        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = crop.w;
          canvas.height = crop.h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
          detectBarcode(canvas.toDataURL());
          window.__barcodeCropperActive = false;
        };
        img.onerror = function () {
          chrome.runtime.sendMessage({ action: "barcode-error", error: "Failed to load cropped image." });
          window.__barcodeCropperActive = false;
        };
        img.src = dataUrl;
      });
    });

    sendResponse({ started: true });
  }
});

function detectBarcode(dataUrl) {
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Quagga.decodeSingle({
      src: dataUrl,
      numOfWorkers: 0,
      inputStream: { size: 800 },
      decoder: {
        readers: [
          "code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader",
          "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader",
          "i2of5_reader", "2of5_reader", "code_93_reader"
        ]
      }
    }, function (result) {
      if (result && result.codeResult) {
        chrome.runtime.sendMessage({ action: "barcode-result", barcodes: [result.codeResult.code] });
      } else {
        chrome.runtime.sendMessage({ action: "barcode-result", barcodes: [] });
      }
    });
  };
  img.onerror = function () {
    chrome.runtime.sendMessage({ action: "barcode-error", error: "Failed to load image for detection." });
  };
  img.src = dataUrl;
}

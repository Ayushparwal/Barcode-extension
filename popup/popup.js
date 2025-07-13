document.getElementById("crop-btn").onclick = async function () {
  setStatus("Activating crop tool...");
  chrome.tabs.query({}, (tabs) => {
    const targetTab = tabs.find(
      (tab) => tab.active && !tab.url.startsWith("chrome-extension://")
    );

    if (!targetTab?.id) {
      setStatus("No active webpage tab found.");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: targetTab.id },
      func: () => {
        const tryCrop = () => {
          if (window.__tutorji_barcode_startCrop) {
            window.__tutorji_barcode_startCrop();
          } else {
            setTimeout(tryCrop, 100);
          }
        };
        tryCrop();
      }
    });
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "BARCODE_CROP_COORDS") {
    setStatus("Capturing screenshot...");

    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      const img = new Image();
      img.onload = function () {
        const scale = window.devicePixelRatio || 1;
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = message.width * scale;
        cropCanvas.height = message.height * scale;

        const ctx = cropCanvas.getContext("2d");
        ctx.drawImage(
          img,
          message.x * scale,
          message.y * scale,
          message.width * scale,
          message.height * scale,
          0,
          0,
          message.width * scale,
          message.height * scale
        );

        const croppedDataUrl = cropCanvas.toDataURL("image/png");
        showResultSection();
        displayImage(croppedDataUrl);
        setStatus("Detecting barcodes...");
        detectBarcodes(croppedDataUrl);
        detectQRCode(cropCanvas);
      };
      img.src = dataUrl;
    });
  }
});

function setStatus(text) {
  document.getElementById("status").innerText = text;
}

function showResultSection() {
  document.getElementById("result-section").style.display = "block";
}

function displayImage(dataUrl) {
  const img = document.getElementById("cropped-img");
  img.src = dataUrl;
}

function displayBarcodes(barcodes) {
  const barcodeDiv = document.getElementById("barcodes");
  let out = "";

  if (barcodes.length === 0) {
    out = "<div style='color:#b00;'>No 1D barcode found.</div>";
    document.getElementById("copy-btn").style.display = "none";
  } else {
    out = barcodes
      .map((b) => `<div class='barcode-row'><b>${b.format}</b>: <span>${b.code}</span></div>`)
      .join("");
    document.getElementById("copy-btn").style.display = "";
    document.getElementById("copy-btn").onclick = () => {
      navigator.clipboard.writeText(barcodes.map((b) => b.code).join("\n"));
      setStatus("Copied to clipboard.");
    };
  }

  barcodeDiv.innerHTML = out;
}

function detectBarcodes(dataUrl) {
  const barcodes = [];

  Quagga.decodeSingle(
    {
      src: dataUrl,
      numOfWorkers: 0,
      inputStream: { size: 1280 },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "upc_reader",
          "upc_e_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "i2of5_reader",
          "2of5_reader",
          "code_93_reader"
        ]
      },
      locate: true,
      multiple: true
    },
    function (result) {
      if (!result || !result.codeResult) {
        if (result && result.length) {
          for (const r of result) {
            if (r && r.codeResult) {
              barcodes.push({
                format: r.codeResult.format,
                code: r.codeResult.code
              });
            }
          }
        }
        displayBarcodes(barcodes);
        return;
      }

      barcodes.push({
        format: result.codeResult.format,
        code: result.codeResult.code
      });

      displayBarcodes(barcodes);
    }
  );
}

function detectQRCode(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const qr = jsQR(imageData.data, canvas.width, canvas.height);

  if (qr) {
    const barcodeDiv = document.getElementById("barcodes");
    barcodeDiv.innerHTML += `<div class='barcode-row'><b>QR Code</b>: <span>${qr.data}</span></div>`;
    setStatus("QR Code found.");
    document.getElementById("copy-btn").style.display = "";
    document.getElementById("copy-btn").onclick = () => {
      navigator.clipboard.writeText(qr.data);
      setStatus("QR code copied.");
    };
  } else {
    console.log("No QR Code found.");
  }
}

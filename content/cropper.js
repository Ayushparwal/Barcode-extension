if (!window.__tutorji_barcode_cropperInjected) {
  window.__tutorji_barcode_cropperInjected = true;

  window.__tutorji_barcode_startCrop = function () {
    if (document.getElementById("__tutorji-crop-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "__tutorji-crop-overlay";
    overlay.style.position = "fixed";
    overlay.style.left = "0";
    overlay.style.top = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.zIndex = "2147483647";
    overlay.style.background = "rgba(0,0,0,0.13)";
    overlay.style.cursor = "crosshair";
    overlay.style.userSelect = "none";
    document.body.appendChild(overlay);

    let startX, startY;
    let drawing = false;

    const cropBox = document.createElement("div");
    cropBox.style.position = "absolute";
    cropBox.style.border = "2px dashed #2e90fa";
    cropBox.style.background = "rgba(255,255,255,0.05)";
    cropBox.style.pointerEvents = "none";
    cropBox.style.display = "none";
    overlay.appendChild(cropBox);

    overlay.onmousedown = (e) => {
      drawing = true;
      startX = e.clientX;
      startY = e.clientY;
      cropBox.style.left = `${startX}px`;
      cropBox.style.top = `${startY}px`;
      cropBox.style.width = "0";
      cropBox.style.height = "0";
      cropBox.style.display = "";
    };

    overlay.onmousemove = (e) => {
      if (!drawing) return;
      let x = Math.min(e.clientX, startX);
      let y = Math.min(e.clientY, startY);
      let w = Math.abs(e.clientX - startX);
      let h = Math.abs(e.clientY - startY);
      cropBox.style.left = `${x}px`;
      cropBox.style.top = `${y}px`;
      cropBox.style.width = `${w}px`;
      cropBox.style.height = `${h}px`;
    };

    overlay.onmouseup = function (e) {
      drawing = false;
      cropBox.style.display = "none";
      overlay.remove();

      let x = Math.min(e.clientX, startX);
      let y = Math.min(e.clientY, startY);
      let w = Math.abs(e.clientX - startX);
      let h = Math.abs(e.clientY - startY);

      if (w < 8 || h < 8) return;

      chrome.runtime.sendMessage({
        type: "BARCODE_CROP_COORDS",
        x,
        y,
        width: w,
        height: h
      });
    };

    overlay.ondblclick = () => {
      overlay.remove();
    };
  };
}

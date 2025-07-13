# Barcode Scanner Chrome Extension

## Purpose
This Chrome extension allows users to crop a region of any web page and detect 1D barcodes (such as EAN, Code128, UPC, etc.) within the selected area. It is designed for quick, in-browser barcode scanning without the need for external tools.

## Features
- **Screen Crop UI:** Click the extension button to draw a crop box over the visible part of the web page.
- **Barcode Detection:** Detects and decodes 1D barcodes using QuaggaJS.
- **Popup UI:** Clean, user-friendly popup for controls and results.
- **Status Indicators:** Clear messages for detection status, errors, and results.
- **Multiple Barcode Support:** Handles multiple barcode formats.
- **Error Handling:** Gracefully handles cases where no barcode is found or the image is not clear.

## Technologies Used
- **JavaScript (ES6+)**
- **HTML5 & CSS3**
- **[QuaggaJS](https://github.com/ericblade/quagga2):** For 1D barcode detection
- **Chrome Extensions API (Manifest V3)**

## Setup Instructions

1. **Clone or Download the Repository**
   ```
   git clone https://github.com/Ayushparwal/Barcode-extension.git
   cd Barcode-extension
   ```

2. **Install Dependencies**
   - No build step is required. All dependencies are included as static files.

3. **Load the Extension in Chrome**
   - Open `chrome://extensions/` in your browser.
   - Enable **Developer mode** (top right).
   - Click **Load unpacked** and select the project folder.

4. **Usage**
   - Navigate to any web page with a visible barcode.
   - Click the extension icon in the Chrome toolbar.
   - Click the "Crop & Detect Barcode" button in the popup.
   - Draw a rectangle over the barcode area.
   - The detected barcode value will be displayed in the popup.



## Supported Barcode Formats
This extension supports the following 1D barcode formats via QuaggaJS:
- EAN-13
- EAN-8
- UPC-A
- UPC-E
- Code 128
- Code 39
- Code 39 VIN
- Codabar
- Interleaved 2 of 5 (i2of5)
- Standard 2 of 5 (2of5)
- Code 93

## Assumptions Made
- The user will select a region containing a clear, visible 1D barcode.
- The extension is intended for use on desktop Chrome browsers.
- No backend server is required; all processing is done client-side.
- Only 1D barcodes are supported (QR code and 2D barcode support can be added in the future).
- The extension does not collect or transmit any user data.

## License
This project is open-source and uses the MIT License.

---

**For questions or contributions, please open an issue or pull request on GitHub.** 

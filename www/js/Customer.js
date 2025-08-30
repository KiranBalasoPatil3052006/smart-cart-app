document.addEventListener("deviceready", function () {
  const scannedProducts = {};
  let lastScannedCode = null;
  let scanCooldown = false;

  const scanBtn = document.getElementById('scan-btn');
  const stopScanBtn = document.getElementById('stop-scan-btn');
  const scannerContainer = document.getElementById('scanner-container');
  const productList = document.getElementById('product-list');

  scanBtn.addEventListener('click', () => {
    scanBarcode();
    scanBtn.style.display = 'none';
    stopScanBtn.style.display = 'inline-block';
  });

  stopScanBtn.addEventListener('click', () => {
    // There is no continuous stream with this plugin; just toggle buttons
    scanBtn.style.display = 'inline-block';
    stopScanBtn.style.display = 'none';
  });

  function scanBarcode() {
    cordova.plugins.barcodeScanner.scan(
      function (result) {
        if (!result.cancelled) {
          const code = result.text;
          if (scanCooldown || code === lastScannedCode) return;
          scanCooldown = true;
          lastScannedCode = code;
          fetchProduct(code);
          setTimeout(() => scanCooldown = false, 1000);
        }
      },
      function (error) {
        alert("Scanning failed: " + error);
      },
      {
        preferFrontCamera: false,
        showFlipCameraButton: true,
        showTorchButton: true,
        torchOn: false,
        saveHistory: false,
        prompt: "Place a barcode inside the scan area",
        resultDisplayDuration: 500,
        formats: "UPC_A,UPC_E,EAN_8,EAN_13,CODE_128,CODE_39,QRCODE",
        orientation: "portrait",
        disableAnimations: true,
        disableSuccessBeep: false
      }
    );
  }

  function fetchProduct(barcode) {
    fetch(`${backendBaseURL}/product/${barcode}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.product) {
          showMessage("Product not found.");
          return;
        }
        const product = data.product;
        if (scannedProducts[barcode]) {
          scannedProducts[barcode].quantity += 1;
        } else {
          scannedProducts[barcode] = { ...product, quantity: 1, barcode };
        }
        renderProductList();
      })
      .catch(() => showMessage("Error fetching product."));
  }

  function renderProductList() {
    productList.innerHTML = '';
    let grandTotal = 0;
    Object.values(scannedProducts).forEach((p, i) => {
      const total = p.price * p.quantity;
      grandTotal += total;
      productList.innerHTML += `
        <tr>
          <td>${i + 1}</td><td>${p.name}</td><td>₹${p.price}</td>
          <td>
            <div class="qty-wrapper">
              <button onclick="updateQty('${p.barcode}', -1)">-</button>
              <span>${p.quantity}</span>
              <button onclick="updateQty('${p.barcode}', 1)">+</button>
            </div>
          </td>
          <td>₹${total}</td>
          <td><button onclick="removeProduct('${p.barcode}')">Delete</button></td>
        </tr>`;
    });
    document.getElementById('total-amount').textContent = grandTotal.toFixed(2);
    document.getElementById("payment-buttons").style.display = Object.keys(scannedProducts).length > 0 ? "flex" : "none";
  }

  window.updateQty = function (barcode, change) {
    if (scannedProducts[barcode]) {
      scannedProducts[barcode].quantity += change;
      if (scannedProducts[barcode].quantity <= 0) delete scannedProducts[barcode];
      renderProductList();
    }
  };

  window.removeProduct = function (barcode) {
    delete scannedProducts[barcode];
    renderProductList();
  };

  function showMessage(msg) {
    const box = document.getElementById("messageBox");
    box.textContent = msg;
    box.className = "error";
  }

});



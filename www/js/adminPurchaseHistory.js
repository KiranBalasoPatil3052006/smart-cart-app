document.addEventListener("deviceready", function () {
  // Sidebar toggle
  document.getElementById("menuToggle").addEventListener("click", toggleSidebar);

  let cashierInterval, historyInterval;

  async function loadAllCashierCodes() {
    try {
      const res = await fetch(`${backendBaseURL}/cashier-code-history`);
      const data = await res.json();
      if (!data.success) return;

      // Pending codes
      const pendingBody = document.getElementById("pending-code-body");
      const pendingCodes = data.history.filter(h => !h.verified);
      pendingBody.innerHTML = pendingCodes.length
        ? pendingCodes.map(h =>
          `<tr>
              <td>${h.mobile}</td>
              <td>${h.cashierCode}</td>
              <td>${new Date(h.createdAt).toLocaleString()}</td>
            </tr>`).join('')
        : `<tr><td colspan="3">No pending codes</td></tr>`;

      // Verified codes
      const verifiedBody = document.getElementById("verified-code-body");
      const verifiedCodes = data.history.filter(h => h.verified);
      verifiedBody.innerHTML = verifiedCodes.length
        ? verifiedCodes.map(h =>
          `<tr>
              <td>${h.mobile}</td>
              <td>${h.cashierCode}</td>
              <td>${h.verifiedAt ? new Date(h.verifiedAt).toLocaleString() : '--'}</td>
            </tr>`).join('')
        : `<tr><td colspan="3">No verified codes</td></tr>`;

    } catch (err) {
      console.error("Cashier code load error", err);
    }
  }

  function showCashierCodes() {
    document.getElementById("summary-title").style.display = "none";
    document.getElementById("history-title").style.display = "none";
    document.getElementById("summary-table").style.display = "none";
    document.getElementById("history-table").style.display = "none";
    document.getElementById("customer-title").style.display = "none";
    document.getElementById("customer-table").style.display = "none";
    document.getElementById("cashier-code-display").style.display = "block";
    document.getElementById("back-btn").style.display = "inline-block";
    loadAllCashierCodes();
    if (cashierInterval) clearInterval(cashierInterval);
    cashierInterval = setInterval(loadAllCashierCodes, 5000);
  }

  async function loadHistory() {
    try {
      const res = await fetch(`${backendBaseURL}/purchase-history`);
      const data = await res.json();
      if (!data.success) return;

      const historyBody = document.getElementById("history-body");
      const summaryBody = document.getElementById("summary-body");
      historyBody.innerHTML = "";
      summaryBody.innerHTML = "";

      data.history.forEach(entry => {
        let total = 0;
        entry.products.forEach(p => {
          historyBody.innerHTML += `
          <tr>
            <td>${entry.name}</td>
            <td>${p.barcode}</td>
            <td>${p.name}</td>
            <td>₹${p.price}</td>
            <td>${p.quantity}</td>
            <td>₹${p.price * p.quantity}</td>
            <td>${new Date(entry.date).toLocaleDateString()}</td>
          </tr>`;
          total += p.price * p.quantity;
        });
        summaryBody.innerHTML += `
        <tr>
          <td>${entry.name}</td>
          <td>${entry.mobile}</td>
          <td>${new Date(entry.date).toLocaleDateString()}</td>
          <td>${new Date(entry.date).toLocaleTimeString()}</td>
          <td>₹${total}</td>
          <td>${entry.paymentMethod} ${entry.paymentMethod === "cash" ? `(${entry.cashierCode})` : ""}</td>
        </tr>`;
      });
    } catch (err) {
      console.error("History load error", err);
    }
  }

  async function showCustomersOnly() {
    document.getElementById("summary-title").style.display = "none";
    document.getElementById("history-title").style.display = "none";
    document.getElementById("summary-table").style.display = "none";
    document.getElementById("history-table").style.display = "none";
    document.getElementById("customer-title").style.display = "block";
    document.getElementById("customer-table").style.display = "table";
    document.getElementById("cashier-code-display").style.display = "none";
    document.getElementById("back-btn").style.display = "inline-block";
    try {
      const res = await fetch(`${backendBaseURL}/customers`);
      const data = await res.json();
      if (!data.success) return;

      const tbody = document.getElementById("customer-body");
      tbody.innerHTML = "";
      data.customers.forEach(c => {
        tbody.innerHTML += `<tr><td>${c.name}</td><td>${c.mobile}</td><td>${c.email}</td></tr>`;
      });
    } catch (err) {
      console.error("Customer load error", err);
    }
  }

  function backToHome() {
    document.getElementById("summary-title").style.display = "block";
    document.getElementById("history-title").style.display = "block";
    document.getElementById("summary-table").style.display = "table";
    document.getElementById("history-table").style.display = "table";
    document.getElementById("customer-title").style.display = "none";
    document.getElementById("customer-table").style.display = "none";
    document.getElementById("cashier-code-display").style.display = "none";
    document.getElementById("back-btn").style.display = "none";
    loadHistory();
    if (cashierInterval) clearInterval(cashierInterval);
  }

  document.getElementById("cash-payment-btn").addEventListener("click", showCashierCodes);
  document.getElementById("back-btn").addEventListener("click", backToHome);

  // Load history and start interval
  loadHistory();
  if (historyInterval) clearInterval(historyInterval);
  historyInterval = setInterval(loadHistory, 5000);

  // Sidebar toggle function
  function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
    document.getElementById("mainContent").classList.toggle("active");
    document.querySelector(".menu-toggle").classList.toggle("open");
  }
});


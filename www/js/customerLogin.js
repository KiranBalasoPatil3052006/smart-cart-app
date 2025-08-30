function showMsg(text, ok = true) {
  const box = document.getElementById("messageBox");
  box.textContent = text;
  box.className = ok ? "ok" : "err";
  box.style.display = "block";
}

function clearMsg() {
  document.getElementById("messageBox").style.display = "none";
}

document.addEventListener("deviceready", function () {
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    clearMsg();

    const name = document.getElementById("name").value.trim();
    const number = document.getElementById("number").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !number || !email) {
      showMsg("All fields are required!", false);
      return;
    }

    // Save locally
    localStorage.setItem("customerName", name);
    localStorage.setItem("customerNumber", number);
    localStorage.setItem("customerEmail", email);

    fetch(`${backendBaseURL}/customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile: number, email })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showMsg("Login successful! Redirecting...", true);
          setTimeout(() => {
            window.location.href = "customer.html";
          }, 800);
        } else {
          showMsg("Error saving customer info!", false);
        }
      })
      .catch(err => {
        console.error("Error:", err);
        showMsg("Unable to connect to server!", false);
      });
  });
}, false);


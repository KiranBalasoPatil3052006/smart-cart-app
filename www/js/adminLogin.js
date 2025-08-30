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
  document.getElementById('adminLoginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearMsg();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      showMsg("Email and Password are required!", false);
      return;
    }

    try {
      const res = await fetch(`${backendBaseURL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showMsg(data.message || "Login successful", true);
        setTimeout(() => {
          window.location.href = 'admit.html';
        }, 800);
      } else {
        showMsg(data.message || "Invalid email or password", false);
      }
    } catch (error) {
      console.error(error);
      showMsg("Login failed. Server not reachable.", false);
    }
  });
}, false);


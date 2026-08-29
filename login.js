const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) {
    window.location.href = "fa-dashboard.html";
    return;
  }

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const button = document.getElementById("loginBtn");
    const message = document.getElementById("loginMessage");

    button.disabled = true;
    button.textContent = "Logging in...";
    message.textContent = "";

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user || {}));

      window.location.href = "fa-dashboard.html";
    } catch (error) {
      message.textContent = error.message || "Unable to login.";
    } finally {
      button.disabled = false;
      button.textContent = "Login";
    }
  });
});

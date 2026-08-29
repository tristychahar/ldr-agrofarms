const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Every FA page except login requires authentication.
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;
      if (!page) return;

      navItems.forEach((nav) => nav.classList.remove("active"));

      item.classList.add("active");

      switch (page) {
        case "dashboard":
          window.location.href = "fa-dashboard.html";
          break;
        case "farmers":
          window.location.href = "my-farmers.html";
          break;
        case "field-visits":
          window.location.href = "field-visits.html";
          break;
        case "attendance":
          window.location.href = "attendance.html";
          break;
        case "tasks":
          window.location.href = "tasks.html";
          break;
        case "meetings":
          window.location.href = "meetings.html";
          break;
        case "leave":
          window.location.href = "leave.html";
          break;
        case "notifications":
          window.location.href = "notifications.html";
          break;
        case "profile":
          window.location.href = "profile.html";
          break;
        default:
          console.log("Unknown page:", page);
      }
    });
  });

  // Logout
  document.querySelector("#logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  // Only the dashboard page has these elements.
  if (document.getElementById("totalFarmers")) {
    loadDashboard();
    setupQuickActions();
  }
});

async function apiGet(path) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
    throw new Error(result.message || "Authentication failed");
  }

  if (!response.ok) {
    throw new Error(result.message || `Request failed: ${response.status}`);
  }

  return result;
}

async function loadDashboard() {
  try {
    const [dashboard, farmers, tasks, notifications] = await Promise.all([
      apiGet("/dashboard/fa"),
      apiGet("/farmers/my"),
      apiGet("/tasks/my"),
      apiGet("/notifications/my")
    ]);

    const data = dashboard.data || {};
    const farmerList = farmers.data || [];
    const taskList = tasks.data || [];
    const notificationList = notifications.data || [];

    setText("totalFarmers", data.farmers?.total ?? farmerList.length);
    setText("totalVisits", data.today?.fieldVisits ?? 0);
    setText("totalMeetings", data.today?.meetings ?? 0);
    setText("pendingTasks", data.tasks?.pending ?? 0);

    renderUser(data);
    renderAttendance(data.attendance);
    renderRecentFarmers(farmerList.slice(0, 5));
    renderTasks(taskList.slice(0, 5));
    renderNotifications(notificationList.slice(0, 5));

    const unread = data.notifications?.unread ?? notificationList.filter(n => !n.isRead).length;
    const badge = document.querySelector(".notification-count");
    if (badge) badge.textContent = unread;
  } catch (error) {
    console.error("Dashboard loading error:", error);
    setText("totalFarmers", "--");
    setText("totalVisits", "--");
    setText("totalMeetings", "--");
    setText("pendingTasks", "--");
  }
}

function renderUser(data) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const name =
    data.employee?.fullName ||
    data.employee?.name ||
    storedUser.name ||
    "Field Assistant";

  document.querySelectorAll(".user-info strong").forEach(el => {
    el.textContent = name;
  });

  document.querySelectorAll(".page-heading p").forEach(el => {
    el.textContent = `Welcome back, ${name} 👋`;
  });

  const welcome = document.querySelector(".welcome-card h2");
  if (welcome) welcome.textContent = `Good morning, ${name}!`;

  const avatar = document.querySelector(".avatar");
  if (avatar) avatar.textContent = getInitials(name);
}

function renderAttendance(attendance) {
  const status = attendance?.checkOutTime
    ? "Checked Out"
    : attendance?.checkInTime
      ? "Checked In"
      : "Not Checked In";

  const badge = document.getElementById("attendanceStatus");
  if (badge) badge.textContent = status;

  const time = document.getElementById("attendanceTime");
  if (time) {
    const value = attendance?.checkInTime || attendance?.checkOutTime;
    time.textContent = value ? formatTime(value) : "--:--";
  }

  const message = document.getElementById("attendanceMessage");
  if (message) {
    message.textContent =
      status === "Checked In"
        ? "Your attendance is active for today."
        : status === "Checked Out"
          ? "Today's attendance is complete."
          : "Please check in to start your day.";
  }
}

function renderRecentFarmers(farmers) {
  const body = document.getElementById("farmersTableBody");
  if (!body) return;

  if (!farmers.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty-state">No farmer data available</td></tr>`;
    return;
  }

  body.innerHTML = farmers.map(farmer => `
    <tr>
      <td>${escapeHTML(farmer.farmerId || "-")}</td>
      <td>${escapeHTML(farmer.name || "-")}</td>
      <td>${escapeHTML(farmer.village || "-")}</td>
      <td>${escapeHTML(farmer.phone || "-")}</td>
      <td>${escapeHTML(farmer.status || "-")}</td>
    </tr>
  `).join("");
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  if (!list) return;

  if (!tasks.length) {
    list.innerHTML = `<div class="empty-state">No tasks available</div>`;
    return;
  }

  list.innerHTML = tasks.map(task => `
    <div class="task-item">
      <div>
        <strong>${escapeHTML(task.title || task.name || "Task")}</strong>
        <small>${escapeHTML(task.status || "PENDING")}</small>
      </div>
    </div>
  `).join("");
}

function renderNotifications(notifications) {
  const list = document.getElementById("notificationList");
  if (!list) return;

  if (!notifications.length) {
    list.innerHTML = `<div class="empty-state">No notifications available</div>`;
    return;
  }

  list.innerHTML = notifications.map(n => `
    <div class="notification-item">
      <div class="notification-icon">🔔</div>
      <div>
        <strong>${escapeHTML(n.title || "Notification")}</strong>
        <p>${escapeHTML(n.message || "")}</p>
        <small>${n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}</small>
      </div>
    </div>
  `).join("");
}

function setupQuickActions() {
  const actions = document.querySelectorAll(".quick-action");
  actions.forEach(action => {
    action.addEventListener("click", () => {
      const text = action.querySelector("strong")?.textContent || "";
      if (text.includes("Add Farmer")) window.location.href = "my-farmers.html";
      else if (text.includes("Field Visit")) window.location.href = "field-visits.html";
      else if (text.includes("Meeting")) window.location.href = "meetings.html";
      else if (text.includes("Tasks")) window.location.href = "tasks.html";
    });
  });

  document.querySelectorAll(".view-all-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const heading = btn.closest(".dashboard-card")?.querySelector("h3")?.textContent || "";
      if (heading.includes("Farmers")) window.location.href = "my-farmers.html";
      else if (heading.includes("Tasks")) window.location.href = "tasks.html";
      else if (heading.includes("Notifications")) window.location.href = "notifications.html";
    });
  });

  document.querySelector(".icon-btn")?.addEventListener("click", () => {
    window.location.href = "notifications.html";
  });

  document.getElementById("attendanceBtn")?.addEventListener("click", () => {
    window.location.href = "attendance.html";
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getInitials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "FA";
}

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--:--"
    : date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

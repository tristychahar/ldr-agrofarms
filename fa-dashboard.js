document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;

      if (!page) return;

      // Active menu
      navItems.forEach((nav) => {
        nav.classList.remove("active");
      });

      item.classList.add("active");

      // Page navigation
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

        case "notifications":
          window.location.href = "notifications.html";
          break;

        default:
          console.log("Unknown page:", page);
      }
    });
  });


  // Logout
  const logoutBtn = document.querySelector("#logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "login.html";
    });
  }
});
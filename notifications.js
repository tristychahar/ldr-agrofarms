document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5000/api";

  const notificationList =
    document.getElementById("notificationList");

  const notificationSearch =
    document.getElementById("notificationSearch");

  const notificationTypeFilter =
    document.getElementById("notificationTypeFilter");

  const notificationReadFilter =
    document.getElementById("notificationReadFilter");

  const notificationCount =
    document.getElementById("notificationCount");

  const markAllReadBtn =
    document.getElementById("markAllReadBtn");

  const notificationModal =
    document.getElementById("notificationModal");

  const closeNotificationModal =
    document.getElementById("closeNotificationModal");

  const closeNotificationBtn =
    document.getElementById("closeNotificationBtn");

  const notificationModalTitle =
    document.getElementById("notificationModalTitle");

  const notificationDetailIcon =
    document.getElementById("notificationDetailIcon");

  const notificationDetailType =
    document.getElementById("notificationDetailType");

  const notificationDetailTitle =
    document.getElementById("notificationDetailTitle");

  const notificationDetailMessage =
    document.getElementById("notificationDetailMessage");

  const notificationDetailDate =
    document.getElementById("notificationDetailDate");


  let notifications = [];


  /* =====================================================
     AUTH
     ===================================================== */

  function getToken() {
    return localStorage.getItem("token");
  }


  /* =====================================================
     LOAD NOTIFICATIONS
     ===================================================== */

  async function loadNotifications() {

    const token = getToken();

    if (!token) {
      renderEmptyState(
        "Please login to view notifications."
      );
      return;
    }


    try {

      /*
       * Expected:
       * GET /api/notifications/my
       */

      const response = await fetch(
        `${API_BASE_URL}/notifications/my`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          }
        }
      );


      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to load notifications."
        );
      }


      notifications =
        result.data || [];


      updateStats();

      renderNotifications();

    } catch (error) {

      console.error(
        "Load notifications error:",
        error
      );

      renderEmptyState(
        "Unable to load notifications."
      );
    }
  }


  /* =====================================================
     RENDER
     ===================================================== */

  function renderNotifications() {

    const searchTerm =
      notificationSearch?.value
        .trim()
        .toLowerCase() || "";


    const selectedType =
      notificationTypeFilter?.value ||
      "ALL";


    const selectedRead =
      notificationReadFilter?.value ||
      "ALL";


    const filtered =
      notifications.filter(
        (notification) => {

          const title =
            notification.title || "";

          const message =
            notification.message || "";

          const type =
            notification.type || "INFO";

          const isRead =
            Boolean(
              notification.isRead
            );


          const matchesSearch =
            !searchTerm ||
            title
              .toLowerCase()
              .includes(searchTerm) ||
            message
              .toLowerCase()
              .includes(searchTerm);


          const matchesType =
            selectedType === "ALL" ||
            type === selectedType;


          const matchesRead =
            selectedRead === "ALL" ||
            (
              selectedRead === "UNREAD" &&
              !isRead
            ) ||
            (
              selectedRead === "READ" &&
              isRead
            );


          return (
            matchesSearch &&
            matchesType &&
            matchesRead
          );
        }
      );


    if (notificationCount) {

      notificationCount.textContent =
        `${filtered.length} Notification${
          filtered.length === 1
            ? ""
            : "s"
        }`;
    }


    if (filtered.length === 0) {

      renderEmptyState(
        notifications.length === 0
          ? "No notifications yet."
          : "No notifications match your filters."
      );

      return;
    }


    notificationList.innerHTML =
      filtered
        .map(
          (notification) =>
            createNotificationHTML(
              notification
            )
        )
        .join("");
  }


  /* =====================================================
     NOTIFICATION HTML
     ===================================================== */

  function createNotificationHTML(
    notification
  ) {

    const type =
      notification.type ||
      "INFO";


    const isRead =
      Boolean(
        notification.isRead
      );


    const icon =
      getNotificationIcon(
        type
      );


    const iconClass =
      type
        .toLowerCase();


    return `
      <div
        class="notification-item ${
          isRead
            ? ""
            : "unread"
        }"
        data-id="${notification._id}"
      >

        <div
          class="notification-icon ${iconClass}"
        >
          ${icon}
        </div>


        <div class="notification-content">

          <span class="notification-type">
            ${escapeHTML(
              formatStatus(type)
            )}
          </span>

          <h4>
            ${escapeHTML(
              notification.title ||
              "Notification"
            )}
          </h4>

          <p>
            ${escapeHTML(
              notification.message ||
              ""
            )}
          </p>

          <small>
            ${formatDateTime(
              notification.createdAt
            )}
          </small>

        </div>


        ${
          !isRead
            ? `
              <span
                class="unread-dot"
                title="Unread"
              ></span>
            `
            : ""
        }

      </div>
    `;
  }


  /* =====================================================
     ICONS
     ===================================================== */

  function getNotificationIcon(
    type
  ) {

    const icons = {

      INFO: "ℹ️",

      SUCCESS: "✓",

      WARNING: "⚠️",

      ATTENDANCE: "🕘",

      EMPLOYEE: "👤",

      FARMER: "🌾",

      SYSTEM: "⚙️"

    };


    return (
      icons[type] ||
      "🔔"
    );
  }


  /* =====================================================
     STATS
     ===================================================== */

  function updateStats() {

    const total =
      notifications.length;


    const unread =
      notifications.filter(
        (notification) =>
          !notification.isRead
      ).length;


    const warnings =
      notifications.filter(
        (notification) =>
          notification.type ===
          "WARNING"
      ).length;


    const updates =
      notifications.filter(
        (notification) =>
          notification.type ===
            "SUCCESS" ||
          notification.type ===
            "INFO"
      ).length;


    setText(
      "totalNotifications",
      total
    );

    setText(
      "unreadNotifications",
      unread
    );

    setText(
      "warningNotifications",
      warnings
    );

    setText(
      "successNotifications",
      updates
    );
  }


  /* =====================================================
     OPEN NOTIFICATION
     ===================================================== */

  notificationList?.addEventListener(
    "click",
    async (event) => {

      const item =
        event.target.closest(
          ".notification-item"
        );


      if (!item) {
        return;
      }


      const id =
        item.dataset.id;


      const notification =
        notifications.find(
          (item) =>
            item._id === id
        );


      if (!notification) {
        return;
      }


      openNotificationModal(
        notification
      );


      if (!notification.isRead) {

        await markAsRead(
          notification._id
        );
      }
    }
  );


  /* =====================================================
     OPEN MODAL
     ===================================================== */

  function openNotificationModal(
    notification
  ) {

    const type =
      notification.type ||
      "INFO";


    notificationModalTitle.textContent =
      notification.title ||
      "Notification";


    notificationDetailIcon.textContent =
      getNotificationIcon(
        type
      );


    notificationDetailType.textContent =
      formatStatus(type);


    notificationDetailTitle.textContent =
      notification.title ||
      "-";


    notificationDetailMessage.textContent =
      notification.message ||
      "-";


    notificationDetailDate.textContent =
      formatDateTime(
        notification.createdAt
      );


    notificationModal.classList.add(
      "show"
    );
  }


  /* =====================================================
     CLOSE MODAL
     ===================================================== */

  function closeModal() {

    notificationModal.classList.remove(
      "show"
    );
  }


  closeNotificationModal?.addEventListener(
    "click",
    closeModal
  );


  closeNotificationBtn?.addEventListener(
    "click",
    closeModal
  );


  notificationModal?.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        notificationModal
      ) {
        closeModal();
      }

    }
  );


  /* =====================================================
     MARK ONE AS READ
     ===================================================== */

  async function markAsRead(
    notificationId
  ) {

    const token =
      getToken();


    if (!token) {
      return;
    }


    try {

      /*
       * Expected:
       * PATCH /api/notifications/:id/read
       */

      const response =
        await fetch(
          `${API_BASE_URL}/notifications/${notificationId}/read`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json"
            }
          }
        );


      if (!response.ok) {
        return;
      }


      const notification =
        notifications.find(
          (item) =>
            item._id ===
            notificationId
        );


      if (notification) {

        notification.isRead =
          true;
      }


      updateStats();

      renderNotifications();

    } catch (error) {

      console.error(
        "Mark notification read error:",
        error
      );
    }
  }


  /* =====================================================
     MARK ALL READ
     ===================================================== */

  markAllReadBtn?.addEventListener(
    "click",
    async () => {

      const token =
        getToken();


      if (!token) {

        alert(
          "Please login first."
        );

        return;
      }


      const unread =
        notifications.filter(
          (notification) =>
            !notification.isRead
        );


      if (unread.length === 0) {

        alert(
          "All notifications are already read."
        );

        return;
      }


      markAllReadBtn.disabled =
        true;

      markAllReadBtn.textContent =
        "Marking...";


      try {

        // Backend exposes PATCH /api/notifications/:id/read,
        // so mark each unread notification individually.
        const results = await Promise.all(
          unread.map((notification) =>
            fetch(
              `${API_BASE_URL}/notifications/${notification._id || notification.id}/read`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            )
          )
        );

        const failed = results.find((response) => !response.ok);
        if (failed) {
          const result = await failed.json().catch(() => ({}));
          throw new Error(
            result.message ||
            "Failed to mark notifications as read."
          );
        }


        notifications =
          notifications.map(
            (notification) => ({
              ...notification,
              isRead: true
            })
          );


        updateStats();

        renderNotifications();


        alert(
          "All notifications marked as read."
        );

      } catch (error) {

        console.error(
          "Mark all read error:",
          error
        );


        alert(
          error.message ||
          "Failed to mark notifications as read."
        );

      } finally {

        markAllReadBtn.disabled =
          false;

        markAllReadBtn.textContent =
          "✓ Mark All as Read";
      }
    }
  );


  /* =====================================================
     SEARCH / FILTER
     ===================================================== */

  notificationSearch?.addEventListener(
    "input",
    renderNotifications
  );


  notificationTypeFilter?.addEventListener(
    "change",
    renderNotifications
  );


  notificationReadFilter?.addEventListener(
    "change",
    renderNotifications
  );


  /* =====================================================
     HELPERS
     ===================================================== */

  function setText(
    id,
    value
  ) {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        value;
    }
  }


  function formatStatus(
    value
  ) {

    return String(value)
      .replaceAll(
        "_",
        " "
      )
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  }


  function formatDateTime(
    value
  ) {

    if (!value) {
      return "-";
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }


    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }


  function escapeHTML(
    value = ""
  ) {

    return String(value)
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }


  function renderEmptyState(
    message
  ) {

    if (!notificationList) {
      return;
    }


    notificationList.innerHTML = `
      <div class="empty-notifications">

        <div class="empty-icon">
          🔔
        </div>

        <strong>
          ${escapeHTML(
            message
          )}
        </strong>

        <p>
          Your notifications will appear here.
        </p>

      </div>
    `;
  }


  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  loadNotifications();
});
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5000/api";

  const checkInBtn = document.getElementById("checkInBtn");
  const checkOutBtn = document.getElementById("checkOutBtn");
  const getLocationBtn = document.getElementById("getLocationBtn");

  const attendanceModal =
    document.getElementById("attendanceModal");

  const closeAttendanceModal =
    document.getElementById("closeAttendanceModal");

  const cancelAttendanceBtn =
    document.getElementById("cancelAttendanceBtn");

  const confirmAttendanceBtn =
    document.getElementById("confirmAttendanceBtn");

  const attendanceModalTitle =
    document.getElementById("attendanceModalTitle");

  const confirmLocationText =
    document.getElementById("confirmLocationText");

  const attendanceStatus =
    document.getElementById("attendanceStatus");

  const locationStatus =
    document.getElementById("locationStatus");

  const attendanceTableBody =
    document.getElementById("attendanceTableBody");

  const attendanceMonth =
    document.getElementById("attendanceMonth");


  let attendanceRecords = [];

  let currentLocation = {
    latitude: null,
    longitude: null,
    accuracy: null
  };

  let pendingAction = null;


  /* =====================================================
     AUTH
     ===================================================== */

  function getToken() {
    return localStorage.getItem("token");
  }


  /* =====================================================
     TODAY DATE
     ===================================================== */

  function setTodayDate() {

    const element =
      document.getElementById("todayDate");

    if (!element) return;

    const today = new Date();

    element.textContent =
      today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
  }


  /* =====================================================
     LOCATION
     ===================================================== */

  function getCurrentLocation() {

    if (!navigator.geolocation) {

      locationStatus.textContent =
        "Geolocation is not supported by this browser.";

      return;
    }


    locationStatus.textContent =
      "Getting your current location...";


    navigator.geolocation.getCurrentPosition(

      (position) => {

        currentLocation = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy
        };


        locationStatus.textContent =
          `Location captured • Accuracy: ${
            Math.round(
              position.coords.accuracy
            )
          }m`;

      },

      (error) => {

        console.error(
          "Location error:",
          error
        );


        currentLocation = {
          latitude: null,
          longitude: null,
          accuracy: null
        };


        locationStatus.textContent =
          "Location permission was not granted.";
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }


  getLocationBtn?.addEventListener(
    "click",
    getCurrentLocation
  );


  /* =====================================================
     MODAL
     ===================================================== */

  function openAttendanceModal(action) {

    pendingAction = action;


    if (action === "CHECK_IN") {

      attendanceModalTitle.textContent =
        "Confirm Check In";

      confirmLocationText.textContent =
        "Your current location will be recorded with your check-in.";

    } else {

      attendanceModalTitle.textContent =
        "Confirm Check Out";

      confirmLocationText.textContent =
        "Your current location will be recorded with your check-out.";
    }


    attendanceModal.classList.add("show");


    getCurrentLocation();
  }


  function closeModal() {

    attendanceModal.classList.remove(
      "show"
    );

    pendingAction = null;
  }


  checkInBtn?.addEventListener(
    "click",
    () => {
      openAttendanceModal("CHECK_IN");
    }
  );


  checkOutBtn?.addEventListener(
    "click",
    () => {
      openAttendanceModal("CHECK_OUT");
    }
  );


  closeAttendanceModal?.addEventListener(
    "click",
    closeModal
  );


  cancelAttendanceBtn?.addEventListener(
    "click",
    closeModal
  );


  attendanceModal?.addEventListener(
    "click",
    (event) => {

      if (
        event.target === attendanceModal
      ) {
        closeModal();
      }

    }
  );


  /* =====================================================
     CHECK IN / CHECK OUT
     ===================================================== */

  confirmAttendanceBtn?.addEventListener(
    "click",
    async () => {

      if (!pendingAction) {
        return;
      }


      const token =
        getToken();


      if (!token) {

        alert(
          "Please login first."
        );

        closeModal();

        return;
      }


      if (
        currentLocation.latitude === null ||
        currentLocation.longitude === null
      ) {

        alert(
          "Please allow location access before marking attendance."
        );

        return;
      }


      confirmAttendanceBtn.disabled =
        true;

      confirmAttendanceBtn.textContent =
        "Processing...";


      try {

        if (
          pendingAction ===
          "CHECK_IN"
        ) {

          await checkIn(token);

        } else {

          await checkOut(token);

        }

      } catch (error) {

        console.error(
          "Attendance error:",
          error
        );

        alert(
          error.message ||
          "Attendance operation failed."
        );

      } finally {

        confirmAttendanceBtn.disabled =
          false;

        confirmAttendanceBtn.textContent =
          "Confirm";
      }
    }
  );


  /* =====================================================
     CHECK IN API
     ===================================================== */

  async function checkIn(token) {

    /*
     * Expected:
     * POST /api/attendance/check-in
     */

    const response =
      await fetch(
        `${API_BASE_URL}/attendance/check-in`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            location: {
              latitude:
                currentLocation.latitude,

              longitude:
                currentLocation.longitude,

              accuracy:
                currentLocation.accuracy
            }
          })
        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Check-in failed."
      );
    }


    alert(
      "Check-in successful."
    );


    closeModal();


    await loadAttendance();
  }


  /* =====================================================
     CHECK OUT API
     ===================================================== */

  async function checkOut(token) {

    /*
     * Expected:
     * POST /api/attendance/check-out
     */

    const response =
      await fetch(
        `${API_BASE_URL}/attendance/check-out`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            location: {
              latitude:
                currentLocation.latitude,

              longitude:
                currentLocation.longitude,

              accuracy:
                currentLocation.accuracy
            }
          })
        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Check-out failed."
      );
    }


    alert(
      "Check-out successful."
    );


    closeModal();


    await loadAttendance();
  }


  /* =====================================================
     LOAD ATTENDANCE
     ===================================================== */

  async function loadAttendance() {

    const token =
      getToken();


    if (!token) {

      renderEmptyState(
        "Please login to view attendance."
      );

      return;
    }


    try {

      /*
       * Expected:
       * GET /api/attendance/today
       */

      const response =
        await fetch(
          `${API_BASE_URL}/attendance/today`,
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
          "Failed to load attendance."
        );
      }


      attendanceRecords =
        result.data || [];


      updateStats();

      updateTodayStatus();

      renderAttendance();

    } catch (error) {

      console.error(
        "Load attendance error:",
        error
      );


      renderEmptyState(
        "Unable to load attendance records."
      );
    }
  }


  /* =====================================================
     TODAY STATUS
     ===================================================== */

  function updateTodayStatus() {

    const today =
      new Date();


    const todayRecord =
      attendanceRecords.find(
        (record) => {

          const date =
            new Date(
              record.date
            );

          return (
            date.getFullYear() ===
              today.getFullYear() &&

            date.getMonth() ===
              today.getMonth() &&

            date.getDate() ===
              today.getDate()
          );
        }
      );


    if (!todayRecord) {

      attendanceStatus.textContent =
        "Attendance not marked";

      checkInBtn.disabled =
        false;

      checkOutBtn.disabled =
        true;

      return;
    }


    if (
      todayRecord.checkIn?.time &&
      !todayRecord.checkOut?.time
    ) {

      attendanceStatus.textContent =
        "Checked in • Working";

      checkInBtn.disabled =
        true;

      checkOutBtn.disabled =
        false;

      return;
    }


    if (
      todayRecord.checkIn?.time &&
      todayRecord.checkOut?.time
    ) {

      attendanceStatus.textContent =
        "Attendance completed";

      checkInBtn.disabled =
        true;

      checkOutBtn.disabled =
        true;

      return;
    }


    attendanceStatus.textContent =
      formatStatus(
        todayRecord.status ||
        "PRESENT"
      );
  }


  /* =====================================================
     RENDER ATTENDANCE
     ===================================================== */

  function renderAttendance() {

    if (
      attendanceRecords.length === 0
    ) {

      renderEmptyState(
        "No attendance records yet."
      );

      return;
    }


    const selectedMonth =
      attendanceMonth?.value ||
      "current";


    const filteredRecords =
      filterByMonth(
        attendanceRecords,
        selectedMonth
      );


    if (
      filteredRecords.length === 0
    ) {

      renderEmptyState(
        "No attendance records for this period."
      );

      return;
    }


    attendanceTableBody.innerHTML =
      filteredRecords
        .map(
          (record) => {

            const status =
              record.status ||
              "PRESENT";


            const statusClass =
              status
                .toLowerCase()
                .replaceAll(
                  "_",
                  "-"
                );


            return `
              <tr>

                <td>
                  ${formatDate(
                    record.date
                  )}
                </td>


                <td>

                  <span
                    class="attendance-status ${statusClass}"
                  >
                    ${formatStatus(
                      status
                    )}
                  </span>

                </td>


                <td>

                  <span class="attendance-time">
                    ${formatTime(
                      record.checkIn?.time
                    )}
                  </span>

                </td>


                <td>

                  <span class="attendance-time">
                    ${formatTime(
                      record.checkOut?.time
                    )}
                  </span>

                </td>


                <td>

                  <span class="working-hours">
                    ${formatWorkingHours(
                      record.workingHours
                    )}
                  </span>

                </td>


                <td>
                  ${escapeHTML(
                    record.remarks ||
                    "-"
                  )}
                </td>

              </tr>
            `;
          }
        )
        .join("");
  }


  /* =====================================================
     FILTER MONTH
     ===================================================== */

  function filterByMonth(
    records,
    selected
  ) {

    const now =
      new Date();


    let targetYear =
      now.getFullYear();

    let targetMonth =
      now.getMonth();


    if (
      selected ===
      "previous"
    ) {

      targetMonth--;

      if (targetMonth < 0) {

        targetMonth = 11;

        targetYear--;
      }
    }


    return records.filter(
      (record) => {

        const date =
          new Date(
            record.date
          );


        return (
          date.getFullYear() ===
            targetYear &&

          date.getMonth() ===
            targetMonth
        );
      }
    );
  }


  attendanceMonth?.addEventListener(
    "change",
    renderAttendance
  );


  /* =====================================================
     STATS
     ===================================================== */

  function updateStats() {

    const present =
      attendanceRecords.filter(
        (record) =>
          record.status ===
          "PRESENT"
      ).length;


    const halfDay =
      attendanceRecords.filter(
        (record) =>
          record.status ===
          "HALF_DAY"
      ).length;


    const leave =
      attendanceRecords.filter(
        (record) =>
          record.status ===
          "LEAVE"
      ).length;


    const hours =
      attendanceRecords.reduce(
        (total, record) => {

          return (
            total +
            (
              Number(
                record.workingHours
              ) || 0
            )
          );

        },
        0
      );


    setText(
      "presentDays",
      present
    );

    setText(
      "halfDays",
      halfDay
    );

    setText(
      "leaveDays",
      leave
    );

    setText(
      "workingHours",
      `${hours.toFixed(1)}h`
    );
  }


  /* =====================================================
     EMPTY STATE
     ===================================================== */

  function renderEmptyState(
    message
  ) {

    if (!attendanceTableBody) {
      return;
    }


    attendanceTableBody.innerHTML = `
      <tr>

        <td
          colspan="6"
          class="empty-attendance"
        >

          <div class="empty-icon">
            🕘
          </div>

          <strong>
            ${escapeHTML(
              message
            )}
          </strong>

          <p>
            Your attendance history will appear here.
          </p>

        </td>

      </tr>
    `;
  }


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


  function formatDate(
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


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }


  function formatTime(
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


    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }


  function formatWorkingHours(
    hours
  ) {

    const value =
      Number(hours);


    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return "0h";
    }


    const wholeHours =
      Math.floor(value);


    const minutes =
      Math.round(
        (value - wholeHours) * 60
      );


    if (wholeHours === 0) {
      return `${minutes}m`;
    }


    if (minutes === 0) {
      return `${wholeHours}h`;
    }


    return `${wholeHours}h ${minutes}m`;
  }


  function formatStatus(
    status
  ) {

    return String(status)
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


  /* =====================================================
     INITIALIZE
     ===================================================== */

  setTodayDate();

  loadAttendance();

});
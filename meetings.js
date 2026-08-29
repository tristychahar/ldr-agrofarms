document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5000/api";

  const meetingModal = document.getElementById("meetingModal");
  const scheduleMeetingBtn =
    document.getElementById("scheduleMeetingBtn");
  const closeMeetingModal =
    document.getElementById("closeMeetingModal");
  const cancelMeetingBtn =
    document.getElementById("cancelMeetingBtn");

  const meetingForm =
    document.getElementById("meetingForm");

  const meetingFarmer =
    document.getElementById("meetingFarmer");

  const meetingDate =
    document.getElementById("meetingDate");

  const meetingTime =
    document.getElementById("meetingTime");

  const meetingPurpose =
    document.getElementById("meetingPurpose");

  const meetingLocation =
    document.getElementById("meetingLocation");

  const meetingRemarks =
    document.getElementById("meetingRemarks");

  const meetingSearch =
    document.getElementById("meetingSearch");

  const meetingStatusFilter =
    document.getElementById("meetingStatusFilter");

  const meetingDateFilter =
    document.getElementById("meetingDateFilter");

  const meetingsTableBody =
    document.getElementById("meetingsTableBody");


  let meetings = [];
  let farmers = [];


  /* ================= AUTH ================= */

  function getToken() {
    return localStorage.getItem("token");
  }


  /* ================= MODAL ================= */

  function openMeetingModal() {
    meetingModal?.classList.add("show");

    setMinimumDate();

    loadFarmers();
  }


  function closeMeetingModalWindow() {
    meetingModal?.classList.remove("show");

    meetingForm?.reset();
  }


  scheduleMeetingBtn?.addEventListener(
    "click",
    openMeetingModal
  );


  closeMeetingModal?.addEventListener(
    "click",
    closeMeetingModalWindow
  );


  cancelMeetingBtn?.addEventListener(
    "click",
    closeMeetingModalWindow
  );


  meetingModal?.addEventListener(
    "click",
    (event) => {
      if (event.target === meetingModal) {
        closeMeetingModalWindow();
      }
    }
  );


  /* ================= MIN DATE ================= */

  function setMinimumDate() {

    if (!meetingDate) return;

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    meetingDate.min =
      `${year}-${month}-${day}`;
  }


  /* ================= LOAD FARMERS ================= */

  async function loadFarmers() {

    try {

      const token =
        getToken();

      if (!token) {
        console.warn(
          "Authentication token not found."
        );
        return;
      }


      const response =
        await fetch(
          `${API_BASE_URL}/farmers/my`,
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
          "Failed to load farmers"
        );
      }


      farmers =
        result.data || [];


      populateFarmerDropdown();

    } catch (error) {

      console.error(
        "Load farmers error:",
        error
      );

    }
  }


  /* ================= FARMER DROPDOWN ================= */

  function populateFarmerDropdown() {

    if (!meetingFarmer) return;


    meetingFarmer.innerHTML = `
      <option value="">
        Select Farmer
      </option>
    `;


    farmers
      .filter(
        (farmer) =>
          farmer.status === "ACTIVE"
      )
      .forEach((farmer) => {

        const option =
          document.createElement("option");

        option.value =
          farmer._id;

        option.textContent =
          `${farmer.name} (${farmer.farmerId})`;

        meetingFarmer.appendChild(
          option
        );
      });
  }


  /* ================= LOAD MEETINGS ================= */

  async function loadMeetings() {

    try {

      const token =
        getToken();


      if (!token) {

        renderEmptyState(
          "Please login to view meetings."
        );

        return;
      }


      /*
       * Expected backend endpoint:
       * GET /api/meetings/my
       */

      const response =
        await fetch(
          `${API_BASE_URL}/meetings/my`,
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
          "Failed to load meetings"
        );
      }


      meetings =
        result.data || [];


      updateStats();

      renderMeetings();

    } catch (error) {

      console.error(
        "Load meetings error:",
        error
      );


      renderEmptyState(
        "Unable to load meetings."
      );
    }
  }


  /* ================= RENDER MEETINGS ================= */

  function renderMeetings() {

    const searchTerm =
      meetingSearch?.value
        .trim()
        .toLowerCase() || "";


    const selectedStatus =
      meetingStatusFilter?.value ||
      "ALL";


    const selectedDate =
      meetingDateFilter?.value ||
      "ALL";


    const filteredMeetings =
      meetings.filter(
        (meeting) => {

          const farmer =
            meeting.farmer ||
            meeting.relatedFarmer ||
            {};


          const farmerName =
            farmer.name || "";


          const purpose =
            meeting.purpose || "";


          const location =
            meeting.location || "";


          const matchesSearch =
            !searchTerm ||
            farmerName
              .toLowerCase()
              .includes(searchTerm) ||
            purpose
              .toLowerCase()
              .includes(searchTerm) ||
            location
              .toLowerCase()
              .includes(searchTerm);


          const status =
            meeting.status ||
            "SCHEDULED";


          const matchesStatus =
            selectedStatus === "ALL" ||
            status === selectedStatus;


          const matchesDate =
            matchesDateFilter(
              meeting,
              selectedDate
            );


          return (
            matchesSearch &&
            matchesStatus &&
            matchesDate
          );
        }
      );


    const meetingCount =
      document.getElementById(
        "meetingCount"
      );


    if (meetingCount) {

      meetingCount.textContent =
        `${filteredMeetings.length} Meeting${
          filteredMeetings.length === 1
            ? ""
            : "s"
        }`;
    }


    if (
      filteredMeetings.length === 0
    ) {

      renderEmptyState(
        meetings.length === 0
          ? "No meetings scheduled yet."
          : "No meetings match your filters."
      );

      return;
    }


    meetingsTableBody.innerHTML =
      filteredMeetings
        .map(
          (meeting) => {

            const farmer =
              meeting.farmer ||
              meeting.relatedFarmer ||
              {};


            const farmerName =
              farmer.name ||
              "Unknown Farmer";


            const farmerId =
              farmer.farmerId ||
              "-";


            const status =
              meeting.status ||
              "SCHEDULED";


            const statusClass =
              status
                .toLowerCase()
                .replaceAll(
                  "_",
                  "-"
                );


            const meetingDateValue =
              meeting.meetingDate ||
              meeting.date ||
              meeting.scheduledAt ||
              meeting.createdAt;


            return `
              <tr>

                <td>

                  <div class="meeting-farmer">

                    <div class="meeting-farmer-avatar">
                      ${getInitials(
                        farmerName
                      )}
                    </div>

                    <div>

                      <strong>
                        ${escapeHTML(
                          farmerName
                        )}
                      </strong>

                      <small>
                        ${escapeHTML(
                          farmerId
                        )}
                      </small>

                    </div>

                  </div>

                </td>


                <td>
                  <span class="meeting-date">
                    ${formatDate(
                      meetingDateValue
                    )}
                  </span>
                </td>


                <td>
                  <span class="meeting-time">
                    ${formatTime(
                      meeting.meetingTime ||
                      meeting.time ||
                      meetingDateValue
                    )}
                  </span>
                </td>


                <td>
                  ${escapeHTML(
                    meeting.purpose ||
                    "-"
                  )}
                </td>


                <td>

                  <span class="meeting-location">

                    <span>📍</span>

                    ${escapeHTML(
                      meeting.location ||
                      "Not specified"
                    )}

                  </span>

                </td>


                <td>

                  <span
                    class="meeting-status ${statusClass}"
                  >
                    ${formatStatus(
                      status
                    )}
                  </span>

                </td>


                <td>

                  <button
                    class="meeting-action"
                    title="View Meeting"
                    data-id="${meeting._id}"
                  >
                    👁️
                  </button>

                </td>

              </tr>
            `;
          }
        )
        .join("");
  }


  /* ================= DATE FILTER ================= */

  function matchesDateFilter(
    meeting,
    filter
  ) {

    if (filter === "ALL") {
      return true;
    }


    const value =
      meeting.meetingDate ||
      meeting.date ||
      meeting.scheduledAt ||
      meeting.createdAt;


    if (!value) {
      return false;
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return false;
    }


    const today =
      new Date();


    const start =
      new Date(today);

    start.setHours(
      0,
      0,
      0,
      0
    );


    const end =
      new Date(today);

    end.setHours(
      23,
      59,
      59,
      999
    );


    if (filter === "TODAY") {

      return (
        date >= start &&
        date <= end
      );
    }


    if (filter === "UPCOMING") {

      return date > end;
    }


    if (filter === "PAST") {

      return date < start;
    }


    return true;
  }


  /* ================= EMPTY STATE ================= */

  function renderEmptyState(
    message
  ) {

    if (!meetingsTableBody) {
      return;
    }


    meetingsTableBody.innerHTML = `
      <tr>

        <td
          colspan="7"
          class="empty-meetings"
        >

          <div class="empty-icon">
            🤝
          </div>

          <strong>
            ${escapeHTML(
              message
            )}
          </strong>

          <p>
            Your farmer meetings will appear here.
          </p>

        </td>

      </tr>
    `;
  }


  /* ================= STATS ================= */

  function updateStats() {

    const total =
      meetings.length;


    const now =
      new Date();


    const start =
      new Date(now);

    start.setHours(
      0,
      0,
      0,
      0
    );


    const end =
      new Date(now);

    end.setHours(
      23,
      59,
      59,
      999
    );


    const getMeetingDate =
      (meeting) =>
        new Date(
          meeting.meetingDate ||
          meeting.date ||
          meeting.scheduledAt ||
          meeting.createdAt
        );


    const todayCount =
      meetings.filter(
        (meeting) => {

          const date =
            getMeetingDate(
              meeting
            );

          return (
            date >= start &&
            date <= end
          );
        }
      ).length;


    const completed =
      meetings.filter(
        (meeting) =>
          meeting.status ===
          "COMPLETED"
      ).length;


    const upcoming =
      meetings.filter(
        (meeting) => {

          const date =
            getMeetingDate(
              meeting
            );

          return (
            date > end &&
            meeting.status !==
              "CANCELLED"
          );
        }
      ).length;


    setText(
      "totalMeetings",
      total
    );

    setText(
      "todayMeetings",
      todayCount
    );

    setText(
      "completedMeetings",
      completed
    );

    setText(
      "upcomingMeetings",
      upcoming
    );
  }


  /* ================= CREATE MEETING ================= */

  meetingForm?.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const token =
        getToken();


      if (!token) {

        alert(
          "Please login first."
        );

        return;
      }


      if (!meetingFarmer.value) {

        alert(
          "Please select a farmer."
        );

        return;
      }


      const date =
        meetingDate.value;


      const time =
        meetingTime.value;


      const scheduledAt =
        new Date(
          `${date}T${time}`
        );


      if (
        Number.isNaN(
          scheduledAt.getTime()
        )
      ) {

        alert(
          "Please enter a valid date and time."
        );

        return;
      }


      const meetingData = {

        farmer:
          meetingFarmer.value,

        date:
          date,

        time:
          time,

        scheduledAt:
          scheduledAt.toISOString(),

        purpose:
          meetingPurpose.value.trim(),

        location:
          meetingLocation.value.trim(),

        remarks:
          meetingRemarks.value.trim(),

        status:
          "SCHEDULED"
      };


      try {

        /*
         * Expected backend endpoint:
         * POST /api/meetings
         */

        const response =
          await fetch(
            `${API_BASE_URL}/meetings`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  meetingData
                )
            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Failed to schedule meeting"
          );
        }


        alert(
          "Meeting scheduled successfully."
        );


        closeMeetingModalWindow();


        await loadMeetings();

      } catch (error) {

        console.error(
          "Create meeting error:",
          error
        );


        alert(
          error.message ||
          "Failed to schedule meeting."
        );
      }
    }
  );


  /* ================= SEARCH / FILTER ================= */

  meetingSearch?.addEventListener(
    "input",
    renderMeetings
  );


  meetingStatusFilter?.addEventListener(
    "change",
    renderMeetings
  );


  meetingDateFilter?.addEventListener(
    "change",
    renderMeetings
  );


  /* ================= VIEW MEETING ================= */

  meetingsTableBody?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          ".meeting-action"
        );


      if (!button) {
        return;
      }


      const id =
        button.dataset.id;


      const meeting =
        meetings.find(
          (item) =>
            item._id === id
        );


      if (!meeting) {
        return;
      }


      const farmer =
        meeting.farmer ||
        meeting.relatedFarmer ||
        {};


      alert(
        `Farmer: ${
          farmer.name ||
          "Unknown Farmer"
        }\n` +
        `Purpose: ${
          meeting.purpose ||
          "-"
        }\n` +
        `Date: ${
          formatDate(
            meeting.meetingDate ||
            meeting.date ||
            meeting.scheduledAt
          )
        }\n` +
        `Status: ${
          formatStatus(
            meeting.status ||
            "SCHEDULED"
          )
        }`
      );
    }
  );


  /* ================= HELPERS ================= */

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


  function getInitials(
    name = ""
  ) {

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word
            .charAt(0)
            .toUpperCase()
      )
      .join("") || "FA";
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

      return String(value);
    }


    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
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


  /* ================= INITIAL LOAD ================= */

  loadMeetings();
});
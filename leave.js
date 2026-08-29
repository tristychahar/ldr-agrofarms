document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5000/api";

  const applyLeaveBtn =
    document.getElementById("applyLeaveBtn");

  const leaveModal =
    document.getElementById("leaveModal");

  const closeLeaveModal =
    document.getElementById("closeLeaveModal");

  const cancelLeaveBtn =
    document.getElementById("cancelLeaveBtn");

  const leaveForm =
    document.getElementById("leaveForm");

  const leaveType =
    document.getElementById("leaveType");

  const leaveFrom =
    document.getElementById("leaveFrom");

  const leaveTo =
    document.getElementById("leaveTo");

  const leaveReason =
    document.getElementById("leaveReason");

  const leaveDaysPreview =
    document.getElementById("leaveDaysPreview");

  const leaveSearch =
    document.getElementById("leaveSearch");

  const leaveStatusFilter =
    document.getElementById("leaveStatusFilter");

  const leaveTableBody =
    document.getElementById("leaveTableBody");

  const leaveCount =
    document.getElementById("leaveCount");


  let leaveRequests = [];


  /* =====================================================
     AUTH
     ===================================================== */

  function getToken() {
    return localStorage.getItem("token");
  }


  /* =====================================================
     MODAL
     ===================================================== */

  function openLeaveModal() {

    leaveModal?.classList.add("show");

    setMinimumDate();
  }


  function closeModal() {

    leaveModal?.classList.remove("show");

    leaveForm?.reset();

    if (leaveDaysPreview) {
      leaveDaysPreview.textContent =
        "Select dates to calculate duration.";
    }
  }


  applyLeaveBtn?.addEventListener(
    "click",
    openLeaveModal
  );


  closeLeaveModal?.addEventListener(
    "click",
    closeModal
  );


  cancelLeaveBtn?.addEventListener(
    "click",
    closeModal
  );


  leaveModal?.addEventListener(
    "click",
    (event) => {

      if (event.target === leaveModal) {
        closeModal();
      }

    }
  );


  /* =====================================================
     MIN DATE
     ===================================================== */

  function setMinimumDate() {

    if (!leaveFrom || !leaveTo) {
      return;
    }


    const today = new Date();

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

    const minDate =
      `${year}-${month}-${day}`;


    leaveFrom.min = minDate;

    leaveTo.min = minDate;
  }


  /* =====================================================
     DATE CHANGE
     ===================================================== */

  leaveFrom?.addEventListener(
    "change",
    () => {

      if (leaveFrom.value) {
        leaveTo.min =
          leaveFrom.value;
      }

      calculateLeaveDays();
    }
  );


  leaveTo?.addEventListener(
    "change",
    calculateLeaveDays
  );


  function calculateLeaveDays() {

    if (
      !leaveFrom?.value ||
      !leaveTo?.value
    ) {

      leaveDaysPreview.textContent =
        "Select dates to calculate duration.";

      return;
    }


    const from =
      new Date(
        `${leaveFrom.value}T00:00:00`
      );

    const to =
      new Date(
        `${leaveTo.value}T00:00:00`
      );


    if (to < from) {

      leaveDaysPreview.textContent =
        "To date cannot be before from date.";

      return;
    }


    const difference =
      to.getTime() -
      from.getTime();


    const days =
      Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
      ) + 1;


    leaveDaysPreview.textContent =
      `${days} day${
        days === 1 ? "" : "s"
      } of leave`;
  }


  /* =====================================================
     LOAD LEAVE REQUESTS
     ===================================================== */

  async function loadLeaveRequests() {

    const token =
      getToken();


    if (!token) {

      renderEmptyState(
        "Please login to view your leave requests."
      );

      return;
    }


    try {

      /*
       * Expected backend endpoint:
       * GET /api/leaves/my
       */

      const response =
        await fetch(
          `${API_BASE_URL}/leaves/my`,
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
          "Failed to load leave requests."
        );
      }


      leaveRequests =
        result.data || [];


      updateStats();

      renderLeaveRequests();

    } catch (error) {

      console.error(
        "Load leave error:",
        error
      );


      renderEmptyState(
        "Unable to load leave requests."
      );
    }
  }


  /* =====================================================
     SUBMIT LEAVE
     ===================================================== */

  leaveForm?.addEventListener(
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


      if (
        !leaveType.value ||
        !leaveFrom.value ||
        !leaveTo.value ||
        !leaveReason.value.trim()
      ) {

        alert(
          "Please fill all required fields."
        );

        return;
      }


      const from =
        new Date(
          `${leaveFrom.value}T00:00:00`
        );

      const to =
        new Date(
          `${leaveTo.value}T00:00:00`
        );


      if (to < from) {

        alert(
          "To date cannot be before from date."
        );

        return;
      }


      const days =
        Math.floor(
          (
            to.getTime() -
            from.getTime()
          ) /
          (1000 * 60 * 60 * 24)
        ) + 1;


      const submitButton =
        leaveForm.querySelector(
          ".submit-leave-btn"
        );


      submitButton.disabled =
        true;

      submitButton.textContent =
        "Submitting...";


      try {

        const leaveData = {

          leaveType:
            leaveType.value,

          fromDate:
            leaveFrom.value,

          toDate:
            leaveTo.value,

          days:
            days,

          reason:
            leaveReason.value.trim(),

          status:
            "PENDING"
        };


        /*
         * Expected backend endpoint:
         * POST /api/leaves
         */

        const response =
          await fetch(
            `${API_BASE_URL}/leaves`,
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
                  leaveData
                )
            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Failed to submit leave."
          );
        }


        alert(
          "Leave application submitted successfully."
        );


        closeModal();

        await loadLeaveRequests();

      } catch (error) {

        console.error(
          "Submit leave error:",
          error
        );


        alert(
          error.message ||
          "Failed to submit leave application."
        );

      } finally {

        submitButton.disabled =
          false;

        submitButton.textContent =
          "Submit Leave";
      }
    }
  );


  /* =====================================================
     RENDER LEAVE REQUESTS
     ===================================================== */

  function renderLeaveRequests() {

    const searchTerm =
      leaveSearch?.value
        .trim()
        .toLowerCase() || "";


    const selectedStatus =
      leaveStatusFilter?.value ||
      "ALL";


    const filteredRequests =
      leaveRequests.filter(
        (leave) => {

          const type =
            leave.leaveType ||
            leave.type ||
            "";

          const reason =
            leave.reason ||
            "";


          const status =
            leave.status ||
            "PENDING";


          const matchesSearch =
            !searchTerm ||
            type
              .toLowerCase()
              .includes(searchTerm) ||
            reason
              .toLowerCase()
              .includes(searchTerm);


          const matchesStatus =
            selectedStatus === "ALL" ||
            status === selectedStatus;


          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );


    if (leaveCount) {

      leaveCount.textContent =
        `${filteredRequests.length} Request${
          filteredRequests.length === 1
            ? ""
            : "s"
        }`;
    }


    if (
      filteredRequests.length === 0
    ) {

      renderEmptyState(
        leaveRequests.length === 0
          ? "No leave requests yet."
          : "No leave requests match your filters."
      );

      return;
    }


    leaveTableBody.innerHTML =
      filteredRequests
        .map(
          (leave) => {

            const type =
              leave.leaveType ||
              leave.type ||
              "OTHER";


            const status =
              leave.status ||
              "PENDING";


            const fromDate =
              leave.fromDate ||
              leave.startDate ||
              leave.from;


            const toDate =
              leave.toDate ||
              leave.endDate ||
              leave.to;


            const days =
              leave.days ||
              calculateDays(
                fromDate,
                toDate
              );


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

                  <div class="leave-type">

                    ${formatStatus(type)}

                    <small>
                      Leave Request
                    </small>

                  </div>

                </td>


                <td>
                  ${formatDate(
                    fromDate
                  )}
                </td>


                <td>
                  ${formatDate(
                    toDate
                  )}
                </td>


                <td>

                  <span class="leave-days">
                    ${days}
                  </span>

                </td>


                <td>

                  <div class="leave-reason">
                    ${escapeHTML(
                      leave.reason ||
                      "-"
                    )}
                  </div>

                </td>


                <td>

                  <span
                    class="leave-status ${statusClass}"
                  >
                    ${formatStatus(
                      status
                    )}
                  </span>

                </td>


                <td>

                  <button
                    class="leave-action"
                    data-id="${leave._id}"
                    title="View Leave"
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


  /* =====================================================
     STATS
     ===================================================== */

  function updateStats() {

    const total =
      leaveRequests.length;


    const pending =
      leaveRequests.filter(
        (leave) =>
          leave.status ===
          "PENDING"
      ).length;


    const approved =
      leaveRequests.filter(
        (leave) =>
          leave.status ===
          "APPROVED"
      ).length;


    const rejected =
      leaveRequests.filter(
        (leave) =>
          leave.status ===
          "REJECTED"
      ).length;


    setText(
      "totalLeave",
      total
    );

    setText(
      "pendingLeave",
      pending
    );

    setText(
      "approvedLeave",
      approved
    );

    setText(
      "rejectedLeave",
      rejected
    );
  }


  /* =====================================================
     VIEW LEAVE
     ===================================================== */

  leaveTableBody?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          ".leave-action"
        );


      if (!button) {
        return;
      }


      const id =
        button.dataset.id;


      const leave =
        leaveRequests.find(
          (item) =>
            item._id === id
        );


      if (!leave) {
        return;
      }


      const type =
        leave.leaveType ||
        leave.type ||
        "OTHER";


      const fromDate =
        leave.fromDate ||
        leave.startDate ||
        leave.from;


      const toDate =
        leave.toDate ||
        leave.endDate ||
        leave.to;


      const days =
        leave.days ||
        calculateDays(
          fromDate,
          toDate
        );


      alert(
        `Leave Type: ${
          formatStatus(type)
        }\n` +
        `From: ${
          formatDate(fromDate)
        }\n` +
        `To: ${
          formatDate(toDate)
        }\n` +
        `Days: ${
          days
        }\n` +
        `Status: ${
          formatStatus(
            leave.status ||
            "PENDING"
          )
        }\n` +
        `Reason: ${
          leave.reason ||
          "-"
        }`
      );
    }
  );


  /* =====================================================
     SEARCH & FILTER
     ===================================================== */

  leaveSearch?.addEventListener(
    "input",
    renderLeaveRequests
  );


  leaveStatusFilter?.addEventListener(
    "change",
    renderLeaveRequests
  );


  /* =====================================================
     HELPERS
     ===================================================== */

  function calculateDays(
    from,
    to
  ) {

    if (!from || !to) {
      return 0;
    }


    const start =
      new Date(
        `${from}T00:00:00`
      );

    const end =
      new Date(
        `${to}T00:00:00`
      );


    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      return 0;
    }


    return (
      Math.floor(
        (
          end.getTime() -
          start.getTime()
        ) /
        (1000 * 60 * 60 * 24)
      ) + 1
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


  function renderEmptyState(
    message
  ) {

    if (!leaveTableBody) {
      return;
    }


    leaveTableBody.innerHTML = `
      <tr>

        <td
          colspan="7"
          class="empty-leave"
        >

          <div class="empty-icon">
            📝
          </div>

          <strong>
            ${escapeHTML(
              message
            )}
          </strong>

          <p>
            Your leave applications will appear here.
          </p>

        </td>

      </tr>
    `;
  }


  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  loadLeaveRequests();
});
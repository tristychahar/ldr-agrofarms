document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5000/api";

  const visitModal = document.getElementById("visitModal");
  const startVisitBtn = document.getElementById("startVisitBtn");
  const closeVisitModal = document.getElementById("closeVisitModal");
  const cancelVisitBtn = document.getElementById("cancelVisitBtn");

  const visitForm = document.getElementById("visitForm");
  const visitFarmer = document.getElementById("visitFarmer");
  const visitPurpose = document.getElementById("visitPurpose");
  const visitRemarks = document.getElementById("visitRemarks");
  const locationStatus = document.getElementById("locationStatus");

  const visitSearch = document.getElementById("visitSearch");
  const visitStatusFilter =
    document.getElementById("visitStatusFilter");

  const visitsTableBody =
    document.getElementById("visitsTableBody");

  const totalVisits =
    document.getElementById("totalVisits");

  const todayVisits =
    document.getElementById("todayVisits");

  const completedVisits =
    document.getElementById("completedVisits");

  const pendingVisits =
    document.getElementById("pendingVisits");

  const visitCount =
    document.getElementById("visitCount");


  let visits = [];
  let farmers = [];

  let currentLocation = {
    latitude: null,
    longitude: null,
    accuracy: null
  };


  /* ================= AUTH ================= */

  function getToken() {
    return localStorage.getItem("token");
  }


  /* ================= MODAL ================= */

  function openVisitModal() {
    visitModal?.classList.add("show");

    loadFarmersForVisit();

    getCurrentLocation();
  }


  function closeVisitModalWindow() {
    visitModal?.classList.remove("show");

    visitForm?.reset();

    currentLocation = {
      latitude: null,
      longitude: null,
      accuracy: null
    };

    if (locationStatus) {
      locationStatus.textContent =
        "Location will be captured when the visit starts.";
    }
  }


  startVisitBtn?.addEventListener(
    "click",
    openVisitModal
  );


  closeVisitModal?.addEventListener(
    "click",
    closeVisitModalWindow
  );


  cancelVisitBtn?.addEventListener(
    "click",
    closeVisitModalWindow
  );


  visitModal?.addEventListener(
    "click",
    (event) => {
      if (event.target === visitModal) {
        closeVisitModalWindow();
      }
    }
  );


  /* ================= LOAD FARMERS ================= */

  async function loadFarmersForVisit() {
    try {
      const token = getToken();

      if (!token) {
        console.warn("Authentication token not found.");
        return;
      }


      const response = await fetch(
        `${API_BASE_URL}/farmers/my`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );


      const result = await response.json();


      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to load farmers"
        );
      }


      farmers = result.data || [];

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

    if (!visitFarmer) return;

    visitFarmer.innerHTML = `
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

        option.value = farmer._id;

        option.textContent =
          `${farmer.name} (${farmer.farmerId})`;

        visitFarmer.appendChild(option);
      });
  }


  /* ================= LOAD VISITS ================= */

  async function loadVisits() {
    try {
      const token = getToken();

      if (!token) {
        renderEmptyState(
          "Please login to view field visits."
        );

        return;
      }


      /*
       * IMPORTANT:
       * This endpoint must match the
       * FieldVisit route created in backend.
       */

      const response = await fetch(
        `${API_BASE_URL}/fieldvisits/my`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );


      const result = await response.json();


      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to load field visits"
        );
      }


      visits = result.data || [];

      updateVisitStats();

      renderVisits();

    } catch (error) {

      console.error(
        "Load field visits error:",
        error
      );

      renderEmptyState(
        "Unable to load field visits."
      );
    }
  }


  /* ================= RENDER VISITS ================= */

  function renderVisits() {

    const searchTerm =
      visitSearch?.value
        .trim()
        .toLowerCase() || "";


    const selectedStatus =
      visitStatusFilter?.value || "ALL";


    const filteredVisits =
      visits.filter((visit) => {

        const farmerName =
          visit.farmer?.name ||
          visit.relatedFarmer?.name ||
          "";


        const purpose =
          visit.purpose ||
          "";


        const matchesSearch =
          !searchTerm ||
          farmerName
            .toLowerCase()
            .includes(searchTerm) ||
          purpose
            .toLowerCase()
            .includes(searchTerm);


        const visitStatus =
          visit.status || "PLANNED";


        const matchesStatus =
          selectedStatus === "ALL" ||
          visitStatus === selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );
      });


    if (visitCount) {
      visitCount.textContent =
        `${filteredVisits.length} Visit${
          filteredVisits.length === 1
            ? ""
            : "s"
        }`;
    }


    if (filteredVisits.length === 0) {

      renderEmptyState(
        visits.length === 0
          ? "No field visits yet."
          : "No visits match your search."
      );

      return;
    }


    visitsTableBody.innerHTML =
      filteredVisits
        .map((visit) => {

          const farmer =
            visit.farmer ||
            visit.relatedFarmer ||
            {};


          const farmerName =
            farmer.name ||
            "Unknown Farmer";


          const farmerId =
            farmer.farmerId ||
            "-";


          const status =
            visit.status ||
            "PLANNED";


          const statusClass =
            status
              .toLowerCase()
              .replace("_", "-");


          return `
            <tr>

              <td>

                <div class="visit-farmer">

                  <div class="visit-farmer-avatar">
                    ${getInitials(farmerName)}
                  </div>

                  <div>

                    <strong>
                      ${escapeHTML(farmerName)}
                    </strong>

                    <small>
                      ${escapeHTML(farmerId)}
                    </small>

                  </div>

                </div>

              </td>


              <td>
                ${formatDate(
                  visit.visitDate ||
                  visit.date ||
                  visit.createdAt
                )}
              </td>


              <td>
                ${escapeHTML(
                  visit.purpose || "-"
                )}
              </td>


              <td>

                <span class="visit-location">

                  <span>📍</span>

                  ${
                    hasLocation(visit)
                      ? "Captured"
                      : "Not available"
                  }

                </span>

              </td>


              <td>

                <span
                  class="visit-status ${statusClass}"
                >
                  ${formatStatus(status)}
                </span>

              </td>


              <td>

                <button
                  class="visit-action"
                  title="View Visit"
                  data-id="${visit._id}"
                >
                  👁️
                </button>

              </td>

            </tr>
          `;

        })
        .join("");
  }


  /* ================= EMPTY STATE ================= */

  function renderEmptyState(message) {

    if (!visitsTableBody) return;

    visitsTableBody.innerHTML = `
      <tr>

        <td
          colspan="6"
          class="empty-visits"
        >

          <div class="empty-icon">
            📍
          </div>

          <strong>
            ${escapeHTML(message)}
          </strong>

          <p>
            Your field visit records will appear here.
          </p>

        </td>

      </tr>
    `;
  }


  /* ================= STATS ================= */

  function updateVisitStats() {

    const total =
      visits.length;


    const today =
      new Date();


    const todayStart =
      new Date(today);

    todayStart.setHours(
      0,
      0,
      0,
      0
    );


    const todayEnd =
      new Date(today);

    todayEnd.setHours(
      23,
      59,
      59,
      999
    );


    const todayCount =
      visits.filter((visit) => {

        const date =
          new Date(
            visit.visitDate ||
            visit.date ||
            visit.createdAt
          );

        return (
          date >= todayStart &&
          date <= todayEnd
        );
      }).length;


    const completed =
      visits.filter(
        (visit) =>
          visit.status ===
          "COMPLETED"
      ).length;


    const inProgress =
      visits.filter(
        (visit) =>
          visit.status ===
          "IN_PROGRESS"
      ).length;


    if (totalVisits) {
      totalVisits.textContent = total;
    }

    if (todayVisits) {
      todayVisits.textContent =
        todayCount;
    }

    if (completedVisits) {
      completedVisits.textContent =
        completed;
    }

    if (pendingVisits) {
      pendingVisits.textContent =
        inProgress;
    }
  }


  /* ================= SEARCH ================= */

  visitSearch?.addEventListener(
    "input",
    renderVisits
  );


  visitStatusFilter?.addEventListener(
    "change",
    renderVisits
  );


  /* ================= GPS ================= */

  function getCurrentLocation() {

    if (!navigator.geolocation) {

      if (locationStatus) {
        locationStatus.textContent =
          "Location is not supported by this browser.";
      }

      return;
    }


    if (locationStatus) {
      locationStatus.textContent =
        "Getting your current location...";
    }


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


        if (locationStatus) {

          locationStatus.textContent =
            `Location captured • Accuracy: ${
              Math.round(
                position.coords.accuracy
              )
            }m`;
        }

      },

      (error) => {

        console.warn(
          "Location error:",
          error
        );


        if (locationStatus) {

          locationStatus.textContent =
            "Unable to get location. Please allow location permission.";
        }
      },

      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0
      }
    );
  }


  /* ================= CREATE VISIT ================= */

  visitForm?.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const token = getToken();


      if (!token) {

        alert(
          "Please login first."
        );

        return;
      }


      const farmerId =
        visitFarmer.value;


      if (!farmerId) {

        alert(
          "Please select a farmer."
        );

        return;
      }


      const visitData = {

        farmer:
          farmerId,

        purpose:
          visitPurpose.value.trim(),

        remarks:
          visitRemarks.value.trim(),

        location: {
          latitude:
            currentLocation.latitude,

          longitude:
            currentLocation.longitude,

          accuracy:
            currentLocation.accuracy
        }

      };


      try {

        /*
         * This endpoint should match
         * your FieldVisit backend route.
         */

        const response =
          await fetch(
            `${API_BASE_URL}/fieldvisits`,
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
                  visitData
                )
            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Failed to create field visit"
          );
        }


        alert(
          "Field visit started successfully."
        );


        closeVisitModalWindow();


        await loadVisits();

      } catch (error) {

        console.error(
          "Create visit error:",
          error
        );


        alert(
          error.message ||
          "Failed to start field visit."
        );
      }
    }
  );


  /* ================= VIEW VISIT ================= */

  visitsTableBody?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          ".visit-action"
        );


      if (!button) return;


      const id =
        button.dataset.id;


      const visit =
        visits.find(
          (item) =>
            item._id === id
        );


      if (!visit) return;


      const farmer =
        visit.farmer ||
        visit.relatedFarmer ||
        {};


      alert(
        `Farmer: ${
          farmer.name || "Unknown"
        }\n` +
        `Purpose: ${
          visit.purpose || "-"
        }\n` +
        `Status: ${
          formatStatus(
            visit.status || "PLANNED"
          )
        }`
      );
    }
  );


  /* ================= HELPERS ================= */

  function getInitials(name = "") {

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


  function escapeHTML(value = "") {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function formatDate(dateValue) {

    if (!dateValue) return "-";


    const date =
      new Date(dateValue);


    if (Number.isNaN(
      date.getTime()
    )) {
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


  function formatStatus(status) {

    return String(status)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  }


  function hasLocation(visit) {

    const location =
      visit.location;


    return Boolean(
      location &&
      location.latitude !== null &&
      location.longitude !== null
    );
  }


  /* ================= INITIAL LOAD ================= */

  loadVisits();
});
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "https://ldr-agrofarms-backend.onrender.com/api";

  const farmerModal = document.getElementById("farmerModal");
  const addFarmerBtn = document.getElementById("addFarmerBtn");
  const closeFarmerModal = document.getElementById("closeFarmerModal");
  const cancelFarmerBtn = document.getElementById("cancelFarmerBtn");

  const farmerForm = document.getElementById("farmerForm");
  const farmerSearch = document.getElementById("farmerSearch");
  const statusFilter = document.getElementById("statusFilter");

  const farmersTableBody =
    document.getElementById("farmersTableBody");

  const totalFarmers =
    document.getElementById("totalFarmers");

  const activeFarmers =
    document.getElementById("activeFarmers");

  const farmerCount =
    document.getElementById("farmerCount");


  let farmers = [];


  /* ================= AUTH ================= */

  function getToken() {
    return localStorage.getItem("token");
  }


  /* ================= MODAL ================= */

  function openModal() {
    farmerModal.classList.add("show");
  }

  function closeModal() {
    farmerModal.classList.remove("show");
    farmerForm.reset();
  }


  addFarmerBtn?.addEventListener("click", openModal);

  closeFarmerModal?.addEventListener("click", closeModal);

  cancelFarmerBtn?.addEventListener("click", closeModal);


  farmerModal?.addEventListener("click", (event) => {
    if (event.target === farmerModal) {
      closeModal();
    }
  });


  /* ================= LOAD FARMERS ================= */

  async function loadFarmers() {
    try {
      const token = getToken();

      if (!token) {
        console.warn("No authentication token found.");

        renderEmptyState(
          "Please login to view your farmers."
        );

        return;
      }


      const response = await fetch(
        `${API_BASE_URL}/farmers/my`,
        {
          method: "GET",

          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );


      const result = await response.json();


      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch farmers"
        );
      }


      farmers = result.data || [];

      updateStats();

      renderFarmers();

    } catch (error) {

      console.error("Load farmers error:", error);

      renderEmptyState(
        "Unable to load farmers."
      );
    }
  }


  /* ================= RENDER FARMERS ================= */

  function renderFarmers() {

    const searchTerm =
      farmerSearch.value
        .trim()
        .toLowerCase();


    const selectedStatus =
      statusFilter.value;


    const filteredFarmers =
      farmers.filter((farmer) => {

        const matchesSearch =
          !searchTerm ||
          farmer.name
            ?.toLowerCase()
            .includes(searchTerm) ||
          farmer.farmerId
            ?.toLowerCase()
            .includes(searchTerm) ||
          farmer.village
            ?.toLowerCase()
            .includes(searchTerm);


        const matchesStatus =
          selectedStatus === "ALL" ||
          farmer.status === selectedStatus;


        return matchesSearch && matchesStatus;
      });


    farmerCount.textContent =
      `${filteredFarmers.length} Farmer${
        filteredFarmers.length === 1 ? "" : "s"
      }`;


    if (filteredFarmers.length === 0) {

      renderEmptyState(
        farmers.length === 0
          ? "No farmers assigned to you yet."
          : "No farmers match your search."
      );

      return;
    }


    farmersTableBody.innerHTML =
      filteredFarmers.map((farmer) => {

        const initials =
          getInitials(farmer.name);


        const statusClass =
          farmer.status === "ACTIVE"
            ? "active"
            : "inactive";


        return `
          <tr>

            <td>

              <div class="farmer-name">

                <div class="farmer-avatar">
                  ${initials}
                </div>

                <div>
                  <strong>
                    ${escapeHTML(farmer.name || "Unknown")}
                  </strong>

                  <small>
                    ${escapeHTML(
                      farmer.email || "No email"
                    )}
                  </small>
                </div>

              </div>

            </td>


            <td>
              ${escapeHTML(
                farmer.farmerId || "-"
              )}
            </td>


            <td>
              ${escapeHTML(
                farmer.village || "-"
              )}
            </td>


            <td>
              ${escapeHTML(
                farmer.district || "-"
              )}
            </td>


            <td>
              ${escapeHTML(
                farmer.phone || "-"
              )}
            </td>


            <td>

              <span class="farmer-status ${statusClass}">
                ${farmer.status || "UNKNOWN"}
              </span>

            </td>


            <td>

              <div class="action-menu">

                <button
                  class="action-btn"
                  title="View Farmer"
                  data-action="view"
                  data-id="${farmer._id}"
                >
                  👁️
                </button>

                <button
                  class="action-btn"
                  title="Edit Farmer"
                  data-action="edit"
                  data-id="${farmer._id}"
                >
                  ✏️
                </button>

              </div>

            </td>

          </tr>
        `;

      }).join("");
  }


  /* ================= EMPTY STATE ================= */

  function renderEmptyState(message) {

    farmersTableBody.innerHTML = `
      <tr>

        <td
          colspan="7"
          class="empty-farmers"
        >

          <div class="empty-icon">
            🌾
          </div>

          <strong>
            ${escapeHTML(message)}
          </strong>

          <p>
            Farmers assigned to you will appear here.
          </p>

        </td>

      </tr>
    `;
  }


  /* ================= STATS ================= */

  function updateStats() {

    const total =
      farmers.length;


    const active =
      farmers.filter(
        (farmer) =>
          farmer.status === "ACTIVE"
      ).length;


    totalFarmers.textContent =
      total;


    activeFarmers.textContent =
      active;


    farmerCount.textContent =
      `${total} Farmer${
        total === 1 ? "" : "s"
      }`;
  }


  /* ================= SEARCH ================= */

  farmerSearch?.addEventListener(
    "input",
    renderFarmers
  );


  statusFilter?.addEventListener(
    "change",
    renderFarmers
  );


  /* ================= ADD FARMER ================= */

  farmerForm?.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const token = getToken();


      if (!token) {
        alert("Please login first.");
        return;
      }


      const farmerData = {

        farmerId:
          document.getElementById(
            "farmerId"
          ).value.trim(),

        name:
          document.getElementById(
            "farmerName"
          ).value.trim(),

        phone:
          document.getElementById(
            "farmerPhone"
          ).value.trim(),

        email:
          document.getElementById(
            "farmerEmail"
          ).value.trim(),

        village:
          document.getElementById(
            "farmerVillage"
          ).value.trim(),

        district:
          document.getElementById(
            "farmerDistrict"
          ).value.trim(),

        state:
          document.getElementById(
            "farmerState"
          ).value.trim(),

        address:
          document.getElementById(
            "farmerAddress"
          ).value.trim(),

        land: {
          area:
            Number(
              document.getElementById(
                "landArea"
              ).value
            ) || null,

          unit: "acre"
        }

      };


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/farmers`,
            {
              method: "POST",

              headers: {
                "Authorization":
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  farmerData
                )
            }
          );


        const result =
          await response.json();


        if (!response.ok) {
          throw new Error(
            result.message ||
            "Failed to create farmer"
          );
        }


        alert(
          "Farmer added successfully."
        );


        closeModal();


        await loadFarmers();


      } catch (error) {

        console.error(
          "Create farmer error:",
          error
        );

        alert(
          error.message ||
          "Failed to add farmer."
        );
      }

    }
  );


  /* ================= TABLE ACTIONS ================= */

  farmersTableBody?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          ".action-btn"
        );


      if (!button) return;


      const action =
        button.dataset.action;

      const farmerId =
        button.dataset.id;


      if (action === "view") {

        viewFarmer(farmerId);

      }


      if (action === "edit") {

        editFarmer(farmerId);

      }

    }
  );


  /* ================= VIEW FARMER ================= */

  function viewFarmer(id) {

    const farmer =
      farmers.find(
        (item) =>
          item._id === id
      );


    if (!farmer) return;


    alert(
      `Farmer: ${farmer.name}\n` +
      `ID: ${farmer.farmerId}\n` +
      `Village: ${farmer.village || "-"}\n` +
      `District: ${farmer.district || "-"}\n` +
      `Phone: ${farmer.phone || "-"}`
    );
  }


  /* ================= EDIT FARMER ================= */

  function editFarmer(id) {

    const farmer =
      farmers.find(
        (item) =>
          item._id === id
      );


    if (!farmer) return;


    alert(
      `Edit Farmer feature will be connected to the update API next.\n\n` +
      `Farmer: ${farmer.name}`
    );
  }


  /* ================= HELPERS ================= */

  function getInitials(name = "") {

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word.charAt(0).toUpperCase()
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


  /* ================= INITIAL LOAD ================= */

  loadFarmers();
});
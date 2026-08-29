document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5000/api";

  const taskSearch = document.getElementById("taskSearch");
  const taskStatusFilter =
    document.getElementById("taskStatusFilter");
  const taskPriorityFilter =
    document.getElementById("taskPriorityFilter");

  const tasksTableBody =
    document.getElementById("tasksTableBody");

  const taskCount =
    document.getElementById("taskCount");

  const taskModal =
    document.getElementById("taskModal");

  const closeTaskModal =
    document.getElementById("closeTaskModal");

  const cancelTaskBtn =
    document.getElementById("cancelTaskBtn");

  const updateTaskBtn =
    document.getElementById("updateTaskBtn");

  const taskStatusUpdate =
    document.getElementById("taskStatusUpdate");

  const taskModalTitle =
    document.getElementById("taskModalTitle");

  const taskDescription =
    document.getElementById("taskDescription");

  const taskPriority =
    document.getElementById("taskPriority");

  const taskDueDate =
    document.getElementById("taskDueDate");

  const taskFarmer =
    document.getElementById("taskFarmer");

  const taskRemarks =
    document.getElementById("taskRemarks");


  let tasks = [];
  let selectedTaskId = null;


  /* =====================================================
     AUTH
     ===================================================== */

  function getToken() {
    return localStorage.getItem("token");
  }


  /* =====================================================
     LOAD TASKS
     ===================================================== */

  async function loadTasks() {

    const token = getToken();

    if (!token) {
      renderEmptyState(
        "Please login to view your tasks."
      );
      return;
    }


    try {

      /*
       * Expected:
       * GET /api/tasks/my
       */

      const response = await fetch(
        `${API_BASE_URL}/tasks/my`,
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
          "Failed to load tasks."
        );
      }


      tasks =
        result.data || [];


      updateStats();

      renderTasks();

    } catch (error) {

      console.error(
        "Load tasks error:",
        error
      );

      renderEmptyState(
        "Unable to load tasks."
      );
    }
  }


  /* =====================================================
     RENDER TASKS
     ===================================================== */

  function renderTasks() {

    const searchTerm =
      taskSearch?.value
        .trim()
        .toLowerCase() || "";


    const selectedStatus =
      taskStatusFilter?.value ||
      "ALL";


    const selectedPriority =
      taskPriorityFilter?.value ||
      "ALL";


    const filteredTasks =
      tasks.filter((task) => {

        const title =
          task.title || "";

        const description =
          task.description || "";

        const farmer =
          task.relatedFarmer ||
          task.farmer ||
          {};

        const farmerName =
          typeof farmer === "object"
            ? farmer.name || ""
            : "";


        const matchesSearch =
          !searchTerm ||
          title
            .toLowerCase()
            .includes(searchTerm) ||
          description
            .toLowerCase()
            .includes(searchTerm) ||
          farmerName
            .toLowerCase()
            .includes(searchTerm);


        const status =
          task.status || "PENDING";

        const priority =
          task.priority || "MEDIUM";


        const matchesStatus =
          selectedStatus === "ALL" ||
          status === selectedStatus;


        const matchesPriority =
          selectedPriority === "ALL" ||
          priority === selectedPriority;


        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );
      });


    if (taskCount) {
      taskCount.textContent =
        `${filteredTasks.length} Task${
          filteredTasks.length === 1
            ? ""
            : "s"
        }`;
    }


    if (filteredTasks.length === 0) {

      renderEmptyState(
        tasks.length === 0
          ? "No tasks assigned."
          : "No tasks match your filters."
      );

      return;
    }


    tasksTableBody.innerHTML =
      filteredTasks
        .map((task) => {

          const priority =
            task.priority || "MEDIUM";

          const status =
            task.status || "PENDING";


          const farmer =
            task.relatedFarmer ||
            task.farmer ||
            null;


          let farmerName = "-";

          if (
            farmer &&
            typeof farmer === "object"
          ) {
            farmerName =
              farmer.name || "-";
          }


          const priorityClass =
            priority
              .toLowerCase();


          const statusClass =
            status
              .toLowerCase()
              .replaceAll(
                "_",
                "-"
              );


          const dueDate =
            task.dueDate;


          const overdue =
            isOverdue(
              dueDate,
              status
            );


          return `
            <tr>

              <td>

                <div class="task-title">

                  <strong>
                    ${escapeHTML(
                      task.title || "-"
                    )}
                  </strong>

                  <small>
                    ${escapeHTML(
                      task.description || ""
                    )}
                  </small>

                </div>

              </td>


              <td>

                <span
                  class="task-priority ${priorityClass}"
                >
                  ${formatStatus(
                    priority
                  )}
                </span>

              </td>


              <td>

                <span
                  class="task-due-date ${
                    overdue
                      ? "overdue"
                      : ""
                  }"
                >
                  ${formatDate(
                    dueDate
                  )}
                </span>

              </td>


              <td>

                <span class="task-farmer">
                  ${escapeHTML(
                    farmerName
                  )}
                </span>

              </td>


              <td>

                <span
                  class="task-status ${statusClass}"
                >
                  ${formatStatus(
                    status
                  )}
                </span>

              </td>


              <td>

                <button
                  class="task-action"
                  data-id="${task._id}"
                  title="View Task"
                >
                  👁️
                </button>

              </td>

            </tr>
          `;
        })
        .join("");
  }


  /* =====================================================
     STATS
     ===================================================== */

  function updateStats() {

    const total =
      tasks.length;


    const pending =
      tasks.filter(
        (task) =>
          task.status ===
          "PENDING"
      ).length;


    const inProgress =
      tasks.filter(
        (task) =>
          task.status ===
          "IN_PROGRESS"
      ).length;


    const completed =
      tasks.filter(
        (task) =>
          task.status ===
          "COMPLETED"
      ).length;


    setText(
      "totalTasks",
      total
    );

    setText(
      "pendingTasks",
      pending
    );

    setText(
      "progressTasks",
      inProgress
    );

    setText(
      "completedTasks",
      completed
    );
  }


  /* =====================================================
     OPEN TASK DETAILS
     ===================================================== */

  function openTaskModal(task) {

    selectedTaskId =
      task._id;


    const farmer =
      task.relatedFarmer ||
      task.farmer ||
      null;


    let farmerName = "-";


    if (
      farmer &&
      typeof farmer === "object"
    ) {
      farmerName =
        farmer.name || "-";
    }


    taskModalTitle.textContent =
      task.title ||
      "Task Details";


    taskDescription.textContent =
      task.description ||
      "-";


    taskPriority.textContent =
      formatStatus(
        task.priority ||
        "MEDIUM"
      );


    taskDueDate.textContent =
      formatDate(
        task.dueDate
      );


    taskFarmer.textContent =
      farmerName;


    taskRemarks.textContent =
      task.remarks ||
      "-";


    taskStatusUpdate.value =
      task.status ||
      "PENDING";


    taskModal.classList.add(
      "show"
    );
  }


  /* =====================================================
     CLOSE MODAL
     ===================================================== */

  function closeModal() {

    taskModal.classList.remove(
      "show"
    );

    selectedTaskId =
      null;
  }


  closeTaskModal?.addEventListener(
    "click",
    closeModal
  );


  cancelTaskBtn?.addEventListener(
    "click",
    closeModal
  );


  taskModal?.addEventListener(
    "click",
    (event) => {

      if (
        event.target === taskModal
      ) {
        closeModal();
      }

    }
  );


  /* =====================================================
     TABLE ACTION
     ===================================================== */

  tasksTableBody?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          ".task-action"
        );


      if (!button) {
        return;
      }


      const taskId =
        button.dataset.id;


      const task =
        tasks.find(
          (item) =>
            item._id === taskId
        );


      if (!task) {
        return;
      }


      openTaskModal(task);
    }
  );


  /* =====================================================
     UPDATE TASK STATUS
     ===================================================== */

  updateTaskBtn?.addEventListener(
    "click",
    async () => {

      if (!selectedTaskId) {
        return;
      }


      const token =
        getToken();


      if (!token) {

        alert(
          "Please login first."
        );

        return;
      }


      const newStatus =
        taskStatusUpdate.value;


      updateTaskBtn.disabled =
        true;

      updateTaskBtn.textContent =
        "Updating...";


      try {

        /*
         * Expected:
         * PATCH /api/tasks/:id/status
         */

        const response =
          await fetch(
            `${API_BASE_URL}/tasks/${selectedTaskId}/status`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                status:
                  newStatus
              })
            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Failed to update task."
          );
        }


        alert(
          "Task status updated successfully."
        );


        closeModal();

        await loadTasks();

      } catch (error) {

        console.error(
          "Update task error:",
          error
        );


        alert(
          error.message ||
          "Failed to update task."
        );

      } finally {

        updateTaskBtn.disabled =
          false;

        updateTaskBtn.textContent =
          "Update Status";
      }
    }
  );


  /* =====================================================
     SEARCH & FILTERS
     ===================================================== */

  taskSearch?.addEventListener(
    "input",
    renderTasks
  );


  taskStatusFilter?.addEventListener(
    "change",
    renderTasks
  );


  taskPriorityFilter?.addEventListener(
    "change",
    renderTasks
  );


  /* =====================================================
     HELPERS
     ===================================================== */

  function isOverdue(
    dueDate,
    status
  ) {

    if (
      !dueDate ||
      status === "COMPLETED" ||
      status === "CANCELLED"
    ) {
      return false;
    }


    const due =
      new Date(dueDate);


    if (
      Number.isNaN(
        due.getTime()
      )
    ) {
      return false;
    }


    const today =
      new Date();


    today.setHours(
      0,
      0,
      0,
      0
    );


    due.setHours(
      23,
      59,
      59,
      999
    );


    return due < today;
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

    if (!tasksTableBody) {
      return;
    }


    tasksTableBody.innerHTML = `
      <tr>

        <td
          colspan="6"
          class="empty-tasks"
        >

          <div class="empty-icon">
            📋
          </div>

          <strong>
            ${escapeHTML(
              message
            )}
          </strong>

          <p>
            Tasks assigned to you will appear here.
          </p>

        </td>

      </tr>
    `;
  }


  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  loadTasks();
});
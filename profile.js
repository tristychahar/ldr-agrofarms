document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "https://ldr-agrofarms-backend.onrender.com/api";

  const profilePhotoInput =
    document.getElementById("profilePhotoInput");

  const avatarEditBtn =
    document.getElementById("avatarEditBtn");

  const profileAvatar =
    document.getElementById("profileAvatar");

  const passwordModal =
    document.getElementById("passwordModal");

  const changePasswordBtn =
    document.getElementById("changePasswordBtn");

  const closePasswordModal =
    document.getElementById("closePasswordModal");

  const cancelPasswordBtn =
    document.getElementById("cancelPasswordBtn");

  const passwordForm =
    document.getElementById("passwordForm");


  /* =====================================================
     AUTH
     ===================================================== */

  function getToken() {
    return localStorage.getItem("token");
  }


  /* =====================================================
     LOAD PROFILE
     ===================================================== */

  async function loadProfile() {

    const token = getToken();

    if (!token) {
      alert("Please login first.");
      return;
    }


    try {

      /*
       * Expected:
       * GET /api/profile/me
       */

      const response = await fetch(
        `${API_BASE_URL}/profile/me`,
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
          "Failed to load profile."
        );
      }


      const employee =
        result.data ||
        result.employee ||
        result;


      renderProfile(employee);

    } catch (error) {

      console.error(
        "Profile loading error:",
        error
      );

      alert(
        error.message ||
        "Unable to load profile."
      );
    }
  }


  /* =====================================================
     RENDER PROFILE
     ===================================================== */

  function renderProfile(employee) {

    const fullName =
      employee.fullName ||
      employee.name ||
      [
        employee.firstName,
        employee.lastName
      ]
        .filter(Boolean)
        .join(" ") ||
      "Field Assistant";


    const employeeId =
      employee.employeeId ||
      employee.empId ||
      employee.id ||
      "-";


    const phone =
      employee.phone ||
      employee.mobile ||
      "-";


    const email =
      employee.email ||
      "-";


    const role =
      employee.role ||
      employee.designation ||
      "FA";


    const designation =
      employee.designation ||
      role ||
      "Field Assistant";


    const level =
      employee.level ||
      "FA";


    const area =
      employee.assignedArea ||
      employee.area ||
      employee.region ||
      "-";


    const supervisor =
      employee.supervisorName ||
      employee.supervisor?.name ||
      employee.supervisorId ||
      "-";


    const joiningDate =
      employee.joiningDate ||
      employee.dateOfJoining;


    const status =
      employee.status ||
      "ACTIVE";


    const address =
      employee.address ||
      "-";


    /* ================= TEXT ================= */

    setText(
      "profileName",
      fullName
    );

    setText(
      "profileRole",
      designation
    );

    setText(
      "fullName",
      fullName
    );

    setText(
      "employeeId",
      employeeId
    );

    setText(
      "phone",
      phone
    );

    setText(
      "email",
      email
    );

    setText(
      "role",
      formatStatus(role)
    );

    setText(
      "joiningDate",
      formatDate(joiningDate)
    );

    setText(
      "designation",
      designation
    );

    setText(
      "employeeLevel",
      level
    );

    setText(
      "assignedArea",
      area
    );

    setText(
      "supervisor",
      supervisor
    );

    setText(
      "employmentStatus",
      formatStatus(status)
    );

    setText(
      "contactPhone",
      phone
    );

    setText(
      "contactEmail",
      email
    );

    setText(
      "address",
      address
    );


    /* ================= TOPBAR ================= */

    setText(
      "topbarName",
      fullName
    );

    setText(
      "topbarRole",
      level
    );


    /* ================= STATUS ================= */

    updateProfileStatus(
      status
    );


    /* ================= AVATAR ================= */

    const photo =
      employee.profilePhoto ||
      employee.photo ||
      employee.photoUrl ||
      employee.avatar;


    if (photo) {

      setAvatarImage(
        profileAvatar,
        photo
      );

    } else {

      setAvatarInitials(
        profileAvatar,
        fullName
      );
    }


    const topbarAvatar =
      document.getElementById(
        "topbarAvatar"
      );


    if (photo) {

      setAvatarImage(
        topbarAvatar,
        photo
      );

    } else {

      setAvatarInitials(
        topbarAvatar,
        fullName
      );
    }
  }


  /* =====================================================
     PROFILE STATUS
     ===================================================== */

  function updateProfileStatus(
    status
  ) {

    const element =
      document.getElementById(
        "profileStatus"
      );


    if (!element) {
      return;
    }


    const active =
      String(status)
        .toUpperCase() ===
      "ACTIVE";


    element.className =
      `profile-status ${
        active
          ? "active"
          : "inactive"
      }`;


    element.textContent =
      active
        ? "● Active"
        : "● Inactive";
  }


  /* =====================================================
     PROFILE PHOTO
     ===================================================== */

  avatarEditBtn?.addEventListener(
    "click",
    () => {

      profilePhotoInput?.click();

    }
  );


  profilePhotoInput?.addEventListener(
    "change",
    () => {

      const file =
        profilePhotoInput.files?.[0];


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select an image file."
        );

        profilePhotoInput.value =
          "";

        return;
      }


      const maxSize =
        5 * 1024 * 1024;


      if (file.size > maxSize) {

        alert(
          "Image size must be less than 5 MB."
        );

        profilePhotoInput.value =
          "";

        return;
      }


      const reader =
        new FileReader();


      reader.onload = () => {

        setAvatarImage(
          profileAvatar,
          reader.result
        );

      };


      reader.readAsDataURL(file);


      /*
       * Preview is shown locally.
       *
       * Actual upload requires a backend
       * endpoint such as:
       *
       * PATCH /api/employees/me/photo
       *
       * with multipart/form-data.
       */
    }
  );


  /* =====================================================
     PASSWORD MODAL
     ===================================================== */

  changePasswordBtn?.addEventListener(
    "click",
    () => {

      passwordModal?.classList.add(
        "show"
      );

    }
  );


  closePasswordModal?.addEventListener(
    "click",
    closePasswordModalFn
  );


  cancelPasswordBtn?.addEventListener(
    "click",
    closePasswordModalFn
  );


  passwordModal?.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        passwordModal
      ) {
        closePasswordModalFn();
      }

    }
  );


  function closePasswordModalFn() {

    passwordModal?.classList.remove(
      "show"
    );

    passwordForm?.reset();
  }


  /* =====================================================
     CHANGE PASSWORD
     ===================================================== */

  passwordForm?.addEventListener(
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


      const currentPassword =
        document.getElementById(
          "currentPassword"
        ).value;


      const newPassword =
        document.getElementById(
          "newPassword"
        ).value;


      const confirmPassword =
        document.getElementById(
          "confirmPassword"
        ).value;


      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        alert(
          "Please fill all password fields."
        );

        return;
      }


      if (
        newPassword.length < 6
      ) {

        alert(
          "New password must contain at least 6 characters."
        );

        return;
      }


      if (
        newPassword !==
        confirmPassword
      ) {

        alert(
          "New password and confirmation password do not match."
        );

        return;
      }


      const submitButton =
        passwordForm.querySelector(
          ".save-password-btn"
        );


      submitButton.disabled =
        true;

      submitButton.textContent =
        "Updating...";


      try {

        /*
         * Expected:
         * PATCH /api/employees/change-password
         */

        const response =
          await fetch(
            `${API_BASE_URL}/employees/change-password`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  currentPassword,
                  newPassword
                })
            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Failed to change password."
          );
        }


        alert(
          "Password changed successfully."
        );


        closePasswordModalFn();

      } catch (error) {

        console.error(
          "Change password error:",
          error
        );


        alert(
          error.message ||
          "Unable to change password."
        );

      } finally {

        submitButton.disabled =
          false;

        submitButton.textContent =
          "Update Password";
      }
    }
  );


  /* =====================================================
     AVATAR HELPERS
     ===================================================== */

  function setAvatarInitials(
    element,
    name
  ) {

    if (!element) {
      return;
    }


    const words =
      String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    let initials =
      "FA";


    if (words.length >= 2) {

      initials =
        (
          words[0][0] +
          words[words.length - 1][0]
        ).toUpperCase();

    } else if (
      words.length === 1
    ) {

      initials =
        words[0]
          .slice(0, 2)
          .toUpperCase();
    }


    element.innerHTML =
      escapeHTML(initials);
  }


  function setAvatarImage(
    element,
    source
  ) {

    if (!element) {
      return;
    }


    const img =
      document.createElement(
        "img"
      );


    img.src =
      source;

    img.alt =
      "Profile photo";


    element.innerHTML =
      "";

    element.appendChild(
      img
    );
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
        value ?? "-";
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


  function formatStatus(
    value
  ) {

    if (!value) {
      return "-";
    }


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


  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  loadProfile();
});
const express = require("express");

const {
  addEmployee,
  getEmployees,
} = require("../controllers/employeecontroller");
const { changePassword } = require("../controllers/profilecontroller");
const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("ADMIN", "RM"), addEmployee);
router.get("/", protect, authorizeRoles("ADMIN", "RM", "TM"), getEmployees);
router.patch("/change-password", protect, changePassword);

module.exports = router;

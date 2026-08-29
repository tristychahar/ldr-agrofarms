const express = require("express");

const {
  checkIn,
  checkOut,
  getTodayAttendance,
} = require("../controllers/attendancecontroller");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

router.post(
  "/check-in",
  protect,
  authorizeRoles("FA"),
  checkIn
);

router.post(
  "/check-out",
  protect,
  authorizeRoles("FA"),
  checkOut
);

router.get(
  "/today",
  protect,
  authorizeRoles("FA"),
  getTodayAttendance
);

module.exports = router;
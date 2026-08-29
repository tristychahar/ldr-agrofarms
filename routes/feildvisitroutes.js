const express = require("express");

const {
  createFieldVisit,
  getMyFieldVisits,
  getTodayFieldVisits,
} = require("../controllers/feildvisitcontroller");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

// Create field visit
router.post(
  "/",
  protect,
  authorizeRoles("FA"),
  createFieldVisit
);

// Get all my field visits
router.get(
  "/my",
  protect,
  authorizeRoles("FA"),
  getMyFieldVisits
);

// Get today's field visits
router.get(
  "/today",
  protect,
  authorizeRoles("FA"),
  getTodayFieldVisits
);

module.exports = router;
const express = require("express");

const {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  cancelLeave,
} = require("../controllers/leavecontroller");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

// Apply for leave
router.post(
  "/",
  protect,
  authorizeRoles("FA"),
  applyLeave
);

// Get my leave history
router.get(
  "/my",
  protect,
  authorizeRoles("FA"),
  getMyLeaves
);

// Get single leave
router.get(
  "/:id",
  protect,
  authorizeRoles("FA"),
  getLeaveById
);

// Cancel pending leave
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("FA"),
  cancelLeave
);

module.exports = router;
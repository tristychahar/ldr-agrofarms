const express = require("express");

const {
  createMeeting,
  getMyMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting
} = require("../controllers/meetingcontroller");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

// Create meeting
router.post(
  "/",
  protect,
  authorizeRoles("FA"),
  createMeeting
);

// Get my meetings
router.get(
  "/my",
  protect,
  authorizeRoles("FA"),
  getMyMeetings
);

// Get single meeting
router.get(
  "/:id",
  protect,
  authorizeRoles("FA"),
  getMeetingById
);

// Update meeting
router.put(
  "/:id",
  protect,
  authorizeRoles("FA"),
  updateMeeting
);

// Delete meeting
router.delete(
  "/:id",
  protect,
  authorizeRoles("FA"),
  deleteMeeting
);


module.exports = router;
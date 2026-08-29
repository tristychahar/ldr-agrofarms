const express = require("express");

const router = express.Router();

const {
  getMyNotifications,
  getUnreadNotifications,
  markAsRead,
} = require("../controllers/notificationcontroller");

const { protect } = require("../middleware/authmiddleware");

// routes...
router.get(
  "/my",
  protect,
  getMyNotifications
);


// ==========================================
// GET UNREAD NOTIFICATIONS
// GET /api/notifications/unread
// ==========================================

router.get(
  "/unread",
  protect,
  getUnreadNotifications
);


// ==========================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ==========================================

router.patch(
  "/:id/read",
  protect,
  markAsRead
);


module.exports = router;
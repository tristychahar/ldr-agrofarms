const express = require("express");

const {
  createTask,
  getMyTasks,
  getTaskById,
  updateTaskStatus,
  getPendingTasks,
} = require("../controllers/taskcontroller");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

// Create task
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN", "RM", "TM"),
  createTask
);

// My tasks
router.get(
  "/my",
  protect,
  authorizeRoles("FA"),
  getMyTasks
);

// Pending tasks
router.get(
  "/pending",
  protect,
  authorizeRoles("FA"),
  getPendingTasks
);

// Single task
router.get(
  "/:id",
  protect,
  authorizeRoles("FA"),
  getTaskById
);

// Update task status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("FA"),
  updateTaskStatus
);

module.exports = router;
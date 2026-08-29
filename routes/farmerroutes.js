const express = require("express");

const {
  createFarmer,
  getMyFarmers,
  getFarmerById,
  updateFarmer,
  deactivateFarmer,
} = require("../controllers/farmercontrollers");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

// Create farmer
router.post(
  "/",
  protect,
  authorizeRoles("FA"),
  createFarmer
);

// Get my farmers
router.get(
  "/my",
  protect,
  authorizeRoles("FA"),
  getMyFarmers
);

// Get single farmer
router.get(
  "/:id",
  protect,
  authorizeRoles("FA"),
  getFarmerById
);

// Update farmer
router.put(
  "/:id",
  protect,
  authorizeRoles("FA"),
  updateFarmer
);

// Deactivate farmer
router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles("FA"),
  deactivateFarmer
);

module.exports = router;
const express = require("express");

const { getFADashboard } = require("../controllers/dashboardcontroller");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

router.get(
  "/fa",
  protect,
  authorizeRoles("FA"),
  getFADashboard
);

module.exports = router;
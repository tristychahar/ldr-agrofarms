const express = require("express");

const { getMyProfile } = require("../controllers/profilecontroller");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/rolemiddleware");

const router = express.Router();

router.get(
  "/me",
  protect,
  authorizeRoles("FA"),
  getMyProfile
);

module.exports = router;
const express = require("express");

const {
  createUser,
  loginUser,
} = require("../controllers/authcontrollers");

const router = express.Router();

router.post("/create-user", createUser);
router.post("/login", loginUser);

module.exports = router;
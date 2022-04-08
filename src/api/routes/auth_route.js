const express = require("express");
const router = express.Router();

// Validate data middleware
const validateData = require("../middlewares/validate");
const registerController = require("../controllers/register_controller");
const loginController = require("../controllers/login_controller");

// Register route
router.post("/register", validateData, registerController);

// login route
router.post("/login", validateData, loginController);

module.exports = router;

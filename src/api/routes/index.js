const express = require("express");
const router = express.Router();

const authRoutes = require("./auth_route");

// Authentication routes
router.use("/auth", authRoutes);

module.exports = router;

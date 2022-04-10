const express = require("express");
const router = express.Router();

// Validate data middleware
const validateData = require("../middlewares/validate");
const registerController = require("../controllers/register_controller");
const loginController = require("../controllers/login_controller");

const {
  verifyOtpController,
  resendOtpController,
} = require("../controllers/otp_controller");
const {
  emailController,
  emailVerifiedController,
} = require("../controllers/email_verification_controller");
const {
  resetPasswordController,
  requestResetPasswordController,
} = require("../controllers/reset_password_controller");

// Register route
router.post("/register", validateData, registerController);

// login route
router.post("/login", validateData, loginController);

// otp verification route
router.post("/verifyOTP", validateData, verifyOtpController);

// resend otp verification
router.post("/resendOTPVerificationCode", validateData, resendOtpController);

// email verification route
router.get("/verify/:user_id/:uniqueString", validateData, emailController);

router.get("/verified/", emailVerifiedController);

// request password request
router.post("/requestPasswordReset", requestResetPasswordController);

// reset password
router.post("/resetPassword", validateData, resetPasswordController);

module.exports = router;

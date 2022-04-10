const { deleteVerificationData } = require("../../config/verification_db");
const authenticateOTP = require("../services/authenticate_otp");
const { sendOTPVerificationEmail } = require("../services/otp_verification");
const { sendError, sendSuccess } = require("../helpers/response_handler");
const {
  userVerifiedSucces,
  verificationSent,
} = require("../helpers/response_messages");

const verifyOtpController = async (req, res) => {
  try {
    // user id and otp from request body
    let user_id = req.body.user_id.trim();
    let otp = req.body.otp.trim();

    // verify otp
    await authenticateOTP({ user_id, otp });

    // return response
    sendSuccess(res, {}, userVerifiedSucces);
  } catch (error) {
    sendError(res, error);
  }
};

// resend otp route controller
const resendOtpController = async (req, res) => {
  try {
    // user id and otp from request body
    let user_id = req.body.user_id.trim();
    let email = req.body.email.trim();

    // delete existing verification data in the database
    await deleteVerificationData(user_id);

    // send new verification email
    const emailData = await sendOTPVerificationEmail({ user_id, email });

    // return response
    sendSuccess(res, emailData, verificationSent, 201);
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = { verifyOtpController, resendOtpController };

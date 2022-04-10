const { updateVerifiedStatus } = require("../../config/user_db");
const {
  getVerificationData,
  deleteVerificationData,
} = require("../../config/verification_db");
const { throwError } = require("../helpers/response_handler");
const {
  invalidOtpError,
  codeExpiredError,
} = require("../helpers/response_messages");
const verifyHashedData = require("../helpers/verifyHashedData");

// Authenticates a user given the user's email and password
// returns the authenticated user
const authenticateOTP = async ({ user_id, otp }) => {
  try {
    // get verification data
    const verificationData = await getVerificationData(user_id);

    // hashedString/hashed otp and expiry date
    const { expiresAt, hashedString } = verificationData;

    // checking if otp is still valid
    if (expiresAt < Date.now()) {
      await deleteVerificationData();
      throwError(codeExpiredError);
    }

    // verify otp
    const otpMatch = await verifyHashedData(otp, hashedString);

    // otp is incorrect
    if (!otpMatch) {
      throwError(invalidOtpError);
    }

    // update user verified status to true
    await updateVerifiedStatus(user_id);

    // delete verification data
    await deleteVerificationData(user_id);

    // authentication success return true
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = authenticateOTP;

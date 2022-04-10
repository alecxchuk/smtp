const { updateVerifiedStatus, deleteUser } = require("../../config/user_db");
const {
  getVerificationData,
  deleteVerificationData,
} = require("../../config/verification_db");
const { throwError } = require("../helpers/response_handler");
const {
  expiredEmailVerificationLinkError,
  invalidEmailVerificationLink,
} = require("../helpers/response_messages");
const verifyHashedData = require("../helpers/verifyHashedData");

// Authenticates a user given the user's email and password
// returns the authenticated user
const authenticateEmail = async ({ user_id, uniqueString }) => {
  try {
    // get verification data
    const verificationData = await getVerificationData(user_id, true);

    // email verification failed
    // return error
    if (!verificationData.user_id) {
      return { success: false, message: verificationData.message };
    }

    // hashedString/hashed email string and expiry date
    const { expiresAt, hashedString } = verificationData;

    // verification mail expired. Delete verification data and user from database
    // return error
    if (expiresAt < Date.now()) {
      await deleteVerificationData(user_id);
      await deleteUser(user_id);
      return { success: false, message: expiredEmailVerificationLinkError };
    }

    // verify email data
    const match = await verifyHashedData(uniqueString, hashedString);

    // email data is incorrect
    if (!match) {
      return { success: false, message: invalidEmailVerificationLink };
    }

    // update user verified status to true
    await updateVerifiedStatus(user_id);

    // delete verification data
    await deleteVerificationData(user_id);

    // authentication success return true
    return { success: true };
  } catch (error) {
    throw error;
  }
};

module.exports = authenticateEmail;

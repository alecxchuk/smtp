const {
  getPasswordResetData,
  deletePasswordResetData,
} = require("../../config/password_db");
const { updateUser } = require("../../config/user_db");
const hashGenerator = require("../helpers/hash_generator");
const { throwError } = require("../helpers/response_handler");
const {
  passwordResetLinkExpired,
  invalidPasswordResetLink,
} = require("../helpers/response_messages");
const verifyHashedData = require("../helpers/verifyHashedData");

//
const authenticateResetPassword = async ({
  user_id,
  resetString,
  newPassword,
}) => {
  try {
    // fetch password reset data from database
    const getResetData = await getPasswordResetData(user_id);

    // destructure result to get expiry
    const { expiresAt, hashedResetString } = getResetData;

    // checking if data is still valid. expires after 1hr
    if (expiresAt < Date.now()) {
      await deletePasswordResetData(user_id);
      throwError(passwordResetLinkExpired);
    }

    // checking if the link is valid
    const match = await verifyHashedData(resetString, hashedResetString);

    // password link is incorrect
    if (!match) {
      throwError(invalidPasswordResetLink);
    }

    // hash new password
    const hashedPassword = await hashGenerator(newPassword);

    // update user in database with new password
    await updateUser(user_id, "password", hashedPassword);

    // delete password reset data after reset password
    await deletePasswordResetData(user_id);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

module.exports = authenticateResetPassword;

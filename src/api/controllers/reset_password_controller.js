const { NULL } = require("mysql/lib/protocol/constants/types");
const { getPasswordResetData } = require("../../config/password_db");
const { findUserByEmail, updateUser } = require("../../config/user_db");
const hashGenerator = require("../helpers/hash_generator");
const {
  sendError,
  throwError,
  sendSuccess,
} = require("../helpers/response_handler");
const {
  noAccountWithEmailError,
  userNotVerified,
  passwordResetEmailSent,
  paswordResetSuccessful,
} = require("../helpers/response_messages");
const authenticateResetPassword = require("../services/authenticate_reset_password");
const sendResetEmail = require("../services/send_reset_email");

// requests reset password
const requestResetPasswordController = async (req, res) => {
  const { email, redirectUrl } = req.body;

  try {
    const user = await findUserByEmail(email);

    // user does not exist, throw error
    if (user === null) {
      throwError(noAccountWithEmailError);
    }

    // user has not been verified
    if (user.verified === 0) {
      throwError(userNotVerified);
    }

    // send reset email to user
    await sendResetEmail(user, redirectUrl, res);

    // response
    sendSuccess(res, {}, passwordResetEmailSent);

    // const emailSent = await sendResetEmail({ user_id, email });
  } catch (error) {
    sendError(res, error);
  }
};

// Resets the user password
// needs to be modified later to fit either the mobile perspective or
// web. Currently, resetString has to be added manually in the req body
const resetPasswordController = async (req, res) => {
  try {
    // validate reset link
    await authenticateResetPassword(req.body);

    // response
    sendSuccess(res, {}, paswordResetSuccessful);
  } catch (error) {
    console.log(error.message, 12312);
    sendError(res, error);
  }
};

module.exports = { resetPasswordController, requestResetPasswordController };

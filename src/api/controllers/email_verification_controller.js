const path = require("path");
const authenticateEmail = require("../services/authenticate_email");
const { sendError } = require("../helpers/response_handler");

// email verification controller
const emailController = async (req, res) => {
  try {
    // user id and unique string from request parameters
    let { user_id, uniqueString } = req.params;

    // verify email
    const response = await authenticateEmail({ user_id, uniqueString });

    // email verification failed
    if (!response.success) {
      return res.redirect(
        `/auth/verified/?error=true&message=${response.message}`
      );
    }

    // success go to success page
    res.sendFile(path.join(__dirname, "./../views/verified.html"));
  } catch (error) {
    sendError(res, error);
  }
};

// verified email controller
const emailVerifiedController = (req, res) => {
  res.sendFile(path.join(__dirname, "./../views/verified.html"));
};
module.exports = { emailController, emailVerifiedController };

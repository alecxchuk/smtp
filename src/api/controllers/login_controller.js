const authenticateUser = require("../services/authentication");
const jwtGenerator = require("../helpers/jwt_generator");
const { sendSuccess, sendError } = require("../helpers/response_handler");
const { signInSuccessful } = require("../helpers/response_messages");

// Login controller
const loginController = async (req, res) => {
  try {
    // email and password from request body
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    // checking if user is verified
    const authenticatedUser = await authenticateUser(email, password);

    // generate token
    const token = jwtGenerator(authenticatedUser.user_id);

    // removing password from response payload
    delete authenticatedUser.password;
    // add token to payload
    authenticatedUser.token = token;

    // response
    sendSuccess(res, authenticatedUser, signInSuccessful);
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = loginController;

const { findUserByEmail } = require("../../config/user_db");
const { throwError } = require("../helpers/response_handler");
const {
  emailOrPasswordIncorrect,
  userNotVerified,
} = require("../helpers/response_messages");
const verifyHashedData = require("../helpers/verifyHashedData");

// Authenticates a user given the user's email and password
// returns the authenticated user
const authenticateUser = async (email, password) => {
  try {
    // checking if user exists
    const user = await findUserByEmail(email);

    // user does not exist
    if (user === null) {
      throwError(emailOrPasswordIncorrect);
    }
    // user is not verified
    if (!user.verified) {
      throwError(userNotVerified, 403);
    }
    // hashed password
    const hashedPassword = user.password;
    // verify password
    const passwordMatch = await verifyHashedData(password, hashedPassword);

    // password is incorrect
    if (!passwordMatch) {
      throwError(emailOrPasswordIncorrect);
    }
    // returning the authenticated user
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = authenticateUser;

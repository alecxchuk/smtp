const hashGenerator = require("../helpers/hash_generator");
const { v4: uuidv4 } = require("uuid");

// otp verification controller
const { sendOTPVerificationEmail } = require("../services/otp_verification");
const { sendVerificationEmail } = require("../services/email_verification");
const { findUserByEmail, createUser } = require("../../config/user_db");
const {
  throwError,
  sendSuccess,
  sendError,
} = require("../helpers/response_handler");
const {
  userAlreadyExists,
  verificationSent,
} = require("../helpers/response_messages");

// register controller
const registerController = async (req, res) => {
  try {
    // getting user data from request body
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const address = req.body.address.trim();

    // encrypt password
    const hashedPassword = await hashGenerator(password);
    // Generate uuid
    const uuid = uuidv4();

    // Checking if user with email already exists in the database
    const userExists = await findUserByEmail(email);

    // throwing an error if user with email already exists
    if (userExists) {
      throwError(userAlreadyExists);
    }

    // User does not exist
    // register new User
    const newUser = await createUser({
      uuid,
      username,
      email,
      hashedPassword,
      address,
    });

    // send OTP to email
    // const emailData = await sendOTPVerificationEmail(newUser);
    // Send verification email
    const emailData = await sendVerificationEmail(newUser);

    // successful
    sendSuccess(res, emailData, verificationSent, 201);
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = registerController;

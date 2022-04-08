const hashGenerator = require("../helpers/hash_generator");
const { v4: uuidv4 } = require("uuid");
const mysqlConnection = require("../../config/connection");

// otp verification controller
const { sendOTPVerificationEmail } = require("../controllers/otp_verification");
const { sendVerificationEmail } = require("../controllers/email_verification");

// register controller
const registerController = async (req, res) => {
  try {
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const address = req.body.address.trim();

    const userExists = new Promise((resolve, reject) => {
      // Checking if user already exists in the database
      mysqlConnection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (error, result, fields) => {
          // Error occured while fetching from database
          // Throwing an error
          if (error) {
            reject({
              status: "FAILURE",
              message: "An error occured while fetching user from database",
            });
          }
          // User with email already exists in the database
          // returning a response with error message
          else if (result.length > 0) {
            reject({
              message: "User with the provided email already exists",
            });
          } else {
            resolve({ status: "SUCCESS" });
          }
        }
      );
    });
    await userExists;
    // User does not exist
    // register new User
    const newUser = await registerUser({
      username,
      email,
      password,
      address,
    });

    // send OTP to email
    const emailData = await sendOTPVerificationEmail(newUser);
    // Send verification email
    //   const emailData = await sendVerificationEmail(newUser);

    // successful
    res.json({
      status: "PENDING",
      message: "Verification email sent",
      data: emailData,
    });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

// Adds a user to the database
// parameter: user data containing name, email,password and address
const registerUser = async (data) => {
  try {
    const { username, email, password, address } = data;

    // encrypt password
    const hashedPassword = await hashGenerator(password);
    // Generate uuid
    const uuid = uuidv4();

    // adds the user to the database
    // returns the user email and user_id
    return new Promise((resolve, reject) => {
      // saving new user to database
      mysqlConnection.query(
        "INSERT INTO  users(user_id,username,email,password,address) VALUES (?,?,?,?,?)",
        [uuid, username, email, hashedPassword, address],
        (error) => {
          if (error) {
            reject({ message: "Error adding user from database" });
          } else {
            // getting user id and email from database
            const users = new Promise((resolve, reject) => {
              mysqlConnection.query(
                "SELECT * FROM users WHERE email = ?",
                [email],
                (error, result, xx) => {
                  if (error || result.length === 0) {
                    reject({ message: "Error fetching user from database" });
                  }
                  // user email and user id
                  const email = result[0].email;
                  const user_id = result[0].user_id;

                  resolve({ email, user_id });
                }
              );
            });
            resolve(users);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

module.exports = registerController;

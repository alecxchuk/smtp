// This middleware validates user data for the
// register route

const { inValidEmail } = require("../helpers/response_messages");

// login route
const validateData = (req, res, next) => {
  const { email, username, password, address } = req.body;

  // Validate email function
  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }
  // Validate password function
  // TODO: check out allowing password without uppercase letter
  function validatePassword(userPassword) {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/.test(
      userPassword
    );
  }
  console.log(req.path, 8989);
  try {
    // register request
    if (req.path === "/register") {
      // checking if any credential is missing
      if (![email, username, password, address].every(Boolean)) {
        return res.json({ status: "FAILED", message: "Missing credentials" });
        // checking for invalid email
      } else if (!validEmail(email)) {
        return res.json({ status: "FAILED", message: "Email is invalid" });
        // checking for invalid password
        // password should contain at least  8
      } else if (!validatePassword(password)) {
        return res.json({
          status: "FAILED",
          message:
            "Password must be at least 8 character and have at least 1 uppercase and special character ",
        });
        // checking for invalid name
        // name should contain at least 3 characters
      } else if (username.length < 3) {
        return res.json({
          status: "FAILED",
          message: "Name must have at least 3 characters",
        });
        // checking for invalid address
        // address should contain at least 3 characters
      } else if (address.length < 3) {
        return res.json({
          status: "FAILED",
          message: "Address must have at least 3 characters",
        });
      }
    } else if (req.path === "/login") {
      if (![email, password].every(Boolean)) {
        return res.json({ status: "FAILED", message: "Email is invalid" });
        //   return res.json("Missing Credentials");
      } else if (!validEmail(email)) {
        return sendError(res, { code: 403, message: inValidEmail });
      }
      // checking for invalid password
      // password should contain at least  8
      else if (!validatePassword(password)) {
        return res.json({
          status: "FAILED",
          message:
            "Password must be at least 8 character and have at least 1 uppercase and special character ",
        });
        // checking for invalid name
        // name should contain at least 3 characters
      }
    } else if (req.path === "/verifyOTP") {
      // otp payload
      const { user_id, otp } = req.body;
      if (![user_id, otp].every(Boolean)) {
        return res.json({
          status: "FAILED",
          message: "Missing otp credentials",
        });
        //   return res.json("Missing Credentials");
      }
    } else if (req.path === "/resendOTPVerificationCode") {
      // otp payload
      const { user_id, email } = req.body;
      if (![user_id, email].every(Boolean)) {
        return res.json({
          status: "FAILED",
          message: "Missing otp credentials",
        });
      }
    } else if (req.path === "/resetPassword") {
      const { user_id, resetString, newPassword } = req.body;
      if (![user_id, resetString, newPassword].every(Boolean)) {
        return res.json({
          status: "FAILED",
          message: "Missing credentials",
        });
      } else if (!validatePassword(newPassword)) {
        return res.json({
          status: "FAILED",
          message:
            "Password must be at least 8 character and have at least 1 uppercase and special character ",
        });
      }
    }
  } catch (error) {
    throw error;
  }

  next();
};

module.exports = validateData;

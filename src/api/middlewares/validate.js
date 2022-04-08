// This middleware validates user data for the
// register route
// login route
const validateData = (req, res, next) => {
  const { email, username, password, address } = req.body;

  // Validate email function
  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }
  // Validate password function
  function validatePassword(userPassword) {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/.test(
      userPassword
    );
  }

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
    } else if (!validatePassword(password)) {
      return res.json({
        status: "FAILED",
        message:
          "Password must be at least 8 character and have at least 1 uppercase and special character ",
      });
      // checking for invalid name
      // name should contain at least 3 characters
    }
  } catch (error) {
    throw error;
  }

  next();
};

module.exports = validateData;

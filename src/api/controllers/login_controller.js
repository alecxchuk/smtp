const authenticatUser = require("./authentication");
const jwtGenerator = require("../helpers/jwt_generator");

// Login controller
const loginController = async (req, res) => {
  try {
    // email and password from request body
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    // checking if user is verified
    const authenticatedUser = authenticatUser(email, password);

    // generate token
    const token = jwtGenerator(authenticatedUser.user_id);

    res.json({
      status: "SUCCESS",
      messager: "Sign in successful",
      data: authenticatedUser,
      token,
    });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

module.exports = loginController;

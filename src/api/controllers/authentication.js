const { findUserByEmail } = require("../helpers/find_user");
const verifyHashedData = require("../helpers/verifyHashedData");

// Authenticates a user given the user's email and password
// returns the authenticated user
const authenticatUser = async (email, password) => {
  try {
    // checking if user exists
    const user = await findUserByEmail(email);

    // user does not exist
    if (user === null) {
      throw new Error("Incorrect email or password");
    }
    // user is not verified
    if (!user.verified) {
      throw new Error("User email has not been verified yet. Check your inbox");
    }
    // hashed password
    const hashedPassword = user.password;
    // verify password
    const passwordMatch = await verifyHashedData(password, hashedPassword);

    // password is incorrect
    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = authenticatUser;

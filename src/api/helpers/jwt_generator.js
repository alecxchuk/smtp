const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(user_id) {
  // jwt payload
  // contains the user's id
  const payload = {
    user: user_id,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1hr" });
}

module.exports = jwtGenerator;

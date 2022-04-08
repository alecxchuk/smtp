const jwt = require("jsonwebtoken");

function jwtGenerator(user_id) {
  // jwt payload
  // contains the user's id
  const payload = {
    user: user_id,
  };

  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "1hr" });
}

module.exports = jwtGenerator;

const jwt = require("jsonwebtoken");
const { throwError, sendError } = require("../helpers/response_handler");
const { notAuthorized } = require("../helpers/response_messages");

const verifyToken = async (req, res, next) => {
  try {
    // get token from request header
    const jwtToken = req.header("token");
    // checking if token doesn't exist
    if (!jwtToken) {
      // throw error
      throwError(notAuthorized, 403);
    }
    // verify the token with the jwt secret
    // returns payload from token if verified
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

    req.user = payload.user;
    next();
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = verifyToken;

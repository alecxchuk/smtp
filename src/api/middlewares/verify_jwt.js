const { throwError } = require("../helpers/response_handler");
const { notAuthorized } = require("../helpers/response_messages");

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];

  try {
    if (!token) {
      throwError("No token found");
    } else {
      // verify token
      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
          throwError(notAuthorized);
        } else {
          req.user_id = decoded.id;
          next();
        }
      });
    }
  } catch (error) {
    throw error;
  }
};

module.exports = verifyJWT;

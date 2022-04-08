const mysqlConnection = require("../../../connection");

const findUserByEmail = async (email) => {
  try {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (error, result) => {
          if (error) {
            reject({
              message: "An error occured when retrieving user from database",
            });
          }

          if (result.length < 1) {
            resolve(null);
          } else {
            resolve(result[0]);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { findUserByEmail };

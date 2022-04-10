const {
  fetchPasswordResetDataError,
  passwordResetRecordNotFound,
  deletePasswordResetError,
} = require("../api/helpers/response_messages");
const mysqlConnection = require("./connection");

// fetches password data from database by id
const getPasswordResetData = async (user_id) => {
  try {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(
        "SELECT * FROM passwordreset WHERE user_id =?",
        [user_id],
        async (error, result) => {
          // error occured while fetching data from db
          if (error) {
            reject({
              message: fetchPasswordResetDataError,
            });
          }

          // password reset record not found
          if (result.length < 1) {
            // no record found
            reject({ message: passwordResetRecordNotFound });
          }
          //   return password data
          resolve(result[0]);
        }
      );
    });
  } catch (error) {
    console.log(error, 090911);
    throw error;
  }
};

const deletePasswordResetData = (user_id) => {
  return new Promise((resolve, reject) => {
    mysqlConnection.query(
      "DELETE FROM passwordreset WHERE user_id = ?",
      [user_id],
      (error) => {
        // error deleting password reset data
        if (error) {
          reject({
            message: deletePasswordResetError,
          });
        } else {
          resolve({ success: true });
        }
      }
    );
  });
};

// This function inserts the hashed reset password data into the mySql database
const createPasswordResetData = (data) => {
  try {
    // deconstruct input parameter to get otp details
    const { createdAt, expiresAt, user_id, hashedResetString } = data;
    return new Promise((resolve, reject) => {
      // Adding the hashed OTP to the database
      mysqlConnection.query(
        "INSERT INTO  passwordreset(user_id,hashedResetString,createdAt,expiresAt) VALUES (?,?,?,?)",
        [user_id, hashedResetString, createdAt, expiresAt],
        (error) => {
          // error occured while inserting data to database
          if (error) {
            reject({
              message: errorSavingVerificationData,
            });
          }

          resolve({ success: true });
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getPasswordResetData,
  deletePasswordResetData,
  createPasswordResetData,
};

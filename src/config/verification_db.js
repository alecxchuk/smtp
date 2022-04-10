const {
  errorSavingVerificationData,
  fetchVerificationError,
  verificationRecordNotFound,
  errorDeletingVerificationData,
} = require("../api/helpers/response_messages");
const mysqlConnection = require("./connection");

// This function inserts the hashed otp data into the mySql database
const createVerificationData = (data) => {
  try {
    // deconstruct input parameter to get otp details
    const { createdAt, expiresAt, user_id, hashedOTP } = data;
    return new Promise((resolve, reject) => {
      // Adding the hashed OTP to the database
      mysqlConnection.query(
        "INSERT INTO  verification(user_id,hashedString,createdAt,expiresAt) VALUES (?,?,?,?)",
        [user_id, hashedOTP, createdAt, expiresAt],
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

// fetches verification data from database by id
const getVerificationData = (user_id, is_email = false) => {
  try {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(
        "SELECT * FROM verification WHERE user_id = ?",
        [user_id],
        (error, result) => {
          if (error) {
            if (is_email) {
              return resolve({ message: fetchVerificationError });
            } else {
              reject({
                message: fetchVerificationError,
              });
            }
          }

          if (result.length < 1) {
            if (is_email) {
              return resolve({ message: verificationRecordNotFound });
            } else {
              // no record found
              reject({ message: verificationRecordNotFound });
            }
          } else {
            // verification record found
            resolve(result[0]);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

// deletes a verification data from database using user id
const deleteVerificationData = (user_id) => {
  try {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(
        "DELETE FROM verification WHERE user_id = ?",
        [user_id],
        (error) => {
          if (error) {
            console.log(error, 565645634);
            reject({ message: errorDeletingVerificationData });
          }

          resolve({ success: true });
        }
      );
    });
  } catch (error) {
    console.log(error, 8039330);

    throw error;
  }
};

module.exports = {
  createVerificationData,
  getVerificationData,
  deleteVerificationData,
};

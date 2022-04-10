const mysqlConnection = require("./connection");
const {
  addToDbError,
  fetchUserError,
  fetchUserAfterInsertError,
  updateVerifiedStatusError,
  deleteUserError,
  updateUserInfoError,
} = require("../api/helpers/response_messages");

const findUserByEmail = async (email) => {
  try {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (error, result) => {
          if (error) {
            reject({
              message: fetchUserError,
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

//  Add user to data base
const createUser = ({ uuid, username, email, hashedPassword, address }) => {
  try {
    // adds the user to the database
    // returns the user email and user_id
    return new Promise((resolve, reject) => {
      // saving new user to database
      mysqlConnection.query(
        "INSERT INTO  users(user_id,username,email,password,address) VALUES (?,?,?,?,?)",
        [uuid, username, email, hashedPassword, address],
        async (error, result) => {
          // error inserting user to database
          if (error) {
            reject({ message: addToDbError });
          } else {
            // getting user id and email from database
            const user = await findUserByEmail(email);

            // no user with email was found
            if (user === null) {
              reject({
                message: fetchUserAfterInsertError,
              });
            }
            // user email and user id
            const user_email = user.email;
            const user_id = user.user_id;

            resolve({ email: user_email, user_id });
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

// deletes user from database
const deleteUser = (user_id) => {
  try {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(
        "DELETE FROM users WHERE user_id = ?",
        [user_id],
        (error) => {
          if (error) {
            reject({ message: deleteUserError });
          }

          resolve({ success: true });
        }
      );
    });
  } catch (error) {
    throw error;
  }
};
// updates user verified status
const updateVerifiedStatus = (user_id) => {
  try {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(
        "UPDATE users SET verified = ? WHERE user_id = ?",
        [1, user_id],
        (error) => {
          if (error) {
            reject({ message: updateVerifiedStatusError });
          }

          resolve({ success: true });
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

// updates user property
const updateUser = (user_id, property, newValue) => {
  try {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(
        `UPDATE users SET ${property} = ? WHERE user_id = ?`,
        [newValue, user_id],
        (error) => {
          if (error) {
            reject({ message: updateUserInfoError });
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
  findUserByEmail,
  createUser,
  updateVerifiedStatus,
  deleteUser,
  updateUser,
};

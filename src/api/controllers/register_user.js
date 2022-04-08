const hashGenerator = require("../helpers/hash_generator");
const { v4: uuidv4 } = require("uuid");
const mysqlConnection = require("../../config/connection");

// Adds a user to the database
// parameter: user data containing name, email,password and address
const registerUser = async (data) => {
  try {
    const { username, email, password, address } = data;

    // encrypt password
    const hashedPassword = await hashGenerator(password);
    // Generate uuid
    const uuid = uuidv4();

    // adds the user to the database
    // returns the user email and user_id
    return new Promise((resolve, reject) => {
      // saving new user to database
      mysqlConnection.query(
        "INSERT INTO  users(user_id,username,email,password,address) VALUES (?,?,?,?,?)",
        [uuid, username, email, hashedPassword, address],
        (error) => {
          if (error) {
            reject({ message: "Error adding user from database" });
          } else {
            // getting user id and email from database
            const users = new Promise((resolve, reject) => {
              mysqlConnection.query(
                "SELECT * FROM users WHERE email = ?",
                [email],
                (error, result, xx) => {
                  if (error || result.length === 0) {
                    reject({ message: "Error fetching user from database" });
                  }
                  // user email and user id
                  const email = result[0].email;
                  const user_id = result[0].user_id;

                  resolve({ email, user_id });
                }
              );
            });
            resolve(users);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { registerUser };

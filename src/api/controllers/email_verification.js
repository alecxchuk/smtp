const mysqlConnection = require("../../../connection");
const { v4: uuidv4 } = require("uuid");
const hashGenerator = require("../helpers/hash_generator");
const sendEmail = require("../helpers/send_email");

const sendVerificationEmail = async ({ user_id, email }) => {
  try {
    // url to be used in the email
    const currentUrl = "http://localhost:3000/";

    const uniqueString = uuidv4() + user_id;
    const createdAt = Date.now();
    const expiresAt = Date.now() + 21600000;

    //  mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your Email",
      html: `<p>Verify your email address to complete the signup and login into your account</p>
      <p>This link <b>expires in 15 minutes</b>.</p><p>Press <a href=${
        currentUrl + "verify/" + user_id + "/" + uniqueString
      }>here</a> to proceed </p>`,
    };

    // hash otp
    const hashedOTP = await hashGenerator(uniqueString);

    const insertVerification = new Promise((resolve, reject) => {
      // Adding the hashed OTP to the database
      mysqlConnection.query(
        "INSERT INTO  verification(userId,hashedString,createdAt,expiresAt) VALUES (?,?,?,?)",
        [user_id, hashedOTP, createdAt, expiresAt],
        async (error) => {
          if (error) {
            reject({
              message: "Couldn't save verification email data!",
            });
          }

          resolve({ status: "SUCCESS" });
        }
      );
    });
    await insertVerification;
    // Send email
    await sendEmail(mailOptions);

    // returning the user_id and email of user
    return {
      user_id,
      email,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
};

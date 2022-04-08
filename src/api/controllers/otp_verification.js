const generateOTP = require("../helpers/otp_generator");
const hashGenerator = require("../helpers/hash_generator");
const mysqlConnection = require("../../config/connection");
const sendEmail = require("../helpers/send_email");
// Send OTP verification
const sendOTPVerificationEmail = async ({ user_id, email }, res) => {
  console.log(user_id, 1234);
  const createdAt = Date.now();
  const expiresAt = Date.now() + 3600000;
  try {
    // generate random
    const otp = await generateOTP();

    // mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the signup</p><p>This code <b>expires in 1 hour</b>.</p>`,
    };

    // hash otp
    const hashedOTP = await hashGenerator(otp);

    const inserVerification = new Promise((resolve, reject) => {
      // Adding the hashed OTP to the database
      mysqlConnection.query(
        "INSERT INTO  verification(userId,hashedString,createdAt,expiresAt) VALUES (?,?,?,?)",
        [user_id, hashedOTP, createdAt, expiresAt],
        async (error) => {
          if (error) {
            reject({
              message: "An error occured while adding verification detail",
            });
          }

          resolve({ status: "SUCCESS" });
        }
      );
    });

    await inserVerification;

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
  sendOTPVerificationEmail,
};

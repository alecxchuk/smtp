const generateOTP = require("../helpers/otp_generator");
const hashGenerator = require("../helpers/hash_generator");
const sendEmail = require("../helpers/send_email");
const { createVerificationData } = require("../../config/verification_db");
// Send OTP verification
const sendOTPVerificationEmail = async ({ user_id, email }, res) => {
  // otp creation time
  const createdAt = Date.now();
  // otp expires in one hour
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

    // save verification data to database
    await createVerificationData({
      createdAt,
      expiresAt,
      user_id,
      hashedOTP,
    });

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

const { v4: uuidv4 } = require("uuid");
const hashGenerator = require("../helpers/hash_generator");
const sendEmail = require("../helpers/send_email");
const { createVerificationData } = require("../../config/verification_db");
require("dotenv").config();

const sendVerificationEmail = async ({ user_id, email }) => {
  try {
    // url to be used in the email
    const currentUrl = process.env.CURRENT_URL;

    // Unique string
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
        currentUrl + "auth/verify/" + user_id + "/" + uniqueString
      }>here</a> to proceed </p>`,
    };

    // hash unique string
    const hashedOTP = await hashGenerator(uniqueString);

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
  sendVerificationEmail,
};

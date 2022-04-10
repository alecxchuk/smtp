const { v4: uuidv4 } = require("uuid");
const {
  deletePasswordResetData,
  createPasswordResetData,
} = require("../../config/password_db");
const hashGenerator = require("../helpers/hash_generator");
const sendEmail = require("../helpers/send_email");
require("dotenv").config();

// Send password reset mail
const sendResetEmail = async ({ user_id, email }, redirectUrl, res) => {
  const resetString = uuidv4() + user_id;
  const createdAt = Date.now();
  const expiresAt = Date.now() + 3600000;

  // Clear all existing reset records
  await deletePasswordResetData();

  //  mail options
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Password Reset",
    html: `<p>Click on the link below to rest your password</p>
<p>This link <b>expires in 60 minutes</b>.</p><p>Press <a href=${
      redirectUrl + "/" + user_id + "/" + resetString
    }>here</a> to proceed </p>`,
  };

  // hash reset string
  const hashedResetString = await hashGenerator(resetString);

  // create password reset data
  await createPasswordResetData({
    createdAt,
    expiresAt,
    user_id,
    hashedResetString,
  });

  // send email
  await sendEmail(mailOptions);
  // returning the user_id and email of user
  return true;

  // Clear all existing reset records
  mysqlConnection.query(
    "DELETE FROM passwordreset WHERE user_id = ?",
    [user_id],
    (err, result, field) => {
      if (!err) {
        // Reset record deleted successfully
        // Send the mail
        //  mail options
        const mailOptions = {
          from: process.env.AUTH_EMAIL,
          to: email,
          subject: "Password Reset",
          html: `<p>Click on the link below to rest your password</p>
      <p>This link <b>expires in 60 minutes</b>.</p><p>Press <a href=${
        redirectUrl + "/" + user_id + "/" + resetString
      }>here</a> to proceed </p>`,
        };

        bcrypt
          .hash(resetString, saltRounds)
          .then((hashedResetString) => {
            //set values in password reset table
            mysqlConnection.query(
              "INSERT INTO  passwordreset(user_id,hashedResetString,createdAt,expiresAt) VALUES (?,?,?,?)",
              [user_id, hashedResetString, createdAt, expiresAt],
              (error, row, fields) => {
                if (!error) {
                  transporter
                    .sendMail(mailOptions)
                    .then(
                      res.json({
                        status: "PENDING",
                        message: "Password reset email sent",
                      })
                    )
                    .catch((err) => {
                      console.log(err);
                      res.json({
                        status: "FAILED",
                        message: "Password reset mail failed",
                      });
                    });
                } else {
                  console.log(error);
                  res.json({
                    status: "FAILED",
                    message: "Could'nt save password data",
                  });
                }
              }
            );
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: "FAILED",
              message: "An error occured while hashing the password reset data",
            });
          });
      } else {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "Clearing existing password reset records failed",
        });
      }
    }
  );
};

module.exports = sendResetEmail;

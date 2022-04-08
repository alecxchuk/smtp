const express = require("express");

const Router = express.Router();
const mysqlConnection = require("../connection");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");

// email handler
const nodemailer = require("nodemailer");

// uuid
const { v4: uuidv4 } = require("uuid");

// env variables
require("dotenv").config();

//path for static verified page
const path = require("path");

// nodemailer setup
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// testing transporter
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

Router.post(
  "/register",
  [
    check("username", "This username must be 3+ characters long")
      .exists()
      .isLength({ min: 3 }),
    check("email", "Email is not valid").exists().isEmail().normalizeEmail(),
    check(
      "password",
      "Password must be at least 8 character and have at least 1 uppercase and special character "
    )
      .isLength({ min: 8 })
      .not()
      .isLowercase()
      .not()
      .isUppercase()
      .not()
      .isNumeric()
      .not()
      .isAlpha(),
  ],
  (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const address = req.body.address;

    const errors = validationResult(req);

    console.log("sksksk");
    if (!errors.isEmpty()) {
      // throw new Error(errors.array()[0].msg);
      return res.json({
        status: "FAILED",
        message: errors.array()[0].msg,
      });
    }
    //   console.log(username, email, password, address);

    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        return res.send({ err: err });
      }

      const uuid = uuidv4();
      mysqlConnection.query(
        "INSERT INTO  users(user_id,username,email,password,address) VALUES (?,?,?,?,?)",
        [uuid, username, email, hash, address],
        (err, result, field) => {
          if (!err) {
            // handle account verification
            mysqlConnection.query(
              "SELECT * FROM users WHERE email = ?",
              [email],
              (error, row, xx) => {
                if (!error) {
                  console.log(row[0], "aabb");
                  //   sendVerificationEmail(row[0], res);
                  sendOTPVerificationEmail(row[0], res);

                  //   res.json({ msg: "success" });
                } else {
                  console.log(error);
                  res.json({
                    message: "Error fetching user from database",
                  });
                }
              }
            );
          } else {
            console.log(err);
            res.json({
              message: err,
            });
          }
        }
      );
    });
  }
);

const sendVerificationEmail = ({ user_id, email }, res) => {
  console.log(user_id, email, "kkik");
  // url to be used in the email
  const currentUrl = "http://localhost:3000/";

  const uniqueString = uuidv4() + user_id;
  const createdAt = Date.now();
  const expiresAt = Date.now() + 21600000;

  console.log(createdAt, expiresAt, "lolo");

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

  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedString) => {
      // set values in verification collection
      // const newVerifi 600000
      mysqlConnection.query(
        "INSERT INTO  verification(userId,hashedString,createdAt,expiresAt) VALUES (?,?,?,?)",
        [user_id, hashedString, createdAt, expiresAt],
        (err, result, field) => {
          if (!err) {
            transporter
              .sendMail(mailOptions)
              .then(() => {
                res.json({
                  status: "PENDING",
                  message: "Verification email sent",
                });
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  status: "FAILED",
                  message: "Verification email failed",
                });
              });
            //   res.json({ msg: "success" });
          } else {
            console.log(err);
            res.json({
              status: "FAILED",
              message: "Couldn't save verification email data!",
            });
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "FAILED",
        message: "An error occured while hashing email data!",
      });
    });
};

Router.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;

  mysqlConnection.query(
    "SELECT * FROM verification WHERE userId = ?",
    [userId],
    (err, result, field) => {
      if (!err) {
        if (result.length > 0) {
          // user verification record exists

          const { expiresAt } = result[0];
          console.log(result[0], "qqwwwwwwww");
          const { hashedString } = result[0];

          if (expiresAt < Date.now()) {
            // record has expired so we delete it
            mysqlConnection.query(
              "DELETE * FROM verification WHERE userId = ?)",
              [userId],
              (err, rows, field) => {
                if (!err) {
                  mysqlConnection.query(
                    "DELETE FROM users WHERE user_id = ?",
                    [userId],
                    (err, result, field) => {
                      if (!err) {
                        let message = "Link has expired. Please sign up again";
                        res.redirect(
                          `/verified/error = true&message=${message}`
                        );
                      } else {
                        console.log(err);
                        let message =
                          "An error occured while clearing expired user record";
                        res.redirect(
                          `/verified/error = true&message=${message}`
                        );
                      }
                    }
                  );
                } else {
                  console.log(err);
                  let message =
                    "An error occured while clearing expired user verification record";
                  res.redirect(`/verified/error = true&message=${message}`);
                }
              }
            );
          } else {
            // valid record
            // Compare hashed string
            console.log(hashedString, uniqueString, "oooooo");
            bcrypt
              .compare(uniqueString, hashedString)
              .then((result) => {
                if (result) {
                  // strings match
                  mysqlConnection.query(
                    "UPDATE users SET verified = ? WHERE user_id = ?",
                    [1, userId],
                    (err, result, field) => {
                      if (!err) {
                        mysqlConnection.query(
                          "DELETE FROM verification WHERE userId = ?",
                          [userId],
                          (error, row, field) => {
                            if (!error) {
                              res.sendFile(
                                path.join(__dirname, "./../views/verified.html")
                              );
                            } else {
                              console.log(error);
                              let message =
                                "An error occured while finalizing successful verification";
                              res.redirect(
                                `/verified/error=true&message=${message}`
                              );
                            }
                          }
                        );
                      } else {
                        console.log(err);
                        let message =
                          "An error occured while finalizing successful verification";
                        res.redirect(
                          `/verified/error = true&message=${message}`
                        );
                      }
                    }
                  );
                  // .then(() => {
                  //   mysqlConnection
                  //     .query("DELETE FROM verification WHERE userId = ?)", [
                  //       userId,
                  //     ])
                  //     .then(() => {
                  //       res.sendFile(
                  //         path.join(__dirname, "./../views/verified.html")
                  //       );
                  //     })
                  //     .catch((err) => {
                  //       console.log(err);
                  //       let message =
                  //         "An error occured while finalizing successful verification";
                  //       res.redirect(
                  //         `/verified/error = true&message=${message}`
                  //       );
                  //     });
                  // })
                  // .catch((err) => {
                  //   let message =
                  //     "An error occured while updating user record to show verified";
                  //   res.redirect(`/verified/error = true&message=${message}`);
                  // });
                } else {
                  console.log("err");

                  // existing record but incorrect verification details passed
                  let message =
                    "Invalid verification details passed. Check your inbox";
                  res.redirect(`/verified/error = true&message=${message}`);
                }
              })
              .catch((err) => {
                console.log(err);
                console.log("qqqq");
                let message = "An error occured while clearing  unique strings";
                res.redirect(`/verified/error=true&message=${message}`);
              });
          }
        } else {
          console.log(err);
          console.log("pppx");
          let message =
            "Account record doesn't exist or has been verified already. Please sign up or log in";
          res.redirect(`/verified/error = true&message=${message}`);
        }
      } else {
        console.log(err);
        console.log("sss");
        let message =
          "An error occurred while checking for existing user verification record";
        res.redirect(`/verified/error=true&message=${message}`);
      }
    }
  );
});

Router.get("/verified/", (req, res) => {
  //   let { error, message } = req.params;
  console.log(req.params, "ppoopoo");

  res.sendFile(path.join(__dirname, "./../views/verified.html"));
});

Router.post(
  "/login",
  [
    check("email", "Email is not valid").exists().isEmail().normalizeEmail(),
    check(
      "password",
      "Password must be at least 8 character and have at least 1 uppercase and 1 special character "
    )
      .isLength({ min: 8 })
      .not()
      .isLowercase()
      .not()
      .isUppercase()
      .not()
      .isNumeric()
      .not()
      .isAlpha(),
  ],

  (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if (errors) {
      console.log(errors, "sss");
      const errMsg = errors.errors[0].msg;
      return res.json({ status: "FAILED", message: errMsg });
    }

    mysqlConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, rows, field) => {
        if (!err) {
          if (rows.length > 0) {
            console.log(rows, "aa");
            // check if user is verified
            if (!rows[0].verified) {
              res.json({
                auth: false,
                message: "User email has not been verified. Check your mail",
              });
            } else {
              bcrypt
                .compare(password, rows[0].password)
                .then((result) => {
                  if (result) {
                    const id = rows[0].id;

                    const token = jwt.sign({ id }, "jwtSecret", {
                      expiresIn: 300,
                    });
                    req.session.user = rows[0];

                    res.json({
                      auth: true,
                      token: token,
                      results: rows.length,
                      user: rows[0],
                    });
                  } else {
                    res.json({
                      auth: false,
                      message: "email or password not correct",
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.json({ auth: false, message: "Wrong email or password" });
                });
            }
          } else {
            return res.json({
              auth: false,
              message: "User does not exist",
            });
          }
        } else {
          return res.send({ error: error });
        }
      }
    );
  }
);

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    res.send("Yo, we need a token");
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      console.log(err);
      if (err) {
        res.json({
          auth: false,
          message: "You failed to authenticate",
        });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

Router.get("/isUserAuth", verifyJWT, (req, res) => {
  res.send("Yo, you are authenticated");
});

// reset password
Router.post("/requestPasswordReset", (req, res) => {
  const { email, redirectUrl } = req.body;

  mysqlConnection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result, field) => {
      if (!err) {
        if (result.length > 0) {
          // users exists

          // check if user has been verified
          if (!result[0].verified) {
            res.json({
              status: "FAILED",
              message: "Email hasn't been verified yet. Check you inbox",
            });
          } else {
            // proceed with password reset
            sendResetEmail(result[0], redirectUrl, res);
          }
        } else {
          res.json({
            status: "FAILED",
            message: "No account with the supplied email exists",
          });
        }
      } else {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occured while checking for existing user",
        });
      }
    }
  );
});

// Send password reset mail
const sendResetEmail = ({ user_id, email }, redirectUrl, res) => {
  const resetString = uuidv4() + user_id;
  const createdAt = Date.now();
  const expiresAt = Date.now() + 3600000;

  //    Clear all existing reset records
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

// Reset password route
Router.post("/resetPassword", (req, res) => {
  const { user_id, resetString, newPassword } = req.body;

  // check if reset string exists
  mysqlConnection.query(
    "SELECT * FROM passwordreset WHERE user_id =?",
    [user_id],
    (err, result, field) => {
      if (!err) {
        if (result.length > 0) {
          // password reset record exists so we proceed

          // destructure result to get expiry
          const { expiresAt, hashedResetString } = result[0];

          // check if the password request is expired
          if (expiresAt < Date.now()) {
            mysqlConnection.query(
              "DELETE FROM passwordreset WHERE user_id = ?",
              [user_id],
              (error, row, fields) => {
                if (!error) {
                  // Reset record deleted successfulty
                  res.json({
                    status: "FAILED",
                    message: "Password reset link has expired",
                  });
                } else {
                  console.log(error);
                  res.json({
                    status: "FAILED",
                    message: "Clearing password reset failed",
                  });
                }
              }
            );
          } else {
            // valid reset record exists so we validate the reset string
            // First compare the hashed reset string
            console.log(resetString, hashedResetString, "bbbbbn");
            bcrypt
              .compare(resetString, hashedResetString)
              .then((result) => {
                if (result) {
                  // Strings match
                  // hash password again

                  bcrypt
                    .hash(newPassword, saltRounds)
                    .then((hashNewPassword) => {
                      mysqlConnection.query(
                        "UPDATE users SET password = ? WHERE user_id = ?",
                        [hashNewPassword, user_id],
                        (err, data, field) => {
                          if (!err) {
                            // update successful. Now delete password reseet
                            mysqlConnection.query(
                              "DELETE FROM passwordreset where user_id = ?",
                              [user_id],
                              (err, datas, field) => {
                                if (!err) {
                                  // both user record and password record updated
                                  res.json({
                                    status: "SUCCESS",
                                    message:
                                      "Password has been reset successfully",
                                  });
                                } else {
                                  console.log(err);
                                  res.json({
                                    status: "FAILED",
                                    message:
                                      "An error occured while finalizing password reset",
                                  });
                                }
                              }
                            );
                          } else {
                            console.log(err);
                            res.json({
                              status: "FAILED",
                              message: "Updating user password failed",
                            });
                          }
                        }
                      );
                    })
                    .catch((err) => {
                      console.log(err);
                      res.json({
                        status: "FAILED",
                        message: "An error occured while hashing new password",
                      });
                    });
                } else {
                  // Existing record but incorrect reset string passed
                  res.json({
                    status: "FAILED",
                    message: "Comparing password reset strings failed",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  status: "FAILED",
                  message: "Password reset request not found",
                });
              });
          }
        } else {
          // passwordd reset record doesn't exist
          res.json({
            status: "FAILED",
            message: "Password reset request not found",
          });
        }
      } else {
        res.json({
          status: "FAILED",
          message: "Checking for existing password rest record failed.",
        });
      }
    }
  );
});

// Send OTP verification
const sendOTPVerificationEmail = async ({ user_id, email }, res) => {
  const createdAt = Date.now();
  const expiresAt = Date.now() + 3600000;
  try {
    // generate random
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    // mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the signup</p><p>This code <b>expires in 1 hour</b>.</p>`,
    };

    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const newOTPVerification = await mysqlConnection.query(
      "INSERT INTO  verification(userId,hashedString,createdAt,expiresAt) VALUES (?,?,?,?)",
      [user_id, hashedOTP, createdAt, expiresAt]
    );

    await transporter.sendMail(mailOptions);

    res.json({
      status: "PENDING",
      message: "Verification otp email sent",
      data: {
        user_id,
        email,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

Router.post("/verifyOTP", async (req, res) => {
  try {
    let { userId, otp } = req.body;

    if (!userId || !otp) {
      throw Error("Empty otp details are not allowed");
    }

    mysqlConnection.query(
      "SELECT * FROM verification WHERE userId = ?",
      [userId],
      async (error, results, fields) => {
        try {
          if (error) {
            throw new Error("An error occured while getting verification data");
          }
          if (results.length < 1) {
            // no record found
            throw new Error(
              "Account record doesn't exist or has been verified already. Please sign up again"
            );
          }
          // user otp record exists
          const { expiresAt } = results[0];
          const hashedOTP = results[0].hashedString;

          if (expiresAt < Date.now()) {
            mysqlConnection.query("DELETE FROM verification WHERE userId = ?", [
              userId,
            ]);
            throw new Error("Code has expired. Please request again");
          }

          console.log(hashedOTP, 5555);

          const validOTP = await bcrypt.compare(otp, hashedOTP);

          console.log(validOTP, 5555);
          if (!validOTP) {
            // Supplied otp is wrong
            throw new Error("Invalid code passed. check your inbox");
          }

          mysqlConnection.query(
            "UPDATE users SET verified = ? WHERE user_id = ?",
            [1, userId]
          );

          mysqlConnection.query("DELETE FROM verification WHERE userId = ?", [
            userId,
          ]);

          res.json({
            status: "VERIFIED",
            message: "User email verified successfully",
          });
        } catch (error) {
          res.json({
            status: "FAILED",
            message: error.message,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
});

// resend verification
Router.post("/resendOTPVerificationCode", async (req, res) => {
  try {
    let { userId, email } = req.body;

    if (!userId || !email) {
      throw Error("Empty user details are not allowed");
    }

    mysqlConnection.query(
      "DELETE FROM verification WHERE userId = ?",
      [userId],
      (error, result, fields) => {
        try {
          if (error) {
            throw new Error(
              "An error occured when deleting verification info from database"
            );
          }

          sendOTPVerificationEmail({ user_id: userId, email }, res);
        } catch (error) {
          res.json({
            status: "FAILED",
            message: error.message,
          });
        }
      }
    );
  } catch (error) {}
});
module.exports = Router;

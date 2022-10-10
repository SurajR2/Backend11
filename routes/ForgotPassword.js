const express = require("express");
const router = express.Router();
const db = require("../db-config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

var randtoken = require("rand-token");

router.get("/", (req, res) => res.send({ message: "forgotpassword" }));
const sendEmail = async (email, token) => {
  let testAccount = await nodemailer.createTestAccount();
  console.log(testAccount);

  var email = email;
  var token = token;
  var mail = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "surajrasaili190@gmail.com",
      pass: "qhphewrlghngwscj",
    },
  });
  var mailOptions = {
    from: "digitallibrary@gmail.com",
    to: email,
    subject: "Reset Password Link",
    html:
      '<p>You requested for reset password, kindly use this <a href="http://localhost:3000/api/reset-password?token=' +
      token +
      '">link</a> to reset your password</p>',
  };
  mail.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("something went wrong: " + error.message);
    } else {
      console.log("sucessfully sent email");
    }
  });
};

router.post("/", function (req, res) {
  var email = req.body.email;

  db.query(
    'SELECT * FROM users WHERE email ="' + email + '"',
    function (err, result) {
      if (err) {
        console.log("something went wrong: " + err.message);
      }

      console.log(result[0]);
      let id = result[0].id;
      if (result[0].email.length > 0) {
        const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
          expiresIn: "5m",
        });
        sendEmail(email, token);
        res.end();
        // //
        // const id = result[0].id;
        // console.log(id);
        // console.log(token);
        // const link = `http://localhost:8000/api/resetpassword/${id}/${token}`;
        // console.log(link);
        // res.send("Link Has Been Sent");
      }
    }
  );
});
module.exports = router;

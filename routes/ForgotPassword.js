const express = require("express");
const router = express.Router();
const db = require("../db-config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

var randtoken = require("rand-token");

router.get("/", (req, res) => res.send({ message: "forgotpassword" }));
const sendEmail = async (id,email, token) => {
  

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
    from: "digital library at nec ",
    to: email,
    subject: "Reset Password Link",
    text:`http://localhost:8000/api/resetpassword/${id}/${token}`,
    // html:
    //   '<p>You requested for reset password, kindly use this <a href="http://localhost:3000/api/reset-password?token=' +
    //   token +
    //   '">link</a> to reset your password</p>',
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
  try {
    const email = req.body.email;
    db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err)
        throw err;
      if (result.length > 0) {
        const id = result[0].id;
        console.log(result);

        const secret = process.env.JWT_TOKEN + result[0].password;
        const payload = {
          email: result[0].email,
          id: id
        };
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });
        console.log("token" + token);
        sendEmail(id, email, token);
        res.end();


      }
      else {
        res.status(400).send({ msg: "Provided Email doesnt exist " });
      }
    }
  )
         
} catch (error) {
    res.status(400).send(`ERROR :`+error.message)
    
}
});
module.exports = router;

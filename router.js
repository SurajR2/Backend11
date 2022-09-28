const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./db-config");
require("dotenv").config();
var nodemailer = require("nodemailer");
flash = require("express-flash");
const serveIndex = require("serve-index");
const fileUpload = require("express-fileupload");

app.use(fileUpload());

app.get("/", (req, res) => {
  res.send({ message: "api is working" });
});
app.use(flash());

const registerRoute = require("./routes/Register");
const LoginRoute = require("./routes/Login");
app.use("/register", registerRoute);
app.use("/login", registerRoute);

async function sendEmail(email, token) {
  let testAccount = await nodemailer.createTestAccount();
  console.log(testAccount);

  var email = email;
  var token = token;
  var mail = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  var mailOptions = {
    from: "noreply@gmail.com",
    to: email,
    subject: "Reset Password Link",
    html:
      '<p>You requested for reset password, kindly use this <a href="http://localhost:3000/reset-password?token=' +
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
}
const ForgotPasswordRoute = require("./routes/ForgotPassword");
app.use("/forgotpassword", ForgotPasswordRoute);
const resetPasswordRoute = require("./routes/ResetPassword");
app.use("/resetpassword/:id/:token", resetPasswordRoute);
const uploadRoute = require("./routes/upload");
app.use("/upload", uploadRoute);

app.get("/getBooks/:id", (req, res) => {
  let book_semester_id = req.params.id;
  db.query(
    `SELECT book_id,book_name,path,book_semester_id FROM books WHERE book_semester_id=?`,
    [book_semester_id],
    (err, fileInfo) => {
      const result = Object.values(JSON.parse(JSON.stringify(fileInfo)));
      if (err) throw err;
      console.log(result);

      res.send(result);
    }
  );
});
app.get("/searchBook/:search", (req, res) => {
  let search = req.params.search;
  console.log(search);
  db.query(
    `SELECT book_name , path FROM books where book_name LIKE '%${search}%'`,
    (err, fileInfo) => {
      const result = Object.values(JSON.parse(JSON.stringify(fileInfo)));
      if (err) throw err;
      console.log(result);

      res.send(result);
    }
  );
});
app.use(
  "/ftp",
  express.static("static"),
  serveIndex("static", { icons: true })
);
app.get("/getPath/:book_id", (req, res) => {
  let { book_id } = req.params;
  db.query(
    `SELECT path from books where book_id =?`,
    [book_id],
    (err, data) => {
      let path = Object.values(JSON.parse(JSON.stringify(data)));
      res.writeHead(302, {
        Location: `${path}`,
      });
      res.end();
    }
  );
});

module.exports = app;

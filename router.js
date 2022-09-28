const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./db-config");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var randtoken = require("rand-token");
const fs = require("fs");
var nodemailer = require("nodemailer");
const { reset } = require("nodemon");
flash = require("express-flash");
const serveIndex = require("serve-index");
const fileUpload = require("express-fileupload");

app.use(fileUpload());

app.use(flash());
app.get("/", (req, res) => {
  res.send({ message: "api is working" });
});

const registerRoute = require("./routes/Register");
const LoginRoute = require("./routes/Login");
app.use("/register", registerRoute);
app.use("/login", registerRoute);

app.get("/logout", function (req, res) {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).send("status:sucessfully logged out");
});

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

app.get("/resetpassword/:id/:token", (req, res) => {
  const { id, token } = req.params;
  // res.send(req.params);

  db.query(
    'SELECT * FROM users WHERE id ="' + id + '"',
    function (err, result) {
      if (err) {
        console.log("something went wrong: " + err.message);
      }

      console.log(result[0]);
      // id = result[0].id;
      //Verifying The Token(Id is Exists In Database or not)
      if (id !== result[0].id) {
        res.send("Invalid Id");
        return;
      }

      //if valid user and id
      const secret = process.env.JWT_SECRET;
      try {
        const payload = jwt.verify(token, secret); //If JWT verify failed to verify catch black Will be executed
        // res.render("resetpassword", { email: user.email });
      } catch (error) {
        console.log(error.message);
        res.send(error.message + "Make Another Request");
      }
    }
  );
});
app.post("/resetpassword/:id/:token", (req, res) => {
  const { id, token } = req.params;
  // res.send(user);

  const { password, confirmpassword } = req.body;
  db.query(
    'SELECT * FROM users WHERE id ="' + id + '"',
    function (err, result) {
      if (err) throw err;
      if (id !== result[0].id) {
        res.send("Invalid Id");
        return;
      }

      //Validating Token
      const secret = process.env.JWT_SECRET;
      try {
        const payload = jwt.verify(token, secret);

        //validating password
        if ((password = null)) {
          console.log("password cannot be blank");
          res.send.status(201).send("password cannot be blank");
        }
        if (password.length < 6) {
          console.log("password length must be 6 characters");
          res.send
            .status(201)
            .send("password length must be  at least 6 characters");
        }

        if (confirmpassword == null) {
          console.log("confirmpassword cannot be blank");
          res.status(201).send("confirmpassword cannot be blank");
        }
        if (password == confirmpassword) {
          console.log("password and confirm passwoord do not match");
          res.status(201).send("password and confirm passwoords do not match");
        }
        var saltRounds = 10;
        // var hash = bcrypt.hash(password, saltRounds);
        bcrypt.genSalt(saltRounds, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            var data = {
              password: hash,
            };
          });
        });

        //finding user with email  and id and updating password
        db.query(
          `UPDATE users SET ? WHERE id=${result[0].id}`,
          [data],
          (res) => {
            console.log("password has been updated successfully");
            res.status("200").send("password has been updated successfully");
          }
        );
        //Hashing The Password
        // res.send(user);
        res.send("Password Updated Successfully");
      } catch (error) {
        console.log(error.message);
        res.send(error.message);
      }
    }
  );
});

// app.post("/resetpassword", function (req, res) {
//   let password = req.body.password;
//   let confirmpassword = req.body.confirmpassword;
//   console.log(req.body);

//   if ((password = null)) {
//     console.log("password cannot be blank");
//     res.send.status(201).send("password cannot be blank");
//   }
//   // if(password.length<6)
//   // {
//   //     console.log("password length must be 6 characters");
//   //     res.send.status(201).send("password length must be  at least 6 characters");
//   // }

//   if (confirmpassword == null) {
//     console.log("confirmpassword cannot be blank");
//     res.status(201).send("confirmpassword cannot be blank");
//   }
//   if (password == confirmpassword) {
//     console.log("password and confirm passwoord do not match");
//     res.status(201).send("password and confirm passwoords do not match");
//   }

//   db.query(
//     'SELECT * FROM users WHERE id ="' + id + '"',
//     function (err, result) {
//       if (err) throw err;

//       if (result.length > 0) {
//         var saltRounds = 10;
//         // var hash = bcrypt.hash(password, saltRounds);
//         bcrypt.genSalt(saltRounds, function (err, salt) {
//           bcrypt.hash(password, salt, function (err, hash) {
//             var data = {
//               password: hash,
//             };
//             db.query(
//               'UPDATE users SET ? WHERE email ="' + result[0].email + '"',
//               data,
//               function (err, result) {
//                 if (err) throw err;
//                 else {
//                   console.log("password has been updated successfully");
//                   res
//                     .status("200")
//                     .send("password has been updated successfully");
//                 }
//               }
//             );
//           });
//         });
//         // type = "success";
//         // msg = "Your password has been updated successfully";
//       } else {
//         console.log("Invalid link; please try again");
//       }

//       res.end();
//     }
//   );
// });

app.get("/", function (req, res) {
  var filePath = "/static/file";

  fs.readFile(__dirname + filePath, function (err, data) {
    res.contentType("application/pdf/windows 2000.pdf");
    res.send(data);
  });
});

app.use("/ftp", express.static("static"), serveIndex("static"));

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
app.post("/upload", (request, response) => {
  const id = request.body.id;
  const pdf = request.files.file;
  console.log(request.body, request.files);
  const filename = pdf.name;
  if (!pdf) return response.status(400).send("No File Uploaded ");
  // if( !id)return response.status(400).status("please enter semester id ");
  console.log(pdf);
  const semesters = {
    1: "first sem",
    2: "second sem",
    3: "third sem",
    4: "fourth sem",
    5: "fifth sem",
    6: "sixth sem",
    7: "seventh sem",
    8: "eight sem",
  };
  Object.entries(semesters).forEach(([key, value]) => {
    if (id !== key) return;
    let path = `${value}/${filename}`;
    pdf.mv(`./static/${value}/${filename}`, (err) => {
      response.send({
        status: "sucess",
        msg: "sucessfully moved",
        path: path,
      });
      db.query(
        "insert into books(book_name,path,book_semester_id) values(?,?,?)",
        [filename, path, id],
        (err) => {
          if (err) throw err;

          console.log("sucesufully added into the database");
          console.log({
            status: "sucess",
            msg: "sucessufully added to the database",
          });
        }
      );
    });
  });
});

module.exports = app;

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

app.use(flash());
app.get("/", (req, res) => {
  res.send({ message: "api is working" });
});
app.get("/login", (req, res) => {
  res.send({ message: "Hello" });
});

app.get("/register", (req, res) => {
  res.send({ message: "working" });
});

app.post(
  "/register",
  [
    body("fullname", "Fullname is required ").not().isEmpty(),
    body("username", "Name is requied").not().isEmpty(),
    body("email", "Please include a valid email")
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: true }),
    body("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
  ],
  function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    let { fullname, username, email, password } = request.body;
    db.query(
      "SELECT COUNT(*) AS cnt FROM users WHERE email = ? ",

      request.body.email,
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          if (data[0].cnt > 0) {
            response.status(409).send("sorry email already in use");
          } else {
            bcrypt.hash(password, 10, (err, hash) => {
              if (err) {
                return res.status(500).send({ msg: err });
              } else {
                db.query(
                  "insert into users(fullname,username,email, password) values (?,?,?,?)",
                  [fullname, username, email, hash],
                  function (err, result) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(result);
                      response.status(200).send("registered successfully");
                    }
                    response.end();
                  }
                );
              }
            });
          }
        }
      }
    );
  }
);

// app.get("/test", (req, res) => {
//   const filePath = __dirname + "/static/pdf/Windows2000.pdf";

//   res.send({
//     file_location: filePath,
//   });
// });

app.post(
  "/login",
  [
    body("email", "Please include a valid email")
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: true }),
    body("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
  ],
  function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    const { email, password } = request.body;
    console.log(request.body);
    // let email = request.body.email;
    // let password = request.body.password;
    console.log(request.body);
    if (email && password) {
      db.query(
        "SELECT email FROM users WHERE email = ?",
        [email],
        (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            let hashedPassword = bcrypt.hashSync(password, 10);
            bcrypt.compare(password, hashedPassword, function (err, result) {
              if (result) {
                const token = jwt.sign({ email }, process.env.JWT_TOKEN, {
                  expiresIn: process.env.JWT_EXPIRES,
                });
                const refreshToken = jwt.sign(
                  { email },
                  "refresh_token_secret",
                  { expiresIn: "1d" }
                );
                response.cookie("jwt", refreshToken, {
                  httpOnly: true,
                  sameSite: "None",
                  secure: true,
                  maxAge: 3 * 24 * 60 * 60 * 1000,
                });
                return response.json(token);
              } else {
                response.status(201).send(`${err}: incorrect password`);
              }
            });
          } else {
            response.status(201).send(`${err}: Incorrect email`);
          }
        }
      );
    } else {
      response.send("Please enter email and password!");
      response.end();
    }
  }
);

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

//net test
// app.post("/forgotpassword", (req, res) => {
//   const { email } = req.body;

//   //If User Not Exists
//   if (email !== user.email) {
//     res.send("User Is Not Registered");
//     console.log(req.body);
//     return;
//   }

//   //If User Exists Sending One Time Link
//   const secret = JWT_SECRET + user.password; //Secret Generated For User
//   const payload = {
//     email: user.email,
//     id: user.id,
//   };

//   const token = jwt.sign(payload, secret, { expiresIn: "10s" });
//   const link = `http://localhost:3000/reset-password/${user.id}/${token}`;
//   console.log(link);
//   res.send("Link Has Been Sent");
// });

app.get("/resetpassword/:id/:token", (req, res) => {
  const { id, token } = req.params;
  // res.send(req.params);

  db.query(`SELECT * FROM users WHERE id=${id} `, function (err, result) {
    if (err) {
      console.log("something went wrong: " + err.message);
    }

    console.log(result[0]);
    //Verifying The Token(Id is Exists In Database or not)
    if (id != result[0].id) {
      res.send("Invalid Id");
      return;
    }

    //if valid user and id
    const secret = process.env.JWT_TOKEN + result[0].id;
    try {
      const payload = jwt.verify(token, secret); //If JWT verify failed to verify catch black Will be executed
      // console.log(payload);
      res.render("resetpassword", { email: result[0].email });
    } catch (error) {
      console.log(error.message);
      res.send(error.message + "Make Another Request");
    }
  });
});

app.post("/resetpassword/:id/:token", (req, res) => {
  const { id, token } = req.params;
  // res.send(user);

  const { password, confirmpassword } = req.body;
  db.query(
    'SELECT * FROM users WHERE id ="' + id + '"',
    function (err, result) {
      if (err) throw err;
      console.log(id);
      console.log(result[0].id);
      if (id != result[0].id) {
        res.send("Invalid Id");
        return;
      }

      //Validating Token
      const secret = process.env.JWT_SECRET + result[0].id;
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

//net test
/* send reset password link in email */
app.post("/forgotpassword", function (req, res) {
  var email = req.body.email;

  db.query(
    'SELECT * FROM users WHERE email ="' + email + '"',
    function (err, result) {
      if (err) {
        console.log("something went wrong: " + err.message);
      }

      console.log(result[0]);
      // let id = result[0].id;
      if (result[0].email.length > 0) {
        //
        const id = result[0].id;
        console.log(id);
        const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
          expiresIn: "5m",
        });
        console.log(token);
        const link = `http://localhost:8000/api/resetpassword/${id}/${token}`;
        console.log(link);
        res.send("Link Has Been Sent");
      }
    }
  );
});

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

module.exports = app;

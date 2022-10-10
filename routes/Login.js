const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../db-config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var randtoken = require("rand-token");

router.get("/", (req, res) => {
  res.send({ message: "Login" });
});
router.post(
  "/",
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
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            let hashedPassword = result[0].password;
            console.log(hashedPassword);
            console.log(await bcrypt.compare(password, hashedPassword));
            await bcrypt.compare(
              password,
              hashedPassword,
              function (err, result) {
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
              }
            );
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
module.exports = router;

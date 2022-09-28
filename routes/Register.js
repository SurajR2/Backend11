const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

router.get("/", (req, res) => {
  res.send({ message: "working" });
});

router.post(
  "/",
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

module.exports = router;

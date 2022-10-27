const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db-config");
const bcrypt = require("bcrypt");

const securepassword = async (password) => {
  try {
    const hashedpassword = await bcrypt.hash(password, 10);
    return hashedpassword;
  } catch (error) {
    console.log(error);
  }
};
router.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  // res.send(req.params);}

  db.query(
    'SELECT * FROM users WHERE id ="' + id + '"',
    async (err, result) => {
      if (err) {
        console.log("something went wrong: " + err.message);
        res.end();
      }

      console.log(result);
      //Verifying The Token(Id is Exists In Database or not)
      if (id != result[0].id) {
        res.send("Invalid Id");
        return;
      }

      //if valid user and id
      const secret = process.env.JWT_TOKEN + result[0].password;
      try {
        const { password, confirmpassword } = req.body;

        const payload = jwt.verify(token, secret);
        console.log("log after token validated");
        //If JWT verify failed to verify catch black Will be executed
        //validating password
        console.log("log before password length");
        if (password & (password.length < 1)) {
          console.log("password cannot be blank");
          res.send.status(201).send("password cannot be blank");
        }

        if (password.length < 6) {
          console.log("password length must be 6 characters");
          res
            .status(201)
            .send("password length must be  at least 6 characters");
        }
        if (confirmpassword & (confirmpassword.length < 1)) {
          console.log("confirmpassword cannot be blank");
          res.status(201).send("confirmpassword cannot be blank");
        }

        console.log("log before compare password and confirmpassword");
        if (password != confirmpassword) {
          console.log("password and confirm passwoord do not match");
          res.status(201).send("password and confirm passwoords do not match");
        }
        //
        var spassword = await securepassword(password);
        //finding user with email  and id and updating password

        db.query(
          `UPDATE users SET password=? WHERE id=${result[0].id}`,
          [spassword],
          async (err, result) => {
            if (result) {
              console.log("password has been updated successfully");
              res.status(200).send("password has been updated successfully");
              res.end();
            }
          }
        );
      } catch (error) {
        console.log(error);
        res.send(error.message + " Make Another Request");
      }
    }
  );
});

module.exports = router;

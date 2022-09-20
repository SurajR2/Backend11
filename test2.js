const db = require("./db-config");

app.post("/forgotpassword", (req, res) => {
  const { email } = req.body;

  //If User Not Exists
  if (email !== user.email) {
    res.send("User Is Not Registered");
    console.log(req.body);
    return;
  }

  //If User Exists Sending One Time Link
  const secret = process.env.JWT_SECRET + user.password; //Secret Generated For User
  const payload = {
    email: user.email,
    id: user.id,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "10s" });
  const link = `http://localhost:3000/reset-password/${user.id}/${token}`;
  console.log(link);
  res.send("Link Has Been Sent");
});

app.get("/resetpassword/:id/:token", (req, res) => {
  const { id, token } = req.params;
  // res.send(req.params);

  db.query(
    'SELECT * FROM users WHERE email ="' + email + '"',
    function (err, result) {
      if (err) {
        console.log("something went wrong: " + err.message);
      }

      console.log(result[0]);
      id = result[0].id;
      //Verifying The Token(Id is Exists In Database or not)
      if (id !== result[0].id) {
        res.send("Invalid Id");
        return;
      }

      //if valid user and id
      const secret = JWT_SECRET + result[0].id;
      try {
        const payload = jwt.verify(token, secret); //If JWT verify failed to verify catch black Will be executed
        res.render("reset-password", { email: user.email });
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
      const secret = JWT_SECRET + result[0].id;
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

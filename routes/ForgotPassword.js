const express = require("express");
const router = express.Router();

router.post("/", function (req, res) {
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
module.exports = router;

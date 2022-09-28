const express = require("express");
const router = express.Router();

router.get("/logout", function (req, res) {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).send("status:sucessfully logged out");
});
module.exports = router;

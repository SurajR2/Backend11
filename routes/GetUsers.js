const { json } = require("body-parser");
const express = require("express");
const { jsonp } = require("server/reply");
const db = require("../db-config");

const router = express.Router();

router.get("/", async (req, res) => {
  let { email } = req.query;
  console.log(req.query);
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) throw err;
    res.send(results[0]);
    console.log(results[0]);
  });
});

module.exports = router;

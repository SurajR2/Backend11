const express = require("express");
const router = express.Router();
const db = require("../db-config");

router.get("/:search", (req, res) => {
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
module.exports = router;

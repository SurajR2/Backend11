const express = require("express");
const db = require("../db-config");
const router = express.Router();

router.get("/:id", (req, res) => {
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
module.exports = router;

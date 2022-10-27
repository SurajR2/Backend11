const express = require("express");
const router = express.Router();
const db = require("../db-config");

router.get("/", (req, res) => {
  let { user_id } = req.query;
  console.log(user_id);
  db.query(
    `select * from books where book_id in (select book_id from user_book  where user_id =${user_id})`,
    (err, result) => {
      console.log(result);
      const response = Object.values(JSON.parse(JSON.stringify(result)));

      res.send(response).status(200);
    }
  );
});

router.post("/", (req, res) => {
  console.log("hello");
  let { book_id, user_id } = req.body;
  let postUserBook = db.query(
    "insert into user_book(user_id , book_id) values (?,?)",
    [user_id, book_id]
  );
  res.send({ message: "success" }).status(200);
});

module.exports = router;

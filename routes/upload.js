const express = require("express");
const router = express.Router();

require("dotenv").config();

router.post("/upload", (request, response) => {
  const id = request.body.id;
  const pdf = request.files.file;
  console.log(request.body, request.files);
  const filename = pdf.name;
  if (!pdf) return response.status(400).send("No File Uploaded ");
  // if( !id)return response.status(400).status("please enter semester id ");
  console.log(pdf);
  const semesters = {
    1: "first sem",
    2: "second sem",
    3: "third sem",
    4: "fourth sem",
    5: "fifth sem",
    6: "sixth sem",
    7: "seventh sem",
    8: "eight sem",
  };
  Object.entries(semesters).forEach(([key, value]) => {
    if (id !== key) return;
    let path = `${value}/${filename}`;
    pdf.mv(`./static/${value}/${filename}`, (err) => {
      response.send({
        status: "sucess",
        msg: "sucessfully moved",
        path: path,
      });
      db.query(
        "insert into books(book_name,path,book_semester_id) values(?,?,?)",
        [filename, path, id],
        (err) => {
          if (err) throw err;

          console.log("sucesufully added into the database");
          console.log({
            status: "sucess",
            msg: "sucessufully added to the database",
          });
        }
      );
    });
  });
});
module.exports = router;

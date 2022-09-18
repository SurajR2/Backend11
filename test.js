// const db = require("./db-config");
// const express = require("express");
// const { json } = require("body-parser");
// const app = express();
// const path = require("path");
// app.use(express.json());
// const fs = require("fs");

// const semesters = {
//   1: "first sem",
//   2: "second sem",
//   3: "third sem",
//   4: "fourth sem",
//   5: "fifth sem",
//   6: "sixth sem",
//   7: "seventh sem",
//   8: "eight sem",
// };

// let url = "file:///D:/test/Backend11/";
// var filePath = "/static/pdf";
// db.query(`select path from books where book_name='Database'`, (err, res) => {
//   const result = Object.values(JSON.parse(JSON.stringify(res)));
//   result.forEach((index) => {
//     // console.log(index.path)
//     let file_url = `${url + index.path}`;
//     console.log(file_url);
//   });
// });

// Object.entries(semesters).forEach(([key, value]) => {
//   setTimeout(() => {
//     const files = fs.readdirSync(`${__dirname}/static/${value}`); // get the names of all files in the foler
//     //   console.log(__dirname);
//     for (file of files) {
//       // console.log(file);

//       let fullpath = path.join(`${__dirname}/static/${value}/${file}`);
//       // console.log(fullpath);

//       db.query(
//         `insert into books (book_name,path, book_semester_id) values ('${file}','${fullpath}',${key})`
//       );
//     }
//   }, 1000);
// });

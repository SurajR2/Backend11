const db = require("./db-config");
const express = require("express");
const { json } = require("body-parser");
const app = express();
const path = require("path");
app.use(express.json());
const fs = require("fs");

const files = fs.readdirSync(`${__dirname}/static/pdf`); // get the names of all files in the foler
console.log(__dirname);
 for(file of files ){
    // console.log(file);
        
    let fullpath=path.join(`${__dirname}/static/pdf/${file}`);
    console.log(fullpath);
    setTimeout(()=>{
        // db.query(`insert into books (book_id, book_name,path, book_semester_id) values ('','${file}','${fullpath}',1)`);
        console.log(`insert into books (book_id, book_name,path, book_semester_id) values ('','${file}','${fullpath}',1)`)
    },150);
 }

let url = "file:///D:/test/Backend11/"
var filePath = "/static/pdf";
db.query(`select path from books where book_name='Database'`,
(err,res)=>{
    const result = Object.values(JSON.parse(JSON.stringify(res)));
    result.forEach((index)=>{
        
        // console.log(index.path) 
    let file_url= `${url+index.path}`;
    console.log(file_url);
    }
    );
}
);



















// const semesters = { 
//     1:"first",
//     2:"second",
//     3:"third",
//     4:"fourth",
//     5:"fifth",
//     6:"sixth",
//     7:"seventh",
//     8:"eighth",
// }

// Object.entries(semesters).forEach(([key,value])=>{
//     console.log(key,value);

//         db.query(`insert into semesters (semester_id , semester_name) values (${key},'${value}')`);

// })
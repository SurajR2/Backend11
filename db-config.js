const mysql = require("mysql");

// const db = mysql.createConnection({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_HOST,
// });

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "digital_library",
});
module.exports = db;

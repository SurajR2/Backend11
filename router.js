const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./db-config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response, request } = require("express");

app.get("/login", (req, res) => {
    res.send({ message: "Hello" });
});
app.post("/login", function (request, response) {
    // Capture the input fields
    let email = request.body.email;
    let password = request.body.password;
    let username = request.body.username;
    // Ensure the input fields exists and are not empty
    console.log(request.body);
    if (email && password) {
        // Execute SQL query that'll select the account from the database based on the specified email and password
        db.query(
            "SELECT email, password FROM users WHERE email = ? AND password = ?",
            [email, password],
            function (error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists
                if (results.length > 0) {
                    // Authenticate the user
                    response.send("Logged in successfully");
                } else {
                    response.send("Incorrect email and/or password!");
                }
                response.end();
            }
        );
    } else {
        response.send("Please enter email and password!");
        response.end();
    }
});

// app.post("/login", (req, res) => {
//     var email = request.body.email;
//     var password = request.body.password;
//     db.query(
//         "SELECT email, password FROM userlogin where email = ? and password =? ",
//         [email, password],
//         function (error, results, fields) {
//             if (error) throw error;
//             if (results.length > 0) {
//                 req.session.loggedin = true;
//                 req.session.email = email;
//                 return res.status(200).send({
//                     msg: "Logged in successfully",
//                 });
//             }
//         }
//     );
// });
module.exports = app;

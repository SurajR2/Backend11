const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./db-config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response, request, query } = require("express");

app.get("/login", (req, res) => {
    res.send({ message: "Hello" });
});
app.get("/register", (req, res) => {
    res.send({ message: "working" });
});
app.post("/register", function (request, response) {
    let fullname = request.body.fullname;
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password;
    db.query(
        "insert into register_user(fullname,username,email, password) values (?,?,?,?)",
        [fullname, username, email, password],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                response.status(200).send("registered successfully");
            }
            response.end();
        }
    );
    console.log(request.body);
});
app.post("/login", function (request, response) {
    // Capture the input fields
    let email = request.body.email;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    console.log(request.body);
    if (email && password) {
        // Execute SQL query that'll select the account from the database based on the specified email and password
        db.query(
            "SELECT email, password FROM register_user WHERE email = ? AND password = ?",
            [email, password],
            function (error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists
                if (results.length > 0) {
                    // Authenticate the user
                    response.status(200).send("Logged in successfully");
                } else {
                    response
                        .status(201)
                        .send("Incorrect email and/or password!");
                }
                response.end();
            }
        );
    } else {
        response.send("Please enter email and password!");
        response.end();
    }
});

module.exports = app;

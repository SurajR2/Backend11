const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./db-config");
require("dotenv").config();
flash = require("express-flash");
const serveIndex = require("serve-index");

const ForgotPasswordRoute = require("./routes/ForgotPassword");
const LoginRoute = require("./routes/Login");
const registerRoute = require("./routes/Register");
const getBooks = require("./routes/GetBooks");
const searchBook = require("./routes/SearchBook");
const uploadBook = require("./routes/UploadBook");

app.use(flash());
app.get("/", (req, res) => {
  res.send({ message: "api is working" });
});

app.use("/register", registerRoute);
app.use("/login", LoginRoute);
app.use("/forgotpassword", ForgotPasswordRoute);
app.use("/getBook", getBooks);
app.use("/searchBook", searchBook);
app.use("/upload", uploadBook);
app.use(express.static("static"), serveIndex("static", { icons: true }));

app.get("/logout", function (req, res) {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).send("status:sucessfully logged out");
});
module.exports = app;

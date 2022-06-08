const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const login = require("./controllers/login");
const router = require("./router");
app.use(express.json());
app.use(cors());

app.use("/api", router);
app.listen(3000, () =>
  console.log("Server is running at: http://localhost:3000 ")
);
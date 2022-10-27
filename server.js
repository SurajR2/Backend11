const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const router = require("./router");
app.use(express.json());
app.use(cors({ origin: "http://localhost:1234", optionsSuccessStatus: 200 }));
app.options(
  "*",
  cors({ origin: "http://localhost:1234", optionsSuccessStatus: 200 })
);

app.use("/api", router);
app.use(express.static("./CollegeProject/dist"));

app.listen(8000, () =>
  console.log("Server is running at: http://localhost:8000 ")
);

const { request } = require("express");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifytoken = async (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["token"] ||
    req.params.token;

  if (!token) {
    res
      .status(400)
      .send({ sucess: false, message: "Token is required for authentication" });
    return;
  }
  try {
    console.log(token);
    decoded = jwt.verify(token, process.env.JWT_TOKEN);
    const payload = JSON.parse(JSON.stringify(decoded, null, 2));
  } catch (error) {
    res.status(400).send({ sucess: false, message: error.message });
  }

  return next();
};
module.exports = verifytoken;

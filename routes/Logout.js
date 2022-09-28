app.get("/logout", function (req, res) {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).send("status:sucessfully logged out");
});

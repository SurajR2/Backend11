const express=require("express");
const db=require("./db-config");
const app= express();
const cookie=require("cookie-parser");

const port=process.env.PORT || 3000;
app.use("/js",express.static(__dirname + "./public.js"));
app.use(cookie());
app.use(express.json());
db.connect((err)=>{
    if(err) throw err;
    console.log("database connected sucessfully");

})
app.listen(port); 
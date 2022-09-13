const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./db-config");
const{signupValidation,loginValidation} = require("./validation")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response, request, query } = require("express");
const e = require("express");

app.get("/",(res)=>{
    res.send({message:"api is working"})
})
app.get("/login", (req, res) => {
    res.send({ message: "Hello" });
});

app.get("/register", (req, res) => {
    res.send({ message: "working" });
});

app.post("/register", signupValidation,function (request, response) {
    let fullname = request.body.fullname;
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password;
    db.query("SELECT COUNT(*) AS cnt FROM users WHERE email = ? " , 

    request.body.email ,(err , data)=>{
   if(err){
       console.log(err);
   }   
   else{
       if(data[0].cnt > 0){  
        response.status(409).send("sorry email already in use");
    }else{
       bcrypt.hash(password,10, (err,hash)=>{
        if (err){
            return res.status(500).send({msg:err,});
        }
        else{
        db.query(
            "insert into users(fullname,username,email, password) values (?,?,?,?)",
            [fullname, username, email, hash], 
            function(err , result){
               if(err){
                console.log(err);
               }else{
                console.log(result);
                response.status(200).send("registered successfully");
               }
               response.end();
           })
        }   
       })              
       }
   }
})
});
app.post("/login", loginValidation,function (request, response) {
    let email = request.body.email;
    let password = request.body.password;
    console.log(request.body);
    if (email && password) {
        db.query(
            "SELECT email FROM users WHERE email = ?",
            [email],
            (err,result)=>{
                if (err)throw err;
                if(result.length > 0){
                    let hashedPassword = bcrypt.hashSync(password,10);
                    bcrypt.compare(password,hashedPassword,function(err,result){
                if(result){
                    const token = jwt.sign({email},'the-super-strong-secrect',{ expiresIn: '2d' });

                    response.status(200).send({"msg":"logged in sucessfully","token":token}); 
                }else{
                    response.status(201).send(`${err}: incorrect password`); 
                }
            })
        }
        else{
            response.status(201).send(`${err}: Incorrect email`);
        }
            // (error, results)=> {
            //     if (error) throw error;
            //     if (results.length > 0) {
            //         response.status(200).send("Logged in successfully");
            //     } else {
            //         response
            //             .status(201)
            //             .send("Incorrect email and/or password!");
            //     }
            //     response.end();
            // }
        }
        );
    } else {
        response.send("Please enter email and password!");
        response.end();
    }
});

module.exports = app;

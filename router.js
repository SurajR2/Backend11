const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./db-config");
require("dotenv").config();
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var randtoken = require('rand-token');
const fs= require("fs");
var nodemailer = require('nodemailer');
const fileUpload = require("express-fileupload");
flash=require('express-flash');
const serveIndex = require('serve-index');
const { application } = require("express");
app.use( fileUpload());

app.get("/",(res)=>{
    res.send({message:"api is working"})
})
app.get("/login", (req, res) => {
    res.send({ message: "Hello" });
});

app.get("/register", (req, res) => {
    res.send({ message: "working" });
});

app.post("/register",[
    body('fullname', 'Fullname is required ').not().isEmpty(),
    body('username', 'Name is requied').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 })

],function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
     let  {fullname,username,email,password} = request.body;
    // let fullname = request.body.fullname;
    // let username = request.body.username;
    // let email = request.body.email;
    // let password = request.body.password;
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


app.get("/test", (req, res) => {
    const filePath = __dirname + "/static/pdf/Windows2000.pdf"
    
    res.send({
        file_location: filePath
    })
})




app.post("/login", [
    body('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 })

],function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    const {email,password}=request.body;
    // let email = request.body.email;
    // let password = request.body.password;
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
                    const token = jwt.sign({email},process.env.JWT_TOKEN,{ expiresIn: process.env.JWT_EXPIRES });

                    response.status(200).send({"msg":"logged in sucessfully","token":token}); 
                }else{
                    response.status(201).send(`${err}: incorrect password`); 
                }
            })
        }
        else{
            response.status(201).send(`${err}: Incorrect email`);
        }
            
         }
        );
    } else {
        response.send("Please enter email and password!");
        response.end();
    }
});

app.get("/logout", function(req, res) { 
    res.cookie("token", '',{maxAge:1})
    res.status(200).send("status:sucessfully logged out");
});


async function sendEmail(email, token) {
    let testAccount = await nodemailer.createTestAccount();
    console.log(testAccount);

    var email = email;
    var token = token;
    var mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: testAccount.user, 
    pass:testAccount.pass, 
    },
    });
    var mailOptions = {
    from: 'noreply@gmail.com',
    to: email,
    subject: 'Reset Password Link',
    html: '<p>You requested for reset password, kindly use this <a href="http://localhost:3000/reset-password?token=' + token + '">link</a> to reset your password</p>'
    };
    mail.sendMail(mailOptions, function(error, info) {
    if (error) {
    console.log("something went wrong: " + error.message);
    
    } else {
    console.log("sucessfully sent email");
    }
    });
    }
   
    /* send reset password link in email */
    app.post("/forgotpassword", function(req, res) {
    var email = req.body.email;
   
    db.query('SELECT * FROM users WHERE email ="' + email + '"', function(err, result) {
    if (err) throw err;
    var type = ''
    var msg = ''
    console.log(result[0]);
    if (result[0].email.length > 0) {
    var token = randtoken.generate(20);
    var sent = sendEmail(email, token);
    if (sent != '0') {
    var data = {
    token: token
    }
    db.query('UPDATE users SET ? WHERE email ="' + email + '"', data, function(err, result) {
    if(err) throw err
    })
    type = 'success';
    msg = 'The reset password link has been sent to your email address';
    } else {
    type = 'error';
    msg = 'Something goes to wrong. Please try again';
    }
    } else {
    console.log("email is not registered ");
    
    }  
    req.flash(type, msg);
   
    });
    })
   
    
    app.post("/resetpassword", function(req, res) {
    let token = req.body.token;
    let password = req.body.password;
    let confirmpassword = req.body.confirmpassword;
    console.log(req.body);
    
    if (password=null)
    {
        console.log("password cannot be blank");
        res.send.status(201).send("password cannot be blank");
    }
    // if(password.length<6)
    // {
    //     console.log("password length must be 6 characters");
    //     res.send.status(201).send("password length must be  at least 6 characters");
    // }

    if(confirmpassword==null )
    {
        console.log("confirmpassword cannot be blank");
        res.status(201).send("confirmpassword cannot be blank"); 
    }
    if(password == confirmpassword)
    {
        console.log("password and confirm passwoord do not match");
        res.status(201).send("password and confirm passwoords do not match");
    }

    db.query('SELECT * FROM users WHERE token ="' + token + '"', function(err, result) {
    if (err) throw err;
    var type
    var msg
    if (result.length > 0) {
    var saltRounds = 10;
    // var hash = bcrypt.hash(password, saltRounds);
    bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
    var data = {
    password: hash
    }
    db.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
    if(err) throw err 
    else 
    {
        console.log("password has been updated successfully");
        res.status("200").send("password has been updated successfully");
    }
    });
    });
    });
    type = 'success';
    msg = 'Your password has been updated successfully';
    } else {
    console.log('2');
    type = 'success';
    msg = 'Invalid link; please try again';
    }
    res.end();
    });
    })


   

      app.get('/', function (req, res) {
        var filePath = "/static/file";
    
        fs.readFile(__dirname + filePath , function (err,data){
            res.contentType("application/pdf/windows 2000.pdf");
            res.send(data);
        });
    });

    
            app.post("/upload",(request,response)=>{
        
            const id = request.body.id;
            const pdf = request.files.uploadfile;
            console.log(pdf);
            const filename = pdf.name;
            if(!pdf)return response.status(400).send("No File Uploaded ");
            // if( !id)return response.status(400).status("please enter semester id ");
                console.log(pdf);
                const semesters = {
                    1: "first sem",
                    2: "second sem",
                    3: "third sem",
                    4: "fourth sem",
                    5: "fifth sem",
                    6: "sixth sem",
                    7: "seventh sem",
                    8: "eight sem",
                  };
                  Object.entries(semesters).forEach(([key,value])=> {
                    if(id!==key) return;
                    let path =`${value}/${filename}`;
                    pdf.mv(`./static/${value}/${filename}`,(err)=>
                        {
                            
                            if(err)
                            {
                                response.send(err);
                            }
                            else
                            {
                            response.send({status:"sucess",msg:"sucessfully moved",path:path});
                            db.query(
                                "insert into books(book_id,book_name,path,book_semester_id) values(?,?,?,?)",["",filename,path,id],
                            (res)=>{
                
                        
                                    console.log("sucesufully added into the database");
                                    return res.send({status:"sucess",msg:"sucessufully added to the database"});
                                                }
                            
                            )
                            }
                    })
                  });
                

            }

            );

    
    
    

    

module.exports = app;
 
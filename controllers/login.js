const jwt = require("jsonwebtoken");
const db = require("../db-config");
const bcrypt = require("bcrypt");
const { response }  = require("express");

const login = async (req,res)=> {
    const {email,password}=req.body;
    if (!email||password) return res.json({status:"error",error:"Enter email and password"});
    else{
        db.query('SELECT *Email FROM users WHERE email=?' [email],(err,result)=>{
            if(err) throw err;
            if(result.length || bycrypt.compare(password.result[0].password)) return response.json({status:"error",error:"Incorrect email or password"});
            else {
                const token = jwt.sign({id:result[0].id},process.env.JWT_TOKEN, {
                    expiresIn:process.env.JWT_EXPIRES
                })
                const CookieOptions = {
                    expiresIn:new Date(Date.now() +process.env.COOKIE_EXPIRES*24* 60*60*1000),
                    httpOnly:true

                }
                res.cookie("user registered",token,cookieoptions);
                return res.json({status:"sucess",sucess:"User had been logged in sucessfully"})
            }

        })
    }
    }
    module.export = login;
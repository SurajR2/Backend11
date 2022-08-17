db.query("SELECT COUNT(*) AS cnt FROM user_registration WHERE email = ? " , 
req.body.email , function(err , data){
   if(err){
       console.log(err);
   }   
   else{
       if(data[0].cnt > 0){  
        response
                        .status(409)
                        .send("sorry email already in use");
             
       }else{
        db.query(
            "insert into register_user(fullname,username,email, password) values (?,?,?,?)",
            [fullname, username, email, password], 
            function(err , insert){
               if(err){
                console.log(err);
               }else{
                console.log(result);
                response.status(200).send("registered successfully");
               }
               response.end();
           })                  
       }
   }
})// const db = require("./db-config");

// app.post("/register", function (request, response) {
//     let fullname = request.body.fullname;
//     let username = request.body.username;
//     let email = request.body.email;
//     let password = request.body.password;
//     db.query(
//         "select * from register_user where email=request.body.email",(err, res) => {
//             if (result.length) {
//                 return res.status(409).send({
//                 msg: 'This user is already in use!'


//         } else{
//             db.query(
//                 "insert into register_user(fullname,username,email, password) values (?,?,?,?)",
//                 [fullname, username, email, password],
//                 function (err, result) {
//                     if (err) {
//                         console.log(err);
//                          }
//                           else {
//                         console.log(result);
//                         response.status(200).send("registered successfully");
//                     }
//                     response.end();
//                 }
//             );
//             console.log(request.body);
//         });

//         }
//     }
//     } )
    
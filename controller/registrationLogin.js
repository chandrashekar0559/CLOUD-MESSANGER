var mongoose = require('mongoose');
var express = require('express');
var app = express();
app.set('view engine', 'ejs');
//express routes are used to difene routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User');

// using lib for all responseGenerator  messages 
var responseGenerator = require('./../lib/responseGenerator');
console.log(responseGenerator);

//using authentication
var auth = require('./../lib/auth');
console.log("auth"+auth)
//Creating Signup function
module.exports.controllerFunction = function(app){

app.engine('html', require('ejs').renderFile);

userRouter.get('/signup',function(req,res){
    console.log("Please signup TO move Carts World!!!")
    res.render('signup.html' , {root: './views'});
});
userRouter.get('/login',function(req,res){
    console.log("login INTO Carts World!!!")
    res.render('index.html' , {root: './views'});
});
userRouter.get('/chat/:user',auth.checkLogin,function(req,res){
    console.log("chat box is processing")
    console.log({user: req.session.user});
    res.render('./../views/messanger.html' , {user: req.session.user});
});
userRouter.get('/chat/:user/:user',auth.checkLogin,function(req,res){
    console.log("private-chat-box-is-processing")
    res.render('./../views/privatemessanger.html', {res});
});


userRouter.get('/dashboard',auth.checkLogin,function(req,res){
    // console.log({user: req.session.user});
    res.render('./../views/dashboard',{user: req.session.user});
    
});

    userRouter.get('/logout',function(req,res){
      req.session.destroy(function(err) {
        res.redirect('/users/login');

      })  

    });

    userRouter.get('/all',function(req,res){
        userModel.find({},function(err,allUsers){
            if(err){                
                res.send(err);
            }
            else{
                res.send(allUsers);
            }

        });//end user model find 

    });//end get all users

    userRouter.get('/:userName/info',function(req,res){

        userModel.findOne({'userName':req.params.userName},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                  res.render('./../views/dashboard', { user:foundUser  });

            }

        });// end find
    });//end get all users

 app.post('/users/chat/:user' , function(req , res){
    console.log("sent");
     res.sendFile('./../views/messanger.html');
 })
  app.post('/users/chat/:user/:user' , function(req , res){
      res.sendFile('privatemessanger.html' , {root: './views'});
    console.log("private-sent");
  })
    app.post('/users/signup' , function(req, res){
        console.log("comming into user post")
if(req.body.userName != 'undefine' && req.body.email != 'undefine' && req.body.password != 'undefine'){
   var newUser= new userModel({
    userName:req.body.userName ,
    email:req.body.email ,
    password:req.body.password

   });

   console.log("newUser:-- "+newUser);
newUser.save(function(err, result){
    if(err){
         // this formar from LIB file , there we're gave {error, message ,status, data} same thing we're sending to here
        var myResponse = responseGenerator.generate(true , err, 500, null);
        console.log("under error");

        res.render('./../views/error',{
            message:myResponse.message ,
            error:myResponse.data
        })
    }else{
        req.session.user = newUser;
        delete req.session.user.password;
         res.redirect('/users/dashboard')
        console.log("under session");
    }
})

}else{
    var myResponse ={
        error:true,
        message:"Some Parameter is missing",
        status:403,
        data:null
    };
    res.send(myResponse);
}
    });

    app.post('/users/login', function(req,res){
        userModel.findOne({$and:[{'email':req.body.email} , {'password':req.body.password}]} ,  function(err, foundUser){
            console.log("login post")
            if(err){
               var myResponse = responseGenerator.generate(true , "Error!", 500, null);
        res.send(myResponse); 
            }else if(foundUser == null || foundUser == undefined || foundUser.userName == undefined){
                var myResponse = responseGenerator.generate(true , "User Not Found! , Please use valid credentials", 404, null);
                res.render('./../views/error', {
                  message: myResponse.message,
                  error: myResponse.data
                });
            }else{
               req.session.user = foundUser;
                   delete req.session.user.password;
                  res.redirect('/users/dashboard')
            }
        })

    });

    app.use('/users' , userRouter);
}




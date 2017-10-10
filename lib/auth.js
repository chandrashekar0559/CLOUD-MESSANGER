var mongoose = require('mongoose');
var userModel = mongoose.model('User')


// app level middleware to set request user 

exports.checkLogin = function(req,res,next){

	// if(!req.user && !req.session.user){
	if(!req.session.user){

		res.redirect('/users/login');
	}
	else{

		next();
	}

}

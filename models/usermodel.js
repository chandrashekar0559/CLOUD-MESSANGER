// Define mongose schema then including the module
var mongoose = require('mongoose');
//declaring the schema object
var Schema = mongoose.Schema;

var bcrypt = require('bcrypt-nodejs');
//defining schema

var userSchema = new Schema({
		userName :{type:String ,required:true},
		email: {type:String, required:true},
		password: {type:String, required:true}
});


//generating Hash for password
userSchema.method.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
};

//checking if password is valid or not 
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

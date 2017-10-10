var mongoose = require('mongoose');
//declaring the schema object
var Schema = mongoose.Schema;

 
var Message = new Schema({
    author: String,
    receiever:String,
    authoreceiver:String,
    receieverauthor:String,
    message: String,
    createDate: {
        type: Date,
        default: Date.now
    }
});
 
module.exports = mongoose.model('Message', Message)

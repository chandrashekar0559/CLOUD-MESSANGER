
//this below function we're using in another file so we've using "exports"
exports.generate = function(error , message , status , data){
	var myResponse = {
		error:error,
		message:message,
		status:status,
		data:data
	}
	return myResponse;	
}

var db = require('../data/db');

exports.create = function(customerid, app, versionCode, next){
	var customer = new db.Customer();
	customer.customerid = customerid;
	customer.app = app;
	customer.createdAt = new Date();
	customer.modifiedAt = customer.createdAt;
	customer.save(function(saveErr){
		if(saveErr) {
			console.log(saveErr);
			next(false);
		} else
			next(true)
	});
}


exports.update = function(customer, versionCode, next){
	customer.versionCode = versionCode;
	customer.modifiedAt = new Date();
	customer.save(function(saveErr){
		if(saveErr) {
			console.log(saveErr)
			next(false);
		} else 
			next(true);
	});
}
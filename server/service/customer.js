var db = require('../data/db');

exports.get = function(account, next){
	if(!account){
		next(err);
		return;
	}

	db.Customer.findOne({'account': account}, function(err, customer){
		if(err){
			next(err);
			return;
		}
		next(null, customer);
	});
}

exports.create = function(account, app, versionCode, next){
	var customer = new db.Customer();
	customer.account = account;
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
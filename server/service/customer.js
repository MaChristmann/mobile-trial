var db = require('../data/db');

exports.get = function(req, res, next){
	var account = req.params.account;

	db.Customer.findOne({'account': account}, function(err, customer){
		res.locals.customer = null;
		if(err){
			console.log(err);
			res.send(500, {rc: 4, reason: 'Error on finding Customer'});
			return;
		}
		if(customer == null){
			next();
			return;
		}
		res.locals.customer = customer;
		next();
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
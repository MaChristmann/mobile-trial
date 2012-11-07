var db = require('../data/db');

exports.create = function(customerid, app, next){
	var customer = new db.Customer();
	customer.customerid = customerid;
	customer.app = app;
	customer.createdAt = new Date();
	customer.save(function(saveErr){
		if(saveErr) console.log(saveErr);
		next(true)
	});
}
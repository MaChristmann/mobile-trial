var db = require('db');


exports.create = function(req, res, next){
	db.App.findOne({'identifier': req.params.identifier}, function(appErr, app){
		var customer = new db.Customer();
		customer.app = app;
		customer.createdAt = new Date();
		customer.save(function(saveErr){
			if(saveErr) console.log(saveErr);
			res.send(customer);
		});
	});
}

exports.get = function(req, res, next){

}

exports.update = function(req, res, next){

}

exports.delete = function(req, res, next){

}
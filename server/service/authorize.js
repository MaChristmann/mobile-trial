var db = require('../data/db');

exports.authorize = function(req, res, next){
	console.log('customer.authorize');
	db.App.findOne({'identifier': req.params.app}, function(appErr, app){
		if(appErr) console.log(appErr);

		//App exists?
		if(app == null){
			res.send(false);
			return;
		}

		//Customer exists?
		var customerid = req.params.customer;
		db.Customer.findOne({'customerid': customerid},  function(customerErr, customer){;
			if(customerErr) console.log(customerErr);

			if(customer == null)
				createCustomer(customerid, app, function(isAuthorized){
					console.log("customer.authorize: create customer: " + isAuthorized);
					res.send(isAuthorized);
				});
			else
				authorizeCustomer(customer, app, function(isAuthorized){
					console.log("customer.authorize: authorize customer: " + isAuthorized);
					res.send(isAuthorized);
				});
		});
	});
}


function createCustomer(customerid, app, next){
	var customer = new db.Customer();
	customer.customerid = customerid;
	customer.app = app;
	customer.createdAt = new Date();
	customer.save(function(saveErr){
		if(saveErr) console.log(saveErr);
		next(true)
	});
}


function authorizeCustomer(customer, app, next){
	var isAuthorized = true;

	var constraints = app.constraints;

	console.log(app);

	for (var i=0; i < constraints.length; i++){
		var constraintType = constraints[i].trialtype;
		var constraintValue = constraints[i].value;

		console.log(constraints[i]);
		switch(constraintType){
			case "days": {
				var today = new Date();
				var oneday=1000*60*60*24;

				var timediff = today.getTime() - customer.createdAt.getTime();

				console.log(customer);
				var daysdiff = timediff / oneday;

				console.log(daysdiff);

				if(daysdiff > constraintValue)
					isAuthorized = false;
			} break;
		}
	}

	next(isAuthorized);
}
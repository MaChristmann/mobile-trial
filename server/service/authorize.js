var db = require('../data/db');
var sCustomer = require("./customer");

var licensedCode = 0;
var notLicensedCode = 1;
var serverErrorCode = 4;

var PARAM_NONCE = "n";
var PARAM_TIMESTAMP = "ts";
var PARAM_VERSIONCODE = "vc";

exports.authorize = function(req, res, next){
	console.log('customer.authorize');

	var packageName = req.params.app;
	var customerId = req.params.customer;

	db.App.findOne({'identifier': packageName}, function(appErr, app){
		if(appErr) console.log(appErr);

		//App exists?
		if(app == null){
			res.send({rc: serverErrorCode, reason: 'App does not exist'});
			return;
		}

		//Check if neccessary parameters exist
		var bodyParams = JSON.parse(req.body);

		var nonce = bodyParams[PARAM_NONCE];
		if(typeof nonce == 'undefined'){
			res.send({rc: serverErrorCode, reason: 'Missing nonce'});
			return;
		}

		var timestamp = bodyParams[PARAM_TIMESTAMP];
		if(typeof timestamp == 'undefined'){
			res.send({rc: serverErrorCode, reason: 'Missing timestamp'});
			return;
		}

		var versionCode = bodyParams[PARAM_VERSIONCODE];
		if(typeof versionCode == 'undefined'){
			res.send({rc: serverErrorCode, reason: 'Missing versionCode'});
		}

		//Customer exists?
		db.Customer.findOne({'customerid': customerId},  function(customerErr, customer){;
			if(customerErr) console.log(customerErr);

			console.log(app);
			var response = {ts: timestamp
											, n: nonce
											, vc: versionCode
											, pn: packageName
											, ui: customerId
											, VT: getValidTime(app, timestamp)
											, GT: getGraceTime(app, timestamp)
											, GR: getGraceRetrys(app)};

			if(customer == null){
				sCustomer.create(customerId, app, function(isAuthorized){
					console.log("customer.authorize: create customer: " + isAuthorized);

					if(isAuthorized){
						var licensed = response;
						licensed["rc"] = licensedCode;
						res.send(licensed);
					}
					else 
						res.send({rc: serverErrorCode, reason: 'Could not create Customer'});
				});
			}
			else{
					//Authorize Customer
					authorizeCustomer(customer, app, timestamp, versionCode, function(isAuthorized){

					console.log("customer.authorize: authorize customer: " + isAuthorized);

					if(isAuthorized){
						var licensed = response;
						licensed["rc"] = licensedCode;
						console.log(licensed);
						res.send(licensed);
					}
					else {
						var notLicensed = response;
						notLicensed["rc"] = notLicensedCode;
						res.send(notLicensed);
					}
				});
			}
		});
	});
}

function authorizeCustomer(customer, app, timestamp, versionCode, next){
	var isAuthorized = true;

	var constraints = app.constraints;

	console.log(app);

	for (var i=0; i < constraints.length; i++){
		var constraintType = constraints[i].trialtype;
		var constraintValue = constraints[i].value;

		console.log(constraints[i]);
		switch(constraintType){
			case "days": {
				var oneday=1000*60*60*24;

				var timediff = timestamp - customer.createdAt.getTime();

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


function getGraceTime (app, timestamp){
	return timestamp + app.graceInterval;
}

function getGraceRetrys(app){
	return  app.graceRetrys;
}

function getValidTime(app, timestamp){
	return timestamp + app.validTime;
}
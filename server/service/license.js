var db = require('../data/db');
var sCustomer = require("./customer");

// Response Codes
var CODE_LICENSED = 0,
		CODE_NOTLICENSED = 1,
		CODE_SERVERERROR = 4;

// Parameters
var PARAM_NONCE = "n",
		PARAM_TIMESTAMP = "ts",
		PARAM_VERSIONCODE = "vc",
		PARAM_USERID = "ui",
		PARAM_PACKAGENAME = "pn",
		PARAM_RESULTCODE = "rc",
		PARAM_REASON = "reason",
		EXTRA_VALIDTIME = "VT",
		EXTRA_GRACETIME = "GT",
		EXTRA_GRACERETRYS = "GR";

exports.authorize = function(req, res, next){
	console.log('customer.authorize');

	var app = res.locals.app;
	var packageName = req.params.app;
	var customerId = req.params.customer;

	//Check if neccessary parameters exist
	var bodyParams = JSON.parse(req.body);

	var nonce = bodyParams[PARAM_NONCE];
	if(typeof nonce == 'undefined'){
		var response = {};
		response[PARAM_RESULTCODE] = CODE_SERVERERROR;
		response[PARAM_REASON] = 'Missing nonce';
		res.send(response);
		return;
	}

	var clientTimestamp = bodyParams[PARAM_TIMESTAMP];
	if(typeof clientTimestamp == 'undefined'){
		var response = {};
		response[PARAM_RESULTCODE] = CODE_SERVERERROR;
		response[PARAM_REASON] = 'Missing timestamp';
		res.send(response);
		return;
	}

	var versionCode = bodyParams[PARAM_VERSIONCODE];
	if(typeof versionCode == 'undefined'){
		var response = {};
		response[PARAM_RESULTCODE] = CODE_SERVERERROR;
		response[PARAM_REASON] = 'Missing versionCode';
		res.send(response);
		return;
	}

	//Customer exists?
	db.Customer.findOne({'customerid': customerId},  function(customerErr, customer){;
		if(customerErr) console.log(customerErr);

		//User ServerTimestamp for Validation and Extras
		var serverTimestamp = new Date().getTime();

		//Initialize response object
		var response = {};
		response[PARAM_TIMESTAMP] 	= clientTimestamp;
		response[PARAM_NONCE] 			= nonce;
		response[PARAM_VERSIONCODE] = versionCode;
		response[PARAM_PACKAGENAME]	= packageName;
		response[PARAM_USERID] 			= customerId;
		response[EXTRA_VALIDTIME] 	= getValidTime(app, customer, serverTimestamp);
		response[EXTRA_GRACETIME] 	= getGraceTime(app, serverTimestamp);
		response[EXTRA_GRACERETRYS] = getGraceRetrys(app);

		//Create User if not exist
		if(customer == null){
			sCustomer.create(customerId, app, versionCode, function(isAuthorized){
				console.log("customer.authorize: create customer: " + isAuthorized);

				if(isAuthorized){
					var licensed = response;
					licensed[PARAM_RESULTCODE] = CODE_LICENSED;
					res.send(licensed);
				}
				else{
					var response = {};
					response[PARAM_RESULTCODE] = CODE_SERVERERROR;
					response[PARAM_REASON] = 'Could not create Customer';
					res.send(response);
				}
			});
		}

		else if(app.updateVersionCode != 0 && 
						(customer.versionCode < app.updateVersionCode && versionCode >= app.updateVersionCode) ){
			sCustomer.update(customer, versionCode, function(isAuthorized){
				console.log("customer.authorize: update customer: " + isAuthorized);

				if(isAuthorized){
					var licensed = response;
					licensed[PARAM_RESULTCODE] = CODE_LICENSED;
					res.send(licensed);
				}
				else{
					var response = {};
					response[PARAM_RESULTCODE] = CODE_SERVERERROR;
					response[PARAM_REASON] = 'Could not update Customer';
					res.send(response);
				}
			});
		}

		else if(app.maxVersionCode != 0 && customer.versionCode > app.maxVersionCode){
			var response = {};
			response[PARAM_RESULTCODE] = CODE_SERVERERROR;
			response[PARAM_REASON] = 'Customers versionCode is bigger than accepted versionCode';
			res.send(response);
		}

		else{
			//Authorize Customer
			authorizeCustomer(customer, app, serverTimestamp, versionCode, function(isAuthorized){
				console.log("customer.authorize: authorize customer: " + isAuthorized);

				if(isAuthorized){
					var licensed = response;
					licensed[PARAM_RESULTCODE] = CODE_LICENSED;
					console.log(licensed);
					res.send(licensed);
				}
				else {
					var notLicensed = response;
					notLicensed[PARAM_RESULTCODE] = CODE_NOTLICENSED;
					res.send(notLicensed);
				}
			});
		}
	});
}

function authorizeCustomer(customer, app, timestamp, versionCode, next){
	var isAuthorized = true;

	var licenses = app.licenses;

	console.log(app);

	for (var i=0; i < licenses.length; i++){
		var licenseType = licenses[i].trialtype;
		var licenseValue = licenses[i].value;

		console.log(licenses[i]);
		switch(licenseType){
			case "days": {
			
				var timediff = timestamp - customer.modifiedAt.getTime();
				console.log(customer);
				var daysdiff = timediff / oneDay();
				console.log(daysdiff);

				if(daysdiff > licenseValue)
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

function getValidTime(app, customer, timestamp){
	//If valid time is not set, cache the license till end of trial period
	return timestamp + app.validTime;
}

function oneDay(){
	return 1000*60*60*24;
}
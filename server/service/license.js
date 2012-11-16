var db = require('../data/db');
var customerSv = require("./customer");

// licResponse Codes
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
	var app = res.locals.app;
	var developer = res.locals.developer;
	var customer = res.locals.customer;

	var packageName = req.params.app;
	var account = req.params.account;

	//Response object
	var licResponse = {};

	//Check if neccessary parameters exist
	var bodyParams = JSON.parse(req.body);

	var nonce = bodyParams[PARAM_NONCE];
	if(typeof nonce == 'undefined'){
		console.log("License: Missing nonce");
		licResponse[PARAM_RESULTCODE] = CODE_SERVERERROR;
		licResponse[PARAM_REASON] = 'Missing nonce';
		res.send(licResponse);
		return;
	}

	var clientTimestamp = bodyParams[PARAM_TIMESTAMP];
	if(typeof clientTimestamp == 'undefined'){
		console.log("License: Missing timestamp");
		licResponse[PARAM_RESULTCODE] = CODE_SERVERERROR;
		licResponse[PARAM_REASON] = 'Missing timestamp';
		res.send(licResponse);
		return;
	}

	var versionCode = bodyParams[PARAM_VERSIONCODE];
	if(typeof versionCode == 'undefined'){
		console.log("License: Missing versionCode");
		licResponse[PARAM_RESULTCODE] = CODE_SERVERERROR;
		licResponse[PARAM_REASON] = 'Missing versionCode';
		res.send(licResponse);
		return;
	}

	//User ServerTimestamp for Validation and Extras
	var serverTimestamp = new Date().getTime();
	//Initialize licResponse object
	licResponse[PARAM_TIMESTAMP] 	= clientTimestamp;
	licResponse[PARAM_NONCE] 			= nonce;
	licResponse[PARAM_VERSIONCODE] = versionCode;
	licResponse[PARAM_PACKAGENAME]	= packageName;
	licResponse[PARAM_USERID] 			= account;
	licResponse[EXTRA_VALIDTIME] 	= getValidTime(app, serverTimestamp);
	licResponse[EXTRA_GRACETIME] 	= getGraceTime(app, serverTimestamp);
	licResponse[EXTRA_GRACERETRYS] = getGraceRetrys(app);

	if(developer != null){
		console.log("License: Customer is a developer - testResult: " + developer.testResult);
		licResponse[PARAM_RESULTCODE] = developer.testResult;
		res.send(licResponse);
		return;
	}
	//Create User if not exist
	else if(customer == null){
		customerSv.create(account, app, versionCode, function(isAuthorized){
		
			if(isAuthorized){
				console.log("License: Create new customer");
				licResponse[PARAM_RESULTCODE] = CODE_LICENSED;
				res.send(licResponse);
			}
			else{
				console.log("License: Could not create Customer");
				licResponse[PARAM_RESULTCODE] = CODE_SERVERERROR;
				licResponse[PARAM_REASON] = 'Could not create Customer';
				res.send(licResponse);
			}
		});
	}
	else if(app.updateVersionCode != 0 && 
					(customer.versionCode < app.updateVersionCode && versionCode >= app.updateVersionCode) ){
		customerSv.update(customer, versionCode, function(isAuthorized){
			
			if(isAuthorized){
				console.log("License: Update customer");
				licResponse[PARAM_RESULTCODE] = CODE_LICENSED;
				res.send(licResponse);
			}
			else{
				console.log("License: Could not update Customer");
				var licResponse = {};
				licResponse[PARAM_RESULTCODE] = CODE_SERVERERROR;
				licResponse[PARAM_REASON] = 'Could not update Customer';
				res.send(licResponse);
			}
		});
	}
	else if(app.maxVersionCode != 0 && customer.versionCode > app.maxVersionCode){
		console.log('Customers versionCode is bigger than accepted versionCode');
		var licResponse = {};
		licResponse[PARAM_RESULTCODE] = CODE_SERVERERROR;
		licResponse[PARAM_REASON] = 'Customers versionCode is bigger than accepted versionCode';
		res.send(licResponse);
	}
	else{
		//Authorize Customer
		authorizeCustomer(customer, app, serverTimestamp, versionCode, function(isAuthorized){

			if(isAuthorized){
				console.log("License: Customer authorized");
				licResponse[PARAM_RESULTCODE] = CODE_LICENSED;
				res.send(licResponse);
			}
			else {
				console.log("License: Customer not authorized");
				licResponse[PARAM_RESULTCODE] = CODE_NOTLICENSED;
				res.send(licResponse);
			}
		});
	}
}

function authorizeCustomer(customer, app, timestamp, versionCode, next){
	var isAuthorized = true;
	var licenses = app.licenses;

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

function getValidTime(app, timestamp){
	//If valid time is not set, cache the license till end of trial period
	return timestamp + app.validTime;
}

function oneDay(){
	return 1000*60*60*24;
}
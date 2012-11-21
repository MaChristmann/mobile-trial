var db = require('../data/db');
var customerSv = require("./customer"),
		certificateSv = require("./certificate");

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

	var account = req.params.account;
	
	//Check if neccessary parameters exist
	var bodyParams = JSON.parse(req.body);

	authorizeCustomer(app, customer, account, developer, bodyParams, function(err, licResponse){	
		if(err){
			var errorResponse = CODE_SERVERERROR + "--" + err + "--" + "null";
			res.send(500, errorResponse);
			return;
		}
		var stringifiedResponse = stringifyResponse(licResponse);
		var signature = certificateSv.sign(stringifiedResponse, app.privateKey);
		var successResponse = licResponse[PARAM_RESULTCODE] + "--" + stringifiedResponse + "--" + signature;
		res.send(successResponse);
	});
}


function authorizeCustomer(app, customer, account, developer, bodyParams, next){
	//Response object
	var licResponse = {};

	//Check if neccessary parameters exist
	var nonce = bodyParams[PARAM_NONCE];
	if(typeof nonce == 'undefined'){
		console.log("License: Missing nonce");
		next('Missing nonce');
		return;
	}

	var clientTimestamp = bodyParams[PARAM_TIMESTAMP];
	if(typeof clientTimestamp == 'undefined'){
		console.log("License: Missing timestamp");
	 	next('Missing timestamp');
		return;
	}

	var versionCode = bodyParams[PARAM_VERSIONCODE];
	if(typeof versionCode == 'undefined'){
		console.log("License: Missing versionCode");
		next('Missing versionCode');
		return;
	}

	//User ServerTimestamp for Validation and Extras
	var serverTimestamp = new Date().getTime();
	//Initialize licResponse object
	licResponse[PARAM_TIMESTAMP] 	= clientTimestamp;
	licResponse[PARAM_NONCE] 			= nonce;
	licResponse[PARAM_VERSIONCODE] = versionCode;
	licResponse[PARAM_PACKAGENAME]	= app.identifier;
	licResponse[PARAM_USERID] 			= account;
	licResponse[EXTRA_VALIDTIME] 	= getValidTime(app, serverTimestamp);
	licResponse[EXTRA_GRACETIME] 	= getGraceTime(app, serverTimestamp);
	licResponse[EXTRA_GRACERETRYS] = getGraceRetrys(app);

	if(developer != null){
		console.log("License: Customer is a developer - testResult: " + developer.testResult);
		licResponse[PARAM_RESULTCODE] = developer.testResult;
		next(null, licResponse);
		return;
	}
	else if(customer == null){
		//Create new customer
		customerSv.create(account, app, versionCode, function(isAuthorized){
			if(isAuthorized){
				console.log("License: Create new customer");
				licResponse[PARAM_RESULTCODE] = CODE_LICENSED;
				next(null, licResponse);
			}
			else{
				console.log("License: Could not create Customer");
				next('Could not create Customer');
			}
		});
	}
	else if(app.updateVersionCode != 0 && 
					(customer.versionCode < app.updateVersionCode && versionCode >= app.updateVersionCode) ){
		//Renew Trial period
		customerSv.update(customer, versionCode, function(isAuthorized){	
			if(isAuthorized){
				console.log("License: Update customer");
				licResponse[PARAM_RESULTCODE] = CODE_LICENSED;
				next(null, licResponse);
			}
			else{
				console.log("License: Could not update Customer");
				next('Could not update Customer');
			}
		});
	}
	else if(app.maxVersionCode != 0 && customer.versionCode > app.maxVersionCode){
		console.log('Customers versionCode is bigger than accepted versionCode');
		next('Customers versionCode is bigger than accepted versionCode');
	}
	else{
		//Authorize Customer
		checkLicenses(customer, app, serverTimestamp, versionCode, function(isAuthorized){
			if(isAuthorized){
				console.log("License: Customer authorized");
				licResponse[PARAM_RESULTCODE] = CODE_LICENSED;
				next(null, licResponse);
			}
			else {
				console.log("License: Customer not authorized");
				licResponse[PARAM_RESULTCODE] = CODE_NOTLICENSED;
				next(null, licResponse);
			}
		});
	}
}

function checkLicenses(customer, app, timestamp, versionCode, next){
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


function stringifyResponse(lic){
	var result = lic[PARAM_RESULTCODE]
						 + "|" + lic[PARAM_NONCE]
						 + "|" + lic[PARAM_PACKAGENAME]
						 + "|" + lic[PARAM_VERSIONCODE]
						 + "|" + lic[PARAM_USERID]
						 + "|" + lic[PARAM_TIMESTAMP]; 
			result += ":";
			result += EXTRA_VALIDTIME + "=" + lic[EXTRA_VALIDTIME];
			result += "&" + EXTRA_GRACETIME + "=" + lic[EXTRA_GRACETIME];
			result += "&" + EXTRA_GRACERETRYS + "=" + lic[EXTRA_GRACERETRYS];
			return result;
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
var db = require('../data/db');
var customerSv = require("./customer"),
		certificateSv = require("./certificate");

// licResponse Codes
var CODE_LICENSED = 0;
exports.CODE_LICENSED = CODE_LICENSED;
var CODE_NOTLICENSED = 1;
exports.CODE_NOTLICENSED = CODE_NOTLICENSED;
var CODE_SERVERERROR = 4;
exports.CODE_SERVERERROR = CODE_SERVERERROR;

// Parameters
var PARAM_NONCE = "n";
exports.PARAM_NONCE = PARAM_NONCE;
var PARAM_TIMESTAMP = "ts";
exports.PARAM_TIMESTAMP = PARAM_TIMESTAMP;
var PARAM_VERSIONCODE = "vc";
exports.PARAM_VERSIONCODE = PARAM_VERSIONCODE;
var PARAM_USERID = "ui";
exports.PARAM_USERID = PARAM_USERID;
var PARAM_PACKAGENAME = "pn";
exports.PARAM_PACKAGENAME = PARAM_PACKAGENAME;
var PARAM_RESULTCODE = "rc"; 
exports.PARAM_RESULTCODE = PARAM_RESULTCODE;
var PARAM_REASON = "reason";
exports.PARAM_REASON = PARAM_REASON;
var EXTRA_VALIDTIME = "VT";
exports.EXTRA_VALIDTIME = EXTRA_VALIDTIME;
var EXTRA_GRACETIME = "GT";
exports.EXTRA_GRACETIME = EXTRA_GRACETIME;
var EXTRA_GRACERETRYS = "GR";
exports.EXTRA_GRACERETRYS = EXTRA_GRACERETRYS;


exports.testResponse = function(developer, next){
	console.log("License: Customer is a developer - testResult: " + developer.testResult);
	licResponse[PARAM_RESULTCODE] = developer.testResult;
	next(null, licResponse);
}

exports.authorize = function(app, customer, account, bodyParams, next){
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

	if(customer == null){
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
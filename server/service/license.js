var async = require('async');

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


exports.processRequest = function(app, account, bodyParams, next){
	//Response object
	var licResponse = {};

	//Check if neccessary app exists
	if(!app){
		next(new Error('Missing app'));
		return;
	}

	//Check if neccessary accoutn exists
	if(!account){
		next(new Error('Missing account'));
		return;
	}

	//Check if neccessary parameters exist
	if(!bodyParams){
		next(new Error('Missing bodyParams'));
		return;
	}

	var nonce = bodyParams[PARAM_NONCE];
	if(typeof nonce == 'undefined'){
		next(new Error('Missing nonce at bodyParams.n'));
		return;
	}

	var clientTimestamp = bodyParams[PARAM_TIMESTAMP];
	if(typeof clientTimestamp == 'undefined'){
	 	next(new Error('Missing timestamp at bodyParams.ts'));
		return;
	}

	var versionCode = bodyParams[PARAM_VERSIONCODE];
	if(typeof versionCode == 'undefined'){
		next(new Error('Missing versionCode at bodyParams.vc'));
		return;
	}


	//User ServerTimestamp for Validation and Extras
	var serverTimestamp = new Date().getTime();
	//Initialize licResponse object
	licResponse[PARAM_TIMESTAMP] 		= serverTimestamp;
	licResponse[PARAM_NONCE] 				= nonce;
	licResponse[PARAM_VERSIONCODE	] = versionCode;
	licResponse[PARAM_PACKAGENAME]	= app.identifier;
	licResponse[PARAM_USERID] 			= account;
	licResponse[EXTRA_VALIDTIME] 		= getValidTime(app, serverTimestamp);
	licResponse[EXTRA_GRACETIME] 		= getGraceTime(app, serverTimestamp);
	licResponse[EXTRA_GRACERETRYS] 	= getGraceRetrys(app);

	next(null, licResponse);
}

exports.testResponse = function(developer, licResponse, next){
	if(!developer){
		next(new Error('Missing parameter developer'));
		return;
	}

	if(!licResponse){
		next(new Error('Missing parameter licResponse'));
		return;
	}
	licResponse[PARAM_RESULTCODE] = developer.testResult;
	next(null, licResponse);
}

exports.grantAccess = function(licResponse, next){
	if(!licResponse){
		next(new Error('Missing parameter licResponse'));
		return;
	}
	licResponse[PARAM_RESULTCODE] = CODE_LICENSED;
	next(null, licResponse);
}

exports.authorize = function(app, customer, account, licResponse, next){
	if(!app){
		next(new Error('Missing parameter app'));
		return;
	}

	if(!account){
		next(new Error('Missing parameter account'));
		return;
	}

	if(!licResponse){
		next(new Error('Missing parameter licResponse'));
		return;
	}

	async.series([
		function(callback){
			if(customer == null){
				//Create new customer
				customerSv.create(account, app, licResponse[PARAM_VERSIONCODE], function(err, customer){
					if(err){
						callback(err);
						return;
					}
					callback(null, {license: licResponse, customer: customer, app: app});
				});
			}
			else if(app.maxVersionCode != 0 && licResponse[PARAM_VERSIONCODE] > app.maxVersionCode){
				callback(new Error('Customers versionCode is bigger than accepted versionCode'));
			} 
			else if(app.updateVersionCode != 0 && 
							(customer.versionCode < app.updateVersionCode && licResponse[PARAM_VERSIONCODE] >= app.updateVersionCode) ){
				//Renew Trial period
				customerSv.update(customer, licResponse[PARAM_VERSIONCODE], function(err, customer){	
					if(err){
						callback(err);
						return;
					}
					callback(null, {license: licResponse, customer: customer, app: app});
				});
			}
			else {
				callback(null, {license: licResponse, customer: customer, app: app});
			}
		}
	],
	function(err, results){
		if(err){
			next(err);
			return;
		}

		//Authorize Customer
		checkLicenses(results[0].customer, results[0].app, results[0].license, function(isAuthorized){
			if(isAuthorized){
				licResponse[PARAM_RESULTCODE] = CODE_LICENSED;
				next(null, licResponse);
			}
			else {
				licResponse[PARAM_RESULTCODE] = CODE_NOTLICENSED;
				next(null, licResponse);
			}
		});
	});
}


function checkLicenses(customer, app, licResponse, next){
	var isAuthorized = true;
	var licenses = app.licenses;

	for (var i=0; i < licenses.length; i++){
		var licenseType = licenses[i].trialtype;
		var licenseValue = licenses[i].value;

		switch(licenseType){
			case "time": {
				var timestamp = new Date().getTime();
				var timediff = timestamp - customer.modifiedAt.getTime();
				var daysdiff = timediff / oneDay();

				// Cache until license is expired, but do not grant any grace
				if(app.validTime == 0){
					licResponse[EXTRA_VALIDTIME] = customer.modifiedAt.getTime() + licenseValue * oneDay();
					licResponse[EXTRA_GRACETIME] = licResponse[EXTRA_VALIDTIME];
					licResponse[EXTRA_GRACERETRYS] = 0;
				}

				if(daysdiff > licenseValue)
					isAuthorized = false;
			} break;
		}
	}
	next(isAuthorized);
}


function getGraceTime(app, timestamp){
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
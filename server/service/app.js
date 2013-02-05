var db = require('../data/db'),
		certificateSv = require('./certificate'),
		developerSv = require('./developer');

/* Returns the app with @identifier from database */ 
exports.get = function(identifier, next){
	if(typeof identifier == 'undefined' || identifier == null){
		next(new Error('Missing paramater identifier'));
		return;
	}

	db.App.findOne({'identifier':  identifier}, function(appErr, app){
		if(appErr){
			 next(appErr);
			 return;
		}
		next(null, app);
	});
}

/* Returns all apps from database */
exports.list = function(next){
	db.App.find({}, function(appErr, apps){
		if(appErr){
			next(appErr);
			return;
		}
		next(null, apps);
	});
}

/* Create a new app from @appObj and insert it to database 
	 Returns the new app */
exports.create = function(appObj, next){
	if(typeof appObj == 'undefined' || appObj == null){
		next(new Error('Missing parameter appObj'));
		return;
	} 
	
	var app = new db.App();

	//Identifier
	if(typeof appObj.identifier != 'string' || appObj.identifier == null ){
		next(new Error('Missing required parameter appObj.identifier'));
		return;
	}

	appObj.identifier = appObj.identifier.trim();
	if(appObj.identifier.length <= 0){
		next(new Error('appObj.identifier cannot be an empty string. At least length of 1'));
		return;
	}
	app.identifier = appObj.identifier;

	//Enabled
	if(typeof appObj.enabled != 'undefined')
		app.enabled = appObj.enabled;

	//MaxVersionCode
	if(typeof appObj.maxVersionCode != 'undefined')
		app.maxVersionCode = appObj.maxVersionCode;

	//UpdateVersionCode
	if(typeof appObj.updateVersionCode != 'undefined')
		app.updateVersionCode = appObj.updateVersionCode;

	//GraceInterval
	if(typeof appObj.graceInterval != 'undefined')
		app.graceInterval = appObj.graceInterval;

	//GraceRetrys
	if(typeof appObj.graceRetrys != 'undefined')
		app.graceRetrys = appObj.graceRetrys;

	//ValidTime
	if(typeof appObj.validTime != 'undefined')
		app.validTime = appObj.validTime;

	validateLicenses(appObj.licenses, function(err, licenses){
		if(err){
			next(err);
			return;
		}
		app.licenses = licenses;

		//Create the public private key for signin
		certificateSv.create(appObj.identifier, function(err, pub, priv){
			if(err){
				next(err);
				return;
			}

			app.publicKey = pub;
			app.privateKey = priv;
			app.save(function(err){
				if(err){
					next(err);
					return;
				}
				next(null, app);
			});
		}); 
	});

}

/* Update a existing @app with data from @newApp
	 Returns the app wit new data */
exports.update = function(app, newApp, next){
	if(!app){
		next(new Error('Missing app parameter'));
		return;
	} 

	if(!newApp){
		next(new Error('Missing newApp parameter'));
		return;		
	}

	validateLicenses(newApp.licenses, function(err, licenses){
		if(!err){
			app.licenses = newApp.licenses 	
		}

		app.enabled 					= typeof newApp.enabled != 'undefined'	? newApp.enabled : app.enabled;
		app.maxVersionCode 		= newApp.maxVersionCode 		? newApp.maxVersionCode : app.maxVersionCode;
		app.updateVersionCode = newApp.updateVersionCode 	? newApp.updateVersionCode : app.updateVersionCode; 
		app.graceInterval 		= newApp.graceInterval 			? newApp.graceInterval : app.graceInterval;
		app.graceRetrys 			= newApp.graceRetrys 				? newApp.graceRetrys : app.graceRetrys;
		app.validTime 				= newApp.validTime 					? newApp.validTime : app.validTime;

		app.save(function(err){
			if(err){
				next(err);
				return;
			}
			next(null, app);
		});
	});

}

/* Deletes a existing @app and returns it */
exports.delete = function(app, next){
	if(!app){
		next(new Error('Missing app parameter'));
		return;
	}

	//Remove all Developers from the app
	developerSv.deleteByApp(app, function(err, app){
		if(err){
			next(err);
			return;
		}
		
		db.App.remove({identifier: app.identifier}, function(err){
			if(err){
				next(err);
				return;
			}
			next(null, app);
		});
	});
}

exports.clean = function(next){
	db.DeveloperRole.remove({}, function(err){
		if(err){
			next(err);
			return;
		}

		db.App.remove({}, function(err){
			if(err){
				next(err);
				return;
			}
			next();
		});
	});
}

function validateLicenses(licenses, next){
	//Licenses
	if(!licenses || Object.prototype.toString.call(licenses) != '[object Array]'){
		next(new Error ('Missing required parameter appObj.licenses'));
		return;
	}
	if(licenses.length <= 0){
		next(new Error('appObj.licenses should have at least 1 license'));
	}
	for(var i in licenses){
		if(typeof licenses[i].trialtype == 'undefined' || licenses[i].trialtype == null){
			next(new Error ('Missing required parameter appObj.licenses[].trialtype'));
			return;	
		}
	}
	next(null, licenses);
}
var db = require('../data/db'),
		certificateSv = require('./certificate'),
		developerSv = require('./developer');

/* Returns the app with @identifier from database */ 
exports.get = function(identifier, next){
	if(identifier){
		db.App.findOne({'identifier':  identifier}, function(appErr, app){
			if(appErr)
				 next(appErr);
			else 
				next(null, app);
		});
	} else {
		next(null,null);
	}
}

/* Returns all apps from database */
exports.getAll = function(next){
	db.App.find({}, function(appErr, apps){
		if(appErr)
			next(appErr);
		else
			next(null, apps);
	});
}

/* Create a new app from @appObj and insert it to database 
	 Returns the new app */
exports.create = function(appObj, next){
	if(appObj){
		var app = new db.App();
		app.identifier = appObj.identifier;
		app.maxVersionCode = appObj.maxVersionCode;
		app.graceInterval = appObj.graceInterval;
		app.graceRetrys = appObj.graceRetrys;
		app.validTime = appObj.validTime;
		app.licenses = appObj.licenses;

		//Create the public private key for signin
		certificateSv.create(appObj.identifier, function(err, pub, priv, cert){
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
	} else {
		next(null, null);
	}
}

/* Update a existing @app with data from @newApp
	 Returns the app wit new data */
exports.update = function(app, newApp, next){
	if(!app){
		next(new Error("Missing app parameter"));
		return;
	} 

	if(!newApp){
		next(new Error("Missing newApp parameter"));
		return;		
	}

	app.licenses 					= newApp.licenses 					? newApp.licenses : app.licenses;
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
}

/* Deletes a existing @app and returns it */
exports.delete = function(app, next){
	if(!app){
		next(new Error("Missing app parameter"));
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
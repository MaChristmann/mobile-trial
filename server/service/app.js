var db = require('../data/db'),
		certificateSv = require('./certificate');

exports.get = function(identifier, next){
	if(identifier){
		db.App.findOne({'identifier':  identifier}, function(appErr, app){
			if(appErr)
				 next(appErr);
			else 
				next(next, app);
		});
	} else {
		next(null,null);
	}
}


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
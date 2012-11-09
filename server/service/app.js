var db = require('../data/db');

exports.get = function(req, res, next, app){
	if(typeof req.params.app != 'undefined' && req.params.app != null) {

		db.App.findOne({'identifier':  req.params.app}, function(appErr, appObj){
			if(appErr) console.log(appErr);

			//App exists?
			if(appObj == null){
				console.log("Could not find app " + appObj);
				res.send({rc: 4, reason: 'App does not exist'});
				return;
			}
			res.locals = {};
			res.locals.app = appObj;
			next();
		});
	} else {
		next();
	}
}
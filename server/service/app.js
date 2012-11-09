var db = require('../data/db');

exports.get = function(req, res, next, app){
	if(typeof req.params.app != 'undefined' && req.params.app != null) {

		db.App.findOne({'identifier':  req.params.app}, function(appErr, app){
			if(appErr) console.log(appErr);

			//App exists?
			if(app == null){
				console.log("Could not find app " + app);
				res.send({rc: 4, reason: 'App does not exist'});
				return;
			}
			res.locals.app = app;
			next();
		});
	} else {
		next();
	}
}
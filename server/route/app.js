var appSv = require('./../service/app');

exports.middleware = function(req, res, next){
	if(typeof req.params.app != 'undefined' && req.params.app != null) {
		appSv.get(req.params.app, function(err, app){
			//App exists?
			if(app == null){
				console.log("Could not find app " + app);
				res.send(404, {rc: 4, reason: 'App does not exist'});
				return;
			}
			res.locals.app = app;
			next();
		});
	} else {
		next();
	}
}

exports.get = function(req, res, next){
	app = res.locals.app;
	if(app){
		app.privateKey = null;
		res.send(app);
	} 
	else 
		res.send(false);
}

exports.create = function(req, res, next){
	console.log("register.create");
	var appObj = JSON.parse(req.body);
	appSv.create(appObj, function(err, app){
		if(err){
			res.send(500, err);
			return;
		}
		app.privateKey = null;
		res.send(app);
	});
}
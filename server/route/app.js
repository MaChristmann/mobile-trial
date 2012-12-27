var appSv = require('./../service/app');

/* Get app as middleware */
exports.middleware = function(req, res, next){
	if(typeof req.params.app != 'undefined' && req.params.app != null) {
		appSv.get(req.params.app, function(err, app){

			//Error occured?
			if(err){
				res.send(500, 'Server Error: ' + err);
				return;
			}

			//App exists?
			if(app == null){
				res.send(404, 'App does not exist');
				return;
			}
			
			res.locals.app = app;
			next();
		});
	} else {
		next();
	}
}

/* Send the app */
exports.get = function(req, res, next){
	console.log('app.get');
	var app = res.locals.app;

	// Do not show private Key
	app.privateKey = null;
	res.send(app);
}

/* Send all apps  */ 
exports.list = function(req, res, next){
	console.log('app.list');
	appSv.list(function(err, apps){
		if(err){
			res.send(500, err);
			return;
		}
		// Do not show private Key
		for(appItem in apps){
			appItem.privateKey = null;
		}
		res.send(apps);
	});
}

/* Create an app and send it */
exports.create = function(req, res, next){
	console.log('app.create');
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

/* Update an app and send it */
exports.update = function(req, res, next){
	console.log('app.update');
	var newApp = JSON.parse(req.body);
	var app = res.locals.app; 

	appSv.update(app, newApp, function(err, app){
		if(err){
			res.send(500, err);
			return;
		}
		// Do not show private Key
		app.privateKey = null
		res.send(app);
	});
}

/* Delete an app and send it */
exports.delete = function(req, res, next){
	console.log('app.delete');
	var app = res.locals.app;
	appSv.delete(app, function(err, app){

		if(err){
			res.send(500, err);
			return;
		}
		app.privateKey = null;
		res.send(app);
	});
}
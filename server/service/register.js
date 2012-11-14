var db = require('../data/db');

exports.create = function (req, res, next){
	console.log("register.create");
		console.log(req.body);
	var appObj = JSON.parse(req.body);


	if(appObj){
		var app = new db.App();
		app.identifier = appObj.identifier;
		app.maxVersionCode = appObj.maxVersionCode;
		app.graceInterval = appObj.graceInterval;
		app.graceRetrys = appObj.graceRetrys;
		app.validTime = appObj.validTime;
		app.licenses = appObj.licenses;
		app.save(function(err){
			console.log(err);
			res.send(app);
		});
	}
	else 
		res.send(true);
}

exports.get = function (req, res, next){
	console.log("register.get");
	res.send(res.locals.app);
}

exports.getAll = function (req, res, next){
	console.log("register.getAll");

	db.App.find({}, function(err, apps){
		if(err) console.log(err);
		if(apps){
			res.send(apps);
		}
	});
}

exports.update = function (req, res, next){
	console.log("register.update");
	var app = res.locals.app;
			
	var appObj = JSON.parse(req.body);
	app.licenses = appObj.licenses;
	app.maxVersionCode = appObj.maxVersionCode;
	app.graceInterval = appObj.graceInterval;
	app.graceRetrys = appObj.graceRetrys;
	app.validTime = appObj.validTime;
	app.save(function(err){
		res.send(app);
	});
}

exports.delete = function (req, res, next){
	console.log('register.delete');
	db.App.remove({'identifier': req.params.app}, function(err){
		if(err) console.log(err);
		res.send(true);
	});
}
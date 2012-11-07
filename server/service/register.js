var db = require('../data/db');

exports.create = function (req, res, next){
	console.log("register.create");
		console.log(req.body);
	var appObj = JSON.parse(req.body);


	if(appObj){
		var app = new db.App();
		app.identifier = appObj.identifier;
		app.constraints = appObj.constraints;
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

	db.App.findOne({'identifier' : req.params.app}, function(err, app){
		if(err) console.log(err);
		if(app)
			res.send(app);
	});
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
	db.App.findOne({'identifier' : req.params.app}, function(err, app){
		if(err) console.log(err);
		if(app){
			var appObj = JSON.parse(req.body);
			app.constraints = appObj.constraints;
			app.save(function(err){
				res.send(app);
			});
		}
	});
}

exports.delete = function (req, res, next){
	console.log('register.delete');
	db.App.remove({'identifier': req.params.app}, function(err){
		if(err) console.log(err);
		res.send(true);
	});
}
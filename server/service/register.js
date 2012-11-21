

var db = require('../data/db'),
	certificateSv = require('./certificate');

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

		//Create the public private key for signin
		certificateSv.create(appObj.identifier, function(err, pub, priv, cert){
			if(err){
				console.log(err);
				res.send(500, {rc:4, reason:'Could create certificate'});
				return;
			}

			app.publicKey = pub;
			app.privateKey = priv;
			app.save(function(err){
				if(err){
					res.send(500, {rc:4, reason:'Could not save app to database'});
					return;
				}
				res.send(app);
			});

	});


	}
	else 
		res.send(500, {rc:4, reason:'No body data'});
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
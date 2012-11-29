var db = require('./../data/db');

var userSv = require('./../service/user');

exports.get = function(app, userAccount, next){
	if(!app){
		next(new Error('Missing parameter app'));
		return;
	}

	if(!userAccount){
		next(new Error('Missing paramater userAccount'));
		return;
	}

	userSv.get(userAccount, function(err, user){
		if(err){
			next(err);
			return;
		} 

		if(user == null){
			next(null, null);
			return;
		}

		db.DeveloperRole.findOne({'user': user, 'app': app}, function(err, developer){
			if(err) {
				nextr(err);
				return;
			}

			if(developer == null){
				next(null, null);
				return;
			}
			next(null, developer);
		});
	});
}

exports.create = function(app, developerObj, next){
	if(!app){
		next(new Error('Missing paramater app'));
		return;
	}

	if(!developerObj){
		next(new Error('Missing parameter developerObj'));
		return;
	}

	userSv.get(developerObj.user, function(err, user){
		if(err){
			next(err);
			return;
		}
		if(user == null){
			next(null,null);
			return;
		}

		var developer = new db.DeveloperRole();
		developer.user = user;
		developer.app = app;

		developer.save(function(err){
			if(err){
				next(err);
				return;
			}
			res.send(null, developer);
		});


	});

}

exports.setTestResult = function(req, res, next){
	var developer = res.locals.developer;

	if(developer == null){
		res.send(false);
	}

	var developerObj = JSON.parse(req.body);
	developer.testResult = developerObj.testResult;
	developer.save(function(err){
		res.send(developer);
	});
}



exports.revokeFromDeveloper = function(req, res, next){
	var user = res.locals.user;
	var app = res.locals.app;

	revokeDeveloperFromApp(user, app, function(){
		res.send(true);
	});
};
var db = require('../data/db');

exports.get = function(req, res, next){
	var account = req.params.account;
	var app = res.locals.app;
	
	res.locals.developer = null;

	db.User.findOne({'account': account}, function(err, user){
		if(err){
			console.log(err);
			res.send(500, {rc: 4, reason: 'Error on finding User'});
			return;
		} 
		if(user == null){
			next();
			return;
		}

		db.DeveloperRole.findOne({'user': user, 'app': app}, function(err, developer){
			if(err) {
				console.log(err);
				res.send(500, {rc: 4, reason: 'Error on finding Developer'});
				return;
			}

			if(developer == null){
				next();
				return;
			}
			res.locals.developer = developer;
			next();
		});
	});
}


exports.update = function(req, res, next){
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
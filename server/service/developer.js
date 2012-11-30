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

exports.setTestResult = function(developer, testResult, next){
	if(!developer){
		next(new Error('Missing parameter developer'));
		return;
	}

	if(!testResult){
		next(new Error('Missing parameter testResult'));
		return;
	}

	developer.testResult = testResult;

	developer.save(function(err){
		if(err){
			next(err);
			return;
		}
		next(null, developer);
	});
}

exports.delete = function(developer, next){
	if(!developer){
		next(new Error('Missing parameter developer'));
		return;
	}
	db.DeveloperRole.remove({'user': developer.user, 'app': developer.app}, function(err){
		if(err){
			next(err);
			return;
		}
		next(null, developer);
	});
}

exports.deleteByApp = function(app, next){
	if(!app){
		next(new Error('Missing parameter app'));
		return;
	}

	db.DeveloperRole.remove({'app': app}, function(err){
		if(err){
			next(err);
			return;
		}
		next(null, app);
	});
}

exports.deleteByUser = function(user, next){
	if(!user){
		next(new Error('Missing parameter user'));
		return;
	}

	db.DeveloperRole.remove({'user': user}, function(err){
		if(err){
			next(err);
			return;
		}
		next(null, user);
	})
}
var db = require('./../data/db');

var userSv = require('./../service/user');

exports.get = function(app, account, next){
	if(!app){
		next(new Error('Missing parameter app'));
		return;
	}

	if(!account){
		next(new Error('Missing paramater account'));
		return;
	}

	userSv.get(account, function(err, user){
		if(err){
			next(err);
			return;
		} 

		if(user == null){
			next(null, null);
			return;
		}

		db.DeveloperRole
			.findOne({'user': user, 'app': app})
			.exec( function(err, developer){
				if(err) {
					next(err);
					return;
				}
				next(null, developer);
			});
	});
}

exports.list = function(app, next){
	if(!app){
		next(new Error('Missing parameter app'));
		return;
	}

	db.DeveloperRole.find({'app': app})
		.populate('user')
		.exec(function(err, developers){
			if(err){
				next(err);
				return;
			}
			next(null, developers);
		});
}

exports.listByUser = function(user, next){
	if(!user){
		next(new Error('Missing parameter user'));
		return;
	}

	db.DeveloperRole.find({'user': user})
		.populate('app')
		.exec(function(err, developers){
			if(err){
				next(err);
				return;
			}
			next(null, developers);
		});
}

exports.create = function(app, developerObj, next){
	if(!app){
		next(new Error('Missing paramater app'));
		return;
	}

	if(!developerObj || !developerObj.user){
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
			next(null, developer);
		});
	});

}

exports.setTestResult = function(developer, testResult, next){
	if(!developer){
		next(new Error('Missing parameter developer'));
		return;
	}

	if(typeof testResult == 'undefined' || testResult == null){
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
var userSv = require('./../service/user'), 
		developerSv = require('./../service/developer');

/* Get user as middleware */
exports.middleware = function(req, res, next){
	var logger = res.locals.logger;
	var user = req.params.user;

	if(typeof user == 'undefined' || user == null){
		next();
		return;
	}

	userSv.get(user, function(err, user){	
		if(err) {
			logger.error('On get user: ' + err);
			res.send(500, err);
			return;
		}

		if(user == null){
			logger.info('User does not exist');
			res.send(404, 'Not found');
			return;
		}

		res.locals.user = user;
		next();
	});
}

/* Send the user */
exports.get = function(req, res, next){
	var user = res.locals.user;
	// Do not show password
	user.password = null;
	res.send(user);
}

/* Send all the users */
exports.list = function(req, res, next){
	var logger = res.locals.logger;
	userSv.list(function(err, users){
		if(err){
			logger.error('On list users: ' + err);
			res.send(500, err);
			return;
		}
		// Do not show password
		for(var i=0; i < users.length; i++){
			users[i].password = null;
		}
		res.send(users)
	});
}

exports.create = function(req, res, next){
	var logger = res.locals.logger;
	var userObj = JSON.parse(req.body);

	if(typeof userObj.account == 'undefined'){
		logger.error('Missing body param account');
		res.send(500, new Error('Missing body param account'));
		return;
	}

	if(typeof userObj.password == 'undefined'){
		logger.error('Missing body param');
		res.send(500, new Error('Missing body param'));
		return;
	}

	userSv.create(userObj, function(err, user){
		if(err){
			logger.error('On create user: ' + err);
			res.send(500, err);
			return;
		}
		// Do not show password
		user.password = null;
		res.send(user);
	});
}

exports.delete = function(req, res, next){
	var logger = res.locals.logger;
	var user = res.locals.user;

	userSv.revokeFromAdmin(user, function(err,user){
		if(err){
			logger.error('On user revokeFromAdmin: '  + err);
			res.send(500, err);
			return;
		}
		developerSv.deleteByUser(user, function(err, user){
			if(err){
				logger.error('On developer deleteByUser: ' + err);
				res.send(500, err);
				return;
			}

			userSv.delete(user, function(err, user){
				if(err){
					logger.error('On delete user: ' + err);
					res.send(500, err);
					return;
				}
				// Do not show password
				user.password = null;
				res.send(user);
			});
		});
	});
}

exports.assignToAdmin = function(req, res, next){
	var logger = res.locals.logger;
	var user = res.locals.user;

	userSv.assignToAdmin(user, function(err, user){
		if(err){
			logger.error('On user assignToAdmin: ' + err);
			res.send(500, err);
			return;
		}

		// Do not show password
		user.password = null;
		res.send(user);
	});
}

exports.revokeFromAdmin = function(req, res, next){
	var logger = res.locals.logger;
	var user = res.locals.user;

	userSv.revokeFromAdmin(user, function(err, user){
		if(err){
			logger.error('On user revokeFromAdmin: ' + err);
			res.send(500, err);
			return;
		}
	
		// Do not show password
		user.password = null;
		res.send(user);
	});
}

exports.listDeveloperRoles = function(req, res, next){
	var logger = res.locals.logger;
	var user = res.locals.user;
	developerSv.listByUser(user, function(err, developers){
		if(err){
			logger.error('On user listDeveloperRoles: ' + err);
			res.send(500, err);
			return;
		}
		res.send(developers);
	});
}
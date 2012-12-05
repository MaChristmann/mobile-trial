var userSv = require('./../service/user');

/* Get user as middleware */
exports.middleware = function(req, res, next){

	var user = req.params.user;

	if(typeof user == 'undefined' || user == null){
		next();
		return;
	}


	userSv.get(user, function(err, user){	
		if(err) {
			res.send(500, err);
			return;
		}

		if(user == null){
			res.send(404, 'User does not exist');
			return;
		}

		res.locals.user = user;
		next();
	});
}

/* Send the user */
exports.get = function(req, res, next){
	console.log('user.get');
	var user = res.locals.user;
	// Do not show password
	user.password = null;
	res.send(user);
}

/* Send all the users */
exports.getAll = function(req, res, next){
	console.log('user.getAll');

	userSv.getAll(function(err, users){
		if(err){
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
	console.log('user.create');

	var userObj = JSON.parse(req.body);

	if(typeof userObj.account == 'undefined'){
		res.send(500, new Error('Missing body param account'));
		return;
	}

	if(typeof userObj.password == 'undefined'){
		res.send(500, new Error('Missing body param'));
		return;
	}

	userSv.create(userObj, function(err, user){
		if(err){
			res.send(500, err);
			return;
		}
		// Do not show password
		user.password = null;
		res.send(user);
	});
}

exports.delete = function(req, res, next){
	console.log('user.delete');
	var user = res.locals.user;

	userSv.revokeFromAdmin(user, function(err,user){
		if(err){
			res.send(500, err);
			return;
		}

		developerSv.deleteByUser(user, function(err, user){
			if(err){
				res.send(500, err);
				return;
			}

			userSv.delete(user, function(err, user){
				if(err){
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
	console.log('user.assignToAdmin');
	var user = res.locals.user;

	userSv.assignToAdmin(user, function(err, user){
		if(err){
			res.send(500, err);
			return;
		}

		// Do not show password
		user.password = null;
		res.send(user);
	});
}

exports.revokeFromAdmin = function(req, res, next){
	console.log('user.revokeFromAdmin');
	var user = res.locals.user;

	userSv.revokeFromAdmin(user, function(err, user){
		if(err){
			res.send(500, err);
			return;
		}
	
		// Do not show password
		user.password = null;
		res.send(user);
	});
}
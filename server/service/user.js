var db = require('../data/db');

exports.get = function(req, res, next){
	if(typeof req.params.user != 'undefined' && req.params.user != null) {

		console.log(req.params.user);
		db.User.findOne({'account':req.params.user}, function(err, user){	
			if(err) {
				console.log(err);
				res.send(500, {rc: 4, reason: 'Error on finding User'});
				return;
			}

			if(user == null){
				console.log("Couldn't find User");
				res.send(404, {rc: 4, reason: 'User does not exist'});
				return;
			}
			res.locals.user = user;
			next();
		});
	} else {
		next();
	}
};

exports.create = function(req, res, next){
	var userObj = JSON.parse(req.body);

	if(userObj){
		var user = new db.User();
		user.account = userObj.account;
		user.password = userObj.password;

		user.save(function(err){
			if(err) console.log(err);
			res.send(user);
		})

	}
};

exports.delete = function(req, res, next){
	var user = res.locals.user;

	revokeAdmin(user, function(){
		revokeDeveloper(user, function(){ 
			db.User.remove({'account': user.account}, function(err){
				if(err) console.log(err);
				res.send(user);
			});
		});
	});
};

exports.assignToDeveloper	= function(req, res, next){
	var user = res.locals.user;
	var app = res.locals.app;

	var developer = new db.DeveloperRole();
	developer.user = user;
	developer.app = app;

	developer.save(function(err){
		if(err) console.log(err);
		res.send(developer);
	});
};

exports.revokeFromDeveloper = function(req, res, next){
	var user = res.locals.user;
	var app = res.locals.app;

	revokeDeveloperFromApp(user, app, function(){
		res.send(true);
	});
};

exports.assignToAdmin = function(req, res, next){
	var user = res.locals.user;
	var admin = new db.AdminRole();
	admin.user = user;
	admin.save(function(err){
		if(err) console.log(err);
		res.send(admin);
	});
};

exports.revokeFromAdmin = function(req, res, next){
	var user = res.locals.user;

	revokeAdmin(user, function(){
		res.send(true);
	})
};


function revokeDeveloperFromApp(user, app, next){
	db.DeveloperRole.remove({'user': user, 'app': app}, function(err){
		if(err) console.log(err);
		next();
	});
}


function revokeDeveloper(user, next){
	db.DeveloperRole.remove({'user': user}, function(err){
		if(err) console.log(err);
		next();
	});
}

function revokeAdmin(user, next){
	db.AdminRole.remove({'user': user}, function(err){
		if(err) console.log(err);
		next();
	});
}
var config = require('./../config.json');
var authenticationSv = require('./../service/authenticate');


/* Try to authorize user as a developer 
	Uses Basic Authentication */ 
exports.developer = function(req, res, next){
	var app = res.locals.app;

	//Check ip range
	checkIpRange(req, res, 'developer', function(){
		checkUserAuth(req, res, function(user){
			authenticationSv.developer(user, app, function(err, authorized){
				if(err){
					logger.error('On auth username as developer: ' + err);
					res.send(500, err);
					return;
				}

				if(!authorized){
					logger.info('User-pass combination is not a developer');
					res.send(401, new Error('Unauthorized'));
				}
				next();
			});	
		});
	});
}

/* Try to authorize user as an admin 
	Uses Basic Authentication */ 
exports.admin = function(req, res, next){ 
	var logger = res.locals.logger;

	checkIpRange(req, res, 'admin', function(){
		checkUserAuth(req, res, function(user){
			authenticationSv.admin(user, function(err, authorized){
				if(err){
					logger.error('On auth username as admin: ' + err);
					res.send(500, err);
					return;
				}

				if(!authorized){
					logger.info('User-pass combination is not an admin');
					res.send(401, new Error('Unauthorized'));
					return;
				}
				next();
			});
		});
	});
}

exports.user = function(req, res, next){
	var logger = res.locals.logger;

	checkIpRange(req, res, 'user', function(){
		checkUserAuth(req, res, function(user){
			authenticationSv.user(user, function(err, authorized){
				if(err){
					logger.error('On auth username as user: ' + err);
					res.send(500, err);
					return;
				}

				if(!authorized){
					logger.info('User-pass combination is not an user');
					res.send(401, new Error('Unauthorized'));
					return;
				}
				next();
			});
		});
	});
}


function checkIpRange (req, res, role, next){
	var logger = res.locals.logger;
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || null;

	if(typeof config.iprange == 'undefined' || typeof config.iprange[role] == 'undefined'){
		logger.info('IP address is not in range of valid '+ role +' IP addresses. See config.json');
		res.send(401, new Error('Unauthorized'));
		return;
	}

	authenticationSv.checkIpRange(ip, config.iprange[role], function(err, inRange){
		if(err){
			logger.error('On checking for ip in '+ role +' range: ' + err);
			res.send(500, err);
			return;
		}

		next();
	});
}

function checkUserAuth(req, res, next){
	var logger = res.locals.logger;

	if(!req.username){
			logger.info('Missing username for basic auth');
			res.send(401, new Error('Unauthorized'));
			return;
	}
	var username = req.username;

	if(!req.authorization || !req.authorization.basic || !req.authorization.basic.password){
		logger.info('Missing password for basic auth');
		res.send(401, new Error('Unauthorized'));
		return;
	}
	var password = req.authorization.basic.password;
	next({account: username, password: password});
}
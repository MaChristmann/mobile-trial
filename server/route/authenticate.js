var config = require('./../config.json');
var authenticationSv = require('./../service/authenticate');


/* Try to authorize user as a developer 
	Uses Basic Authentication */ 
exports.developer = function(req, res, next){

	//Check ip range
	checkIpRange(req, res, 'developer', function(err, inRange){
		if(err){
			logger.error('On checking for ip in developer range: ' + err);
			res.send(500, err);
			return;
		}

		if(inRange == false){
			logger.info('IP address is not in range of valid developer IP addresses. See config.json');
			res.send(401, new Error('Unauthorized'));
			return;
		}

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

		authenticationSv.developer(username, password, function(err, authorized){
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
}

/* Try to authorize user as an admin 
	Uses Basic Authentication */ 
exports.admin = function(req, res, next){ 
	var logger = res.locals.logger;

	checkIpRange(req, res, 'admin', function(err, inRange){
		if(err){
			logger.error('On checking for ip in admin range: ' + err);
			res.send(500, err);
			return;
		}

		if(inRange == false){
			logger.info('IP address is not in range of valid admin IP addresses. See config.json');
			res.send(401, new Error('Unauthorized'));
			return;
		}
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

		authenticationSv.admin(username, password, function(err, authorized){
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
}

function checkIpRange (req, res, role, next){
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || null;

	if(typeof config.iprange == 'undefined' || typeof config.iprange[role] == 'undefined'){
		next(null, true);
		return;
	}

	authenticationSv.checkIpRange(ip, config.iprange[role], function(err, inRange){
		if(err){
			next(err);
			return;
		}

		next(null, inRange);
	});
}
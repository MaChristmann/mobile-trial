var config = require('./../config.json');

var authenticationSv = require('./../service/authenticate');


/* Try to authorize user as a developer 
	Uses Basic Authentication */ 
exports.developer = function(req, res, next){

	//Check ip range
	checkDeveloperIpRange(req, res, function(err, inRange){
		if(err){
			res.send(500, err);
			return;
		}

		if(inRange == false){
			res.send(401, new Error('Unauthorized'));
			return;
		}

		if(!req.username){
			res.send(500, new Error('Missing username for basic auth'));
			return;
		}
		var username = req.username;

		if(!req.authorization || !req.authorization.basic || !req.authorization.basic.password){
			res.send(500, new Error('Missing password for basic auth'));
			return;
		}
		var password = req.authorization.basic.password;

		authenticationSv.developer(username, password, function(err, authorized){
			if(err){
				res.send(500, err);
				return;
			}

			if(!authorized){
				res.send(401, new Error('Unauthorized'));
			}
			next();
		});
	});
}

/* Try to authorize user as an admin 
	Uses Basic Authentication */ 
exports.admin = function(req, res, next){ 
	checkAdminIpRange(req, res, function(err, inRange){

		if(err){
			res.send(500, err);
			return;
		}

		if(inRange == false){
			res.send(401, new Error('Unauthorized'));
			return;
		}

		if(!req.username){
			res.send(500, new Error('Missing username for basic auth'));
			return;
		}
		var username = req.username;

		if(!req.authorization || !req.authorization.basic || !req.authorization.basic.password){
			res.send(500, new Error('Missing password for basic auth'));
			return;
		}
		var password = req.authorization.basic.password;

		authenticationSv.admin(username, password, function(err, authorized){
			if(err){
				res.send(500, err);
				return;
			}

			if(!authorized){
				res.send(401, new Error('Unauthorized'));
				return;
			}

			next();
		});
	});

}


function checkDeveloperIpRange(req, res, next){
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || null;

	console.log('1');
	if(typeof config.iprange == 'undefined' || typeof config.iprange.developer == 'undefined'){
		next(null, true);
		return;
	}
	console.log('2');
	authenticationSv.checkIpRange(ip, config.iprange.developer,  function(err, inRange){
		if(err){
			next(err);
			return;
		}
		console.log('3');
		next(null, inRange);
	});
}


function checkAdminIpRange(req, res, next){
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || null;

	console.log('1');
	if(typeof config.iprange == 'undefined' || typeof config.iprange.admin == 'undefined'){
		next(null, true);
		return;
	}

	console.log('2');
	authenticationSv.checkIpRange(ip, config.iprange.admin, function(err, inRange){
		if(err){
			next(err);
			return;
		}

		console.log('3');
		next(null, inRange);
	});
}
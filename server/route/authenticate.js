var authenticationSv = require('./../service/authenticate');


/* Try to authorize user as a developer 
	Uses Basic Authentication */ 
exports.developer = function(req, res, next){

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
}

/* Try to authorize user as an admin 
	Uses Basic Authentication */ 
exports.admin = function(req, res, next){ 

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
}
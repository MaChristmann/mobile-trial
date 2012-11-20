var restify = require('restify'),
		bcrypt = require('bcrypt');

var db = require('../data/db');

exports.developer = function(req, res, next){
	authenticateUser(req, res, function(userErr, user){
		db.DeveloperRole.findOne({'user': user}, function(err, developer){
			if(err) console.log(err)

			if(developer == null){
				res.send(401, new Error("401"));
				return;
			}

			next();
		});
	});
}

exports.admin = function(req, res, next){
	console.log("test");
	authenticateUser(req, res, function(userErr, user){
		db.AdminRole.findOne({'user': user}, function(err, admin){


			if(err) console.log(err)

			if(admin == null){
				res.send(401, new Error("401"));
				return;
			}
			next();
		});
	});
}

/* User authentication */
function authenticateUser(req, res, next) {
  db.User.findOne({ 'account': req.username}, function (err, user) {
  			
    if (err){
      res.send(401, new Error("401"));
      return;
    }

    if(user == null){
    	res.send(404, new Error("404"));
    	return;
    }

   	var hash = user.password;
		bcrypt.compare(req.authorization.basic.password, hash, function(err, res) {
		  if(res == false){
	      res.send(401, new restify.NotAuthorizedError());
	      return;
		  } 
		  next(null, user);
		}); 
  });

}

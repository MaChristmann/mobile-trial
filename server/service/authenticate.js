var bcrypt = require('bcrypt');

var db = require('../data/db');

exports.developer = function(username, password, next){
	authenticateUser(username, password, function(authErr, user){
		if(authErr){
			next(authErr);
			return;
		}
		if(user == null){
			next(null, false);
			return;
		}

		db.DeveloperRole.findOne({'user': user}, function(err, developer){
			if(err){
				next(err);
				return;
			}

			if(developer == null){
				next(null, false);
				return;
			}

			next(null, true);
		});
	});
}

exports.admin = function(username, password, next){
	authenticateUser(username, password, function(authErr, user){
		if(authErr){
			next(authErr);
			return;
		}

		if(user == null){
			next(null, false);
			return;
		}

		db.AdminRole.findOne({'user': user}, function(err, admin){
			if(err){
				next(err);
				return;
			} 

			if(admin == null){
				next(null, false);
				return;
			}
			next(null, true);
		});
	});
}

/* User authentication */
function authenticateUser(username, password, next) {
  db.User.findOne({ 'account': username}, function (err, user) {			
    if (err){
      next(err)
      return;
    }

    if(user == null){
    	next(null, null);
    	return;
    }

   	var hash = user.password;
		bcrypt.compare(password, hash, function(err, isAuthorized) {
			if(err){
				next(err);
				return;
			}

		  if(isAuthorized == false){
	      next(null, null);
	      return;
		  } 
		  next(null, user);
		}); 
  });
}


/* Check ip-range */
exports.ipInRange = function (ip, range){
	
}
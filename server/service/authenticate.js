var bcrypt = require('bcrypt'),
		net = require('net');


var db = require('../data/db');


exports.developer = function(userObj, app, next){
	authenticateUser(userObj.account, userObj.password, function(authErr, user){
		if(authErr){
			next(authErr);
			return;
		}

		if(user == null){
			next(null, false);
			return;
		}

		db.DeveloperRole.findOne({'user': user, 'app': app}, function(err, developer){
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

exports.admin = function(userObj, next){
	authenticateUser(userObj.account, userObj.password, function(authErr, user){
		if(authErr){
			next(authErr);
			return;
		}

		if(user == null){
			next(null, false);
			return;
		}

		if(user.adminRole.isAdmin){
			next(null, true);
		} else{
			next(null, false);
		}
	});
}

exports.user = function(userObj, next){
	authenticateUser(userObj.account, userObj.password, function(authErr, user){
		if(authErr){
			next(authErr);
			return;
		}

		if(user == null){
			next(null, false);
			return;
		}

		next(null, true);
	});
}

/* User authentication */
function authenticateUser(account, password, next) {
	if(!account){
		next(new Error('Missing parameter account'));
		return;
	}

	if(!password){
		next(new Error('Missing parameter password'));
		return;
	}

  db.User.findOne({'account': account}, function (err, user) {			
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


exports.checkIpRange = function(ip, range, next){
	//Check ip range
	if(!ip){
		next(new Error('Cannot determine ip address'));
		return;
	}

	if(!range){
		next(new Error('Missing parameter range'));
		return;
	}

	//Determine if IPv4 or IPv6
	var protocol = net.isIP(ip);

	switch(protocol){
		case 4: {
			if(typeof range.v4 == 'undefined')
				next(null, true);
			else {
				var inRange = checkV4Range(ip, range.v4);
				next(null, inRange);
			}
		}	break;

		case 6:{
			if(typeof range.v6 == 'undefined')
				next(null, true)
			else
				next(new Error('IPv6 currently not supported')); 
		} break;

		default:{
			next(new Error( ip + ' is not a valid ip'));
		}
	}
}

function checkV4Range(ip, range){
	var ipSections = ip.split(".");
	
	if(ipSections.length != 4)
		return false;

	//Check if range is an array of ranges
	if(Object.prototype.toString.call( range ) === '[object Array]'){
		for(var y=0; y < range.length; y++){
			var rangeSections = range[y].split(".");
		
			if( ipV4InRange(ipSections, rangeSections) == true){
				return true;
			}
		}
		return false;
	} else{
		var rangeSections = range.split(".");
		return ipV4InRange(ipSections, rangeSections);
	}
}

function ipV4InRange(ipSections, rangeSections){
	for(var i=0; i < ipSections.length; i++){
		//x accepts all 
		if(rangeSections[i] == 'x')
			continue;

		if(rangeSections[i].indexOf('-') == -1){
			if(parseInt(rangeSections[i]) != parseInt(ipSections[i])){
				return false;
			}
		} 
		else {
			var fromTo = rangeSections[i].split('-');
			var decimalSection = parseInt(ipSections[i]);
			if(decimalSection < parseInt(fromTo[0]) || decimalSection > parseInt(fromTo[1]))
				return false;
		}
	}
	return true;
}

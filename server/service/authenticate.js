var bcrypt = require('bcrypt'),
		net = require('net');


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


exports.checkIpRange = function(ip, range, next){
	//Check ip range
	if(ip == null){
		next(new Error('Cannot determine ip address'));
		return;
	}
	var protocol = net.isIP(ip);
	switch(protocol){
		case 4: {
			if(typeof range.v4 == 'undefined')
				next(null, true);
			else {
				var inRange = exports.checkV4Range(ip, range.v4)
				next(null, inRange);
			}
		}	break;

		case 6:{
			if(typeof range.v6 == 'undefined')
				next(null, true)
			else
				next(new Error('IPv6 currently not supported')); 
		}
			break;
	}
}

exports.checkV4Range = function(ip, range){
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

var crypto = require('crypto');
var db = require('../data/db');

exports.get = function(account, app, next){
	if(!account){
		next(new Error('Missing parameter account'));
		return;
	}

	if(!app){
		next(new Error('Missing parameter app'));
		return;
	}

	db.Customer.findOne({'account': getHashedAccount(account), 'app': app}, function(err, customer){
		if(err){
			next(err);
			return;
		}
		next(null, customer);
	});
}

exports.create = function(account, app, versionCode, next){
	if(!account){
		next(new Error('Missing parameter account'));
		return;
	}

	if(!app){
		next(new Error('Missing parameter app'));
		return;
	}

	if(typeof versionCode == 'undefined' || versionCode == null){
		next(new Error('Missing parameter versionCode'));
		return;
	}

	var customer = new db.Customer();
	//Hash mail with sha1 for privacy reasons
	customer.account = getHashedAccount(account);
	customer.app = app;
	customer.versionCode = versionCode;
	customer.createdAt = new Date();
	customer.modifiedAt = customer.createdAt;
	customer.save(function(err){
		if(err) {
			next(err);
		} else
			next(null, customer);
	});
} 


exports.update = function(customer, versionCode, next){
	if(!customer){
		next(new Error('Missing parameter customer'));
		return;
	}

	if(typeof versionCode == 'undefined' || versionCode == null){
		next(new Error('Missing parameter versionCode'));
		return;
	}

	customer.versionCode = versionCode;
	customer.save(function(err){
		if(err) {
			next(err);
			return;
		} 
		next(null, customer);
	});
}


function getHashedAccount(account){
	var shasum = crypto.createHash('sha1');
	shasum.update(account, 'utf8');
	return shasum.digest('hex');
}
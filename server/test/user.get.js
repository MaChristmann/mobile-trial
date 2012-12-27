var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var userSv = require('./../service/user');

describe('user.get', function(){

	var account;
	var userObj;
	var userInstance;
	var err = null;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(done){
		console.log("START TEST USER.GET");
		mongoose.connect(config.mongodb.test); 

		account = "user@mobiletrial.org";
		userObj = {
			account: account,
			password: "topsecret"
		};

		//Clean users and create an user
		userSv.clean(function(err){
			if(err) throw err;
			userSv.create(userObj, function(err, user){
				if(err) throw err;
				userInstance = user;
				done();
			});
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST USER.GET");
		mongoose.disconnect();
	});

	it('should return an error for undefined account parameter', function(done){
		var undefinedParameter;
		userSv.get(undefinedParameter, function(err, user){
			assert.notEqual(err, null);
			done();
		});	
	});

	it('should return an error for null account parameter', function(done){
		userSv.get(null, function(err, user){
			assert.notEqual(err, null);
			done();
		});	
	});

	it('should return null for account that does not exist', function(done){
		var notExistingAccount = "notExist@mobiletrial.org";
		userSv.get(notExistingAccount, function(err, user){
			assert.ifError(err);
			assert.equal(user, null);
			done();
		});
	});

	it('should return the user obj without password for existing account', function(done){
		userSv.get(account, function(err, user){
			assert.ifError(err);
			assert.equal(user.account, account);
			assert.equal(user._id.toString(), userInstance._id.toString());
			done();
		});
	});
});
var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var userSv	= require('./../service/user'),
		authenticateSv = require('./../service/authenticate');


describe('authenticate.user', function(){
	var userObj = {
			account: "anyUser@mobiletrial.de",
			password: "anyPassword"
		}; 

	var err = null;
	var userInstance;
	
	// Connect to Mongo DB
	// Clean user database
	// Create an user
	before(function(done){
		console.log("START TEST AUTHENTICATE.USER");
		mongoose.connect(config.mongodb.test); 

		userSv.clean(function(err){
			if(err) throw err;

			userSv.create(userObj, function(err, user){
				if(err) throw err;

				userInstance = user;
				done();
			});
		})
	});

	// Disconnect
	after(function(){
		console.log("END TEST AUTHENTICATE.USER");
		mongoose.disconnect();
	});

	it('should return an error for undefined account parameter', function(done){
		var undefinedParameter;
		var tmpUser = {
			account: undefinedParameter,
			password: userObj.password
		};
		authenticateSv.user(tmpUser, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null account parameter', function(done){
		var tmpUser = {
			account: null,
			password: userObj.password
		};
		authenticateSv.user(tmpUser, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined password parameter', function(done){
		var undefinedParameter;
		var tmpUser = {
			account: userObj.account,
			password: undefinedParameter
		};
		authenticateSv.user(tmpUser, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});	

	it('should return an error for null password parameter', function(done){
		var tmpUser = {
			account: userObj.account,
			password: null
		};
		authenticateSv.user(tmpUser, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});	


	it('should disallow access for account that does not exist', function(done){
		var tmpUser = {
			account: 'notexist@mobiletrial.de',
			password: 'anyPassword'
		};
		authenticateSv.user(tmpUser, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should disallow access for existing user but wrong password', function(done){
		var tmpUser = {
			account: userObj.account,
			password: 'wrongPassword'
		};	
		authenticateSv.user(tmpUser, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should allow access for valid combination of account and password', function(done){
		authenticateSv.user(userObj, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, true);
			done();
		});
	});
});
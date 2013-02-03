var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var userSv	= require('./../service/user'),
		appSv 	= require('./../service/app'),
		developerSv = require('./../service/developer'),
		authenticateSv = require('./../service/authenticate');


describe('authenticate.developer', function(){
	var appObj =
		{
			identifier: "de.unittest"
			, maxVersionCode: 2
			, updateVersionCode: 2			 	
			, licenses: [{
		 		trialtype: "time"
		 		, value: 1
		 	}]
	 	};

	var appObj2 =
		{
			identifier: "de.second.unit.test"
			, maxVersionCode: 2
			, updateVersionCode: 2			 	
			, licenses: [{
		 		trialtype: "time"
		 		, value: 1
		 	}]
	 	};

	var userObj = {
			account: "developer@mobiletrial.de",
			password: "devPassword"
		}; 

	var developerObj = {
			user: "developer@mobiletrial.de",
		}; 

	var anotherUserObj = {
			account: "anyUser@mobiletrial.de",
			password: "anyPassword"
		}; 

	var developerInstance;
	var appInstance, appInstance2;
	var err = null;
	
	// Connect to Mongo DB
	// Clean user and app database
	// Create an user and app and assign him as developer
	// Create another user who is not an developer
	before(function(done){
		console.log("START TEST AUTHENTICATE.DEVELOPER");
		mongoose.connect(config.mongodb.test); 

		appSv.clean(function(err){
			if(err) throw err;

			appSv.create(appObj, function(err, app){
				if(err) throw err;
					appInstance = app;

				appSv.create(appObj2, function(err, app2){
					if(err) throw err;
					appInstance2 = app2;

					userSv.clean(function(err){
						if(err) throw err;

						userSv.create(userObj, function(err, user){
							if(err) throw err;

							developerSv.create(appInstance, developerObj, function(err, developer){
								if(err) throw err;
								developerInstance = developer;

								userSv.create(anotherUserObj, function(err, otherUser){
									if(err) throw err;
									done();
								});
							});
						});
					});
				});
			});
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST AUTHENTICATE.DEVELOPER");
		mongoose.disconnect();
	});

	it('should return an error for undefined account parameter', function(done){
		var undefinedParameter;
		var tmpUser = {
			account: undefinedParameter,
			password: userObj.password
		};
		authenticateSv.developer(tmpUser, appInstance, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null account parameter', function(done){
		var tmpUser = {
			account: null,
			password: userObj.password
		};
		authenticateSv.developer(tmpUser, appInstance, function(err, isAuthorized){
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
		authenticateSv.developer(tmpUser, appInstance, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});	

	it('should return an error for null password parameter', function(done){
		var tmpUser = {
			account: userObj.account,
			password: null
		};
		authenticateSv.developer(tmpUser, appInstance, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});	

	it('should disallow access for existing user that is not an developer', function(done){ 
		authenticateSv.developer(anotherUserObj, appInstance, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should disallow access for account that does not exist', function(done){
		var tmpUser = {
			account: 'notexist@mobiletrial.de',
			password: 'anyPassword'
		};
		authenticateSv.developer(tmpUser, appInstance, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should disallow access for existing developer but wrong password', function(done){
		var tmpUser = {
			account: userObj.account,
			password: 'wrongPassword'
		};
		authenticateSv.developer(tmpUser, appInstance, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should disallow access for an existing developer for a different app', function(done){
		authenticateSv.developer(userObj, appInstance2, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should allow access for valid combination of account and password', function(done){
		authenticateSv.developer(userObj, appInstance, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, true);
			done();
		});
	});
});
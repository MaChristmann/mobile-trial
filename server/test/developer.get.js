var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv = require('./../service/app'),
		userSv = require('./../service/user'),
		developerSv	= require('./../service/developer');

describe('developer.get', function(){
	
	var account = "developer@mobiletrial.org";
	var appObj =
		{
			identifier: "de.unittest"			 	
			, licenses: [{
		 		trialtype: "time"
		 		, value: 30
		 	}]
	 	};

	var appObj2 =
		{
			identifier: "de.unittest2"			 	
			, licenses: [{
		 		trialtype: "time"
		 		, value: 30
		 	}]
	 	};


	var userObj = 
	{
		account: account
		, password: "AnyPassword"
	}

	var developerObj = 
	{
		user: account
	};




	var appInstance, appInstance2;
	var userInstance;
	// Connect to Mongo DB
	// Clean apps and create two apps
	// Clean users and create a user
	// Create new developer for app

	before(function(done){
		console.log("START TEST DEVELOPER.GET");
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
							userInstance = user;
							developerSv.create(appInstance, developerObj, function(err, developer){
								if(err) throw err;
								done();
							});
						});
					});
				});
			});	
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST DEVELOPER.GET");
		mongoose.disconnect();
	});

	it('should return an error for undefined app parameter', function(done){
		var undefinedParameter;
		developerSv.get(undefinedParameter, account, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null app parameter', function(done){
		developerSv.get(null, account, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined account parameter', function(done){
		var undefinedParameter;
		developerSv.get(appInstance, undefinedParameter, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null account parameter', function(done){
		developerSv.get(appInstance, null, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return null for an user that even does not exist', function(done){
		var notExistingAccount = "doesNotExist@mobiletrial.org";
		developerSv.get(appInstance, notExistingAccount, function(err, developer){
			assert.ifError(err);
			assert.equal(developer, null);
			done();
		});
	});

	it('should return null for existing user account but not as developer for this app', function(done){
		developerSv.get(appInstance2, account, function(err, developer){
			assert.ifError(err);
			assert.equal(developer, null);
			done();
		});
	});

	it('should return the developer object', function(done){
		developerSv.get(appInstance, account, function(err, developer){
			assert.ifError(err);
			assert.equal(developer.app.toString(), appInstance._id.toString());
			assert.equal(developer.user.toString(), userInstance._id.toString());
			done();
		});
	});

});
var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv = require('./../service/app'),
		userSv = require('./../service/user'),
		developerSv	= require('./../service/developer');

describe('developer.list', function(){
	
	var appObj =
		{
			identifier: "de.unittest"			 	
			, licenses: [{
		 		trialtype: "time"
		 		, value: 30
		 	}]
	 	};

	var userObj = 
	{
		account: "developer@mobiletrial.org"
		, password: "AnyPassword"
	}
	var userObj2 =
	{
		account: "developer2@mobiletrial.org"
		, password: "AnyPassword"
	}

	var developerObj = {user: "developer@mobiletrial.org"};
	var developerObj2 = {user: "developer2@mobiletrial.org"};

	var appInstance;
	var userInstance, userInstance2;
	// Connect to Mongo DB
	// Clean apps and create an app
	// Clean users and create two user
	// Create two developers for app

	before(function(done){
		console.log("START TEST DEVELOPER.LIST");
		mongoose.connect(config.mongodb.test); 

		appSv.clean(function(err){
			if(err) throw err;
			appSv.create(appObj, function(err, app){
				if(err) throw err;
				appInstance = app;
				done();
			});
		});
	});

	beforeEach(function(done){
		userSv.clean(function(err){
			if(err) throw err;
			userSv.create(userObj, function(err, user){
				if(err) throw err;
				userInstance = user;
				developerSv.create(appInstance, developerObj, function(err, developer){
					if(err) throw err;
					userSv.create(userObj2, function(err, user2){
						if(err) throw err;
						var userInstance2 = user2;
						developerSv.create(appInstance, developerObj2, function(err, developer){
							if(err) throw err;
							done();
						});
					});
				});
			});
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST DEVELOPER.LIST");
		mongoose.disconnect();
	});

	it('should return an error for undefined app parameter', function(done){
		var undefinedParameter;
		developerSv.list(undefinedParameter, function(err, developers){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null app parameter', function(done){
		developerSv.list(null, function(err, developers){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return empty array for an app that has no developers ', function(done){
		developerSv.deleteByApp(appInstance, function(err, developers){
			developerSv.list(appInstance, function(err, developers){
				assert.ifError(err);
				assert.equal(developers.length, 0);
				done();
			});
		});
	});


	it('should return an list of two developers', function(done){
		developerSv.list(appInstance, function(err, developers){
			assert.ifError(err);
			assert.equal(developers.length, 2);
			done();
		});
	});
});
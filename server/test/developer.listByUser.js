var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv = require('./../service/app'),
		userSv = require('./../service/user'),
		developerSv	= require('./../service/developer');

describe('developer.listByUser', function(){
	
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
			identifier: "de.anotherapp"			 	
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

	var appInstance, appInstance2;
	var userInstance, userInstance2;
	// Connect to Mongo DB
	// Clean apps and create an app
	// Clean users and create two user
	// Create two developers for app

	before(function(done){
		console.log("START TEST DEVELOPER.LISTBYUSER");
		mongoose.connect(config.mongodb.test); 

		appSv.clean(function(err){
			if(err) throw err;
			appSv.create(appObj, function(err, app){
				if(err) throw err;
				appInstance = app;
				appSv.create(appObj2, function(err, app2){
					if(err) throw err;
					appInstance2 = app2;
					done();
				});
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

					developerSv.create(appInstance2, developerObj, function(err, developer){
						userSv.create(userObj2, function(err, user2){
							if(err) throw err;
							userInstance2 = user2;
							done();
						});
					});
				});
			});
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST DEVELOPER.LISTBYUSER");
		mongoose.disconnect();
	});


	it('should return an error for undefined user parameter', function(done){
		var undefinedParameter;
		developerSv.listByUser(undefinedParameter, function(err, developers){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null user parameter', function(done){
		developerSv.listByUser(null, function(err, developers){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return empty array for an user that has no apps for developing', function(done){
		developerSv.listByUser(userInstance2, function(err, developers){
			assert.ifError(err);
			assert.equal(developers.length, 0);
			done();
		});
	});

	it('should return an list of two developers', function(done){
		developerSv.listByUser(userInstance, function(err, developers){
			assert.ifError(err);
			assert.equal(developers.length, 2);
			done();
		});
	});
});
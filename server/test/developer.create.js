var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv = require('./../service/app'),
		userSv = require('./../service/user'),
		developerSv	= require('./../service/developer');

describe('developer.create', function(){
	
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


	before(function(done){
		console.log("START TEST DEVELOPER.CREATE");
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

	// Clean users and create a user
	beforeEach(function(done){
		developerObj = { user: account };

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
		console.log("END TEST DEVELOPER.CREATE");
		mongoose.disconnect();
	});


	it('should return an error for undefined app parameter', function(done){
		var undefinedParameter;

		developerSv.create(undefinedParameter, developerObj, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null app parameter', function(done){
		developerSv.create(null, developerObj, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined developerObj parameter', function(done){
		var undefinedParameter;

		developerSv.create(appInstance, undefinedParameter, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null developerObj parameter', function(done){
		developerSv.create(appInstance, null, function(err, developer){
			assert.notEqual(err, null);
			done();
		});		
	});

	it('should return an error if developerObj does not contain a user', function(done){
		delete developerObj['user'];
		developerSv.create(appInstance, developerObj, function(err, developer){
			assert.notEqual(err, null);
			done();
		});		
	});

	it('should return null if there is no such user', function(done){
		developerObj.user = "doesNotExist@mobiletrial.org";
		developerSv.create(appInstance, developerObj, function(err, developer){
			assert.ifError(err);
			assert.equal(developer, null);
			done();
		});
	});

	it('should create a developer role for app/user combination and return it', function(done){
		developerSv.create(appInstance, developerObj, function(err, developer){
			assert.ifError(err);
			assert.equal(developer.user.toString(), userInstance._id.toString());
			assert.equal(developer.app.toString(), appInstance._id.toString());
			done();
		});
	});

});
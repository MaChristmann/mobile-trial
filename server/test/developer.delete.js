var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv = require('./../service/app'),
		userSv = require('./../service/user'),
		developerSv	= require('./../service/developer');

describe('developer.setTestResult', function(){
	
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


	var appInstance;
	var developerInstance;
	var userInstance;

	// Connect to Mongo DB
	// Clean apps and create two apps
	// Clean users and create a user
	// Create new developer for app

	before(function(done){
		console.log("START TEST DEVELOPER.DELETE");
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
					developerInstance = developer;
					done();
				});
			});
	});
	});

	// Disconnect
	after(function(){
		console.log("END TEST DEVELOPER.DELETE");
		mongoose.disconnect();
	});


	/**
	DELETE ONE DEVELOPER
	**/
	it('should return an error for undefined developer parameter', function(done){
		var undefinedParameter;
		developerSv.delete(undefinedParameter, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null developer parameter', function(done){
		developerSv.delete(null, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should delete the developer role for user/app combination and return deleted developer role obj', function(done){
		developerSv.delete(developerInstance, function(err, developer){
			assert.ifError(err);
			assert.equal(developerInstance._id, developer._id);
			
			developerSv.get(appInstance, account, function(err, developer){
				assert.ifError(err);
				assert.equal(developer, null);
				done();
			});
		});
	});

	/**
	DELETE BY APP
	**/

	it('should return an error for undefined app parameter', function(done){
		var undefinedParameter;
		developerSv.deleteByApp(undefinedParameter, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null app parameter', function(done){
		developerSv.deleteByApp(null, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should delete all developer roles from this app', function(done){
		developerSv.deleteByApp(appInstance, function(err, app){
			assert.ifError(err);
			assert.equal(appInstance._id, app._id);

			developerSv.get(appInstance, account, function(err, developer){
				assert.ifError(err);
				assert.equal(developer, null);
				done();
			});
		});
	});

	/**
	DELETE BY USER
	**/

	it('should return an error for undefined user parameter', function(done){
		var undefinedParameter;
		developerSv.deleteByUser(undefinedParameter, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null user parameter', function(done){
		developerSv.deleteByUser(null, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should delete all developer roles from this user', function(done){
		developerSv.deleteByUser(userInstance, function(err, user){
			assert.ifError(err);
			assert.equal(userInstance._id, user._id);

			developerSv.get(appInstance, account, function(err, developer){
				assert.ifError(err);
				assert.equal(developer, null);
				done();
			});
		});
	});

});
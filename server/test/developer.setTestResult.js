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
	// Connect to Mongo DB
	// Clean apps and create two apps
	// Clean users and create a user
	// Create new developer for app

	before(function(done){
		console.log("START TEST DEVELOPER.SETTESTRESULT");
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
		console.log("END TEST DEVELOPER.SETTESTRESULT");
		mongoose.disconnect();
	});


	it('should return an error for undefined developer parameter', function(done){
		var undefinedParameter;
		developerSv.setTestResult(undefinedParameter, '1', function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null developer parameter', function(done){
		developerSv.setTestResult(null, '1', function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined testResult parameter', function(done){
		var undefinedParameter;
		developerSv.setTestResult(developerInstance, undefinedParameter, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null testResult parameter', function(done){
		var undefinedParameter;
		developerSv.setTestResult(developerInstance, null, function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for an invalid testResult code 2 [valid: 0,1,4]', function(done){
		developerSv.setTestResult(developerInstance, '2', function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for an invalid testResult code 3 [valid: 0,1,4]', function(done){
		developerSv.setTestResult(developerInstance, '3', function(err, developer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should change the testResult from LICENSED (code=0) to SERVER_ERROR (code=4) and return developer', function(done){
		var previousResult = developerInstance.testResult;
		assert.equal(previousResult, '0');
		developerSv.setTestResult(developerInstance, '4', function(err, developer){
			assert.ifError(err);
			assert.equal(developer.testResult, '4');
			done();
		});
	});

	it('should change the testResult from LICENSED (code=0) to NOTLICENSED (code=1) and return developer', function(done){
		var previousResult = developerInstance.testResult;
		assert.equal(previousResult, '0');
		developerSv.setTestResult(developerInstance, '1', function(err, developer){
			assert.ifError(err);
			assert.equal(developer.testResult, '1');
			done();
		});
	});

	it('should change the testResult from LICENSED (code=0) to LICENSED (code=0) and return developer', function(done){
		var previousResult = developerInstance.testResult;
		assert.equal(previousResult, '0');
		developerSv.setTestResult(developerInstance, '0', function(err, developer){
			assert.ifError(err);
			assert.equal(developer.testResult, '0');
			done();
		});
	});
});
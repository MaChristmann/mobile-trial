var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app'),
		userSv = require('./../service/user'),
		developerSv = require('./../service/developer'),
		licenseSv = require('./../service/license');

describe('license.testResponse', function(){
	var appObj = {};
	var userObj = {};
	var developerObj = {};
	var account = "";  
	var appInstance = {};
	var developerInstance = {};
	var bodyParams = {};
	var response = {};

	var err = null;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(done){
		console.log("START TEST LICENSE.TESTRESPONSE");
		mongoose.connect(config.mongodb.test); 

		appObj =
			{
				identifier: "de.unittest"			 	
				, licenses: [{
			 		trialtype: "time"
			 		, value: 30
			 	}]
		 	};

		account = "testaccount@mobiletrial.org";
		bodyParams[licenseSv.PARAM_NONCE] = "1234567";
		bodyParams[licenseSv.PARAM_TIMESTAMP] = new Date();
		bodyParams[licenseSv.PARAM_VERSIONCODE] = 1; 

		userObj = {
			account: account,
			password: "test"
		};

		developerObj = {
			user: account
		};

		appSv.clean(function(err){
			if(err) throw err;

			appSv.create(appObj, function(err, app){
				if(err) throw err;
				appInstance = app;

				userSv.clean(function(err){
					userSv.create(userObj, function(err, user){
						if(err) throw err;
						done();
					});
				});
			});
		});
	});

	beforeEach(function(done){
		developerSv.deleteByApp(appInstance, function(err){
			if(err) throw err;

			developerSv.create(appInstance, developerObj, function(err, developer){
				if(err) throw err;
				developerInstance = developer;

				licenseSv.processRequest(appInstance, account, bodyParams, function(err, licResponse){
					response=licResponse;
					done();
				});
			});
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST LICENSE.TESTRESPONSE");
		mongoose.disconnect();
	});


	it('should return an error for undefined developer', function(done){
		var undefinedParameter;
		licenseSv.testResponse(undefinedParameter, response, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null developer', function(done){
		licenseSv.testResponse(null, response, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined licResponse', function(done){
		var undefinedParameter;
		licenseSv.testResponse(developerInstance, undefinedParameter, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null licResponse', function(done){
		licenseSv.testResponse(developerInstance, null, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});


	it('should return license response object with testResult of developer', function(done){
		licenseSv.testResponse(developerInstance, response, function(err, licResponse){
			assert.ifError(err);
			assert.equal(licResponse[licenseSv.PARAM_RESULTCODE], developerInstance.testResult);
			done();
		});
	});

});
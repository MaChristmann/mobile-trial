var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app'),
		licenseSv = require('./../service/license');

describe('license.grantAccess', function(){
	var appObj = {};
	var account = "";  
	var appInstance = {};
	var bodyParams = {};
	var response = {};

	var err = null;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(done){
		console.log("START TEST LICENSE.GRANTACCESS");
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
		licenseSv.processRequest(appInstance, account, bodyParams, function(err, licResponse){
			response=licResponse;
			done();
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST LICENSE.GRANTACCESS");
		mongoose.disconnect();
	});

	it('should return error for undefined license response obj', function(done){
		var undefinedParameter;
		licenseSv.grantAccess(undefinedParameter, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return error for null license response obj', function(done){
		licenseSv.grantAccess(null, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return license object with result code: licensed', function(done){
		licenseSv.grantAccess(response, function(err, licResponse){
			assert.ifError(err);
			assert.equal(licResponse[licenseSv.PARAM_RESULTCODE], licenseSv.CODE_LICENSED);
			done();
		});
	});
});

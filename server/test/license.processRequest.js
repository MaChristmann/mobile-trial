var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app'),
		licenseSv = require('./../service/license');

describe('license.processRequest', function(){
	var appObj = {};
	var account = "";  
	var appInstance = {};
	var bodyParams = {};

	var err = null;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(){
		console.log("START TEST LICENSE.PROCESSREQUEST");
		mongoose.connect(config.mongodb.test); 
	});

	beforeEach(function(done){
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

	// Disconnect
	after(function(){
		console.log("END TEST LICENSE.PROCESSREQUEST");
		mongoose.disconnect();
	});

	it('should return an error for null app', function(done){
		licenseSv.processRequest(null, account, bodyParams, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined app', function(done){
		var undefinedParameter; 
		licenseSv.processRequest(undefinedParameter, account, bodyParams, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null account', function(done){
		licenseSv.processRequest(appInstance, null, bodyParams, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined account', function(done){
		var undefinedParameter; 
		licenseSv.processRequest(appInstance, undefinedParameter, bodyParams, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null bodyParams', function(done){
		licenseSv.processRequest(appInstance, account, null, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined bodyParams', function(done){
		var undefinedParameter; 
		licenseSv.processRequest(appInstance, account, undefinedParameter, function(err, licResponse){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for missing nonce', function(done){
		delete bodyParams[licenseSv.PARAM_NONCE];

		licenseSv.processRequest(appInstance, account, bodyParams, function(err, licResponse){
			assert.notEqual(err, null);
			done();		
		});
	});

	it('should return an error for missing timestamp', function(done){
		delete bodyParams[licenseSv.PARAM_TIMESTAMP];

		licenseSv.processRequest(appInstance, account, bodyParams, function(err, licResponse){
			assert.notEqual(err, null);
			done();		
		});
	});

	it('should return an error for missing versionCode', function(done){
		delete bodyParams[licenseSv.PARAM_VERSIONCODE];

		licenseSv.processRequest(appInstance, account, bodyParams, function(err, licResponse){
			assert.notEqual(err, null);
			done();		
		});		
	});

	it('should return a valid license response object', function(done){
		licenseSv.processRequest(appInstance, account, bodyParams, function(err, licResponse){
			assert.ifError(err);
			assert.notEqual(typeof licResponse[licenseSv.PARAM_PACKAGENAME], 'undefined');
			assert.notEqual(typeof licResponse[licenseSv.PARAM_USERID], 'undefined');
			assert.notEqual(typeof licResponse[licenseSv.EXTRA_VALIDTIME], 'undefined');
			assert.notEqual(typeof licResponse[licenseSv.EXTRA_GRACETIME], 'undefined');
			assert.notEqual(typeof licResponse[licenseSv.EXTRA_GRACERETRYS], 'undefined');
			done();		
		});
	});

});
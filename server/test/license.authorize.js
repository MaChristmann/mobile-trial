var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app'),
		userSv = require('./../service/user'),
		developerSv = require('./../service/developer'),
		customerSv = require('./../service/customer'),
		licenseSv = require('./../service/license');

describe('license.authorize', function(){
	var appObj = {};
	var account = "";  
	var appInstance = {};
	var customerInstance = {};
	var bodyParams = {};
	var response = {};

	var err = null;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(done){
		console.log("START TEST LICENSE.authorize");
		mongoose.connect(config.mongodb.test); 

		appObj =
			{
				identifier: "de.unittest"
				, maxVersionCode: 2
				, updateVersionCode: 2			 	
				, licenses: [{
			 		trialtype: "time"
			 		, value: 1
			 	}]
		 	};

		account = "customer@mobiletrial.org";
		bodyParams[licenseSv.PARAM_NONCE] = "1234567";
		bodyParams[licenseSv.PARAM_TIMESTAMP] = new Date();
		bodyParams[licenseSv.PARAM_VERSIONCODE] = 2; 

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
		account = "customer@mobiletrial.org";
		licenseSv.processRequest(appInstance, account, bodyParams, function(err, licResponse){
			if(err) throw err;
			response=licResponse;

			customerSv.get(account, function(err, customer){
				if(customer == null){
					customerSv.create(account, appInstance, bodyParams[licenseSv.PARAM_VERSIONCODE], function(err, customer){
						if(err) throw err;
						customerInstance = customer;
						done();
					});
				} else {
					customerInstance = customer;
					done();
				}
			});
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST LICENSE.TESTRESPONSE");
		mongoose.disconnect();
	});

	it('should return license response obj with resultCode=licensed for customer with versionCode < updateVersionCode', function(done){
		response[licenseSv.PARAM_VERSIONCODE] = 2;
		customerInstance.versionCode = 1;
		customerInstance.modifiedAt -= 60*60*1000*48;  //1 day over license period
		licenseSv.authorize(appInstance, customerInstance, account, response, function(err, licResponse){
			assert.ifError(err);
			assert.equal(licResponse[licenseSv.PARAM_RESULTCODE], licenseSv.CODE_LICENSED);
			done();
		});
	});

	it('should return license response obj with resultCode=licensed for new customer', function(done){
		account = "newCustomer" + new Date().getTime() + "@mobiletrial.org";
		response[licenseSv.PARAM_USERID] = account;

		licenseSv.authorize(appInstance, null, account, response, function(err, licResponse){
			assert.ifError(err);
			assert.equal(licResponse[licenseSv.PARAM_RESULTCODE], licenseSv.CODE_LICENSED);
			done();
		});
	});

	it('should return license response obj with resultCode=licensed for existing customer', function(done){
		licenseSv.authorize(appInstance, customerInstance, account, response, function(err, licResponse){
			assert.ifError(err);
			assert.equal(licResponse[licenseSv.PARAM_RESULTCODE], licenseSv.CODE_LICENSED);
			done();
		});
	});

});
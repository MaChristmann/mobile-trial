var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv = require('./../service/app'),
		customerSv	= require('./../service/customer');

describe('customer.get', function(){

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

	var account = "user@mobiletrial.org";
	var versionCode = 1;

	var appInstance, appInstance2;
	// Connect to Mongo DB
	// Clean apps and create two apps
	// Create new customer for app if not exist
	before(function(done){
		console.log("START TEST CUSTOMER.GET");
		mongoose.connect(config.mongodb.test); 

		appSv.clean(function(err){
			if(err) throw err;

			appSv.create(appObj, function(err, app){
				if(err) throw err;
				appInstance = app;

				appSv.create(appObj2, function(err, app2){
					if(err) throw err;
					appInstance2 = app2;

					customerSv.create(account, appInstance, versionCode, function(err, customer){
						done();
					});
				});
			});	
		});

	});

	// Disconnect
	after(function(){
		console.log("END TEST CUSTOMER.GET");
		mongoose.disconnect();
	});

	it('should return customer obj for existing customer for app', function(done){
		customerSv.get(account, appInstance, function(err, customer){
			assert.ifError(err);
			assert.notEqual(customer, null);
			done();
		});
	});	
});
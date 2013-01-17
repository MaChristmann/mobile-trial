var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv = require('./../service/app'),
		customerSv	= require('./../service/customer');

describe('customer.update', function(){
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

	var account = "";
	var versionCode = 3;

	var appInstance;
	var customerInstance;
	// Connect to Mongo DB
	// Clean apps and create two apps
	// Create new customer for app if not exist
	before(function(done){
		console.log("START TEST CUSTOMER.UPDATE");
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


	//Create unique customer account across tests
	beforeEach(function(done){
		setTimeout(function() {
			account = "user" + new Date().getTime() + "@mobiletrial.org";
			versionCode = 3;
			customerSv.create(account, appInstance, versionCode, function(err, customer){
				if(err) throw err;
				customerInstance = customer;
				done();
			});
		}, 200 );
	});

	// Disconnect
	after(function(){
		console.log("END TEST CUSTOMER.UPDATE");
		mongoose.disconnect();
	});


	it('should return an error for undefined customer parameter', function(done){
		var undefinedParameter;
		var newVC = versionCode + 1;
		customerSv.update(undefinedParameter, newVC, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null customer parameter', function(done){
		var newVC = versionCode + 1;
		customerSv.update(null, newVC, function(err, customer){
			assert.notEqual(err, null);
			done();
		});	
	});

	it('should return an error for undefined versionCode parameter', function(done){
		var undefinedParameter;
		customerSv.update(customerInstance, undefinedParameter, function(err, customer){
			assert.notEqual(err, null);
			done();
		});	
	});

	it('should return an error for null versionCode parameter', function(done){
		customerSv.update(customerInstance, null, function(err, customer){
			assert.notEqual(err, null);
			done();
		});		
	});

	it('should return an error for a new versionCode which is smaller than the existing one', function(done){
		var newVC = versionCode - 1;
		customerSv.update(customerInstance, newVC, function(err, customer){
			assert.notEqual(err, null);
			done();
		});		
	});

	it('should set a new versionCode to the customer', function(done){
		var newVC = versionCode + 1;
		customerSv.update(customerInstance, newVC, function(err, customer){
			assert.ifError(err);
			assert.equal(customer.versionCode, newVC);
			assert.notEqual(customer.modifiedAt, customer.createdAt);
			done();
		});
	});
});
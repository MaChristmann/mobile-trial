var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv = require('./../service/app'),
		customerSv	= require('./../service/customer');

describe('customer.create', function(){

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


	var versionCode = 1;
	var account = "";
	var appInstance, appInstance2;
	// Connect to Mongo DB
	// Clean apps and create two apps
	before(function(done){
		console.log("START TEST CUSTOMER.CREATE");
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

	// Create unique user accounts that works for serveral test iterations
	beforeEach(function(done){
		setTimeout(function() {
      account = "user" + new Date().getTime() + "@mobiletrial.org";
      done();
  		}, 200 );
	});

	// Disconnect
	after(function(){
		console.log("END TEST CUSTOMER.CREATE");
		mongoose.disconnect();
	});

	it('should return an error for undefined account parameter', function(done){
		var undefinedParameter;
		customerSv.create(undefinedParameter, appInstance, versionCode, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null account parameter', function(done){
		customerSv.create(null, appInstance, versionCode, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined app parameter', function(done){
		var undefinedParameter;
		customerSv.create(account, undefinedParameter, versionCode, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null app parameter', function(done){
		customerSv.create(account, null, versionCode, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined versionCode parameter', function(done){
		var undefinedParameter;
		customerSv.create(account, appInstance, undefinedParameter, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null versionCode parameter', function(done){
		customerSv.create(account, appInstance, null, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for versionCode that is not a Number', function(done){
		var invalidVersionCode = "Not a Number";
		customerSv.create(account, appInstance, invalidVersionCode, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for versionCode that is not an integer > 0', function(done){
		var invalidVersionCode = 0;
		customerSv.create(account, appInstance, invalidVersionCode, function(err, customer){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for creating the same account/app combination a second time', function(done){
		customerSv.create(account, appInstance, versionCode, function(err, customer){
			assert.ifError(err);
			customerSv.create(account, appInstance, versionCode, function(err, customer){
				assert.notEqual(err, null);
				done();
			});
		});
	});

	it('should create two customer with same account but for different apps', function(done){
		customerSv.create(account, appInstance, versionCode, function(err, customer){
			assert.ifError(err);
			customerSv.create(account, appInstance2, versionCode, function(err, customer2){
				assert.ifError(err);
				assert.equal(customer.account, customer2.account);
				done();
			});
		});
	});

	it('should create a customer and return the customer obj', function(done){
		customerSv.create(account, appInstance, versionCode, function(err, customer){
			assert.ifError(err);
			assert.notEqual(typeof customer, 'undefined');
			assert.notEqual(typeof customer.account, 'undefined');
			assert.equal(customer.versionCode, versionCode);
			done();
		});
	});
});
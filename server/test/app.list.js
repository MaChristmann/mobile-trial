var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app');


describe('app.list', function(){
	var appObj = {}; 
	var err = null;
	
	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(){
		console.log("START TEST APP.LIST");
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
		appSv.clean(function(err){
			if(err) throw err;
			done();
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST APP.LIST");
		mongoose.disconnect();
	});


	it('should return array with one app', function(done){
		appSv.create(appObj, function(err, app){
			assert.ifError(err);
			appSv.list(function(err, apps){
				assert.ifError(err)
				assert.equal(Object.prototype.toString.call(apps), '[object Array]');
				assert.equal(apps.length, 1);
				done();
			});
		});
	});

	it('should return array empty array', function(done){
		appSv.list(function(err, apps){
			assert.ifError(err)
			assert.equal(Object.prototype.toString.call(apps), '[object Array]');
			assert.equal(apps.length, 0);
			done();
		});
	});
});
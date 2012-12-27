var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app');

describe('app.update', function(){
	var appObj = {}; 
	var appInstance;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(){
		console.log("START TEST APP.DELETE");
		mongoose.connect(config.mongodb.test); 
	});

	// Disconnect
	after(function(){
		console.log("END TEST APP.DELETE");
		mongoose.disconnect();
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
			appSv.create(appObj, function(err, app){
				if(err) throw err;
				appInstance = app;
				done();
			});
		});
	});

	it('should return an error for undefined app parameter', function(done){
		var undefinedParameter;
		appSv.delete(undefinedParameter, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null app parameter', function(done){
		appSv.delete(null, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should delete app and return deleted app', function(done){
		appSv.delete(appInstance, function(err, app){
			assert.ifError(err);
			assert.equal(app.identifier, appObj.identifier);
			done();
		});
	});
});
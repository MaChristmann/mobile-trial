var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app');


describe('app.get', function(){
	var appObj = {}; 
	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(){
		console.log("START TEST APP.GET");
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
			appSv.create(appObj, function(err, app){
				if(err) console.log(err);
				if(err) throw err;
				done();
			});
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST APP.GET");
		mongoose.disconnect();
	});

	it('should return the app that was created in the hook ups', function(done){
		console.log("TEST APP.GET");
		appSv.get(appObj.identifier, function(err, app){
			assert.ifError(err);
			assert.notEqual(app, null);
			assert.equal(app.identifier, appObj.identifier);
			done();	
		});
	});

	it('should return error for undefined identifier', function(done){
		console.log("TEST APP.GET");
		var undefinedIdentifier;
		appSv.get(undefinedIdentifier, function(err, app){
			assert.notEqual(err, null);
			done();	
		});
	});

	it('should return error for null identifier', function(done){
		console.log("TEST APP.GET");
		appSv.get(null, function(err, app){
			assert.notEqual(err, null);
			done();	
		});
	});

	it('should return app=null for unknown identifier', function(done){
		console.log("TEST APP.GET");
		appSv.get('unknown.identifier', function(err, app){
			assert.ifError(err)
			assert.equal(app, null);
			done();
		});
	});
});
var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app');

var appObj = {}; 
var appInstance;
describe('app.update', function(){
	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(){
		console.log("START TEST APP.UPDATE");
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
				if(err) throw err;
				appInstance = app;
				done();
			});
		});
	});


	it('should return error for undefined newApp', function(done){
		console.log("TEST APP.UPDATE");
		var undefinedParameter;

		appSv.update(appInstance, undefinedParameter, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return error for newApp is null', function(done){
		console.log("TEST APP.UPDATE");

		appSv.update(appInstance, null, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return error for undefined app', function(done){
		console.log("TEST APP.UPDATE");
		var undefinedParameter;

		appSv.update(undefinedParameter, appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return error for app is null', function(done){
		console.log("TEST APP.UPDATE");

		appSv.update(null, appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});


	it('should return error for newApp.license is an empty Array', function(done){
		console.log("TEST APP.UPDATE");
		appObj.licenses = new Array();

		appSv.update(null, appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return app with nothing updated', function(done){
		console.log("TEST APP.UPDATE");

		appSv.update(appInstance, {}, function(err, app){
			assert.ifError(err);
			done();
		});
	});

	it('should return app with updated maxVersionCode', function(done){	
		console.log("TEST APP.UPDATE");
		appObj.maxVersionCode = 10;

		appSv.update(appInstance, appObj, function(err, app){
			assert.ifError(err);
			assert.notEqual(app, null);
			assert.equal(app.maxVersionCode, 10);
			done();
		});
	});
});
var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app');

// Connect to Mongo DB
// Clean app database
// Create a test app
before(function(done){
	mongoose.connect(config.mongodb.test); 
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
			done();
		});
	});
});

// Disconnect
after(function(done){
	appSv.clean(function(err){
		mongoose.disconnect();
		done();
	});
});

var appObj; 
describe('app', function(){
	describe('#get', function(){
		it('should return the app that was created in the hook ups', function(done){
			appSv.get(appObj.identifier, function(err, app){
				assert.ifError(err);
				assert.notEqual(app, null);
				assert.equal(app.identifier, appObj.identifier);
				done();	
			});
		});

	});
});
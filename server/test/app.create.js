var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app');



var appObj; 
describe('app.create', function(){
	before(function(){
		console.log("START TEST APP.CREATE");
		mongoose.connect(config.mongodb.test); 
	});

	// Disconnect
	after(function(){
		console.log("END TEST APP.CREATE");
		mongoose.disconnect();
	});

	beforeEach(function(){
		appObj =
			{
				identifier: "de.unittest"
			 	, licenses: [{
			 		trialtype: "time"
			 		, value: 30
			 	}]
		 	};
	});

	beforeEach(function(done){
		appSv.clean(function(err){
			assert.ifError(err);
			done();
		});
	});
	
	it('should return error for undefined parameter appObj', function(done){
		console.log("TEST APP.CREATE");
		var undefinedParameter;
		appSv.create(undefinedParameter, function(err, app){
			assert.notEqual(err, null);
			done();	
		});
	});


	it('should return error for parameter appObj==null', function(done){
		console.log("TEST APP.CREATE");
		appSv.create(null, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return error for appObj with missing identifier', function(done){
		console.log("TEST APP.CREATE");
		delete appObj['identifier'];

		appSv.create(appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return error for appObj with empty string identifier', function(done){
		console.log("TEST APP.CREATE");
		appObj.identifier = '';

		appSv.create(appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});


	it('should return error for appObj with whitespace string identifier', function(done){
		console.log("TEST APP.CREATE");
		appObj.identifier = ' \n';

		appSv.create(appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});


	it('should return error for appObj with missing appObj.licenses', function(done){
		console.log("TEST APP.CREATE");
		delete appObj['licenses'];

		appSv.create(appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});


	it('should return error for creating the app invalid trialtype', function(done){
		console.log("TEST APP.CREATE");
		appObj.licenses[0].trialtype = 'nonsense';

		appSv.create(appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});


	it('should return error for creating the app with same identifier', function(done){
		console.log("TEST APP.CREATE");
		appSv.create(appObj, function(err, app){
			assert.ifError(err);

			appSv.create(appObj, function(err, app){
				assert.notEqual(err, null);
				done();
			});
		});
	});

	it('should return error for empty appObj.licenses', function(done){
		console.log("TEST APP.CREATE");
		appObj.licenses = new Array();
		appSv.create(appObj, function(err, app){
			assert.notEqual(err, null);
			done();
		});
	});


	it('should return new created app with db defaultValues and publicKey/privateKey', function(done){
		console.log("TEST APP.CREATE");
		appSv.create(appObj, function(err, app){
			assert.ifError(err);
			assert.notEqual((typeof app), 'undefined');
			assert.notEqual(app, null);

			assert.notEqual(typeof app.enabled, 'undefined');
			assert.notEqual(typeof app.maxVersionCode, 'undefined');
			assert.notEqual(typeof app.updateVersionCode, 'undefined');
			assert.notEqual(typeof app.graceInterval, 'undefined');
			assert.notEqual(typeof app.graceRetrys, 'undefined');
			assert.notEqual(typeof app.validTime, 'undefined');
			assert.notEqual(typeof app.publicKey, 'undefined');
			assert.notEqual(typeof app.privateKey, 'undefined');			
			assert.notEqual(typeof app.privateKey, 'undefined');
			done();
		});
	});


});
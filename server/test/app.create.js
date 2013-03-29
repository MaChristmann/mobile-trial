var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app');


describe('app.create', function(){
	var appObj;

	before(function(){
		console.log("START TEST APP.CREATE");
		mongoose.connect(config.mongodb.test); 
	});

	// Disconnect
	after(function(){
		console.log("END TEST APP.CREATE");
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
		appSv.clean(function(cleanErr){
			assert.ifError(cleanErr);
			done();
		});
	});


	
	it('should return error for undefined parameter appObj', function(done){
		var undefinedParameter;
		appSv.create(undefinedParameter, function(err1, app){
			assert.notEqual(err1, null);
			done();	
		});
	});


	it('should return error for parameter appObj==null', function(done){
		appSv.create(null, function(err2, app){
			assert.notEqual(err2, null);
			done();
		});
	});

	it('should return error for appObj with missing identifier', function(done){
		delete appObj['identifier'];

		appSv.create(appObj, function(err3, app){
			assert.notEqual(err3, null);
			done();
		});
	});

	it('should return error for appObj with empty string identifier', function(done){
		appObj.identifier = '';

		appSv.create(appObj, function(err4, app){
			assert.notEqual(err4, null);
			done();
		});
	});


	it('should return error for appObj with whitespace string identifier', function(done){
		appObj.identifier = ' \n';

		appSv.create(appObj, function(err5, app){
			assert.notEqual(err5, null);
			done();
		});
	});


	it('should return error for appObj with missing appObj.licenses', function(done){
		delete appObj['licenses'];

		appSv.create(appObj, function(err6, app){
			assert.notEqual(err6, null);
			done();
		});
	});


	it('should return error for creating the app invalid trialtype', function(done){
		appObj.licenses[0].trialtype = 'nonsense';

		appSv.create(appObj, function(err7, app){
			assert.notEqual(err7, null);
			done();
		});
	});


	it('should return error for creating the app with same identifier', function(done){
		appSv.create(appObj, function(err, app){
			assert.ifError(err);

			appSv.create(appObj, function(err8, app){
				assert.notEqual(err8, null);
				done();
			});
		});
	});
/*
	it('should return error for empty appObj.licenses', function(done){
		console.log("TEST APP.CREATE");
		appObj.licenses = new Array();
		appSv.create(appObj, function(err9, app){
			console.log(err9);
			assert.notEqual(err9, null, "WOOOOOOO1");
			done();
		});
	});
*/

	it('should return new created app with db defaultValues and publicKey/privateKey', function(done){
		appSv.create(appObj, function(err10, app){
			assert.ifError(err10);
			assert.notEqual((typeof app), 'undefined');
			assert.notEqual(app, null, "WOOOOOOO2");

			assert.notEqual(typeof app.enabled, 'undefined');
			assert.notEqual(typeof app.maxVersionCode, 'undefined');
			assert.notEqual(typeof app.updateVersionCode, 'undefined');
			assert.notEqual(typeof app.graceInterval, 'undefined');
			assert.notEqual(typeof app.graceRetrys, 'undefined');
			assert.notEqual(typeof app.validTime, 'undefined');
			assert.notEqual(typeof app.publicKey, 'undefined');
			assert.notEqual(typeof app.privateKey, 'undefined');			
			done();
		});
	});


});
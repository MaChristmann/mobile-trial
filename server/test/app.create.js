var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var appSv	= require('./../service/app');

// Connect to Mongo DB
var appObj; 

before(function(){
	mongoose.connect(config.mongodb.test); 
});

after(function(){
	mongoose.disconnect();
});


describe('app', function(){
	describe('#create', function(){
		
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
			var undefinedParameter;
			appSv.create(undefinedParameter, function(err, app){
				assert.notEqual(err, null);
				done();	
			});
		});


		it('should return error for parameter appObj==null', function(done){
			appSv.create(null, function(err, app){
				assert.notEqual(err, null);
				done();
			});
		});

		it('should return error for appObj with missing identifier', function(done){
			delete appObj['identifier'];

			appSv.create(appObj, function(err, app){
				assert.notEqual(err, null);
				done();
			});
		});

		it('should return error for appObj with empty string identifier', function(done){
			appObj.identifier = '';

			appSv.create(appObj, function(err, app){
				assert.notEqual(err, null);
				done();
			});
		});


		it('should return error for appObj with whitespace string identifier', function(done){
			appObj.identifier = ' \n';

			appSv.create(appObj, function(err, app){
				assert.notEqual(err, null);
				done();
			});
		});


		it('should return error for appObj with missing appObj.licenses', function(done){
			delete appObj['licenses'];

			appSv.create(appObj, function(err, app){
				assert.notEqual(err, null);
				done();
			});
		});


		it('should return error for creating the app invalid trialtype', function(done){
			appObj.licenses[0].trialtype = 'nonsense';

			appSv.create(appObj, function(err, app){
				assert.notEqual(err, null);
				done();
			});
		});


		it('should return error for creating the app with same identifier', function(done){
			appSv.create(appObj, function(err, app){
				assert.ifError(err);

				appSv.create(appObj, function(err, app){
					assert.notEqual(err, null);
					done();
				});
			});
		});

		it('should return new created app with db defaultValues and publicKey/privateKey', function(done){
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

		it('should return error for empty appObj.licenses', function(done){
			appObj.licenses = new Array();
			appSv.create(appObj, function(err, app){
				assert.notEqual(err, null);
				done();
			});
		});

	});
});
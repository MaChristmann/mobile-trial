var restify = require('restify')
, assert = require('assert')
, async = require('async');

var client = restify.createJsonClient({
  url: 'http://localhost:3000',
  version: '*'
});


var appObj = {
	identifier: "de.mobiletrial.testid"
 	, constraints: [{
 		trialtype: "days"
 		, value: 30
 	}]
 };
var appURIEncoded = encodeURIComponent(appObj.identifier);

describe('register', function(){
	describe('#post', function(){ 
		it('should return app that was created', function(done){
			client.post('/register', appObj, function(err, req, res, obj) {
				assert.ifError(err);
				assert.ok(typeof obj == 'object');
				assert.equal(obj.identifier, appObj.identifier);
				done();
			});
		});		
	});

	describe('#get', function(){
		it('should return all app', function(done){
			client.get('/register', function(err, req, res, obj) {
				assert.ifError(err);
				assert.ok(typeof obj  == 'object');
				assert.equal(typeof obj.length == 'undefined', false);
				done();
			});
		});

		it('should return app with specific identifier', function(done){
			client.get('/register/' + appURIEncoded,  function(err, req, res, obj) {
				assert.ifError(err);
				assert.ok(typeof obj == 'object');
				assert.equal(obj.identifier, appObj.identifier);
				done();
			});
		});
	});

	describe('#update', function(){
		it('should update app with specific identifier and return it', function(done){
			//Change something
			appObj.constraints[0].value = 28;
			
			client.put('/register/' + appURIEncoded, appObj, function(err, req, res, obj) {
				assert.ifError(err);
				assert.ok((typeof obj == 'object'));
				assert.equal(obj.identifier, appObj.identifier);
				done();
			});
		});
	});

	describe('#delete', function(){
		it('should delete app with specific identifier and return true', function(done){
			client.del('/register/' + appURIEncoded, function(err, req, res, obj) {
				assert.ifError(err);
				assert.ok(obj);
				done();
			});
		});
	});
});



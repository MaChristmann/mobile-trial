var restify = require('restify')
, assert = require('assert')
, async = require('async')
, winston = require('winston');


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

var customer = {
	customerId: "martin.christmann@gmail.com"
};

var appURIEncoded = encodeURIComponent(appObj.identifier);
var customerURIEncoded = encodeURIComponent(customer.customerId);
var authorizeUrl = '/authorize/' + appURIEncoded + '/customer/' + customerURIEncoded; 


describe('authorize', function(){

	beforeEach(function(done){
		client.del('/register/' + appURIEncoded, function(err, req, res, obj) {
			assert.ifError(err);
			assert.ok(obj);
			done();
		});
	});
	
	beforeEach(function(done){
 		client.post('/register', appObj, function(err, req, res, obj) {
			assert.ifError(err);
			assert.ok(typeof obj == 'object');
			assert.equal(obj.identifier, appObj.identifier);
			done();
		});
	})

	describe('#post', function(){
		it('should return true for autorization', function(done){
			winston.profile("Authorization");
			client.post(authorizeUrl, {}, function(err, req, res, obj) {
				winston.profile("Authorization");
				assert.ifError(err);
				assert.ok(obj, "Authorization failed");
				done();
			 });
		});
	});
});








var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var userSv = require('./../service/user');

describe('user.delete', function(){

	var account;
	var userObj;
	var userInstance;
	var err = null;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(){
		console.log("START TEST USER.DELETE");
		mongoose.connect(config.mongodb.test); 

		userObj = {
			account: "user@mobiletrial.org",
			password: "topsecret"
		};
	});

	beforeEach(function(done){
		//Clean users and create an user
		userSv.clean(function(err){
			if(err) throw err;
			userSv.create(userObj, function(err, user){
				if(err) throw err;
				userInstance = user;
				done();
			});
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST USER.DELETE");
		mongoose.disconnect();
	});

	it('should return an error for undefined user parameter', function(done){
		var undefinedParameter; 
		userSv.delete(undefinedParameter, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});	

	it('should return an error for null user parameter', function(done){
		userSv.delete(null, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});	

	it('should delete existing user and return the deleted user obj', function(done){
		userSv.delete(userInstance, function(err, user){
			assert.ifError(err);
			assert.equal(user._id.toString(), userInstance._id.toString());
			done();
		});
	});

});
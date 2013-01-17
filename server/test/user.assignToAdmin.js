var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var userSv = require('./../service/user');

describe('user.assignToAdmin', function(){

	var account;
	var userObj;
	var userInstance;
	var err = null;

	// Connect to Mongo DB
	before(function(){
		console.log("START TEST USER.ASSIGNTOADMIN");
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
		console.log("END TEST USER.ASSIGNTOADMIN");
		mongoose.disconnect();
	});


	it('should return an error for undefined user parameter', function(done){
		var undefinedParameter;
		userSv.assignToAdmin(undefinedParameter, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null user parameter', function(done){
		userSv.assignToAdmin(null, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should assign a existing user to admin role and return user', function(done){
		userSv.assignToAdmin(userInstance, function(err, user){
			assert.ifError(err);
			assert.equal(user._id.toString(), userInstance._id.toString());
			done();
		});
	});
});
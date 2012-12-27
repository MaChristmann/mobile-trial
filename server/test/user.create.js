var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var userSv = require('./../service/user');

describe('user.create', function(){

	var account;
	var password;
	var userObj;
	var err = null;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(){
		console.log("START TEST USER.CREATE");
		mongoose.connect(config.mongodb.test); 

		account = "user@mobiletrial.org";
		password = "topsecret";
	});

	beforeEach(function(done){
		userObj = {
			account: account,
			password: password
		};
		
		//Clean users
		userSv.clean(function(err){
			if(err) throw err;
			done();
		});
	});

	// Disconnect
	after(function(){
		console.log("END TEST USER.CREATE");
		mongoose.disconnect();
	});

	it('should return an error for undefined userObj parameter', function(done){
		var undefinedParameter;
		userSv.create(undefinedParameter, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null userObj parameter', function(done){
		userSv.create(null, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for missing password in userObj parameter', function(done){
		delete userObj['password'];
		userSv.create(userObj, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});

		it('should return an error for missing account in userObj parameter', function(done){
		delete userObj['account'];
		userSv.create(userObj, function(err, user){
			assert.notEqual(err, null);
			done();
		});
	});


	it('should create user from userObj and return the user obj', function(done){
		userSv.create(userObj, function(err, user){
			assert.ifError(err);
			assert.equal(user.account, account);
			assert.notEqual(user.password, password); //Should be encrypted
			done();
		});
	});

});
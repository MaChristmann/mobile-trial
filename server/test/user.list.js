var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var userSv = require('./../service/user');

describe('user.get', function(){

	var userObj, userObj2;
	var err = null;

	// Connect to Mongo DB
	// Clean app database
	// Create a test app
	before(function(){
		console.log("START TEST USER.LIST");
		mongoose.connect(config.mongodb.test); 

		userObj = {
			account: "user@mobiletrial.org",
			password: "topsecret"
		};

		userObj2 = {
			account: "user2@mobiletrial.org",
			password: "topsecret"
		};
	});

	beforeEach(function(done){
		//Clean users and create two users
		userSv.clean(function(err){
			if(err) throw err;
			userSv.create(userObj, function(err, user){
				if(err) throw err;
		
				userSv.create(userObj2, function(err, user2){
					if(err) throw err;
					done();
				});
			});
		});
	});


	// Disconnect
	after(function(){
		console.log("END TEST USER.LIST");
		mongoose.disconnect();
	});

	it('should return an empty array', function(done){
		userSv.clean(function(err){
			assert.ifError(err);
			userSv.list(function(err, users){
				assert.ifError(err);
				assert.equal(Object.prototype.toString.call(users), '[object Array]');
				assert.equal(users.length, 0);
				done();
			});
		})
	});

	it('should return an array of two user obj', function(done){
		userSv.list(function(err, users){
			assert.ifError(err);
			assert.equal(Object.prototype.toString.call(users), '[object Array]');
			assert.equal(users.length, 2);
			done();
		});
	});


});
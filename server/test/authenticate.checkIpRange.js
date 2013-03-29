var assert = require('assert');


var authenticateSv = require('./../service/authenticate');


describe('authenticate.admin', function(){
	var ipRange = {
		v4: [
			"192.168.0.1-10",
			"127.0.0.1",
			"10.0.0.x",
			"80.x.x.x",
			"90.1-10.x.x"
		]
	};

	var ip4string = {
		v4: "127.0.0.1"
	};
	var err = null;
	
	/**
	Errors
	**/ 
	it('should return an error for undefined ip parameter', function(done){
		var undefinedParameter;
		authenticateSv.checkIpRange(undefinedParameter, ipRange, function(err, inRange){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null ip parameter', function(done){
		authenticateSv.checkIpRange(null, ipRange, function(err, inRange){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined range parameter', function(done){
		var anyIp = "127.0.0.1";
		var undefinedParameter;
		authenticateSv.checkIpRange(anyIp, undefinedParameter, function(err, inRange){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null range parameter', function(done){
		var anyIp = "127.0.0.1";
		authenticateSv.checkIpRange(anyIp, null, function(err, inRange){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for an ip which is neither IPv4 nor IPv6', function(done){
		var ip = "notAnIp";
		var anyRange = [];

		authenticateSv.checkIpRange(ip, anyRange, function(err, inRange){
			assert.notEqual(err, null);
			done();
		});
	});

	/**
	IPv4
	**/ 

	it('should allow IPv4 if there is no v4 restriction in range parameter', function(done){
		var anyIPv4 = "127.0.0.1";
		var noRestrictionRange = {};

		authenticateSv.checkIpRange(anyIPv4, noRestrictionRange, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});

	it('should allow IPv4 which is a single entry in v4-range array', function(done){
		var ip = "127.0.0.1"; // equals 127.0.0.1
		authenticateSv.checkIpRange(ip, ipRange, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});

	it('should allow IPv4 which is a range entry in v4-range array', function(done){
		var ip = "192.168.0.5"; // within range of192.168.0.1-10
		authenticateSv.checkIpRange(ip, ipRange, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});


	it('should allow IPv4 which is a wildcard entry in v4-range array', function(done){
		var ip = "10.0.0.202"; // matches 10.0.0.x
		authenticateSv.checkIpRange(ip, ipRange, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});


	it('should allow IPv4 which is a wildcard and range entry in v4-range array', function(done){
		var ip = "90.3.255.255"; // matches 90.1-10.x.x
		authenticateSv.checkIpRange(ip, ipRange, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});

	it('should allow IPv4 which is a single entry in v4-string', function(done){
		var ip = "127.0.0.1"; // equals 127.0.0.1
		authenticateSv.checkIpRange(ip, ip4string, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});

	it('should disallow IPv4 which is not present in v4-range array', function(done){
		var ip = "78.80.201.1";
		authenticateSv.checkIpRange(ip, ipRange, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, false);
			done();
		});
	});

	it('should disallow IPv4 which is not present in v4-string', function(done){
		var ip = "78.80.201.1";
		authenticateSv.checkIpRange(ip, ip4string, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, false);
			done();
		});
	});
});

	/**
	IPv6
	**/ 

	it('should allow IPv6 if there is no v6 restriction in range parameter', function(done){
		var anyIPv6 = "::1";
		var noRestrictionRange = {};

		authenticateSv.checkIpRange(anyIPv6, noRestrictionRange, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});
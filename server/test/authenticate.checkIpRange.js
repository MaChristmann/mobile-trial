var assert = require('assert');


var authenticateSv = require('./../service/authenticate');


describe('authenticate.admin', function(){
	var ip4range = {
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
	

	it('should allow IPv4 which is a single entry in v4-range array', function(done){
		var ip = "127.0.0.1"; // equals 127.0.0.1
		authenticateSv.checkIpRange(ip, ip4range, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});

	it('should allow IPv4 which is a range entry in v4-range array', function(done){
		var ip = "192.168.0.5"; // within range of192.168.0.1-10
		authenticateSv.checkIpRange(ip, ip4range, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});


	it('should allow IPv4 which is a wildcard entry in v4-range array', function(done){
		var ip = "10.0.0.202"; // matches 10.0.0.x
		authenticateSv.checkIpRange(ip, ip4range, function(err, inRange){
			assert.ifError(err);
			assert.equal(inRange, true);
			done();
		});
	});


	it('should allow IPv4 which is a wildcard and range entry in v4-range array', function(done){
		var ip = "90.3.255.255"; // matches 90.1-10.x.x
		authenticateSv.checkIpRange(ip, ip4range, function(err, inRange){
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
		authenticateSv.checkIpRange(ip, ip4range, function(err, inRange){
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

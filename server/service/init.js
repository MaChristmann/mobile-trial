var db = require('../data/db');

exports.admin = function(account, password){
	db.User.count({}, function(err, count){
		if(err) console.log(err);

		if(count == 0){
			var user = new db.User();
			user.account = account;
			user.password = password;

			user.save(function(err){
				if(err) console.log(err);

				var admin = new db.AdminRole();
				admin.user = user;

				admin.save(function(err){
					if(err) console.log(err);
					return;
				});
			});
		}
	});
}; 
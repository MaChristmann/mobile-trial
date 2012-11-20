var fs = require('fs'),
	async = require('async'),
	bcrypt = require('bcrypt');
	mongoose 		= require('mongoose');

var db = require('./data/db');

// Connect to Mongo DB
mongoose.connect('mongodb://localhost/mobile-trial-db'); 

//Start setup from json
setupFromJSON("setup.json");

function setupFromJSON(filename){
	fileExists("./", filename, function(err, filepath){
		var setupFile = require(filepath);

		console.log("Start Setup from setup.json");

		async.series([
			function(callback){
				if(typeof setupFile.user != 'undefined')
					setupUser(setupFile.user, callback);
				else
					callback(null, 0);
			}, 
			function(callback){
				if(typeof setupFile.admin != 'undefined')
					setupAdmin(setupFile.admin, callback);
				else 
					callback(null, 0);
			}, 
			function(callback){
				if(typeof setupFile.app != 'undefined')
					setupApp(setupFile.app, callback);
				else
					callback(null, 0);
			},
			function(callback){
				if(typeof setupFile.developer != 'undefined')
					setupDeveloper(setupFile.developer, callback);
				else 
					callback(null, 0)
			}
		],  
		function(err, result){
			//Remove setup.file
			console.log("Setup finished!");
			mongoose.disconnect();
		});
	});
}


function setupUser(users, callback){
	console.log("Setup Users ...");

	var fnArray = [];
	for(var i=0; i < users.length; i++){
		(function(user){
			fnArray.push(function(cb){
				var newUser = new db.User();
				newUser.account =  user.account;

				//Hash password with bcrypt
				bcrypt.genSalt(10, function(err, salt) {
				  bcrypt.hash(user.password, salt, function(err, hash) {
			     	newUser.password = hash;
			     	newUser.save(function(err){
							if(err) console.log(err);
							cb(null, 0);
						});
				  });
				});
			});
		})(users[i]);
	}

 	async.parallel(fnArray, function(err, result){
		callback(null, 0);
 	});
}

function setupAdmin(admins, callback){
	console.log("Setup Admins ...");

	var fnArray = [];
	for(var i=0; i < admins.length; i++){
		(function(admin){
			fnArray.push(function(cb){
				db.User.findOne({'account': admin.account}, function(err, user){
					if(err) console.log( err);

					if(user == null){
						console.log("Setup Admin: You have to add " + admin.account + "to user! I cannot find him ...");
						cb(new Error(), 0);
						return;
					}
					var newAdmin = new db.AdminRole();
					newAdmin.user = user;

					newAdmin.save(function(err){
						if(err) console.log(err);
						console.log("+ Add Account: " + user.account);
						cb(null, 0);
					});		
				});
			});
		})(admins[i]);
	}
	async.parallel(fnArray, function(err, result){
		callback(null, 0);
 	});
}

function setupApp(apps, callback){
	console.log("Setup App ... ")

	var fnArray = [];
	for(var i=0; i < apps.length; i++){

		(function(app){
			fnArray.push(function(cb){
				var newApp = new db.App();
				newApp.identifier = app.identifier;
				newApp.maxVersionCode = app.maxVersionCode;
				newApp.graceInterval = app.graceInterval;
				newApp.graceRetrys = app.graceRetrys;
				newApp.validTime = app.validTime;
				newApp.licenses = app.licenses;

				newApp.save(function(err){
					if(err) console.log(err);
					console.log("+ Add App: " + app.identifier);
					cb(null, 0);
				});
			});
		})(apps[i]);
	}
	async.parallel(fnArray, function(err, result){
		callback(null, 0);
 	});
}

function setupDeveloper(developers, callback){
	console.log("Setup Developers ... ")

	var fnArray = [];
	for(var i=0; i < developers.length; i++){
		(function(developer){
			fnArray.push(function(cb){
				db.User.findOne({'account': developer.account}, function(err, user){
				if(err) console.log(err);

				if(user == null){
					console.log("Setup Developers: You have to add " + developer.account + "to user! I cannot find him ...");
					cb(new Error(), 0);
					return;
				}

				db.App.findOne({'identifier': developer.app}, function(err, app){
					if(err) console.log(err);

					if(app == null){
						console.log("Setup Developers: You have to add " + developer.app + "to app! I cannot find it ...");
						cb(new Error(), 0);
						return;
					}

					var newDeveloper =  new db.DeveloperRole();
					newDeveloper.user = user;
					newDeveloper.app 	= app;
					newDeveloper.save(function(err){
						if(err) console.log(err);
						console.log("+ Add Account: " + user.account + " and App: " + app.identifier);
						cb(null, 0);
					});
				});
			});

			});
		})(developers[i]);
	}
	async.parallel(fnArray, function(err, result){
		callback(null, 0);
 	});
}

function fileExists(dir, filename, next){
	var filepath = dir + filename;
	fs.readdir(dir, function(err, files){ 
		if(err){
			next(err, null);
			return;
		}
		for(var loop=0; loop < files.length; loop++){
			if(files[loop] == filename){
				next(null, filepath);
				return;
			}
		}
		next(new Error("File at " + filepath + " not found"));
	});
}

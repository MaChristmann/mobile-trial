var fs = require('fs'),
	async = require('async'),
	bcrypt = require('bcrypt');
	mongoose 		= require('mongoose');

//Config file
var config = require('./config.json');

// Connect to Mongo DB
mongoose.connect(config.mongodb.production); 

//Start setup from json
setupFromJSON("setup.json");

function setupFromJSON(filename){
	fileExists("./", filename, function(err, filepath){
		var setupFile = require(filepath);

		console.log("Start Setup from setup.json");

		async.series([
			function(callback){
				//Clean database
				cleanDatabase(callback);
			},
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
			console.log("Setup successfully!");
			//Disconnect from database
			mongoose.disconnect();
			//Remove setup.file
			fs.unlink(filepath, function(err){
				if(err) console.log("Warning: Could't not remove setup file '" + filepath + "'. Please remove it manually!");
			});
		});
	});
}


function cleanDatabase(callback){
	var userSv = require('./service/user');
	var appSv = require('./service/app');

	appSv.clean(function(err){
		if(err){
			callback(err);
			return;
		}

		userSv.clean(function(err){
			if(err){
				callback(err);
				return;
			}
			callback(null, 0);
		});
	});
}

function setupUser(users, callback){
	console.log("Setup Users ...");

	//Use services
	var userSv = require('./service/user');

	var fnArray = [];
	for(var i=0; i < users.length; i++){
		(function(user){
			fnArray.push(function(cb){
				userSv.create(user, function(err, user){
					if(err) {
						cb(err);
						return;
					}
					cb(null, user);
				});
			});
		})(users[i]);
	}

 	async.parallel(fnArray, function(err, result){
 		if(err) throw err;

		callback(null, 0);
 	});
}

function setupAdmin(admins, callback){
	console.log("Setup Admins ...");

	//Use services
	var userSv = require('./service/user');

	var fnArray = [];
	for(var i=0; i < admins.length; i++){
		(function(admin){
			fnArray.push(function(cb){
				userSv.get(admin.account, function(err, user){
					if(err){
						cb(err);
						return;
					}
					if(user == null){
						cb(new Error('No such user: ' + admin.account));
					}
					userSv.assignToAdmin(user, function(err, user){
						if(err){
							cb(err);
							return;
						}
						cb(null, user);
					});
				});
			});
		})(admins[i]);
	}
	async.parallel(fnArray, function(err, result){
		if(err) throw err;

		callback(null, 0);
 	});
}

function setupApp(apps, callback){
	console.log("Setup App ... ")


	//Use services
	var appSv = require('./service/app');

	var fnArray = [];
	for(var i=0; i < apps.length; i++){

		(function(app){
			fnArray.push(function(cb){
				appSv.create(app, function(err, app){
					if(err){
						cb(err);
						return;
					}
					cb(null, app);
				});
			});
		})(apps[i]);
	}
	async.parallel(fnArray, function(err, result){
		if(err) throw err;

		callback(null, 0);
 	});
}

function setupDeveloper(developers, callback){
	console.log("Setup Developers ... ")

	var fnArray = [];
	for(var i=0; i < developers.length; i++){
		(function(developer){
			fnArray.push(function(cb){

				//Use services
				var appSv = require('./service/app');
				var developerSv = require('./service/developer');

				appSv.get(developer.app, function(err, app){
					if(err){
						cb(err);
						return;
					}

					if(app == null){
						cb(new Error('No such app: '+ developer.app));
						return;
					}

					var developerObj = {user: developer.account};
					developerSv.create(app, developerObj, function(err, user){
						if(err){
							cb(err);
							return;
						}
						cb(null, user);
					});

				});
			});
		})(developers[i]);
	}
	async.parallel(fnArray, function(err, result){
		if(err) throw err;

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


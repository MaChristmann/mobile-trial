var userSv = require('./../service/user'),
		developerSv = require('./../service/developer');

exports.middleware = function(req, res, next){
	console.log('developer.middleware');
	var app = res.locals.app;

	if(typeof app == 'undefined' || app == null){
		next();		
		return;
	}

	if(typeof req.params.developer == 'undefined' || req.params.developer == null) {
		next();		
		return;
	} 

	developerSv.get(app, req.params.developer, function(err, developer){
		if(err){
			res.send(500, err);
			return;
		}

		if(developer == null){
			res.send(404, new Error("developer not found"));
			return;
		}

		res.locals.developer = developer;
		next();
	});
}

exports.create = function(req, res, next){
	var app = res.locals.app;
	var developerObj = req.body;

	developerSv.create(app, developerObj, function(err, developer){
		if(err){
			res.send(500, err);
			return;
		}
		res.send(developer);

	});

}

exports.update = function(req, res, next){

}

exports.delete = function(req, res, next){


}



exports.assignToDeveloper	= function(req, res, next){
	var user = res.locals.user;


	var developer = new db.DeveloperRole();
	developer.user = user;
	developer.app = app;

	developer.save(function(err){
		if(err) console.log(err);
		res.send(developer);
	});
};

exports.revokeFromDeveloper = function(req, res, next){
	var user = res.locals.user;
	var app = res.locals.app;

	revokeDeveloperFromApp(user, app, function(){
		res.send(true);
	});
};
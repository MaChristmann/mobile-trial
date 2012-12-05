var userSv = require('./../service/user'),
		developerSv = require('./../service/developer');

/* Get developer as middleware */
exports.middleware = function(req, res, next){
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
			res.send(404, 'Developer not found');
			return;
		}

		res.locals.developer = developer;
		next();
	});
}

exports.create = function(req, res, next){
	var app = res.locals.app;
	var developerObj = JSON.parse(req.body);

	developerSv.create(app, developerObj, function(err, developer){
		if(err){
			res.send(500, err);
			return;
		}
		res.send(developer);
	});
}

exports.update = function(req, res, next){
	var developer = res.locals.developer;
	var developerObj = JSON.parse(req.body);

	if(typeof developerObj.testResult == 'undefined'){
		res.send(500, 'Missing body param testResult');
		return;
	}

	developerSv.setTestResult(developer, developerObj.testResult, function(err, developer){
		if(err){
			res.send(500, err);
			return;
		}
		res.send(developer);
	});
}

exports.delete = function(req, res, next){
	var developer = res.locals.developer;
	developerSv.delete(developer, function(err, developer){
		if(err){
			res.send(500, err);
			return;
		}
		res.send(developer);
	});
}
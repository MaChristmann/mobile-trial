var userSv = require('./../service/user'),
		developerSv = require('./../service/developer');

/* Get developer as middleware */
exports.middleware = function(req, res, next){
	var logger = res.locals.logger;
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
			logger.error('On get developer :' + err);
			res.send(500, err);
			return;
		}

		if(developer == null){
			logger.info('Developer not found');
			res.send(404, 'Not found');
			return;
		}

		res.locals.developer = developer;
		next();
	});
}

exports.list = function(req, res, next){
	var logger = res.locals.logger;
	var app = res.locals.app;

	developerSv.list(app, function(err, developers){
		if(err){
			logger.error('On list developers: ' + err);
			res.send(500, err);
			return;
		}
		res.send(developers);
 	});
}

exports.create = function(req, res, next){
	var logger = res.locals.logger;
	var app = res.locals.app;
	var developerObj = JSON.parse(req.body);

	developerSv.create(app, developerObj, function(err, developer){
		if(err){
			logger.error('On create developer: ' + err);
			res.send(500, err);
			return;
		}
		res.send(developer);
	});
}

exports.update = function(req, res, next){
	var logger = res.locals.logger;
	var developer = res.locals.developer;
	var developerObj = JSON.parse(req.body);

	if(typeof developerObj.testResult == 'undefined'){
		logger.error('Missing body param testResult');
		res.send(500, 'Missing body param testResult');
		return;
	}

	developerSv.setTestResult(developer, developerObj.testResult, function(err, developer){
		if(err){
			logger.error('On setTestResult: ' + err);
			res.send(500, err);
			return;
		}
		res.send(developer);
	});
}

exports.delete = function(req, res, next){
	var logger = res.locals.logger;
	var developer = res.locals.developer;

	developerSv.delete(developer, function(err, developer){
		if(err){
			logger.error('On delete developer: ' + err);
			res.send(500, err);
			return;
		}
		res.send(developer);
	});
}
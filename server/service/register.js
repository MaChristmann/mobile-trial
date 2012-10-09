var db = require('../data/db');

exports.create = function (req, res, next){
	var appObj = JSON.parse(req.body);

	if(appObj){
		var app = new db.App();
		app.identifier = appObj.identifier;
		app.constraints = appObj.constraints;
		app.save(function(err){

		});
	}
	else 
		res.send(true);
}

exports.get = function (req, res, next){

}

exports.getAll = function (req, res, next){
	
}

exports.update = function (req, res, next){
	
}

exports.delete = function (req, res, next){
	
}
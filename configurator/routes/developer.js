var restify = require('restify');

exports.listByApp = function(req, res){
	var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });

	client.get('/app/' + req.params.app + '/developer' , function(err, request, response, developers) {
		var appObj = {identifier: req.params.app};

			if(err){
	      console.log(err);
				res.render('developer_by_app', {err: err.message, developerList: [], app: appObj, userList: []});
				return;
			}

		client.get('/user', function(err, userReq, userRes, users){
			if(err){
	      console.log(err);
				res.render('developer_by_app', {err: err.message, developerList: [], app: appObj, userList: []});
				return;
			}

			for(var i=0; i < developers.length; i++){
				for(var y=0; y < users.length; y++){
					if(users[y].account == developers[i].user.account){
						users.splice(y, 1);
						break;
					}
				}

				var testResultString = testResultToText(developers[i].testResult);
				developers[i].testResult = testResultString;
			}
			
			res.render('developer_by_app', {developerList: developers, app: appObj, userList: users});
		});
	});

};

exports.listByUser = function(req, res){
	var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });

  client.get('/user/' + encodeURIComponent(req.params.user) + '/developer', function(err, request, response, developers){
		if(err){
      console.log(err);
			res.render('developer_by_user', {err: err.message, developerList: []});
			return;
		}
		res.render('developer_by_user', {developerList: developers});
  });
};


exports.create = function(req, res, next){
	var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });
  var developerObj =  {user: req.body.account};

	client.post('/app/' + req.params.app + '/developer' , developerObj, function(err, request, response, developer) {
		if(err){
			res.redirect('/cfg/app/' + req.params.app + '/developer');
			return;
		}

		res.redirect('/cfg/app/' + req.params.app + '/developer');
	});
};

exports.delete = function(req, res, next){
	var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });
	client.del('/app/' + req.params.app + '/developer/' + encodeURIComponent(req.params.developer), function(err, request, response, developer) {
		if(err){
			console.log(err);
			res.redirect('/cfg/app/' + req.params.app + '/developer');
			return;
		}

		res.redirect('/cfg/app/' + req.params.app + '/developer');
	});

};

exports.update = function(req, res, next){
	var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });
  client.put('/app/' + req.params.app + '/developer/' + encodeURIComponent(req.params.developer), {testResult: req.body.testResult}, function(err, request, response, developer){
		if(err){
      console.log(err);
			res.render('developer_by_user', {err: err.message, developerList: []});
			return;
		}
		res.redirect('/cfg/user/' + encodeURIComponent(req.params.developer) + '/developer');
  });
}

function testResultToText(testResult){
	switch(testResult){
		case '0':
			return 'LICENSED';
		case '1':
			return 'NOT_LICENSED'
		case '4':
			return 'SERVER_ERROR'
	}
}
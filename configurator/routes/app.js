var restify = require('restify');

exports.index = function(req, res){
  var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });


	client.get('/app', function(err, request, response, obj) {
		if(err){
      console.log(err);
			res.render('app', {err: err.message, appList: []});
			return;
		}
		res.render('app', {appList: obj});
	});

};


exports.read = function(req, res){
  var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });

  console.log(req.params.app);
  client.get('/app/' + req.params.app, function(err, request, response, obj) {
    if(err){
      console.log(err);
      res.render('app_read', {err: err.message});
      return;
    }
    res.render('app_read', {app: obj});
  });
}

exports.update = function(req, res, next){
  var appObj = {};
  appObj.enabled = req.body.enabled == 'on';
  appObj.maxVersionCode = req.body.maxVersionCode;
  appObj.updateVersionCode = req.body.updateVersionCode;
  appObj.graceInterval = req.body.graceInterval;
  appObj.graceRetrys = req.body.graceRetrys;
  appObj.validTime = req.body.validTime;
  appObj.licenses = [];
  appObj.licenses.push({
    trialtype: 'time',
    value: req.body.licenseValue
  });

  var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });

  client.put('/app/' + req.params.app, appObj, function(err, request, response, obj) {
    console.log(obj);
    if(err){
      console.log(err);
      res.render('app_read', {err: err.message});
      return;
    }
    res.render('app_read', {app: obj});
  });

}

exports.create = function(req, res, next){
  var appObj = {};
  appObj.identifier = req.body.identifier;
  appObj.licenses = [];
  appObj.licenses.push({ trialtype: 'time', value: 30});

  var authString = req.session.user +':'+ req.session.password;
  var encodedAuthString = new Buffer(authString).toString('base64');
  var client = restify.createJsonClient({
    url: req.session.server,
    headers: {
      authorization: 'Basic ' + encodedAuthString
    },
    version: '*'
  });

  client.post('/app', appObj, function(err, request, response, obj) {
    if(err){
      console.log(err);
      res.render('app', {err: err.message, appList: []});
      return;
    }
    res.redirect('/cfg/app/' + appObj.identifier);
  });
}

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

  client.del('/app/' + req.params.app, function(err, request, response, obj) {
    if(err){
      console.log(err);
      res.render('app', {err: err.message, appList: []});
      return;
    }
    res.redirect('/cfg/app');
  });
}


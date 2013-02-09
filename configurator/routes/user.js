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

  client.get('/user', function(err, request, response, obj){
  	if(err){
  		res.render('user', {err: err, userList: []});
  		return;
  	}

  	res.render('user', {userList:obj});
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


  var userObj = {account: req.body.account, password: req.body.password};

  client.post('/user', userObj, function(err, request, response, obj){
    if(err){
      res.render('user', {err: err, userList:[]});
      return;
    }
    res.redirect('/cfg/user');
  });
}


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

  if(req.body.isAdmin != 'on'){
    client.del('/user/'+encodeURIComponent(req.params.user)+'/admin', function(err, request, response, obj){
      if(err){
        res.render('user', {err: err, userList:[]});
        return;
      }
      res.redirect('/cfg/user');
    });   
  }
  else {
    client.put('/user/'+encodeURIComponent(req.params.user)+'/admin', {}, function(err, request, response, obj){
      if(err){
        res.render('user', {err: err, userList:[]});
        return;
      }
      res.redirect('/cfg/user');
    });
  }
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

  client.del('/user/'+encodeURIComponent(req.params.user),  function(err, request, response, obj){
    if(err){
      res.render('user', {err: err, userList:[]});
      return;
    }
    res.redirect('/cfg/user');  
  });
}
var restify = require('restify');

exports.check = function(req, res, next){
  if(typeof req.session.user == 'undefined'
      || typeof req.session.password == 'undefined'
      || typeof req.session.server == 'undefined'
      || typeof req.session.isAdmin == 'undefined'){

    if( typeof req.body == 'undefined'
      || typeof req.body.loginUser == 'undefined'
      || typeof req.body.loginPassword == 'undefined'
      || typeof req.body.loginServer == 'undefined'){
      res.render('login');
      return;
    }

    var authString = req.body.loginUser +':'+ req.body.loginPassword;
    var encodedAuthString = new Buffer(authString).toString('base64');

    var client = restify.createJsonClient({
      url: req.body.loginServer,
      headers: {
        authorization: 'Basic ' + encodedAuthString
      },
      version: '*'
    });

    client.get('/user/' + encodeURIComponent(req.body.loginUser), function(err, request, response, obj) {
      if(err){
      	console.log(err);
        if(err.httpCode == 401) 
        	res.render('login', {err: 'User does not exist'});
        else
         res.render('login', {err: err.message});
        return;
      } 
      if(obj == null){
        res.render('login', {err: 'User does not exist'});
      }
      res.locals.user = req.session.user = req.body.loginUser;
      req.session.password = req.body.loginPassword;
      res.locals.server = req.session.server = req.body.loginServer;
      res.locals.isAdmin = req.session.isAdmin  = obj.adminRole.isAdmin;
      res.redirect('/cfg');
    });
  }
  else{
    res.locals.isAdmin = req.session.isAdmin;
    res.locals.user = req.session.user;
    res.locals.server = req.session.server
    next();
  }
}
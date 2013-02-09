
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var indexRoute = require('./routes/index');
var authenticateRoute = require('./routes/authenticate');
var developerRoute = require('./routes/developer');
var userRoute = require('./routes/user');
var appRoute = require('./routes/app');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', indexRoute.login);
app.all('/cfg*', authenticateRoute.check);
app.get('/cfg*')
app.post('/cfg', function(req, res, next){
  res.render('index');
});
app.get('/cfg', indexRoute.index);
  
//app
app.get('/cfg/app', appRoute.index);
app.post('/cfg/app', appRoute.create);
app.get('/cfg/app/:app', appRoute.read);
app.put('/cfg/app/:app', appRoute.update);
app.delete('/cfg/app/:app', appRoute.delete);

//developer by app
app.get('/cfg/app/:app/developer', developerRoute.listByApp);
app.put('/cfg/app/:app/developer/:developer', developerRoute.update);
app.post('/cfg/app/:app/developer', developerRoute.create);
app.delete('/cfg/app/:app/developer/:developer', developerRoute.delete);

//user
app.get('/cfg/user', userRoute.index);
app.post('/cfg/user', userRoute.create);
app.put('/cfg/user/:user', userRoute.update);
app.delete('/cfg/user/:user', userRoute.delete);

//developer by user
app.get('/cfg/user/:user/developer', developerRoute.listByUser);



// Logout
app.get('/logout', function(req, res) {
    // delete the session variable
    delete req.session.user;
    delete req.session.password;
    delete req.session.server;
    // redirect user to homepage
    res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

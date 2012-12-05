// NPM Modules
var restify 	= require('restify')
, mongoose 		= require('mongoose');

// Config file
var config = require('./config.json'); 

// Mobile-Trial Routes 
var licenseRoute 		= require('./route/license'), 
		appRoute 		 		= require('./route/app'),
		developerRoute	= require('./route/developer'),
		userRoute 			= require('./route/user'),
		authenticateRoute = require('./route/authenticate');

// Create Server
var server = restify.createServer({
  name: config.name
});

// Connect to Mongo DB
mongoose.connect(config.mongodb); 

// Enable Bundles
server.use(restify.bodyParser());
server.use(restify.authorizationParser());

/* Url Parameter */
//Initialize express.js like locals object for url parameter results
server.use(function(req, res, next){
	res.locals = {};
	next();
})

// :app
server.use(appRoute.middleware);

// :user
server.use(userRoute.middleware);

// :developer
server.use(developerRoute.middleware);

/* License Management */
server.post('/authorize/:app/customer/:account', [licenseRoute.authorize]);

/* User Management */ 
server.post('/user',									[authenticateRoute.admin, userRoute.create]);
server.del('/user/:user', 						[authenticateRoute.admin, userRoute.delete]);
server.put('/user/:user/admin', 			[authenticateRoute.admin, userRoute.assignToAdmin]);
server.del('/user/:user/admin', 			[authenticateRoute.admin, userRoute.revokeFromAdmin]); 

/* Developer Management */ 
server.post	('/app/:app/developer',						 [authenticateRoute.admin, 		developerRoute.create]);
server.put	('/app/:app/developer/:developer', [authenticateRoute.developer, developerRoute.update]);
server.del 	('/app/:app/developer/:developer', [authenticateRoute.admin, 		developerRoute.delete]);

/* App  Management */ 
server.post('/app',	 		 [authenticateRoute.admin, appRoute.create]);
server.get ('/app', 		 [authenticateRoute.admin, appRoute.getAll]);
server.get ('/app/:app', [authenticateRoute.admin, appRoute.get]);
server.put ('/app/:app', [authenticateRoute.admin, appRoute.update]);
server.del ('/app/:app', [authenticateRoute.admin, appRoute.delete]);

/* No route found */ 
server.use(function(req, res, next){
	res.send(404, new Error('404'));
});

//Start listen
server.listen(config.port, function(){
	console.log("Server is running on port " + config.port);
});
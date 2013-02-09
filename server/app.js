// NPM Modules
var restify 	= require('restify')
	, mongoose 	= require('mongoose')
	,	fs 				= require('fs');

// Config file
var config = require('./config.json'); 

// Mobile-Trial Routes 
var licenseRoute 		= require('./route/license'), 
		appRoute 		 		= require('./route/app'),
		developerRoute	= require('./route/developer'),
		userRoute 			= require('./route/user'),
		authenticateRoute = require('./route/authenticate');

//Server Options
var serverOptions = {
	name: config.name
};

//Add https options if exist
if(config.https.key && config.https.certificate){
	serverOptions['key'] = fs.readFileSync(config.https.key);
  serverOptions['certificate'] = fs.readFileSync(config.https.certificate);
}

// Create Server
var server = restify.createServer(serverOptions);

// Connect to Mongo DB
mongoose.connect(config.mongodb.production); 

//Sanitize url like //foo/////bar// to /foo/bar
server.pre(restify.pre.sanitizePath());

// Enable Bundles
server.use(restify.bodyParser());
server.use(restify.authorizationParser());


/* Url Parameter */
//Initialize express.js like locals object for url parameter results
server.use(function(req, res, next){
	res.locals = {};
	next();
})

// Logging
server.use(function(req, res, next){
	var logger = require('./service/logger').logger;
	res.locals.logger = logger;
	next();
});

// :app
server.use(appRoute.middleware);

// :user
server.use(userRoute.middleware);

// :developer
server.use(developerRoute.middleware);

/* License Management */
server.post('/authorize/:app/customer/:account', [licenseRoute.authorize]);

/* User Management */ 
server.get('/user', 									[authenticateRoute.admin, userRoute.list]);
server.post('/user',									[authenticateRoute.admin, userRoute.create]);
server.get('/user/:user',							[authenticateRoute.user, 	userRoute.get]);
server.del('/user/:user', 						[authenticateRoute.admin, userRoute.delete]);
server.put('/user/:user/admin', 			[authenticateRoute.admin, userRoute.assignToAdmin]);
server.del('/user/:user/admin', 			[authenticateRoute.admin, userRoute.revokeFromAdmin]); 
// List all developer roles for an user
server.get('/user/:user/developer',		[authenticateRoute.user, userRoute.listDeveloperRoles]);


/* Developer Management */ 
server.get ('/app/:app/developer', 							[authenticateRoute.admin, 		developerRoute.list])
server.post	('/app/:app/developer',						 	[authenticateRoute.admin, 		developerRoute.create]);
server.put	('/app/:app/developer/:developer', 	[authenticateRoute.developer, developerRoute.update]);
server.del 	('/app/:app/developer/:developer', 	[authenticateRoute.admin, 		developerRoute.delete]);

/* App  Management */ 
server.post('/app',	 		 [authenticateRoute.admin, appRoute.create]);
server.get ('/app', 		 [authenticateRoute.admin, appRoute.list]);
server.get ('/app/:app', [authenticateRoute.admin, appRoute.get]);
server.put ('/app/:app', [authenticateRoute.admin, appRoute.update]);
server.del ('/app/:app', [authenticateRoute.admin, appRoute.delete]);

/* No route found */ 
server.on('uncaughtException', function(request, response, route, error){
	response.send(error);
	throw error;
});


//Start listen
server.listen(config.port, function(){
	console.log("Server is running on port " + config.port);
}); 
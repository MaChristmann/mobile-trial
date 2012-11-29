// NPM Modules
var restify 	= require('restify')
, mongoose 		= require('mongoose');

// Config file
var config = require('./config.json'); 

// Mobile-Trail Services
var	registerSv	= require('./service/register')
, licenseSv 		= require('./service/license')
, appSv 				= require('./service/app')
, authenticateSv= require('./service/authenticate')
, userSv				= require('./service/user')
, developerSv 	= require('./service/developer')
, customerSv 		= require('./service/customer');

// Mobile-Trial Routes 
var licenseRoute 		= require('./route/license'), 
		appRoute 		 		= require('./route/app'),
		developerRoute	= require('./route/developer');

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
 	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || "notfound";
 	console.log(ip);

	res.locals = {};
	next();
})

// :app
server.use(appRoute.middleware);

// :user
server.use(userSv.get);

// :developer
server.use(developerRoute.middleware);

/* License Management */
server.post('/authorize/:app/customer/:account', [developerSv.get, customerSv.get, licenseRoute.authorize]);

/* User Management */ 
server.post('/user',					[authenticateSv.admin, userSv.create]);
server.del('/user/:user', 		[authenticateSv.admin, userSv.delete]);
server.put('/user/:user/admin', 			[authenticateSv.admin, userSv.assignToAdmin]);
server.del('/user/:user/admin', 			[authenticateSv.admin, userSv.revokeFromAdmin]); 

/* Developer Management */ 
server.post	('/app/:app/developer',						 [authenticateSv.admin, 		developerRoute.create]);
server.put	('/app/:app/developer/:developer', [authenticateSv.developer, developerRoute.update]);
server.del 	('/app/:app/developer/:developer', [authenticateSv.admin, 		developerRoute.delete]);

/* App  Management */ 
server.post('/app',	 		 [authenticateSv.admin, appRoute.create]);
server.get ('/app', 		 [authenticateSv.admin, appRoute.getAll]);
server.get ('/app/:app', [authenticateSv.admin, appRoute.get]);
server.put ('/app/:app', [authenticateSv.admin, appRoute.update]);
server.del ('/app/:app', [authenticateSv.admin, appRoute.delete]);

/* No route found */ 
server.use(function(req, res, next){
	res.send(404, new Error('404'));
});

//Start listen
server.listen(config.port, function(){
	console.log("Server is running on port " + config.port);
});
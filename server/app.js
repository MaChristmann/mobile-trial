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
 	console.log(req.connection);
 	console.log(ip);

	res.locals = {};
	next();
})

// :app
server.use(appSv.get);
// :user
server.use(userSv.get);

/* License Management */
server.post('/authorize/:app/customer/:account', developerSv.get, customerSv.get, licenseSv.authorize);

/* User Management */ 
server.post('/user',					[authenticateSv.admin, userSv.create]);
server.del('/user/:user', 		[authenticateSv.admin, userSv.delete]);
server.put('/user/:user/developer/:app',	[authenticateSv.admin, userSv.assignToDeveloper]);
server.del('/user/:user/developer/:app',		[authenticateSv.admin, userSv.revokeFromDeveloper]);
server.put('/user/:user/admin', 			[authenticateSv.admin, userSv.assignToAdmin]);
server.del('/user/:user/admin', 			[authenticateSv.admin, userSv.revokeFromAdmin]); 

/* Developer Management */ 
server.put('/app/:app/developer/:account', [authenticateSv.developer, developerSv.update]);

/* App  Management */ 
server.post('/register',	 		[authenticateSv.admin, registerSv.create]);
server.get ('/register', 			[authenticateSv.admin, registerSv.getAll]);
server.get ('/register/:app', [authenticateSv.admin, registerSv.get]);
server.put ('/register/:app', [authenticateSv.admin, registerSv.update]);
server.del ('/register/:app', [authenticateSv.admin, registerSv.delete]);

/* No route found */ 
server.use(function(req, res, next){
	res.send(404, new Error('404'));
});

//Start listen
server.listen(config.port, function(){
	console.log("Server is running on port " + config.port);
});
	// NPM Modules
var restify 	= require('restify')
, mongoose 		= require('mongoose');

// Mobile-Trail Services
var	registerSv	= require('./service/register')
, licenseSv 		= require('./service/license')
, appSv 				= require('./service/app')
, authenticateSv= require('./service/authenticate')
, userSv				= require('./service/user');

// Create Server
var server = restify.createServer({
  name: 'mobile-trial'
});

var port = 3000;

// Connect to Mongo DB
mongoose.connect('mongodb://localhost/mobile-trial-db'); 

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
server.use(appSv.get);
// :user
server.use(userSv.get);

/* User Management */ 
server.post('/user',					[authenticateSv.admin, userSv.create]);
server.del('/user/:user', 		[authenticateSv.admin, userSv.delete]);
server.put('/user/:user/developer/:app',	[authenticateSv.admin, userSv.assignToDeveloper]);
server.del('/user/:user/developer/:app',		[authenticateSv.admin, userSv.revokeFromDeveloper]);
server.put('/user/:user/admin', 			[authenticateSv.admin, userSv.assignToAdmin]);
server.del('/user/:user/admin', 			[authenticateSv.admin, userSv.revokeFromAdmin]); 

/* App  Management */ 
server.post('/register',	 		[authenticateSv.admin, registerSv.create]);
server.get ('/register', 			[authenticateSv.admin, registerSv.getAll]);
server.get ('/register/:app', [authenticateSv.admin, registerSv.get]);
server.put ('/register/:app', [authenticateSv.admin, registerSv.update]);
server.del ('/register/:app', [authenticateSv.admin, registerSv.delete]);

/* License Management */
server.post('/authorize/:app/customer/:customer', licenseSv.authorize);

/* No route found */ 
server.use(function(req, res, next){
	res.send(404, new Error('404'));
});

//Start listen
server.listen(port, function(){
	console.log("Server is running on port " + port);
});




	// NPM Modules
var restify 	= require('restify')
, mongoose 		= require('mongoose');

// Mobile-Trail Services
var	registerSv	= require('./service/register')
, licenseSv 		= require('./service/license')
, appSv 				= require('./service/app')
, authenticateSv= require('./service/authenticate'); 

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

// Get :app url parameter
server.use(appSv.get);

server.post('/register',	 		[authenticateSv.admin, registerSv.create]);
server.get ('/register', 			[authenticateSv.admin, registerSv.getAll]);
server.get ('/register/:app', [authenticateSv.admin, registerSv.get]);
server.put ('/register/:app', [authenticateSv.admin, registerSv.update]);
server.del ('/register/:app', [authenticateSv.admin, registerSv.delete]);

server.post('/authorize/:app/customer/:customer', licenseSv.authorize);

server.use(function(req, res, next){
	res.send(404, new Error('404 '));
});

//Start listen
server.listen(port, function(){
	console.log("listen on port " + port);
});




// NPM Modules
var restify 	= require('restify')
, mongoose 		= require('mongoose');

// Mobile-Trail Services
var	registerSv	= require('./service/register')
, customerSv = require('./service/authorize');

// Create Server
var server = restify.createServer({
  name: 'mobile-trial'
});

// Connect to Mongo DB
mongoose.connect('mongodb://localhost/mobile-trial-db'); 

// Enable Bundles
server.use(restify.bodyParser());

// Authorize user
server.use(function authorization(req, res, next){
	next();
});

server.post('/register',	 		registerSv.create);
server.get ('/register', 			registerSv.getAll);
server.get ('/register/:app', registerSv.get);
server.put ('/register/:app', registerSv.update);
server.del ('/register/:app', registerSv.delete);

server.post('/authorize/:app/customer/:customer', customerSv.authorize);

//Start listen
server.listen(3000, function(){
	console.log("listen on port 3000");
});



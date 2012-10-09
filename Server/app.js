// NPM Modules
var restify 	= require('restify')
, mongoose 		= require('mongoose');

// Mobile-Trail Services
var	registerSv	= require('./service/register');

// Create Server
var server = restify.createServer({
  name: 'mobile-trial'
});

// Connect to Mongo DB
mongoose.connect('mongodb://localhost/mobile-trial-db'); 

// Enable Bundles
server.use(restify.queryParser({ mapParams: false }));
server.use(restify.bodyParser());

server.use(function authorization(req, res, next){
	next();
});

server.post('/register', registerSv.create);
server.get('/register', registerSv.getAll);
server.get('/register/:app', registerSv.get);
server.put('/register/:app', registerSv.update);
server.del('/register/:app', registerSv.delete);

//Start listen
server.listen(3000, function(){
	console.log("listen on port 3000");
});



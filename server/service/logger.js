var winston	= require('winston');

var config = require('./../config.json');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: './log/server.log', json: false })
  ],
  exceptionHandlers: [
  	// new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: './log/exceptions.log', json: false })
  ],
  exitOnError: false
});

exports.logger = logger;
// const express = require('express');
// const app = express();
// const server = require('http').createServer(app);
// const io = require('./startup/socket').initialize(server);

var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3900);
// var io = require('./startup/socket').listen(server);
const io = require('./startup/socket').initialize(server);

require('./startup/db')();
require('./startup/routes')(app);
require('./startup/queueChecker')(io);

// const port = process.env.PORT || 3900;

// server.listen(port, () => {
// 	console.log(`Listening on port: ${port}`);
// });

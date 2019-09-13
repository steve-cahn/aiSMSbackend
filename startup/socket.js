const socket = require('socket.io');
let io = null;

// Make io public so can access io from other files.
// This enables node to emit an event.
module.exports.io = function() {
	return io;
};

// Get the server variable from index.js
module.exports.initialize = function(server) {
	io = socket(server);

	io.on('connection', function(client) {
		io.emit('connected');
		console.log('Client connected...');

		require('../routes/socket/join').join(io, client);
		require('../routes/socket/smsText').getMessage(io, client);
	});

	return io;
};

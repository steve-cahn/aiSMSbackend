const { User, validate } = require('../../models/user');

module.exports.join = (socket, client) => {
	// Client will send a number on connection
	client.on('join', data => {
		client.join(data.number);
	});
};

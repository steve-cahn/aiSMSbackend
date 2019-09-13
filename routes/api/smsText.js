const express = require('express');
const router = express.Router();
const { SmsText } = require('../../models/smsText');
const io = require('../../startup/socket').io;

/**
 * Get's all the text messages for a user ID
 */
router.get('/:id', async (req, res) => {
	const smsText = await SmsText.find({ userId: req.params.id })
		.select('-__v')
		.sort({ dateAdded: 'asc' });

	res.send(smsText);
});

/**
 * When a user texts back, twilio will post to this route api/sms/user/newMessage
 * This route will then emmit a socket event, 'messageToClient', to the client,
 * The client will then show it to the user, and the user will then send a
 * socket event back to the server and handle it just like any other text message
 */
router.post('/user/newMessage', (req, res) => {
	const { Body: message, From: number } = req.body;

	messageData = {
		message,
		number,
		didUserSend: true,
		autoResponseQueue: false
	};

	io()
		.in(number)
		.emit('messageToClient', messageData);

	res.send(messageData);
});

module.exports = router;

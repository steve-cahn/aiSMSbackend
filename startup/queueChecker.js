const { SmsText } = require('../models/smsText');
const { User } = require('../models/user');
const moment = require('moment');

module.exports = io => {
	// Run the follow up message function every 5 seconds
	setInterval(() => {
		autoFollowUp();
	}, 5000);

	const autoFollowUp = async () => {
		// Get all messages which need to autorespond
		const queuedMessages = await SmsText.find({
			autoResponseQueue: true
		}).select('-__v');

		// Loop through all the messages which need to auto respond
		queuedMessages.forEach(async currentMessageObj => {
			// Get the message date
			const currentMessageDate = moment(currentMessageObj.dateAdded);

			// Check if x amount of time passed. If not, then don't proceed to
			// send the follow up message
			if (currentMessageDate.add(10, 'seconds') - moment() > 0) return;

			let user = await User.findById(currentMessageObj.userId).select(
				'-__v'
			);

			let newMessage = '';

			// Make auto reply message unique based on the number of times the user got an automated response
			switch (user.autoResponseCount) {
				case 0:
					newMessage = `Hey, not sure if you received my previous message... Just following up: ${currentMessageObj.message}`;
					break;
				case 1:
					// Remove the intro for the first message
					const currentMessage = currentMessageObj.message.replace(
						'Hey, not sure if you received my previous message... Just following up: ',
						''
					);
					newMessage = `Are you getting my messages? ${currentMessage}`;
					break;
				default:
					break;
			}

			// Remove previous message from Queue
			currentMessageObj.autoResponseQueue = false;
			await currentMessageObj.save();

			if (newMessage.length === 0) return;

			let followUpMessage = new SmsText({
				userId: currentMessageObj.userId,
				message: newMessage,
				didUserSend: false,
				autoResponseQueue: true
			});

			// Increment autoResponseCount by 1
			user.autoResponseCount++;

			await user.save();

			// Send a 'messageToClient' socket event to the client
			io.in(user.number).emit('messageToClient', followUpMessage);
		});
	};
};

const { SmsText, validate } = require('../../models/smsText');
const { User } = require('../../models/user');
const config = require('config');
const twilio = require('twilio');
var client = new twilio(
	config.get('twilio.accountSid'),
	config.get('twilio.authToken')
);
let { PythonShell } = require('python-shell');
const io = require('../../startup/socket').io;

const options = {
	pythonOptions: ['-u'],
	pythonPath: 'python3'
};

// Run the python file to handle responses to the text messages
let pyshell = new PythonShell('./python_2/model.py', options);

module.exports.getMessage = (io, socket) => {
	socket.on('messageToServer', async function(data) {
		await saveTextToDB(data);

		// If the user sent the text, then send an automatic response
		if (data.didUserSend) {
			// Restart the auto response count because the user responded
			await User.findByIdAndUpdate(data.userId, { autoResponseCount: 0 });

			// Only call sendDataToPython if the user sent a text
			sendDataToPython(data);
		}
	});
};
// Get the python response. i.e. 'print()'
pyshell.on('message', async data => {
	// Convert object which is in string format to an object
	data = JSON.parse(data);

	const user = await User.findById(data.userId).select(
		'number autoResponseCount contextMessage'
	);

	const messageData = {
		userId: data.userId,
		message: data.message,
		didUserSend: false,
		autoResponseQueue: true
	};

	// Send the message to the client
	io()
		.in(user.number)
		.emit('messageToClient', messageData);

	// Reset the auto response count because just sent a new auto response message
	user.autoResponseCount = 0;
	user.contextMessage = data.contextMessage || '';

	await user.save();
});

const sendDataToPython = async data => {
	// Get user by id
	const user = await User.findById(data.userId).select('contextMessage');

	// Send info to python
	// The python file is expecting 3 inputs:
	// 1: Text message the user sent
	pyshell.send(data.message);
	// 2: User ID so that we can pass it back to node when python spits back the text response
	pyshell.send(data.userId);
	// 3: Context Message, if there is.
	// (For more info as to what contextMessage is, go to ../../models/user)
	pyshell.send(user.contextMessage || '');
};

const saveTextToDB = async messageData => {
	// Remove the id and _v for validation
	delete messageData._id;
	delete messageData.__v;

	if (messageData.number && !messageData.userId) {
		let user = await User.findOne({ number: messageData.number }).select(
			'_id'
		);
		messageData.userId = String(user._id);
		// Remove the number because we need to validate 'messageData'
		delete messageData.number;
	}

	const { error } = validate(messageData);
	if (error) return console.error(error);

	// Get the last message
	const [previousText] = await SmsText.find({})
		.sort({ $natural: -1 })
		.limit(1);

	// Remove the last text from the autoResponseQueue if it has been added to the queue
	if (previousText && previousText.autoResponseQueue === true) {
		previousText.autoResponseQueue = false;
		await previousText.save();
	}

	// Text the message to the users number if node sent the message
	if (!messageData.didUserSend) {
		try {
			await sendSmsMessage(messageData);
		} catch (error) {
			console.log(error);
		}
	}

	// Save the new incoming text
	let userSmsText = new SmsText(messageData);
	userSmsText = await userSmsText.save();
};

/**
 * Sends a text message to users phone
 * @param {Object} messageData Object containing message and userId
 */
const sendSmsMessage = async messageData => {
	let user = await User.findById(messageData.userId).select('number');

	await client.messages.create({
		body: messageData.message,
		from: '+13235913314',
		to: user.number
	});
};

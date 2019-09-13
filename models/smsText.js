const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const SmsText = mongoose.model(
	'SmsText',
	new mongoose.Schema({
		// Reference to the user ID of a user.
		// This lets us retreive all the text messages
		// of a user based on a user ID
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		dateAdded: {
			type: Date,
			default: Date.now
		},
		message: {
			type: String,
			required: true
		},
		// Checks if the user sent the message. This enables us to:
		// - Position the text message on the left or right of the chatbox
		// - Tells node to autorespond to the message
		didUserSend: {
			type: Boolean,
			required: true
		},
		// Adds the text message to an auto response queue so that
		// node can follow up with user.
		// Can't use 'didUserSend' to perform this for the following reasons:
		// - The follow up text will only follow up on the last text node sent
		// - Node needs a way to stop following up. (We don't want to follow up 100 times...)
		autoResponseQueue: {
			type: Boolean,
			required: true
		}
	})
);

function validateSmsText(smsText) {
	const schema = {
		userId: Joi.objectId().required(),
		dateAdded: Joi.date(),
		message: Joi.string().required(),
		didUserSend: Joi.boolean().required(),
		autoResponseQueue: Joi.boolean().required()
	};

	return Joi.validate(smsText, schema);
}

exports.SmsText = SmsText;
exports.validate = validateSmsText;

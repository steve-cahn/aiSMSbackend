const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const User = mongoose.model(
	'User',
	new mongoose.Schema({
		// Currently not using users name
		name: {
			type: String,
			required: false
		},
		number: {
			type: String,
			required: true
		},
		// Set the context of the last message sent
		// We need this for the following reason:
		// - If the user responds to a message that is only relevent
		// to the message sent to the user, we need a way to track the context
		// of what the current conversation is about.
		// Example: If a user says :"I need help", and the chat responds with: "What do you need help with".
		// The user can then respond with anxiety, and the chat will then proceed to help with that.
		// But, if the user didn't previously text, "I need help", and starts off a conversation with "Anxiety",
		// the response will be different.
		contextMessage: {
			type: String,
			required: false
		},
		// Keep track of the amount of auto responses node sent to the user so that we don't
		// send over an overwhelming amount of responses
		autoResponseCount: {
			type: Number,
			required: false,
			default: 0
		}
	})
);

const validateUser = user => {
	const schema = {
		name: Joi.string(),
		number: Joi.string().required(),
		contextMessage: Joi.string(),
		autoResponseCount: Joi.number()
	};

	return Joi.validate(user, schema);
};

exports.User = User;
exports.validate = validateUser;

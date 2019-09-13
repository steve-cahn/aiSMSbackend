const express = require('express');
const router = express.Router();
const { User, validate } = require('../../models/user');

/**
 * This route will get the number from the user/client
 * If the number does not exist, it will create a new number/user in the database
 */
router.post('/', async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	// This will format the number to '+12345678901' so that all numbers are identical
	// and so that it is a valid twilio format
	const number = numberFormatter(req.body.number);

	// Get the user with the number passed in
	let user = await User.findOne({ number }).select('-__v');

	// If there are results, that means that the user exists.
	// Exit while sending over the user info
	if (user) return res.send(user);

	// If the program got to this place, that means the user
	// does not exist. Create and save the user in the database,
	// then send it over to the client.
	user = new User({
		name: req.body.name,
		number
	});

	user = await user.save();
	res.send(user);
});

/**
 * This will take the following number formats:
 * 222 888 3333
 * (222) 888 3333
 * 12228883333
 * 1 222 888 3333
 * 1 (222) 888 3333
 * 2228883333
 * +1 222 888 3333
 *
 * and convert it to
 * +12345678901
 *
 * @param {String} number Phone Number
 */
const numberFormatter = number => {
	// Remove all characters. (Everything besides for numbers)
	number = number.replace(/[^\d+]+/g, '');

	// If there is 00 at the beginning of the string, add a plus (+) in front of it
	number = number.replace(/^00/, '+');
	if (number.match(/^1/)) number = '+' + number;

	// Add a '1' before the plus (+), if the plus is at the beginning of the string
	if (!number.match(/^\+/)) number = '+1' + number;
	return number;
};

module.exports = router;

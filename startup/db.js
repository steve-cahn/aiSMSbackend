const mongoose = require('mongoose');
const config = require('config');

module.exports = async () => {
	// Configure mongoose settings
	const mongooseOptions = {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	};

	const DBpath = config.get('db.path');

	try {
		await mongoose.connect(DBpath, mongooseOptions);
		console.log(`DB Connected to ${DBpath}`);
	} catch (error) {
		console.error(`Could not connect to the database`, error);
	}
};

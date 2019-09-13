const express = require('express');
const config = require('config');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const smsText = require('../routes/api/smsText');
const user = require('../routes/api/user');

const bodyParser = require('body-parser');

module.exports = app => {
	app.use(
		cors({
			origin: config.get('proxy-url'),
			credentials: true
		})
	);
	app.use(helmet());
	app.use(compression());

	app.use(express.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	app.use('/api/sms', smsText);
	app.use('/api/user', user);
};

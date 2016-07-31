'use strict';
const config = require('../config');
const Mongoose = require('mongoose').connect(config.dbURI);

Mongoose.connection.on('error', error => {
    console.log("Mongoose Error: ", error);
});

module.exports = {
    Mongoose
}
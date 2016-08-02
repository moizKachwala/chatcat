'use strict';

require('./auth')();

module.exports = {
    router: require('./routes')(),
    session: require('./session')
} 
'use strict'

const logger = require('winston')
const config = require('config')

logger.remove(logger.transports.Console)

logger.add(logger.transports.Console, config.get('logger.settings'))

module.exports = logger

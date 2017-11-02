'use strict'

module.exports = {
  debug: false,

  site: {
    port: 3000
  },

  db: {
    uri: 'mongodb://localhost/ucr-course',
    options: {
      useMongoClient: true
    }
  },

  catalog: {
    terms: [201810]
  },

  logger: {
    settings: {
      level: 'debug',
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: true
    }
  }
}

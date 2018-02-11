'use strict'

const path = require('path')

module.exports = {
  debug: false,

  site: {
    port: 3000,
    pagesDir: path.resolve(__dirname, '../pages')
  },

  db: {
    uri: 'mongodb://localhost/ucr-course',
    options: {
      useMongoClient: true
    }
  },

  query: {
    courseLimit: 120,  // Max number of courses displayed
    facultyLimit: 100 // Max number of faculty displayed
  },

  catalog: {
    terms: [201810, 201820]
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

'use strict'

const express = require('express')
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const config = require('config')
const logger = require('./lib/logger')
const errorHandlers = require('./lib/errorHandlers')

require('./lib/extendExpress').extendResponse(express.response)
const apiRoute = require('./routes/api')

const app = express()
app.use('/api', apiRoute)
app.use(express.static('public'))

app.use(errorHandlers.ErrorHandler)

async function main () {
  await mongoose.connect(config.get('db.uri'), config.get('db.options'))
  logger.debug('Connected to database.')

  const port = process.env.PORT || config.get('site.port')
  app.listen(port, () => {
    logger.debug(`Listening on port #${port}`)
  })
}

main()

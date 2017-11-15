'use strict'

const mongoose = require('mongoose')
const {Schema} = mongoose

const subscriptionSchema = new Schema({
  name: String,
  email: { index: true, type: String },
  enabled: { index: true, type: Boolean },
  courseReferenceNumber: { index: true, type: String },
  waitlistNotification: { type: Boolean, default: false }
})

module.exports = mongoose.model('Subscription', subscriptionSchema)

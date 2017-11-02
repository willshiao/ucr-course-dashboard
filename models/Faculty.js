'use strict'

const mongoose = require('mongoose')
const {Schema} = mongoose

const facultySchema = new Schema({
  bannerId: { type: String, index: true },
  category: Schema.Types.Mixed,
  class: String,
  courseReferenceNumber: { type: String, index: true },
  displayName: String,
  emailAddress: String,
  primaryIndicator: Boolean,
  term: { type: String, index: true }
})

module.exports = mongoose.model('Faculty', facultySchema)
